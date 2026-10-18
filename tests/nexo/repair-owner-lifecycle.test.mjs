import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";
import { prepareRepairAgainstPersistedState } from "../../scripts/nexo-repair-preparation.mjs";
import { dispatchPreparedRepair } from "../../scripts/nexo-repair-dispatch.mjs";
import { settlePreparedRepairFromPersistedState } from "../../scripts/nexo-repair-settlement.mjs";
import { verifyRepairMissionGoalFromPersistedState } from "../../scripts/nexo-repair-mission-verification.mjs";
import { loadStateStrict } from "../../scripts/simulate.mjs";

function legacyMemory() {
  return {
    version: 4,
    runs: [],
    lessons: [],
    patterns: [],
    nexo: {
      missions: [{
        missionId: "mission-owner-lifecycle",
        status: "planned",
        objective: "normalize persisted agent state",
        steps: [{
          id: "step-repair",
          action: "repair_agent_state",
          target: "alex",
          status: "planned",
          dependsOn: []
        }]
      }],
      attempts: [],
      doNotRepeat: [],
      executions: [],
      effectJournal: []
    }
  };
}

function environment(stateRevision, position = { x: "invalid", z: 2 }) {
  return {
    version: 5,
    stateRevision,
    savedAt: 1,
    day: 1,
    hour: 8,
    world: { day: 1, timeOfDay: 8, bounds: { minX: 0, maxX: 100, minZ: 0, maxZ: 100 }, resources: {} },
    agents: [{
      id: "alex",
      alive: true,
      position,
      needs: { hunger: 50, thirst: 50, energy: 50, social: 50, safety: 50, health: 100 }
    }],
    events: []
  };
}

const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-owner-lifecycle-"));
try {
  const nexoPath = path.join(root, "nexo-continuity.json");
  const statePath = path.join(root, "world-state.json");
  const opened = await openNexoContinuityOwner({ filePath: nexoPath, legacyMemory: legacyMemory() });
  await fs.writeFile(statePath, JSON.stringify(environment(10)), "utf8");

  // Phase 1: bind PREPARED to the strict persisted environment revision and
  // durably commit it before the repair adapter can be called.
  const prepared = await prepareRepairAgainstPersistedState({
    owner: opened.owner,
    statePath,
    expectedContinuityRevision: 0,
    operation: {
      idempotencyKey: "mission-owner-lifecycle:step-repair",
      missionId: "mission-owner-lifecycle",
      stepId: "step-repair",
      action: "repair_agent_state",
      target: "alex"
    }
  });
  assert.equal(prepared.status, "committed");
  assert.equal(prepared.preparedCommitted, true);
  assert.equal(prepared.environmentStateRevision, 10);
  const afterPrepare = await opened.owner.loadCurrent();
  assert.equal(afterPrepare.storeRevision, 1);
  assert.equal(afterPrepare.snapshot.effectJournal[0].status, "prepared");

  // Phase 2: dispatch is allowed only from the durable PREPARED record and
  // conditionally persists against the exact environment revision.
  const dispatched = await dispatchPreparedRepair({
    owner: opened.owner,
    statePath,
    idempotencyKey: "mission-owner-lifecycle:step-repair",
    savedAt: 2
  });
  assert.equal(dispatched.status, "completed");
  assert.equal(dispatched.persisted, true);
  assert.equal(dispatched.previousEnvironmentStateRevision, 10);
  assert.equal(dispatched.environmentStateRevision, 11);

  const persisted = await loadStateStrict(statePath);
  assert.equal(persisted.stateRevision, 11);
  assert.equal(Number.isFinite(Number(persisted.agents[0].position.x)), true);

  // Phase 3: settlement records observed persisted state, not causality or
  // mission completion. It is a separate Nexo-store commit.
  const settled = await settlePreparedRepairFromPersistedState({
    store: opened.store,
    statePath,
    idempotencyKey: "mission-owner-lifecycle:step-repair",
    expectedContinuityRevision: 1
  });
  assert.equal(settled.status, "settled_observed");
  assert.equal(settled.verified, true);
  assert.equal(settled.causalAttribution, "not_claimed");
  const afterSettlement = await opened.owner.loadCurrent();
  assert.equal(afterSettlement.storeRevision, 2);
  assert.equal(afterSettlement.snapshot.effectJournal[0].status, "settled_observed");

  // Replay after settlement must fail closed before the repair adapter runs.
  // The journal is terminal for dispatch even though settlement makes no causal claim.
  const replay = await dispatchPreparedRepair({
    owner: opened.owner,
    statePath,
    idempotencyKey: "mission-owner-lifecycle:step-repair",
    savedAt: 3
  });
  assert.equal(replay.status, "blocked");
  assert.equal(replay.code, "NEXO_PREPARED_JOURNAL_ENTRY_UNKNOWN");
  assert.equal(replay.persisted, false);
  assert.equal((await loadStateStrict(statePath)).stateRevision, 11,
    "settled repair replay must not write the environment again");
  assert.equal((await opened.owner.loadCurrent()).storeRevision, 2,
    "blocked replay must not mutate Nexo continuity");

  // Phase 4: goal verification remains a read-only observation. It must not
  // promote the mission to completed or claim causal attribution.
  const goal = await verifyRepairMissionGoalFromPersistedState({
    store: opened.store,
    statePath,
    missionId: "mission-owner-lifecycle"
  });
  assert.equal(goal.status, "goal_observed");
  assert.equal(goal.verified, true);
  assert.equal(goal.missionCompleted, false);
  assert.equal(goal.causalAttribution, "not_claimed");
  assert.equal((await opened.owner.loadCurrent()).storeRevision, 2,
    "read-only goal verification must not mutate Nexo continuity");

  // Physical separation: Lúmina's world-state file must not embed Nexo memory.
  const rawWorldState = JSON.parse(await fs.readFile(statePath, "utf8"));
  assert.equal("nexoMemory" in rawWorldState, false);
} finally {
  await fs.rm(root, { recursive: true, force: true });
}

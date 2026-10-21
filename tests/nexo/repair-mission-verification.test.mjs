import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";
import { runNexoRepairSession } from "../../scripts/nexo-repair-session.mjs";
import { prepareRepairAgainstPersistedState } from "../../scripts/nexo-repair-preparation.mjs";
import { verifyRepairMissionGoalFromPersistedState } from "../../scripts/nexo-repair-mission-verification.mjs";

function legacyMemory() {
  return {
    version: 4,
    runs: [],
    lessons: [],
    patterns: [],
    nexo: {
      missions: [{
        missionId: "mission-verification",
        status: "planned",
        objective: "observe persisted repair goal",
        steps: [{
          id: "step-verification",
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
    world: {
      day: 1,
      timeOfDay: 8,
      bounds: { minX: 0, maxX: 100, minZ: 0, maxZ: 100 },
      resources: {}
    },
    agents: [{
      id: "alex",
      alive: true,
      position,
      needs: { hunger: 50, thirst: 50, energy: 50, social: 50, safety: 50, health: 100 }
    }],
    events: []
  };
}

const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-repair-goal-verification-"));
try {
  const continuityPath = path.join(root, "nexo-continuity.json");
  const statePath = path.join(root, "world-state.json");
  const opened = await openNexoContinuityOwner({
    filePath: continuityPath,
    legacyMemory: legacyMemory()
  });
  await fs.writeFile(statePath, JSON.stringify(environment(100)), "utf8");

  // Isolated protocol test only: Option A blocks this repair through the
  // product-runtime integration; this lower-level test exercises settlement.
  const settled = await runNexoRepairSession({
    owner: opened.owner,
    store: opened.store,
    statePath,
    missionId: "mission-verification",
    stepId: "step-verification"
  });
  assert.equal(settled.status, "settled_observed");
  assert.equal(settled.missionCompleted, false);

  const observed = await verifyRepairMissionGoalFromPersistedState({
    store: opened.store,
    statePath,
    missionId: "mission-verification"
  });
  assert.equal(observed.status, "goal_observed");
  assert.equal(observed.verified, true);
  assert.equal(observed.missionCompleted, false);
  assert.equal(observed.causalAttribution, "not_claimed");
  assert.equal(observed.stepObservations.length, 1);

  // The verifier is read-only: reopening the owner sees the same revision.
  const beforeReplay = await opened.owner.loadCurrent();
  const reopened = await openNexoContinuityOwner({
    filePath: continuityPath,
    legacyMemory: null
  });
  const replayed = await verifyRepairMissionGoalFromPersistedState({
    store: reopened.store,
    statePath,
    missionId: "mission-verification"
  });
  const afterReplay = await reopened.owner.loadCurrent();
  assert.equal(replayed.status, "goal_observed");
  assert.equal(afterReplay.storeRevision, beforeReplay.storeRevision);

  // A continuity change between the initial journal read and final positive
  // result makes this cross-store observation UNKNOWN rather than stale PASS.
  let continuityReads = 0;
  const changingStore = {
    async loadCurrent() {
      const current = await reopened.store.loadCurrent();
      continuityReads += 1;
      return continuityReads === 1
        ? current
        : { ...current, storeRevision: current.storeRevision + 1 };
    }
  };
  const changedDuringVerification = await verifyRepairMissionGoalFromPersistedState({
    store: changingStore,
    statePath,
    missionId: "mission-verification"
  });
  assert.equal(changedDuringVerification.status, "unknown");
  assert.equal(changedDuringVerification.code, "NEXO_CONTINUITY_CHANGED_DURING_MISSION_VERIFICATION");
  assert.equal(changedDuringVerification.verified, false);
  assert.equal(continuityReads, 2);

  // Goal observation is deliberately not a durable mission completion. The
  // canonical reconstruction keeps the settled step blocked against redispatch.
  const reconstructed = await reopened.owner.reconstructMission("mission-verification");
  assert.equal(reconstructed.status, "reconstructed");
  assert.equal(reconstructed.mission.status, "blocked");
  assert.equal(reconstructed.mission.objective, "verify_observed_repair_goal");
  assert.equal(reconstructed.mission.steps[0].status, "blocked");
  assert.equal(
    reconstructed.mission.steps[0].blockReason.code,
    "NEXO_REPAIR_SETTLED_BY_OBSERVATION"
  );

  // A later environment revision with the invariant absent invalidates the
  // present-goal observation; old settlement is not treated as permanent truth.
  const changed = environment(102);
  await fs.writeFile(statePath, JSON.stringify(changed), "utf8");
  const absent = await verifyRepairMissionGoalFromPersistedState({
    store: reopened.store,
    statePath,
    missionId: "mission-verification"
  });
  assert.equal(absent.status, "blocked");
  assert.equal(absent.code, "NEXO_REPAIR_MISSION_GOAL_INVARIANT_NOT_PRESENT");
  assert.equal(absent.verified, false);
  assert.equal(absent.missionCompleted, undefined);

  // A PREPARED obligation is unresolved even if no execution result was written.
  const preparedRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-repair-goal-prepared-"));
  try {
    const preparedPath = path.join(preparedRoot, "nexo-continuity.json");
    const preparedStatePath = path.join(preparedRoot, "world-state.json");
    const pending = await openNexoContinuityOwner({
      filePath: preparedPath,
      legacyMemory: legacyMemory()
    });
    await fs.writeFile(preparedStatePath, JSON.stringify(environment(200)), "utf8");
    const preparation = await prepareRepairAgainstPersistedState({
      owner: pending.owner,
      statePath: preparedStatePath,
      expectedContinuityRevision: 0,
      operation: {
        idempotencyKey: "mission-verification:step-verification",
        missionId: "mission-verification",
        stepId: "step-verification",
        action: "repair_agent_state",
        target: "alex"
      }
    });
    assert.equal(preparation.status, "committed");
    const blocked = await verifyRepairMissionGoalFromPersistedState({
      store: pending.store,
      statePath: preparedStatePath,
      missionId: "mission-verification"
    });
    assert.equal(blocked.status, "blocked");
    assert.equal(blocked.code, "NEXO_EFFECT_RECONCILIATION_REQUIRED");
    assert.equal(blocked.verified, false);
  } finally {
    await fs.rm(preparedRoot, { recursive: true, force: true });
  }

  const unknown = await verifyRepairMissionGoalFromPersistedState({
    store: reopened.store,
    statePath,
    missionId: "missing-mission"
  });
  assert.equal(unknown.status, "unknown");
  assert.equal(unknown.verified, false);
} finally {
  await fs.rm(root, { recursive: true, force: true });
}

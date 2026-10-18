import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";
import { runNexoRepairSession } from "../../scripts/nexo-repair-session.mjs";
import { prepareRepairAgainstPersistedState } from "../../scripts/nexo-repair-preparation.mjs";
import { dispatchPreparedRepair } from "../../scripts/nexo-repair-dispatch.mjs";
import { loadStateStrict } from "../../scripts/simulate.mjs";

function legacyMemory(action = "repair_agent_state") {
  return {
    version: 4,
    runs: [],
    lessons: [],
    patterns: [],
    nexo: {
      missions: [{
        missionId: "mission-session",
        status: "planned",
        objective: "repair persisted agent state",
        steps: [{
          id: "step-session",
          action,
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

const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-repair-session-"));
try {
  const nexoPath = path.join(root, "nexo-continuity.json");
  const statePath = path.join(root, "world-state.json");
  const opened = await openNexoContinuityOwner({
    filePath: nexoPath,
    legacyMemory: legacyMemory()
  });
  await fs.writeFile(statePath, JSON.stringify(environment(60)), "utf8");

  const result = await runNexoRepairSession({
    owner: opened.owner,
    store: opened.store,
    statePath,
    missionId: "mission-session",
    stepId: "step-session",
    savedAt: 10
  });

  assert.equal(result.status, "settled_observed");
  assert.equal(result.missionCompleted, false);
  assert.equal(result.causalAttribution, "not_claimed");
  const durableNexo = await opened.owner.loadCurrent();
  assert.equal(durableNexo.storeRevision, 2);
  assert.equal(durableNexo.snapshot.effectJournal.length, 1);
  assert.equal(durableNexo.snapshot.effectJournal[0].status, "settled_observed");
  assert.equal(durableNexo.snapshot.effectJournal[0].action, "repair_agent_state");
  assert.equal((await loadStateStrict(statePath)).stateRevision, 61);

  const rawWorld = JSON.parse(await fs.readFile(statePath, "utf8"));
  assert.equal("nexoMemory" in rawWorld, false);

  // Crash cut through the exact session API: a repair is persisted after
  // PREPARED, but settlement is interrupted. Reopening the canonical owner and
  // invoking the session must observe state and must not redispatch.
  const recoveryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-repair-session-recovery-"));
  try {
    const recoveryNexoPath = path.join(recoveryRoot, "nexo-continuity.json");
    const recoveryStatePath = path.join(recoveryRoot, "world-state.json");
    const initial = await openNexoContinuityOwner({
      filePath: recoveryNexoPath,
      legacyMemory: legacyMemory()
    });
    await fs.writeFile(recoveryStatePath, JSON.stringify(environment(80)), "utf8");
    const prepared = await prepareRepairAgainstPersistedState({
      owner: initial.owner,
      statePath: recoveryStatePath,
      expectedContinuityRevision: 0,
      operation: {
        idempotencyKey: "mission-session:step-session",
        missionId: "mission-session",
        stepId: "step-session",
        action: "repair_agent_state",
        target: "alex"
      }
    });
    assert.equal(prepared.status, "committed");
    const dispatched = await dispatchPreparedRepair({
      owner: initial.owner,
      statePath: recoveryStatePath,
      idempotencyKey: "mission-session:step-session",
      savedAt: 12
    });
    assert.equal(dispatched.status, "completed");
    assert.equal(dispatched.persisted, true);
    assert.equal(dispatched.environmentStateRevision, 81);

    const reopened = await openNexoContinuityOwner({
      filePath: recoveryNexoPath,
      legacyMemory: null
    });
    const recovered = await runNexoRepairSession({
      owner: reopened.owner,
      store: reopened.store,
      statePath: recoveryStatePath,
      missionId: "mission-session",
      stepId: "step-session",
      savedAt: 13
    });
    assert.equal(recovered.status, "recovered");
    assert.equal(recovered.dispatched, false);
    assert.equal((await loadStateStrict(recoveryStatePath)).stateRevision, 81);
    const recoveredStore = await reopened.owner.loadCurrent();
    assert.equal(recoveredStore.storeRevision, 2);
    assert.equal(recoveredStore.snapshot.effectJournal[0].status, "settled_observed");
  } finally {
    await fs.rm(recoveryRoot, { recursive: true, force: true });
  }

  // A caller can select a canonical mission/step but cannot supply an action
  // or target. A non-repair action is blocked before a PREPARED entry or write.
  const unsupportedRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-repair-session-unsupported-"));
  try {
    const unsupportedNexoPath = path.join(unsupportedRoot, "nexo-continuity.json");
    const unsupportedStatePath = path.join(unsupportedRoot, "world-state.json");
    const unsupported = await openNexoContinuityOwner({
      filePath: unsupportedNexoPath,
      legacyMemory: legacyMemory("execute_lumina_action")
    });
    await fs.writeFile(unsupportedStatePath, JSON.stringify(environment(70)), "utf8");
    const blocked = await runNexoRepairSession({
      owner: unsupported.owner,
      store: unsupported.store,
      statePath: unsupportedStatePath,
      missionId: "mission-session",
      stepId: "step-session",
      savedAt: 11
    });
    assert.equal(blocked.status, "blocked");
    assert.equal(blocked.code, "NEXO_REPAIR_SESSION_ACTION_NOT_ELIGIBLE");
    assert.equal((await unsupported.owner.loadCurrent()).storeRevision, 0);
    assert.equal((await unsupported.owner.loadCurrent()).snapshot.effectJournal.length, 0);
    assert.equal((await loadStateStrict(unsupportedStatePath)).stateRevision, 70);
  } finally {
    await fs.rm(unsupportedRoot, { recursive: true, force: true });
  }
} finally {
  await fs.rm(root, { recursive: true, force: true });
}

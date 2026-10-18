import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";
import { prepareRepairAgainstPersistedState } from "../../scripts/nexo-repair-preparation.mjs";
import { dispatchPreparedRepair } from "../../scripts/nexo-repair-dispatch.mjs";
import { runNexoRepairOnce } from "../../scripts/nexo-repair-entrypoint.mjs";
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

  // A caller-provided "verified" label cannot promote observed settlement into
  // a completed mission outcome. The same owner-backed mission must reconstruct
  // blocked after restart until a separate mission-goal contract exists.
  const falsePromotion = await opened.owner.recordOutcome({
    expectedRevision: afterSettlement.storeRevision,
    outcome: {
      missionId: "mission-owner-lifecycle",
      stepId: "step-repair",
      action: "repair_agent_state",
      target: "alex",
      status: "completed",
      evidence: {
        verified: true,
        kind: "caller-asserted",
        source: "caller-asserted"
      }
    }
  });
  assert.equal(falsePromotion.status, "blocked");
  assert.equal(falsePromotion.code, "NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED");
  assert.equal((await opened.owner.loadCurrent()).storeRevision, 2,
    "caller-labeled completion must not advance the owner revision");

  const reconstructedAfterSettlement = await opened.owner.reconstructMission("mission-owner-lifecycle");
  assert.equal(reconstructedAfterSettlement.status, "reconstructed");
  assert.equal(reconstructedAfterSettlement.mission.status, "blocked");
  assert.equal(reconstructedAfterSettlement.mission.objective, "verify_observed_repair_goal");
  assert.equal(reconstructedAfterSettlement.mission.steps[0].status, "blocked");

  const reopenedAfterSettlement = await openNexoContinuityOwner({ filePath: nexoPath });
  const reconstructedAfterRestart = await reopenedAfterSettlement.owner.reconstructMission("mission-owner-lifecycle");
  assert.equal(reconstructedAfterRestart.status, "reconstructed");
  assert.equal(reconstructedAfterRestart.mission.status, "blocked");
  assert.equal(reconstructedAfterRestart.mission.objective, "verify_observed_repair_goal");
  assert.equal((await reopenedAfterSettlement.owner.loadCurrent()).storeRevision, 2,
    "restart reconstruction must not mutate the settled owner snapshot");

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

  await fs.writeFile(statePath, JSON.stringify(environment(12)), "utf8");
  const goalMissing = await verifyRepairMissionGoalFromPersistedState({ store: opened.store, statePath, missionId: "mission-owner-lifecycle" });
  assert.equal(goalMissing.status, "blocked");
  assert.equal(goalMissing.code, "NEXO_REPAIR_MISSION_GOAL_INVARIANT_NOT_PRESENT");
  assert.equal(goalMissing.verified, false);
  assert.equal((await opened.owner.loadCurrent()).storeRevision, 2);

  await fs.writeFile(statePath, JSON.stringify(environment(10, { x: 1, z: 2 })), "utf8");
  const goalRollback = await verifyRepairMissionGoalFromPersistedState({ store: opened.store, statePath, missionId: "mission-owner-lifecycle" });
  assert.equal(goalRollback.status, "unknown");
  assert.equal(goalRollback.code, "NEXO_REPAIR_MISSION_ENVIRONMENT_REVISION_ROLLBACK_OR_REPLAY");
  assert.equal(goalRollback.verified, false);
  assert.equal((await opened.owner.loadCurrent()).storeRevision, 2);

  // Physical separation: Lúmina's world-state file must not embed Nexo memory.
  const rawWorldState = JSON.parse(await fs.readFile(statePath, "utf8"));
  assert.equal("nexoMemory" in rawWorldState, false);

  // Independent stale-revision case: environment changes after PREPARED.
  // Dispatch must preserve the newer writer's state and leave the obligation unresolved.
  const staleRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-owner-stale-revision-"));
  try {
    const staleNexoPath = path.join(staleRoot, "nexo-continuity.json");
    const staleStatePath = path.join(staleRoot, "world-state.json");
    const staleOpened = await openNexoContinuityOwner({
      filePath: staleNexoPath,
      legacyMemory: legacyMemory()
    });
    await fs.writeFile(staleStatePath, JSON.stringify(environment(20)), "utf8");
    const stalePrepared = await prepareRepairAgainstPersistedState({
      owner: staleOpened.owner,
      statePath: staleStatePath,
      expectedContinuityRevision: 0,
      operation: {
        idempotencyKey: "mission-owner-lifecycle:step-repair",
        missionId: "mission-owner-lifecycle",
        stepId: "step-repair",
        action: "repair_agent_state",
        target: "alex"
      }
    });
    assert.equal(stalePrepared.status, "committed");
    assert.equal(stalePrepared.environmentStateRevision, 20);

    // Simulate another writer committing revision 21 after PREPARED.
    await fs.writeFile(staleStatePath, JSON.stringify(environment(21)), "utf8");
    const staleDispatch = await dispatchPreparedRepair({
      owner: staleOpened.owner,
      statePath: staleStatePath,
      idempotencyKey: "mission-owner-lifecycle:step-repair",
      savedAt: 4
    });
    assert.equal(staleDispatch.status, "blocked");
    assert.equal(staleDispatch.code, "NEXO_PREPARED_ENVIRONMENT_REVISION_STALE");
    assert.equal(staleDispatch.expectedStateRevision, 20);
    assert.equal(staleDispatch.currentStateRevision, 21);
    assert.equal(staleDispatch.persisted, false);
    assert.equal((await loadStateStrict(staleStatePath)).stateRevision, 21,
      "stale dispatch must not overwrite a newer environment revision");
    const staleCurrent = await staleOpened.owner.loadCurrent();
    assert.equal(staleCurrent.storeRevision, 1);
    assert.equal(staleCurrent.snapshot.effectJournal[0].status, "prepared",
      "stale dispatch must leave PREPARED unresolved for reconciliation");
  } finally {
    await fs.rm(staleRoot, { recursive: true, force: true });
  }

  // Crash-cut recovery: environment write succeeds, but the process stops
  // before settlement. A fresh owner instance must observe persisted state,
  // settle the existing PREPARED obligation, and never redispatch the effect.
  const recoveryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-owner-crash-recovery-"));
  try {
    const recoveryNexoPath = path.join(recoveryRoot, "nexo-continuity.json");
    const recoveryStatePath = path.join(recoveryRoot, "world-state.json");
    const recoveryInitial = await openNexoContinuityOwner({
      filePath: recoveryNexoPath,
      legacyMemory: legacyMemory()
    });
    await fs.writeFile(recoveryStatePath, JSON.stringify(environment(30)), "utf8");
    const recoveryPrepared = await prepareRepairAgainstPersistedState({
      owner: recoveryInitial.owner,
      statePath: recoveryStatePath,
      expectedContinuityRevision: 0,
      operation: {
        idempotencyKey: "mission-owner-lifecycle:step-repair",
        missionId: "mission-owner-lifecycle",
        stepId: "step-repair",
        action: "repair_agent_state",
        target: "alex"
      }
    });
    assert.equal(recoveryPrepared.status, "committed");
    const recoveryDispatch = await dispatchPreparedRepair({
      owner: recoveryInitial.owner,
      statePath: recoveryStatePath,
      idempotencyKey: "mission-owner-lifecycle:step-repair",
      savedAt: 5
    });
    assert.equal(recoveryDispatch.status, "completed");
    assert.equal(recoveryDispatch.persisted, true);
    assert.equal(recoveryDispatch.environmentStateRevision, 31);

    // Simulate process restart: discard the original owner and reopen from disk.
    const recovered = await openNexoContinuityOwner({
      filePath: recoveryNexoPath,
      legacyMemory: null
    });
    const beforeRecoverySettlement = await recovered.owner.loadCurrent();
    assert.equal(beforeRecoverySettlement.storeRevision, 1);
    assert.equal(beforeRecoverySettlement.snapshot.effectJournal[0].status, "prepared");
    const mismatchedRecovery = await runNexoRepairOnce({
      owner: recovered.owner,
      store: recovered.store,
      statePath: recoveryStatePath,
      expectedContinuityRevision: 1,
      operation: {
        idempotencyKey: "mission-owner-lifecycle:step-repair",
        missionId: "mission-owner-lifecycle",
        stepId: "step-repair",
        action: "repair_agent_state",
        target: "different-agent"
      }
    });
    assert.equal(mismatchedRecovery.status, "blocked");
    assert.equal(mismatchedRecovery.code, "NEXO_REPAIR_OPERATION_CONTEXT_MISMATCH");
    assert.equal((await loadStateStrict(recoveryStatePath)).stateRevision, 31,
      "mismatched caller context must not trigger recovery or dispatch");
    const recoverySettlement = await runNexoRepairOnce({
      owner: recovered.owner,
      store: recovered.store,
      statePath: recoveryStatePath,
      expectedContinuityRevision: 1,
      operation: {
        idempotencyKey: "mission-owner-lifecycle:step-repair",
        missionId: "mission-owner-lifecycle",
        stepId: "step-repair",
        action: "repair_agent_state",
        target: "alex"
      },
      savedAt: 6
    });
    assert.equal(recoverySettlement.status, "recovered");
    assert.equal(recoverySettlement.phase, "settlement");
    assert.equal(recoverySettlement.dispatched, false,
      "recovery must observe the persisted invariant rather than redispatch");
    assert.equal(recoverySettlement.settlement.environmentStateRevision, 31);
    assert.equal((await loadStateStrict(recoveryStatePath)).stateRevision, 31);
    const afterRecoverySettlement = await recovered.owner.loadCurrent();
    assert.equal(afterRecoverySettlement.storeRevision, 2);
    assert.equal(afterRecoverySettlement.snapshot.effectJournal[0].status, "settled_observed");

    // Once recovery settles the observed invariant, a replay must not dispatch.
    const recoveryReplay = await dispatchPreparedRepair({
      owner: recovered.owner,
      statePath: recoveryStatePath,
      idempotencyKey: "mission-owner-lifecycle:step-repair",
      savedAt: 6
    });
    assert.equal(recoveryReplay.status, "blocked");
    assert.equal(recoveryReplay.code, "NEXO_PREPARED_JOURNAL_ENTRY_UNKNOWN");
    assert.equal(recoveryReplay.persisted, false);
    assert.equal((await loadStateStrict(recoveryStatePath)).stateRevision, 31);
  } finally {
    await fs.rm(recoveryRoot, { recursive: true, force: true });
  }

  // Crash before dispatch: PREPARED is durable but environment remains at the
  // baseline revision. Recovery may dispatch only after proving that exact
  // revision is unchanged and the desired invariant is not already present.
  const beforeDispatchRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-owner-before-dispatch-"));
  try {
    const beforeDispatchNexoPath = path.join(beforeDispatchRoot, "nexo-continuity.json");
    const beforeDispatchStatePath = path.join(beforeDispatchRoot, "world-state.json");
    const beforeDispatchInitial = await openNexoContinuityOwner({
      filePath: beforeDispatchNexoPath,
      legacyMemory: legacyMemory()
    });
    await fs.writeFile(beforeDispatchStatePath, JSON.stringify(environment(40)), "utf8");
    const beforeDispatchPrepared = await prepareRepairAgainstPersistedState({
      owner: beforeDispatchInitial.owner,
      statePath: beforeDispatchStatePath,
      expectedContinuityRevision: 0,
      operation: {
        idempotencyKey: "mission-owner-lifecycle:step-repair",
        missionId: "mission-owner-lifecycle",
        stepId: "step-repair",
        action: "repair_agent_state",
        target: "alex"
      }
    });
    assert.equal(beforeDispatchPrepared.status, "committed");
    const afterCrashBeforeDispatch = await openNexoContinuityOwner({
      filePath: beforeDispatchNexoPath,
      legacyMemory: null
    });
    const recoveredBeforeDispatch = await runNexoRepairOnce({
      owner: afterCrashBeforeDispatch.owner,
      store: afterCrashBeforeDispatch.store,
      statePath: beforeDispatchStatePath,
      expectedContinuityRevision: 1,
      operation: {
        idempotencyKey: "mission-owner-lifecycle:step-repair",
        missionId: "mission-owner-lifecycle",
        stepId: "step-repair",
        action: "repair_agent_state",
        target: "alex"
      },
      savedAt: 7
    });
    assert.equal(recoveredBeforeDispatch.status, "settled_observed");
    assert.equal(recoveredBeforeDispatch.dispatch.persisted, true);
    assert.equal(recoveredBeforeDispatch.settlement.environmentStateRevision, 41);
    assert.equal((await loadStateStrict(beforeDispatchStatePath)).stateRevision, 41);
    const afterFirstDispatchRecovery = await afterCrashBeforeDispatch.owner.loadCurrent();
    assert.equal(afterFirstDispatchRecovery.snapshot.effectJournal[0].status, "settled_observed");
    assert.equal(afterFirstDispatchRecovery.snapshot.executions.length, 1,
      "successful repair dispatch must persist owner-backed execution lineage");
    assert.equal(afterFirstDispatchRecovery.snapshot.executions[0].idempotencyKey,
      "mission-owner-lifecycle:step-repair");
    assert.equal(afterFirstDispatchRecovery.snapshot.executions[0].result.persisted, true);
  } finally {
    await fs.rm(beforeDispatchRoot, { recursive: true, force: true });
  }

  // Crash cut: the environment write and owner-backed execution lineage
  // are durable, but the independent settlement commit has not happened yet.
  const lineageCrashRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-lineage-before-settlement-"));
  try {
    const lineageNexoPath = path.join(lineageCrashRoot, "nexo-continuity.json");
    const lineageStatePath = path.join(lineageCrashRoot, "world-state.json");
    const firstOwner = await openNexoContinuityOwner({
      filePath: lineageNexoPath,
      legacyMemory: legacyMemory()
    });
    await fs.writeFile(lineageStatePath, JSON.stringify(environment(70)), "utf8");
    const prepared = await prepareRepairAgainstPersistedState({
      owner: firstOwner.owner,
      statePath: lineageStatePath,
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
    const dispatch = await dispatchPreparedRepair({
      owner: firstOwner.owner,
      statePath: lineageStatePath,
      idempotencyKey: "mission-owner-lifecycle:step-repair",
      savedAt: 9
    });
    assert.equal(dispatch.status, "completed");
    assert.equal(dispatch.persisted, true);
    assert.equal(dispatch.environmentStateRevision, 71);

    // Simulate crash after lineage commit but before settlement commit.
    const reopened = await openNexoContinuityOwner({
      filePath: lineageNexoPath,
      legacyMemory: null
    });
    const beforeLineage = await reopened.owner.loadCurrent();
    assert.equal(beforeLineage.storeRevision, 1);
    const lineage = await reopened.owner.recordExecutionLineage({
      expectedRevision: beforeLineage.storeRevision,
      operation: {
        idempotencyKey: "mission-owner-lifecycle:step-repair",
        missionId: "mission-owner-lifecycle",
        stepId: "step-repair",
        action: "repair_agent_state",
        target: "alex",
        environmentStateRevision: 70
      },
      result: {
        status: dispatch.status,
        persisted: dispatch.persisted,
        stateChanged: dispatch.stateChanged,
        environmentStateRevision: dispatch.environmentStateRevision
      }
    });
    assert.equal(lineage.status, "committed");

    // Same operation identity is not sufficient for idempotent lineage replay:
    // a conflicting adapter result must not be silently accepted.
    const conflictingLineage = await reopened.owner.recordExecutionLineage({
      expectedRevision: lineage.storeRevision,
      operation: {
        idempotencyKey: "mission-owner-lifecycle:step-repair",
        missionId: "mission-owner-lifecycle",
        stepId: "step-repair",
        action: "repair_agent_state",
        target: "alex",
        environmentStateRevision: 70
      },
      result: {
        status: "completed",
        persisted: false,
        stateChanged: false,
        environmentStateRevision: 70
      }
    });
    assert.equal(conflictingLineage.status, "blocked");
    assert.equal(conflictingLineage.code, "NEXO_EXECUTION_RESULT_MISMATCH");
    assert.equal((await reopened.owner.loadCurrent()).storeRevision, lineage.storeRevision,
      "conflicting lineage replay must not mutate continuity");

    const beforeRecovery = await reopened.owner.loadCurrent();
    assert.equal(beforeRecovery.storeRevision, 2);
    assert.equal(beforeRecovery.snapshot.executions.length, 1);
    assert.equal(beforeRecovery.snapshot.effectJournal[0].status, "prepared",
      "lineage must not settle the PREPARED obligation");

    const recovered = await runNexoRepairOnce({
      owner: reopened.owner,
      store: reopened.store,
      statePath: lineageStatePath,
      expectedContinuityRevision: beforeRecovery.storeRevision,
      operation: {
        idempotencyKey: "mission-owner-lifecycle:step-repair",
        missionId: "mission-owner-lifecycle",
        stepId: "step-repair",
        action: "repair_agent_state",
        target: "alex"
      },
      savedAt: 10
    });
    assert.equal(recovered.status, "recovered");
    assert.equal(recovered.dispatched, false);
    assert.equal(recovered.settlement.status, "settled_observed");
    assert.equal((await loadStateStrict(lineageStatePath)).stateRevision, 71,
      "recovery after lineage must not rewrite the environment");
    const afterRecovery = await reopened.owner.loadCurrent();
    assert.equal(afterRecovery.snapshot.executions.length, 1);
    assert.equal(afterRecovery.snapshot.effectJournal[0].status, "settled_observed");
    assert.equal(afterRecovery.storeRevision, 3);
  } finally {
    await fs.rm(lineageCrashRoot, { recursive: true, force: true });
  }

  // Desired invariant already holds: the entrypoint may observe and settle it,
  // but must not invent an environment write or advance its revision.
  const alreadySatisfiedRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-owner-already-satisfied-"));
  try {
    const alreadySatisfiedNexoPath = path.join(alreadySatisfiedRoot, "nexo-continuity.json");
    const alreadySatisfiedStatePath = path.join(alreadySatisfiedRoot, "world-state.json");
    const alreadySatisfied = await openNexoContinuityOwner({
      filePath: alreadySatisfiedNexoPath,
      legacyMemory: legacyMemory()
    });
    await fs.writeFile(alreadySatisfiedStatePath, JSON.stringify(environment(50, { x: 1, z: 2 })), "utf8");
    const noOp = await runNexoRepairOnce({
      owner: alreadySatisfied.owner,
      store: alreadySatisfied.store,
      statePath: alreadySatisfiedStatePath,
      expectedContinuityRevision: 0,
      operation: {
        idempotencyKey: "mission-owner-lifecycle:step-repair",
        missionId: "mission-owner-lifecycle",
        stepId: "step-repair",
        action: "repair_agent_state",
        target: "alex"
      },
      savedAt: 8
    });
    assert.equal(noOp.status, "settled_observed");
    assert.equal(noOp.dispatch.persisted, false);
    assert.equal(noOp.persisted, false);
    assert.equal(noOp.settlement.environmentStateRevision, 50);
    assert.equal((await loadStateStrict(alreadySatisfiedStatePath)).stateRevision, 50);
    const noOpCurrent = await alreadySatisfied.owner.loadCurrent();
    assert.equal(noOpCurrent.snapshot.effectJournal[0].status, "settled_observed");
    assert.equal(noOpCurrent.snapshot.executions.length, 1,
      "already-satisfied repair still records its dispatch lineage separately");
    assert.equal(noOpCurrent.snapshot.executions[0].result.persisted, false);
    assert.equal(noOpCurrent.snapshot.executions[0].result.stateChanged, false);
  } finally {
    await fs.rm(alreadySatisfiedRoot, { recursive: true, force: true });
  }
} finally {
  await fs.rm(root, { recursive: true, force: true });
}


// Failure to reload Nexo immediately after a confirmed PREPARED commit must
// return an explicit uncertain result, not throw across the runtime boundary.
const postPreparedReloadRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-post-prepared-reload-"));
try {
  const nexoPath = path.join(postPreparedReloadRoot, "nexo-continuity.json");
  const statePath = path.join(postPreparedReloadRoot, "world-state.json");
  const opened = await openNexoContinuityOwner({ filePath: nexoPath, legacyMemory: legacyMemory() });
  await fs.writeFile(statePath, JSON.stringify(environment(80)), "utf8");
  let loadCalls = 0;
  const owner = {
    ...opened.owner,
    loadCurrent: async () => {
      loadCalls += 1;
      if (loadCalls === 2) {
        const error = new Error("simulated continuity reload failure after PREPARED");
        error.code = "NEXO_CONTINUITY_READ_FAILED";
        throw error;
      }
      return opened.owner.loadCurrent();
    },
    recordPrepared: opened.owner.recordPrepared,
    recordExecutionLineage: opened.owner.recordExecutionLineage
  };
  const result = await runNexoRepairOnce({
    owner,
    store: opened.store,
    statePath,
    expectedContinuityRevision: 0,
    operation: {
      idempotencyKey: "mission-owner-lifecycle:step-repair",
      missionId: "mission-owner-lifecycle",
      stepId: "step-repair",
      action: "repair_agent_state",
      target: "alex"
    },
    savedAt: 11
  });
  assert.equal(result.status, "blocked");
  assert.equal(result.code, "NEXO_CONTINUITY_READ_FAILED");
  assert.equal(result.preparedCommitted, true);
  assert.equal(result.dispatched, false);
  assert.equal(result.uncertainty, "prepared_commit_confirmed_but_journal_reload_unconfirmed");
  const durable = await opened.owner.loadCurrent();
  assert.equal(durable.storeRevision, 1);
  assert.equal(durable.snapshot.effectJournal.length, 1);
  assert.equal(durable.snapshot.effectJournal[0].status, "prepared");
  assert.equal((await loadStateStrict(statePath)).stateRevision, 80,
    "a failed post-PREPARED reload must never dispatch or mutate the environment");
} finally {
  await fs.rm(postPreparedReloadRoot, { recursive: true, force: true });
}


// A thrown lineage commit after the environment write must remain an explicit
// unknown outcome with PREPARED intact; it must not escape as an unstructured
// exception or be mistaken for settlement.
const lineageCommitFailureRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-lineage-commit-failure-"));
try {
  const nexoPath = path.join(lineageCommitFailureRoot, "nexo-continuity.json");
  const statePath = path.join(lineageCommitFailureRoot, "world-state.json");
  const opened = await openNexoContinuityOwner({ filePath: nexoPath, legacyMemory: legacyMemory() });
  await fs.writeFile(statePath, JSON.stringify(environment(90)), "utf8");
  const owner = {
    ...opened.owner,
    recordExecutionLineage: async () => {
      const error = new Error("simulated lineage store write failure after environment persistence");
      error.code = "NEXO_CONTINUITY_WRITE_FAILED";
      throw error;
    }
  };
  const result = await runNexoRepairOnce({
    owner,
    store: opened.store,
    statePath,
    expectedContinuityRevision: 0,
    operation: {
      idempotencyKey: "mission-owner-lifecycle:step-repair",
      missionId: "mission-owner-lifecycle",
      stepId: "step-repair",
      action: "repair_agent_state",
      target: "alex"
    },
    savedAt: 12
  });
  assert.equal(result.status, "blocked");
  assert.equal(result.code, "NEXO_CONTINUITY_WRITE_FAILED");
  assert.equal(result.persisted, true);
  assert.equal(result.uncertainty, "environment_persisted_but_lineage_and_settlement_unconfirmed");
  const durable = await opened.owner.loadCurrent();
  assert.equal(durable.snapshot.effectJournal[0].status, "prepared");
  assert.equal(durable.snapshot.executions.length, 0);
  assert.equal((await loadStateStrict(statePath)).stateRevision, 91,
    "environment persistence must be reported even if owner lineage cannot be committed");
} finally {
  await fs.rm(lineageCommitFailureRoot, { recursive: true, force: true });
}

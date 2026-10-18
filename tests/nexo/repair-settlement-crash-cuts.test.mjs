import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";
import { settlePreparedRepairFromPersistedState } from "../../scripts/nexo-repair-settlement.mjs";
import { createNexoContinuityOwner } from "../../src/nexo/core/continuity-owner.mjs";

function legacyMemory({ existingCompletedAttempt = false } = {}) {
  return {
    version: 4,
    runs: [],
    lessons: [],
    patterns: [],
    nexo: {
      missions: [{
        missionId: "mission-crash-cut",
        status: "blocked",
        objective: "reconcile_prepared_effect",
        steps: [{
          id: "step-repair",
          action: "repair_agent_state",
          target: "alex",
          status: "blocked",
          dependsOn: []
        }]
      }],
      attempts: existingCompletedAttempt ? [{
        missionId: "mission-crash-cut",
        stepId: "step-repair",
        action: "repair_agent_state",
        target: "alex",
        status: "completed",
        evidence: null,
        parentMissionId: null,
        replanReason: null,
        at: "2026-10-18T00:00:00.000Z"
      }] : [],
      doNotRepeat: [],
      executions: [],
      effectJournal: [{
        idempotencyKey: "mission-crash-cut:step-repair",
        missionId: "mission-crash-cut",
        stepId: "step-repair",
        action: "repair_agent_state",
        target: "alex",
        status: "prepared",
        environmentStateRevision: 10,
        at: "2026-10-18T00:00:00.000Z"
      }]
    }
  };
}


function genericMemory() {
  const memory = legacyMemory();
  memory.nexo.missions[0].steps[0].action = "generic_write";
  memory.nexo.missions[0].steps[0].target = "alpha";
  memory.nexo.effectJournal[0].action = "generic_write";
  memory.nexo.effectJournal[0].target = "alpha";
  delete memory.nexo.effectJournal[0].environmentStateRevision;
  return memory;
}

function environment(stateRevision, { normalized = true } = {}) {
  return {
    version: 5,
    stateRevision,
    savedAt: 1,
    day: 1,
    hour: 8,
    world: { day: 1, timeOfDay: 8, resources: {} },
    agents: [{
      id: "alex",
      alive: true,
      position: normalized ? { x: 1, z: 2 } : { x: "invalid", z: 2 },
      needs: {}
    }],
    events: []
  };
}

const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-repair-crash-cuts-"));
try {
  // Crash cut: environment persistence succeeded, but Nexo still has PREPARED.
  // Reconciliation may record observation only; it must not claim causality/completion.
  const observedDir = path.join(root, "observed");
  await fs.mkdir(observedDir);
  const opened = await openNexoContinuityOwner({
    filePath: path.join(observedDir, "nexo.json"),
    legacyMemory: legacyMemory()
  });
  const statePath = path.join(observedDir, "world-state.json");
  await fs.writeFile(statePath, JSON.stringify(environment(11)), "utf8");

  const settled = await settlePreparedRepairFromPersistedState({
    store: opened.store,
    statePath,
    idempotencyKey: "mission-crash-cut:step-repair",
    expectedContinuityRevision: 0
  });
  assert.equal(settled.status, "settled_observed");
  assert.equal(settled.verified, true);
  assert.equal(settled.causalAttribution, "not_claimed");
  const afterSettlement = await opened.owner.loadCurrent();
  assert.equal(afterSettlement.snapshot.effectJournal[0].status, "settled_observed");
  assert.equal(afterSettlement.snapshot.effectJournal[0].settlement.causalAttribution, "not_claimed");
  const reconstructed = await opened.owner.reconstructMission("mission-crash-cut");
  assert.equal(reconstructed.mission.status, "blocked");
  assert.equal(reconstructed.mission.objective, "verify_observed_repair_goal");
  assert.equal(reconstructed.mission.steps[0].status, "blocked");

  // Recovery cut: the desired invariant was already present at the PREPARED
  // baseline revision. Record observation only; this is not evidence that this
  // repair caused the state, and reconstruction must still refuse redispatch.
  const baselineDir = path.join(root, "baseline-already-satisfied");
  await fs.mkdir(baselineDir);
  const baselineOpened = await openNexoContinuityOwner({
    filePath: path.join(baselineDir, "nexo.json"),
    legacyMemory: legacyMemory()
  });
  const baselineStatePath = path.join(baselineDir, "world-state.json");
  await fs.writeFile(baselineStatePath, JSON.stringify(environment(10)), "utf8");
  const baselineObserved = await settlePreparedRepairFromPersistedState({
    store: baselineOpened.store,
    statePath: baselineStatePath,
    idempotencyKey: "mission-crash-cut:step-repair",
    expectedContinuityRevision: 0
  });
  assert.equal(baselineObserved.status, "settled_observed");
  assert.equal(baselineObserved.environmentStateRevision, 10);
  assert.equal(baselineObserved.causalAttribution, "not_claimed");
  const baselineAfter = await baselineOpened.owner.loadCurrent();
  assert.equal(baselineAfter.snapshot.effectJournal[0].status, "settled_observed");
  const baselineMission = await baselineOpened.owner.reconstructMission("mission-crash-cut");
  assert.equal(baselineMission.mission.status, "blocked");
  assert.equal(baselineMission.mission.steps[0].status, "blocked");

  // Crash cut: current environment revision advanced beyond the allowed adjacent
  // revision. Do not settle even when the desired invariant happens to be present.
  const staleDir = path.join(root, "stale");
  await fs.mkdir(staleDir);
  const staleOpened = await openNexoContinuityOwner({
    filePath: path.join(staleDir, "nexo.json"),
    legacyMemory: legacyMemory()
  });
  const staleStatePath = path.join(staleDir, "world-state.json");
  await fs.writeFile(staleStatePath, JSON.stringify(environment(12)), "utf8");
  const stale = await settlePreparedRepairFromPersistedState({
    store: staleOpened.store,
    statePath: staleStatePath,
    idempotencyKey: "mission-crash-cut:step-repair",
    expectedContinuityRevision: 0
  });
  assert.equal(stale.status, "blocked");
  assert.equal(stale.code, "NEXO_REPAIR_SETTLEMENT_ENVIRONMENT_REVISION_UNRELATED");
  assert.equal((await staleOpened.owner.loadCurrent()).snapshot.effectJournal[0].status, "prepared");

  // Generic owner settlement remains fail-closed. Caller-supplied observation
  // data is not a verifier contract and must not settle an unresolved PREPARED.
  const genericSettlement = await staleOpened.owner.reconcilePrepared({
    idempotencyKey: "mission-crash-cut:step-repair",
    observation: { outcome: "desired_state_present", source: "caller-supplied" }
  });
  assert.equal(genericSettlement.status, "blocked");
  assert.equal(genericSettlement.code, "NEXO_EFFECT_RECONCILIATION_REQUIRED");
  assert.equal(genericSettlement.verified, false);
  assert.equal((await staleOpened.owner.loadCurrent()).snapshot.effectJournal[0].status, "prepared");

  // No terminal outcome may bypass reconciliation while PREPARED is unresolved.
  // A dispatch may have applied an effect even if the caller now claims failed/blocked.
  for (const status of ["completed", "failed", "blocked"]) {
    const prematureOutcome = await staleOpened.owner.recordOutcome({
      expectedRevision: 0,
      outcome: {
        missionId: "mission-crash-cut",
        stepId: "step-repair",
        action: "repair_agent_state",
        target: "alex",
        status
      }
    });
    assert.equal(prematureOutcome.status, "blocked", `unresolved PREPARED must reject ${status}`);
    assert.equal(prematureOutcome.code, "NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED");
  }
  const afterPrematureOutcome = await staleOpened.owner.loadCurrent();
  assert.equal(afterPrematureOutcome.snapshot.effectJournal[0].status, "prepared");
  assert.equal(afterPrematureOutcome.snapshot.attempts.length, 0);

  // Even an idempotent replay of an already-present terminal attempt must not
  // bypass the unresolved-effect check. PREPARED dominates stale attempt history.
  const staleAttemptDir = path.join(root, "stale-terminal-attempt");
  await fs.mkdir(staleAttemptDir);
  const staleAttemptOpened = await openNexoContinuityOwner({
    filePath: path.join(staleAttemptDir, "nexo.json"),
    legacyMemory: legacyMemory({ existingCompletedAttempt: true })
  });
  const replayedTerminalAttempt = await staleAttemptOpened.owner.recordOutcome({
    expectedRevision: 0,
    outcome: {
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "repair_agent_state",
      target: "alex",
      status: "completed",
      evidence: null
    }
  });
  assert.equal(replayedTerminalAttempt.status, "blocked");
  assert.equal(replayedTerminalAttempt.code, "NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED");
  assert.equal((await staleAttemptOpened.owner.loadCurrent()).snapshot.effectJournal[0].status, "prepared");

  // Crash cut: the revision is adjacent but the repair invariant is absent.
  // PREPARED remains unresolved; no redispatch or false settlement is authorized.
  const absentDir = path.join(root, "absent");
  await fs.mkdir(absentDir);
  const absentOpened = await openNexoContinuityOwner({
    filePath: path.join(absentDir, "nexo.json"),
    legacyMemory: legacyMemory()
  });
  const absentStatePath = path.join(absentDir, "world-state.json");
  await fs.writeFile(absentStatePath, JSON.stringify(environment(11, { normalized: false })), "utf8");
  const absent = await settlePreparedRepairFromPersistedState({
    store: absentOpened.store,
    statePath: absentStatePath,
    idempotencyKey: "mission-crash-cut:step-repair",
    expectedContinuityRevision: 0
  });
  assert.equal(absent.status, "blocked");
  assert.equal(absent.code, "NEXO_REPAIR_SETTLEMENT_INVARIANT_NOT_PROVEN");
  assert.equal((await absentOpened.owner.loadCurrent()).snapshot.effectJournal[0].status, "prepared");

  // Lost-response cut: the conditional write commits, but the caller receives
  // UNKNOWN. A replay with the original expected revision must recover the
  // already-journaled observation instead of misclassifying it as a CAS conflict.
  const uncertainDir = path.join(root, "settlement-response-lost");
  await fs.mkdir(uncertainDir);
  const uncertainOpened = await openNexoContinuityOwner({
    filePath: path.join(uncertainDir, "nexo.json"),
    legacyMemory: legacyMemory()
  });
  const uncertainStatePath = path.join(uncertainDir, "world-state.json");
  await fs.writeFile(uncertainStatePath, JSON.stringify(environment(11)), "utf8");
  let loseFirstCommitResponse = true;
  const uncertainStore = {
    loadCurrent: (...args) => uncertainOpened.store.loadCurrent(...args),
    commitIfCurrent: async (...args) => {
      const result = await uncertainOpened.store.commitIfCurrent(...args);
      if (loseFirstCommitResponse && result.status === "committed") {
        loseFirstCommitResponse = false;
        return { status: "unknown", code: "TEST_COMMIT_RESPONSE_LOST" };
      }
      return result;
    }
  };
  const uncertainFirst = await settlePreparedRepairFromPersistedState({
    store: uncertainStore,
    statePath: uncertainStatePath,
    idempotencyKey: "mission-crash-cut:step-repair",
    expectedContinuityRevision: 0
  });
  assert.equal(uncertainFirst.status, "unknown");
  assert.equal(uncertainFirst.verified, false);
  const uncertainReplay = await settlePreparedRepairFromPersistedState({
    store: uncertainStore,
    statePath: uncertainStatePath,
    idempotencyKey: "mission-crash-cut:step-repair",
    expectedContinuityRevision: 0
  });
  assert.equal(uncertainReplay.status, "settled_observed");
  assert.equal(uncertainReplay.code, "NEXO_REPAIR_SETTLEMENT_ALREADY_JOURNALED");
  assert.equal(uncertainReplay.verified, true);
  assert.equal(uncertainReplay.recovered, true);
  assert.equal(uncertainReplay.causalAttribution, "not_claimed");
  assert.equal(uncertainReplay.storeRevision, 1);

  // Generic owner verifier contract: trusted bootstrap verifier is queried and
  // its observation is persisted with CAS; it does not claim causal attribution
  // or authorize redispatch.
  const genericDir = path.join(root, "generic-owner-observation");
  await fs.mkdir(genericDir);
  const genericOpened = await openNexoContinuityOwner({
    filePath: path.join(genericDir, "nexo.json"),
    legacyMemory: genericMemory()
  });
  let genericVerifierCalls = 0;
  const genericOwner = createNexoContinuityOwner({
    store: genericOpened.store,
    effectVerifiers: {
      generic_write: async operation => {
        genericVerifierCalls++;
        return {
          status: "applied",
          idempotencyKey: operation.idempotencyKey,
          action: operation.action,
          target: operation.target,
          observedRevision: 11,
          source: "test-persisted-state-reader",
          evidence: { invariantPresent: true }
        };
      }
    }
  });
  const genericObserved = await genericOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha"
    }
  });
  assert.equal(genericObserved.status, "observed");
  assert.equal(genericObserved.observation, "applied");
  assert.equal(genericObserved.preparedCommitted, false);
  assert.equal(genericObserved.observationCommitted, true);
  assert.equal(genericObserved.journalSettled, false);
  assert.equal(genericObserved.causalAttribution, "NOT_ESTABLISHED");
  assert.equal(genericObserved.redispatchAuthorized, false);
  assert.equal(genericVerifierCalls, 1);
  const genericAfter = await genericOpened.owner.loadCurrent();
  assert.equal(genericAfter.snapshot.effectJournal[0].status, "reconciled_observed");
  assert.equal(genericAfter.snapshot.effectJournal[0].reconciliation.status, "applied");
  assert.equal(genericAfter.snapshot.effectJournal[0].reconciliation.source, "test-persisted-state-reader");
  const genericReconstructed = await genericOpened.owner.reconstructMission("mission-crash-cut");
  assert.equal(genericReconstructed.mission.status, "blocked");
  assert.equal(genericReconstructed.mission.objective, "verify_reconciled_effect");
  assert.equal(genericReconstructed.mission.steps[0].status, "blocked");
  const genericPrematureOutcome = await genericOwner.recordOutcome({
    expectedRevision: 1,
    outcome: {
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha",
      status: "completed"
    }
  });
  assert.equal(genericPrematureOutcome.status, "blocked");
  assert.equal(genericPrematureOutcome.code, "NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED");

  // Unknown observations and absent verifier configuration must preserve PREPARED.
  const unknownDir = path.join(root, "generic-owner-unknown");
  await fs.mkdir(unknownDir);
  const unknownOpened = await openNexoContinuityOwner({
    filePath: path.join(unknownDir, "nexo.json"),
    legacyMemory: genericMemory()
  });
  const unknownOwner = createNexoContinuityOwner({
    store: unknownOpened.store,
    effectVerifiers: {
      generic_write: async operation => ({
        status: "unknown",
        idempotencyKey: operation.idempotencyKey,
        action: operation.action,
        target: operation.target,
        observedRevision: 10,
        source: "test-uncertain-reader"
      })
    }
  });
  const genericUnknown = await unknownOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha"
    }
  });
  assert.equal(genericUnknown.status, "blocked");
  assert.equal(genericUnknown.code, "NEXO_EFFECT_RECONCILIATION_UNKNOWN");
  assert.equal((await unknownOpened.owner.loadCurrent()).snapshot.effectJournal[0].status, "prepared");
  const noVerifierOwner = createNexoContinuityOwner({store: unknownOpened.store});
  const noVerifierResult = await noVerifierOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha"
    }
  });
  assert.equal(noVerifierResult.status, "blocked");
  assert.equal(noVerifierResult.code, "NEXO_EFFECT_RECONCILIATION_VERIFIER_UNAVAILABLE");
  assert.equal((await unknownOpened.owner.loadCurrent()).snapshot.effectJournal[0].status, "prepared");


  // A verifier that races with another canonical write cannot settle against
  // the stale expected revision; the concurrent revision remains authoritative.
  const raceDir = path.join(root, "generic-owner-cas-race");
  await fs.mkdir(raceDir);
  const raceOpened = await openNexoContinuityOwner({
    filePath: path.join(raceDir, "nexo.json"),
    legacyMemory: genericMemory()
  });
  let raceCommitResult;
  const raceOwner = createNexoContinuityOwner({
    store: raceOpened.store,
    effectVerifiers: {
      generic_write: async operation => {
        const concurrent = await raceOpened.store.loadCurrent();
        raceCommitResult = await raceOpened.store.commitIfCurrent(concurrent.storeRevision, concurrent.snapshot);
        return {
          status: "applied",
          idempotencyKey: operation.idempotencyKey,
          action: operation.action,
          target: operation.target,
          observedRevision: 11,
          source: "test-racing-reader"
        };
      }
    }
  });
  const racedObservation = await raceOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha"
    }
  });
  assert.equal(raceCommitResult.status, "committed");
  assert.equal(racedObservation.status, "conflict");
  assert.equal(racedObservation.code, "NEXO_CONTINUITY_STORE_REVISION_CONFLICT");
  assert.equal((await raceOpened.owner.loadCurrent()).snapshot.effectJournal[0].status, "prepared");

} finally {
  await fs.rm(root, { recursive: true, force: true });
}

console.log("Nexo repair crash cuts: observed settlement remains non-causal and blocked; stale revision and absent invariant preserve PREPARED.");

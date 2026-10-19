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
  // No PREPARED entry is not evidence of completion. Until an action-specific
  // goal verifier is connected to the owner, a caller-supplied "verified"
  // label must not complete a non-Chronicle action.
  const noPreparedDir = path.join(root, "no-prepared");
  await fs.mkdir(noPreparedDir);
  const noPreparedMemory = legacyMemory();
  noPreparedMemory.nexo.effectJournal = [];
  const noPreparedOwner = await openNexoContinuityOwner({
    filePath: path.join(noPreparedDir, "nexo.json"),
    legacyMemory: noPreparedMemory
  });
  const unsupportedGoalCompletion = await noPreparedOwner.owner.recordOutcome({
    expectedRevision: 0,
    outcome: {
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "repair_agent_state",
      target: "alex",
      status: "completed",
      evidence: { verified: true, kind: "caller-asserted", source: "caller-asserted" }
    }
  });
  assert.equal(unsupportedGoalCompletion.status, "blocked");
  assert.equal(unsupportedGoalCompletion.code, "NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED");
  assert.equal((await noPreparedOwner.owner.loadCurrent()).storeRevision, 0,
    "an unsupported goal claim must not mutate canonical continuity");

  // The same fail-closed rule applies to a generic effect registered with a
  // trusted verifier, even if its PREPARED row is absent.
  const genericNoPreparedDir = path.join(root, "generic-no-prepared");
  await fs.mkdir(genericNoPreparedDir);
  const genericNoPreparedMemory = genericMemory();
  genericNoPreparedMemory.nexo.effectJournal = [];
  const genericNoPreparedOpened = await openNexoContinuityOwner({
    filePath: path.join(genericNoPreparedDir, "nexo.json"),
    legacyMemory: genericNoPreparedMemory
  });
  const registeredEffectOwner = createNexoContinuityOwner({
    store: genericNoPreparedOpened.store,
    effectVerifiers: { generic_write: async () => ({ status: "unknown" }) }
  });
  const unpreparedGenericCompletion = await registeredEffectOwner.recordOutcome({
    expectedRevision: 0,
    outcome: {
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha",
      status: "completed",
      evidence: { verified: true, kind: "caller-asserted", source: "caller-asserted" }
    }
  });
  assert.equal(unpreparedGenericCompletion.status, "blocked");
  assert.equal(unpreparedGenericCompletion.code, "NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED");
  assert.equal((await genericNoPreparedOpened.owner.loadCurrent()).storeRevision, 0,
    "a registered effect cannot complete without canonical effect/goal evidence");

  // An action with no registered effect verifier is not implicitly safe to
  // complete. Unknown action semantics fail closed unless explicitly defined
  // as non-mutating or covered by a dedicated goal contract.
  const unregisteredCompletion = await genericNoPreparedOpened.owner.recordOutcome({
    expectedRevision: 0,
    outcome: {
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha",
      status: "completed",
      evidence: { verified: true, kind: "caller-asserted", source: "caller-asserted" }
    }
  });
  assert.equal(unregisteredCompletion.status, "blocked");
  assert.equal(unregisteredCompletion.code, "NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED");
  assert.equal((await genericNoPreparedOpened.owner.loadCurrent()).storeRevision, 0,
    "an unregistered effect cannot complete by default");
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

  // Crash cut: the canonical store commits a generic observation and then
  // throws before the caller receives the commit result. The API must return
  // structured uncertainty; a reopened owner recovers the persisted record
  // without running the verifier a second time.
  const ambiguousDir = path.join(root, "generic-observation-response-lost-cas-recovery");
  await fs.mkdir(ambiguousDir);
  const ambiguousOpened = await openNexoContinuityOwner({
    filePath: path.join(ambiguousDir, "nexo.json"),
    legacyMemory: genericMemory()
  });
  let ambiguousVerifierCalls = 0;
  let throwAfterCommit = true;
  const canonicalStore = ambiguousOpened.store;
  const ambiguousStore = {
    loadCurrent: () => canonicalStore.loadCurrent(),
    commitIfCurrent: async (...args) => {
      const result = await canonicalStore.commitIfCurrent(...args);
      if (throwAfterCommit && result.status === "committed") {
        throwAfterCommit = false;
        const error = new Error("simulated response loss after durable commit");
        error.code = "NEXO_CONTINUITY_WRITE_FAILED";
        throw error;
      }
      return result;
    }
  };
  const ambiguousOwner = createNexoContinuityOwner({
    store: ambiguousStore,
    effectVerifiers: {
      generic_write: async operation => {
        ambiguousVerifierCalls++;
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
  const ambiguousFirst = await ambiguousOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha"
    }
  });
  assert.equal(ambiguousFirst.status, "blocked");
  assert.equal(ambiguousFirst.uncertainty, "effect_observation_commit_outcome_unknown");
  assert.equal(ambiguousFirst.observationCommitted, false);
  assert.equal(ambiguousVerifierCalls, 1);

  const reopenedAmbiguous = await openNexoContinuityOwner({
    filePath: path.join(ambiguousDir, "nexo.json"),
    legacyMemory: genericMemory()
  });
  let replayVerifierCalls = 0;
  const reopenedOwner = createNexoContinuityOwner({
    store: reopenedAmbiguous.store,
    effectVerifiers: {
      generic_write: async () => {
        replayVerifierCalls++;
        return { status: "unknown" };
      }
    }
  });
  const ambiguousReplay = await reopenedOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha"
    }
  });
  assert.equal(ambiguousReplay.status, "already_observed");
  assert.equal(ambiguousReplay.observation, "applied");
  assert.equal(ambiguousReplay.storeRevision, 1);
  assert.equal(replayVerifierCalls, 0);
  assert.equal((await reopenedAmbiguous.owner.loadCurrent()).snapshot.effectJournal[0].status, "reconciled_observed");

  // Replay must not accept a partially formed observation record as canonical,
  // and must not invoke the verifier as a fallback for a malformed replay.
  let malformedReplayVerifierCalls = 0;
  const malformedReplayStore = {
    loadCurrent: async () => {
      const current = await reopenedAmbiguous.store.loadCurrent();
      const snapshot = structuredClone(current.snapshot);
      delete snapshot.effectJournal[0].reconciliation.evidence;
      return { ...current, snapshot };
    },
    commitIfCurrent: (...args) => reopenedAmbiguous.store.commitIfCurrent(...args)
  };
  const malformedReplayOwner = createNexoContinuityOwner({
    store: malformedReplayStore,
    effectVerifiers: {
      generic_write: async () => {
        malformedReplayVerifierCalls++;
        return { status: "unknown" };
      }
    }
  });
  const malformedReplay = await malformedReplayOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha"
    }
  });
  assert.equal(malformedReplay.status, "conflict");
  assert.equal(malformedReplay.code, "NEXO_CONTINUITY_STORE_REVISION_CONFLICT");
  assert.equal(malformedReplayVerifierCalls, 0);

  // Chronicle settlement replay must meet the same complete-record standard:
  // a status/source/revision tuple without evidence and canonical observedAt
  // is not enough to recover "already observed".
  const malformedSettlementDir = path.join(root, "malformed-chronicle-settlement-replay");
  await fs.mkdir(malformedSettlementDir);
  const malformedSettlementMemory = genericMemory();
  malformedSettlementMemory.nexo.missions[0].steps[0].action = "chronicle_append";
  malformedSettlementMemory.nexo.effectJournal[0].action = "chronicle_append";
  malformedSettlementMemory.nexo.effectJournal[0].status = "settled_observed";
  delete malformedSettlementMemory.nexo.effectJournal[0].environmentStateRevision;
  malformedSettlementMemory.nexo.effectJournal[0].settlement = {
    status: "applied",
    observedRevision: 7,
    source: "nexo-chronicle-store"
  };
  const malformedSettlementOpened = await openNexoContinuityOwner({
    filePath: path.join(malformedSettlementDir, "nexo.json"),
    legacyMemory: malformedSettlementMemory
  });
  const malformedSettlementStore = {
    loadCurrent: async () => {
      const current = await malformedSettlementOpened.store.loadCurrent();
      return { ...current, storeRevision: 1 };
    },
    commitIfCurrent: (...args) => malformedSettlementOpened.store.commitIfCurrent(...args)
  };
  let malformedSettlementVerifierCalls = 0;
  const malformedSettlementOwner = createNexoContinuityOwner({
    store: malformedSettlementStore,
    effectVerifiers: {
      chronicle_append: async () => {
        malformedSettlementVerifierCalls++;
        return { status: "unknown" };
      }
    }
  });
  const malformedSettlementReplay = await malformedSettlementOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "chronicle_append",
      target: "alex"
    }
  });
  assert.equal(malformedSettlementReplay.status, "conflict");
  assert.equal(malformedSettlementReplay.code, "NEXO_CONTINUITY_STORE_REVISION_CONFLICT");
  assert.equal(malformedSettlementVerifierCalls, 0);

  // Completion must apply the same complete-settlement predicate as replay.
  // A structurally loadable settled_observed row without evidence/observedAt
  // must not authorize a Chronicle outcome.
  const malformedOutcomeDir = path.join(root, "malformed-chronicle-outcome");
  await fs.mkdir(malformedOutcomeDir);
  const malformedOutcomeMemory = genericMemory();
  malformedOutcomeMemory.nexo.missions[0].steps[0].action = "chronicle_append";
  malformedOutcomeMemory.nexo.missions[0].steps[0].target = "alex";
  malformedOutcomeMemory.nexo.effectJournal[0].action = "chronicle_append";
  malformedOutcomeMemory.nexo.effectJournal[0].target = "alex";
  malformedOutcomeMemory.nexo.effectJournal[0].status = "settled_observed";
  malformedOutcomeMemory.nexo.effectJournal[0].settlement = {
    status: "applied",
    observedRevision: 7,
    source: "nexo-chronicle-store"
  };
  const malformedOutcomeOpened = await openNexoContinuityOwner({
    filePath: path.join(malformedOutcomeDir, "nexo.json"),
    legacyMemory: malformedOutcomeMemory
  });
  const malformedOutcome = await malformedOutcomeOpened.owner.recordOutcome({
    expectedRevision: 0,
    outcome: {
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "chronicle_append",
      target: "alex",
      status: "completed",
      evidence: { kind: "test", source: "test" }
    }
  });
  assert.equal(malformedOutcome.status, "blocked");
  assert.equal(malformedOutcome.code, "NEXO_CHRONICLE_SETTLEMENT_REQUIRED");
  const malformedOutcomeAfter = await malformedOutcomeOpened.owner.loadCurrent();
  assert.equal(malformedOutcomeAfter.storeRevision, 0,
    "incomplete Chronicle settlement must not authorize or persist completion");
  assert.equal(malformedOutcomeAfter.snapshot.attempts.length, 0);

  // A verifier can succeed but the canonical re-read before CAS can fail.
  // This must return structured uncertainty and leave PREPARED untouched.
  const recheckDir = path.join(root, "generic-observation-recheck-failure");
  await fs.mkdir(recheckDir);
  const recheckOpened = await openNexoContinuityOwner({
    filePath: path.join(recheckDir, "nexo.json"),
    legacyMemory: genericMemory()
  });
  let recheckCalls = 0;
  let recheckVerifierCalls = 0;
  const recheckStore = {
    loadCurrent: async () => {
      recheckCalls++;
      if (recheckCalls === 2) {
        const error = new Error("simulated canonical re-read failure");
        error.code = "NEXO_CONTINUITY_READ_FAILED";
        throw error;
      }
      return recheckOpened.store.loadCurrent();
    },
    commitIfCurrent: (...args) => recheckOpened.store.commitIfCurrent(...args)
  };
  const recheckOwner = createNexoContinuityOwner({
    store: recheckStore,
    effectVerifiers: {
      generic_write: async operation => {
        recheckVerifierCalls++;
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
  const recheckResult = await recheckOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha"
    }
  });
  assert.equal(recheckResult.status, "blocked");
  assert.equal(recheckResult.code, "NEXO_CONTINUITY_READ_FAILED");
  assert.equal(recheckResult.uncertainty, "continuity_recheck_failed");
  assert.equal(recheckVerifierCalls, 1);
  const afterRecheckFailure = await recheckOpened.owner.loadCurrent();
  assert.equal(afterRecheckFailure.storeRevision, 0);
  assert.equal(afterRecheckFailure.snapshot.effectJournal[0].status, "prepared");

  // The initial canonical read is also an explicit failure boundary; no
  // verifier may run when the owner cannot establish the current journal view.
  const initialReadDir = path.join(root, "generic-observation-initial-read-failure");
  await fs.mkdir(initialReadDir);
  const initialReadOpened = await openNexoContinuityOwner({
    filePath: path.join(initialReadDir, "nexo.json"),
    legacyMemory: genericMemory()
  });
  let initialReadVerifierCalls = 0;
  const initialReadStore = {
    loadCurrent: async () => {
      const error = new Error("simulated initial canonical read failure");
      error.code = "NEXO_CONTINUITY_INITIAL_READ_FAILED";
      throw error;
    },
    commitIfCurrent: (...args) => initialReadOpened.store.commitIfCurrent(...args)
  };
  const initialReadOwner = createNexoContinuityOwner({
    store: initialReadStore,
    effectVerifiers: {
      generic_write: async () => {
        initialReadVerifierCalls++;
        return { status: "unknown" };
      }
    }
  });
  const initialReadResult = await initialReadOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha"
    }
  });
  assert.equal(initialReadResult.status, "blocked");
  assert.equal(initialReadResult.code, "NEXO_CONTINUITY_INITIAL_READ_FAILED");
  assert.equal(initialReadResult.uncertainty, "continuity_read_failed");
  assert.equal(initialReadVerifierCalls, 0);
  assert.equal((await initialReadOpened.owner.loadCurrent()).snapshot.effectJournal[0].status, "prepared");

  // Mission admission also fails closed if its canonical read fails. It must
  // not leak the storage exception or attempt a commit from an unknown base.
  const admissionReadDir = path.join(root, "mission-admission-read-failure");
  await fs.mkdir(admissionReadDir);
  const admissionReadOpened = await openNexoContinuityOwner({
    filePath: path.join(admissionReadDir, "nexo.json"),
    legacyMemory: genericMemory()
  });
  const admissionReadStore = {
    loadCurrent: async () => {
      const error = new Error("simulated mission admission read failure");
      error.code = "NEXO_MISSION_ADMISSION_READ_FAILED";
      throw error;
    },
    commitIfCurrent: (...args) => admissionReadOpened.store.commitIfCurrent(...args)
  };
  const admissionReadOwner = createNexoContinuityOwner({ store: admissionReadStore });
  const admissionReadResult = await admissionReadOwner.recordMission({
    expectedRevision: 0,
    mission: { missionId: "mission-read-failure", steps: [] }
  });
  assert.equal(admissionReadResult.status, "blocked");
  assert.equal(admissionReadResult.code, "NEXO_MISSION_ADMISSION_READ_FAILED");
  assert.equal(admissionReadResult.uncertainty, "continuity_read_failed");
  assert.equal(admissionReadResult.storeRevision, 0);
  assert.equal((await admissionReadOpened.owner.loadCurrent()).storeRevision, 0);

  // The verifier registry is snapshotted at owner construction: later
  // caller mutation cannot replace the configured reconciliation function.
  const frozenRegistryDir = path.join(root, "generic-owner-frozen-registry");
  await fs.mkdir(frozenRegistryDir);
  const frozenRegistryOpened = await openNexoContinuityOwner({
    filePath: path.join(frozenRegistryDir, "nexo.json"),
    legacyMemory: genericMemory()
  });
  const mutableVerifierRegistry = {
    generic_write: async operation => ({
      status: "applied",
      idempotencyKey: operation.idempotencyKey,
      action: operation.action,
      target: operation.target,
      observedRevision: 11,
      source: "registered-verifier"
    })
  };
  const frozenRegistryOwner = createNexoContinuityOwner({
    store: frozenRegistryOpened.store,
    effectVerifiers: mutableVerifierRegistry
  });
  mutableVerifierRegistry.generic_write = async () => { throw new Error("replaced"); };
  const frozenRegistryResult = await frozenRegistryOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha"
    }
  });
  assert.equal(frozenRegistryResult.status, "observed");
  assert.equal(frozenRegistryResult.observation, "applied");
  assert.equal((await frozenRegistryOpened.owner.loadCurrent()).snapshot.effectJournal[0].status, "reconciled_observed");

  // Lost-response cut for the generic path: the store commits the observation,
  // but the first caller sees an uncertain result. Replay must return the
  // persisted observation without invoking the verifier or settling PREPARED.
  const genericLostResponseDir = path.join(root, "generic-observation-response-lost-recovery");
  await fs.mkdir(genericLostResponseDir);
  const genericLostResponseOpened = await openNexoContinuityOwner({
    filePath: path.join(genericLostResponseDir, "nexo.json"),
    legacyMemory: genericMemory()
  });
  let lostResponseVerifierCalls = 0;
  let loseGenericCommitResponse = true;
  const genericLostResponseStore = {
    loadCurrent: (...args) => genericLostResponseOpened.store.loadCurrent(...args),
    commitIfCurrent: async (...args) => {
      const result = await genericLostResponseOpened.store.commitIfCurrent(...args);
      if (loseGenericCommitResponse && result.status === "committed") {
        loseGenericCommitResponse = false;
        return { status: "unknown", code: "NEXO_COMMIT_RESULT_UNKNOWN", storeRevision: result.storeRevision };
      }
      return result;
    }
  };
  const genericLostResponseOwner = createNexoContinuityOwner({
    store: genericLostResponseStore,
    effectVerifiers: {
      generic_write: async operation => {
        lostResponseVerifierCalls += 1;
        return {
          status: "applied",
          idempotencyKey: operation.idempotencyKey,
          action: operation.action,
          target: operation.target,
          observedRevision: 11,
          source: "test-persisted-reader",
          evidence: { revision: 11 }
        };
      }
    }
  });
  const genericOperation = {
    idempotencyKey: "mission-crash-cut:step-repair",
    missionId: "mission-crash-cut",
    stepId: "step-repair",
    action: "generic_write",
    target: "alpha"
  };
  const uncertainGenericObservation = await genericLostResponseOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: genericOperation
  });
  assert.equal(uncertainGenericObservation.status, "unknown");
  assert.equal(lostResponseVerifierCalls, 1);
  const genericReplay = await genericLostResponseOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: genericOperation
  });
  assert.equal(genericReplay.status, "already_observed");
  assert.equal(genericReplay.observation, "applied");
  assert.equal(genericReplay.observationCommitted, false);
  assert.equal(genericReplay.journalSettled, false);
  assert.equal(genericReplay.causalAttribution, "NOT_ESTABLISHED");
  assert.equal(genericReplay.redispatchAuthorized, false);
  assert.equal(lostResponseVerifierCalls, 1, "replay must not re-run the verifier");
  const genericPersistedAfterReplay = await genericLostResponseOpened.owner.loadCurrent();
  assert.equal(genericPersistedAfterReplay.snapshot.effectJournal[0].status, "reconciled_observed");
  assert.equal(genericPersistedAfterReplay.snapshot.attempts.length, 0);
  const incompatibleGenericReplay = await genericLostResponseOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: { ...genericOperation, target: "different-target" }
  });
  assert.equal(incompatibleGenericReplay.status, "conflict");
  assert.equal(incompatibleGenericReplay.code, "NEXO_CONTINUITY_STORE_REVISION_CONFLICT");
  assert.equal(lostResponseVerifierCalls, 1);

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


  const invalidEvidenceDir = path.join(root, "generic-owner-invalid-evidence");
  await fs.mkdir(invalidEvidenceDir);
  const invalidEvidenceOpened = await openNexoContinuityOwner({
    filePath: path.join(invalidEvidenceDir, "nexo.json"),
    legacyMemory: genericMemory()
  });
  const invalidEvidenceOwner = createNexoContinuityOwner({
    store: invalidEvidenceOpened.store,
    effectVerifiers: {
      generic_write: async operation => ({
        status: "applied",
        idempotencyKey: operation.idempotencyKey,
        action: operation.action,
        target: operation.target,
        observedRevision: 11,
        source: "test-invalid-evidence",
        evidence: { nonSerializable: () => true }
      })
    }
  });
  const invalidEvidenceResult = await invalidEvidenceOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "generic_write",
      target: "alpha"
    }
  });
  assert.equal(invalidEvidenceResult.status, "blocked");
  assert.equal(invalidEvidenceResult.code, "NEXO_EFFECT_RECONCILIATION_EVIDENCE_INVALID");
  assert.equal((await invalidEvidenceOpened.owner.loadCurrent()).snapshot.effectJournal[0].status, "prepared");

  // A Chronicle settlement must carry evidence bound to the persisted entry.
  // Merely owning an evidence property whose value is null is insufficient.
  const nullChronicleEvidenceDir = path.join(root, "chronicle-null-evidence");
  await fs.mkdir(nullChronicleEvidenceDir);
  const nullChronicleMemory = genericMemory();
  nullChronicleMemory.nexo.missions[0].steps[0].action = "chronicle_append";
  nullChronicleMemory.nexo.missions[0].steps[0].target = { content: "persisted chronicle content" };
  nullChronicleMemory.nexo.effectJournal[0].action = "chronicle_append";
  nullChronicleMemory.nexo.effectJournal[0].target = { content: "persisted chronicle content" };
  nullChronicleMemory.nexo.effectJournal[0].status = "settled_observed";
  nullChronicleMemory.nexo.effectJournal[0].settlement = {
    status: "applied",
    observedRevision: 1,
    source: "nexo-chronicle-store",
    evidence: null,
    observedAt: "2026-10-19T00:00:00.000Z"
  };
  const nullChronicleOpened = await openNexoContinuityOwner({
    filePath: path.join(nullChronicleEvidenceDir, "nexo.json"),
    legacyMemory: nullChronicleMemory
  });
  const nullChronicleOwner = createNexoContinuityOwner({
    store: nullChronicleOpened.store,
    effectVerifiers: {
      chronicle_append: async operation => ({
        status: "applied",
        idempotencyKey: operation.idempotencyKey,
        action: operation.action,
        target: operation.target,
        observedRevision: 1,
        source: "nexo-chronicle-store",
        evidence: {
          kind: "persisted-chronicle-entry",
          operationKey: operation.idempotencyKey,
          content: operation.target.content
        }
      })
    }
  });
  const nullChronicleOutcome = await nullChronicleOwner.recordOutcome({
    expectedRevision: 0,
    outcome: {
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "chronicle_append",
      target: { content: "persisted chronicle content" },
      status: "completed"
    }
  });
  assert.equal(nullChronicleOutcome.status, "blocked");
  assert.equal(nullChronicleOutcome.code, "NEXO_CHRONICLE_SETTLEMENT_REQUIRED");
  assert.equal((await nullChronicleOpened.owner.loadCurrent()).storeRevision, 0);
  assert.equal((await nullChronicleOpened.owner.loadCurrent()).snapshot.attempts.length, 0);

  // A revision mismatch must not let malformed settlement replay as already observed.
  const nullChronicleCurrent = await nullChronicleOpened.store.loadCurrent();
  assert.equal((await nullChronicleOpened.store.commitIfCurrent(
    nullChronicleCurrent.storeRevision, nullChronicleCurrent.snapshot
  )).status, "committed");
  const nullEvidenceReplay = await nullChronicleOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "chronicle_append",
      target: { content: "persisted chronicle content" }
    }
  });
  assert.equal(nullEvidenceReplay.status, "conflict");
  assert.equal(nullEvidenceReplay.code, "NEXO_CONTINUITY_STORE_REVISION_CONFLICT");
  assert.notEqual(nullEvidenceReplay.status, "already_observed");

  // Repair actions cannot bypass their revision-bound repair-specific
  // settlement contract through the generic observation API.
  const repairContractDir = path.join(root, "generic-repair-route-rejected");
  await fs.mkdir(repairContractDir);
  const repairContractOpened = await openNexoContinuityOwner({
    filePath: path.join(repairContractDir, "nexo.json"),
    legacyMemory: legacyMemory()
  });
  const repairContractOwner = createNexoContinuityOwner({
    store: repairContractOpened.store,
    effectVerifiers: {
      repair_agent_state: async operation => ({
        status: "applied",
        idempotencyKey: operation.idempotencyKey,
        action: operation.action,
        target: operation.target,
        observedRevision: 11,
        source: "must-not-be-used"
      })
    }
  });
  const repairGenericAttempt = await repairContractOwner.reconcilePrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-crash-cut:step-repair",
      missionId: "mission-crash-cut",
      stepId: "step-repair",
      action: "repair_agent_state",
      target: "alex"
    }
  });
  assert.equal(repairGenericAttempt.status, "blocked");
  assert.equal(repairGenericAttempt.code, "NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED");
  assert.equal((await repairContractOpened.owner.loadCurrent()).snapshot.effectJournal[0].status, "prepared");

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

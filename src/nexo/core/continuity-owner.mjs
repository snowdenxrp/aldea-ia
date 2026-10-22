import { isDeepStrictEqual } from "node:util";
import { assertContractInput } from "./contracts.mjs";
import { assertNexoMissionAdmission } from "./mission-admission-contract.mjs";
import { assertNexoContinuityDataBounded } from "./continuity-data-guard.mjs";
import { NEXO_CONTINUITY_SCHEMA, assertNexoContinuitySnapshot } from "./continuity-snapshot.mjs";
import { recordNexoMissionInSnapshot, recordNexoExecutionInSnapshot, recordNexoOutcomeInSnapshot, reconstructNexoMissionFromSnapshot } from "./continuity-operations.mjs";
import { isValidNexoChronicleOutcomeEvidence, isValidNexoChronicleSettlementRecord } from "./chronicle-settlement-contract.mjs";

function ownerError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}


function validateCallerRecord(value, invalidCode) {
  assertNexoContinuityDataBounded(value, {
    resourceLimitCode: "NEXO_CONTINUITY_INPUT_RESOURCE_LIMIT_EXCEEDED",
    invalidCode
  });
  try {
    assertContractInput(value, "Nexo continuity operation");
  } catch {
    throw ownerError(invalidCode);
  }
}

function validateOperation(operation) {
  if (!operation || typeof operation !== "object" ||
      typeof operation.idempotencyKey !== "string" || !operation.idempotencyKey.trim() ||
      typeof operation.missionId !== "string" || !operation.missionId.trim() ||
      typeof operation.stepId !== "string" || !operation.stepId.trim() ||
      typeof operation.action !== "string" || !operation.action.trim()) {
    throw ownerError("NEXO_OPERATION_CONTEXT_INVALID");
  }
  if (operation.missionId.includes(":") || operation.stepId.includes(":")) {
    throw ownerError("NEXO_OPERATION_IDENTITY_MISMATCH");
  }
  const expectedKey = `${operation.missionId}:${operation.stepId}`;
  if (operation.idempotencyKey !== expectedKey) {
    throw ownerError("NEXO_OPERATION_IDENTITY_MISMATCH");
  }
}

const REPAIR_ACTIONS = new Set(["repair_agent_state", "repair_agent_needs", "repair_resource_state"]);

function validObservationEvidence(evidence) {
  return evidence !== null && typeof evidence === "object" && !Array.isArray(evidence) &&
    Object.keys(evidence).length > 0;
}

function emptyCandidate(snapshot) {
  return {
    schema: NEXO_CONTINUITY_SCHEMA,
    schemaVersion: 1,
    missions: structuredClone(snapshot.missions),
    attempts: structuredClone(snapshot.attempts),
    doNotRepeat: structuredClone(snapshot.doNotRepeat),
    executions: structuredClone(snapshot.executions),
    effectJournal: structuredClone(snapshot.effectJournal)
  };
}

/**
 * Semantic owner for Nexo's operational-continuity store.
 *
 * It can durably admit a mission and record PREPARED before an adapter is
 * dispatched. It intentionally cannot settle a prepared effect: no independent
 * operation-specific reconciliation/verifier is wired into this owner yet.
 */
export function createNexoContinuityOwner({ store, effectVerifiers = {} } = {}) {
  if (!store || typeof store.loadCurrent !== "function" ||
      typeof store.commitIfCurrent !== "function") {
    throw ownerError("NEXO_CONTINUITY_STORE_REQUIRED");
  }
  if (!effectVerifiers || typeof effectVerifiers !== "object" || Array.isArray(effectVerifiers)) {
    throw ownerError("NEXO_EFFECT_VERIFIER_REGISTRY_INVALID");
  }
  const verifierRegistry = Object.create(null);
  for (const [action, verifier] of Object.entries(effectVerifiers)) {
    if (!action.trim() || typeof verifier !== "function") throw ownerError("NEXO_EFFECT_VERIFIER_REGISTRY_INVALID");
    Object.defineProperty(verifierRegistry, action, { value: verifier, enumerable: true, writable: false, configurable: false });
  }
  Object.freeze(verifierRegistry);

  function supportsReconciliation(action) {
    return typeof action === "string" && Object.hasOwn(verifierRegistry, action);
  }

  async function loadCurrent() {
    return store.loadCurrent();
  }

  async function reconstructMission(missionId) {
    if (typeof missionId !== "string" || !missionId.trim()) {
      return { status: "failed", code: "NEXO_MISSION_ID_INVALID" };
    }
    const current = await store.loadCurrent();
    const mission = reconstructNexoMissionFromSnapshot(current.snapshot, missionId);
    if (!mission) {
      return { status: "not_found", mission: null, storeRevision: current.storeRevision };
    }
    return { status: "reconstructed", mission, storeRevision: current.storeRevision };
  }

  async function recordMission({ expectedRevision, mission } = {}) {
    try { assertNexoMissionAdmission(mission); }
    catch (error) {
      return { status: "conflict", code: error?.code ?? "NEXO_MISSION_CONTEXT_INVALID" };
    }
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 ||
        !mission || typeof mission.missionId !== "string" || !mission.missionId.trim() ||
        !Array.isArray(mission.steps)) {
      return { status: "failed", code: "NEXO_MISSION_CONTEXT_INVALID" };
    }
    let current;
    try {
      current = await store.loadCurrent();
    } catch (error) {
      return {
        status: "blocked",
        code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED",
        storeRevision: expectedRevision,
        uncertainty: "continuity_read_failed",
        authorization: "NOT_EVALUATED"
      };
    }
    if (current.storeRevision !== expectedRevision) {
      return { status: "conflict", code: "NEXO_CONTINUITY_STORE_REVISION_CONFLICT", storeRevision: current.storeRevision };
    }
    const candidate = emptyCandidate(current.snapshot);
    let next;
    try {
      next = recordNexoMissionInSnapshot(candidate, mission);
    } catch (error) {
      return { status: "conflict", code: error?.code ?? "NEXO_MISSION_CONTEXT_INVALID", storeRevision: current.storeRevision };
    }
    if (next.missions.length === candidate.missions.length) {
      return { status: "already_recorded", storeRevision: current.storeRevision, authorization: "NOT_EVALUATED" };
    }
    assertNexoContinuitySnapshot(next);
    return store.commitIfCurrent(expectedRevision, next);
  }

  /**
   * Persist a mission-step outcome in Nexo's own store.
   * This records an outcome claim; it never settles effectJournal or authorizes effects.
   */
  async function recordOutcome({ expectedRevision, outcome } = {}) {
    try { validateCallerRecord(outcome, "NEXO_OUTCOME_CONTEXT_INVALID"); }
    catch (error) {
      return { status: "failed", code: error?.code ?? "NEXO_OUTCOME_CONTEXT_INVALID" };
    }
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
      return { status: "failed", code: "NEXO_CONTINUITY_STORE_EXPECTED_REVISION_INVALID" };
    }
    if (!outcome || typeof outcome !== "object" || Array.isArray(outcome) ||
        typeof outcome.missionId !== "string" || !outcome.missionId.trim() ||
        typeof outcome.stepId !== "string" || !outcome.stepId.trim() ||
        typeof outcome.action !== "string" || !outcome.action.trim() ||
        !["completed", "failed", "blocked"].includes(outcome.status)) {
      return { status: "failed", code: "NEXO_OUTCOME_CONTEXT_INVALID" };
    }

    let current;
    try {
      current = await store.loadCurrent();
    } catch (error) {
      return {
        status: "blocked",
        code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED",
        storeRevision: expectedRevision,
        uncertainty: "continuity_read_failed",
        journalSettled: false,
        authorization: "NOT_EVALUATED"
      };
    }
    if (current.storeRevision !== expectedRevision) {
      return { status: "conflict", code: "NEXO_CONTINUITY_STORE_REVISION_CONFLICT", storeRevision: current.storeRevision };
    }
    const mission = current.snapshot.missions.find(item => item?.missionId === outcome.missionId);
    const step = mission?.steps?.find(item => item?.id === outcome.stepId);
    if (!step) return { status: "blocked", code: "NEXO_OUTCOME_MISSION_CONTEXT_MISSING", storeRevision: current.storeRevision };
    if (step.action !== outcome.action ||
        !isDeepStrictEqual(step.target ?? null, outcome.target ?? null)) {
      return { status: "blocked", code: "NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH", storeRevision: current.storeRevision };
    }

    const stepEffects = current.snapshot.effectJournal.filter(item =>
      item?.missionId === outcome.missionId && item?.stepId === outcome.stepId
    );
    // Chronicle's exact persisted append invariant is itself the goal for this
    // one action. Other actions still require their separate goal-verification gate.
    // Keep completion's persisted-record predicate aligned with replay: a partial
    // settlement must never authorize a terminal outcome.
    const chronicleSettlementReady = outcome.action === "chronicle_append" &&
      outcome.status === "completed" &&
      stepEffects.length === 1 &&
      stepEffects[0]?.idempotencyKey === `${outcome.missionId}:${outcome.stepId}` &&
      stepEffects[0]?.action === outcome.action &&
      isDeepStrictEqual(stepEffects[0]?.target ?? null, outcome.target ?? null) &&
      isValidNexoChronicleSettlementRecord(stepEffects[0]);
    if (outcome.action === "chronicle_append" && outcome.status === "completed" &&
        !chronicleSettlementReady) {
      return {
        status: "blocked",
        code: "NEXO_CHRONICLE_SETTLEMENT_REQUIRED",
        storeRevision: current.storeRevision,
        journalSettled: false,
        authorization: "NOT_EVALUATED"
      };
    }
    if (chronicleSettlementReady &&
        !isValidNexoChronicleOutcomeEvidence(stepEffects[0], outcome.evidence)) {
      return {
        status: "blocked",
        code: "NEXO_CHRONICLE_OUTCOME_EVIDENCE_MISMATCH",
        storeRevision: current.storeRevision,
        journalSettled: false,
        authorization: "NOT_EVALUATED"
      };
    }
    const unresolvedEffect = stepEffects.some(item =>
      ["prepared", "settled_observed", "reconciled_observed"].includes(item?.status)
    ) && !chronicleSettlementReady;
    if (unresolvedEffect) {
      return {
        status: "blocked",
        code: "NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED",
        storeRevision: current.storeRevision,
        journalSettled: false,
        authorization: "NOT_EVALUATED"
      };
    }

    // Completion is fail-closed by default. Chronicle has its own exact
    // persisted-settlement gate; local_analysis is the only currently defined
    // non-mutating action. Every other action needs an explicit goal verifier
    // contract before a caller may record completed, whether or not PREPARED
    // exists and whether or not an effect verifier is registered.
    if (outcome.status === "completed" &&
        outcome.action !== "chronicle_append" &&
        outcome.action !== "local_analysis") {
      return {
        status: "blocked",
        code: "NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED",
        storeRevision: current.storeRevision,
        journalSettled: false,
        authorization: "NOT_EVALUATED"
      };
    }

    const existing = current.snapshot.attempts.find(item =>
      item?.missionId === outcome.missionId && item?.stepId === outcome.stepId
    );
    if (existing) {
      const sameIdentity = existing.action === outcome.action &&
        isDeepStrictEqual(existing.target ?? null, outcome.target ?? null);
      if (!sameIdentity) return { status: "blocked", code: "NEXO_OUTCOME_IDENTITY_MISMATCH", storeRevision: current.storeRevision };
      const sameOutcome = existing.status === outcome.status &&
        isDeepStrictEqual(existing.evidence ?? null, outcome.evidence ?? null) &&
        (existing.parentMissionId ?? null) === (outcome.parentMissionId ?? null) &&
        (existing.replanReason ?? null) === (outcome.replanReason ?? null);
      if (!sameOutcome) {
        return {
          status: "blocked",
          code: "NEXO_OUTCOME_RESULT_MISMATCH",
          storeRevision: current.storeRevision,
          journalSettled: false,
          authorization: "NOT_EVALUATED"
        };
      }
      return { status: "already_recorded", storeRevision: current.storeRevision, journalSettled: false, authorization: "NOT_EVALUATED" };
    }

    let candidate;
    try {
      candidate = recordNexoOutcomeInSnapshot(current.snapshot, {
        missionId: outcome.missionId,
        stepId: outcome.stepId,
        action: outcome.action,
        target: outcome.target ?? null,
        status: outcome.status,
        evidence: outcome.evidence ?? null,
        doNotRepeat: outcome.doNotRepeat === true,
        parentMissionId: outcome.parentMissionId ?? null,
        replanReason: outcome.replanReason ?? null
      });
    } catch (error) {
      return { status: "failed", code: error?.code ?? "NEXO_OUTCOME_CONTEXT_INVALID", storeRevision: current.storeRevision };
    }

    const committed = await store.commitIfCurrent(expectedRevision, candidate);
    return { ...committed, journalSettled: false, authorization: "NOT_EVALUATED" };
  }

  async function recordPrepared({ expectedRevision, operation } = {}) {
    try {
      validateCallerRecord(operation, "NEXO_OPERATION_CONTEXT_INVALID");
      validateOperation(operation);
    }
    catch (error) { return { status: "failed", code: error?.code ?? "NEXO_OPERATION_CONTEXT_INVALID" }; }
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
      return { status: "failed", code: "NEXO_CONTINUITY_STORE_EXPECTED_REVISION_INVALID" };
    }

    if (REPAIR_ACTIONS.has(operation.action) &&
        (!Number.isSafeInteger(operation.environmentStateRevision) || operation.environmentStateRevision < 0)) {
      return { status: "blocked", code: "NEXO_PREPARED_ENVIRONMENT_REVISION_REQUIRED", preparedCommitted: false, authorization: "NOT_EVALUATED" };
    }

    let current;
    try {
      current = await store.loadCurrent();
    } catch (error) {
      return {
        status: "blocked",
        code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED",
        storeRevision: expectedRevision,
        uncertainty: "continuity_read_failed",
        preparedCommitted: false,
        authorization: "NOT_EVALUATED"
      };
    }
    if (current.storeRevision !== expectedRevision) {
      return { status: "conflict", code: "NEXO_CONTINUITY_STORE_REVISION_CONFLICT", storeRevision: current.storeRevision };
    }
    const candidate = emptyCandidate(current.snapshot);
    const mission = candidate.missions.find(item => item?.missionId === operation.missionId);
    const step = mission?.steps?.find(item => item?.id === operation.stepId);
    if (!step) return { status: "blocked", code: "NEXO_PREPARED_MISSION_CONTEXT_MISSING", preparedCommitted: false, authorization: "NOT_EVALUATED" };
    if (step.action !== operation.action ||
        !isDeepStrictEqual(step.target ?? null, operation.target ?? null)) {
      return { status: "blocked", code: "NEXO_PREPARED_OPERATION_CONTEXT_MISMATCH", preparedCommitted: false, authorization: "NOT_EVALUATED" };
    }

    const existing = candidate.effectJournal.find(item => item?.idempotencyKey === operation.idempotencyKey);
    if (existing) {
      const sameIdentity = existing.missionId === operation.missionId &&
        existing.stepId === operation.stepId &&
        existing.action === operation.action &&
        isDeepStrictEqual(existing.target ?? null, operation.target ?? null);
      if (!sameIdentity) return { status: "blocked", code: "NEXO_OPERATION_IDENTITY_MISMATCH", preparedCommitted: false, authorization: "NOT_EVALUATED" };
      if (REPAIR_ACTIONS.has(operation.action)) {
        if (!Number.isSafeInteger(existing.environmentStateRevision) || existing.environmentStateRevision < 0) {
          return { status: "prepared_existing", code: "NEXO_PREPARED_ENVIRONMENT_REVISION_UNKNOWN", preparedCommitted: false, authorization: "NOT_EVALUATED", storeRevision: current.storeRevision };
        }
        if (existing.environmentStateRevision !== operation.environmentStateRevision) {
          return { status: "blocked", code: "NEXO_PREPARED_ENVIRONMENT_REVISION_MISMATCH", preparedCommitted: false, authorization: "NOT_EVALUATED", storeRevision: current.storeRevision };
        }
      }
      // Existing PREPARED is an unresolved obligation, never permission to redispatch.
      return { status: "prepared_existing", code: "NEXO_EFFECT_OUTCOME_UNKNOWN", preparedCommitted: false, authorization: "NOT_EVALUATED", storeRevision: current.storeRevision };
    }

    // A new PREPARED obligation is admitted only for a currently runnable step.
    // Keep this after the existing-obligation branch: replay of an unresolved
    // PREPARED entry must remain visible as unknown, not be reclassified by
    // later mission status changes.
    const reconstructedMission = reconstructNexoMissionFromSnapshot(current.snapshot, operation.missionId);
    if (mission.status !== "planned" || reconstructedMission?.status !== "planned") {
      return { status: "blocked", code: "NEXO_PREPARED_MISSION_NOT_RUNNABLE", preparedCommitted: false, authorization: "NOT_EVALUATED", storeRevision: current.storeRevision };
    }
    const reconstructedStep = reconstructedMission?.steps.find(candidateStep =>
      candidateStep?.id === operation.stepId
    );
    if (step.status !== "planned" || reconstructedStep?.status !== "planned") {
      return {
        status: "blocked",
        code: "NEXO_PREPARED_STEP_NOT_RUNNABLE",
        preparedCommitted: false,
        authorization: "NOT_EVALUATED",
        storeRevision: current.storeRevision
      };
    }
    const dependencies = Array.isArray(step.dependsOn) ? step.dependsOn : [];
    const dependenciesMet = dependencies.every(dependencyId =>
      reconstructedMission?.steps.some(candidateStep =>
        candidateStep?.id === dependencyId && candidateStep.status === "completed"
      ) === true
    );
    if (!dependenciesMet) {
      return {
        status: "blocked",
        code: "NEXO_PREPARED_DEPENDENCIES_UNMET",
        preparedCommitted: false,
        authorization: "NOT_EVALUATED",
        storeRevision: current.storeRevision
      };
    }

    candidate.effectJournal.push({
      idempotencyKey: operation.idempotencyKey,
      missionId: operation.missionId,
      stepId: operation.stepId,
      action: operation.action,
      target: structuredClone(operation.target ?? null),
      ...(REPAIR_ACTIONS.has(operation.action) ? { environmentStateRevision: operation.environmentStateRevision } : {}),
      status: "prepared",
      at: operation.at ?? new Date().toISOString()
    });
    assertNexoContinuitySnapshot(candidate);
    const committed = await store.commitIfCurrent(expectedRevision, candidate);
    if (committed.status === "committed" || committed.persistenceStatus === "committed") {
      // Persistence is confirmed even if lock release blocks the public handoff.
      // The outer status remains failed, so this receipt cannot authorize dispatch.
      return { ...committed, prepared: true, preparedCommitted: true, authorization: "NOT_EVALUATED" };
    }
    if (committed.status === "unknown" || committed.persistenceStatus === "unknown") {
      return { ...committed, prepared: false, preparedCommitted: "UNKNOWN", authorization: "NOT_EVALUATED" };
    }
    return { ...committed, prepared: false, preparedCommitted: false, authorization: "NOT_EVALUATED" };
  }

  /**
   * Persist adapter-result lineage in Nexo's own store without settling the
   * effect journal or asserting that the external effect is terminal.
   * PREPARED remains an unresolved obligation until an independent,
   * operation-specific reconciliation contract exists.
   */
  async function recordExecutionLineage({ expectedRevision, operation, result } = {}) {
    try {
      validateCallerRecord(operation, "NEXO_OPERATION_CONTEXT_INVALID");
      validateOperation(operation);
      validateCallerRecord(result, "NEXO_EXECUTION_RESULT_INVALID");
    }
    catch (error) { return { status: "failed", code: error?.code ?? "NEXO_OPERATION_CONTEXT_INVALID" }; }
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
      return { status: "failed", code: "NEXO_CONTINUITY_STORE_EXPECTED_REVISION_INVALID" };
    }
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      return { status: "failed", code: "NEXO_EXECUTION_RESULT_INVALID" };
    }

    let current;
    try {
      current = await store.loadCurrent();
    } catch (error) {
      return {
        status: "blocked",
        code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED",
        storeRevision: expectedRevision,
        uncertainty: "continuity_read_failed",
        lineageCommitted: false,
        journalSettled: false,
        authorization: "NOT_EVALUATED"
      };
    }
    if (current.storeRevision !== expectedRevision) {
      return { status: "conflict", code: "NEXO_CONTINUITY_STORE_REVISION_CONFLICT", storeRevision: current.storeRevision };
    }
    const mission = current.snapshot.missions.find(item => item?.missionId === operation.missionId);
    const step = mission?.steps?.find(item => item?.id === operation.stepId);
    if (!step) return { status: "blocked", code: "NEXO_EXECUTION_MISSION_CONTEXT_MISSING", storeRevision: current.storeRevision };
    if (step.action !== operation.action || !isDeepStrictEqual(step.target ?? null, operation.target ?? null)) {
      return { status: "blocked", code: "NEXO_EXECUTION_OPERATION_CONTEXT_MISMATCH", storeRevision: current.storeRevision };
    }

    const existing = current.snapshot.executions.find(item => item?.idempotencyKey === operation.idempotencyKey);
    if (existing) {
      const sameIdentity = existing.missionId === operation.missionId &&
        existing.stepId === operation.stepId &&
        existing.action === operation.action &&
        isDeepStrictEqual(existing.target ?? null, operation.target ?? null);
      if (!sameIdentity) return { status: "blocked", code: "NEXO_EXECUTION_IDENTITY_MISMATCH", storeRevision: current.storeRevision };
      if (REPAIR_ACTIONS.has(operation.action)) {
        const preparedMatches = current.snapshot.effectJournal.filter(item =>
          item?.idempotencyKey === operation.idempotencyKey
        );
        if (preparedMatches.length !== 1 ||
            !Number.isSafeInteger(preparedMatches[0]?.environmentStateRevision) ||
            preparedMatches[0].environmentStateRevision < 0 ||
            !Number.isSafeInteger(operation.environmentStateRevision) ||
            operation.environmentStateRevision < 0) {
          return {
            status: "blocked",
            code: "NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN",
            storeRevision: current.storeRevision,
            journalSettled: false,
            authorization: "NOT_EVALUATED"
          };
        }
        if (preparedMatches[0].environmentStateRevision !== operation.environmentStateRevision) {
          return {
            status: "blocked",
            code: "NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH",
            storeRevision: current.storeRevision,
            journalSettled: false,
            authorization: "NOT_EVALUATED"
          };
        }
      }
      if (!isDeepStrictEqual(existing.result, result)) {
        return {
          status: "blocked",
          code: "NEXO_EXECUTION_RESULT_MISMATCH",
          storeRevision: current.storeRevision,
          journalSettled: false,
          authorization: "NOT_EVALUATED"
        };
      }
      return { status: "already_recorded", storeRevision: current.storeRevision, journalSettled: false, authorization: "NOT_EVALUATED" };
    }

    // New execution lineage must correspond to exactly one already-persisted
    // PREPARED obligation. Lineage must not create an execution record for an
    // operation that Nexo never durably admitted for dispatch.
    const preparedMatches = current.snapshot.effectJournal.filter(item =>
      item?.idempotencyKey === operation.idempotencyKey
    );
    if (preparedMatches.length !== 1 || preparedMatches[0]?.status !== "prepared") {
      return { status: "blocked", code: "NEXO_EXECUTION_PREPARED_OBLIGATION_REQUIRED", storeRevision: current.storeRevision, journalSettled: false, authorization: "NOT_EVALUATED" };
    }
    const prepared = preparedMatches[0];
    if (prepared.missionId !== operation.missionId ||
        prepared.stepId !== operation.stepId ||
        prepared.action !== operation.action ||
        !isDeepStrictEqual(prepared.target ?? null, operation.target ?? null)) {
      return { status: "blocked", code: "NEXO_EXECUTION_PREPARED_IDENTITY_MISMATCH", storeRevision: current.storeRevision, journalSettled: false, authorization: "NOT_EVALUATED" };
    }

    // Repair lineage must remain bound to the environment revision captured by
    // PREPARED. A later/current revision is not interchangeable with that
    // baseline, and legacy PREPARED entries without it cannot be upgraded by
    // a caller-supplied result.
    if (REPAIR_ACTIONS.has(operation.action)) {
      if (!Number.isSafeInteger(prepared.environmentStateRevision) || prepared.environmentStateRevision < 0 ||
          !Number.isSafeInteger(operation.environmentStateRevision) || operation.environmentStateRevision < 0) {
        return { status: "blocked", code: "NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN", storeRevision: current.storeRevision, journalSettled: false, authorization: "NOT_EVALUATED" };
      }
      if (prepared.environmentStateRevision !== operation.environmentStateRevision) {
        return { status: "blocked", code: "NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH", storeRevision: current.storeRevision, journalSettled: false, authorization: "NOT_EVALUATED" };
      }
    }

    let candidate;
    try {
      candidate = recordNexoExecutionInSnapshot(current.snapshot, {
        idempotencyKey: operation.idempotencyKey,
        missionId: operation.missionId,
        stepId: operation.stepId,
        action: operation.action,
        target: operation.target ?? null,
        result
      });
    } catch (error) {
      return { status: "failed", code: error?.code ?? "NEXO_EXECUTION_CONTEXT_INVALID", storeRevision: current.storeRevision };
    }
    // This deliberately records lineage only. In particular, it does not alter
    // effectJournal even if result.status says "completed" or "failed".
    const committed = await store.commitIfCurrent(expectedRevision, candidate);
    return { ...committed, journalSettled: false, authorization: "NOT_EVALUATED" };
  }

  /**
   * Persist an observation from a verifier fixed at owner construction.
   * This is an observation record, not causal attribution, authorization, or
   * permission to redispatch. UNKNOWN and invalid evidence leave PREPARED open.
   */
  async function reconcilePrepared({ expectedRevision, operation } = {}) {
    // Legacy/caller-supplied observations are not a trusted verifier contract.
    // Preserve the fail-closed API when no canonical operation context is supplied.
    if (!operation) {
      return { status: "blocked", code: "NEXO_EFFECT_RECONCILIATION_REQUIRED", verified: false, preparedCommitted: false, authorization: "NOT_EVALUATED" };
    }
    try {
      validateCallerRecord(operation, "NEXO_OPERATION_CONTEXT_INVALID");
      validateOperation(operation);
    } catch (error) { return { status: "failed", code: error?.code ?? "NEXO_OPERATION_CONTEXT_INVALID", preparedCommitted: false, authorization: "NOT_EVALUATED" }; }
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
      return { status: "failed", code: "NEXO_CONTINUITY_STORE_EXPECTED_REVISION_INVALID", preparedCommitted: false, authorization: "NOT_EVALUATED" };
    }
    // Repair actions already have a stricter, revision-bound verifier and
    // settlement contract. Do not relabel that repair-specific record as generic.
    if (REPAIR_ACTIONS.has(operation.action)) {
      return { status: "blocked", code: "NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED", preparedCommitted: false, journalSettled: false, authorization: "NOT_EVALUATED" };
    }
    const verifier = Object.hasOwn(verifierRegistry, operation.action) ? verifierRegistry[operation.action] : undefined;
    if (typeof verifier !== "function") {
      return { status: "blocked", code: "NEXO_EFFECT_RECONCILIATION_VERIFIER_UNAVAILABLE", preparedCommitted: false, journalSettled: false, authorization: "NOT_EVALUATED" };
    }

    let current;
    try {
      current = await store.loadCurrent();
    } catch (error) {
      return {
        status: "blocked",
        code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED",
        preparedCommitted: false,
        journalSettled: false,
        uncertainty: "continuity_read_failed",
        authorization: "NOT_EVALUATED"
      };
    }
    if (current.storeRevision !== expectedRevision) {
      // A previous call may have committed the observation but lost its
      // response. Recover only from the exact persisted operation identity;
      // never call the verifier again or infer causal attribution on replay.
      const replayMatches = current.snapshot.effectJournal.filter(item => item?.idempotencyKey === operation.idempotencyKey);
      const replayEntry = replayMatches.length === 1 ? replayMatches[0] : null;
      const sameReplayIdentity = replayEntry &&
        replayEntry.missionId === operation.missionId &&
        replayEntry.stepId === operation.stepId &&
        replayEntry.action === operation.action &&
        isDeepStrictEqual(replayEntry.target ?? null, operation.target ?? null);
      const replayReconciliation = replayEntry?.reconciliation;
      const replayObservedAt = replayReconciliation?.observedAt;
      const validReplayTimestamp = typeof replayObservedAt === "string" &&
        Number.isFinite(Date.parse(replayObservedAt)) &&
        new Date(replayObservedAt).toISOString() === replayObservedAt;
      const genericObservation = sameReplayIdentity &&
        replayEntry.status === "reconciled_observed" &&
        replayReconciliation &&
        ["applied", "not_applied"].includes(replayReconciliation.status) &&
        Number.isSafeInteger(replayReconciliation.observedRevision) &&
        replayReconciliation.observedRevision >= 0 &&
        typeof replayReconciliation.source === "string" &&
        replayReconciliation.source.trim() &&
        validObservationEvidence(replayReconciliation?.evidence) &&
        validReplayTimestamp;
      const chronicleSettlement = sameReplayIdentity &&
        operation.action === "chronicle_append" &&
        isValidNexoChronicleSettlementRecord(replayEntry);
      if (genericObservation || chronicleSettlement) {
        const recorded = genericObservation ? replayEntry.reconciliation : replayEntry.settlement;
        return {
          status: "already_observed",
          code: "NEXO_EFFECT_OBSERVATION_ALREADY_RECORDED",
          storeRevision: current.storeRevision,
          observation: recorded.status,
          observedRevision: recorded.observedRevision,
          source: recorded.source,
          preparedCommitted: false,
          observationCommitted: false,
          journalSettled: Boolean(chronicleSettlement),
          causalAttribution: "NOT_ESTABLISHED",
          redispatchAuthorized: false,
          authorization: "NOT_EVALUATED"
        };
      }
      return { status: "conflict", code: "NEXO_CONTINUITY_STORE_REVISION_CONFLICT", storeRevision: current.storeRevision, preparedCommitted: false, journalSettled: false, authorization: "NOT_EVALUATED" };
    }
    const matches = current.snapshot.effectJournal.filter(item => item?.idempotencyKey === operation.idempotencyKey);
    if (matches.length !== 1 || matches[0]?.status !== "prepared") {
      return { status: "blocked", code: "NEXO_EFFECT_PREPARED_OBLIGATION_REQUIRED", storeRevision: current.storeRevision, preparedCommitted: false, journalSettled: false, authorization: "NOT_EVALUATED" };
    }
    const prepared = matches[0];
    if (prepared.missionId !== operation.missionId || prepared.stepId !== operation.stepId ||
        prepared.action !== operation.action || !isDeepStrictEqual(prepared.target ?? null, operation.target ?? null)) {
      return { status: "blocked", code: "NEXO_EFFECT_PREPARED_IDENTITY_MISMATCH", storeRevision: current.storeRevision, preparedCommitted: false, journalSettled: false, authorization: "NOT_EVALUATED" };
    }

    let observation;
    try {
      observation = await verifier(structuredClone({
        idempotencyKey: operation.idempotencyKey,
        missionId: operation.missionId,
        stepId: operation.stepId,
        action: operation.action,
        target: operation.target ?? null
      }));
    } catch (error) {
      return { status: "blocked", code: "NEXO_EFFECT_RECONCILIATION_VERIFIER_FAILED", storeRevision: current.storeRevision, preparedCommitted: false, journalSettled: false, authorization: "NOT_EVALUATED" };
    }
    if (!observation || typeof observation !== "object" || Array.isArray(observation) ||
        !["applied", "not_applied", "unknown"].includes(observation.status) ||
        observation.idempotencyKey !== operation.idempotencyKey ||
        observation.action !== operation.action ||
        !isDeepStrictEqual(observation.target ?? null, operation.target ?? null) ||
        !Number.isSafeInteger(observation.observedRevision) || observation.observedRevision < 0 ||
        typeof observation.source !== "string" || !observation.source.trim()) {
      return { status: "blocked", code: "NEXO_EFFECT_RECONCILIATION_EVIDENCE_INVALID", storeRevision: current.storeRevision, preparedCommitted: false, journalSettled: false, authorization: "NOT_EVALUATED" };
    }
    if (observation.status === "unknown") {
      return { status: "blocked", code: "NEXO_EFFECT_RECONCILIATION_UNKNOWN", storeRevision: current.storeRevision, preparedCommitted: false, journalSettled: false, authorization: "NOT_EVALUATED" };
    }
    if (!Object.hasOwn(observation, "evidence") || !validObservationEvidence(observation.evidence)) {
      return {
        status: "blocked",
        code: "NEXO_EFFECT_RECONCILIATION_EVIDENCE_INVALID",
        storeRevision: current.storeRevision,
        preparedCommitted: false,
        journalSettled: false,
        authorization: "NOT_EVALUATED"
      };
    }

    // The verifier may take time. Reload immediately before CAS; never write
    // an observation against a stale snapshot or overwrite a concurrent change.
    let latest;
    try {
      latest = await store.loadCurrent();
    } catch (error) {
      return {
        status: "blocked",
        code: error?.code ?? "NEXO_CONTINUITY_RECHECK_FAILED",
        storeRevision: expectedRevision,
        preparedCommitted: false,
        journalSettled: false,
        uncertainty: "continuity_recheck_failed",
        authorization: "NOT_EVALUATED"
      };
    }
    if (latest.storeRevision !== expectedRevision) {
      return { status: "conflict", code: "NEXO_CONTINUITY_STORE_REVISION_CONFLICT", storeRevision: latest.storeRevision, preparedCommitted: false, journalSettled: false, authorization: "NOT_EVALUATED" };
    }
    const latestMatches = latest.snapshot.effectJournal.filter(item => item?.idempotencyKey === operation.idempotencyKey);
    if (latestMatches.length !== 1 || latestMatches[0]?.status !== "prepared" ||
        latestMatches[0].missionId !== operation.missionId || latestMatches[0].stepId !== operation.stepId ||
        latestMatches[0].action !== operation.action ||
        !isDeepStrictEqual(latestMatches[0].target ?? null, operation.target ?? null)) {
      return { status: "conflict", code: "NEXO_EFFECT_PREPARED_OBLIGATION_CHANGED", storeRevision: latest.storeRevision, preparedCommitted: false, journalSettled: false, authorization: "NOT_EVALUATED" };
    }
    let safeEvidence;
    let candidate;
    try {
      safeEvidence = structuredClone(observation.evidence ?? null);
      candidate = emptyCandidate(latest.snapshot);
      const entry = candidate.effectJournal.find(item => item?.idempotencyKey === operation.idempotencyKey);
      const chronicleApplied = operation.action === "chronicle_append" &&
        observation.status === "applied" &&
        observation.source === "nexo-chronicle-store";
      if (chronicleApplied) {
        entry.status = "settled_observed";
        entry.settlement = {
          status: "applied",
          observedRevision: observation.observedRevision,
          source: observation.source,
          evidence: safeEvidence,
          observedAt: new Date().toISOString()
        };
      } else {
        entry.status = "reconciled_observed";
        entry.reconciliation = {
          status: observation.status,
          observedRevision: observation.observedRevision,
          source: observation.source,
          evidence: safeEvidence,
          observedAt: new Date().toISOString()
        };
      }
      assertNexoContinuitySnapshot(candidate);
    } catch (error) {
      return { status: "blocked", code: "NEXO_EFFECT_RECONCILIATION_EVIDENCE_INVALID", storeRevision: latest.storeRevision, preparedCommitted: false, journalSettled: false, authorization: "NOT_EVALUATED" };
    }
    let committed;
    try {
      committed = await store.commitIfCurrent(expectedRevision, candidate);
    } catch (error) {
      // A store may throw after the durable replacement. Do not leak an
      // exception or guess whether the observation committed; the next call
      // must recover from the canonical journal without invoking the verifier
      // again.
      return {
        status: "blocked",
        code: error?.code ?? "NEXO_EFFECT_OBSERVATION_COMMIT_OUTCOME_UNKNOWN",
        storeRevision: expectedRevision,
        preparedCommitted: false,
        observationCommitted: "UNKNOWN",
        journalSettled: "UNKNOWN",
        uncertainty: "effect_observation_commit_outcome_unknown",
        authorization: "NOT_EVALUATED"
      };
    }
    if (committed.status !== "committed") {
      const observationCommitted = committed.persistenceStatus === "committed";
      const observationUnknown = committed.status === "unknown" || committed.persistenceStatus === "unknown";
      return {
        ...committed,
        preparedCommitted: false,
        observationCommitted: observationCommitted ? true : observationUnknown ? "UNKNOWN" : false,
        journalSettled: observationCommitted && chronicleApplied ? true : observationUnknown ? "UNKNOWN" : false,
        ...(observationCommitted ? {
          observation: observation.status,
          observedRevision: observation.observedRevision,
          source: observation.source,
          causalAttribution: "NOT_ESTABLISHED",
          redispatchAuthorized: false
        } : {}),
        authorization: "NOT_EVALUATED"
      };
    }
    return {
      ...committed,
      status: "observed",
      observation: observation.status,
      observedRevision: observation.observedRevision,
      source: observation.source,
      preparedCommitted: false,
      observationCommitted: true,
      journalSettled: operation.action === "chronicle_append" &&
        observation.status === "applied" && observation.source === "nexo-chronicle-store",
      causalAttribution: "NOT_ESTABLISHED",
      redispatchAuthorized: false,
      authorization: "NOT_EVALUATED"
    };
  }

  return Object.freeze({ loadCurrent, supportsReconciliation, reconstructMission, recordMission, recordOutcome, recordPrepared, recordExecutionLineage, reconcilePrepared });
}

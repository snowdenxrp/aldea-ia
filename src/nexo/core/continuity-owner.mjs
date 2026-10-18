import { isDeepStrictEqual } from "node:util";
import { NEXO_CONTINUITY_SCHEMA, assertNexoContinuitySnapshot } from "./continuity-snapshot.mjs";
import { recordNexoMissionInSnapshot, recordNexoExecutionInSnapshot, recordNexoOutcomeInSnapshot, reconstructNexoMissionFromSnapshot } from "./continuity-operations.mjs";

function ownerError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function validateOperation(operation) {
  if (!operation || typeof operation !== "object" ||
      typeof operation.idempotencyKey !== "string" || !operation.idempotencyKey.trim() ||
      typeof operation.missionId !== "string" || !operation.missionId.trim() ||
      typeof operation.stepId !== "string" || !operation.stepId.trim() ||
      typeof operation.action !== "string" || !operation.action.trim()) {
    throw ownerError("NEXO_OPERATION_CONTEXT_INVALID");
  }
  const expectedKey = `${operation.missionId}:${operation.stepId}`;
  if (operation.idempotencyKey !== expectedKey) {
    throw ownerError("NEXO_OPERATION_IDENTITY_MISMATCH");
  }
}

const REPAIR_ACTIONS = new Set(["repair_agent_state", "repair_agent_needs", "repair_resource_state"]);

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
export function createNexoContinuityOwner({ store } = {}) {
  if (!store || typeof store.loadCurrent !== "function" ||
      typeof store.commitIfCurrent !== "function") {
    throw ownerError("NEXO_CONTINUITY_STORE_REQUIRED");
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
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 ||
        !mission || typeof mission.missionId !== "string" || !mission.missionId.trim() ||
        !Array.isArray(mission.steps)) {
      return { status: "failed", code: "NEXO_MISSION_CONTEXT_INVALID" };
    }
    const current = await store.loadCurrent();
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

    const current = await store.loadCurrent();
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

    const unresolvedEffect = current.snapshot.effectJournal.some(item =>
      item?.missionId === outcome.missionId &&
      item?.stepId === outcome.stepId &&
      ["prepared", "settled_observed"].includes(item?.status)
    );
    if (unresolvedEffect && outcome.status === "completed") {
      return {
        status: "blocked",
        code: "NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED",
        storeRevision: current.storeRevision,
        journalSettled: false,
        authorization: "NOT_EVALUATED"
      };
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
    try { validateOperation(operation); }
    catch (error) { return { status: "failed", code: error?.code ?? "NEXO_OPERATION_CONTEXT_INVALID" }; }
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
      return { status: "failed", code: "NEXO_CONTINUITY_STORE_EXPECTED_REVISION_INVALID" };
    }

    if (REPAIR_ACTIONS.has(operation.action) &&
        (!Number.isSafeInteger(operation.environmentStateRevision) || operation.environmentStateRevision < 0)) {
      return { status: "blocked", code: "NEXO_PREPARED_ENVIRONMENT_REVISION_REQUIRED", preparedCommitted: false, authorization: "NOT_EVALUATED" };
    }

    const current = await store.loadCurrent();
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
    if (committed.status === "committed") return { ...committed, prepared: true, preparedCommitted: true, authorization: "NOT_EVALUATED" };
    return { ...committed, prepared: false, preparedCommitted: false, authorization: "NOT_EVALUATED" };
  }

  /**
   * Persist adapter-result lineage in Nexo's own store without settling the
   * effect journal or asserting that the external effect is terminal.
   * PREPARED remains an unresolved obligation until an independent,
   * operation-specific reconciliation contract exists.
   */
  async function recordExecutionLineage({ expectedRevision, operation, result } = {}) {
    try { validateOperation(operation); }
    catch (error) { return { status: "failed", code: error?.code ?? "NEXO_OPERATION_CONTEXT_INVALID" }; }
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
      return { status: "failed", code: "NEXO_CONTINUITY_STORE_EXPECTED_REVISION_INVALID" };
    }
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      return { status: "failed", code: "NEXO_EXECUTION_RESULT_INVALID" };
    }

    const current = await store.loadCurrent();
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

  async function reconcilePrepared() {
    return { status: "blocked", code: "NEXO_EFFECT_RECONCILIATION_REQUIRED", verified: false, preparedCommitted: false, authorization: "NOT_EVALUATED" };
  }

  return Object.freeze({ loadCurrent, reconstructMission, recordMission, recordOutcome, recordPrepared, recordExecutionLineage, reconcilePrepared });
}

import { isDeepStrictEqual } from "node:util";
import { NEXO_CONTINUITY_SCHEMA, assertNexoContinuitySnapshot } from "./continuity-snapshot.mjs";

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
    const existing = candidate.missions.find(item => item?.missionId === mission.missionId);
    if (existing) {
      if (isDeepStrictEqual(existing, mission)) {
        return { status: "already_recorded", storeRevision: current.storeRevision, preparedCommitted: false, authorization: "NOT_EVALUATED" };
      }
      return { status: "conflict", code: "NEXO_MISSION_ID_ALREADY_BOUND", storeRevision: current.storeRevision };
    }
    candidate.missions.push(structuredClone(mission));
    assertNexoContinuitySnapshot(candidate);
    return store.commitIfCurrent(expectedRevision, candidate);
  }

  async function recordPrepared({ expectedRevision, operation } = {}) {
    try { validateOperation(operation); }
    catch (error) { return { status: "failed", code: error?.code ?? "NEXO_OPERATION_CONTEXT_INVALID" }; }
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
      return { status: "failed", code: "NEXO_CONTINUITY_STORE_EXPECTED_REVISION_INVALID" };
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
      // Existing PREPARED is an unresolved obligation, never permission to redispatch.
      return { status: "prepared_existing", code: "NEXO_EFFECT_OUTCOME_UNKNOWN", preparedCommitted: false, authorization: "NOT_EVALUATED", storeRevision: current.storeRevision };
    }

    candidate.effectJournal.push({
      idempotencyKey: operation.idempotencyKey,
      missionId: operation.missionId,
      stepId: operation.stepId,
      action: operation.action,
      target: structuredClone(operation.target ?? null),
      status: "prepared",
      at: operation.at ?? new Date().toISOString()
    });
    assertNexoContinuitySnapshot(candidate);
    const committed = await store.commitIfCurrent(expectedRevision, candidate);
    if (committed.status === "committed") return { ...committed, prepared: true, preparedCommitted: true, authorization: "NOT_EVALUATED" };
    return { ...committed, prepared: false, preparedCommitted: false, authorization: "NOT_EVALUATED" };
  }

  async function reconcilePrepared() {
    return { status: "blocked", code: "NEXO_EFFECT_RECONCILIATION_REQUIRED", verified: false, preparedCommitted: false, authorization: "NOT_EVALUATED" };
  }

  return Object.freeze({ loadCurrent, recordMission, recordPrepared, reconcilePrepared });
}

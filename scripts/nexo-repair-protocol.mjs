import { isDeepStrictEqual } from "node:util";
import { prepareRepairAgainstPersistedState } from "./nexo-repair-preparation.mjs";
import { settlePreparedRepairFromPersistedState } from "./nexo-repair-settlement.mjs";

const REPAIR_ACTIONS = new Set([
  "repair_agent_state",
  "repair_agent_needs",
  "repair_resource_state"
]);

/**
 * Execute only a prepared convergent repair against the durable environment
 * revision recorded by Nexo. The in-memory repair is not durable until the
 * existing conditional persistState write succeeds.
 *
 * This deliberately does not settle Nexo PREPARED. A crash after environment
 * persistence but before a future settlement remains an explicit recovery case.
 */
export async function dispatchPreparedRepairProtocol({
  statePath,
  owner,
  idempotencyKey,
  savedAt = Date.now(),
  loadStateStrict,
  persistState,
  createSimulationContext,
  adapterFactory,
  postconditionFactory
} = {}) {
  if (!owner || typeof owner.loadCurrent !== "function" ||
      typeof idempotencyKey !== "string" || !idempotencyKey.trim() ||
      typeof loadStateStrict !== "function" || typeof persistState !== "function" ||
      typeof createSimulationContext !== "function" || typeof adapterFactory !== "function" ||
      typeof postconditionFactory !== "function") {
    return { status: "blocked", code: "NEXO_PREPARED_OWNER_AND_KEY_REQUIRED", persisted: false };
  }

  let continuity;
  try {
    continuity = await owner.loadCurrent();
  } catch (error) {
    return { status: "blocked", code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED", persisted: false };
  }
  const matches = continuity.snapshot.effectJournal.filter(entry => entry?.idempotencyKey === idempotencyKey);
  if (matches.length !== 1 || matches[0]?.status !== "prepared") {
    return { status: "blocked", code: "NEXO_PREPARED_JOURNAL_ENTRY_UNKNOWN", persisted: false };
  }
  const preparedOperation = matches[0];
  const action = preparedOperation.action;
  const target = preparedOperation.target ?? null;
  const expectedRevision = preparedOperation.environmentStateRevision;
  if (!REPAIR_ACTIONS.has(action) ||
      typeof preparedOperation.missionId !== "string" ||
      typeof preparedOperation.stepId !== "string") {
    return { status: "blocked", code: "NEXO_REPAIR_OPERATION_CONTEXT_INVALID", persisted: false };
  }
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
    return { status: "blocked", code: "NEXO_PREPARED_ENVIRONMENT_REVISION_UNKNOWN", persisted: false };
  }

  let snapshot;
  try {
    snapshot = await loadStateStrict(statePath);
  } catch (error) {
    return { status: "blocked", code: error?.code ?? "NEXO_PERSISTED_ENVIRONMENT_LOAD_FAILED", persisted: false };
  }

  if (snapshot.stateRevision !== expectedRevision) {
    return {
      status: "blocked",
      code: "NEXO_PREPARED_ENVIRONMENT_REVISION_STALE",
      expectedStateRevision: expectedRevision,
      currentStateRevision: snapshot.stateRevision,
      persisted: false
    };
  }

  // Keep this repair-only execution object tied to the exact strict-loaded
  // snapshot. Do not use applyState(), which performs broader simulation recovery.
  const simulation = createSimulationContext(snapshot);
  let result;
  try {
    const adapter = adapterFactory(simulation);
    result = await adapter.execute({
      missionId: preparedOperation.missionId,
      stepId: preparedOperation.stepId,
      action,
      target,
      idempotencyKey: preparedOperation.idempotencyKey,
      postcondition: postconditionFactory(simulation, action, target)
    });
  } catch (error) {
    // The adapter may have applied an effect before throwing. Keep PREPARED
    // durable and require reconciliation; never imply non-execution or retry.
    return {
      status: "blocked",
      code: "NEXO_REPAIR_ADAPTER_OUTCOME_UNKNOWN",
      persisted: false,
      environmentStateRevision: expectedRevision,
      uncertainty: "adapter_call_may_have_applied_effect_before_throwing",
      error: String(error?.message ?? error)
    };
  }

  if (result.status !== "completed") {
    return {
      ...result,
      persisted: false,
      environmentStateRevision: expectedRevision,
      uncertainty: result.uncertainty ?? "repair_not_durably_committed"
    };
  }

  const stateChanged = result.effectResult?.stateChanged === true;
  if (!stateChanged) {
    return {
      ...result,
      persisted: false,
      stateChanged: false,
      environmentStateRevision: expectedRevision,
      note: "desired_state_already_satisfied_or_no_persisted_change"
    };
  }

  try {
    const persisted = await persistState(statePath, simulation, savedAt, {
      expectedRevision,
      stateRevision: expectedRevision + 1,
      loadCurrentState: loadStateStrict
    });
    return {
      ...result,
      persisted: true,
      stateChanged: true,
      previousEnvironmentStateRevision: expectedRevision,
      environmentStateRevision: persisted.stateRevision
    };
  } catch (error) {
    return {
      status: "blocked",
      code: error?.code === "STATE_REVISION_CONFLICT"
        ? "NEXO_REPAIR_ENVIRONMENT_REVISION_CONFLICT"
        : "NEXO_REPAIR_PERSIST_OUTCOME_UNKNOWN",
      persisted: false,
      expectedStateRevision: expectedRevision,
      uncertainty: "prepared_repair_must_be_reconciled_before_retry"
    };
  }
}

/**
 * Single entrypoint for convergent repair actions only.
 *
 * Existing PREPARED obligations are reconciled against persisted state first.
 * Redispatch is considered only when the strict environment remains at the
 * exact baseline revision captured by PREPARED and the desired invariant is
 * not already present. Any unrelated/newer revision fails closed.
 *
 * This is not a cross-store transaction and does not complete the mission.
 */
export async function runNexoRepairOnceProtocol({
  owner,
  store,
  statePath,
  expectedContinuityRevision,
  operation,
  savedAt = Date.now(),
  loadStateStrict,
  persistState,
  createSimulationContext,
  adapterFactory,
  postconditionFactory
} = {}) {
  if (!owner || typeof owner.loadCurrent !== "function" ||
      typeof loadStateStrict !== "function" || typeof persistState !== "function" ||
      typeof createSimulationContext !== "function" || typeof adapterFactory !== "function" ||
      typeof postconditionFactory !== "function" ||
      !store || typeof store.loadCurrent !== "function" ||
      typeof store.commitIfCurrent !== "function" ||
      !Number.isSafeInteger(expectedContinuityRevision) || expectedContinuityRevision < 0 ||
      typeof operation?.idempotencyKey !== "string" || !operation.idempotencyKey.trim()) {
    return { status: "blocked", code: "NEXO_REPAIR_ENTRYPOINT_CONTEXT_INVALID", persisted: false };
  }

  let current;
  try {
    current = await owner.loadCurrent();
  } catch (error) {
    return { status: "blocked", code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED", persisted: false };
  }
  const matches = current.snapshot.effectJournal.filter(
    entry => entry?.idempotencyKey === operation.idempotencyKey
  );
  if (matches.length > 1) {
    return { status: "blocked", code: "NEXO_REPAIR_JOURNAL_IDENTITY_AMBIGUOUS", persisted: false };
  }

  let preparedNew = false;
  let prepared = matches[0] ?? null;
  if (!prepared) {
    const preparation = await prepareRepairAgainstPersistedState({
      owner,
      statePath,
      expectedContinuityRevision,
      operation
    });
    if (preparation.status !== "committed" || preparation.preparedCommitted !== true) {
      return {
        status: "blocked",
        code: preparation.code ?? "NEXO_REPAIR_PREPARATION_NOT_COMMITTED",
        preparation,
        persisted: false,
        dispatched: false,
        ...(preparation.uncertainty ? { uncertainty: preparation.uncertainty } : {})
      };
    }
    preparedNew = true;
    try {
      current = await owner.loadCurrent();
    } catch (error) {
      // PREPARED was confirmed committed by the preparation result. If the
      // follow-up read fails, do not let the exception escape or dispatch from
      // stale state; preserve the obligation for a later recovery invocation.
      return {
        status: "blocked",
        code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED",
        preparation,
        preparedCommitted: true,
        dispatched: false,
        persisted: false,
        uncertainty: "prepared_commit_confirmed_but_journal_reload_unconfirmed"
      };
    }
    prepared = current.snapshot.effectJournal.find(
      entry => entry?.idempotencyKey === operation.idempotencyKey
    ) ?? null;
  } else if (prepared.status !== "prepared") {
    return { status: "blocked", code: "NEXO_PREPARED_JOURNAL_ENTRY_UNKNOWN", persisted: false, journalStatus: prepared.status };
  }

  if (!prepared || prepared.status !== "prepared") {
    return { status: "blocked", code: "NEXO_REPAIR_PREPARED_RECORD_NOT_FOUND", persisted: false };
  }
  if (operation.idempotencyKey !== `${operation.missionId}:${operation.stepId}` ||
      prepared.missionId !== operation.missionId ||
      prepared.stepId !== operation.stepId ||
      prepared.action !== operation.action ||
      !isDeepStrictEqual(prepared.target ?? null, operation.target ?? null)) {
    return { status: "blocked", code: "NEXO_REPAIR_OPERATION_CONTEXT_MISMATCH", persisted: false };
  }

  // A previously existing PREPARED record may represent a crash at any point.
  // Observe durable state before considering any redispatch.
  if (!preparedNew) {
    const observed = await settlePreparedRepairFromPersistedState({
      store,
      statePath,
      idempotencyKey: operation.idempotencyKey,
      expectedContinuityRevision: current.storeRevision
    });
    if (observed.status === "settled_observed") {
      return { status: "recovered", phase: "settlement", settlement: observed, dispatched: false, persisted: false };
    }

    let environment;
    try {
      environment = await loadStateStrict(statePath);
    } catch (error) {
      return { status: "blocked", code: error?.code ?? "NEXO_PERSISTED_ENVIRONMENT_LOAD_FAILED", settlement: observed, persisted: false };
    }
    if (environment.stateRevision !== prepared.environmentStateRevision ||
        observed.code !== "NEXO_REPAIR_SETTLEMENT_INVARIANT_NOT_PROVEN") {
      return {
        status: "blocked",
        code: "NEXO_REPAIR_RECOVERY_REQUIRES_REVIEW",
        settlement: observed,
        expectedStateRevision: prepared.environmentStateRevision,
        currentStateRevision: environment.stateRevision,
        persisted: false
      };
    }
  }

  const dispatch = await dispatchPreparedRepairProtocol({
    owner,
    statePath,
    idempotencyKey: operation.idempotencyKey,
    savedAt,
    loadStateStrict,
    persistState,
    createSimulationContext,
    adapterFactory,
    postconditionFactory
  });
  if (dispatch.status !== "completed") {
    return { status: "blocked", code: dispatch.code ?? "NEXO_REPAIR_DISPATCH_NOT_CONFIRMED", dispatch, persisted: dispatch.persisted === true };
  }

  // Persist adapter-result lineage separately from settlement. This is an
  // audit record only: the owner method cannot settle PREPARED or authenticate
  // caller-provided verification labels. Bind it to the original PREPARED
  // environment revision, then independently observe the durable environment.
  let afterDispatch;
  try {
    afterDispatch = await owner.loadCurrent();
  } catch (error) {
    return {
      status: "blocked",
      code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED",
      dispatch,
      persisted: true,
      uncertainty: "environment_persisted_but_lineage_and_settlement_unconfirmed"
    };
  }
  const preparedAfterDispatch = afterDispatch.snapshot.effectJournal.filter(
    entry => entry?.idempotencyKey === operation.idempotencyKey
  );
  if (preparedAfterDispatch.length !== 1 || preparedAfterDispatch[0]?.status !== "prepared") {
    return {
      status: "blocked",
      code: "NEXO_REPAIR_PREPARED_RECORD_NOT_FOUND_AFTER_DISPATCH",
      dispatch,
      persisted: true,
      uncertainty: "environment_persisted_but_lineage_and_settlement_unconfirmed"
    };
  }
  const preparedOperation = preparedAfterDispatch[0];
  if (typeof owner.recordExecutionLineage !== "function") {
    return {
      status: "blocked",
      code: "NEXO_REPAIR_EXECUTION_LINEAGE_API_UNAVAILABLE",
      dispatch,
      persisted: true,
      uncertainty: "environment_persisted_but_lineage_and_settlement_unconfirmed"
    };
  }
  let lineage;
  try {
    lineage = await owner.recordExecutionLineage({
      expectedRevision: afterDispatch.storeRevision,
      operation: {
        idempotencyKey: preparedOperation.idempotencyKey,
        missionId: preparedOperation.missionId,
        stepId: preparedOperation.stepId,
        action: preparedOperation.action,
        target: preparedOperation.target ?? null,
        environmentStateRevision: preparedOperation.environmentStateRevision
      },
      result: {
        status: dispatch.status,
        code: dispatch.code ?? null,
        persisted: dispatch.persisted === true,
        stateChanged: dispatch.stateChanged === true,
        environmentStateRevision: dispatch.environmentStateRevision ??
          dispatch.previousEnvironmentStateRevision ??
          preparedOperation.environmentStateRevision
      }
    });
  } catch (error) {
    return {
      status: "blocked",
      code: error?.code ?? "NEXO_REPAIR_EXECUTION_LINEAGE_COMMIT_UNKNOWN",
      dispatch,
      persisted: dispatch.persisted === true,
      uncertainty: dispatch.persisted === true
        ? "environment_persisted_but_lineage_and_settlement_unconfirmed"
        : "lineage_and_settlement_unconfirmed_after_noop_observation"
    };
  }
  if (!["committed", "already_recorded"].includes(lineage.status)) {
    return {
      status: "blocked",
      code: "NEXO_REPAIR_EXECUTION_LINEAGE_NOT_CONFIRMED",
      dispatch,
      lineage,
      persisted: true,
      uncertainty: "environment_persisted_but_lineage_and_settlement_unconfirmed"
    };
  }

  let afterLineage;
  try {
    afterLineage = await owner.loadCurrent();
  } catch (error) {
    return {
      status: "blocked",
      code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED",
      dispatch,
      lineage,
      persisted: true,
      uncertainty: "environment_and_lineage_persisted_but_settlement_unconfirmed"
    };
  }
  let settlement;
  try {
    settlement = await settlePreparedRepairFromPersistedState({
      store,
      statePath,
      idempotencyKey: operation.idempotencyKey,
      expectedContinuityRevision: afterLineage.storeRevision
    });
  } catch (error) {
    // The environment and lineage may already be durable. A thrown settlement
    // commit must not escape or be represented as success; preserve the PREPARED
    // obligation for a later independent observation/recovery attempt.
    return {
      status: "blocked",
      code: error?.code ?? "NEXO_REPAIR_SETTLEMENT_COMMIT_UNKNOWN",
      dispatch,
      lineage,
      persisted: dispatch.persisted === true,
      uncertainty: "environment_persisted_but_continuity_settlement_unconfirmed"
    };
  }
  if (settlement.status !== "settled_observed") {
    return {
      status: "blocked",
      code: settlement.code ?? "NEXO_REPAIR_SETTLEMENT_NOT_CONFIRMED",
      dispatch,
      settlement,
      persisted: true,
      uncertainty: "environment_persisted_but_continuity_settlement_unconfirmed"
    };
  }

  return {
    status: "settled_observed",
    dispatch,
    settlement,
    persisted: dispatch.persisted === true,
    missionCompleted: false,
    causalAttribution: "not_claimed"
  };
}

const SESSION_REPAIR_ACTIONS = new Set([
  "repair_agent_state",
  "repair_agent_needs",
  "repair_resource_state"
]);

function blocked(code, extra = {}) {
  return { status: "blocked", code, persisted: false, ...extra };
}

/**
 * Canonical owner-backed session entry for one repair step.
 *
 * Mission, step, action, and target are derived from Nexo's persisted snapshot;
 * the caller selects only missionId and stepId. This is not a general runtime
 * and must not be used for non-repair or protected actions.
 */
export async function runNexoRepairSessionProtocol({
  owner,
  store,
  statePath,
  missionId,
  stepId,
  savedAt = Date.now(),
  loadStateStrict,
  persistState,
  createSimulationContext,
  adapterFactory,
  postconditionFactory
} = {}) {
  if (!owner || typeof owner.loadCurrent !== "function" ||
      typeof loadStateStrict !== "function" || typeof persistState !== "function" ||
      typeof createSimulationContext !== "function" || typeof adapterFactory !== "function" ||
      typeof postconditionFactory !== "function" ||
      !store || typeof store.loadCurrent !== "function" ||
      typeof store.commitIfCurrent !== "function" ||
      typeof statePath !== "string" || !statePath.trim() ||
      typeof missionId !== "string" || !missionId.trim() ||
      typeof stepId !== "string" || !stepId.trim()) {
    return blocked("NEXO_REPAIR_SESSION_CONTEXT_INVALID");
  }

  let current;
  try {
    current = await owner.loadCurrent();
  } catch (error) {
    return blocked(error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED");
  }

  const missions = current.snapshot.missions.filter(item => item?.missionId === missionId);
  if (missions.length !== 1) {
    return blocked(missions.length ? "NEXO_REPAIR_SESSION_MISSION_IDENTITY_AMBIGUOUS" : "NEXO_REPAIR_SESSION_MISSION_NOT_FOUND");
  }

  const mission = missions[0];
  const steps = (Array.isArray(mission.steps) ? mission.steps : []).filter(item => item?.id === stepId);
  if (steps.length !== 1) {
    return blocked(steps.length ? "NEXO_REPAIR_SESSION_STEP_IDENTITY_AMBIGUOUS" : "NEXO_REPAIR_SESSION_STEP_NOT_FOUND");
  }

  const step = steps[0];
  if (!SESSION_REPAIR_ACTIONS.has(step.action)) {
    return blocked("NEXO_REPAIR_SESSION_ACTION_NOT_ELIGIBLE", { action: step.action ?? null });
  }
  if (step.status !== "planned") {
    return blocked("NEXO_REPAIR_SESSION_STEP_NOT_RUNNABLE", { stepStatus: step.status ?? null });
  }
  if (!(step.dependsOn ?? []).every(dependencyId =>
    mission.steps.find(candidate => candidate?.id === dependencyId)?.status === "completed"
  )) {
    return blocked("NEXO_REPAIR_SESSION_DEPENDENCIES_UNMET");
  }

  const operation = {
    idempotencyKey: `${missionId}:${stepId}`,
    missionId,
    stepId,
    action: step.action,
    target: structuredClone(step.target ?? null)
  };

  // runNexoRepairOnce persists PREPARED before dispatch and revalidates operation
  // identity against the canonical journal. This session never accepts a
  // caller-supplied action/target and never widens the repair-only allowlist.
  return runNexoRepairOnceProtocol({
    owner,
    store,
    statePath,
    expectedContinuityRevision: current.storeRevision,
    operation,
    savedAt,
    loadStateStrict,
    persistState,
    createSimulationContext,
    adapterFactory,
    postconditionFactory
  });
}

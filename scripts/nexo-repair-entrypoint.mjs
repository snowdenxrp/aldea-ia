import { isDeepStrictEqual } from "node:util";
import { loadStateStrict } from "./simulate.mjs";
import { prepareRepairAgainstPersistedState } from "./nexo-repair-preparation.mjs";
import { dispatchPreparedRepair } from "./nexo-repair-dispatch.mjs";
import { settlePreparedRepairFromPersistedState } from "./nexo-repair-settlement.mjs";

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
export async function runNexoRepairOnce({
  owner,
  store,
  statePath,
  expectedContinuityRevision,
  operation,
  savedAt = Date.now()
} = {}) {
  if (!owner || typeof owner.loadCurrent !== "function" ||
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
      return { status: "blocked", code: preparation.code ?? "NEXO_REPAIR_PREPARATION_NOT_COMMITTED", preparation, persisted: false };
    }
    preparedNew = true;
    current = await owner.loadCurrent();
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

  const dispatch = await dispatchPreparedRepair({
    owner,
    statePath,
    idempotencyKey: operation.idempotencyKey,
    savedAt
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
  const lineage = await owner.recordExecutionLineage({
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
  const settlement = await settlePreparedRepairFromPersistedState({
    store,
    statePath,
    idempotencyKey: operation.idempotencyKey,
    expectedContinuityRevision: afterLineage.storeRevision
  });
  if (settlement.status !== "settled_observed") {
    return {
      status: "blocked",
      code: "NEXO_REPAIR_SETTLEMENT_NOT_CONFIRMED",
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

import { isValidNexoChronicleSettlementRecord } from "./chronicle-settlement-contract.mjs";
import { reconstructNexoMissionFromSnapshot } from "./continuity-operations.mjs";

/**
 * Nexo-owned, adapter-agnostic execution slice.
 *
 * This module deliberately has no imports from Lúmina, simulation, or the
 * assistant layer. Effect handlers and verifiers arrive only through the
 * explicit adapter/owner contracts supplied by the caller.
 */
const CANONICAL_REPAIR_ACTIONS = new Set(["repair_agent_state", "repair_agent_needs", "repair_resource_state"]);

async function recordChronicleTerminalOutcome({
  owner, operation, expectedRevision, dispatchAttempted, preparedCommitted,
  lineageCommitted, adapterResult = null, lineage = null, reconciliation = null
} = {}) {
  if (typeof owner?.recordOutcome !== "function") {
    return {
      status: "unknown", code: "NEXO_CHRONICLE_OUTCOME_WRITER_UNAVAILABLE",
      dispatchAttempted, preparedCommitted, lineageCommitted,
      journalSettled: reconciliation?.journalSettled === true,
      terminalOutcomeRecorded: false, redispatchAuthorized: false,
      adapterResult, lineage, reconciliation
    };
  }
  let outcome;
  try {
    outcome = await owner.recordOutcome({
      expectedRevision,
      outcome: {
        missionId: operation.missionId,
        stepId: operation.stepId,
        action: operation.action,
        target: operation.target ?? null,
        status: "completed",
        evidence: {
          verified: true,
          kind: "nexo-chronicle-persisted-invariant",
          source: reconciliation?.source ?? "nexo-chronicle-store",
          observedRevision: reconciliation?.observedRevision ?? null
        }
      }
    });
  } catch (error) {
    return {
      status: "unknown", code: error?.code ?? "NEXO_CHRONICLE_OUTCOME_COMMIT_UNKNOWN",
      dispatchAttempted, preparedCommitted, lineageCommitted,
      journalSettled: reconciliation?.journalSettled ?? false,
      terminalOutcomeRecorded: "UNKNOWN", redispatchAuthorized: false,
      adapterResult, lineage, reconciliation
    };
  }
  if (outcome?.persistenceStatus === "committed") {
    return {
      status: "blocked",
      code: outcome.code ?? "NEXO_CHRONICLE_OUTCOME_HANDOFF_UNSAFE",
      dispatchAttempted, preparedCommitted, lineageCommitted,
      journalSettled: reconciliation?.journalSettled === true,
      terminalOutcomeRecorded: true, redispatchAuthorized: false,
      adapterResult, lineage, reconciliation, outcome
    };
  }
  if (outcome?.persistenceStatus === "unknown") {
    return {
      status: "unknown",
      code: outcome.code ?? "NEXO_CHRONICLE_OUTCOME_COMMIT_UNKNOWN",
      dispatchAttempted, preparedCommitted, lineageCommitted,
      journalSettled: reconciliation?.journalSettled === true ? true : "UNKNOWN",
      terminalOutcomeRecorded: "UNKNOWN", redispatchAuthorized: false,
      adapterResult, lineage, reconciliation, outcome
    };
  }
  if (outcome?.status === "conflict") {
    return {
      status: "conflict", code: outcome.code ?? "NEXO_CHRONICLE_OUTCOME_COMMIT_CONFLICT",
      dispatchAttempted, preparedCommitted, lineageCommitted,
      journalSettled: reconciliation?.journalSettled === true,
      terminalOutcomeRecorded: false, redispatchAuthorized: false,
      adapterResult, lineage, reconciliation, outcome
    };
  }
  if (outcome?.status === "blocked" || outcome?.status === "failed") {
    return {
      status: "blocked", code: outcome.code ?? "NEXO_CHRONICLE_OUTCOME_NOT_RECORDED",
      dispatchAttempted, preparedCommitted, lineageCommitted,
      journalSettled: reconciliation?.journalSettled === true,
      terminalOutcomeRecorded: false, redispatchAuthorized: false,
      adapterResult, lineage, reconciliation, outcome
    };
  }
  if (outcome?.status !== "committed" && outcome?.status !== "already_recorded") {
    return {
      status: "unknown", code: outcome?.code ?? "NEXO_CHRONICLE_OUTCOME_NOT_CONFIRMED",
      dispatchAttempted, preparedCommitted, lineageCommitted,
      journalSettled: reconciliation?.journalSettled ?? false,
      terminalOutcomeRecorded: "UNKNOWN", redispatchAuthorized: false,
      adapterResult, lineage, reconciliation, outcome
    };
  }

  // A terminal outcome response is a commit receipt, not just a status string.
  // The real store advances exactly one revision on a new commit and keeps the
  // current revision for an identical already-recorded outcome. If the injected
  // owner cannot confirm that revision contract, the effect is already settled
  // but the terminal outcome remains UNKNOWN; never promote it to completed.
  const validExpectedRevision = Number.isSafeInteger(expectedRevision) && expectedRevision >= 0;
  const validOutcomeRevision = Number.isSafeInteger(outcome.storeRevision) && outcome.storeRevision >= 0;
  const outcomeRevisionConfirmed = validExpectedRevision && validOutcomeRevision &&
    (outcome.status === "committed"
      ? expectedRevision < Number.MAX_SAFE_INTEGER && outcome.storeRevision === expectedRevision + 1
      : outcome.storeRevision === expectedRevision);
  if (!outcomeRevisionConfirmed) {
    return {
      status: "unknown",
      code: "NEXO_CHRONICLE_OUTCOME_COMMIT_NOT_CONFIRMED",
      dispatchAttempted, preparedCommitted, lineageCommitted,
      journalSettled: reconciliation?.journalSettled === true,
      terminalOutcomeRecorded: "UNKNOWN", redispatchAuthorized: false,
      adapterResult, lineage, reconciliation, outcome
    };
  }

  return {
    status: "completed", code: "NEXO_CHRONICLE_APPEND_SETTLED",
    dispatchAttempted, preparedCommitted, lineageCommitted,
    journalSettled: true, terminalOutcomeRecorded: true, redispatchAuthorized: false,
    adapterResult, lineage, reconciliation, outcome
  };
}

async function executeNexoStepWithContinuityOwnerInternal({
  missionId, stepId, owner, adapter, context={}, precondition, postcondition, _executionState
}={}) {
  if (typeof missionId !== "string" || !missionId.trim() ||
      typeof stepId !== "string" || !stepId.trim() ||
      !owner || typeof owner.loadCurrent !== "function" ||
      typeof owner.recordPrepared !== "function" ||
      typeof owner.recordExecutionLineage !== "function" ||
      typeof owner.reconcilePrepared !== "function" ||
      typeof owner.supportsReconciliation !== "function" ||
      !adapter || typeof adapter.executePrepared !== "function" ||
      typeof adapter.supports !== "function" ||
      typeof adapter.supportsReconciliation !== "function") {
    return { status: "invalid", code: "NEXO_CANONICAL_RUNTIME_CONTEXT_INVALID", dispatchAttempted: false };
  }

  let current;
  try { current = await owner.loadCurrent(); }
  catch (error) {
    return { status: "blocked", code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED", dispatchAttempted: false };
  }
  const mission = current.snapshot?.missions?.find(item => item?.missionId === missionId);
  const step = mission?.steps?.find(item => item?.id === stepId);
  if (!step) return { status: "blocked", code: "NEXO_CANONICAL_RUNTIME_STEP_UNKNOWN", dispatchAttempted: false };
  const operation = {
    idempotencyKey: `${missionId}:${stepId}`,
    missionId, stepId, action: step.action, target: step.target ?? null
  };

  // Repair effects have a separate environment-revision-bound settlement
  // contract. Until that contract is wired through this owner-backed runtime,
  // reject them before PREPARED and before adapter dispatch.
  if (CANONICAL_REPAIR_ACTIONS.has(operation.action)) {
    return { status: "blocked", code: "NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED", dispatchAttempted: false };
  }

  // Chronicle is the only non-repair action with a demonstrated end-to-end
  // verifier + settlement + terminal-outcome contract in this runtime. A caller
  // installing an arbitrary handler/verifier must not enable another action.
  if (operation.action !== "chronicle_append") {
    return {
      status: "blocked",
      code: "NEXO_CANONICAL_RUNTIME_ACTION_NOT_ENABLED",
      dispatchAttempted: false,
      preparedCommitted: false,
      journalSettled: false,
      terminalOutcomeRecorded: false,
      redispatchAuthorized: false
    };
  }

  // Recover an existing Chronicle obligation by observation only. A restart must
  // never re-dispatch an append whose prior effect may already exist.
  if (operation.action === "chronicle_append") {
    const existing = current.snapshot.effectJournal.filter(item =>
      item?.idempotencyKey === operation.idempotencyKey
    );
    if (existing.length > 0) {
      if (existing.length !== 1) {
        return { status: "unknown", code: "NEXO_CHRONICLE_PREPARED_IDENTITY_AMBIGUOUS", dispatchAttempted: false, redispatchAuthorized: false };
      }
      const entry = existing[0];
      if (isValidNexoChronicleSettlementRecord(entry)) {
        return recordChronicleTerminalOutcome({
          owner, operation, expectedRevision: current.storeRevision,
          dispatchAttempted: false, preparedCommitted: true, lineageCommitted: true,
          reconciliation: {
            status: "observed", observation: "applied", journalSettled: true,
            source: entry.settlement.source, observedRevision: entry.settlement.observedRevision,
            storeRevision: current.storeRevision, recovered: true
          }
        });
      }
      if (entry.status === "prepared") {
        let recovered;
        try {
          recovered = await owner.reconcilePrepared({ expectedRevision: current.storeRevision, operation });
        } catch (error) {
          return {
            status: "unknown",
            code: error?.code ?? "NEXO_CHRONICLE_RECOVERY_UNKNOWN",
            dispatchAttempted: false,
            preparedCommitted: true,
            lineageCommitted: "UNKNOWN",
            journalSettled: "UNKNOWN",
            terminalOutcomeRecorded: false,
            redispatchAuthorized: false
          };
        }
        if (recovered?.status === "observed" && recovered.observation === "applied" && recovered.journalSettled === true) {
          return recordChronicleTerminalOutcome({
            owner, operation, expectedRevision: recovered.storeRevision,
            dispatchAttempted: false, preparedCommitted: true, lineageCommitted: "UNKNOWN",
            reconciliation: recovered
          });
        }
        return {
          status: "unknown", code: recovered?.code ?? "NEXO_CHRONICLE_RECOVERY_UNRESOLVED",
          dispatchAttempted: false, preparedCommitted: true,
          lineageCommitted: "UNKNOWN",
          journalSettled: recovered?.status === "unknown" ? "UNKNOWN" : false,
          terminalOutcomeRecorded: false, redispatchAuthorized: false, reconciliation: recovered
        };
      }
      return {
        status: "unknown", code: "NEXO_CHRONICLE_EXISTING_OBLIGATION_UNRESOLVED",
        dispatchAttempted: false, preparedCommitted: true, journalSettled: false,
        terminalOutcomeRecorded: false, redispatchAuthorized: false
      };
    }
  }

  // Capability checks happen before PREPARED and before any handler can run.
  if (!adapter.supports(operation.action)) {
    return { status: "blocked", code: "NEXO_EFFECT_HANDLER_UNAVAILABLE", dispatchAttempted: false };
  }
  if (!adapter.supportsReconciliation(operation.action) ||
      !owner.supportsReconciliation(operation.action)) {
    return { status: "blocked", code: "NEXO_EFFECT_RECONCILIATION_VERIFIER_UNAVAILABLE", dispatchAttempted: false };
  }

  // A stored non-planned mission state must not be erased by reconstruction
  // recomputing an otherwise-planned step. Existing journal recovery returned
  // above and remains allowed to resolve an outstanding obligation.
  if (mission.status !== "planned") {
    return { status: "blocked", code: "NEXO_CANONICAL_RUNTIME_MISSION_NOT_RUNNABLE", dispatchAttempted: false };
  }

  // New dispatch is permitted only for a canonically reconstructed runnable
  // step. Recovery of an existing journal obligation returned above; this gate
  // prevents a caller from bypassing mission state or dependency ordering.
  let reconstructedMission;
  try {
    reconstructedMission = reconstructNexoMissionFromSnapshot(current.snapshot, missionId);
  } catch (error) {
    return {
      status: "blocked",
      code: error?.code ?? "NEXO_CANONICAL_RUNTIME_MISSION_STATE_INVALID",
      dispatchAttempted: false
    };
  }
  const reconstructedStep = reconstructedMission?.steps?.find(item => item?.id === stepId);
  if (!reconstructedMission || !reconstructedStep) {
    return { status: "blocked", code: "NEXO_CANONICAL_RUNTIME_STEP_UNKNOWN", dispatchAttempted: false };
  }
  if (reconstructedMission.status !== "planned" || reconstructedStep.status !== "planned") {
    return { status: "blocked", code: "NEXO_CANONICAL_RUNTIME_STEP_NOT_RUNNABLE", dispatchAttempted: false };
  }
  const dependencies = reconstructedStep.dependsOn ?? [];
  if (!Array.isArray(dependencies) ||
      dependencies.some(dependencyId =>
        reconstructedMission.steps.find(item => item?.id === dependencyId)?.status !== "completed")) {
    return { status: "blocked", code: "NEXO_CANONICAL_RUNTIME_DEPENDENCIES_UNRESOLVED", dispatchAttempted: false };
  }

  let prepared;
  try {
    prepared = await owner.recordPrepared({ expectedRevision: current.storeRevision, operation });
  } catch (error) {
    // The owner may have committed PREPARED before its response was lost.
    // Never dispatch without an explicit committed confirmation.
    return {
      status: "unknown",
      code: error?.code ?? "NEXO_PREPARED_COMMIT_OUTCOME_UNKNOWN",
      dispatchAttempted: false,
      preparedCommitted: "UNKNOWN"
    };
  }
  if (prepared?.status === "conflict") {
    return {
      status: "conflict",
      code: prepared.code ?? "NEXO_PREPARED_COMMIT_CONFLICT",
      dispatchAttempted: false,
      preparedCommitted: false,
      storeRevision: prepared.storeRevision,
      prepared
    };
  }
  if (prepared?.status === "unknown" || prepared?.preparedCommitted === "UNKNOWN" ||
      prepared?.persistenceStatus === "unknown") {
    return {
      status: "unknown",
      code: prepared.code ?? "NEXO_PREPARED_COMMIT_OUTCOME_UNKNOWN",
      dispatchAttempted: false,
      preparedCommitted: "UNKNOWN",
      journalSettled: false,
      terminalOutcomeRecorded: false,
      redispatchAuthorized: false,
      prepared
    };
  }
  if (prepared?.status !== "committed" || prepared.preparedCommitted !== true ||
      !Number.isSafeInteger(prepared.storeRevision) || prepared.storeRevision < 0 ||
      !Number.isSafeInteger(current.storeRevision) || current.storeRevision < 0 ||
      current.storeRevision >= Number.MAX_SAFE_INTEGER ||
      prepared.storeRevision !== current.storeRevision + 1) {
    return {
      status: "blocked",
      code: prepared?.code ?? "NEXO_PREPARED_COMMIT_NOT_CONFIRMED",
      dispatchAttempted: false,
      preparedCommitted: prepared?.persistenceStatus === "committed",
      journalSettled: false,
      terminalOutcomeRecorded: false,
      redispatchAuthorized: false,
      ...(typeof prepared?.phase === "string" ? { phase: prepared.phase } : {}),
      ...(typeof prepared?.writeStarted === "boolean" ? { writeStarted: prepared.writeStarted } : {}),
      ...(prepared?.lockRelease && typeof prepared.lockRelease === "object" ? { lockRelease: prepared.lockRelease } : {}),
      ...(Number.isSafeInteger(prepared?.storeRevision) ? { storeRevision: prepared.storeRevision } : {}),
      prepared
    };
  }

  let adapterResult;
  try {
    // From this point onward an adapter call may have produced an external effect.
    // The outer boundary uses this marker if an unexpected exception escapes.
    if (_executionState) _executionState.dispatchAttempted = true;
    adapterResult = await adapter.executePrepared({
      missionId, stepId, action: operation.action, target: operation.target,
      idempotencyKey: operation.idempotencyKey,
      preparedOperation: operation,
      context: step.context ?? context, precondition, postcondition
    }, { preparedCommit: prepared });
  } catch {
    // The effect may have happened before the adapter threw. Do not redispatch.
    // Do not expose raw adapter errors through the application result contract.
    return {
      status: "unknown",
      code: "NEXO_EFFECT_DISPATCH_OUTCOME_UNKNOWN",
      dispatchAttempted: true,
      preparedCommitted: true,
      lineageCommitted: false,
      journalSettled: false,
      terminalOutcomeRecorded: false,
      redispatchAuthorized: false
    };
  }

  let lineage;
  try {
    lineage = await owner.recordExecutionLineage({
      expectedRevision: prepared.storeRevision,
      operation,
      result: adapterResult && typeof adapterResult === "object"
        ? adapterResult
        : { status: "unknown", code: "NEXO_ADAPTER_RESULT_INVALID" }
    });
  } catch (error) {
    return {
      status: "unknown",
      code: error?.code ?? "NEXO_EXECUTION_LINEAGE_COMMIT_OUTCOME_UNKNOWN",
      dispatchAttempted: true,
      preparedCommitted: true,
      lineageCommitted: "UNKNOWN",
      journalSettled: false,
      terminalOutcomeRecorded: false,
      redispatchAuthorized: false,
      adapterResult
    };
  }
  if (lineage?.status !== "committed") {
    return {
      status: "unknown",
      code: lineage?.code ?? "NEXO_EXECUTION_LINEAGE_COMMIT_NOT_CONFIRMED",
      dispatchAttempted: true,
      preparedCommitted: true,
      lineageCommitted: lineage?.status === "unknown" || lineage?.persistenceStatus === "unknown"
        ? "UNKNOWN"
        : lineage?.persistenceStatus === "committed",
      journalSettled: false,
      terminalOutcomeRecorded: false,
      redispatchAuthorized: false,
      adapterResult,
      lineage
    };
  }

  // A committed lineage response must identify the exact successor revision
  // before it can be used as the reconciliation CAS baseline. The adapter has
  // already been called, so malformed confirmation is UNKNOWN, never a retry.
  if (!Number.isSafeInteger(prepared.storeRevision) ||
      prepared.storeRevision < 0 ||
      prepared.storeRevision >= Number.MAX_SAFE_INTEGER ||
      !Number.isSafeInteger(lineage.storeRevision) ||
      lineage.storeRevision !== prepared.storeRevision + 1) {
    return {
      status: "unknown",
      code: "NEXO_EXECUTION_LINEAGE_COMMIT_NOT_CONFIRMED",
      dispatchAttempted: true,
      preparedCommitted: true,
      lineageCommitted: "UNKNOWN",
      journalSettled: false,
      terminalOutcomeRecorded: false,
      redispatchAuthorized: false,
      adapterResult,
      lineage
    };
  }

  let reconciled;
  try {
    reconciled = await owner.reconcilePrepared({
      expectedRevision: lineage.storeRevision,
      operation
    });
  } catch (error) {
    return {
      status: "unknown",
      code: error?.code ?? "NEXO_EFFECT_RECONCILIATION_OUTCOME_UNKNOWN",
      dispatchAttempted: true,
      preparedCommitted: true,
      lineageCommitted: true,
      journalSettled: "UNKNOWN",
      terminalOutcomeRecorded: false,
      redispatchAuthorized: false,
      adapterResult,
      lineage
    };
  }
  if (operation.action === "chronicle_append" &&
      reconciled?.status === "observed" && reconciled.observation === "applied" &&
      reconciled.journalSettled === true) {
    return recordChronicleTerminalOutcome({
      owner, operation, expectedRevision: reconciled.storeRevision,
      dispatchAttempted: true, preparedCommitted: true, lineageCommitted: true,
      adapterResult, lineage, reconciliation: reconciled
    });
  }
  return {
    status: reconciled?.status === "observed" ? "observed" : "unknown",
    code: reconciled?.code ?? "NEXO_EFFECT_RECONCILIATION_REQUIRED",
    dispatchAttempted: true,
    preparedCommitted: true,
    lineageCommitted: true,
    journalSettled: reconciled?.journalSettled === true ? true :
      reconciled?.journalSettled === "UNKNOWN" || reconciled?.status === "unknown" ||
      reconciled?.persistenceStatus === "unknown" ? "UNKNOWN" : false,
    terminalOutcomeRecorded: false,
    redispatchAuthorized: false,
    adapterResult,
    lineage,
    reconciliation: reconciled
  };
}


/**
 * Stable public result contract for application callers. Missing flags are
 * explicit false; PREPARED commit uncertainty remains the distinct string
 * "UNKNOWN". This normalization reports state only and never authorizes retry.
 */
const OWNER_RUNTIME_METHODS = Object.freeze([
  "loadCurrent", "recordPrepared", "recordExecutionLineage",
  "reconcilePrepared", "supportsReconciliation"
]);
const ADAPTER_RUNTIME_METHODS = Object.freeze([
  "executePrepared", "supports", "supportsReconciliation"
]);

function readOwnerRuntimeOptions(args) {
  if (args === undefined) args = {};
  if (!args || typeof args !== "object" || Array.isArray(args)) return null;
  try {
    const prototype = Object.getPrototypeOf(args);
    if (prototype !== Object.prototype && prototype !== null) return null;
    const values = Object.create(null);
    for (const key of [
      "missionId", "stepId", "owner", "adapter", "context",
      "precondition", "postcondition"
    ]) {
      const descriptor = Object.getOwnPropertyDescriptor(args, key);
      if (!descriptor) continue;
      if (!descriptor.enumerable || !("value" in descriptor)) return null;
      values[key] = descriptor.value;
    }
    if (values.precondition !== undefined && typeof values.precondition !== "function") return null;
    if (values.postcondition !== undefined && typeof values.postcondition !== "function") return null;
    if (values.context === undefined) values.context = {};
    return values;
  } catch {
    return null;
  }
}

function findRuntimeDataMethod(source, key) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return { ok: false };
  let current = source;
  try {
    while (current && current !== Object.prototype) {
      const descriptor = Object.getOwnPropertyDescriptor(current, key);
      if (descriptor) {
        if (!("value" in descriptor) || typeof descriptor.value !== "function") {
          return { ok: false };
        }
        return { ok: true, method: descriptor.value };
      }
      current = Object.getPrototypeOf(current);
    }
  } catch {
    return { ok: false };
  }
  return { ok: true, method: null };
}

function createRuntimeCapabilityView(source, methodNames, optionalMethods = []) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  const view = Object.create(null);
  for (const key of [...methodNames, ...optionalMethods]) {
    const found = findRuntimeDataMethod(source, key);
    if (!found.ok) return null;
    if (!found.method) {
      if (optionalMethods.includes(key)) continue;
      return null;
    }
    Object.defineProperty(view, key, {
      enumerable: true,
      value: (...args) => Reflect.apply(found.method, source, args)
    });
  }
  return view;
}

/**
 * Stable public result contract for application callers. Inputs and capability
 * methods are read through data descriptors before runtime code can invoke them.
 * Missing flags are explicit false; UNKNOWN never authorizes retry.
 */
export async function executeNexoStepWithContinuityOwner(args = {}) {
  const input = readOwnerRuntimeOptions(args);
  if (!input) {
    return {
      status: "invalid",
      code: "NEXO_CANONICAL_RUNTIME_CONTEXT_INVALID",
      dispatchAttempted: false,
      preparedCommitted: false,
      lineageCommitted: false,
      journalSettled: false,
      terminalOutcomeRecorded: false,
      redispatchAuthorized: false
    };
  }

  const owner = createRuntimeCapabilityView(input.owner, OWNER_RUNTIME_METHODS, ["recordOutcome"]);
  const adapter = createRuntimeCapabilityView(input.adapter, ADAPTER_RUNTIME_METHODS);
  if (!owner || !adapter) {
    return {
      status: "invalid",
      code: "NEXO_CANONICAL_RUNTIME_CONTEXT_INVALID",
      dispatchAttempted: false,
      preparedCommitted: false,
      lineageCommitted: false,
      journalSettled: false,
      terminalOutcomeRecorded: false,
      redispatchAuthorized: false
    };
  }

  const executionState = { dispatchAttempted: false };
  let result;
  try {
    result = await executeNexoStepWithContinuityOwnerInternal({
      missionId: input.missionId,
      stepId: input.stepId,
      owner,
      adapter,
      context: input.context,
      precondition: input.precondition,
      postcondition: input.postcondition,
      _executionState: executionState
    });
  } catch {
    // A surprise before the dispatch boundary is a closed failure. After the
    // boundary, the effect may exist: preserve UNKNOWN and forbid redispatch.
    result = executionState.dispatchAttempted
      ? {
          status: "unknown", code: "NEXO_RUNTIME_OUTCOME_UNKNOWN",
          dispatchAttempted: true, preparedCommitted: true,
          lineageCommitted: "UNKNOWN", journalSettled: "UNKNOWN",
          terminalOutcomeRecorded: "UNKNOWN", redispatchAuthorized: false
        }
      : {
          status: "blocked", code: "NEXO_RUNTIME_INTERNAL_FAILURE",
          dispatchAttempted: false, redispatchAuthorized: false
        };
  }
  return {
    ...result,
    dispatchAttempted: result?.dispatchAttempted === true,
    preparedCommitted: result?.preparedCommitted ?? false,
    lineageCommitted: result?.lineageCommitted ?? false,
    journalSettled: result?.journalSettled ?? false,
    terminalOutcomeRecorded: result?.terminalOutcomeRecorded ?? false,
    redispatchAuthorized: result?.redispatchAuthorized === true
  };
}

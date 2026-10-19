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
  return {
    status: "completed", code: "NEXO_CHRONICLE_APPEND_SETTLED",
    dispatchAttempted, preparedCommitted, lineageCommitted,
    journalSettled: true, terminalOutcomeRecorded: true, redispatchAuthorized: false,
    adapterResult, lineage, reconciliation, outcome
  };
}

async function executeNexoStepWithContinuityOwnerInternal({
  missionId, stepId, owner, adapter, context={}, precondition, postcondition
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

  // Capability checks happen before PREPARED and before any handler can run.
  if (!adapter.supports(operation.action)) {
    return { status: "blocked", code: "NEXO_EFFECT_HANDLER_UNAVAILABLE", dispatchAttempted: false };
  }
  if (!adapter.supportsReconciliation(operation.action) ||
      !owner.supportsReconciliation(operation.action)) {
    return { status: "blocked", code: "NEXO_EFFECT_RECONCILIATION_VERIFIER_UNAVAILABLE", dispatchAttempted: false };
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
  if (prepared?.status === "unknown" || prepared?.preparedCommitted === "UNKNOWN") {
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
  if (prepared?.status !== "committed" || prepared.preparedCommitted !== true) {
    return {
      status: "blocked",
      code: prepared?.code ?? "NEXO_PREPARED_COMMIT_NOT_CONFIRMED",
      dispatchAttempted: false,
      preparedCommitted: false,
      journalSettled: false,
      terminalOutcomeRecorded: false,
      redispatchAuthorized: false,
      prepared
    };
  }

  let adapterResult;
  try {
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
      lineageCommitted: lineage?.status === "unknown" ? "UNKNOWN" : false,
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
    journalSettled: reconciled?.status === "unknown" ? "UNKNOWN" : false,
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
export async function executeNexoStepWithContinuityOwner(args = {}) {
  const result = await executeNexoStepWithContinuityOwnerInternal(args);
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

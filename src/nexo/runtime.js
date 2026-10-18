import { beginNexoStep, advanceNexoMission, replanNexoMission } from "./orchestrator.js";
import { recordNexoOutcome, recordNexoExecution, recordNexoPlan, reconstructNexoMission } from "../assistants/memory.js";
import { createLuminaEffectAdapter, createLuminaActionPostcondition, createLuminaEffectPostcondition } from "./simulation-adapter.js";
import { assertNexoContinuityMemoryShape } from "./core/continuity-contract.mjs";

const runtimeCommitLocks = new WeakMap();
const CANONICAL_REPAIR_ACTIONS = new Set(["repair_agent_state", "repair_agent_needs", "repair_resource_state"]);

// Replan only from the durable reconstructed mission; preserve the old attempt and
// persist the successor candidate before a caller can decide whether to execute it.
export function replanPersistedNexoMission({memory,previousMissionId,simulation=null,reports=[],reason=null}={}) {
  if(!memory || typeof previousMissionId!=="string" || !previousMissionId.trim())
    return {mission:null,memory,status:"invalid"};
  try {
    assertNexoContinuityMemoryShape(memory);
  } catch(error) {
    return {mission:null,memory,status:"not_replanned",code:error?.code??"NEXO_MEMORY_SCHEMA_UNKNOWN"};
  }
  const previousMission=reconstructNexoMission(memory,previousMissionId);
  if(!previousMission) return {mission:null,memory,status:"not_found"};
  // The durable effect journal is the recovery boundary across a crash window.
  // A stale/partial mission record must not authorize a successor while any
  // effect from that mission remains prepared and therefore outcome-unknown.
  const unresolvedPreparedEffect=Array.isArray(memory?.nexo?.effectJournal)
    && memory.nexo.effectJournal.some(entry=>entry?.missionId===previousMissionId&&entry?.status==="prepared");
  if(unresolvedPreparedEffect)
    return {mission:null,memory,status:"not_replanned",code:"EFFECT_RECONCILIATION_REQUIRED"};
  const observedSettlementNeedsGoalVerification=Array.isArray(memory?.nexo?.effectJournal)
    && memory.nexo.effectJournal.some(entry=>entry?.missionId===previousMissionId&&["settled_observed","reconciled_observed"].includes(entry?.status));
  if(observedSettlementNeedsGoalVerification)
    return {mission:null,memory,status:"not_replanned",code:memory.nexo.effectJournal.some(entry=>entry?.missionId===previousMissionId&&entry?.status==="reconciled_observed")?"NEXO_EFFECT_GOAL_VERIFICATION_REQUIRED":"NEXO_REPAIR_GOAL_VERIFICATION_REQUIRED"};
  const mission=replanNexoMission({previousMission,simulation,reports,memory,reason});
  if(!mission) return {mission:null,memory,status:"not_replanned"};
  const nextMemory=recordNexoPlan(memory,mission);
  return {mission,memory:nextMemory,status:"planned"};
}


async function commitRuntimeOutcome(memory, mission, stepId, adapterResult, outcome, evidence, started) {
  const commit = async () => {
    const currentMission = memory ? (reconstructNexoMission(memory, mission.missionId) ?? started) : started;
    const currentStep = currentMission?.steps?.find(s => s.id === stepId);
    if (currentStep && ["completed","failed","blocked"].includes(currentStep.status)) {
      return {mission:currentMission,memory,adapterResult,status:currentStep.status};
    }
    // The durable plan stores steps as planned until their outcome is recorded. A
    // successful effect can therefore reach this commit after reconstruction with
    // the same step back in "planned". Re-enter only this already-executed step so
    // advanceNexoMission can apply the authoritative outcome without weakening
    // dependency checks performed before the effect ran.
    if (currentStep && currentStep.status === "planned") {
      currentStep.status = "executing";
      currentMission.status = "executing";
      currentMission.objective = currentStep.action;
    }
    const advanced=advanceNexoMission(currentMission,{stepId,outcome,evidence});
    let nextMemory=recordNexoPlan(memory,currentMission);
    const action=currentStep?.action??started.steps.find(s=>s.id===stepId)?.action;
    const target=currentStep?.target??started.steps.find(s=>s.id===stepId)?.target;
    nextMemory=recordNexoExecution(nextMemory,{idempotencyKey:`${currentMission.missionId}:${stepId}`,missionId:currentMission.missionId,stepId,action,target,result:adapterResult});
    nextMemory=recordNexoOutcome(nextMemory,{missionId:currentMission.missionId,stepId,action,target,status:outcome,evidence,parentMissionId:currentMission.parentMissionId??null,replanReason:currentMission.replanReason??null});
    if(memory) Object.assign(memory,nextMemory);
    return {mission:advanced,memory:memory??nextMemory,adapterResult,status:outcome};
  };
  if(!memory)return commit();
  const previous=runtimeCommitLocks.get(memory)??Promise.resolve();
  const current=previous.then(commit,commit);
  runtimeCommitLocks.set(memory,current);
  try{return await current;}finally{if(runtimeCommitLocks.get(memory)===current)runtimeCommitLocks.delete(memory);}
}

export async function executeNexoStep({mission,stepId,adapter,memory=null,context={},precondition,postcondition}={}) {
  if(!mission?.missionId||!adapter?.execute)return{mission:null,memory,adapterResult:null,status:"invalid"};
  if(memory!==null&&memory!==undefined) {
    try {
      assertNexoContinuityMemoryShape(memory);
    } catch(error) {
      const code=error?.code??"NEXO_MEMORY_SCHEMA_UNKNOWN";
      return {mission,memory,adapterResult:{status:"blocked",code,verified:false},status:"blocked"};
    }
  }
  const started=beginNexoStep(mission,stepId); const step=started?.steps?.find(s=>s.id===stepId);
  if(!step||step.status!=="executing")return{mission:started,memory,adapterResult:null,status:"blocked"};
  const idempotencyKey=`${started.missionId}:${stepId}`;
  let adapterResult=await adapter.execute({missionId:started.missionId,stepId,action:step.action,target:step.target,idempotencyKey,context:step.context??context,precondition,postcondition});
  // A terminal status alone is not proof of a completed operation. Keep the
  // runtime's persisted execution/outcome aligned when an adapter omits either
  // verification signal; never record a positive completion from that response.
  if(adapterResult?.status==="completed" && !(adapterResult.verified===true && adapterResult.evidence?.verified===true)) {
    adapterResult={
      ...adapterResult,
      status:"blocked",
      code:"UNVERIFIED_COMPLETION_RESULT",
      verified:false,
      uncertainty:"completion_claim_not_verified"
    };
  }
  const outcome=adapterResult.status==="completed"?"completed":adapterResult.status==="blocked"||adapterResult.status==="unsupported"?"blocked":"failed";
  const evidence=adapterResult.code==="UNVERIFIED_COMPLETION_RESULT"?{verified:false,kind:"runtime-boundary",code:adapterResult.code,reason:"adapter completion lacked required verification signals",scope:{missionId:started.missionId,stepId,action:step.action,target:step.target??null}}:adapterResult.evidence??{verified:false,kind:"effect-result",code:adapterResult.code??null};
  return commitRuntimeOutcome(memory,mission,stepId,adapterResult,outcome,evidence,started);
}

/**
 * Canonical owner-backed execution slice for actions with a trusted verifier.
 * PREPARED must be committed before adapter dispatch. Any ambiguous result keeps
 * the obligation open; this path never retries and never declares a terminal
 * mission outcome from adapter status alone.
 *
 * Repair actions remain on their dedicated revision-bound settlement path.
 */
export async function executeNexoStepWithContinuityOwner({
  missionId, stepId, owner, adapter, context={}, precondition, postcondition
}={}) {
  if (typeof missionId !== "string" || !missionId.trim() ||
      typeof stepId !== "string" || !stepId.trim() ||
      !owner || typeof owner.loadCurrent !== "function" ||
      typeof owner.recordPrepared !== "function" ||
      typeof owner.recordExecutionLineage !== "function" ||
      typeof owner.reconcilePrepared !== "function" ||
      typeof owner.supportsReconciliation !== "function" ||
      !adapter || typeof adapter.execute !== "function" ||
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

  // Capability checks happen before PREPARED and before any handler can run.
  if (!adapter.supports(operation.action)) {
    return { status: "blocked", code: "NEXO_EFFECT_HANDLER_UNAVAILABLE", dispatchAttempted: false };
  }
  if (!adapter.supportsReconciliation(operation.action) ||
      !owner.supportsReconciliation(operation.action)) {
    return { status: "blocked", code: "NEXO_EFFECT_RECONCILIATION_VERIFIER_UNAVAILABLE", dispatchAttempted: false };
  }

  const prepared = await owner.recordPrepared({ expectedRevision: current.storeRevision, operation });
  if (prepared?.status !== "committed" || prepared.preparedCommitted !== true) {
    return {
      status: "blocked",
      code: prepared?.code ?? "NEXO_PREPARED_COMMIT_NOT_CONFIRMED",
      dispatchAttempted: false,
      prepared
    };
  }

  let adapterResult;
  try {
    adapterResult = await adapter.execute({
      missionId, stepId, action: operation.action, target: operation.target,
      idempotencyKey: operation.idempotencyKey,
      context: step.context ?? context, precondition, postcondition
    });
  } catch (error) {
    // The effect may have happened before the adapter threw. Do not redispatch.
    return {
      status: "unknown",
      code: "NEXO_EFFECT_DISPATCH_OUTCOME_UNKNOWN",
      dispatchAttempted: true,
      preparedCommitted: true,
      journalSettled: false,
      adapterError: String(error?.message ?? error)
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
      journalSettled: false,
      adapterResult
    };
  }
  if (lineage?.status !== "committed") {
    return {
      status: "unknown",
      code: lineage?.code ?? "NEXO_EXECUTION_LINEAGE_COMMIT_NOT_CONFIRMED",
      dispatchAttempted: true,
      preparedCommitted: true,
      journalSettled: false,
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
      journalSettled: false,
      terminalOutcomeRecorded: false,
      redispatchAuthorized: false,
      adapterResult,
      lineage
    };
  }
  return {
    status: reconciled?.status === "observed" ? "observed" : "unknown",
    code: reconciled?.code ?? "NEXO_EFFECT_RECONCILIATION_REQUIRED",
    dispatchAttempted: true,
    preparedCommitted: true,
    lineageCommitted: true,
    journalSettled: false,
    terminalOutcomeRecorded: false,
    redispatchAuthorized: false,
    adapterResult,
    lineage,
    reconciliation: reconciled
  };
}

export async function executeLuminaNexoStep({simulation,mission,stepId,memory=null,context={},precondition,postcondition,persistPreparedIntent=null}={}) {
  if(!simulation)return{mission:null,memory,adapterResult:null,status:"invalid"};
  const runtimeMemory=memory ?? null;
  const executionJournal=Array.isArray(runtimeMemory?.nexo?.effectJournal)?runtimeMemory.nexo.effectJournal:[];
  const adapter=createLuminaEffectAdapter(simulation,{executionJournal,persistPreparedIntent});
  const step=mission?.steps?.find(s=>s.id===stepId); const actionIntent=step?.context?.action??context?.action??null;
  const effectivePostcondition=postcondition??(step?.action==="execute_lumina_action"&&actionIntent?createLuminaActionPostcondition(simulation,actionIntent,step.target):["repair_agent_state","repair_agent_needs","repair_resource_state"].includes(step?.action)?createLuminaEffectPostcondition(simulation,step.action,step.target):undefined);
  return executeNexoStep({mission,stepId,adapter,memory:runtimeMemory,context,precondition,postcondition:effectivePostcondition});
}

import { beginNexoStep, advanceNexoMission, replanNexoMission } from "./orchestrator.js";
import { recordNexoOutcome, recordNexoExecution, recordNexoPlan, reconstructNexoMission } from "../assistants/memory.js";
import { createLuminaEffectAdapter, createLuminaActionPostcondition, createLuminaEffectPostcondition } from "./simulation-adapter.js";

const runtimeCommitLocks = new WeakMap();

// Replan only from the durable reconstructed mission; preserve the old attempt and
// persist the successor candidate before a caller can decide whether to execute it.
export function replanPersistedNexoMission({memory,previousMissionId,simulation=null,reports=[],reason=null}={}) {
  if(!memory || typeof previousMissionId!=="string" || !previousMissionId.trim())
    return {mission:null,memory,status:"invalid"};
  const previousMission=reconstructNexoMission(memory,previousMissionId);
  if(!previousMission) return {mission:null,memory,status:"not_found"};
  // The durable effect journal is the recovery boundary across a crash window.
  // A stale/partial mission record must not authorize a successor while any
  // effect from that mission remains prepared and therefore outcome-unknown.
  const unresolvedPreparedEffect=Array.isArray(memory?.nexo?.effectJournal)
    && memory.nexo.effectJournal.some(entry=>entry?.missionId===previousMissionId&&entry?.status==="prepared");
  if(unresolvedPreparedEffect)
    return {mission:null,memory,status:"not_replanned",code:"EFFECT_RECONCILIATION_REQUIRED"};
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
  const evidence=adapterResult.evidence??{verified:false,kind:"effect-result",code:adapterResult.code??null};
  return commitRuntimeOutcome(memory,mission,stepId,adapterResult,outcome,evidence,started);
}

export async function executeLuminaNexoStep({simulation,mission,stepId,memory=null,context={},precondition,postcondition,persistPreparedIntent=null}={}) {
  if(!simulation)return{mission:null,memory,adapterResult:null,status:"invalid"};
  const runtimeMemory=memory ?? simulation.nexoMemory ?? null;
  if(!simulation.nexoMemory && runtimeMemory) simulation.nexoMemory=runtimeMemory;
  const executionJournal=Array.isArray(runtimeMemory?.nexo?.effectJournal)?runtimeMemory.nexo.effectJournal:[];
  const adapter=createLuminaEffectAdapter(simulation,{executionJournal,persistPreparedIntent});
  const step=mission?.steps?.find(s=>s.id===stepId); const actionIntent=step?.context?.action??context?.action??null;
  const effectivePostcondition=postcondition??(step?.action==="execute_lumina_action"&&actionIntent?createLuminaActionPostcondition(simulation,actionIntent,step.target):["repair_agent_state","repair_agent_needs","repair_resource_state"].includes(step?.action)?createLuminaEffectPostcondition(simulation,step.action,step.target):undefined);
  return executeNexoStep({mission,stepId,adapter,memory:runtimeMemory,context,precondition,postcondition:effectivePostcondition});
}

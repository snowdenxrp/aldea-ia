import { beginNexoStep, advanceNexoMission } from "./orchestrator.js";
import { recordNexoOutcome, recordNexoExecution, recordNexoPlan, reconstructNexoMission } from "../assistants/memory.js";
import { createLuminaEffectAdapter, createLuminaActionPostcondition, createLuminaEffectPostcondition } from "./simulation-adapter.js";

const runtimeCommitLocks = new WeakMap();

async function commitRuntimeOutcome(memory, mission, stepId, adapterResult, outcome, evidence, started) {
  const commit = async () => {
    const currentMission = memory ? (reconstructNexoMission(memory, mission.missionId) ?? started) : started;
    const currentStep = currentMission?.steps?.find(s => s.id === stepId);
    if (currentStep && ["completed","failed","blocked"].includes(currentStep.status)) {
      return {mission:currentMission,memory,adapterResult,status:currentStep.status};
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
  const adapterResult=await adapter.execute({missionId:started.missionId,stepId,action:step.action,target:step.target,idempotencyKey,context:step.context??context,precondition,postcondition});
  const outcome=adapterResult.status==="completed"?"completed":adapterResult.status==="blocked"||adapterResult.status==="unsupported"?"blocked":"failed";
  const evidence=adapterResult.evidence??{verified:false,kind:"effect-result",code:adapterResult.code??null};
  return commitRuntimeOutcome(memory,mission,stepId,adapterResult,outcome,evidence,started);
}

export async function executeLuminaNexoStep({simulation,mission,stepId,memory=null,context={},precondition,postcondition}={}) {
  if(!simulation)return{mission:null,memory,adapterResult:null,status:"invalid"};
  const executionJournal=Array.isArray(memory?.nexo?.executions)?memory.nexo.executions:[];
  const adapter=createLuminaEffectAdapter(simulation,{executionJournal});
  const step=mission?.steps?.find(s=>s.id===stepId); const actionIntent=step?.context?.action??context?.action??null;
  const effectivePostcondition=postcondition??(step?.action==="execute_lumina_action"&&actionIntent?createLuminaActionPostcondition(simulation,actionIntent,step.target):["repair_agent_state","repair_agent_needs","repair_resource_state"].includes(step?.action)?createLuminaEffectPostcondition(simulation,step.action,step.target):undefined);
  return executeNexoStep({mission,stepId,adapter,memory,context,precondition,postcondition:effectivePostcondition});
}

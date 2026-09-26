import { beginNexoStep, advanceNexoMission } from "./orchestrator.js";
import { recordNexoOutcome, recordNexoExecution, recordNexoPlan } from "../assistants/memory.js";
import { createLuminaEffectAdapter, createLuminaActionPostcondition, createLuminaEffectPostcondition } from "./simulation-adapter.js";

export async function executeNexoStep({mission,stepId,adapter,memory=null,context={},precondition,postcondition}={}) {
  if(!mission?.missionId||!adapter?.execute)return{mission:null,memory,adapterResult:null,status:"invalid"};
  const started=beginNexoStep(mission,stepId); const step=started?.steps?.find(s=>s.id===stepId);
  if(!step||step.status!=="executing")return{mission:started,memory,adapterResult:null,status:"blocked"};
  const idempotencyKey=`${started.missionId}:${stepId}`;
  const adapterResult=await adapter.execute({missionId:started.missionId,stepId,action:step.action,target:step.target,idempotencyKey,context:step.context??context,precondition,postcondition});
  const outcome=adapterResult.status==="completed"?"completed":adapterResult.status==="blocked"||adapterResult.status==="unsupported"?"blocked":"failed";
  const evidence=adapterResult.evidence??{verified:false,kind:"effect-result",code:adapterResult.code??null};
  const advanced=advanceNexoMission(started,{stepId,outcome,evidence});
  let nextMemory=recordNexoPlan(memory,started);
  nextMemory=recordNexoExecution(nextMemory,{idempotencyKey,missionId:started.missionId,stepId,action:step.action,target:step.target,result:adapterResult});
  nextMemory=recordNexoOutcome(nextMemory,{missionId:started.missionId,stepId,action:step.action,target:step.target,status:outcome,evidence,parentMissionId:started.parentMissionId??null,replanReason:started.replanReason??null});
  return{mission:advanced,memory:nextMemory,adapterResult,status:outcome};
}

export async function executeLuminaNexoStep({simulation,mission,stepId,memory=null,context={},precondition,postcondition}={}) {
  if(!simulation)return{mission:null,memory,adapterResult:null,status:"invalid"};
  const executionJournal=Array.isArray(memory?.nexo?.executions)?memory.nexo.executions:[];
  const adapter=createLuminaEffectAdapter(simulation,{executionJournal});
  const step=mission?.steps?.find(s=>s.id===stepId); const actionIntent=step?.context?.action??context?.action??null;
  const effectivePostcondition=postcondition??(step?.action==="execute_lumina_action"&&actionIntent?createLuminaActionPostcondition(simulation,actionIntent,step.target):["repair_agent_state","repair_agent_needs","repair_resource_state"].includes(step?.action)?createLuminaEffectPostcondition(simulation,step.action,step.target):undefined);
  return executeNexoStep({mission,stepId,adapter,memory,context,precondition,postcondition:effectivePostcondition});
}

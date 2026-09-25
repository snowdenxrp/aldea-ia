import { beginNexoStep, advanceNexoMission } from "./orchestrator.js";
import { recordNexoOutcome } from "../assistants/memory.js";
import { createLuminaEffectAdapter } from "./simulation-adapter.js";

export async function executeNexoStep({
  mission,
  stepId,
  adapter,
  memory=null,
  context={},
  precondition,
  postcondition
}={}) {
  if(!mission?.missionId || !adapter?.execute) return {mission:null,memory,adapterResult:null,status:"invalid"};
  const started=beginNexoStep(mission,stepId);
  const step=started?.steps?.find(s=>s.id===stepId);
  if(!step || step.status!=="executing")
    return {mission:started,memory,adapterResult:null,status:"blocked"};

  const idempotencyKey=`${started.missionId}:${stepId}`;
  const adapterResult=await adapter.execute({
    missionId:started.missionId,stepId,action:step.action,target:step.target,
    idempotencyKey,context,precondition,postcondition
  });

  const outcome=adapterResult.status==="completed"
    ? "completed"
    : adapterResult.status==="blocked" || adapterResult.status==="unsupported"
      ? "blocked" : "failed";
  const evidence=adapterResult.evidence??{
    verified:false,
    kind:"effect-result",
    code:adapterResult.code??null
  };
  const advanced=advanceNexoMission(started,{stepId,outcome,evidence});
  const nextMemory=recordNexoOutcome(memory,{
    missionId:started.missionId,stepId,action:step.action,target:step.target,
    status:outcome,evidence
  });
  return {mission:advanced,memory:nextMemory,adapterResult,status:outcome};
}

// Bounded concrete bridge: Nexo mission runtime -> real Lúmina simulation state.
// Only the effects registered by createLuminaEffectAdapter are executable.
export async function executeLuminaNexoStep({
  simulation,
  mission,
  stepId,
  memory=null,
  context={},
  precondition,
  postcondition
}={}) {
  if(!simulation) return {mission:null,memory,adapterResult:null,status:"invalid"};
  const adapter=createLuminaEffectAdapter(simulation);
  return executeNexoStep({
    mission,stepId,adapter,memory,context,precondition,postcondition
  });
}

import assert from "node:assert/strict";
import { buildNexoMission } from "../../src/nexo/orchestrator.js";
import { createEffectAdapter } from "../../src/nexo/effect-adapter.js";
import { executeNexoStep } from "../../src/nexo/runtime.js";
import { createLearningMemory } from "../../src/assistants/memory.js";

const mission=buildNexoMission({reports:[{assistant:"Debugger",findings:[{severity:"error",code:"AGENT_POSITION",agent:"alex",message:"posición inválida"}]}]});
let version=1;
const adapter=createEffectAdapter({
  getStateVersion:()=>version,
  handlers:{
    repair_agent_state:async()=>{version++;return {status:"completed",details:"position repaired"};}
  }
});
const result=await executeNexoStep({
  mission,
  stepId:"step-1",
  adapter,
  memory:createLearningMemory(),
  precondition:({stateVersion})=>stateVersion===1,
  postcondition:({effectResult})=>effectResult.details==="position repaired"
});
assert.equal(result.status,"completed");
assert.equal(result.mission.steps[0].status,"completed");
assert.equal(result.memory.nexo.attempts.length,1);
assert.equal(result.memory.nexo.attempts[0].status,"completed");

const unsupportedMission=buildNexoMission({reports:[{findings:[{severity:"warning",code:"AGENT_POSITION",agent:"bruno",message:"bad"}]}]});
const unsupported=await executeNexoStep({mission:unsupportedMission,stepId:"step-1",adapter:createEffectAdapter(),memory:createLearningMemory()});
assert.equal(unsupported.status,"blocked");
assert.equal(unsupported.mission.status,"blocked");
assert.equal(unsupported.memory.nexo.attempts[0].status,"blocked");

console.log("Nexo: runtime bridge planner → effect adapter → evidence → durable outcome OK.");

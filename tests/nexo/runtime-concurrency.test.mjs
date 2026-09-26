import assert from "node:assert/strict";
import { executeNexoStep } from "../../src/nexo/runtime.js";
import { createEffectAdapter } from "../../src/nexo/effect-adapter.js";
import { buildNexoMission } from "../../src/nexo/orchestrator.js";
import { createLearningMemory } from "../../src/assistants/memory.js";

const mission=buildNexoMission({reports:[{findings:[
  {severity:"error",code:"REPAIR_A",message:"primer paso"},
  {severity:"warning",code:"REPAIR_B",message:"segundo paso"}
]}]});
mission.steps[0].action="repair_a";
mission.steps[1].action="repair_b";
const memory=createLearningMemory();
let version=0;
const adapter=createEffectAdapter({
  getStateVersion:()=>version,
  executionJournal:memory.nexo.executions,
  handlers:{
    repair_a:async()=>{version++;return{status:"completed",details:"a"};},
    repair_b:async()=>{version++;return{status:"completed",details:"b"};}
  }
});
const pre=({stateVersion})=>Number.isInteger(stateVersion);
const post=({effectResult})=>effectResult?.details==="a"||effectResult?.details==="b";

const [a,b]=await Promise.all([
  executeNexoStep({mission,stepId:"step-1",adapter,memory,precondition:pre,postcondition:post}),
  executeNexoStep({mission,stepId:"step-2",adapter,memory,precondition:pre,postcondition:post})
]);

assert.equal(memory.nexo.attempts.length,2);
assert.equal(memory.nexo.executions.length,2);
assert.equal(a.memory,memory);
assert.equal(b.memory,memory);
assert.equal(a.mission.steps[0].status,"completed");
assert.equal(a.mission.steps[1].status,"completed");
assert.equal(b.mission.steps[0].status,"completed");
assert.equal(b.mission.steps[1].status,"completed");
console.log("Nexo: concurrent runtime mission commits converge without lost step outcomes.");

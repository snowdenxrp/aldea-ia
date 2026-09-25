import assert from "node:assert/strict";
import { buildNexoMission, advanceNexoMission } from "../../src/nexo/orchestrator.js";
import { createEffectAdapter } from "../../src/nexo/effect-adapter.js";
import { executeNexoStep, executeLuminaNexoStep } from "../../src/nexo/runtime.js";
import { createLearningMemory } from "../../src/assistants/memory.js";

const mission=buildNexoMission({reports:[{assistant:"Debugger",findings:[{severity:"error",code:"AGENT_POSITION",agent:"alex",message:"posición inválida"}]}]});
let version=1;
const adapter=createEffectAdapter({getStateVersion:()=>version,handlers:{repair_agent_state:async()=>{version++;return {status:"completed",details:"position repaired"};}}});
const result=await executeNexoStep({mission,stepId:"step-1",adapter,memory:createLearningMemory(),precondition:({stateVersion})=>stateVersion===1,postcondition:({effectResult})=>effectResult.details==="position repaired"});
assert.equal(result.status,"completed");
assert.equal(result.mission.steps[0].status,"completed");
assert.equal(result.memory.nexo.attempts.length,1);
assert.equal(result.memory.nexo.attempts[0].status,"completed");

const unsupportedMission=buildNexoMission({reports:[{findings:[{severity:"warning",code:"AGENT_POSITION",agent:"bruno",message:"bad"}]}]});
const unsupported=await executeNexoStep({mission:unsupportedMission,stepId:"step-1",adapter:createEffectAdapter(),memory:createLearningMemory()});
assert.equal(unsupported.status,"blocked");
assert.equal(unsupported.mission.status,"blocked");
assert.equal(unsupported.memory.nexo.attempts[0].status,"blocked");

const simulation={agents:[{id:"alex",alive:true,position:{x:NaN,z:4},needs:{hunger:120,thirst:-4}}],world:{resources:{wood:{amount:-5},water:{amount:10}}}};
const luminaMission=buildNexoMission({reports:[{findings:[{severity:"error",code:"AGENT_POSITION",agent:"alex",message:"posición inválida"}]}]});
const lumina=await executeLuminaNexoStep({simulation,mission:luminaMission,stepId:"step-1",memory:createLearningMemory(),precondition:({stateVersion})=>stateVersion===0,postcondition:({effectResult})=>simulation.agents[0].position.x===0&&simulation.agents[0].position.z===4&&effectResult.agentId==="alex"});
assert.equal(lumina.status,"completed");
assert.equal(lumina.mission.steps[0].status,"completed");
assert.equal(lumina.memory.nexo.attempts[0].status,"completed");
assert.equal(simulation.nexoEffectRevision,1);

const actionSimulation={agents:[{id:"alex",alive:true,position:{x:0,z:0},needs:{hunger:40,thirst:0},inventory:[]}],world:{resources:{water:{amount:10}}}};
const actionMission=buildNexoMission({reports:[{findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:2},message:"sed detectada"}]}]});
const autoVerified=await executeLuminaNexoStep({simulation:actionSimulation,mission:actionMission,stepId:"step-1",memory:createLearningMemory(),precondition:({stateVersion})=>stateVersion===0});
assert.equal(autoVerified.status,"completed");
assert.equal(autoVerified.adapterResult.verified,true);
assert.equal(autoVerified.adapterResult.evidence.verified,true);
assert.equal(autoVerified.adapterResult.evidence.kind,"effect-postcondition");
assert.equal(actionSimulation.world.resources.water.amount,8);
assert.equal(actionSimulation.agents[0].needs.thirst,8);

const failureSimulation={agents:[{id:"alex",alive:true,position:{x:0,z:0},needs:{thirst:50},inventory:[]}],world:{resources:{water:{amount:0}}}};
const failureMission=buildNexoMission({reports:[{findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:2},message:"sed detectada"}]}]});
const failure=await executeLuminaNexoStep({simulation:failureSimulation,mission:failureMission,stepId:"step-1",memory:createLearningMemory(),precondition:({stateVersion})=>stateVersion===0});
assert.equal(failure.status,"failed");
assert.equal(failure.adapterResult.code,"LUMINA_ACTION_FAILED");
assert.equal(failure.mission.status,"needs_replan");
assert.equal(failure.mission.objective,"replan_after_failure");
assert.equal(failure.memory.nexo.attempts[0].status,"failed");
assert.equal(failureSimulation.nexoEffectRevision,0);

// The environment changes after the failure; a fresh mission must be built from
// the new observation instead of silently retrying the failed execution.
failureSimulation.world.resources.water.amount=10;
const replanned=buildNexoMission({
  simulation:failureSimulation,
  reports:[{assistant:"EnvironmentProbe",findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:2},message:"agua disponible tras cambio ambiental"}]}],
  memory:failure.memory
});
assert.notEqual(replanned.missionId,failure.mission.missionId);
assert.equal(replanned.steps[0].action,"execute_lumina_action");
assert.equal(replanned.steps[0].context.action.name,"drink");
assert.equal(replanned.status,"planned");

const invalidatedSimulation={agents:[{id:"alex",alive:true,position:{x:1,z:1}}],world:{resources:{wood:{amount:1}}}};
const invalidatedMission=buildNexoMission({reports:[{findings:[{severity:"error",code:"AGENT_POSITION",agent:"alex",message:"posición inválida"}]}]});
const invalidated=await executeLuminaNexoStep({simulation:invalidatedSimulation,mission:invalidatedMission,stepId:"step-1",memory:createLearningMemory(),precondition:async()=>{invalidatedSimulation.nexoEffectRevision=7;return true;},postcondition:()=>true});
assert.equal(invalidated.status,"blocked");
assert.equal(invalidated.adapterResult.code,"STATE_CHANGED_DURING_PRECONDITION");
assert.equal(invalidated.mission.status,"blocked");
assert.equal(invalidated.memory.nexo.attempts[0].status,"blocked");
assert.equal(invalidatedSimulation.agents[0].position.x,1);

console.log("Nexo: runtime bridge + automatic evidence + failure/replan flow OK.");

import assert from "node:assert/strict";
import { buildNexoMission } from "../../src/nexo/orchestrator.js";
import { createEffectAdapter } from "../../src/nexo/effect-adapter.js";
import { executeNexoStep, executeLuminaNexoStep } from "../../src/nexo/runtime.js";
import { createLearningMemory } from "../../src/assistants/memory.js";

const mission=buildNexoMission({reports:[{assistant:"Debugger",findings:[{severity:"error",code:"AGENT_POSITION",agent:"alex",message:"posición inválida"}]}]});
let version=1; const adapter=createEffectAdapter({getStateVersion:()=>version,handlers:{repair_agent_state:async()=>{version++;return{status:"completed",details:"position repaired"};}}});
const result=await executeNexoStep({mission,stepId:"step-1",adapter,memory:createLearningMemory(),precondition:({stateVersion})=>stateVersion===1,postcondition:({effectResult})=>effectResult.details==="position repaired"});
assert.equal(result.status,"completed"); assert.equal(result.mission.steps[0].status,"completed"); assert.equal(result.memory.nexo.attempts.length,1); assert.equal(result.memory.nexo.attempts[0].status,"completed");

const unsupportedMission=buildNexoMission({reports:[{findings:[{severity:"warning",code:"AGENT_POSITION",agent:"bruno",message:"bad"}]}]});
const unsupported=await executeNexoStep({mission:unsupportedMission,stepId:"step-1",adapter:createEffectAdapter(),memory:createLearningMemory()});
assert.equal(unsupported.status,"blocked"); assert.equal(unsupported.mission.status,"blocked"); assert.equal(unsupported.memory.nexo.attempts[0].status,"blocked");

const simulation={agents:[{id:"alex",alive:true,position:{x:NaN,z:4},needs:{hunger:120,thirst:-4}}],world:{resources:{wood:{amount:-5},water:{amount:10}}}};
const luminaMission=buildNexoMission({reports:[{findings:[{severity:"error",code:"AGENT_POSITION",agent:"alex",message:"posición inválida"}]}]});
const lumina=await executeLuminaNexoStep({simulation,mission:luminaMission,stepId:"step-1",memory:createLearningMemory(),precondition:({stateVersion})=>stateVersion===0,postcondition:({effectResult})=>simulation.agents[0].position.x===0&&simulation.agents[0].position.z===4&&effectResult.agentId==="alex"});
assert.equal(lumina.status,"completed"); assert.equal(lumina.mission.steps[0].status,"completed"); assert.equal(lumina.memory.nexo.attempts[0].status,"completed"); assert.equal(simulation.nexoEffectRevision,1);

const actionSimulation={agents:[{id:"alex",alive:true,position:{x:0,z:0},needs:{hunger:40,thirst:0},inventory:[]}],world:{resources:{water:{amount:10}}}};
const actionMission=buildNexoMission({reports:[{findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:2},message:"sed detectada"}]}]});
const durableMemory=createLearningMemory();
const autoVerified=await executeLuminaNexoStep({simulation:actionSimulation,mission:actionMission,stepId:"step-1",memory:durableMemory,precondition:({stateVersion})=>stateVersion===0});
assert.equal(autoVerified.status,"completed"); assert.equal(autoVerified.adapterResult.verified,true); assert.equal(actionSimulation.world.resources.water.amount,8); assert.equal(actionSimulation.agents[0].needs.thirst,8);
assert.equal(autoVerified.memory.nexo.executions.length,1); assert.equal(autoVerified.memory.nexo.executions[0].idempotencyKey,`${actionMission.missionId}:step-1`);

const waterAfterFirst=actionSimulation.world.resources.water.amount; const thirstAfterFirst=actionSimulation.agents[0].needs.thirst;
const restarted=await executeLuminaNexoStep({simulation:actionSimulation,mission:actionMission,stepId:"step-1",memory:autoVerified.memory,precondition:()=>{throw new Error("precondition must not run for persisted duplicate");}});
assert.equal(restarted.status,"completed"); assert.equal(restarted.adapterResult.verified,true); assert.equal(actionSimulation.world.resources.water.amount,waterAfterFirst); assert.equal(actionSimulation.agents[0].needs.thirst,thirstAfterFirst); assert.equal(restarted.memory.nexo.executions.length,1);

const failureSimulation={agents:[{id:"alex",alive:true,position:{x:0,z:0},needs:{thirst:50},inventory:[]}],world:{resources:{water:{amount:0}}}};
const failureMission=buildNexoMission({reports:[{findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:2},message:"sed detectada"}]}]});
const failure=await executeLuminaNexoStep({simulation:failureSimulation,mission:failureMission,stepId:"step-1",memory:createLearningMemory(),precondition:({stateVersion})=>stateVersion===0});
assert.equal(failure.status,"failed"); assert.equal(failure.adapterResult.code,"LUMINA_ACTION_FAILED"); assert.equal(failure.mission.status,"needs_replan"); assert.equal(failure.mission.objective,"replan_after_failure"); assert.equal(failure.memory.nexo.attempts[0].status,"failed"); assert.equal(failureSimulation.nexoEffectRevision,0);

failureSimulation.world.resources.water.amount=10;
const replanned=buildNexoMission({simulation:failureSimulation,reports:[{assistant:"EnvironmentProbe",findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:2},message:"agua disponible tras cambio ambiental"}]}],memory:failure.memory,parentMissionId:failure.mission.missionId,replanReason:"environment_changed"});
assert.notEqual(replanned.missionId,failure.mission.missionId); assert.equal(replanned.parentMissionId,failure.mission.missionId); assert.equal(replanned.replanReason,"environment_changed"); assert.equal(replanned.steps[0].action,"execute_lumina_action"); assert.equal(replanned.steps[0].context.action.name,"drink"); assert.equal(replanned.status,"planned");

const invalidatedSimulation={agents:[{id:"alex",alive:true,position:{x:1,z:1}}],world:{resources:{wood:{amount:1}}}};
const invalidatedMission=buildNexoMission({reports:[{findings:[{severity:"error",code:"AGENT_POSITION",agent:"alex",message:"posición inválida"}]}]});
const invalidated=await executeLuminaNexoStep({simulation:invalidatedSimulation,mission:invalidatedMission,stepId:"step-1",memory:createLearningMemory(),precondition:async()=>{invalidatedSimulation.nexoEffectRevision=7;return true;},postcondition:()=>true});
assert.equal(invalidated.status,"blocked"); assert.equal(invalidated.adapterResult.code,"STATE_CHANGED_DURING_PRECONDITION"); assert.equal(invalidated.mission.status,"blocked"); assert.equal(invalidated.memory.nexo.attempts[0].status,"blocked"); assert.equal(invalidatedSimulation.agents[0].position.x,1);


const multiSimulation={
  agents:[{id:"bruno",alive:true,position:{x:NaN,z:7},needs:{hunger:140,thirst:-2}}],
  world:{resources:{wood:{amount:1},water:{amount:5}}}
};
const multiMission=buildNexoMission({
  simulation:multiSimulation,
  reports:[{findings:[
    {severity:"error",code:"AGENT_POSITION",agent:"bruno",message:"posición inválida"},
    {severity:"warning",code:"INVALID_NEED",agent:"bruno",message:"necesidades fuera de rango"}
  ]}]
});
const multiMemory=createLearningMemory();
const firstMulti=await executeLuminaNexoStep({
  simulation:multiSimulation,mission:multiMission,stepId:"step-1",memory:multiMemory,
  precondition:({stateVersion})=>stateVersion===0
});
assert.equal(firstMulti.status,"completed");
assert.equal(firstMulti.mission.steps[0].status,"completed");
assert.equal(firstMulti.adapterResult.verified,true);
assert.equal(firstMulti.mission.objective,"repair_agent_needs");
const secondMulti=await executeLuminaNexoStep({
  simulation:multiSimulation,mission:firstMulti.mission,stepId:"step-2",memory:firstMulti.memory,
  precondition:({stateVersion})=>stateVersion===1
});
assert.equal(secondMulti.status,"completed");
assert.equal(secondMulti.mission.steps[1].status,"completed");
assert.equal(secondMulti.mission.status,"awaiting_verification");
assert.equal(secondMulti.memory.nexo.attempts.length,2);
assert.equal(multiSimulation.agents[0].position.x,0);
assert.equal(multiSimulation.agents[0].position.z,7);
assert.equal(multiSimulation.agents[0].needs.hunger,100);
assert.equal(multiSimulation.agents[0].needs.thirst,0);


const restartMemory=structuredClone(autoVerified.memory);
const restartedAfterSerialization=await executeLuminaNexoStep({
  simulation:actionSimulation,
  mission:actionMission,
  stepId:"step-1",
  memory:restartMemory,
  precondition:()=>{throw new Error("serialized execution must be replayed from the ledger");}
});
assert.equal(restartedAfterSerialization.status,"completed");
assert.equal(restartedAfterSerialization.adapterResult.verified,true);
assert.equal(actionSimulation.world.resources.water.amount,waterAfterFirst);
assert.equal(restartedAfterSerialization.memory.nexo.executions.length,1);

const chainedFailureSimulation={
  agents:[{id:"alex",alive:true,position:{x:0,z:0},needs:{thirst:50,energy:50},inventory:[]}],
  world:{resources:{water:{amount:0}}}
};
const chainedFailureMission=buildNexoMission({
  reports:[{findings:[
    {severity:"error",code:"LUMINA_ACTION",agent:"alex",action:{name:"rest",duration:1},message:"recuperación"},
    {severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:2},message:"sed"}
  ]}]
});
const chainedFirst=await executeLuminaNexoStep({
  simulation:chainedFailureSimulation,mission:chainedFailureMission,stepId:"step-1",
  memory:createLearningMemory(),precondition:({stateVersion})=>stateVersion===0
});
assert.equal(chainedFirst.status,"completed");
const chainedSecond=await executeLuminaNexoStep({
  simulation:chainedFailureSimulation,mission:chainedFirst.mission,stepId:"step-2",
  memory:chainedFirst.memory,precondition:({stateVersion})=>stateVersion===1
});
assert.equal(chainedSecond.status,"failed");
assert.equal(chainedSecond.mission.status,"needs_replan");
assert.equal(chainedSecond.mission.parentMissionId,null);
assert.equal(chainedSecond.memory.nexo.attempts.length,2);
chainedFailureSimulation.world.resources.water.amount=10;
const chainedReplan=buildNexoMission({
  simulation:chainedFailureSimulation,
  reports:[{findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:2},message:"agua restaurada"}]}],
  memory:chainedSecond.memory,
  parentMissionId:chainedSecond.mission.missionId,
  replanReason:"environment_changed_after_step_2_failure"
});
assert.equal(chainedReplan.parentMissionId,chainedSecond.mission.missionId);
assert.equal(chainedReplan.replanReason,"environment_changed_after_step_2_failure");


const recovered=await executeLuminaNexoStep({
  simulation:chainedFailureSimulation,
  mission:chainedReplan,
  stepId:"step-1",
  memory:chainedSecond.memory,
  precondition:({stateVersion})=>stateVersion===1
});
assert.equal(recovered.status,"completed");
assert.equal(recovered.adapterResult.verified,true);
assert.equal(chainedFailureSimulation.world.resources.water.amount,8);
assert.equal(recovered.memory.nexo.attempts.at(-1).status,"completed");
assert.equal(recovered.memory.nexo.attempts.at(-1).parentMissionId,chainedReplan.parentMissionId);
assert.equal(recovered.memory.nexo.attempts.at(-1).replanReason,chainedReplan.replanReason);
assert.equal(recovered.memory.nexo.missions.at(-1).missionId,chainedReplan.missionId);
assert.equal(recovered.memory.nexo.missions.at(-1).parentMissionId,chainedReplan.parentMissionId);
assert.equal(recovered.memory.nexo.missions.at(-1).replanReason,chainedReplan.replanReason);

console.log("Nexo: runtime bridge + automatic evidence + failure/replan + persisted idempotency + lineage OK.");

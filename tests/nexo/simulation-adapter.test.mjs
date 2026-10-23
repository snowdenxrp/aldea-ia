import assert from "node:assert/strict";
import { createLuminaEffectAdapter } from "../../src/nexo/simulation-adapter.js";

const simulation={
  agents:[{id:"alex",alive:true,position:{x:NaN,z:4},needs:{hunger:120,thirst:-4},inventory:[],skills:[]}],
  world:{resources:{wood:{amount:-5},water:{amount:10}}}
};
const adapter=createLuminaEffectAdapter(simulation);

const repaired=await adapter.execute({
  missionId:"m1",stepId:"s1",action:"repair_agent_state",target:"alex",idempotencyKey:"m1:s1",
  precondition:({stateVersion})=>stateVersion===0,
  postcondition:({effectResult})=>simulation.agents[0].position.x===0&&simulation.agents[0].position.z===4&&effectResult.agentId==="alex"
});
assert.equal(repaired.status,"completed");
assert.equal(repaired.verified,true);
assert.equal(simulation.nexoEffectRevision,1);

const needs=await adapter.execute({
  missionId:"m1",stepId:"s2",action:"repair_agent_needs",target:"alex",idempotencyKey:"m1:s2",
  precondition:({stateVersion})=>stateVersion===1,
  postcondition:()=>simulation.agents[0].needs.hunger===100&&simulation.agents[0].needs.thirst===0
});
assert.equal(needs.status,"completed");
assert.equal(needs.verified,true);
assert.equal(simulation.nexoEffectRevision,2);

// A second normalization with a distinct operation key is convergent:
// it must not manufacture a state revision when no data actually changes.
const needsAgain=await adapter.execute({
  missionId:"m1",stepId:"s2b",action:"repair_agent_needs",target:"alex",idempotencyKey:"m1:s2b",
  precondition:({stateVersion})=>stateVersion===2,
  postcondition:()=>simulation.agents[0].needs.hunger===100&&simulation.agents[0].needs.thirst===0
});
assert.equal(needsAgain.status,"completed");
assert.equal(needsAgain.verified,true);
assert.equal(needsAgain.effectResult.stateChanged,false);
assert.equal(simulation.nexoEffectRevision,2,"idempotent normalization must not fabricate a revision");

const stale=await adapter.execute({
  missionId:"m1",stepId:"s3",action:"repair_resource_state",target:"wood",idempotencyKey:"m1:s3",
  precondition:({stateVersion})=>stateVersion===0,
  postcondition:()=>true
});
assert.equal(stale.status,"blocked");
assert.equal(stale.code,"PRECONDITION_FAILED");
assert.equal(simulation.world.resources.wood.amount,-5);

const resource=await adapter.execute({
  missionId:"m1",stepId:"s3",action:"repair_resource_state",target:"wood",idempotencyKey:"m1:s4",
  precondition:({stateVersion})=>stateVersion===2,
  postcondition:({effectResult})=>simulation.world.resources.wood.amount===0&&effectResult.resourceId==="wood"
});
assert.equal(resource.status,"completed");
assert.equal(resource.verified,true);
assert.equal(simulation.nexoEffectRevision,3);

const sparseResourceSimulation={
  agents:[{id:"alex",alive:true,position:{x:0,z:0},needs:{hunger:50,thirst:50,energy:50,social:50,safety:50,health:100},inventory:[],skills:[]}],
  world:{resources:{wood:{}}}
};
const sparseResourceAdapter=createLuminaEffectAdapter(sparseResourceSimulation);
const sparseResource=await sparseResourceAdapter.execute({
  missionId:"m3",stepId:"s1",action:"repair_resource_state",target:"wood",idempotencyKey:"m3:s1",
  precondition:({stateVersion})=>stateVersion===0,
  postcondition:()=>sparseResourceSimulation.world.resources.wood.amount===0
});
assert.equal(sparseResource.status,"completed");
assert.equal(sparseResource.verified,true);
assert.equal(sparseResourceSimulation.world.resources.wood.amount,0);
assert.equal(sparseResourceSimulation.nexoEffectRevision,1);

const deadAgentSimulation={
  agents:[{id:"dead",alive:false,position:{x:NaN,z:Infinity},needs:{hunger:50,thirst:50,energy:50,social:50,safety:50,health:100},inventory:[],skills:[]}],
  world:{resources:{}}
};
const deadAgentAdapter=createLuminaEffectAdapter(deadAgentSimulation);
const deadRepair=await deadAgentAdapter.execute({
  missionId:"m4",stepId:"s1",action:"repair_agent_state",target:"dead",idempotencyKey:"m4:s1",
  precondition:({stateVersion})=>stateVersion===0,
  postcondition:({effectResult})=>deadAgentSimulation.agents[0].alive===false&&Number.isFinite(deadAgentSimulation.agents[0].position.x)&&Number.isFinite(deadAgentSimulation.agents[0].position.z)&&effectResult.agentId==="dead"
});
assert.equal(deadRepair.status,"completed");
assert.equal(deadRepair.verified,true);
assert.equal(deadAgentSimulation.agents[0].alive,false,"repair must not resurrect a dead agent");
assert.equal(deadAgentSimulation.agents[0].position.x,0);
assert.equal(deadAgentSimulation.agents[0].position.z,0);
assert.equal(deadAgentSimulation.nexoEffectRevision,1);

const unknownLifeSimulation={
  agents:[{id:"unknown-life",position:{x:NaN,z:Infinity},needs:{hunger:50,thirst:50,energy:50,social:50,safety:50,health:100},inventory:[],skills:[]}],
  world:{resources:{}}
};
const unknownLifeAdapter=createLuminaEffectAdapter(unknownLifeSimulation);
const unknownLifeRepair=await unknownLifeAdapter.execute({
  missionId:"m5",stepId:"s1",action:"repair_agent_state",target:"unknown-life",idempotencyKey:"m5:s1",
  precondition:({stateVersion})=>stateVersion===0,
  postcondition:()=>true
});
assert.equal(unknownLifeRepair.status,"blocked");
assert.equal(unknownLifeRepair.code,"EFFECT_OUTCOME_UNKNOWN");
assert.equal(unknownLifeSimulation.agents[0].alive,undefined,"unknown life state must not be inferred as alive");
assert.equal(Number.isNaN(unknownLifeSimulation.agents[0].position.x),true,"unknown life state blocks before mutation");
assert.equal(unknownLifeSimulation.nexoEffectRevision,0);

const action=await adapter.execute({
  missionId:"m1",stepId:"s4",action:"execute_lumina_action",target:"alex",idempotencyKey:"m1:s5",
  context:{action:{name:"drink",amount:2}},
  precondition:({stateVersion})=>stateVersion===3,
  postcondition:({effectResult})=>
    effectResult.action==="drink" &&
    simulation.world.resources.water.amount===8 &&
    simulation.agents[0].needs.thirst===8
});
assert.equal(action.status,"completed");
assert.equal(action.verified,true);
assert.equal(action.evidence.verified,true);
assert.equal(simulation.nexoEffectRevision,4);

const denied=await adapter.execute({
  missionId:"m1",stepId:"s5",action:"execute_lumina_action",target:"alex",idempotencyKey:"m1:s6",
  context:{action:{name:"unknown_action"}},
  precondition:({stateVersion})=>stateVersion===4,
  postcondition:()=>true
});
// The concrete handler rejects this action, but the generic adapter cannot
// treat a handler-returned failure as a trusted no-effect proof after dispatch.
assert.equal(denied.status,"blocked");
assert.equal(denied.code,"EFFECT_OUTCOME_UNKNOWN");
assert.equal(denied.uncertainty,"effect_may_or_may_not_have_occurred");

const depletedSimulation={
  agents:[{id:"bruno",alive:true,position:{x:0,z:0},needs:{thirst:50},inventory:[],skills:[]}],
  world:{resources:{water:{amount:0}}}
};
const depletedAdapter=createLuminaEffectAdapter(depletedSimulation);
const failed=await depletedAdapter.execute({
  missionId:"m2",stepId:"s1",action:"execute_lumina_action",target:"bruno",idempotencyKey:"m2:s1",
  context:{action:{name:"drink",amount:2}},
  precondition:({stateVersion})=>stateVersion===0,
  postcondition:()=>true
});
// A handler-reported failure does not prove absence of an external/partial effect.
 // The adapter preserves the operation as unresolved until an operation-specific
 // verifier can settle it; a stable local revision alone is not a no-effect proof.
assert.equal(failed.status,"blocked");
assert.equal(failed.code,"EFFECT_OUTCOME_UNKNOWN");
assert.equal(failed.uncertainty,"effect_may_or_may_not_have_occurred");
assert.equal(depletedSimulation.nexoEffectRevision,0);

console.log("Nexo: adaptador concreto de Lúmina con consecuencias reales, whitelist y evidencia OK.");


// Bootstrap configuration and simulation roots are caller-owned public inputs.
// Reject accessors from descriptors before ordinary field reads can execute them.
let simulationBootstrapGetterCalls = 0;
const accessorSimulationOptions = {};
Object.defineProperty(accessorSimulationOptions, "executionJournal", {
  enumerable: true,
  get() {
    simulationBootstrapGetterCalls += 1;
    throw new Error("simulation adapter option getter must not execute");
  }
});
assert.throws(() => createLuminaEffectAdapter({ agents: [], world: {} }, accessorSimulationOptions), /enumerable data fields/);
assert.equal(simulationBootstrapGetterCalls, 0);

const accessorSimulationRoot = { world: {} };
Object.defineProperty(accessorSimulationRoot, "agents", {
  enumerable: true,
  get() {
    simulationBootstrapGetterCalls += 1;
    throw new Error("simulation root getter must not execute");
  }
});
assert.throws(() => createLuminaEffectAdapter(accessorSimulationRoot), /campos de datos/);
assert.equal(simulationBootstrapGetterCalls, 0);

assert.throws(() => createLuminaEffectAdapter({ agents: [], world: {} }, { persistPreparedIntent: true }), /must be a function or null/);

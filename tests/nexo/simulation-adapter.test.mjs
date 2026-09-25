import assert from "node:assert/strict";
import { createLuminaEffectAdapter } from "../../src/nexo/simulation-adapter.js";

const simulation={
  agents:[{id:"alex",alive:true,position:{x:NaN,z:4},needs:{hunger:120,thirst:-4}}],
  world:{resources:{wood:{amount:-5}}}
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

console.log("Nexo: adaptador concreto de Lúmina con efectos reales y pre/postcondiciones OK.");

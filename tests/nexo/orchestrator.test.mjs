import assert from "node:assert/strict";
import { buildNexoMission, beginNexoStep, advanceNexoMission, verifyNexoMission, planNexoExecution } from "../../src/nexo/orchestrator.js";
import { createLearningMemory, recordNexoPlan, recordNexoOutcome } from "../../src/assistants/memory.js";

const reports=[{assistant:"Debugger",findings:[
  {severity:"warning",code:"AGENT_POSITION",message:"posición inválida",agent:"alex"},
  {severity:"error",code:"MESH_MISSING",message:"mesh ausente",agent:"alex"}
]}];
const mission=buildNexoMission({simulation:{agents:[{id:"alex"}]},reports,memory:{patterns:[{}],nexo:{attempts:[],doNotRepeat:[]}}});
assert.equal(mission.version,4);
assert.equal(mission.status,"planned");
assert.equal(mission.steps[0].action,"repair_visual_mesh");
assert.equal(mission.steps[0].priority,3);
assert.deepEqual(mission.steps[0].dependsOn,[mission.steps[1].id]);
assert.equal(mission.objective,"repair_agent_state");

const blockedByDependency=beginNexoStep(mission,mission.steps[0].id);
assert.equal(blockedByDependency.status,"blocked");
assert.equal(blockedByDependency.steps[0].blockReason,"DEPENDENCY_UNMET");

const executing=beginNexoStep(mission,mission.steps[1].id);
assert.equal(executing.status,"executing");
assert.equal(executing.steps[1].status,"executing");
assert.equal(planNexoExecution(executing).actions.length,0);

const completed=advanceNexoMission(executing,{stepId:mission.steps[1].id,outcome:"completed",evidence:{verified:true,kind:"agent-state",agentId:"alex"}});
assert.equal(completed.status,"planned");
assert.equal(completed.objective,"repair_visual_mesh");
assert.equal(planNexoExecution(completed).actions[0].action,"repair_visual_mesh");
assert.equal(verifyNexoMission(completed,null).status,"incomplete");

const failed=advanceNexoMission(beginNexoStep(completed,completed.steps[0].id),{stepId:completed.steps[0].id,outcome:"failed",evidence:{verified:false,kind:"effect-result",code:"MESH_REPAIR_FAILED"}});
assert.equal(failed.status,"needs_replan");
assert.equal(failed.objective,"replan_after_failure");

const replan=buildNexoMission({simulation:{agents:[{id:"alex"}]},reports:[{findings:[{severity:"error",code:"MESH_MISSING",agent:"alex",message:"mesh sigue ausente"}]}],memory:createLearningMemory(),parentMissionId:failed.missionId,replanReason:"MESH_REPAIR_FAILED"});
assert.equal(replan.parentMissionId,failed.missionId);
assert.equal(replan.replanReason,"MESH_REPAIR_FAILED");
assert.notEqual(replan.missionId,failed.missionId);

const boundedAction=buildNexoMission({
  reports:[{assistant:"BehaviorAgent",findings:[{
    severity:"info",code:"LUMINA_ACTION",agent:"alex",
    action:{name:"drink",amount:2},message:"sed detectada"
  }]}]
});
assert.equal(boundedAction.steps[0].action,"execute_lumina_action");
assert.deepEqual(boundedAction.steps[0].context,{action:{name:"drink",amount:2}});
assert.equal(planNexoExecution(boundedAction).actions[0].context.action.name,"drink");

const rejectedAction=buildNexoMission({
  reports:[{findings:[{
    severity:"info",code:"LUMINA_ACTION",agent:"alex",
    action:{name:"shell_exec",command:"rm -rf /"}
  }]}]
});
assert.equal(rejectedAction.steps[0].action,"inspect_and_collect_evidence");
assert.equal(rejectedAction.steps[0].context,undefined);

console.log("Nexo: auditoría profunda de contratos, dependencias, evidencia, memoria y replanificación OK.");

import assert from "node:assert/strict";
import { buildNexoMission, beginNexoStep, advanceNexoMission, verifyNexoMission, planNexoExecution } from "../../src/nexo/orchestrator.js";
import { createLearningMemory, recordNexoPlan, recordNexoOutcome } from "../../src/assistants/memory.js";

const reports=[{assistant:"Debugger",findings:[
  {severity:"warning",code:"AGENT_POSITION",message:"posición inválida",agent:"alex"},
  {severity:"error",code:"MESH_MISSING",message:"mesh ausente",agent:"alex"}
]}];
const mission=buildNexoMission({simulation:{agents:[{id:"alex"}]},reports,memory:{patterns:[{}],nexo:{attempts:[],doNotRepeat:[]}}});
assert.equal(mission.version,3);
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

const missing=advanceNexoMission(executing,{stepId:mission.steps[1].id,outcome:"completed"});
assert.equal(missing.status,"blocked");
assert.equal(missing.blockReason,"MISSING_VERIFIED_EVIDENCE");
assert.equal(missing.steps[1].status,"executing");

const repaired=advanceNexoMission(executing,{stepId:mission.steps[1].id,outcome:"completed",evidence:{verified:true,kind:"runtime-check",details:"state repaired"}});
assert.equal(repaired.steps[1].status,"completed");
assert.equal(repaired.objective,"repair_visual_mesh");
assert.equal(planNexoExecution(repaired).actions[0].action,"repair_visual_mesh");

const ready=beginNexoStep(repaired,repaired.steps[0].id);
const completed=advanceNexoMission(ready,{stepId:ready.steps[0].id,outcome:"completed",evidence:{verified:true,kind:"runtime-check",details:"mesh visible"}});
assert.equal(completed.steps[0].status,"completed");
assert.equal(completed.objective,"verify_mission_outcome");

const failed=advanceNexoMission(ready,{stepId:ready.steps[0].id,outcome:"failed",evidence:{verified:true,kind:"runtime-check",details:"repair did not hold"}});
assert.equal(failed.status,"needs_replan");
assert.equal(verifyNexoMission(failed,{verified:true,kind:"mission-check"}).verified,false);

const final=verifyNexoMission(completed,{verified:true,kind:"mission-check",details:"all steps rechecked"});
assert.equal(final.verified,true);
assert.equal(final.status,"completed");

const clean=buildNexoMission({reports:[]});
assert.equal(clean.steps[0].action,"run_longitudinal_probe");
assert.equal(clean.objective,"run_longitudinal_probe");

const repeatBlocked=buildNexoMission({reports:[{findings:[{severity:"warning",code:"EXPLORER_STALLED",agent:"alex"}]}],memory:{nexo:{doNotRepeat:[{action:"advance_exploration_probe",target:"alex"}]}}});
assert.equal(repeatBlocked.status,"blocked");
assert.equal(repeatBlocked.steps[0].blockReason,"DO_NOT_REPEAT");

const mem=recordNexoPlan(createLearningMemory(),mission);
assert.equal(mem.nexo.missions.length,1);
const mem2=recordNexoOutcome(mem,{missionId:mission.missionId,stepId:"step-1",action:"repair_visual_mesh",target:"alex",status:"completed"});
assert.equal(mem2.nexo.attempts.length,0);
const mem3=recordNexoOutcome(mem,{missionId:mission.missionId,stepId:"step-1",action:"repair_visual_mesh",target:"alex",status:"completed",evidence:{verified:true,kind:"runtime-check"}});
assert.equal(mem3.nexo.attempts.length,1);

console.log("Nexo: auditoría profunda de contratos, dependencias, evidencia y memoria OK.");

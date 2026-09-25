import assert from "node:assert/strict";
import { buildNexoMission, beginNexoStep, advanceNexoMission, verifyNexoMission, planNexoExecution } from "../../src/nexo/orchestrator.js";

const reports=[{assistant:"Debugger",findings:[
  {severity:"warning",code:"AGENT_POSITION",message:"posición inválida",agent:"alex"},
  {severity:"error",code:"MESH_MISSING",message:"mesh ausente",agent:"alex"}
]}];
const mission=buildNexoMission({simulation:{agents:[{id:"alex"}]},reports,memory:{patterns:[{}],nexo:{attempts:[],doNotRepeat:[]}}});
assert.equal(mission.version,2);
assert.equal(mission.status,"planned");
assert.equal(mission.steps[0].action,"repair_visual_mesh");
assert.equal(mission.steps[0].priority,3);
assert.equal(mission.steps[0].requiresEvidence,true);
assert.deepEqual(mission.memorySignals,{patterns:1,attempts:0,doNotRepeat:0});

const executing=beginNexoStep(mission,mission.steps[0].id);
assert.equal(executing.status,"executing");
assert.equal(executing.steps[0].status,"executing");

const missing=advanceNexoMission(executing,{stepId:mission.steps[0].id,outcome:"completed"});
assert.equal(missing.status,"blocked");
assert.equal(missing.blockReason,"MISSING_VERIFIED_EVIDENCE");
assert.equal(missing.steps[0].status,"executing");

const completed=advanceNexoMission(executing,{stepId:mission.steps[0].id,outcome:"completed",evidence:{verified:true,kind:"runtime-check",details:"mesh visible"}});
assert.equal(completed.steps[0].status,"completed");
assert.equal(completed.objective,"repair_agent_state");

const failed=advanceNexoMission(executing,{stepId:mission.steps[0].id,outcome:"failed",evidence:{verified:true,kind:"runtime-check",details:"repair did not hold"}});
assert.equal(failed.steps[0].status,"failed");

const final=verifyNexoMission({...completed,steps:completed.steps.map(s=>({...s,status:"completed"}))},{verified:true,kind:"mission-check",details:"all steps rechecked"});
assert.equal(final.verified,true);
assert.equal(final.status,"completed");

const plan=planNexoExecution(mission);
assert.equal(plan.status,"ready");
assert.equal(plan.actions.length,mission.steps.length);

const clean=buildNexoMission({reports:[]});
assert.equal(clean.steps[0].action,"run_longitudinal_probe");
assert.equal(clean.steps[0].requiresVerification,true);

const canonicalVisual=buildNexoMission({reports:[{assistant:"VisualAgent",findings:[{severity:"error",code:"MESH_MISSING",agent:"alex"}]}]});
assert.equal(canonicalVisual.steps[0].action,"repair_visual_mesh");

const repeatBlocked=buildNexoMission({reports:[{findings:[{severity:"warning",code:"EXPLORER_STALLED",agent:"alex"}]}],memory:{nexo:{doNotRepeat:[{action:"advance_exploration_probe",target:"alex"}]}}});
assert.equal(repeatBlocked.steps[0].status,"blocked");
assert.equal(repeatBlocked.steps[0].blockReason,"DO_NOT_REPEAT");

console.log("Nexo orchestrator: auditoría de contratos y ciclo cerrado OK.");

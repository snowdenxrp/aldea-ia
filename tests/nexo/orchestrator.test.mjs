import assert from "node:assert/strict";
import { buildNexoMission, advanceNexoMission } from "../../src/nexo/orchestrator.js";

const mission=buildNexoMission({
  simulation:{agents:[{id:"alex"}]},
  reports:[{assistant:"Debugger",findings:[
    {severity:"warning",code:"AGENT_POSITION",message:"posición inválida",agent:"alex"},
    {severity:"error",code:"MESH_MISSING",message:"mesh ausente",agent:"alex"}
  ]}],
  memory:{patterns:[{}]}
});
assert.equal(mission.version,1);
assert.equal(mission.status,"planned");
assert.equal(mission.steps[0].action,"repair_visual_mesh");
assert.equal(mission.steps[0].priority,3);
assert.equal(mission.memorySignals,1);

const advanced=advanceNexoMission(mission,{completedStepId:mission.steps[0].id,evidence:"verified"});
assert.equal(advanced.steps[0].status,"completed");
assert.equal(advanced.objective,"repair_agent_state");
assert.equal(advanced.status,"planned");

const clean=buildNexoMission({reports:[]});
assert.equal(clean.steps[0].action,"run_longitudinal_probe");
assert.equal(clean.steps[0].requiresEvidence,true);

console.log("Nexo orchestrator: todas las pruebas pasaron.");

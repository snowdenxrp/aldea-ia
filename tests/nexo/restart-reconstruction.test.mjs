import assert from "node:assert/strict";
import { createLearningMemory, recordNexoPlan, recordNexoExecution, recordNexoOutcome, reconstructNexoMission } from "../../src/assistants/memory.js";

const mission={
  version:4, missionId:"restart-mission", parentMissionId:null, replanReason:null,
  objective:"repair_agent_state", status:"planned", steps:[
    {id:"step-1",action:"repair_agent_state",target:"alex",status:"planned",dependsOn:[]},
    {id:"step-2",action:"repair_visual_mesh",target:"alex",status:"planned",dependsOn:["step-1"]}
  ], generatedAt:"2026-09-26T00:00:00.000Z"
};
let memory=recordNexoPlan(createLearningMemory(),mission);
memory=recordNexoOutcome(memory,{missionId:mission.missionId,stepId:"step-1",action:"repair_agent_state",target:"alex",status:"completed",evidence:{verified:true,kind:"agent-state",agentId:"alex"}});
const reconstructed=reconstructNexoMission(memory,mission.missionId);
assert.equal(reconstructed.steps[0].status,"completed");
assert.equal(reconstructed.steps[1].status,"planned");
assert.equal(reconstructed.status,"planned");
assert.equal(reconstructed.objective,"repair_visual_mesh");

// Crash-window invariant: an execution journal entry without an outcome is not completion.
const executionOnlyMemory = recordNexoExecution(memory,{
  idempotencyKey:"restart-mission:step-2",
  missionId:mission.missionId,
  stepId:"step-2",
  action:"repair_visual_mesh",
  target:"alex",
  result:{status:"completed",verified:true,evidence:{verified:true,kind:"effect-postcondition",action:"repair_visual_mesh",target:"alex"}}
});
const executionOnlyReconstruction=reconstructNexoMission(executionOnlyMemory,mission.missionId);
assert.equal(executionOnlyReconstruction.steps[1].status,"planned");
assert.equal(executionOnlyReconstruction.status,"planned");
assert.equal(executionOnlyReconstruction.objective,"repair_visual_mesh");

const failedMemory=recordNexoOutcome(memory,{missionId:mission.missionId,stepId:"step-2",action:"repair_visual_mesh",target:"alex",status:"failed",evidence:{verified:false,kind:"effect-result",code:"MESH_REPAIR_FAILED"}});
const failedReconstruction=reconstructNexoMission(failedMemory,mission.missionId);
assert.equal(failedReconstruction.status,"needs_replan");
assert.equal(failedReconstruction.objective,"replan_after_failure");

console.log("Nexo: durable mission restart reconstruction + execution/outcome crash-window semantics OK.");

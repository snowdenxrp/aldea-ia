import assert from "node:assert/strict";
import { buildNexoMission, replanNexoMission, beginNexoStep, advanceNexoMission, verifyNexoMission, planNexoExecution } from "../../src/nexo/orchestrator.js";
import { createLearningMemory, recordNexoPlan, recordNexoOutcome, reconstructNexoMission } from "../../src/assistants/memory.js";

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

const missingEvidenceStart = beginNexoStep(mission, mission.steps[1].id);
const missingEvidence = advanceNexoMission(missingEvidenceStart, {
  stepId: mission.steps[1].id,
  outcome: "completed",
  evidence: null
});
assert.equal(missingEvidence.status, "blocked");
assert.equal(missingEvidence.objective, "replan_from_constraints");
assert.equal(missingEvidence.blockReason, "MISSING_VERIFIED_EVIDENCE");
assert.equal(missingEvidence.steps[1].status, "blocked");
assert.equal(missingEvidence.steps[1].blockReason, "MISSING_VERIFIED_EVIDENCE");
assert.equal(planNexoExecution(missingEvidence).actions.length, 0);

const replan=buildNexoMission({simulation:{agents:[{id:"alex"}]},reports:[{findings:[{severity:"error",code:"MESH_MISSING",agent:"alex",message:"mesh sigue ausente"}]}],memory:createLearningMemory(),parentMissionId:failed.missionId,replanReason:"MESH_REPAIR_FAILED"});
assert.equal(replan.parentMissionId,failed.missionId);
assert.equal(replan.replanReason,"MESH_REPAIR_FAILED");
assert.notEqual(replan.missionId,failed.missionId);
assert.notEqual(replan.missionId,failed.missionId);

// A terminal failure can be turned into a successor plan without hand-written lineage.
const failedMemory = recordNexoOutcome(createLearningMemory(), {
  missionId: failed.missionId, stepId: failed.steps[0].id, action: failed.steps[0].action,
  target: failed.steps[0].target, status: "failed",
  evidence: { verified: false, kind: "effect-result", code: "MESH_REPAIR_FAILED" }
});
assert.equal(replanNexoMission({previousMission: mission, reports}), null);
const successor = replanNexoMission({
  previousMission: failed, simulation: {agents:[{id:"alex"}]},
  reports: [{assistant:"Debugger",findings:[{severity:"error",code:"MESH_MISSING",agent:"alex",message:"mesh sigue ausente"}]}],
  memory: failedMemory
});
assert.ok(successor);
assert.notEqual(successor.missionId, failed.missionId);
assert.equal(successor.parentMissionId, failed.missionId);
assert.equal(successor.replanReason, "MESH_REPAIR_FAILED");
const lineageMemory = recordNexoPlan(failedMemory, successor);
const restoredSuccessor = reconstructNexoMission(lineageMemory, successor.missionId);
assert.equal(restoredSuccessor.parentMissionId, failed.missionId);
assert.equal(restoredSuccessor.replanReason, "MESH_REPAIR_FAILED");
assert.equal(lineageMemory.nexo.attempts[0].evidence.code, "MESH_REPAIR_FAILED");
assert.equal(replanNexoMission({previousMission:{...failed,status:"planned"}}), null);
assert.equal(replanNexoMission({previousMission:{missionId:failed.missionId,status:"blocked",steps:[{status:"blocked"}]}}), null);

// An UNKNOWN external-effect outcome cannot be bypassed with a caller-supplied
// replan reason or a new mission ID; reconciliation must resolve it first.
const unknownEffectMission={
  missionId:"unknown-effect-mission", status:"blocked",
  lastEvidence:{verified:false,kind:"effect-result",code:"EFFECT_OUTCOME_UNKNOWN"},
  steps:[{id:"step-1",action:"execute_lumina_action",status:"blocked",
    result:{verified:false,kind:"effect-result",code:"EFFECT_OUTCOME_UNKNOWN"}}]
};
assert.equal(replanNexoMission({
  previousMission:unknownEffectMission,
  reports:[{findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:1}}]}],
  reason:"caller_requests_fresh_operation"
}),null,"UNKNOWN must not be bypassed by replan reason");


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


const boundedAdmissionReports = [{
  assistant: "AdmissionBoundaryTest",
  findings: [
    { severity: "error", code: "MESH_MISSING", message: "mesh ausente", agent: "alex" },
    ...Array.from({ length: 7 }, (_, i) => ({
      severity: "error", code: "UNMAPPED_" + i, message: "hallazgo independiente " + i, agent: "other-" + i
    })),
    { severity: "warning", code: "AGENT_POSITION", message: "posición de alex inválida", agent: "alex" }
  ]
}];
const boundedAdmission = buildNexoMission({ reports: boundedAdmissionReports });
assert.equal(boundedAdmission.steps.length, 8);
assert.deepEqual(boundedAdmission.admission, {
  candidateStepCount: 9, admittedStepCount: 8, omittedStepCount: 1, truncated: true
});
// The admitted mesh-repair step depends on a state-repair step that did not fit
// in the eight-step admission bound, so it must not remain executable.
assert.equal(boundedAdmission.steps[0].action, "repair_visual_mesh");
assert.equal(boundedAdmission.steps[0].status, "blocked");
assert.equal(boundedAdmission.steps[0].blockReason, "DEPENDENCY_NOT_ADMITTED");
assert.equal(planNexoExecution(boundedAdmission).actions.some(a => a.action === "repair_visual_mesh"), false);
// Omitted candidates are explicitly not admitted; they are not recorded as failed or resolved.
assert.equal(boundedAdmission.steps.some(s => s.action === "repair_agent_state"), false);

console.log("Nexo: auditoría profunda de contratos, dependencias, evidencia, memoria y replanificación OK.");

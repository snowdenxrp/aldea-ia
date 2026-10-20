import assert from "node:assert/strict";
import { createLearningMemory, recordNexoPlan, recordNexoExecution, recordNexoOutcome, reconstructNexoMission, learnFromReports } from "../../src/assistants/memory.js";

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
// Late/stale results for the same mission step must not regress a verified completion.
const staleAfterCompletion=structuredClone(memory);
staleAfterCompletion.nexo.attempts.push({missionId:mission.missionId,stepId:"step-1",action:"repair_agent_state",target:"alex",status:"failed",evidence:{verified:false,kind:"effect-result",code:"STALE_RETRY"}});
const staleReconstruction=reconstructNexoMission(staleAfterCompletion,mission.missionId);
assert.equal(staleReconstruction.steps[0].status,"completed");
assert.equal(staleReconstruction.steps[0].result.kind,"agent-state");
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


// Mixed restart frontier: completed + execution-only + blocked + failed history must
// reconstruct conservatively, with the failed step dominating mission status.
let mixedMemory=recordNexoPlan(createLearningMemory(),{
  ...mission,
  missionId:"mixed-restart-mission",
  steps:[
    {id:"step-1",action:"repair_agent_state",target:"alex",status:"planned",dependsOn:[]},
    {id:"step-2",action:"repair_visual_mesh",target:"alex",status:"planned",dependsOn:["step-1"]},
    {id:"step-3",action:"repair_scene_link",target:"alex",status:"planned",dependsOn:["step-1"]},
    {id:"step-4",action:"repair_visual_visibility",target:"alex",status:"planned",dependsOn:[]}
  ]
});
mixedMemory=recordNexoOutcome(mixedMemory,{missionId:"mixed-restart-mission",stepId:"step-1",action:"repair_agent_state",target:"alex",status:"completed",evidence:{verified:true,kind:"agent-state",agentId:"alex"}});
mixedMemory=recordNexoExecution(mixedMemory,{idempotencyKey:"mixed-restart-mission:step-2",missionId:"mixed-restart-mission",stepId:"step-2",action:"repair_visual_mesh",target:"alex",result:{status:"completed",verified:true}});
mixedMemory=recordNexoOutcome(mixedMemory,{missionId:"mixed-restart-mission",stepId:"step-3",action:"repair_scene_link",target:"alex",status:"blocked",evidence:{verified:false,kind:"constraint",code:"SCENE_LOCKED"}});
mixedMemory=recordNexoOutcome(mixedMemory,{missionId:"mixed-restart-mission",stepId:"step-4",action:"repair_visual_visibility",target:"alex",status:"failed",evidence:{verified:false,kind:"effect-result",code:"VISIBILITY_REPAIR_FAILED"}});
const mixed=reconstructNexoMission(mixedMemory,"mixed-restart-mission");
assert.equal(mixed.steps.find(s=>s.id==="step-1").status,"completed");
assert.equal(mixed.steps.find(s=>s.id==="step-2").status,"planned");
assert.equal(mixed.steps.find(s=>s.id==="step-3").status,"blocked");
assert.equal(mixed.steps.find(s=>s.id==="step-4").status,"failed");
assert.equal(mixed.status,"needs_replan");
assert.equal(mixed.objective,"replan_after_failure");
assert.equal(mixed.steps.find(s=>s.id==="step-2").result,undefined);

const failedMemory=recordNexoOutcome(memory,{missionId:mission.missionId,stepId:"step-2",action:"repair_visual_mesh",target:"alex",status:"failed",evidence:{verified:false,kind:"effect-result",code:"MESH_REPAIR_FAILED"}});
const failedReconstruction=reconstructNexoMission(failedMemory,mission.missionId);
assert.equal(failedReconstruction.status,"needs_replan");
assert.equal(failedReconstruction.objective,"replan_after_failure");


// Mission continuity: reconstruction must retain admission-time step context, not just action/target.
const contextualMission = {
  version: 4, missionId: "contextual-restart-mission", parentMissionId: null, replanReason: null,
  objective: "execute_lumina_action", status: "planned", uncertainty: "present",
  evidenceCount: 3, observedAgentCount: 2, generatedAt: "2026-10-17T12:00:00.000Z",
  steps: [{
    id: "step-context", action: "execute_lumina_action", target: "alex", status: "planned",
    dependsOn: [], priority: 2, reason: "acción propuesta por evidencia", source: "BehaviorAgent",
    reversible: false, requiresEvidence: true, requiresVerification: true,
    context: { action: { name: "drink", amount: 2 }, observationId: "obs-17" }
  }]
};
const contextualMemory = recordNexoPlan(createLearningMemory(), contextualMission);
const reconstructedContextual = reconstructNexoMission(contextualMemory, contextualMission.missionId);
assert.equal(reconstructedContextual.steps[0].reason, "acción propuesta por evidencia");
assert.equal(reconstructedContextual.steps[0].source, "BehaviorAgent");
assert.equal(reconstructedContextual.steps[0].reversible, false);
assert.equal(reconstructedContextual.steps[0].requiresEvidence, true);
assert.equal(reconstructedContextual.steps[0].requiresVerification, true);
assert.deepEqual(reconstructedContextual.steps[0].context, contextualMission.steps[0].context);
assert.equal(reconstructedContextual.uncertainty, "present");
assert.equal(reconstructedContextual.evidenceCount, 3);
assert.equal(reconstructedContextual.observedAgentCount, 2);
// Stored continuity must be detached from subsequent mutation of the live mission.
contextualMission.steps[0].context.action.amount = 99;
assert.equal(reconstructNexoMission(contextualMemory, contextualMission.missionId).steps[0].context.action.amount, 2);


const boundedAdmissionMission = {
  version: 4, missionId: "bounded-admission-restart", parentMissionId: null, replanReason: null,
  objective: "inspect_and_collect_evidence", status: "planned", generatedAt: "2026-10-17T13:00:00.000Z",
  admission: { candidateStepCount: 9, admittedStepCount: 8, omittedStepCount: 1, truncated: true },
  steps: [{ id: "step-1", action: "inspect_and_collect_evidence", target: "other-0", status: "planned", dependsOn: [] }]
};
const boundedAdmissionMemory = recordNexoPlan(createLearningMemory(), boundedAdmissionMission);
assert.deepEqual(
  reconstructNexoMission(boundedAdmissionMemory, boundedAdmissionMission.missionId).admission,
  boundedAdmissionMission.admission
);

console.log("Nexo: durable mission restart reconstruction + execution/outcome crash-window semantics OK.");


// Learning must produce a new memory snapshot without mutating an existing pattern record.
const priorPattern = {
  signature: "warning|MEMORY_MUTATION|learning counter test",
  seen: 1,
  firstSeen: "2026-10-17T00:00:00.000Z",
  lastSeen: "2026-10-17T00:00:00.000Z"
};
const priorLearningMemory = createLearningMemory({ patterns: [priorPattern] });
const learnedMemory = learnFromReports(priorLearningMemory, [{
  findings: [{
    severity: "warning",
    code: "MEMORY_MUTATION",
    message: "learning counter test"
  }]
}]);
assert.equal(priorLearningMemory.patterns[0].seen, 1);
assert.equal(priorLearningMemory.patterns[0].lastSeen, "2026-10-17T00:00:00.000Z");
assert.equal(learnedMemory.patterns[0].seen, 2);
assert.notEqual(learnedMemory.patterns[0], priorLearningMemory.patterns[0]);

console.log("Nexo: learning memory snapshot isolation OK.");

// A prepared effect is a recovery obligation: retention must not evict the
// mission plan needed to reconstruct its action/target/dependencies.
const retainedMissionPlans = Array.from({length: 60}, (_, index) => ({
  missionId: `retention-mission-${String(index).padStart(2,"0")}`,
  version: 4,
  status: "planned",
  objective: "repair_agent_state",
  steps: [{
    id: "step-1", action: "repair_agent_state", target: `agent-${index}`,
    status: "planned", dependsOn: []
  }]
}));
const retainedPreparedJournal = [{
  idempotencyKey: "retention-mission-00:step-1",
  missionId: "retention-mission-00",
  stepId: "step-1",
  action: "repair_agent_state",
  target: "agent-0",
  status: "prepared"
}];
const retentionMemory = createLearningMemory({
  nexo: { missions: retainedMissionPlans, effectJournal: retainedPreparedJournal }
});
assert.equal(retentionMemory.nexo.missions.length, 50);
assert.ok(retentionMemory.nexo.missions.some(item => item.missionId === "retention-mission-00"));
assert.ok(reconstructNexoMission(retentionMemory, "retention-mission-00"));
assert.equal(retentionMemory.nexo.effectJournal[0].status, "prepared");

// Adding a new plan must apply the same retention rule rather than evicting
// the mission that still explains the prepared operation.
const postRetentionPlan = recordNexoPlan(retentionMemory, {
  version: 4, missionId: "retention-mission-new", status: "planned",
  objective: "repair_agent_state",
  steps: [{id:"step-1",action:"repair_agent_state",target:"agent-new",status:"planned",dependsOn:[]}]
});
assert.ok(postRetentionPlan.nexo.missions.some(item => item.missionId === "retention-mission-00"));
assert.ok(reconstructNexoMission(postRetentionPlan, "retention-mission-00"));

// An unrecognized effect state is not a recognized terminal outcome. It must
// survive the journal soft cap and retain its mission plan so reconstruction
// can surface uncertainty for that mission instead of silently erasing it.
const unknownEffectStatus = {
  idempotencyKey: "retention-mission-00:unknown-step",
  missionId: "retention-mission-00",
  stepId: "step-1",
  action: "repair_agent_state",
  target: "agent-0",
  status: "future_unrecognized_state"
};
const unknownEffectRetentionMemory = createLearningMemory({
  nexo: {
    missions: retainedMissionPlans,
    effectJournal: [
      unknownEffectStatus,
      ...Array.from({length: 200}, (_, index) => ({
        idempotencyKey: `historical-terminal-${index}`,
        missionId: `historical-mission-${index}`,
        stepId: "step-1",
        action: "repair_agent_state",
        target: `historical-agent-${index}`,
        status: "settled_observed"
      }))
    ]
  }
});
assert.equal(unknownEffectRetentionMemory.nexo.effectJournal.length, 200);
assert.ok(unknownEffectRetentionMemory.nexo.effectJournal.some(
  entry => entry.status === "future_unrecognized_state" &&
    entry.missionId === "retention-mission-00"
), "unknown effect states must survive retention even when terminal records are pruned");
assert.ok(unknownEffectRetentionMemory.nexo.missions.some(
  item => item.missionId === "retention-mission-00"
), "the plan explaining an unknown effect state must survive retention");

// Prepared-operation recovery also depends on prior step attempts: truncating an
// old completed dependency could reconstruct it as planned after restart.
const longMissionId = "long-prepared-mission";
const longMissionSteps = Array.from({length: 120}, (_, index) => ({
  id: `step-${index + 1}`,
  action: "repair_agent_state",
  target: `agent-${index + 1}`,
  status: "planned",
  dependsOn: index === 0 ? [] : [`step-${index}`]
}));
const longMissionAttempts = longMissionSteps.map(step => ({
  missionId: longMissionId,
  stepId: step.id,
  action: step.action,
  target: step.target,
  status: "completed",
  evidence: {verified:true,kind:"effect-postcondition",action:step.action,target:step.target}
}));
const longMissionExecutions = Array.from({length: 220}, (_, index) => ({
  idempotencyKey: `${longMissionId}:execution-${index}`,
  missionId: longMissionId,
  stepId: "step-120",
  action: "repair_agent_state",
  target: "agent-120",
  result: {status:"completed",verified:true}
}));
const longPreparedMemory = createLearningMemory({
  nexo: {
    missions: [{
      missionId: longMissionId, version:4, status:"planned",
      objective:"repair_agent_state", steps:longMissionSteps
    }],
    attempts: longMissionAttempts,
    executions: longMissionExecutions,
    effectJournal: [{
      idempotencyKey: `${longMissionId}:step-120`,
      missionId: longMissionId, stepId:"step-120",
      action:"repair_agent_state", target:"agent-120", status:"prepared"
    }]
  }
});
assert.equal(longPreparedMemory.nexo.attempts.length, 120);
assert.equal(longPreparedMemory.nexo.executions.length, 220);
assert.equal(reconstructNexoMission(longPreparedMemory,longMissionId).steps[0].status,"completed");
const afterUnrelatedAttempt = recordNexoOutcome(longPreparedMemory,{
  missionId:"unrelated-mission",stepId:"step-1",action:"unrelated_action",
  status:"failed",evidence:{verified:false,kind:"effect-result",code:"TEST"}
});
assert.ok(afterUnrelatedAttempt.nexo.attempts.some(item=>item.missionId===longMissionId&&item.stepId==="step-1"));
assert.equal(reconstructNexoMission(afterUnrelatedAttempt,longMissionId).steps[0].status,"completed");

// Even after the prepared journal becomes terminal/empty, the retained mission
// still needs all of its attempts to reconstruct completed dependencies safely.
const longCompletedMemory = createLearningMemory({
  nexo: {
    missions: longPreparedMemory.nexo.missions,
    attempts: longMissionAttempts,
    executions: longMissionExecutions,
    effectJournal: []
  }
});
assert.equal(longCompletedMemory.nexo.attempts.length, 120);
assert.equal(longCompletedMemory.nexo.executions.length, 220);
assert.equal(reconstructNexoMission(longCompletedMemory,longMissionId).steps[0].status,"completed");


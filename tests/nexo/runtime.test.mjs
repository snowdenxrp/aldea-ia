import assert from "node:assert/strict";
import { buildNexoMission } from "../../src/nexo/orchestrator.js";
import { createEffectAdapter } from "../../src/nexo/effect-adapter.js";
import { executeNexoStep, executeLuminaNexoStep, replanPersistedNexoMission } from "../../src/nexo/runtime.js";
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
assert.equal(restarted.memory.nexo.attempts.length,1);
assert.equal(restarted.memory.nexo.attempts[0].status,"completed");

const crashWindowMemory=structuredClone(autoVerified.memory);
crashWindowMemory.nexo.attempts=[];
const crashWindowRetry=await executeLuminaNexoStep({
  simulation:actionSimulation,
  mission:actionMission,
  stepId:"step-1",
  memory:crashWindowMemory,
  precondition:()=>{throw new Error("crash-window retry must use persisted execution");}
});
assert.equal(crashWindowRetry.status,"completed");
assert.equal(crashWindowRetry.adapterResult.verified,true);
assert.equal(actionSimulation.world.resources.water.amount,waterAfterFirst);
assert.equal(actionSimulation.agents[0].needs.thirst,thirstAfterFirst);
assert.equal(crashWindowRetry.memory.nexo.executions.length,1);
assert.equal(crashWindowRetry.memory.nexo.attempts.length,1);
assert.equal(crashWindowRetry.memory.nexo.attempts[0].status,"completed");

const failureSimulation={agents:[{id:"alex",alive:true,position:{x:0,z:0},needs:{thirst:50},inventory:[]}],world:{resources:{water:{amount:0}}}};
const failureMission=buildNexoMission({reports:[{findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:2},message:"sed detectada"}]}]});
const failure=await executeLuminaNexoStep({simulation:failureSimulation,mission:failureMission,stepId:"step-1",memory:createLearningMemory(),precondition:({stateVersion})=>stateVersion===0});
assert.equal(failure.status,"failed"); assert.equal(failure.adapterResult.code,"LUMINA_ACTION_FAILED"); assert.equal(failure.mission.status,"needs_replan"); assert.equal(failure.mission.objective,"replan_after_failure"); assert.equal(failure.memory.nexo.attempts[0].status,"failed"); assert.equal(failureSimulation.nexoEffectRevision,0);

failureSimulation.world.resources.water.amount=10;
const persistedReplan=replanPersistedNexoMission({
  simulation:failureSimulation,
  memory:failure.memory,
  previousMissionId:failure.mission.missionId,
  reports:[{assistant:"EnvironmentProbe",findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:2},message:"agua disponible tras cambio ambiental"}]}]
});
const replanned=persistedReplan.mission;
assert.equal(persistedReplan.status,"planned");
assert.notEqual(replanned.missionId,failure.mission.missionId);
assert.equal(replanned.parentMissionId,failure.mission.missionId);
assert.equal(replanned.replanReason,"LUMINA_ACTION_FAILED");
assert.equal(replanned.steps[0].action,"execute_lumina_action");
assert.equal(replanned.steps[0].context.action.name,"drink");
assert.equal(replanned.status,"planned");
assert.equal(persistedReplan.memory.nexo.missions.at(-1).missionId,replanned.missionId);
assert.equal(persistedReplan.memory.nexo.attempts.find(x=>x.missionId===failure.mission.missionId).status,"failed");
assert.equal(failure.memory.nexo.missions.some(x=>x.missionId===replanned.missionId),false,"replanning must not mutate the input memory snapshot");
assert.notEqual(persistedReplan.memory,failure.memory,"replanning returns a new memory snapshot");
assert.equal(replanPersistedNexoMission({memory:failure.memory,previousMissionId:"missing-mission",reports:[]}).status,"not_found");

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
assert.equal(secondMulti.memory.nexo.missions.length,1);
assert.equal(secondMulti.memory.nexo.missions[0].missionId,multiMission.missionId);
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


const terminalEffectEntries=Array.from({length:200},(_,i)=>({
  idempotencyKey:`terminal-normalization:${i}`,status:"completed",
  result:{status:"completed",evidence:{kind:"test"}}
}));
const unresolvedPreparedEntry={
  idempotencyKey:"preserve-prepared-normalization",missionId:"old-mission",stepId:"old-step",
  action:"ambiguous_effect",target:"alex",status:"prepared"
};
const normalizedJournal=createLearningMemory({
  nexo:{effectJournal:[unresolvedPreparedEntry,...terminalEffectEntries]}
}).nexo.effectJournal;
assert.equal(normalizedJournal.length,200);
assert.ok(normalizedJournal.some(entry=>entry.idempotencyKey==="preserve-prepared-normalization"),
  "memory normalization must not truncate an unresolved prepared effect");
assert.equal(normalizedJournal.some(entry=>entry.idempotencyKey==="terminal-normalization:0"),false,
  "memory normalization should prune terminal history before unresolved operations");
assert.notEqual(normalizedJournal.find(entry=>entry.idempotencyKey==="preserve-prepared-normalization"),unresolvedPreparedEntry,
  "memory normalization must detach journal records");
const unresolvedOnly=createLearningMemory({
  nexo:{effectJournal:Array.from({length:201},(_,i)=>({
    idempotencyKey:`prepared-only:${i}`,status:"prepared"
  }))}
}).nexo.effectJournal;
assert.equal(unresolvedOnly.length,201,
  "unresolved prepared operations may exceed the soft history cap rather than be discarded");


const unknownRuntimeMemory=createLearningMemory();
const unknownRuntimeMission=buildNexoMission({
  reports:[{findings:[{severity:"error",code:"AGENT_POSITION",agent:"alex",message:"unknown external effect regression"}]}]
});
let unknownHandlerCalls=0;
const unknownRuntimeAdapter=createEffectAdapter({
  executionJournal:unknownRuntimeMemory.nexo.effectJournal,
  handlers:{repair_agent_state:async()=>{unknownHandlerCalls++;throw new Error("simulated crash after dispatch");}}
});
const unknownRuntimeResult=await executeNexoStep({
  mission:unknownRuntimeMission,stepId:"step-1",adapter:unknownRuntimeAdapter,
  memory:unknownRuntimeMemory,precondition:()=>true,postcondition:()=>true
});
assert.equal(unknownRuntimeResult.status,"blocked");
assert.equal(unknownRuntimeResult.adapterResult.code,"EFFECT_OUTCOME_UNKNOWN");
assert.equal(unknownHandlerCalls,1);
assert.equal(unknownRuntimeResult.memory.nexo.effectJournal.find(
  entry=>entry.idempotencyKey===`${unknownRuntimeMission.missionId}:step-1`
)?.status,"prepared");
const unknownPersistedMemory=createLearningMemory(unknownRuntimeResult.memory);
const unknownReconstructedMission=(await import("../../src/assistants/memory.js"))
  .reconstructNexoMission(unknownPersistedMemory,unknownRuntimeMission.missionId);
assert.equal(unknownReconstructedMission.steps[0].status,"blocked");
assert.equal(unknownReconstructedMission.steps[0].result.code,"EFFECT_OUTCOME_UNKNOWN");
const unknownReplan=replanPersistedNexoMission({
  memory:unknownPersistedMemory,
  previousMissionId:unknownRuntimeMission.missionId,
  reports:[{findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:1}}]}],
  reason:"caller_requests_new_operation_after_restart"
});
assert.equal(unknownReplan.status,"not_replanned",
  "persisted UNKNOWN effect must block replan even after memory normalization and reconstruction");
assert.equal(unknownHandlerCalls,1,
  "replan rejection must not redispatch the uncertain effect");
assert.equal(unknownPersistedMemory.nexo.effectJournal.find(
  entry=>entry.idempotencyKey===`${unknownRuntimeMission.missionId}:step-1`
)?.status,"prepared",
  "reconstruction/replan must preserve the unresolved prepared effect");

// Crash-window regression: the durable mission/outcome record may be stale or
// generic while the effect journal still proves only that an operation is prepared.
// The journal must veto a successor even when mission evidence lost the UNKNOWN code.
const staleMissionMemory=createLearningMemory(unknownPersistedMemory);
staleMissionMemory.nexo.attempts=staleMissionMemory.nexo.attempts.filter(
  entry=>entry?.missionId!==unknownRuntimeMission.missionId
);
const stalePlan=staleMissionMemory.nexo.missions.find(
  entry=>entry?.missionId===unknownRuntimeMission.missionId
);
stalePlan.status="blocked";
stalePlan.steps[0].status="blocked";
stalePlan.steps[0].blockReason="EFFECT_RECONCILIATION_REQUIRED";
const journalVetoedReplan=replanPersistedNexoMission({
  memory:staleMissionMemory,
  previousMissionId:unknownRuntimeMission.missionId,
  reports:[{findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:1}}]}],
  reason:"caller_requests_successor_after_stale_recovery_record"
});
assert.equal(journalVetoedReplan.status,"not_replanned");
assert.equal(journalVetoedReplan.code,"EFFECT_RECONCILIATION_REQUIRED",
  "prepared journal state must veto replan even if mission outcome evidence is stale");
assert.equal(staleMissionMemory.nexo.missions.some(
  entry=>entry?.parentMissionId===unknownRuntimeMission.missionId
),false,"no successor mission may be persisted over an unresolved prepared effect");
assert.equal(staleMissionMemory.nexo.effectJournal.find(
  entry=>entry.idempotencyKey===`${unknownRuntimeMission.missionId}:step-1`
)?.status,"prepared");

console.log("Nexo: runtime bridge + automatic evidence + failure/replan + persisted idempotency + lineage OK.");

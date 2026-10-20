import assert from "node:assert/strict";
import { buildNexoMission } from "../../src/nexo/orchestrator.js";
import { createEffectAdapter } from "../../src/nexo/effect-adapter.js";
import { executeNexoStep, executeNexoStepWithContinuityOwner, executeLuminaNexoStep, replanPersistedNexoMission } from "../../src/nexo/runtime.js";
import { createLearningMemory, recordNexoPlan } from "../../src/assistants/memory.js";

function canonicalSnapshot(missions, effectJournal = []) {
  return {
    schema: "NEXO_OPERATIONAL_CONTINUITY",
    schemaVersion: 1,
    missions,
    attempts: [],
    doNotRepeat: [],
    executions: [],
    effectJournal
  };
}


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
assert.equal(failure.status,"blocked"); assert.equal(failure.adapterResult.code,"EFFECT_OUTCOME_UNKNOWN"); assert.equal(failure.mission.status,"blocked"); assert.equal(failure.memory.nexo.attempts[0].status,"blocked"); assert.equal(failureSimulation.nexoEffectRevision,0); assert.equal(failure.memory.nexo.effectJournal[0].status,"prepared");

// A failed Lúmina action can still mutate state. fish_escaped reduces energy
// and changes activity; it must be detected as a partial effect, not terminal failure.
const escapedFishSimulation={
  agents:[{id:"alex",alive:true,currentActivity:"idle",position:{x:0,z:0},needs:{hunger:50,thirst:50,energy:50,social:50,safety:50,health:100},inventory:[],skills:[]}],
  world:{resources:{fish:{amount:10},water:{amount:10},wild_plants:{amount:10},wood:{amount:10},stone:{amount:10}}},
  random:()=>0.99
};
const escapedFishMission=buildNexoMission({reports:[{findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"catch_fish",amount:1},message:"probar pesca"}]}]});
const escapedFish=await executeLuminaNexoStep({simulation:escapedFishSimulation,mission:escapedFishMission,stepId:"step-1",memory:createLearningMemory(),precondition:({stateVersion})=>stateVersion===0});
assert.equal(escapedFish.status,"blocked");
assert.equal(escapedFish.adapterResult.code,"PARTIAL_EFFECT_DETECTED");
assert.equal(escapedFishSimulation.agents[0].currentActivity,"fishing");
assert.equal(escapedFishSimulation.agents[0].needs.energy,48.5);
assert.equal(escapedFishSimulation.nexoEffectRevision,1);
assert.equal(escapedFish.memory.nexo.effectJournal[0].status,"prepared");
const escapedFishReplan=replanPersistedNexoMission({memory:escapedFish.memory,previousMissionId:escapedFishMission.missionId,simulation:escapedFishSimulation,reports:[{findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"catch_fish",amount:1},message:"reintento"}]}]});
assert.equal(escapedFishReplan.status,"not_replanned");
assert.equal(escapedFishReplan.code,"EFFECT_RECONCILIATION_REQUIRED");

// Restore the ordinary failure fixture for the known no-water/no-mutation case.
failureSimulation.world.resources.water.amount=10;
const persistedReplan=replanPersistedNexoMission({
  simulation:failureSimulation,
  memory:failure.memory,
  previousMissionId:failure.mission.missionId,
  reports:[{assistant:"EnvironmentProbe",findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:2},message:"agua disponible tras cambio ambiental"}]}]
});
assert.equal(persistedReplan.status,"not_replanned");
assert.equal(persistedReplan.code,"EFFECT_RECONCILIATION_REQUIRED",
  "a changed environment must not bypass an unresolved effect outcome");
assert.equal(failure.memory.nexo.effectJournal[0].status,"prepared");
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
assert.equal(chainedSecond.status,"blocked");
assert.equal(chainedSecond.adapterResult.code,"EFFECT_OUTCOME_UNKNOWN");
assert.equal(chainedSecond.mission.status,"blocked");
assert.equal(chainedSecond.memory.nexo.attempts.length,2);
assert.equal(chainedSecond.memory.nexo.effectJournal.at(-1).status,"prepared");
chainedFailureSimulation.world.resources.water.amount=10;
const chainedReplan=replanPersistedNexoMission({
  simulation:chainedFailureSimulation,
  memory:chainedSecond.memory,
  previousMissionId:chainedSecond.mission.missionId,
  reports:[{findings:[{severity:"info",code:"LUMINA_ACTION",agent:"alex",action:{name:"drink",amount:2},message:"agua restaurada"}]}]
});
assert.equal(chainedReplan.status,"not_replanned");
assert.equal(chainedReplan.code,"EFFECT_RECONCILIATION_REQUIRED");
assert.equal(chainedFailureSimulation.world.resources.water.amount,10,
  "environment change does not authorize retry while the prior outcome is unresolved");


const terminalEffectEntries=Array.from({length:200},(_,i)=>({
  idempotencyKey:`terminal-normalization:${i}`,status:"settled_observed",
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

// Runtime boundary regression: an adapter's terminal label cannot create a
// completed mission when its result lacks the two verification signals.
const unverifiedCompletionMission=buildNexoMission({
  reports:[{findings:[{severity:"error",code:"AGENT_POSITION",agent:"alex",message:"unverified completion regression"}]}]
});
const unverifiedCompletionMemory=createLearningMemory();
const unverifiedCompletion=await executeNexoStep({
  mission:unverifiedCompletionMission,
  stepId:"step-1",
  memory:unverifiedCompletionMemory,
  adapter:{execute:async()=>({status:"completed",verified:false,evidence:{verified:false,kind:"untrusted-result"}})}
});
assert.equal(unverifiedCompletion.status,"blocked");
assert.equal(unverifiedCompletion.adapterResult.status,"blocked");
assert.equal(unverifiedCompletion.adapterResult.code,"UNVERIFIED_COMPLETION_RESULT");
assert.equal(unverifiedCompletion.mission.steps[0].status,"blocked");
assert.equal(unverifiedCompletion.memory.nexo.attempts[0].status,"blocked");
assert.equal(unverifiedCompletion.memory.nexo.executions[0].result.status,"blocked");
assert.equal(unverifiedCompletion.memory.nexo.attempts[0].evidence.code,"UNVERIFIED_COMPLETION_RESULT");
assert.deepEqual(unverifiedCompletion.memory.nexo.attempts[0].evidence.scope,{
  missionId:unverifiedCompletionMission.missionId,
  stepId:"step-1",
  action:unverifiedCompletionMission.steps[0].action,
  target:unverifiedCompletionMission.steps[0].target??null
});

// Safety-sensitive runtime/replan boundaries must validate persisted continuity
// before tolerant memory normalization can erase an orphan prepared obligation.
const orphanPreparedMemory = {
  version: 4,
  runs: [], lessons: [], patterns: [],
  nexo: {
    missions: [], attempts: [], doNotRepeat: [], executions: [],
    effectJournal: [{
      idempotencyKey: "orphan-mission:step-1",
      missionId: "orphan-mission",
      stepId: "step-1",
      action: "repair_agent_state",
      target: "alex",
      status: "prepared"
    }]
  }
};
const invalidContinuityMission = buildNexoMission({
  reports:[{findings:[{severity:"error",code:"AGENT_POSITION",agent:"alex",message:"invalid continuity must stop before effect"}]}]
});
let invalidContinuityHandlerCalls = 0;
const invalidContinuityExecution = await executeNexoStep({
  mission: invalidContinuityMission,
  stepId: "step-1",
  memory: orphanPreparedMemory,
  adapter: {execute: async () => { invalidContinuityHandlerCalls += 1; return {status:"completed",verified:true,evidence:{verified:true,kind:"fake"}}; }}
});
assert.equal(invalidContinuityExecution.status,"blocked");
assert.equal(invalidContinuityExecution.adapterResult.code,"NEXO_RECOVERY_CONTEXT_MISSING");
assert.equal(invalidContinuityHandlerCalls,0);
assert.equal(invalidContinuityMission.steps[0].status,"planned");
assert.equal(orphanPreparedMemory.nexo.effectJournal[0].status,"prepared");

const invalidContinuityReplan = replanPersistedNexoMission({
  memory: orphanPreparedMemory,
  previousMissionId: "orphan-mission",
  reports: [{findings:[{severity:"info",code:"new-proposal"}]}],
  reason: "caller_requests_replan"
});
assert.equal(invalidContinuityReplan.status,"not_replanned");
assert.equal(invalidContinuityReplan.code,"NEXO_RECOVERY_CONTEXT_MISSING");
assert.equal(invalidContinuityReplan.memory,orphanPreparedMemory);
assert.equal(orphanPreparedMemory.nexo.missions.length,0);



// An observed repair invariant is not mission completion. Runtime replan must
// wait for a separate goal verifier instead of creating a successor that bypasses it.
const observedSettlementMission = {
  version: 4,
  missionId: "observed-settled-mission",
  parentMissionId: null,
  replanReason: null,
  objective: "verify_observed_repair_goal",
  status: "blocked",
  uncertainty: "desired_state_observed_causality_not_claimed",
  steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "blocked", dependsOn: [] }]
};
const observedSettlementMemory = recordNexoPlan(createLearningMemory(), observedSettlementMission);
observedSettlementMemory.nexo.effectJournal.push({
  idempotencyKey: "observed-settled-mission:step-1",
  missionId: "observed-settled-mission",
  stepId: "step-1",
  action: "repair_agent_state",
  target: "alex",
  environmentStateRevision: 4,
  status: "settled_observed",
  settlement: {
    kind: "persisted-repair-invariant-observed",
    source: "world-state.json",
    observation: "desired_state_present",
    environmentStateRevision: 5,
    preparedEnvironmentStateRevision: 4,
    causalAttribution: "not_claimed"
  }
});
const observedSettlementReplan = replanPersistedNexoMission({
  memory: observedSettlementMemory,
  previousMissionId: "observed-settled-mission",
  reports: [{ findings: [{ severity: "info", code: "new-proposal" }] }],
  reason: "caller_requests_replan_before_goal_verification"
});
assert.equal(observedSettlementReplan.status, "not_replanned");
assert.equal(observedSettlementReplan.code, "NEXO_REPAIR_GOAL_VERIFICATION_REQUIRED");
assert.equal(observedSettlementMemory.nexo.missions.length, 1);
assert.equal(observedSettlementMemory.nexo.effectJournal[0].status, "settled_observed");


let genericPrepareCalls = 0;
let genericDispatchCalls = 0;
const canonicalOwner = {
  supportsReconciliation: action => action === "write_file",
  loadCurrent: async () => ({
    storeRevision: 0,
    snapshot: canonicalSnapshot([{ missionId: "canonical-mission", status: "planned",
      steps: [{ id: "step-1", action: "write_file", target: "alpha", status: "planned", dependsOn: [] }] }])
  }),
  recordPrepared: async () => { genericPrepareCalls += 1; return { status: "committed", preparedCommitted: true, storeRevision: 1 }; },
  recordExecutionLineage: async () => ({ status: "committed", storeRevision: 2 }),
  reconcilePrepared: async () => ({ status: "observed", observation: "applied", redispatchAuthorized: false })
};
const canonicalAdapter = {
  supports: action => action === "write_file",
  supportsReconciliation: action => action === "write_file",
  executePrepared: async () => { genericDispatchCalls += 1; return { status: "completed", verified: true, evidence: { verified: true } }; }
};
const canonicalResult = await executeNexoStepWithContinuityOwner({
  missionId: "canonical-mission", stepId: "step-1", owner: canonicalOwner, adapter: canonicalAdapter
});
assert.equal(canonicalResult.status, "blocked");
assert.equal(canonicalResult.code, "NEXO_CANONICAL_RUNTIME_ACTION_NOT_ENABLED");
assert.equal(canonicalResult.dispatchAttempted, false);
assert.equal(canonicalResult.preparedCommitted, false);
assert.equal(genericPrepareCalls, 0, "unvalidated generic action must block before PREPARED");
assert.equal(genericDispatchCalls, 0, "unvalidated generic action must block before dispatch");

// Even a Chronicle handler is blocked before PREPARED when the owner has no
// trusted reconciliation verifier registered for that action.
let unsupportedDispatches = 0;
let unsupportedPrepares = 0;
const noVerifierOwner = {
  ...canonicalOwner,
  supportsReconciliation: () => false,
  loadCurrent: async () => ({
    storeRevision: 0,
    snapshot: canonicalSnapshot([{ missionId: "no-verifier-mission", status: "planned",
      steps: [{ id: "step-1", action: "chronicle_append", target: { content: "payload" }, status: "planned", dependsOn: [] }] }])
  }),
  recordPrepared: async () => { unsupportedPrepares += 1; return { status: "committed", preparedCommitted: true, storeRevision: 1 }; }
};
const noVerifierAdapter = {
  supports: action => action === "chronicle_append",
  supportsReconciliation: action => action === "chronicle_append",
  executePrepared: async () => { unsupportedDispatches += 1; return { status: "completed" }; }
};
const noVerifierRuntime = await executeNexoStepWithContinuityOwner({
  missionId: "no-verifier-mission", stepId: "step-1", owner: noVerifierOwner, adapter: noVerifierAdapter
});
assert.equal(noVerifierRuntime.status, "blocked");
assert.equal(noVerifierRuntime.code, "NEXO_EFFECT_RECONCILIATION_VERIFIER_UNAVAILABLE");
assert.equal(noVerifierRuntime.dispatchAttempted, false);
assert.equal(unsupportedPrepares, 0);
assert.equal(unsupportedDispatches, 0);

let repairPrepareCalls=0;
let repairDispatchCalls=0;
const repairCanonicalOwner={
  ...canonicalOwner,
  loadCurrent:async()=>({storeRevision:0,snapshot:canonicalSnapshot([{missionId:"repair-canonical",status:"planned",steps:[{id:"step-1",action:"repair_agent_state",target:"alex",status:"planned",dependsOn:[]}]}])}),
  supportsReconciliation:()=>true,
  recordPrepared:async()=>{repairPrepareCalls++;return {status:"committed",preparedCommitted:true,storeRevision:1};}
};
const repairCanonicalAdapter={
  supports:()=>true,
  supportsReconciliation:()=>true,
  executePrepared:async()=>{repairDispatchCalls++;return {status:"completed",verified:true};}
};
const repairCanonicalResult=await executeNexoStepWithContinuityOwner({
  missionId:"repair-canonical",stepId:"step-1",owner:repairCanonicalOwner,adapter:repairCanonicalAdapter
});
assert.equal(repairCanonicalResult.status,"blocked");
assert.equal(repairCanonicalResult.code,"NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED");
assert.equal(repairCanonicalResult.dispatchAttempted,false);
assert.equal(repairPrepareCalls,0);
assert.equal(repairDispatchCalls,0);

let uncertainPrepareDispatches=0;
const uncertainPrepareOwner={
  ...canonicalOwner,
  supportsReconciliation: action => action === "chronicle_append",
  loadCurrent: async()=>({storeRevision:0,snapshot:canonicalSnapshot([{missionId:"uncertain-prepare-mission",status:"planned",steps:[{id:"step-1",action:"chronicle_append",target:{content:"payload"},status:"planned",dependsOn:[]}]}])}),
  recordPrepared:async()=>{throw new Error("prepare response lost");}
};
const uncertainPrepareAdapter={
  ...canonicalAdapter,
  supports: action => action === "chronicle_append",
  supportsReconciliation: action => action === "chronicle_append",
  executePrepared:async()=>{uncertainPrepareDispatches++;return {status:"completed"};}
};
const uncertainPrepareResult=await executeNexoStepWithContinuityOwner({
  missionId:"uncertain-prepare-mission",stepId:"step-1",owner:uncertainPrepareOwner,adapter:uncertainPrepareAdapter
});
assert.equal(uncertainPrepareResult.status,"unknown");
assert.equal(uncertainPrepareResult.code,"NEXO_PREPARED_COMMIT_OUTCOME_UNKNOWN");
assert.equal(uncertainPrepareResult.dispatchAttempted,false);
assert.equal(uncertainPrepareResult.preparedCommitted,"UNKNOWN");
assert.equal(uncertainPrepareDispatches,0);


// The adapter must independently advertise a trusted reconciliation contract
// before the owner is allowed to commit PREPARED for this operation.
let adapterVerifierPrepareCalls=0;
let adapterVerifierDispatchCalls=0;
const noAdapterVerifierOwner={
  ...canonicalOwner,
  supportsReconciliation:()=>true,
  loadCurrent:async()=>({storeRevision:0,snapshot:canonicalSnapshot([{missionId:"no-adapter-verifier-mission",status:"planned",steps:[{id:"step-1",action:"chronicle_append",target:{content:"payload"},status:"planned",dependsOn:[]}]}])}),
  recordPrepared:async()=>{adapterVerifierPrepareCalls++;return {status:"committed",preparedCommitted:true,storeRevision:1};}
};
const noAdapterVerifier={
  ...canonicalAdapter,
  supports: action => action === "chronicle_append",
  supportsReconciliation:()=>false,
  executePrepared:async()=>{adapterVerifierDispatchCalls++;return {status:"completed",verified:true};}
};
const noAdapterVerifierResult=await executeNexoStepWithContinuityOwner({
  missionId:"no-adapter-verifier-mission",stepId:"step-1",owner:noAdapterVerifierOwner,adapter:noAdapterVerifier
});
assert.equal(noAdapterVerifierResult.status,"blocked");
assert.equal(noAdapterVerifierResult.code,"NEXO_EFFECT_RECONCILIATION_VERIFIER_UNAVAILABLE");
assert.equal(noAdapterVerifierResult.dispatchAttempted,false);
assert.equal(adapterVerifierPrepareCalls,0,"missing adapter verifier must block before PREPARED");
assert.equal(adapterVerifierDispatchCalls,0,"missing adapter verifier must block before dispatch");

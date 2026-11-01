import assert from "node:assert/strict";
import { buildNexoMission } from "../../src/nexo/orchestrator.js";
import { createEffectAdapter } from "../../src/nexo/effect-adapter.js";
import { executeNexoStep, executeNexoStepWithContinuityOwner, replanPersistedNexoMission } from "../../src/nexo/runtime.js";
import { createNexoMissionMemory, recordNexoPlan } from "../../src/nexo/mission-memory.mjs";

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
const result=await executeNexoStep({mission,stepId:"step-1",adapter,memory:createNexoMissionMemory(),precondition:({stateVersion})=>stateVersion===1,postcondition:({effectResult})=>effectResult.details==="position repaired"});
assert.equal(result.status,"completed"); assert.equal(result.mission.steps[0].status,"completed"); assert.equal(result.memory.nexo.attempts.length,1); assert.equal(result.memory.nexo.attempts[0].status,"completed");

const unsupportedMission=buildNexoMission({reports:[{findings:[{severity:"warning",code:"AGENT_POSITION",agent:"bruno",message:"bad"}]}]});
const unsupported=await executeNexoStep({mission:unsupportedMission,stepId:"step-1",adapter:createEffectAdapter(),memory:createNexoMissionMemory()});
assert.equal(unsupported.status,"blocked"); assert.equal(unsupported.mission.status,"blocked"); assert.equal(unsupported.memory.nexo.attempts[0].status,"blocked");

const terminalEffectEntries=Array.from({length:200},(_,i)=>({
  idempotencyKey:`terminal-normalization:${i}`,status:"settled_observed",
  result:{status:"completed",evidence:{kind:"test"}}
}));
const unresolvedPreparedEntry={
  idempotencyKey:"preserve-prepared-normalization",missionId:"old-mission",stepId:"old-step",
  action:"ambiguous_effect",target:"alex",status:"prepared"
};
const normalizedJournal=createNexoMissionMemory({
  nexo:{effectJournal:[unresolvedPreparedEntry,...terminalEffectEntries]}
}).nexo.effectJournal;
assert.equal(normalizedJournal.length,200);
assert.ok(normalizedJournal.some(entry=>entry.idempotencyKey==="preserve-prepared-normalization"),
  "memory normalization must not truncate an unresolved prepared effect");
assert.equal(normalizedJournal.some(entry=>entry.idempotencyKey==="terminal-normalization:0"),false,
  "memory normalization should prune terminal history before unresolved operations");
assert.notEqual(normalizedJournal.find(entry=>entry.idempotencyKey==="preserve-prepared-normalization"),unresolvedPreparedEntry,
  "memory normalization must detach journal records");
const unresolvedOnly=createNexoMissionMemory({
  nexo:{effectJournal:Array.from({length:201},(_,i)=>({
    idempotencyKey:`prepared-only:${i}`,status:"prepared"
  }))}
}).nexo.effectJournal;
assert.equal(unresolvedOnly.length,201,
  "unresolved prepared operations may exceed the soft history cap rather than be discarded");


const unknownRuntimeMemory=createNexoMissionMemory();
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
const unknownPersistedMemory=createNexoMissionMemory(unknownRuntimeResult.memory);
const unknownReconstructedMission=(await import("../../src/nexo/mission-memory.mjs"))
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
const staleMissionMemory=createNexoMissionMemory(unknownPersistedMemory);
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
const unverifiedCompletionMemory=createNexoMissionMemory();
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
const observedSettlementMemory = recordNexoPlan(createNexoMissionMemory(), observedSettlementMission);
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


// Replan options are an external boundary: accessor fields must be rejected
// before memory normalization, mission reconstruction, or ordinary reads.
let runtimeOptionGetterCalls = 0;
const accessorReplanOptions = {};
Object.defineProperty(accessorReplanOptions, "memory", {
  enumerable: true,
  get() {
    runtimeOptionGetterCalls += 1;
    throw new Error("replan memory getter must not execute");
  }
});
const rejectedAccessorReplan = replanPersistedNexoMission(accessorReplanOptions);
assert.equal(runtimeOptionGetterCalls, 0);
assert.equal(rejectedAccessorReplan.status, "invalid");
assert.equal(rejectedAccessorReplan.code, "NEXO_RUNTIME_OPTIONS_INVALID");

assert.equal(
  replanPersistedNexoMission(Object.create({ memory: createNexoMissionMemory(), previousMissionId: "inherited-mission" })).code,
  "NEXO_RUNTIME_OPTIONS_INVALID"
);

const rejectedAccessorExecution = await executeNexoStep(accessorReplanOptions);
assert.equal(runtimeOptionGetterCalls, 0);
assert.equal(rejectedAccessorExecution.status, "invalid");
assert.equal(rejectedAccessorExecution.code, "NEXO_RUNTIME_OPTIONS_INVALID");

const accessorAdapterOptions = {};
Object.defineProperty(accessorAdapterOptions, "adapter", {
  enumerable: true,
  get() {
    runtimeOptionGetterCalls += 1;
    throw new Error("runtime adapter getter must not execute");
  }
});
const rejectedAccessorAdapter = await executeNexoStep(accessorAdapterOptions);
assert.equal(runtimeOptionGetterCalls, 0);
assert.equal(rejectedAccessorAdapter.code, "NEXO_RUNTIME_OPTIONS_INVALID");


// Nested runtime contract guards: accessors must be rejected before the runtime
// reads mission metadata/steps or adapter methods.
let nestedContractGetterCalls = 0;
const accessorMission = { ...mission };
Object.defineProperty(accessorMission, "missionId", {
  enumerable: true,
  get() {
    nestedContractGetterCalls += 1;
    throw new Error("missionId getter must not execute");
  }
});
const rejectedAccessorMission = await executeNexoStep({
  mission: accessorMission,
  stepId: "step-1",
  adapter: createEffectAdapter(),
  memory: createNexoMissionMemory()
});
assert.equal(nestedContractGetterCalls, 0);
assert.equal(rejectedAccessorMission.status, "invalid");
assert.equal(rejectedAccessorMission.code, "NEXO_RUNTIME_CONTRACT_INPUT_INVALID");

const nestedAccessorMission = structuredClone(mission);
Object.defineProperty(nestedAccessorMission.steps[0], "id", {
  enumerable: true,
  get() {
    nestedContractGetterCalls += 1;
    throw new Error("nested step id getter must not execute");
  }
});
const accessorAdapter = {};
Object.defineProperty(accessorAdapter, "execute", {
  enumerable: true,
  get() {
    nestedContractGetterCalls += 1;
    throw new Error("adapter execute getter must not execute");
  }
});
const rejectedNestedAdapter = await executeNexoStep({
  mission,
  stepId: "step-1",
  adapter: accessorAdapter,
  memory: createNexoMissionMemory()
});
assert.equal(nestedContractGetterCalls, 0);
assert.equal(rejectedNestedAdapter.status, "invalid");
assert.equal(rejectedNestedAdapter.code, "NEXO_RUNTIME_CONTRACT_INPUT_INVALID");

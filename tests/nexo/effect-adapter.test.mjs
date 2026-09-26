import assert from "node:assert/strict";
import { createEffectAdapter } from "../../src/nexo/effect-adapter.js";

let version=1, calls=0;
const adapter=createEffectAdapter({
  getStateVersion:()=>version,
  handlers:{
    safe_repair: async ({target})=>{ calls++; version++; return {status:"completed",details:"changed "+target}; },
    partial_repair: async ()=>{ version++; return {status:"failed",code:"PARTIAL_EFFECT"}; },
  }
});

const stale=await adapter.execute({
  missionId:"m1",stepId:"s1",action:"safe_repair",target:"alex",idempotencyKey:"m1:s1",
  precondition:({stateVersion})=>stateVersion===2,
  postcondition:()=>true
});
assert.equal(stale.status,"blocked");
assert.equal(stale.code,"PRECONDITION_FAILED");
assert.equal(calls,0);

const ok=await adapter.execute({
  missionId:"m1",stepId:"s1",action:"safe_repair",target:"alex",idempotencyKey:"m1:s2",
  precondition:({stateVersion})=>stateVersion===1,
  postcondition:({effectResult})=>effectResult.details.includes("alex")
});
assert.equal(ok.status,"completed");
assert.equal(ok.verified,true);
assert.equal(ok.evidence.kind,"effect-postcondition");
assert.equal(calls,1);

const duplicate=await adapter.execute({
  missionId:"m1",stepId:"s1",action:"safe_repair",target:"alex",idempotencyKey:"m1:s2",
  precondition:()=>{throw new Error("must not execute twice");},
  postcondition:()=>false
});
assert.equal(duplicate.status,"completed");
assert.equal(calls,1);

const mismatch=await adapter.execute({
  missionId:"m1",stepId:"s2",action:"safe_repair",target:"alex",idempotencyKey:"m1:s3",
  precondition:()=>true,postcondition:()=>false
});
assert.equal(mismatch.status,"failed");
assert.equal(mismatch.code,"POSTCONDITION_FAILED");
assert.equal(mismatch.verified,false);

const concurrent=await adapter.execute({
  missionId:"m1",stepId:"s2",action:"safe_repair",target:"alex",idempotencyKey:"m1:s6",
  precondition:async()=>{ version++; return true; },
  postcondition:()=>true
});
assert.equal(concurrent.status,"blocked");
assert.equal(concurrent.code,"STATE_CHANGED_DURING_PRECONDITION");
assert.equal(calls,2);

const partial=await adapter.execute({
  missionId:"m1",stepId:"s3",action:"partial_repair",target:"alex",idempotencyKey:"m1:s4"
});
assert.equal(partial.status,"failed");
assert.equal(partial.code,"PARTIAL_EFFECT_DETECTED");
assert.equal(partial.verified,false);

const partialRetry=await adapter.execute({
  missionId:"m1",stepId:"s3",action:"partial_repair",target:"alex",idempotencyKey:"m1:s4"
});
assert.equal(partialRetry.code,"PARTIAL_EFFECT_DETECTED");
let exceptionCalls=0;
const exceptionJournal=[];
const exceptionAdapter=createEffectAdapter({executionJournal:exceptionJournal,handlers:{ambiguous_effect:async()=>{exceptionCalls++;throw new Error("provider timeout after send");}}});
const ambiguous=await exceptionAdapter.execute({missionId:"m8",stepId:"s1",action:"ambiguous_effect",target:"alex",idempotencyKey:"m8:s1",precondition:()=>true});
assert.equal(ambiguous.status,"blocked");
assert.equal(ambiguous.code,"EFFECT_OUTCOME_UNKNOWN");
assert.equal(ambiguous.uncertainty,"effect_may_or_may_not_have_occurred");
assert.equal(exceptionCalls,1);
assert.equal(exceptionJournal[0].status,"blocked");
assert.equal(exceptionJournal[0].result.code,"EFFECT_OUTCOME_UNKNOWN");

const evidenceMismatch=await adapter.execute({
  missionId:"m1",stepId:"s4",action:"safe_repair",target:"alex",idempotencyKey:"m1:s7",
  precondition:()=>true,postcondition:()=>({verified:true,kind:"fake"})
});
assert.equal(evidenceMismatch.status,"failed");
assert.equal(evidenceMismatch.code,"POSTCONDITION_FAILED");
assert.equal(evidenceMismatch.verified,false);

const unsupported=await adapter.execute({
  missionId:"m1",stepId:"s5",action:"unknown_action",idempotencyKey:"m1:s5"
});
assert.equal(unsupported.status,"unsupported");
assert.equal(unsupported.verified,false);

const sharedJournal=[];
let overlapCalls=0;
let releaseOverlap;
const overlapGate=new Promise(resolve=>{ releaseOverlap=resolve; });
let overlapStartedResolve;
const overlapStarted=new Promise(resolve=>{ overlapStartedResolve=resolve; });
const adapterA=createEffectAdapter({
  getStateVersion:()=>1,
  executionJournal:sharedJournal,
  handlers:{overlap_repair:async()=>{ overlapCalls++; overlapStartedResolve(); await overlapGate; return {status:"completed",details:"overlap"}; }}
});
const adapterB=createEffectAdapter({
  getStateVersion:()=>1,
  executionJournal:sharedJournal,
  handlers:{overlap_repair:async()=>{ overlapCalls++; return {status:"completed",details:"duplicate-side-effect"}; }}
});
const overlapRequest={missionId:"m2",stepId:"s1",action:"overlap_repair",target:"alex",idempotencyKey:"m2:s1",precondition:()=>true,postcondition:()=>true};
const firstOverlap=adapterA.execute(overlapRequest);
await overlapStarted;
const secondOverlap=adapterB.execute({...overlapRequest,precondition:()=>{throw new Error("overlap loser must not run precondition");}});
assert.equal(overlapCalls,1);
releaseOverlap();
const [overlapResultA,overlapResultB]=await Promise.all([firstOverlap,secondOverlap]);
assert.equal(overlapResultA.status,"completed");
assert.equal(overlapResultB.status,"completed");
assert.deepEqual(overlapResultA,overlapResultB);
assert.equal(overlapCalls,1);
assert.equal(sharedJournal.filter(x=>x.idempotencyKey==="m2:s1").length,1);

const stateJournal=[];
let stateVersion=0;
let stateCalls=0;
let releaseState;
const stateGate=new Promise(resolve=>{ releaseState=resolve; });
const stateAdapterA=createEffectAdapter({
  getStateVersion:()=>stateVersion,
  executionJournal:stateJournal,
  handlers:{stateful_effect:async()=>{ stateCalls++; await stateGate; stateVersion++; return {status:"completed",details:"state-change"}; }}
});
const stateAdapterB=createEffectAdapter({
  getStateVersion:()=>stateVersion,
  executionJournal:stateJournal,
  handlers:{stateful_effect:async()=>{ stateCalls++; stateVersion++; return {status:"completed",details:"second-state-change"}; }}
});
const firstState=stateAdapterA.execute({missionId:"m3",stepId:"s1",action:"stateful_effect",target:"alex",idempotencyKey:"m3:s1",precondition:({stateVersion})=>stateVersion===0,postcondition:()=>true});
await Promise.resolve();
const secondState=stateAdapterB.execute({missionId:"m3",stepId:"s2",action:"stateful_effect",target:"bruno",idempotencyKey:"m3:s2",precondition:({stateVersion})=>stateVersion===1,postcondition:()=>true});
await Promise.resolve();
assert.equal(stateCalls,1);
releaseState();
const [stateResultA,stateResultB]=await Promise.all([firstState,secondState]);
assert.equal(stateResultA.status,"completed");
assert.equal(stateResultB.status,"completed");
assert.equal(stateCalls,2);
assert.equal(stateVersion,2);
assert.equal(stateJournal.filter(x=>x.idempotencyKey==="m3:s1").length,1);
assert.equal(stateJournal.filter(x=>x.idempotencyKey==="m3:s2").length,1);

const preparedJournal=[];
let preparedCalls=0;
const preparedAdapter=createEffectAdapter({
  executionJournal:preparedJournal,
  handlers:{prepared_effect:async()=>{preparedCalls++; return {status:"completed",details:"prepared-ok"};}}
});
const preparedResult=await preparedAdapter.execute({missionId:"m4",stepId:"s1",action:"prepared_effect",target:"alex",idempotencyKey:"m4:s1",precondition:()=>true,postcondition:()=>true});
assert.equal(preparedResult.status,"completed");
assert.equal(preparedCalls,1);
assert.equal(preparedJournal[0].status,"completed");
assert.ok(preparedJournal[0].result);

const preparedOnlyJournal=[{idempotencyKey:"m5:s1",missionId:"m5",stepId:"s1",action:"prepared_effect",target:"alex",status:"prepared"}];
let recoveryCalls=0;
const recoveryAdapter=createEffectAdapter({executionJournal:preparedOnlyJournal,handlers:{prepared_effect:async()=>{recoveryCalls++; return {status:"completed",details:"unsafe-retry"};}}});
const unresolved=await recoveryAdapter.execute({missionId:"m5",stepId:"s1",action:"prepared_effect",target:"alex",idempotencyKey:"m5:s1",precondition:()=>true,postcondition:()=>true});
assert.equal(unresolved.status,"blocked");
assert.equal(unresolved.code,"EFFECT_RECONCILIATION_REQUIRED");
assert.equal(recoveryCalls,0);
assert.equal(preparedOnlyJournal[0].status,"prepared");

const reconcileResult=await recoveryAdapter.execute({
  missionId:"m5",stepId:"s1",action:"prepared_effect",target:"alex",idempotencyKey:"m5:s1",
  reconcile:async({journalEntry})=>({status:"completed",verified:true,evidence:{verified:true,kind:"external-effect-reconciled",details:"already observed"},source:journalEntry.status})
});
assert.equal(reconcileResult.status,"completed");
assert.equal(reconcileResult.verified,true);
assert.equal(preparedOnlyJournal[0].status,"completed");
assert.equal(recoveryCalls,0);

const invalidReconcileJournal=[{idempotencyKey:"m6:s1",missionId:"m6",stepId:"s1",action:"prepared_effect",target:"alex",status:"prepared"}];
const invalidReconcileAdapter=createEffectAdapter({executionJournal:invalidReconcileJournal,handlers:{prepared_effect:async()=>{throw new Error("must not execute");}}});
const invalidReconcile=await invalidReconcileAdapter.execute({
  missionId:"m6",stepId:"s1",action:"prepared_effect",target:"alex",idempotencyKey:"m6:s1",
  reconcile:()=>({status:"completed",verified:false})
});
assert.equal(invalidReconcile.status,"blocked");
assert.equal(invalidReconcile.code,"UNVERIFIED_RECONCILIATION");
assert.equal(invalidReconcileJournal[0].status,"prepared");
const failedReconcileJournal=[{idempotencyKey:"m7:s1",missionId:"m7",stepId:"s1",action:"prepared_effect",target:"alex",status:"prepared"}];
const failedReconcileAdapter=createEffectAdapter({executionJournal:failedReconcileJournal,handlers:{prepared_effect:async()=>{throw new Error("must not execute");}}});
const failedReconcile=await failedReconcileAdapter.execute({
  missionId:"m7",stepId:"s1",action:"prepared_effect",target:"alex",idempotencyKey:"m7:s1",
  reconcile:async()=>({status:"blocked",code:"PROVIDER_UNAVAILABLE",verified:false})
});
assert.equal(failedReconcile.status,"blocked");
assert.equal(failedReconcile.code,"PROVIDER_UNAVAILABLE");
assert.equal(failedReconcileJournal[0].status,"prepared");
const laterReconcile=await failedReconcileAdapter.execute({
  missionId:"m7",stepId:"s1",action:"prepared_effect",target:"alex",idempotencyKey:"m7:s1",
  reconcile:async()=>({status:"completed",verified:true,evidence:{verified:true,kind:"later-reconciliation"}})
});
assert.equal(laterReconcile.status,"completed");
assert.equal(failedReconcileJournal[0].status,"completed");

console.log("Nexo: adaptador tipado con concurrencia, idempotencia, detección de efecto parcial y evidencia estricta OK.");

import assert from "node:assert/strict";
import { createEffectAdapter } from "../../src/nexo/effect-adapter.js";

let version=1, calls=0;
const executionJournal=[];
const adapter=createEffectAdapter({
  getStateVersion:()=>version,
  executionJournal,
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
assert.equal(mismatch.status,"blocked");
assert.equal(mismatch.code,"POSTCONDITION_FAILED");
assert.equal(mismatch.verified,false);
assert.equal(executionJournal.find(x=>x.idempotencyKey==="m1:s3")?.status,"prepared", "unverified effect must remain unresolved");
assert.equal(executionJournal.find(x=>x.idempotencyKey==="m1:s3")?.result,undefined);

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
assert.equal(partial.status,"blocked");
assert.equal(partial.code,"PARTIAL_EFFECT_DETECTED");
assert.equal(partial.verified,false);
assert.equal(executionJournal.find(x=>x.idempotencyKey==="m1:s4")?.status,"prepared");
assert.equal(executionJournal.find(x=>x.idempotencyKey==="m1:s4")?.result,undefined);
const versionAfterPartial=version;

const partialRetry=await adapter.execute({
  missionId:"m1",stepId:"s3",action:"partial_repair",target:"alex",idempotencyKey:"m1:s4"
});
assert.equal(partialRetry.status,"blocked");
assert.equal(partialRetry.code,"EFFECT_RECONCILIATION_REQUIRED");
assert.equal(calls,2, "unresolved partial effect must not re-enter other handler");
assert.equal(version,versionAfterPartial, "unresolved partial effect handler must not be redispatched");
let exceptionCalls=0;
const exceptionJournal=[];
const exceptionAdapter=createEffectAdapter({executionJournal:exceptionJournal,handlers:{ambiguous_effect:async()=>{exceptionCalls++;throw new Error("provider timeout after send");}}});
const ambiguous=await exceptionAdapter.execute({missionId:"m8",stepId:"s1",action:"ambiguous_effect",target:"alex",idempotencyKey:"m8:s1",precondition:()=>true});
assert.equal(ambiguous.status,"blocked");
assert.equal(ambiguous.code,"EFFECT_OUTCOME_UNKNOWN");
assert.equal(ambiguous.uncertainty,"effect_may_or_may_not_have_occurred");
assert.equal(exceptionCalls,1);
assert.equal(exceptionJournal[0].status,"prepared");
assert.equal(exceptionJournal[0].result,undefined);
let exceptionReconcileCalls=0;
const exceptionReconciled=await exceptionAdapter.execute({missionId:"m8",stepId:"s1",action:"ambiguous_effect",target:"alex",idempotencyKey:"m8:s1",reconcile:async()=>{exceptionReconcileCalls++;return {status:"completed",verified:true,evidence:{verified:true,kind:"provider-query"}};}});
assert.equal(exceptionReconciled.status,"blocked");
assert.equal(exceptionReconciled.code,"RECONCILIATION_AUTHORITY_UNAVAILABLE");
assert.equal(exceptionReconcileCalls,0,"caller-supplied reconciliation callback must not be invoked as its own authority");
assert.equal(exceptionJournal[0].status,"prepared","caller assertion must not terminalize the unresolved effect");

const terminalIdentityJournal=[{idempotencyKey:"m7:s1",missionId:"m7",stepId:"s1",action:"original_effect",target:{resource:"alex"},status:"completed",result:{status:"completed",verified:true,action:"original_effect",target:{resource:"alex"},idempotencyKey:"m7:s1"}}];
const terminalIdentityAdapter=createEffectAdapter({executionJournal:terminalIdentityJournal});
const terminalIdentityMismatch=await terminalIdentityAdapter.execute({missionId:"m7",stepId:"s1",action:"different_effect",target:{resource:"alex"},idempotencyKey:"m7:s1"});
assert.equal(terminalIdentityMismatch.status,"blocked");
assert.equal(terminalIdentityMismatch.code,"EFFECT_IDENTITY_MISMATCH","terminal cached results must not be replayed for a different semantic operation");
assert.equal(terminalIdentityJournal[0].status,"completed","rejecting alias must not rewrite original terminal history");

const evidenceMismatch=await adapter.execute({
  missionId:"m1",stepId:"s4",action:"safe_repair",target:"alex",idempotencyKey:"m1:s7",
  precondition:()=>true,postcondition:()=>({verified:true,kind:"fake"})
});
assert.equal(evidenceMismatch.status,"blocked");
assert.equal(evidenceMismatch.code,"POSTCONDITION_FAILED");
assert.equal(evidenceMismatch.verified,false);
assert.equal(executionJournal.find(x=>x.idempotencyKey==="m1:s7")?.status,"prepared");
assert.equal(executionJournal.find(x=>x.idempotencyKey==="m1:s7")?.result,undefined);

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

const mismatchedReconcileJournal=[{idempotencyKey:"m5x:s1",missionId:"m5x",stepId:"s1",action:"prepared_effect",target:{resource:"alex"},status:"prepared"}];
let mismatchedReconcileCalls=0;
const mismatchedReconcileAdapter=createEffectAdapter({executionJournal:mismatchedReconcileJournal,handlers:{prepared_effect:async()=>{throw new Error("must not execute");}}});
const mismatchedReconcile=await mismatchedReconcileAdapter.execute({
  missionId:"m5x",stepId:"s1",action:"different_effect",target:{resource:"alex"},idempotencyKey:"m5x:s1",
  reconcile:()=>{mismatchedReconcileCalls++;return {status:"completed",verified:true,evidence:{verified:true,kind:"forged"}};}
});
assert.equal(mismatchedReconcile.status,"blocked");
assert.equal(mismatchedReconcile.code,"EFFECT_IDENTITY_MISMATCH");
assert.equal(mismatchedReconcileCalls,0,"identity mismatch must be rejected before reconciliation evidence is requested");
assert.equal(mismatchedReconcileJournal[0].status,"prepared");

let reconcileCalls=0;
const reconcileResult=await recoveryAdapter.execute({
  missionId:"m5",stepId:"s1",action:"prepared_effect",target:"alex",idempotencyKey:"m5:s1",
  reconcile:async()=>{reconcileCalls++;return {status:"completed",verified:true,evidence:{verified:true,kind:"external-effect-reconciled",details:"already observed"}};}
});
assert.equal(reconcileResult.status,"blocked");
assert.equal(reconcileResult.code,"RECONCILIATION_AUTHORITY_UNAVAILABLE");
assert.equal(reconcileResult.verified,false);
assert.equal(reconcileCalls,0);
assert.equal(preparedOnlyJournal[0].status,"prepared");
assert.equal(recoveryCalls,0);

const invalidReconcileJournal=[{idempotencyKey:"m6:s1",missionId:"m6",stepId:"s1",action:"prepared_effect",target:"alex",status:"prepared"}];
const invalidReconcileAdapter=createEffectAdapter({executionJournal:invalidReconcileJournal,handlers:{prepared_effect:async()=>{throw new Error("must not execute");}}});
const invalidReconcile=await invalidReconcileAdapter.execute({
  missionId:"m6",stepId:"s1",action:"prepared_effect",target:"alex",idempotencyKey:"m6:s1",
  reconcile:()=>({status:"completed",verified:false})
});
assert.equal(invalidReconcile.status,"blocked");
assert.equal(invalidReconcile.code,"RECONCILIATION_AUTHORITY_UNAVAILABLE");
assert.equal(invalidReconcileJournal[0].status,"prepared");
const failedReconcileJournal=[{idempotencyKey:"m7:s1",missionId:"m7",stepId:"s1",action:"prepared_effect",target:"alex",status:"prepared"}];
const failedReconcileAdapter=createEffectAdapter({executionJournal:failedReconcileJournal,handlers:{prepared_effect:async()=>{throw new Error("must not execute");}}});
const failedReconcile=await failedReconcileAdapter.execute({
  missionId:"m7",stepId:"s1",action:"prepared_effect",target:"alex",idempotencyKey:"m7:s1",
  reconcile:async()=>({status:"blocked",code:"PROVIDER_UNAVAILABLE",verified:false})
});
assert.equal(failedReconcile.status,"blocked");
assert.equal(failedReconcile.code,"RECONCILIATION_AUTHORITY_UNAVAILABLE");
assert.equal(failedReconcileJournal[0].status,"prepared");
let laterReconcileCalls=0;
const laterReconcile=await failedReconcileAdapter.execute({
  missionId:"m7",stepId:"s1",action:"prepared_effect",target:"alex",idempotencyKey:"m7:s1",
  reconcile:async()=>{laterReconcileCalls++;return {status:"completed",verified:true,evidence:{verified:true,kind:"later-reconciliation"}};}
});
assert.equal(laterReconcile.status,"blocked");
assert.equal(laterReconcile.code,"RECONCILIATION_AUTHORITY_UNAVAILABLE");
assert.equal(laterReconcileCalls,0);
assert.equal(failedReconcileJournal[0].status,"prepared");


const retentionJournal=Array.from({length:200},(_,i)=>({
  idempotencyKey:`terminal:${i}`,status:"completed",result:{status:"completed"}
}));
retentionJournal.push({
  idempotencyKey:"must-survive:prepared",missionId:"old-mission",stepId:"old-step",
  action:"retention_probe",target:"alex",status:"prepared"
});
const retentionAdapter=createEffectAdapter({
  executionJournal:retentionJournal,
  handlers:{retention_probe:async()=>({status:"completed",details:"new operation"})}
});
const retentionResult=await retentionAdapter.execute({
  missionId:"new-mission",stepId:"new-step",action:"retention_probe",target:"bruno",
  idempotencyKey:"new-mission:new-step",precondition:()=>true,postcondition:()=>true
});
assert.equal(retentionResult.status,"completed");
assert.ok(retentionJournal.some(entry=>entry.idempotencyKey==="must-survive:prepared"),
  "journal pruning must preserve unresolved prepared operations");
assert.ok(retentionJournal.length<=200);

console.log("Nexo: adaptador tipado con concurrencia, idempotencia, detección de efecto parcial y evidencia estricta OK.");

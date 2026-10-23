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
const callsAfterUnverifiedPostcondition=calls;
const versionAfterUnverifiedPostcondition=version;
const unverifiedRetry=await adapter.execute({
  missionId:"m1",stepId:"s2",action:"safe_repair",target:"alex",idempotencyKey:"m1:s3",
  precondition:()=>{throw new Error("unverified effect must not be redispatched");},postcondition:()=>true
});
assert.equal(unverifiedRetry.status,"blocked");
assert.equal(unverifiedRetry.code,"EFFECT_RECONCILIATION_REQUIRED");
assert.equal(calls,callsAfterUnverifiedPostcondition);
assert.equal(version,versionAfterUnverifiedPostcondition);

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

// A handler-reported failure with no observed revision change is still ambiguous.
// The generic adapter has no operation-specific proof that the effect did not occur.
const noMutationJournal=[];
let noMutationCalls=0;
const noMutationAdapter=createEffectAdapter({
  getStateVersion:()=>0,
  executionJournal:noMutationJournal,
  handlers:{ambiguous_failure:async()=>{noMutationCalls++;return {status:"failed",code:"PROVIDER_REJECTED"};}}
});
const noMutationFailure=await noMutationAdapter.execute({
  missionId:"m9",stepId:"s1",action:"ambiguous_failure",target:"alex",idempotencyKey:"m9:s1",
  precondition:()=>true
});
assert.equal(noMutationFailure.status,"blocked");
assert.equal(noMutationFailure.code,"EFFECT_OUTCOME_UNKNOWN");
assert.equal(noMutationFailure.stateChanged,false);
assert.equal(noMutationFailure.uncertainty,"effect_may_or_may_not_have_occurred");
assert.equal(noMutationJournal[0].status,"prepared");
assert.equal(noMutationJournal[0].result,undefined);
const noMutationRetry=await noMutationAdapter.execute({
  missionId:"m9",stepId:"s1",action:"ambiguous_failure",target:"alex",idempotencyKey:"m9:s1"
});
assert.equal(noMutationRetry.status,"blocked");
assert.equal(noMutationRetry.code,"EFFECT_RECONCILIATION_REQUIRED");
assert.equal(noMutationCalls,1,"ambiguous failure must not be redispatched");

let invalidResultCalls=0;
const invalidResultJournal=[];
const invalidResultAdapter=createEffectAdapter({
  getStateVersion:()=>0,
  executionJournal:invalidResultJournal,
  handlers:{invalid_result:async()=>{invalidResultCalls++;return {success:false};}}
});
const invalidResult=await invalidResultAdapter.execute({
  missionId:"m10",stepId:"s1",action:"invalid_result",target:"alex",idempotencyKey:"m10:s1",
  precondition:()=>true
});
assert.equal(invalidResult.status,"blocked");
assert.equal(invalidResult.code,"EFFECT_OUTCOME_UNKNOWN");
assert.equal(invalidResultJournal[0].status,"prepared");
assert.equal(invalidResultJournal[0].result,undefined);
assert.equal(invalidResultCalls,1);

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


// Canonical-runtime preflight can inspect handler presence before admitting PREPARED.
// This is capability discovery only; it does not claim reconciliation or authorization.
let capabilityCalls=0;
const capabilityAdapter=createEffectAdapter({handlers:{
  registered_effect:async()=>{capabilityCalls++;return {status:"completed"};}
}});
assert.equal(capabilityAdapter.supports("registered_effect"),true);
assert.equal(capabilityAdapter.supports("missing_effect"),false);
assert.equal(capabilityAdapter.supports(""),false);
capabilityAdapter.register("later_registered_effect",async()=>({status:"completed"}));
assert.equal(capabilityAdapter.supports("later_registered_effect"),true);
assert.equal(capabilityAdapter.supports("missing_effect"),false);
assert.equal(capabilityCalls,0,"capability discovery must not dispatch a handler");

const trustedProbeJournal=[{idempotencyKey:"probe-m1:s1",missionId:"probe-m1",stepId:"s1",action:"persisted_write",target:"alpha",status:"prepared"}];
let trustedProbeCalls=0, trustedDispatchCalls=0;
const trustedProbeAdapter=createEffectAdapter({
 executionJournal:trustedProbeJournal,
 handlers:{persisted_write:async()=>{trustedDispatchCalls++;return {status:"completed"};}},
 verifiers:{persisted_write:async op=>{trustedProbeCalls++;return {status:"applied",action:op.action,target:op.target,idempotencyKey:op.idempotencyKey,observedRevision:7,source:"persisted-state-reader",evidence:{invariantPresent:true}};}}
});
assert.equal(trustedProbeAdapter.supportsReconciliation("persisted_write"),true);
assert.equal(trustedProbeAdapter.supportsReconciliation("other"),false);
const trustedProbe=await trustedProbeAdapter.verifyPrepared({idempotencyKey:"probe-m1:s1",missionId:"probe-m1",stepId:"s1",action:"persisted_write",target:"alpha"});
assert.equal(trustedProbe.status,"applied");
assert.equal(trustedProbe.observedRevision,7);
assert.equal(trustedProbe.journalSettled,false);
assert.equal(trustedProbe.redispatchAuthorized,false);
assert.equal(trustedProbeJournal[0].status,"prepared");
assert.equal(trustedDispatchCalls,0);
assert.equal(trustedProbeCalls,1);
const badIdentityProbe=await trustedProbeAdapter.verifyPrepared({idempotencyKey:"probe-m1:s1",missionId:"probe-m1",stepId:"s1",action:"persisted_write",target:"beta"});
assert.equal(badIdentityProbe.status,"unknown");
assert.equal(badIdentityProbe.code,"EFFECT_IDENTITY_MISMATCH");
assert.equal(trustedProbeCalls,1);
const noVerifierProbe=await createEffectAdapter({executionJournal:trustedProbeJournal}).verifyPrepared({idempotencyKey:"probe-m1:s1",missionId:"probe-m1",stepId:"s1",action:"persisted_write",target:"alpha"});
assert.equal(noVerifierProbe.status,"unknown");
assert.equal(noVerifierProbe.code,"EFFECT_RECONCILIATION_VERIFIER_UNAVAILABLE");
const invalidProbeAdapter=createEffectAdapter({executionJournal:[{idempotencyKey:"probe-m2:s1",missionId:"probe-m2",stepId:"s1",action:"persisted_write",target:"gamma",status:"prepared"}],verifiers:{persisted_write:async op=>({status:"applied",action:op.action,target:op.target,idempotencyKey:"wrong",observedRevision:7,source:"reader"})}});
const invalidProbe=await invalidProbeAdapter.verifyPrepared({idempotencyKey:"probe-m2:s1",missionId:"probe-m2",stepId:"s1",action:"persisted_write",target:"gamma"});
assert.equal(invalidProbe.status,"unknown");
assert.equal(invalidProbe.code,"EFFECT_RECONCILIATION_EVIDENCE_INVALID");
console.log("Nexo: trusted per-action verifier probe remains read-only and never dispatches.");


// Canonical PREPARED receipt is required before executePrepared can dispatch.
const canonicalLocalJournal=[];
let canonicalDispatches=0, canonicalPersistCalls=0;
const canonicalAdapter=createEffectAdapter({
  executionJournal:canonicalLocalJournal,
  persistPreparedIntent:async()=>{canonicalPersistCalls++;},
  handlers:{canonical_effect:async()=>{canonicalDispatches++;return {status:"completed",details:"canonical-ok"};}}
});
const canonicalRequest={
  missionId:"canonical-m1",stepId:"s1",action:"canonical_effect",target:{resource:"alpha"},
  idempotencyKey:"canonical-m1:s1",
  preparedOperation:{missionId:"canonical-m1",stepId:"s1",action:"canonical_effect",target:{resource:"alpha"},idempotencyKey:"canonical-m1:s1"},
  precondition:()=>true,postcondition:()=>true
};
const invalidCanonicalReceipt=await canonicalAdapter.executePrepared(canonicalRequest,{preparedCommit:{status:"committed",preparedCommitted:false,storeRevision:4}});
assert.equal(invalidCanonicalReceipt.status,"blocked");
assert.equal(invalidCanonicalReceipt.code,"EFFECT_CANONICAL_PREPARE_CONFIRMATION_REQUIRED");
assert.equal(canonicalDispatches,0,"invalid canonical receipt must not dispatch");
assert.equal(canonicalLocalJournal.length,0,"invalid receipt must not create adapter-local PREPARED");
assert.equal(canonicalPersistCalls,0,"invalid receipt must not invoke local persistence hook");

const canonicalResult=await canonicalAdapter.executePrepared(canonicalRequest,{preparedCommit:{status:"committed",preparedCommitted:true,storeRevision:4}});
assert.equal(canonicalResult.status,"completed");
assert.equal(canonicalResult.verified,true);
assert.equal(canonicalDispatches,1);
assert.equal(canonicalLocalJournal.length,0,"canonical mode must not create a second local journal");
assert.equal(canonicalPersistCalls,0,"canonical mode must not call adapter-local PREPARED persistence");
assert.equal(canonicalAdapter.hasExecuted("canonical-m1:s1"),false,"canonical mode must not populate adapter-local result cache");

const conflictingLocalJournal=[{idempotencyKey:"canonical-m2:s1",missionId:"canonical-m2",stepId:"s1",action:"canonical_effect",target:"alpha",status:"prepared"}];
let conflictingDispatches=0, conflictingPersistCalls=0;
const conflictingAdapter=createEffectAdapter({
  executionJournal:conflictingLocalJournal,
  persistPreparedIntent:async()=>{conflictingPersistCalls++;},
  handlers:{canonical_effect:async()=>{conflictingDispatches++;return {status:"completed",details:"must-not-run"};}}
});
const conflictingRequest={
  missionId:"canonical-m2",stepId:"s1",action:"canonical_effect",target:"alpha",
  idempotencyKey:"canonical-m2:s1",
  preparedOperation:{missionId:"canonical-m2",stepId:"s1",action:"canonical_effect",target:"alpha",idempotencyKey:"canonical-m2:s1"},
  precondition:()=>true,postcondition:()=>true
};
const localConflict=await conflictingAdapter.executePrepared(conflictingRequest,{preparedCommit:{status:"committed",preparedCommitted:true,storeRevision:5}});
assert.equal(localConflict.status,"blocked");
assert.equal(localConflict.code,"EFFECT_LOCAL_JOURNAL_CONFLICT_WITH_CANONICAL_PREPARE");
assert.equal(conflictingDispatches,0,"a second ledger's existing obligation must block dispatch");
assert.equal(conflictingLocalJournal[0].status,"prepared","conflicting local obligation must remain unresolved");
assert.equal(conflictingPersistCalls,0);
console.log("Nexo: canonical PREPARED receipt gates dispatch without creating a second adapter journal.");


// Canonical mode must also avoid adapter-local writes when a precondition blocks.
const preconditionLocalJournal=[];
let preconditionDispatches=0, preconditionPersistCalls=0;
const preconditionAdapter=createEffectAdapter({
  executionJournal:preconditionLocalJournal,
  persistPreparedIntent:async()=>{preconditionPersistCalls++;},
  handlers:{canonical_blocked_effect:async()=>{preconditionDispatches++;return {status:"completed"};}}
});
const preconditionRequest={
  missionId:"canonical-m3",stepId:"s1",action:"canonical_blocked_effect",target:"alpha",
  idempotencyKey:"canonical-m3:s1",
  preparedOperation:{missionId:"canonical-m3",stepId:"s1",action:"canonical_blocked_effect",target:"alpha",idempotencyKey:"canonical-m3:s1"},
  precondition:()=>false,postcondition:()=>true
};
const preconditionBlocked=await preconditionAdapter.executePrepared(preconditionRequest,{preparedCommit:{status:"committed",preparedCommitted:true,storeRevision:6}});
assert.equal(preconditionBlocked.status,"blocked");
assert.equal(preconditionBlocked.code,"PRECONDITION_FAILED");
assert.equal(preconditionDispatches,0);
assert.equal(preconditionLocalJournal.length,0,"owner-prepared precondition failure must not create a local journal entry");
assert.equal(preconditionPersistCalls,0,"owner-prepared precondition failure must not call local persistence");
assert.equal(preconditionAdapter.hasExecuted("canonical-m3:s1"),false);
console.log("Nexo: canonical mode precondition block remains single-ledger.");


// Bootstrap options and function registries are public inputs: reject accessors
// through descriptors before copying or invoking any configured capability.
let adapterOptionGetterCalls = 0;
const accessorAdapterOptions = {};
Object.defineProperty(accessorAdapterOptions, "handlers", {
  enumerable: true,
  get() {
    adapterOptionGetterCalls += 1;
    throw new Error("handlers option getter must not execute");
  }
});
assert.throws(() => createEffectAdapter(accessorAdapterOptions), /enumerable data fields/);
assert.equal(adapterOptionGetterCalls, 0);

let handlerRegistryGetterCalls = 0;
const accessorHandlerRegistry = {};
Object.defineProperty(accessorHandlerRegistry, "dangerous_effect", {
  enumerable: true,
  get() {
    handlerRegistryGetterCalls += 1;
    throw new Error("handler registry getter must not execute");
  }
});
assert.throws(() => createEffectAdapter({ handlers: accessorHandlerRegistry }), /enumerable data properties/);
assert.equal(handlerRegistryGetterCalls, 0);

let verifierRegistryGetterCalls = 0;
const accessorVerifierRegistry = {};
Object.defineProperty(accessorVerifierRegistry, "dangerous_effect", {
  enumerable: true,
  get() {
    verifierRegistryGetterCalls += 1;
    throw new Error("verifier registry getter must not execute");
  }
});
assert.throws(() => createEffectAdapter({ verifiers: accessorVerifierRegistry }), /enumerable data properties/);
assert.equal(verifierRegistryGetterCalls, 0);

const guardedBootstrapAdapter = createEffectAdapter({
  handlers: { safe_effect: async () => ({ status: "completed" }) },
  verifiers: { safe_effect: async () => ({ status: "applied" }) },
  getStateVersion: () => 0
});
assert.equal(guardedBootstrapAdapter.supports("safe_effect"), true);
assert.equal(guardedBootstrapAdapter.supportsReconciliation("safe_effect"), true);

\n// Public execute, executePrepared, and verifyPrepared entrypoints must inspect
// caller-owned records before reading fields or accepting a prepare receipt.
let effectRequestGetterCalls = 0;
const accessorEffectRequest = {};
Object.defineProperty(accessorEffectRequest, "missionId", {
  enumerable: true,
  get() {
    effectRequestGetterCalls += 1;
    throw new Error("effect request getter must not execute");
  }
});
const publicRequestAdapter = createEffectAdapter({
  handlers: { safe_effect: async () => ({ status: "completed" }) },
  getStateVersion: () => 0
});
const rejectedExecuteRequest = await publicRequestAdapter.execute(accessorEffectRequest);
assert.equal(effectRequestGetterCalls, 0);
assert.equal(rejectedExecuteRequest.status, "failed");
assert.equal(rejectedExecuteRequest.code, "INVALID_EFFECT_REQUEST");

const rejectedPreparedRequest = await publicRequestAdapter.executePrepared(accessorEffectRequest, {
  preparedCommit: { status: "committed", preparedCommitted: true, storeRevision: 1 }
});
assert.equal(effectRequestGetterCalls, 0);
assert.equal(rejectedPreparedRequest.status, "blocked");
assert.equal(rejectedPreparedRequest.code, "EFFECT_CANONICAL_PREPARE_CONFIRMATION_REQUIRED");

const accessorPreparedOptions = {};
Object.defineProperty(accessorPreparedOptions, "preparedCommit", {
  enumerable: true,
  get() {
    effectRequestGetterCalls += 1;
    throw new Error("preparedCommit getter must not execute");
  }
});
const validPreparedRequest = {
  missionId: "guarded-request",
  stepId: "step-1",
  action: "safe_effect",
  target: null,
  idempotencyKey: "guarded-request:step-1",
  preparedOperation: {
    missionId: "guarded-request",
    stepId: "step-1",
    action: "safe_effect",
    target: null,
    idempotencyKey: "guarded-request:step-1"
  }
};
const rejectedPreparedOptions = await publicRequestAdapter.executePrepared(validPreparedRequest, accessorPreparedOptions);
assert.equal(effectRequestGetterCalls, 0);
assert.equal(rejectedPreparedOptions.status, "blocked");
assert.equal(rejectedPreparedOptions.code, "EFFECT_CANONICAL_PREPARE_CONFIRMATION_REQUIRED");

const accessorVerifyRequest = {};
Object.defineProperty(accessorVerifyRequest, "idempotencyKey", {
  enumerable: true,
  get() {
    effectRequestGetterCalls += 1;
    throw new Error("verify request getter must not execute");
  }
});
const rejectedVerifyRequest = await publicRequestAdapter.verifyPrepared(accessorVerifyRequest);
assert.equal(effectRequestGetterCalls, 0);
assert.equal(rejectedVerifyRequest.status, "unknown");
assert.equal(rejectedVerifyRequest.code, "EFFECT_RECONCILIATION_CONTEXT_INVALID");

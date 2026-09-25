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

console.log("Nexo: adaptador tipado con concurrencia, idempotencia, detección de efecto parcial y evidencia estricta OK.");

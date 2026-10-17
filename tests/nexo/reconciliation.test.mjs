import assert from "node:assert/strict";
import { createReconciliationCase, createReconciler } from "../../src/nexo/core/reconciliation.mjs";

const r = createReconciler();
const c = createReconciliationCase({ boundary: "recovery-boundary", claimId: "claim-1" });

assert.equal(r.reconcile({ reconciliationCase: c, evidence: [] }).status, "UNRESOLVED");
assert.equal(r.reconcile({ reconciliationCase: c, evidence: [{ authoritative: true, outcome: "SEMANTIC_CONFLICT" }] }).status, "RESOLVED");
assert.equal(r.reconcile({ reconciliationCase: c, evidence: [{ authoritative: false, outcome: "SEMANTIC_CONFLICT" }] }).status, "UNRESOLVED");
assert.equal(r.reconcile({ reconciliationCase: null, evidence: [] }).status, "INVALID");
assert.equal(r.reconcile({ reconciliationCase: { boundary: " " }, evidence: [] }).status, "INVALID");
assert.equal(r.reconcile({ reconciliationCase: ["recovery-boundary"], evidence: [] }).status, "INVALID");

const result = r.reconcile({ reconciliationCase: c, evidence: [{ authoritative: true, outcome: "UNKNOWN" }] });
assert.equal(result.status, "UNRESOLVED");
assert.equal(result.outcome, null);
assert.equal(r.reconcile({ reconciliationCase: c, evidence: [{ authoritative: true, outcome: "MADE_UP_OUTCOME" }] }).status, "UNRESOLVED");
assert.equal(r.reconcile({ reconciliationCase: c, evidence: [{ authoritative: true, outcome: "RECONCILE_REQUIRED" }] }).status, "UNRESOLVED");
assert.throws(() => result.evidence.push("x"), TypeError);

const suppliedEvidence = {
  authoritative: true,
  outcome: "SAFE_COMMIT",
  details: { receipt: { digest: "abc" } }
};
const detachedResult = r.reconcile({ reconciliationCase: c, evidence: [suppliedEvidence] });
assert.equal(detachedResult.status, "RESOLVED");
suppliedEvidence.details.receipt.digest = "changed";
assert.equal(detachedResult.evidence[0].details.receipt.digest, "abc");
assert.notEqual(detachedResult.evidence[0], suppliedEvidence);
assert.throws(() => { detachedResult.evidence[0].details.receipt.digest = "mutated"; }, TypeError);
assert.throws(() => { detachedResult.evidence[0].details.receipt = {}; }, TypeError);
assert.equal(r.reconcile({
  reconciliationCase: c,
  evidence: [{ authoritative: true, outcome: "SAFE_COMMIT", details: new Map([["k", "v"]]) }]
}).status, "UNRESOLVED");
assert.throws(() => createReconciliationCase({ boundary: "   " }), /boundary/);
assert.throws(() => createReconciliationCase({ boundary: "recovery", claimId: "  " }), /claimId/);
assert.equal(typeof r.commit, "undefined");
assert.equal(typeof r.execute, "undefined");
assert.equal(typeof r.authorize, "undefined");

console.log("NEXO STEP 6 reconciliation contract tests: PASS");


{
  let getterCalls = 0;
  const hostileEvidence = {
    outcome: "SAFE_COMMIT",
    get authoritative() {
      getterCalls += 1;
      return true;
    }
  };
  const result = r.reconcile({ reconciliationCase: c, evidence: [hostileEvidence] });
  assert.equal(result.status, "UNRESOLVED");
  assert.equal(getterCalls, 0, "reconciliation must reject evidence accessors before reading them");
}

{
  let getterCalls = 0;
  const hostileCase = {};
  Object.defineProperty(hostileCase, "boundary", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "recovery-boundary";
    }
  });
  const result = r.reconcile({ reconciliationCase: hostileCase, evidence: [] });
  assert.equal(result.status, "INVALID");
  assert.equal(getterCalls, 0, "reconciliation case accessors must be rejected before reading them");
}

{
  const hostileEvidence = { authoritative: true, outcome: "SAFE_COMMIT" };
  Object.defineProperty(hostileEvidence, Symbol("hidden"), { value: "omitted by structuredClone" });
  const result = r.reconcile({ reconciliationCase: c, evidence: [hostileEvidence] });
  assert.equal(result.status, "UNRESOLVED", "symbol-keyed evidence must not be silently accepted after cloning");
}

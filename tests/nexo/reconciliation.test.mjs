import assert from "node:assert/strict";
import { createReconciliationCase, createReconciler } from "../../src/nexo/core/reconciliation.mjs";

const r = createReconciler();
const c = createReconciliationCase({ boundary: "recovery-boundary", claimId: "claim-1" });

assert.equal(r.reconcile({ reconciliationCase: c, evidence: [] }).status, "UNRESOLVED");
assert.equal(r.reconcile({ reconciliationCase: c, evidence: [{ authoritative: true, outcome: "SEMANTIC_CONFLICT" }] }).status, "UNRESOLVED", "caller-controlled authority claims must not resolve reconciliation");
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
assert.equal(detachedResult.status, "UNRESOLVED", "plain caller data is not independently authenticated authority");
assert.deepEqual(detachedResult.evidence, []);
suppliedEvidence.details.receipt.digest = "changed";
assert.deepEqual(detachedResult.evidence, [], "untrusted evidence must not be retained as a resolved proof");
assert.equal(r.reconcile({
  reconciliationCase: c,
  evidence: [{ authoritative: true, outcome: "SAFE_COMMIT", details: new Map([["k", "v"]]) }]
}).status, "UNRESOLVED");
assert.throws(() => createReconciliationCase({ boundary: "   " }), /boundary/);
assert.throws(() => createReconciliationCase({ boundary: "recovery", claimId: "  " }), /claimId/);
assert.equal(typeof r.commit, "undefined");
assert.equal(typeof r.execute, "undefined");
assert.equal(typeof r.authorize, "undefined");

console.log("NEXO STEP 6 reconciliation contract tests: PASS (fail-closed authority boundary)");


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


{
  let getterCalls = 0;
  const hostileInput = {
    reconciliationCase: c,
    get evidence() {
      getterCalls += 1;
      return [{ authoritative: true, outcome: "SAFE_COMMIT" }];
    }
  };
  const result = r.reconcile(hostileInput);
  assert.equal(result.status, "INVALID");
  assert.equal(getterCalls, 0, "outer reconciliation input accessors must be rejected before destructuring");
  assert.equal(r.reconcile(null).status, "INVALID", "null call input must fail closed instead of throwing");
}

{
  let getterCalls = 0;
  const hostileInput = {};
  Object.defineProperty(hostileInput, "reconciliationCase", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return c;
    }
  });
  const result = r.reconcile(hostileInput);
  assert.equal(result.status, "INVALID");
  assert.equal(getterCalls, 0, "outer reconciliation case getter must remain uncalled");
}


{
  for (const malformedEvidence of [null, {}, "not-an-array", 42]) {
    const result = r.reconcile({ reconciliationCase: c, evidence: malformedEvidence });
    assert.equal(result.status, "UNRESOLVED", "malformed non-array evidence must fail closed without throwing");
    assert.equal(result.outcome, null);
    assert.deepEqual(result.evidence, []);
  }
}


{
  let findCalls = 0;
  const hostileEvidence = [{ authoritative: true, outcome: "SAFE_COMMIT" }];
  Object.defineProperty(hostileEvidence, "find", {
    enumerable: true,
    configurable: true,
    value() {
      findCalls += 1;
      return { authoritative: true, outcome: "SAFE_COMMIT" };
    }
  });
  const result = r.reconcile({ reconciliationCase: c, evidence: hostileEvidence });
  assert.equal(result.status, "UNRESOLVED", "custom array methods must not make caller-supplied authority trusted");
  assert.equal(findCalls, 0, "reconciliation must not invoke caller-controlled array methods");
}

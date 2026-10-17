import assert from "node:assert/strict";
import { createReconciliationCase, createReconciler } from "../../src/nexo/core/reconciliation.mjs";

const r = createReconciler();
const c = createReconciliationCase({ boundary: "recovery-boundary", claimId: "claim-1" });

assert.equal(r.reconcile({ reconciliationCase: c, evidence: [] }).status, "UNRESOLVED");
assert.equal(r.reconcile({ reconciliationCase: c, evidence: [{ authoritative: true, outcome: "SEMANTIC_CONFLICT" }] }).status, "RESOLVED");
assert.equal(r.reconcile({ reconciliationCase: c, evidence: [{ authoritative: false, outcome: "SEMANTIC_CONFLICT" }] }).status, "UNRESOLVED");
assert.equal(r.reconcile({ reconciliationCase: null, evidence: [] }).status, "INVALID");

const result = r.reconcile({ reconciliationCase: c, evidence: [{ authoritative: true, outcome: "UNKNOWN" }] });
assert.equal(result.status, "UNRESOLVED");
assert.equal(result.outcome, null);
assert.equal(r.reconcile({ reconciliationCase: c, evidence: [{ authoritative: true, outcome: "MADE_UP_OUTCOME" }] }).status, "UNRESOLVED");
assert.equal(r.reconcile({ reconciliationCase: c, evidence: [{ authoritative: true, outcome: "RECONCILE_REQUIRED" }] }).status, "UNRESOLVED");
assert.throws(() => result.evidence.push("x"), TypeError);
assert.throws(() => createReconciliationCase({ boundary: "   " }), /boundary/);
assert.throws(() => createReconciliationCase({ boundary: "recovery", claimId: "  " }), /claimId/);
assert.equal(typeof r.commit, "undefined");
assert.equal(typeof r.execute, "undefined");
assert.equal(typeof r.authorize, "undefined");

console.log("NEXO STEP 6 reconciliation contract tests: PASS");

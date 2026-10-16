import assert from "node:assert/strict";
import { OUTCOMES } from "../../src/nexo/core/contracts.mjs";
import { createOutcomeClassifier } from "../../src/nexo/core/outcome-classifier.mjs";

const classifier = createOutcomeClassifier();

for (const kind of Object.values(OUTCOMES)) {
  const result = classifier.classify({
    kind,
    reasons: ["reason"],
    evidence: ["evidence"]
  });
  assert.equal(result.kind, kind);
  assert.deepEqual(result.reasons, ["reason"]);
  assert.deepEqual(result.evidence, ["evidence"]);
  assert.throws(() => result.reasons.push("mutation"), TypeError);
  assert.throws(() => result.evidence.push("mutation"), TypeError);
}

assert.equal(
  classifier.classify({ kind: OUTCOMES.UNKNOWN }).kind,
  OUTCOMES.UNKNOWN
);

assert.equal(
  classifier.classify({ kind: OUTCOMES.RECONCILE_REQUIRED }).kind,
  OUTCOMES.RECONCILE_REQUIRED
);

assert.throws(
  () => classifier.classify({ kind: "SAFE" }),
  /invalid terminal outcome/
);

// Reject malformed collection shapes instead of accepting strings as iterable
// character arrays or passing non-array evidence through to the Core contract.
assert.throws(
  () => classifier.classify({ kind: OUTCOMES.UNKNOWN, reasons: "not-an-array" }),
  /reasons must be an array/
);
assert.throws(
  () => classifier.classify({ kind: OUTCOMES.UNKNOWN, evidence: { source: "x" } }),
  /evidence must be an array/
);
assert.throws(
  () => classifier.classify({ kind: OUTCOMES.UNKNOWN, reasons: null }),
  /reasons must be an array/
);

assert.equal(typeof classifier.commit, "undefined");
assert.equal(typeof classifier.reconcile, "undefined");

console.log("NEXO STEP 5 outcome classifier contract tests: PASS");

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

assert.equal(typeof classifier.commit, "undefined");
assert.equal(typeof classifier.reconcile, "undefined");

console.log("NEXO STEP 5 outcome classifier contract tests: PASS");

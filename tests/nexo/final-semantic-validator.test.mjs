import assert from "node:assert/strict";
import {
  VALIDATION,
  createCandidate,
  createClaimEnvelope
} from "../../src/nexo/core/contracts.mjs";
import { createFinalSemanticValidator } from "../../src/nexo/core/final-semantic-validator.mjs";

const validator = createFinalSemanticValidator();

const validPolicyContext = {
  policyRef: { id: "policy-1", semanticVersion: "1.0.0", hash: "fixture-policy-hash" },
  scope: { kind: "test" },
  resolved: { dependencies: [] },
  validity: { status: "VALID" },
  resolutionProvenance: []
};

function candidate(overrides = {}) {
  const claim = createClaimEnvelope({
    claimId: "step4-1",
    action: "set-value",
    target: { id: "target-1" },
    targetIncarnation: { epoch: 4 },
    dependencies: [{ id: "dep-a", required: true }],
    predicateDependencies: [{ id: "pred-a", required: true }],
    ...overrides.claim
  });
  return createCandidate({
    claim,
    state: { value: 2 },
    expectedRevision: 1
  });
}

const baseContext = {
  claimId: "step4-1",
  target: { id: "target-1" },
  targetIncarnation: { epoch: 4 },
  requirements: [
    { id: "dep-a", status: "SATISFIED", authoritative: true, source: "test-authority" },
    { id: "pred-a", status: "SATISFIED", authoritative: true, source: "test-authority" }
  ]
};

{
  const result = validator.validate(candidate(), baseContext);
  assert.equal(result.status, VALIDATION.PASS);
  assert.deepEqual(result.evidence, ["dep-a", "pred-a"]);
}

{
  const result = validator.validate({
    claim: {
      claimId: "step4-1",
      target: null,
      targetIncarnation: null,
      policyContext: null
    }
  }, {
    claimId: "step4-1",
    requirements: []
  });
  assert.equal(result.status, VALIDATION.UNKNOWN);
  assert.match(result.reasons[0], /collections are malformed/);
}

{
  const malformed = candidate({
    claim: { dependencies: [{ required: true, descriptor: "dependency-without-id" }] }
  });
  const result = validator.validate(malformed, baseContext);
  assert.equal(result.status, VALIDATION.UNKNOWN);
  assert.match(result.reasons[0], /no valid identifier/);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    requirements: [
      { id: "dep-a", status: "SATISFIED", authoritative: true },
      { id: "pred-a", status: "SATISFIED", authoritative: true, source: "test-authority" }
    ]
  });
  assert.equal(result.status, VALIDATION.UNKNOWN);
  assert.match(result.reasons[0], /not authoritative/);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    requirements: [
      { id: "dep-a", status: "SATISFIED", authoritative: true, source: "   " },
      { id: "pred-a", status: "SATISFIED", authoritative: true, source: "test-authority" }
    ]
  });
  assert.equal(result.status, VALIDATION.UNKNOWN);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    requirements: [
      { id: "dep-a", status: "FAILED", authoritative: true, source: "test-authority" },
      { id: "pred-a", status: "SATISFIED", authoritative: true, source: "test-authority" }
    ]
  });
  assert.equal(result.status, VALIDATION.FAIL);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    requirements: [
      ...baseContext.requirements,
      { id: "unrelated-a", status: "FAILED", authoritative: true, source: "test-authority" }
    ]
  });
  assert.equal(result.status, VALIDATION.PASS);
  assert.deepEqual(result.evidence, ["dep-a", "pred-a"]);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    requirements: [
      { id: "dep-a", status: "UNKNOWN", authoritative: true, source: "test-authority" },
      { id: "pred-a", status: "SATISFIED", authoritative: true, source: "test-authority" }
    ]
  });
  assert.equal(result.status, VALIDATION.UNKNOWN);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    requirements: [
      { id: "dep-a", status: "SATISFIED", authoritative: true, source: "test-authority" }
    ]
  });
  assert.equal(result.status, VALIDATION.UNKNOWN);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    requirements: [
      { id: "dep-a", status: "SATISFIED", authoritative: true, source: "authority-a" },
      { id: "dep-a", status: "SATISFIED", authoritative: true, source: "authority-b" },
      { id: "pred-a", status: "SATISFIED", authoritative: true, source: "test-authority" }
    ]
  });
  assert.equal(result.status, VALIDATION.UNKNOWN);
  assert.match(result.reasons[0], /duplicate identifiers/);
  assert.deepEqual(result.evidence, ["dep-a"]);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    requirements: [
      { id: "dep-a", status: "SATISFIED", authoritative: false, source: "test-authority" },
      { id: "pred-a", status: "SATISFIED", authoritative: true, source: "test-authority" }
    ]
  });
  assert.equal(result.status, VALIDATION.UNKNOWN);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    target: { id: "different-target" }
  });
  assert.equal(result.status, VALIDATION.FAIL);
}

{
  const orderIndependentCandidate = candidate({
    claim: { target: { id: "target-1", metadata: { alpha: 1, beta: 2 } } }
  });
  const result = validator.validate(orderIndependentCandidate, {
    ...baseContext,
    target: { metadata: { beta: 2, alpha: 1 }, id: "target-1" }
  });
  assert.equal(result.status, VALIDATION.PASS);
}

{
  // Deliberately bypass the constructor to keep this validator-specific
  // regression: malformed externally supplied candidates must not prove equality.
  const cyclicTarget = { id: "target-1" };
  cyclicTarget.self = cyclicTarget;
  const cyclicCandidate = {
    claim: {
      claimId: "step4-1",
      target: cyclicTarget,
      targetIncarnation: { epoch: 4 },
      policyContext: null,
      authoritativeReads: [],
      dependencies: [],
      predicateDependencies: [],
      causalInputs: []
    }
  };
  const contextTarget = { id: "target-1" };
  contextTarget.self = contextTarget;
  const result = validator.validate(cyclicCandidate, {
    ...baseContext,
    target: contextTarget
  });
  assert.equal(result.status, VALIDATION.UNKNOWN);
  assert.match(result.reasons[0], /cannot be safely compared/);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    target: undefined
  });
  assert.equal(result.status, VALIDATION.FAIL);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    targetIncarnation: { epoch: 5 }
  });
  assert.equal(result.status, VALIDATION.FAIL);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    targetIncarnation: undefined
  });
  assert.equal(result.status, VALIDATION.FAIL);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    requirements: [
      { id: "dep-a", status: "SATISFIED", authoritative: true, source: "test-authority" },
      { id: "pred-a", status: "SATISFIED", authoritative: true, source: "cache" }
    ]
  });
  assert.equal(result.status, VALIDATION.UNKNOWN);
}

for (const source of ["Cache", " CACHE ", "Helper", " DERIVED "]) {
  const result = validator.validate(candidate(), {
    ...baseContext,
    requirements: [
      { id: "dep-a", status: "SATISFIED", authoritative: true, source },
      { id: "pred-a", status: "SATISFIED", authoritative: true, source: "test-authority" }
    ]
  });
  assert.equal(result.status, VALIDATION.UNKNOWN, `source label must be normalized: ${source}`);
}

{
  const result = validator.validate(candidate({claim: {authoritativeReads: [{id: "read-a", required: true}]}}), {
    ...baseContext,
    requirements: [
      ...baseContext.requirements,
      { id: "read-a", status: "SATISFIED", authoritative: true, source: "test-authority" }
    ]
  });
  assert.equal(result.status, VALIDATION.PASS);
}

{
  const result = validator.validate(candidate({claim: {policyContext: validPolicyContext}}), {
    ...baseContext,
    policyContext: validPolicyContext
  });
  assert.equal(result.status, VALIDATION.PASS);
}

{
  const result = validator.validate(candidate({claim: {policyContext: validPolicyContext}}), {
    ...baseContext,
    policyContext: {
      ...validPolicyContext,
      policyRef: { ...validPolicyContext.policyRef, hash: "different-policy-hash" }
    }
  });
  assert.equal(result.status, VALIDATION.FAIL);
}

{
  const result = validator.validate(candidate({claim: {policyContext: validPolicyContext}}), baseContext);
  assert.equal(result.status, VALIDATION.UNKNOWN);
}

{
  const result = validator.validate(candidate(), {
    ...baseContext,
    claimId: "different-claim"
  });
  assert.equal(result.status, VALIDATION.FAIL);
}

console.log("NEXO STEP 4 final semantic validator contract tests: PASS");

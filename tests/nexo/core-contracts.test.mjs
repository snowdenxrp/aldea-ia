import assert from "node:assert/strict";
import {
  AUTHORITY, COMMIT, OUTCOMES, VALIDATION,
  createAuthorityResult, createCandidate, createClaimEnvelope, createCommitResult,
  createOutcome, createValidationResult
} from "../../src/nexo/core/contracts.mjs";
import { createCorePorts } from "../../src/nexo/core/ownership.mjs";

const claim = createClaimEnvelope({
  claimId: "claim-1", action: "example",
  authoritativeReads: ["world.revision"],
  dependencies: ["target"],
  predicateDependencies: ["eligibility"],
  sourceProvenance: ["test"]
});
assert.equal(claim.claimId, "claim-1");
assert.equal(claim.action, "example");
assert.throws(() => { claim.claimId = "mutated"; }, TypeError);
assert.throws(() => createClaimEnvelope({ action: "missing-id" }), /claimId/);
assert.throws(() => createClaimEnvelope({ claimId: "   ", action: "example" }), /claimId must be a non-empty, non-blank string/);
assert.throws(() => createClaimEnvelope({ claimId: "claim-blank-action", action: " \t " }), /action must be a non-empty, non-blank string/);
assert.throws(() => createClaimEnvelope({
  claimId: "claim-blank-policy-ref",
  action: "example",
  policyContext: {
    policyRef: { id: "policy-1", semanticVersion: "1.0.0", hash: "   " },
    scope: { kind: "test" },
    resolved: { dependencies: [] },
    validity: { status: "VALID" },
    resolutionProvenance: []
  }
}), /policyContext.policyRef.hash must be a non-empty, non-blank string/);

// Collection fields are lists by contract; strings and object-shaped values
// must not be silently spread into character arrays or accepted as evidence.
assert.throws(() => createClaimEnvelope({ claimId: "bad-reads", action: "x", authoritativeReads: "revision" }), /authoritativeReads must be an array/);
assert.throws(() => createClaimEnvelope({ claimId: "bad-deps", action: "x", dependencies: { target: "x" } }), /dependencies must be an array/);
assert.throws(() => createClaimEnvelope({ claimId: "bad-provenance", action: "x", sourceProvenance: "source" }), /sourceProvenance must be an array/);
assert.throws(() => createValidationResult(VALIDATION.UNKNOWN, { reasons: "missing" }), /validation reasons must be an array/);
assert.throws(() => createValidationResult(VALIDATION.UNKNOWN, { evidence: { source: "x" } }), /validation evidence must be an array/);
assert.throws(() => createOutcome(OUTCOMES.UNKNOWN, { reasons: "unknown" }), /outcome reasons must be an array/);
assert.throws(() => createAuthorityResult(AUTHORITY.UNKNOWN, { evidence: "unverified" }), /authority evidence must be an array/);

const target = { id: "target-1", meta: { version: 1 } };
const claimWithTarget = createClaimEnvelope({ claimId: "claim-target", action: "example", target });
target.meta.version = 2;
assert.equal(claimWithTarget.target.meta.version, 1);
assert.throws(() => { claimWithTarget.target.meta.version = 3; }, TypeError);

const inputs = {
  authoritativeReads: [{ revision: { value: 1 } }],
  dependencies: [{ meta: { version: 1 } }],
  predicateDependencies: [{ bounds: { min: 1, max: 5 } }],
  derivedProvenance: [{ transform: { step: 1 } }],
  causalInputs: [{ clock: { tick: 10 } }],
  sourceProvenance: [{ observation: { confidence: 0.9 } }]
};
const detached = createClaimEnvelope({ claimId: "claim-provenance", action: "example", ...inputs });
inputs.authoritativeReads[0].revision.value = 99;
inputs.dependencies[0].meta.version = 99;
inputs.predicateDependencies[0].bounds.max = 99;
inputs.derivedProvenance[0].transform.step = 99;
inputs.causalInputs[0].clock.tick = 99;
inputs.sourceProvenance[0].observation.confidence = 0.1;
assert.equal(detached.authoritativeReads[0].revision.value, 1);
assert.equal(detached.dependencies[0].meta.version, 1);
assert.equal(detached.predicateDependencies[0].bounds.max, 5);
assert.equal(detached.derivedProvenance[0].transform.step, 1);
assert.equal(detached.causalInputs[0].clock.tick, 10);
assert.equal(detached.sourceProvenance[0].observation.confidence, 0.9);
assert.throws(() => { detached.dependencies[0].meta.version = 2; }, TypeError);

const state = { value: 1, nested: { count: 1 } };
const candidate = createCandidate({ claim, state, expectedRevision: 7 });
assert.equal(candidate.expectedRevision, 7);
assert.notEqual(candidate.state, state);
candidate.state.nested.count = 2;
candidate.state.value = 3;
assert.equal(state.nested.count, 1);
assert.equal(state.value, 1);
state.nested.count = 4;
state.value = 5;
assert.equal(candidate.state.nested.count, 2);
assert.equal(candidate.state.value, 3);

assert.equal(createValidationResult(VALIDATION.PASS, { evidence: ["e1"] }).status, "PASS");
assert.equal(createValidationResult(VALIDATION.UNKNOWN, { reasons: ["missing evidence"] }).status, "UNKNOWN");

// Result constructors must not freeze or retain caller-owned nested evidence.
const validationEvidenceInput = [{ record: { revision: 1 } }];
const validationResult = createValidationResult(VALIDATION.PASS, { evidence: validationEvidenceInput });
validationEvidenceInput[0].record.revision = 2;
assert.equal(validationResult.evidence[0].record.revision, 1);
assert.equal(Object.isFrozen(validationEvidenceInput[0]), false);
assert.equal(Object.isFrozen(validationEvidenceInput[0].record), false);

const outcomeEvidenceInput = [{ record: { revision: 3 } }];
const outcomeResult = createOutcome(OUTCOMES.SAFE_COMMIT, { evidence: outcomeEvidenceInput });
outcomeEvidenceInput[0].record.revision = 4;
assert.equal(outcomeResult.evidence[0].record.revision, 3);
assert.equal(Object.isFrozen(outcomeEvidenceInput[0]), false);
assert.equal(Object.isFrozen(outcomeEvidenceInput[0].record), false);

const authorityEvidenceInput = [{ record: { issuer: "test" } }];
const authorityResult = createAuthorityResult(AUTHORITY.UNKNOWN, { evidence: authorityEvidenceInput });
authorityEvidenceInput[0].record.issuer = "changed";
assert.equal(authorityResult.evidence[0].record.issuer, "test");
assert.equal(Object.isFrozen(authorityEvidenceInput[0]), false);
assert.equal(Object.isFrozen(authorityEvidenceInput[0].record), false);
assert.equal(createCommitResult(COMMIT.COMMITTED).status, "COMMITTED");
assert.equal(createCommitResult(COMMIT.CONDITIONAL_CONFLICT, { errorCode: "STATE_REVISION_CONFLICT" }).errorCode, "STATE_REVISION_CONFLICT");
assert.equal(createOutcome(OUTCOMES.SAFE_COMMIT).kind, "SAFE_COMMIT");
assert.equal(createOutcome(OUTCOMES.UNKNOWN).kind, "UNKNOWN");
assert.throws(() => createOutcome("SUCCESS"), /invalid outcome/);

const ports = createCorePorts();
assert.equal(typeof ports.conditionalCommit.commit, "function");
assert.equal(typeof ports.candidateExecutor.execute, "function");
assert.equal(typeof ports.finalSemanticValidator.validate, "function");
assert.throws(() => ports.conditionalCommit.commit(), /NOT_IMPLEMENTED/);
assert.equal("commit" in { action: "example" }, false);
assert.equal("conditionalCommit" in ports.proposal, false);

const completePolicyContext = {
  policyRef: { id: "policy-1", semanticVersion: "1.0.0", hash: "sha256:test" },
  scope: { mission: "mission-1" },
  resolved: { semanticFacts: { threshold: 1 }, dependencies: [{ id: "dep-1", version: "1" }] },
  validity: { status: "VALID", expiresAt: "2099-01-01T00:00:00Z" },
  resolutionProvenance: [{ source: "protected-core" }]
};
const policyClaim = createClaimEnvelope({ claimId: "claim-policy", action: "example", policyContext: completePolicyContext });
assert.equal(policyClaim.policyContext.policyRef.id, "policy-1");
assert.equal(policyClaim.policyContext.validity.status, "VALID");
assert.throws(() => createClaimEnvelope({ claimId: "claim-policy-missing-ref", action: "example", policyContext: { ...completePolicyContext, policyRef: null } }), /policyRef/);
assert.throws(() => createClaimEnvelope({ claimId: "claim-policy-missing-scope", action: "example", policyContext: { ...completePolicyContext, scope: undefined } }), /scope/);
assert.throws(() => createClaimEnvelope({ claimId: "claim-policy-missing-deps", action: "example", policyContext: { ...completePolicyContext, resolved: { semanticFacts: {} } } }), /dependencies/);
assert.throws(() => createClaimEnvelope({ claimId: "claim-policy-invalid-status", action: "example", policyContext: { ...completePolicyContext, validity: { status: "AUTHORIZED" } } }), /validity.status/);
assert.throws(() => createClaimEnvelope({ claimId: "claim-policy-missing-provenance", action: "example", policyContext: { ...completePolicyContext, resolutionProvenance: undefined } }), /resolutionProvenance/);
assert.throws(() => { policyClaim.policyContext.policyRef.id = "attacker"; }, TypeError);
assert.equal("authorize" in policyClaim.policyContext, false);
assert.equal("safeCommit" in policyClaim.policyContext, false);

console.log("NEXO CORE isolation contract tests: PASS");

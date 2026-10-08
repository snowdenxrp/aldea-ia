import assert from "node:assert/strict";
import {
  COMMIT, OUTCOMES, VALIDATION,
  createCandidate, createClaimEnvelope, createCommitResult,
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

console.log("NEXO CORE isolation contract tests: PASS");

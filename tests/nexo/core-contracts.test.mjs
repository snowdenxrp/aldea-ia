import assert from "node:assert/strict";
import {
  COMMIT,
  OUTCOMES,
  VALIDATION,
  createCandidate,
  createClaimEnvelope,
  createCommitResult,
  createOutcome,
  createValidationResult
} from "../../src/nexo/core/contracts.mjs";
import { createCorePorts } from "../../src/nexo/core/ownership.mjs";

const claim = createClaimEnvelope({
  claimId: "claim-1",
  action: "example",
  authoritativeReads: ["world.revision"],
  dependencies: ["target"],
  predicateDependencies: ["eligibility"],
  sourceProvenance: ["test"]
});

assert.equal(claim.claimId, "claim-1");
assert.equal(claim.action, "example");
assert.throws(() => { claim.claimId = "mutated"; }, TypeError);
assert.throws(() => createClaimEnvelope({ action: "missing-id" }), /claimId/);

const mutableTarget = { id: "target-1", meta: { version: 1 } };
const claimWithTarget = createClaimEnvelope({
  claimId: "claim-target",
  action: "example",
  target: mutableTarget
});
mutableTarget.meta.version = 2;
assert.equal(claimWithTarget.target.meta.version, 1);
assert.throws(() => { claimWithTarget.target.meta.version = 3; }, TypeError);

const candidateState = { value: 1 };
const candidate = createCandidate({ claim, state: candidateState, expectedRevision: 7 });
assert.equal(candidate.expectedRevision, 7);
assert.equal(candidate.state, candidateState);

const pass = createValidationResult(VALIDATION.PASS, { evidence: ["e1"] });
const unknown = createValidationResult(VALIDATION.UNKNOWN, { reasons: ["missing evidence"] });
assert.equal(pass.status, "PASS");
assert.equal(unknown.status, "UNKNOWN");

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

const providerProposal = { action: "example" };
assert.equal("commit" in providerProposal, false);
assert.equal("conditionalCommit" in ports.proposal, false);

console.log("NEXO CORE contract skeleton tests: PASS");

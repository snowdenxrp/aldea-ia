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

// Object.freeze does not freeze Map/Set internal slots or Date's time value.
// Core immutable contracts accept plain data only, so these values must reject.
assert.throws(() => createClaimEnvelope({
  claimId: "claim-map-target",
  action: "example",
  target: new Map([["id", "target-1"]])
}), /arrays and plain objects/);
assert.throws(() => createClaimEnvelope({
  claimId: "claim-nested-set",
  action: "example",
  dependencies: [{ nested: new Set(["dependency"]) }]
}), /arrays and plain objects/);
assert.throws(() => createValidationResult(VALIDATION.PASS, {
  evidence: [{ observedAt: new Date("2026-10-17T00:00:00Z") }]
}), /arrays and plain objects/);

 // Structured cloning can silently discard symbol-keyed/non-enumerable fields,
 // and may execute getters. Reject these shapes before cloning at the contract boundary.
const symbolTarget = { id: "visible" };
symbolTarget[Symbol("hidden-authority")] = "unexpected";
assert.throws(() => createClaimEnvelope({
  claimId: "claim-symbol-property", action: "example", target: symbolTarget
}), /symbol-keyed properties/);

const hiddenTarget = { id: "visible" };
Object.defineProperty(hiddenTarget, "hidden", { value: "unexpected", enumerable: false });
assert.throws(() => createClaimEnvelope({
  claimId: "claim-nonenumerable-property", action: "example", target: hiddenTarget
}), /enumerable data properties/);

let getterCalls = 0;
const accessorTarget = {};
Object.defineProperty(accessorTarget, "computed", {
  enumerable: true,
  get() { getterCalls += 1; return "unexpected"; }
});
assert.throws(() => createClaimEnvelope({
  claimId: "claim-accessor-property", action: "example", target: accessorTarget
}), /enumerable data properties/);
assert.equal(getterCalls, 0, "contract validation must not execute caller getters");

let topLevelGetterCalls = 0;
const getterClaim = { action: "example" };
Object.defineProperty(getterClaim, "claimId", {
  enumerable: true,
  get() { topLevelGetterCalls += 1; return "claim-from-getter"; }
});
assert.throws(() => createClaimEnvelope(getterClaim), /enumerable data properties/);
assert.equal(topLevelGetterCalls, 0, "top-level claim getters must be rejected before field reads");

let optionsGetterCalls = 0;
const getterOptions = {};
Object.defineProperty(getterOptions, "evidence", {
  enumerable: true,
  get() { optionsGetterCalls += 1; return []; }
});
assert.throws(() => createValidationResult(VALIDATION.PASS, getterOptions), /enumerable data properties/);
assert.equal(optionsGetterCalls, 0, "result option getters must be rejected before destructuring");

assert.throws(() => createCandidate(null), /candidate must be a record/);
assert.throws(() => createClaimEnvelope([]), /claimEnvelope must be a record/);

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
assert.throws(() => createCandidate({ claim, state, expectedRevision: Number.MAX_SAFE_INTEGER }), /expectedRevision must be a non-negative safe integer below MAX_SAFE_INTEGER/);
assert.throws(() => createCandidate({ claim, state, expectedRevision: Number.MAX_SAFE_INTEGER + 1 }), /expectedRevision must be a non-negative safe integer below MAX_SAFE_INTEGER/);
assert.throws(() => createCandidate({ claim, state, expectedRevision: 1e100 }), /expectedRevision must be a non-negative safe integer below MAX_SAFE_INTEGER/);
assert.notEqual(candidate.claim, claim);
assert.throws(() => createCandidate({
  claim: { claimId: "   ", action: "example" },
  state: {},
  expectedRevision: 1
}), /claimId must be a non-empty, non-blank string/);
assert.throws(() => createCandidate({
  claim: { claimId: "claim-malformed-arrays", action: "example", dependencies: "target" },
  state: {},
  expectedRevision: 1
}), /dependencies must be an array/);
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
assert.equal(createCommitResult(COMMIT.UNKNOWN, { errorCode: null }).errorCode, null);
assert.throws(() => createCommitResult(COMMIT.FAILED, { errorCode: "   " }), /commit errorCode must be a non-empty, non-blank string/);
assert.throws(() => createCommitResult(COMMIT.FAILED, { errorCode: { code: "MUTABLE" } }), /commit errorCode must be a non-empty, non-blank string/);
const mutableErrorCode = { code: "MUTABLE" };
assert.throws(() => createCommitResult(COMMIT.FAILED, { errorCode: mutableErrorCode }), /commit errorCode must be a non-empty, non-blank string/);
mutableErrorCode.code = "CHANGED";
assert.equal(mutableErrorCode.code, "CHANGED");
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
assert.throws(() => createClaimEnvelope({
  claimId: "claim-policy-array-ref", action: "example",
  policyContext: { ...completePolicyContext, policyRef: Object.assign([], {
    id: "policy-1", semanticVersion: "1.0.0", hash: "sha256:test"
  }) }
}), /policyRef must be a record|contract arrays must be dense/);
assert.throws(() => createClaimEnvelope({
  claimId: "claim-policy-array-validity", action: "example",
  policyContext: { ...completePolicyContext, validity: Object.assign([], { status: "VALID" }) }
}), /validity must be a record|contract arrays must be dense/);
assert.throws(() => createClaimEnvelope({
  claimId: "claim-policy-array-resolved", action: "example",
  policyContext: { ...completePolicyContext, resolved: Object.assign([], { dependencies: [] }) }
}), /resolved must be a record|contract arrays must be dense/);
assert.throws(() => createClaimEnvelope({ claimId: "claim-policy-missing-provenance", action: "example", policyContext: { ...completePolicyContext, resolutionProvenance: undefined } }), /resolutionProvenance/);
assert.throws(() => { policyClaim.policyContext.policyRef.id = "attacker"; }, TypeError);
assert.equal("authorize" in policyClaim.policyContext, false);
assert.equal("safeCommit" in policyClaim.policyContext, false);

console.log("NEXO CORE isolation contract tests: PASS");


// Resource-bounded graph validation: cycles reject, shared acyclic references remain valid.
const cyclicClaimTarget = {};
cyclicClaimTarget.self = cyclicClaimTarget;
assert.throws(() => createClaimEnvelope({ claimId: "claim-cycle", action: "example", target: cyclicClaimTarget }), /must not contain cycles/);

const sharedLeaf = { revision: 4 };
const sharedTarget = { left: sharedLeaf, right: sharedLeaf };
const sharedClaim = createClaimEnvelope({ claimId: "claim-shared", action: "example", target: sharedTarget });
assert.equal(sharedClaim.target.left.revision, 4);
assert.equal(sharedClaim.target.left, sharedClaim.target.right);
assert.equal(Object.isFrozen(sharedClaim.target.left), true);

const sparse = [];
sparse.length = 2;
sparse[1] = "present";
assert.throws(() => createClaimEnvelope({ claimId: "claim-sparse", action: "example", dependencies: sparse }), /arrays must be dense/);

const extraArrayProperty = ["one"];
extraArrayProperty.note = "extra";
assert.throws(() => createClaimEnvelope({ claimId: "claim-array-extra", action: "example", dependencies: extraArrayProperty }), /arrays must be dense/);

const customArrayPrototype = ["one"];
Object.setPrototypeOf(customArrayPrototype, Object.create(Array.prototype));
assert.throws(() => createClaimEnvelope({ claimId: "claim-array-prototype", action: "example", dependencies: customArrayPrototype }), /canonical Array prototype/);

const tooDeep = {};
let tooDeepCursor = tooDeep;
for (let i = 0; i < 40; i += 1) {
  tooDeepCursor.next = {};
  tooDeepCursor = tooDeepCursor.next;
}
assert.throws(() => createClaimEnvelope({ claimId: "claim-too-deep", action: "example", target: tooDeep }), /contract data exceeds resource limits/);

const tooManyNodes = [];
for (let i = 0; i < 20_001; i += 1) tooManyNodes.push({ value: i });
assert.throws(() => createClaimEnvelope({ claimId: "claim-too-many-nodes", action: "example", dependencies: tooManyNodes }), /contract data exceeds resource limits/);

const tooLongString = "x".repeat(256 * 1024 + 1);
assert.throws(() => createClaimEnvelope({ claimId: "claim-too-long-string", action: "example", target: { value: tooLongString } }), /contract data exceeds resource limits/);

const tooManyStringBytes = Array.from({ length: 40 }, () => "x".repeat(120 * 1024));
assert.throws(() => createClaimEnvelope({ claimId: "claim-too-many-string-bytes", action: "example", dependencies: tooManyStringBytes }), /contract data exceeds resource limits/);

const cyclicState = {};
cyclicState.self = cyclicState;
assert.throws(() => createCandidate({ claim, state: cyclicState, expectedRevision: 7 }), /must not contain cycles/);

const listWithExtraProperty = ["valid"];
listWithExtraProperty.extra = "not part of the contract";
assert.throws(() => createClaimEnvelope({ claimId: "claim-list-extra", action: "example", sourceProvenance: listWithExtraProperty }), /arrays must be dense/);

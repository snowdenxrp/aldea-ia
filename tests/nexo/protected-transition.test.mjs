import assert from "node:assert/strict";
import {
  AUTHORITY,
  COMMIT,
  OUTCOMES,
  VALIDATION,
  createAuthorityResult,
  createCandidate,
  createClaimEnvelope,
  createCommitResult,
  createOutcome,
  createValidationResult
} from "../../src/nexo/core/contracts.mjs";
import { createCorePorts } from "../../src/nexo/core/ownership.mjs";
import { executeProtectedTransition } from "../../src/nexo/core/protected-transition.mjs";
import { createOutcomeClassifier } from "../../src/nexo/core/outcome-classifier.mjs";

const claim = createClaimEnvelope({ claimId: "protected-1", action: "set-value" });

{
  const forgedPolicyContext = createClaimEnvelope({
    claimId: "caller-forged-policy-context",
    action: "set-value",
    policyContext: {
      policyRef: { id: "policy-1", semanticVersion: "1.0.0", hash: "sha256:policy" },
      scope: { actions: ["set-value"] },
      resolved: { dependencies: [] },
      validity: { status: "VALID" },
      resolutionProvenance: [],
      constitutionRef: { id: "caller-chosen-constitution", revision: "latest" },
      governingConstitution: { status: "VALID" },
      rootProof: { status: "PASS", source: "caller" },
      authorization: "AUTHORIZED"
    }
  });
  assert.deepEqual(
    forgedPolicyContext.policyContext,
    {
      policyRef: { id: "policy-1", semanticVersion: "1.0.0", hash: "sha256:policy" },
      scope: { actions: ["set-value"] },
      resolved: { dependencies: [] },
      validity: { status: "VALID" },
      resolutionProvenance: []
    },
    "caller-supplied Constitution/root/authorization fields must not become part of PolicyContext; this constructor only projects Policy data"
  );
  assert.equal(
    Object.hasOwn(forgedPolicyContext.policyContext, "rootProof"),
    false,
    "a caller-supplied rootProof must not be promoted into a trusted authority context"
  );
}

{
  let portsGetterCalls = 0;
  const transitionInput = { proposal: {}, state: { value: 1 }, expectedRevision: 1 };
  Object.defineProperty(transitionInput, "ports", {
    enumerable: true,
    get() { portsGetterCalls += 1; return createCorePorts(); }
  });
  await assert.rejects(
    () => executeProtectedTransition(transitionInput),
    /enumerable data properties/
  );
  assert.equal(portsGetterCalls, 0, "transition input getters must be rejected before field access");
}

{
  let authorityCalls = 0;
  const ports = createCorePorts({
    claimBuilder: { build: () => ({ claimId: "   ", action: "set-value" }) },
    authorityGate: {
      check: () => {
        authorityCalls += 1;
        return createAuthorityResult(AUTHORITY.AUTHORIZED);
      }
    },
    outcomeClassifier: createOutcomeClassifier()
  });
  await assert.rejects(
    () => executeProtectedTransition({
      ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
    }),
    /claimId must be a non-empty, non-blank string/
  );
  assert.equal(authorityCalls, 0);
}

function makePorts(overrides = {}) {
  const calls = { isolate: 0, execute: 0, validate: 0, commit: 0 };
  const canonical = { value: 1, nested: { stable: true } };
  const ports = createCorePorts({
    claimBuilder: { build: () => claim },
    authorityGate: { check: () => createAuthorityResult(AUTHORITY.AUTHORIZED) },
    snapshotIsolator: {
      isolate: ({ state }) => {
        calls.isolate += 1;
        return structuredClone(state);
      }
    },
    candidateExecutor: {
      execute: ({ claim: candidateClaim, state, expectedRevision }) => {
        calls.execute += 1;
        state.value = 2;
        return createCandidate({ claim: candidateClaim, state, expectedRevision });
      }
    },
    finalSemanticValidator: {
      validate: () => {
        calls.validate += 1;
        return createValidationResult(VALIDATION.PASS, { evidence: ["final-pass"] });
      }
    },
    conditionalCommit: {
      commit: () => {
        calls.commit += 1;
        return createCommitResult(COMMIT.COMMITTED);
      }
    },
    outcomeClassifier: createOutcomeClassifier(),
    ...overrides
  });
  return { ports, calls, canonical };
}

{
  let statusGetterCalls = 0;
  const { ports, calls } = makePorts({
    authorityGate: {
      check: () => {
        const result = { reasons: [], evidence: [] };
        Object.defineProperty(result, "status", {
          enumerable: true,
          get() { statusGetterCalls += 1; return AUTHORITY.AUTHORIZED; }
        });
        return result;
      }
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
  });
  assert.equal(outcome.kind, OUTCOMES.UNKNOWN);
  assert.equal(statusGetterCalls, 0, "authority result getters must be rejected before field reads");
  assert.equal(calls.isolate, 0);
  assert.equal(calls.execute, 0);
  assert.equal(calls.validate, 0);
  assert.equal(calls.commit, 0);
}

{
  let statusGetterCalls = 0;
  const { ports, calls } = makePorts({
    conditionalCommit: {
      commit: () => {
        calls.commit += 1;
        const result = { errorCode: null };
        Object.defineProperty(result, "status", {
          enumerable: true,
          get() { statusGetterCalls += 1; return COMMIT.COMMITTED; }
        });
        return result;
      }
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
  });
  assert.equal(outcome.kind, OUTCOMES.RECONCILE_REQUIRED);
  assert.equal(statusGetterCalls, 0, "commit result getters must be rejected before interpretation");
  assert.equal(calls.commit, 1);
}

{
  const { ports } = makePorts({
    outcomeClassifier: {
      classify: ({ kind }) => ({ kind, reasons: [] })
    },
    finalSemanticValidator: {
      validate: () => createValidationResult(VALIDATION.UNKNOWN)
    }
  });
  await assert.rejects(
    () => executeProtectedTransition({
      ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
    }),
    /complete Outcome with reasons and evidence arrays/
  );
}

{
  const { ports } = makePorts({
    outcomeClassifier: {
      classify: ({ kind }) => ({ kind, reasons: "not-an-array", evidence: [] })
    },
    finalSemanticValidator: {
      validate: () => createValidationResult(VALIDATION.UNKNOWN)
    }
  });
  await assert.rejects(
    () => executeProtectedTransition({
      ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
    }),
    /complete Outcome with reasons and evidence arrays/
  );
}

{
  let kindGetterCalls = 0;
  let commitCalls = 0;
  const { ports } = makePorts({
    outcomeClassifier: {
      classify: () => {
        const result = { reasons: [], evidence: [] };
        Object.defineProperty(result, "kind", {
          enumerable: true,
          get() { kindGetterCalls += 1; return OUTCOMES.UNKNOWN; }
        });
        return result;
      }
    },
    finalSemanticValidator: {
      validate: () => createValidationResult(VALIDATION.UNKNOWN)
    },
    conditionalCommit: {
      commit: () => { commitCalls += 1; return createCommitResult(COMMIT.COMMITTED); }
    }
  });
  await assert.rejects(
    () => executeProtectedTransition({
      ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
    }),
    /enumerable data properties/
  );
  assert.equal(kindGetterCalls, 0, "outcome classifier getters must be rejected before field reads");
  assert.equal(commitCalls, 0);
}

{
  const { ports, calls, canonical } = makePorts();
  const outcome = await executeProtectedTransition({
    ports, proposal: { action: "set-value" }, state: canonical, expectedRevision: 7
  });
  assert.equal(outcome.kind, OUTCOMES.SAFE_COMMIT);
  assert.deepEqual(canonical, { value: 1, nested: { stable: true } });
  assert.deepEqual(calls, { isolate: 1, execute: 1, validate: 1, commit: 1 });
}

{
  let revisionGetterCalls = 0;
  let validateCalls = 0;
  let commitCalls = 0;
  const { ports } = makePorts({
    candidateExecutor: {
      execute: ({ claim: candidateClaim, state }) => {
        const candidate = { claim: candidateClaim, state };
        Object.defineProperty(candidate, "expectedRevision", {
          enumerable: true,
          get() { revisionGetterCalls += 1; return 1; }
        });
        return candidate;
      }
    },
    finalSemanticValidator: {
      validate: () => { validateCalls += 1; return createValidationResult(VALIDATION.PASS); }
    },
    conditionalCommit: {
      commit: () => { commitCalls += 1; return createCommitResult(COMMIT.COMMITTED); }
    }
  });
  await assert.rejects(
    () => executeProtectedTransition({
      ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
    }),
    /enumerable data properties/
  );
  assert.equal(revisionGetterCalls, 0, "candidate getters must be rejected before field reads");
  assert.equal(validateCalls, 0, "invalid candidate must not reach semantic validation");
  assert.equal(commitCalls, 0, "invalid candidate must not reach commit");
}

{
  let commitCalls = 0;
  const { ports } = makePorts({
    finalSemanticValidator: {
      validate: () => createValidationResult(VALIDATION.FAIL, { reasons: ["predicate disproved"] })
    },
    conditionalCommit: {
      commit: () => { commitCalls += 1; return createCommitResult(COMMIT.COMMITTED); }
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
  });
  assert.equal(outcome.kind, OUTCOMES.SEMANTIC_CONFLICT);
  assert.equal(commitCalls, 0);
}

{
  const { ports, calls } = makePorts({
    authorityGate: {
      check: () => ({ status: AUTHORITY.AUTHORIZED, reasons: "not-an-array", evidence: [] })
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
  });
  assert.equal(outcome.kind, OUTCOMES.UNKNOWN);
  assert.deepEqual(outcome.reasons, ["authority gate returned a malformed result shape"]);
  assert.equal(calls.isolate, 0);
  assert.equal(calls.execute, 0);
  assert.equal(calls.validate, 0);
  assert.equal(calls.commit, 0);
}

{
  let commitCalls = 0;
  const { ports, calls } = makePorts({
    authorityGate: {
      check: () => createAuthorityResult(AUTHORITY.UNKNOWN, { reasons: ["authority unavailable"] })
    },
    conditionalCommit: {
      commit: () => { commitCalls += 1; return createCommitResult(COMMIT.COMMITTED); }
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
  });
  assert.equal(outcome.kind, OUTCOMES.UNKNOWN);
  assert.equal(calls.isolate, 0);
  assert.equal(calls.execute, 0);
  assert.equal(calls.validate, 0);
  assert.equal(commitCalls, 0);
}

{
  const { ports } = makePorts({
    authorityGate: {
      check: () => createAuthorityResult(AUTHORITY.STOP, { reasons: ["stop enforced"] })
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
  });
  assert.equal(outcome.kind, OUTCOMES.AUTHORITY_STOP);
}

{
  const { ports } = makePorts({
    conditionalCommit: {
      commit: () => createCommitResult(COMMIT.CONDITIONAL_CONFLICT, {
        errorCode: "STATE_REVISION_CONFLICT"
      })
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 3
  });
  assert.equal(outcome.kind, OUTCOMES.STALE_CANDIDATE);
}

{
  const { ports } = makePorts({
    finalSemanticValidator: {
      validate: () => createValidationResult(VALIDATION.UNKNOWN, {
        reasons: ["claim-critical evidence unavailable"]
      })
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 3
  });
  assert.equal(outcome.kind, OUTCOMES.UNKNOWN);
}

{
  const { ports } = makePorts({
    outcomeClassifier: {
      classify: ({ kind, reasons = [], evidence = [] }) =>
        createOutcome(kind === OUTCOMES.UNKNOWN ? OUTCOMES.SAFE_COMMIT : kind, { reasons, evidence })
    },
    finalSemanticValidator: {
      validate: () => createValidationResult(VALIDATION.UNKNOWN, {
        reasons: ["forced classifier-integrity probe"]
      })
    }
  });
  await assert.rejects(
    () => executeProtectedTransition({
      ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
    }),
    /required terminal classification/
  );
}

{
  let validateCalls = 0;
  let commitCalls = 0;
  const { ports } = makePorts({
    candidateExecutor: {
      execute: ({ state, expectedRevision }) => createCandidate({
        claim: createClaimEnvelope({ claimId: "protected-1", action: "different-action" }),
        state,
        expectedRevision
      })
    },
    finalSemanticValidator: {
      validate: () => {
        validateCalls += 1;
        return createValidationResult(VALIDATION.PASS, { evidence: ["must-not-run"] });
      }
    },
    conditionalCommit: {
      commit: () => {
        commitCalls += 1;
        return createCommitResult(COMMIT.COMMITTED);
      }
    }
  });
  await assert.rejects(
    () => executeProtectedTransition({
      ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
    }),
    /candidate must preserve the complete authorized claim/
  );
  assert.equal(validateCalls, 0);
  assert.equal(commitCalls, 0);
}

{
  const { ports } = makePorts({
    candidateExecutor: {
      execute: ({ state, expectedRevision }) => createCandidate({
        claim: createClaimEnvelope({ claimId: "wrong-claim", action: "set-value" }),
        state,
        expectedRevision
      })
    }
  });
  await assert.rejects(
    () => executeProtectedTransition({
      ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
    }),
    /candidate must preserve the complete authorized claim/
  );
}

{
  const { ports } = makePorts({
    conditionalCommit: {
      commit: async () => { throw Object.assign(new Error("commit uncertain"), { code: "IO_UNCERTAIN" }); }
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
  });
  assert.equal(outcome.kind, OUTCOMES.RECONCILE_REQUIRED);
}

{
  const { ports } = makePorts({
    conditionalCommit: {
      commit: () => createCommitResult(COMMIT.UNKNOWN)
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
  });
  assert.equal(outcome.kind, OUTCOMES.RECONCILE_REQUIRED);
}

{
  const { ports } = makePorts({
    conditionalCommit: {
      commit: () => ({ status: "MALFORMED" })
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
  });
  assert.equal(outcome.kind, OUTCOMES.RECONCILE_REQUIRED);
}




{
  const calls = { isolate: 0, execute: 0, validate: 0, commit: 0 };
  const ports = createCorePorts({
    claimBuilder: { build: () => claim },
    snapshotIsolator: {
      isolate: ({ state }) => { calls.isolate += 1; return structuredClone(state); }
    },
    candidateExecutor: {
      execute: () => { calls.execute += 1; throw new Error("must not execute without authority"); }
    },
    finalSemanticValidator: {
      validate: () => { calls.validate += 1; throw new Error("must not validate without authority"); }
    },
    conditionalCommit: {
      commit: () => { calls.commit += 1; throw new Error("must not commit without authority"); }
    },
    outcomeClassifier: createOutcomeClassifier()
  });
  await assert.rejects(
    () => executeProtectedTransition({
      ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
    }),
    /NEXO_CORE_CONTRACT_NOT_IMPLEMENTED: authorityGate\.check/
  );
  assert.deepEqual(calls, { isolate: 0, execute: 0, validate: 0, commit: 0 });
}


{
  let statusGetterCalls = 0;
  let commitCalls = 0;
  const { ports } = makePorts({
    finalSemanticValidator: {
      validate: () => {
        const result = { reasons: [], evidence: [] };
        Object.defineProperty(result, "status", {
          enumerable: true,
          get() { statusGetterCalls += 1; return VALIDATION.PASS; }
        });
        return result;
      }
    },
    conditionalCommit: {
      commit: () => { commitCalls += 1; return createCommitResult(COMMIT.COMMITTED); }
    }
  });
  await assert.rejects(
    () => executeProtectedTransition({
      ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
    }),
    /enumerable data properties/
  );
  assert.equal(statusGetterCalls, 0, "validator result getters must be rejected before field reads");
  assert.equal(commitCalls, 0, "invalid validator result must not reach commit");
}

{
  let commitCalls = 0;
  const { ports } = makePorts({
    finalSemanticValidator: {
      validate: () => ({ status: VALIDATION.PASS })
    },
    conditionalCommit: {
      commit: () => { commitCalls += 1; return createCommitResult(COMMIT.COMMITTED); }
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
  });
  assert.equal(outcome.kind, OUTCOMES.UNKNOWN);
  assert.deepEqual(outcome.reasons, ["final semantic validator returned a malformed result shape"]);
  assert.equal(commitCalls, 0);
}

{
  let commitCalls = 0;
  const { ports } = makePorts({
    finalSemanticValidator: {
      validate: () => ({ status: VALIDATION.FAIL, reasons: "not-an-array", evidence: [] })
    },
    conditionalCommit: {
      commit: () => { commitCalls += 1; return createCommitResult(COMMIT.COMMITTED); }
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
  });
  assert.equal(outcome.kind, OUTCOMES.UNKNOWN);
  assert.equal(commitCalls, 0);
}


{
  let validateCalls = 0;
  let commitCalls = 0;
  const { ports } = makePorts({
    candidateExecutor: {
      execute: ({ claim: candidateClaim, state }) => createCandidate({
        claim: candidateClaim,
        state,
        expectedRevision: 2
      })
    },
    finalSemanticValidator: {
      validate: () => {
        validateCalls += 1;
        return createValidationResult(VALIDATION.PASS, { evidence: ["should-not-run"] });
      }
    },
    conditionalCommit: {
      commit: () => { commitCalls += 1; return createCommitResult(COMMIT.COMMITTED); }
    }
  });
  await assert.rejects(
    () => executeProtectedTransition({
      ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
    }),
    /preserve the requested expectedRevision/
  );
  assert.equal(validateCalls, 0);
  assert.equal(commitCalls, 0);
}

{
  let authorityCalls = 0;
  let commitCalls = 0;
  const { ports } = makePorts({
    authorityGate: { check: () => { authorityCalls += 1; return createAuthorityResult(AUTHORITY.AUTHORIZED); } },
    conditionalCommit: { commit: () => { commitCalls += 1; return createCommitResult(COMMIT.COMMITTED); } }
  });
  await assert.rejects(
    () => executeProtectedTransition({ ports, proposal: {}, state: { value: 1 }, expectedRevision: Number.MAX_SAFE_INTEGER }),
    /expectedRevision must be a non-negative safe integer below MAX_SAFE_INTEGER/
  );
  assert.equal(authorityCalls, 0);
  assert.equal(commitCalls, 0);
}

console.log("NEXO STEP 7 missing-authority-gate fail-closed probe: PASS");


{
  let commitCalls = 0;
  const hostileEvidence = [];
  hostileEvidence.push(Object.defineProperty({}, "unsafe", {
    enumerable: true,
    get() { throw new Error("evidence getter failure"); }
  }));
  const { ports } = makePorts({
    finalSemanticValidator: {
      validate: () => ({ status: VALIDATION.PASS, reasons: [], evidence: hostileEvidence })
    },
    conditionalCommit: {
      commit: () => {
        commitCalls += 1;
        return createCommitResult(COMMIT.COMMITTED);
      }
    }
  });
  await assert.rejects(
    () => executeProtectedTransition({
      ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
    }),
    /enumerable data properties/
  );
  assert.equal(commitCalls, 0);
}


{
  let getterCalls = 0;
  const options = {};
  Object.defineProperty(options, "authorityGate", {
    enumerable: true,
    get() { getterCalls += 1; return {}; }
  });
  assert.throws(() => createCorePorts(options), /enumerable data properties/);
  assert.equal(getterCalls, 0, "core port option getters must be rejected before option reads");
}

{
  const { ports } = makePorts({
    conditionalCommit: {
      commit: () => ({ status: COMMIT.CONDITIONAL_CONFLICT })
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
  });
  assert.equal(outcome.kind, OUTCOMES.RECONCILE_REQUIRED, "missing errorCode must not be treated as a valid conflict");
  assert.deepEqual(outcome.reasons, ["conditional commit returned a malformed errorCode"]);
}


{
  class Adapter {
    check() { return "adapter-method"; }
  }
  const ports = createCorePorts({ authorityGate: new Adapter() });
  assert.equal(ports.authorityGate.check(), "adapter-method", "port adapters may be class instances");
}


{
  const classifierResult = {
    kind: OUTCOMES.UNKNOWN,
    reasons: ["original reason"],
    evidence: [{ source: "original source" }]
  };
  const { ports } = makePorts({
    outcomeClassifier: {
      classify: ({ kind }) => ({ ...classifierResult, kind })
    },
    finalSemanticValidator: {
      validate: () => createValidationResult(VALIDATION.UNKNOWN, {
        reasons: ["validator unknown"], evidence: [{ source: "validator" }]
      })
    }
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: { value: 1 }, expectedRevision: 1
  });
  classifierResult.reasons[0] = "mutated after return";
  classifierResult.evidence[0].source = "mutated after return";
  assert.equal(outcome.kind, OUTCOMES.UNKNOWN);
  assert.equal(Object.isFrozen(outcome), true, "returned outcomes must be immutable");
  assert.equal(Object.isFrozen(outcome.reasons), true, "returned reasons must be immutable");
  assert.equal(Object.isFrozen(outcome.evidence[0]), true, "nested returned evidence must be immutable");
  assert.deepEqual(outcome.reasons, ["original reason"]);
  assert.deepEqual(outcome.evidence, [{ source: "original source" }]);
}


{
  const canonical = { value: 1, nested: { stable: true } };
  let executeCalls = 0;
  let commitCalls = 0;
  const ports = createCorePorts({
    claimBuilder: { build: () => claim },
    authorityGate: { check: () => createAuthorityResult(AUTHORITY.AUTHORIZED) },
    snapshotIsolator: { isolate: ({ state }) => ({ ...state }) },
    candidateExecutor: {
      execute: ({ claim: candidateClaim, state, expectedRevision }) => {
        executeCalls += 1;
        state.nested.stable = false;
        return createCandidate({ claim: candidateClaim, state, expectedRevision });
      }
    },
    finalSemanticValidator: {
      validate: () => createValidationResult(VALIDATION.PASS)
    },
    conditionalCommit: {
      commit: () => { commitCalls += 1; return createCommitResult(COMMIT.COMMITTED); }
    },
    outcomeClassifier: createOutcomeClassifier()
  });
  const outcome = await executeProtectedTransition({
    ports, proposal: {}, state: canonical, expectedRevision: 1
  });
  assert.equal(outcome.kind, OUTCOMES.UNKNOWN);
  assert.deepEqual(canonical, { value: 1, nested: { stable: true } });
  assert.equal(executeCalls, 0, "candidate executor must not receive shallow-aliased state");
  assert.equal(commitCalls, 0, "aliased snapshot must never reach commit");
}


{
  for (const invalidState of [undefined, null, [], "not-a-state"]) {
    let portCalls = 0;
    const ports = createCorePorts({
      claimBuilder: { build: () => { portCalls += 1; return claim; } },
      authorityGate: { check: () => { portCalls += 1; return createAuthorityResult(AUTHORITY.AUTHORIZED); } },
      snapshotIsolator: { isolate: () => { portCalls += 1; return {}; } },
      candidateExecutor: { execute: () => { portCalls += 1; throw new Error("must not execute"); } },
      finalSemanticValidator: { validate: () => { portCalls += 1; return createValidationResult(VALIDATION.PASS); } },
      conditionalCommit: { commit: () => { portCalls += 1; return createCommitResult(COMMIT.COMMITTED); } },
      outcomeClassifier: createOutcomeClassifier()
    });
    await assert.rejects(
      () => executeProtectedTransition({ ports, proposal: {}, state: invalidState, expectedRevision: 1 }),
      /state must be a record/
    );
    assert.equal(portCalls, 0, "invalid canonical state must be rejected before any port runs");
  }
}

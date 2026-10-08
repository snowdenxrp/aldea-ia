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
  const { ports, calls, canonical } = makePorts();
  const outcome = await executeProtectedTransition({
    ports, proposal: { action: "set-value" }, state: canonical, expectedRevision: 7
  });
  assert.equal(outcome.kind, OUTCOMES.SAFE_COMMIT);
  assert.deepEqual(canonical, { value: 1, nested: { stable: true } });
  assert.deepEqual(calls, { isolate: 1, execute: 1, validate: 1, commit: 1 });
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
    /preserve the claimed transition identity/
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
  assert.equal(outcome.kind, OUTCOMES.UNKNOWN);
}

console.log("NEXO STEP 3B/3C protected-transition composition tests: PASS");

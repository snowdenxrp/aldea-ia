import { isDeepStrictEqual } from "node:util";
import {
  AUTHORITY,
  COMMIT,
  OUTCOMES,
  VALIDATION,
  createClaimEnvelope,
  assertContractInput
} from "./contracts.mjs";

function assertCandidate(candidate, claim, expectedRevision) {
  assertContractInput(candidate, "candidate");
  if (!candidate.claim || typeof candidate.claim !== "object" || Array.isArray(candidate.claim)) {
    throw new TypeError("candidate must preserve the claimed transition identity");
  }
  const candidateClaim = createClaimEnvelope(candidate.claim);
  if (!isDeepStrictEqual(candidateClaim, claim)) {
    throw new TypeError("candidate must preserve the complete authorized claim");
  }
  if (!Number.isSafeInteger(candidate.expectedRevision) || candidate.expectedRevision < 0 || candidate.expectedRevision >= Number.MAX_SAFE_INTEGER) {
    throw new TypeError("candidate must carry a valid expectedRevision below MAX_SAFE_INTEGER");
  }
  if (candidate.expectedRevision !== expectedRevision) {
    throw new TypeError("candidate must preserve the requested expectedRevision");
  }
  if (candidate.state === undefined) {
    throw new TypeError("candidate must carry isolated state");
  }
}

function classify(ports, kind, { reasons = [], evidence = [] } = {}) {
  const outcome = ports.outcomeClassifier.classify({ kind, reasons, evidence });
  assertContractInput(outcome, "outcome classifier result");
  if (outcome.kind !== kind) {
    throw new Error("outcomeClassifier violated the required terminal classification");
  }
  if (!Array.isArray(outcome.reasons) || !Array.isArray(outcome.evidence)) {
    throw new TypeError("outcomeClassifier must return a complete Outcome with reasons and evidence arrays");
  }
  return outcome;
}

function outcomeFromValidation(ports, result) {
  if (result.status === VALIDATION.FAIL) {
    return classify(ports, OUTCOMES.SEMANTIC_CONFLICT, {
      reasons: result.reasons,
      evidence: result.evidence
    });
  }
  return classify(ports, OUTCOMES.UNKNOWN, {
    reasons: result.reasons,
    evidence: result.evidence
  });
}

export async function executeProtectedTransition(input = {}) {
  assertContractInput(input, "protectedTransition input");
  const { ports, proposal, state, expectedRevision } = input;
  if (!ports) throw new TypeError("ports are required");
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || expectedRevision >= Number.MAX_SAFE_INTEGER) {
    throw new TypeError("expectedRevision must be a non-negative safe integer below MAX_SAFE_INTEGER");
  }

  const builtClaim = await ports.claimBuilder.build(proposal);
  if (!builtClaim || typeof builtClaim !== "object" || Array.isArray(builtClaim)) {
    throw new TypeError("claimBuilder must return a ClaimEnvelope");
  }
  // Validate and detach the builder output before authority sees it. A
  // claimId-only look-alike must not reach the authority gate as a valid claim.
  const claim = createClaimEnvelope(builtClaim);

  const authority = await ports.authorityGate.check(claim);
  if (!authority || typeof authority !== "object" || Array.isArray(authority)) {
    return classify(ports, OUTCOMES.UNKNOWN, {
      reasons: ["authority gate returned a malformed result shape"]
    });
  }
  try {
    assertContractInput(authority, "authority gate result");
  } catch {
    return classify(ports, OUTCOMES.UNKNOWN, {
      reasons: ["authority gate returned a malformed result shape"]
    });
  }
  if (!Object.values(AUTHORITY).includes(authority.status)) {
    return classify(ports, OUTCOMES.UNKNOWN, {
      reasons: ["authority gate returned a malformed result shape"]
    });
  }
  if (!Array.isArray(authority.reasons) || !Array.isArray(authority.evidence)) {
    return classify(ports, OUTCOMES.UNKNOWN, {
      reasons: ["authority gate returned a malformed result shape"]
    });
  }

  if (authority.status === AUTHORITY.STOP) {
    return classify(ports, OUTCOMES.AUTHORITY_STOP, {
      reasons: authority.reasons,
      evidence: authority.evidence
    });
  }

  if (authority.status === AUTHORITY.UNKNOWN) {
    return classify(ports, OUTCOMES.UNKNOWN, {
      reasons: authority.reasons,
      evidence: authority.evidence
    });
  }

  const isolatedState = await ports.snapshotIsolator.isolate({ claim, state });
  if (isolatedState === undefined) {
    return classify(ports, OUTCOMES.UNKNOWN, {
      reasons: ["snapshot isolation did not establish isolated state"]
    });
  }

  const candidate = await ports.candidateExecutor.execute({
    claim,
    state: isolatedState,
    expectedRevision
  });
  assertCandidate(candidate, claim, expectedRevision);

  const validation = await ports.finalSemanticValidator.validate(candidate);
  if (!validation || typeof validation !== "object" || Array.isArray(validation)) {
    return classify(ports, OUTCOMES.UNKNOWN, {
      reasons: ["final semantic validator returned no valid result"]
    });
  }
  // Port output is an untrusted boundary too: reject accessors and exotic
  // shapes before reading status/reasons/evidence.
  assertContractInput(validation, "final semantic validator result");
  if (!Object.values(VALIDATION).includes(validation.status)) {
    return classify(ports, OUTCOMES.UNKNOWN, {
      reasons: ["final semantic validator returned no valid result"]
    });
  }

  if (!Array.isArray(validation.reasons) || !Array.isArray(validation.evidence)) {
    return classify(ports, OUTCOMES.UNKNOWN, {
      reasons: ["final semantic validator returned a malformed result shape"]
    });
  }

  if (validation.status !== VALIDATION.PASS) {
    return outcomeFromValidation(ports, validation);
  }

  // Construct the success outcome before mutation. If outcome construction
  // fails (for example, malformed evidence), do not commit and then lose the
  // ability to report the committed transition.
  const safeCommitOutcome = classify(ports, OUTCOMES.SAFE_COMMIT, {
    evidence: validation.evidence
  });

  let commit;
  try {
    commit = await ports.conditionalCommit.commit(candidate);
  } catch (error) {
    return classify(ports, OUTCOMES.RECONCILE_REQUIRED, {
      reasons: [error?.code ?? "conditional commit raised an exception"]
    });
  }

  if (!commit || typeof commit !== "object" || Array.isArray(commit)) {
    return classify(ports, OUTCOMES.RECONCILE_REQUIRED, {
      reasons: ["conditional commit returned no valid result"]
    });
  }
  try {
    assertContractInput(commit, "conditional commit result");
  } catch {
    return classify(ports, OUTCOMES.RECONCILE_REQUIRED, {
      reasons: ["conditional commit returned a malformed result shape"]
    });
  }
  if (!Object.values(COMMIT).includes(commit.status)) {
    return classify(ports, OUTCOMES.RECONCILE_REQUIRED, {
      reasons: ["conditional commit returned no valid result"]
    });
  }

  if (commit.status === COMMIT.COMMITTED) {
    return safeCommitOutcome;
  }

  if (commit.status === COMMIT.CONDITIONAL_CONFLICT) {
    return classify(ports, OUTCOMES.STALE_CANDIDATE, {
      reasons: [commit.errorCode ?? "conditional commit conflict"]
    });
  }

  if (commit.status === COMMIT.UNKNOWN) {
    return classify(ports, OUTCOMES.RECONCILE_REQUIRED, {
      reasons: ["conditional commit outcome is UNKNOWN"]
    });
  }

  return classify(ports, OUTCOMES.UNKNOWN, {
    reasons: ["conditional commit failed without a proven safe commit"]
  });
}

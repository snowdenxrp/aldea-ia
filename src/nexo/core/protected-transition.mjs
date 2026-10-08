import {
  AUTHORITY,
  COMMIT,
  OUTCOMES,
  VALIDATION,
  createCandidate,
  createOutcome
} from "./contracts.mjs";

function assertCandidate(candidate, claim) {
  if (!candidate || !candidate.claim || candidate.claim.claimId !== claim.claimId) {
    throw new TypeError("candidate must preserve the claimed transition identity");
  }
  if (!Number.isInteger(candidate.expectedRevision) || candidate.expectedRevision < 0) {
    throw new TypeError("candidate must carry a valid expectedRevision");
  }
  if (candidate.state === undefined) {
    throw new TypeError("candidate must carry isolated state");
  }
}

function outcomeFromValidation(result) {
  if (result.status === VALIDATION.FAIL) {
    return createOutcome(OUTCOMES.SEMANTIC_CONFLICT, {
      reasons: result.reasons,
      evidence: result.evidence
    });
  }
  return createOutcome(OUTCOMES.UNKNOWN, {
    reasons: result.reasons,
    evidence: result.evidence
  });
}

export function executeProtectedTransition({
  ports,
  proposal,
  state,
  expectedRevision
} = {}) {
  if (!ports) throw new TypeError("ports are required");
  if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
    throw new TypeError("expectedRevision must be a non-negative integer");
  }

  const claim = ports.claimBuilder.build(proposal);
  if (!claim || typeof claim.claimId !== "string") {
    throw new TypeError("claimBuilder must return a ClaimEnvelope");
  }

  const authority = ports.authorityGate.check(claim);
  if (!authority || !Object.values(AUTHORITY).includes(authority.status)) {
    throw new TypeError("authorityGate must return an AuthorityResult");
  }

  if (authority.status === AUTHORITY.STOP) {
    return createOutcome(OUTCOMES.AUTHORITY_STOP, {
      reasons: authority.reasons,
      evidence: authority.evidence
    });
  }

  if (authority.status === AUTHORITY.UNKNOWN) {
    return createOutcome(OUTCOMES.UNKNOWN, {
      reasons: authority.reasons,
      evidence: authority.evidence
    });
  }

  const isolatedState = ports.snapshotIsolator.isolate({ claim, state });
  if (isolatedState === undefined) {
    return createOutcome(OUTCOMES.UNKNOWN, {
      reasons: ["snapshot isolation did not establish isolated state"]
    });
  }

  const candidate = ports.candidateExecutor.execute({
    claim,
    state: isolatedState,
    expectedRevision
  });
  assertCandidate(candidate, claim);

  const validation = ports.finalSemanticValidator.validate(candidate);
  if (!validation || !Object.values(VALIDATION).includes(validation.status)) {
    return createOutcome(OUTCOMES.UNKNOWN, {
      reasons: ["final semantic validator returned no valid result"]
    });
  }

  if (validation.status !== VALIDATION.PASS) {
    return outcomeFromValidation(validation);
  }

  const commit = ports.conditionalCommit.commit(candidate);
  if (!commit || !Object.values(COMMIT).includes(commit.status)) {
    return createOutcome(OUTCOMES.UNKNOWN, {
      reasons: ["conditional commit returned no valid result"]
    });
  }

  if (commit.status === COMMIT.COMMITTED) {
    return createOutcome(OUTCOMES.SAFE_COMMIT, {
      evidence: validation.evidence
    });
  }

  if (commit.status === COMMIT.CONDITIONAL_CONFLICT) {
    return createOutcome(OUTCOMES.STALE_CANDIDATE, {
      reasons: [commit.errorCode ?? "conditional commit conflict"]
    });
  }

  return createOutcome(OUTCOMES.UNKNOWN, {
    reasons: [
      commit.status === COMMIT.UNKNOWN
        ? "conditional commit outcome is UNKNOWN"
        : "conditional commit failed without a proven safe commit"
    ]
  });
}

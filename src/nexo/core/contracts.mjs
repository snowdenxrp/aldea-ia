const TERMINAL_OUTCOMES = Object.freeze([
  "SAFE_COMMIT",
  "STALE_CANDIDATE",
  "SEMANTIC_CONFLICT",
  "AUTHORITY_STOP",
  "UNKNOWN",
  "RECONCILE_REQUIRED"
]);

const VALIDATION_STATES = Object.freeze(["PASS", "FAIL", "UNKNOWN"]);
const COMMIT_STATES = Object.freeze(["COMMITTED", "CONDITIONAL_CONFLICT", "FAILED", "UNKNOWN"]);

function immutable(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) immutable(child, seen);
  return Object.freeze(value);
}

function detachedImmutable(value) {
  if (value === undefined) return value;
  return immutable(structuredClone(value));
}

function requiredString(value, field) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value;
}

export function createClaimEnvelope(input = {}) {
  const claimId = requiredString(input.claimId, "claimId");
  const action = requiredString(input.action, "action");
  return immutable({
    claimId,
    action,
    target: detachedImmutable(input.target ?? null),
    targetIncarnation: detachedImmutable(input.targetIncarnation ?? null),
    authoritativeReads: immutable([...(input.authoritativeReads ?? [])]),
    dependencies: immutable([...(input.dependencies ?? [])]),
    predicateDependencies: immutable([...(input.predicateDependencies ?? [])]),
    derivedProvenance: immutable([...(input.derivedProvenance ?? [])]),
    policyContext: detachedImmutable(input.policyContext ?? null),
    causalInputs: immutable([...(input.causalInputs ?? [])]),
    sourceProvenance: immutable([...(input.sourceProvenance ?? [])])
  });
}

export function createCandidate({ claim, state, expectedRevision } = {}) {
  if (!claim || typeof claim.claimId !== "string") throw new TypeError("candidate requires a ClaimEnvelope");
  if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
    throw new TypeError("expectedRevision must be a non-negative integer");
  }
  if (state === undefined) throw new TypeError("candidate requires isolated state");
  return { claim, state, expectedRevision };
}

export function createValidationResult(status, { reasons = [], evidence = [] } = {}) {
  if (!VALIDATION_STATES.includes(status)) throw new TypeError(`invalid validation status: ${status}`);
  return immutable({
    status,
    reasons: immutable([...reasons]),
    evidence: immutable([...evidence])
  });
}

export function createCommitResult(status, { errorCode = null } = {}) {
  if (!COMMIT_STATES.includes(status)) throw new TypeError(`invalid commit status: ${status}`);
  return immutable({ status, errorCode });
}

export function createOutcome(kind, { reasons = [], evidence = [] } = {}) {
  if (!TERMINAL_OUTCOMES.includes(kind)) throw new TypeError(`invalid outcome: ${kind}`);
  return immutable({
    kind,
    reasons: immutable([...reasons]),
    evidence: immutable([...evidence])
  });
}

export const OUTCOMES = Object.freeze({
  SAFE_COMMIT: "SAFE_COMMIT",
  STALE_CANDIDATE: "STALE_CANDIDATE",
  SEMANTIC_CONFLICT: "SEMANTIC_CONFLICT",
  AUTHORITY_STOP: "AUTHORITY_STOP",
  UNKNOWN: "UNKNOWN",
  RECONCILE_REQUIRED: "RECONCILE_REQUIRED"
});

export const VALIDATION = Object.freeze({
  PASS: "PASS",
  FAIL: "FAIL",
  UNKNOWN: "UNKNOWN"
});

export const COMMIT = Object.freeze({
  COMMITTED: "COMMITTED",
  CONDITIONAL_CONFLICT: "CONDITIONAL_CONFLICT",
  FAILED: "FAILED",
  UNKNOWN: "UNKNOWN"
});

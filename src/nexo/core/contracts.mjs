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

function detachedMutable(value) {
  if (value === undefined) return value;
  return structuredClone(value);
}

function requiredString(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-empty, non-blank string`);
  }
  return value;
}

function requiredArray(value, field) {
  if (!Array.isArray(value)) {
    throw new TypeError(`${field} must be an array`);
  }
  return value;
}

const POLICY_CONTEXT_STATUS = Object.freeze(["VALID", "FAIL", "UNKNOWN"]);

function requiredPolicyRef(value) {
  if (!value || typeof value !== "object") throw new TypeError("policyContext.policyRef is required");
  requiredString(value.id, "policyContext.policyRef.id");
  requiredString(value.semanticVersion, "policyContext.policyRef.semanticVersion");
  requiredString(value.hash, "policyContext.policyRef.hash");
  return value;
}

function createPolicyContext(input = {}) {
  const policyRef = requiredPolicyRef(input.policyRef);
  if (input.scope === undefined) throw new TypeError("policyContext.scope is required");
  if (!input.validity || typeof input.validity !== "object") throw new TypeError("policyContext.validity is required");
  if (!POLICY_CONTEXT_STATUS.includes(input.validity.status)) {
    throw new TypeError("policyContext.validity.status must be VALID, FAIL, or UNKNOWN");
  }
  if (input.resolved === undefined || input.resolved === null || typeof input.resolved !== "object") {
    throw new TypeError("policyContext.resolved is required");
  }
  requiredArray(input.resolved.dependencies, "policyContext.resolved.dependencies");
  requiredArray(input.resolutionProvenance, "policyContext.resolutionProvenance");
  return immutable({
    policyRef: detachedImmutable(policyRef),
    scope: detachedImmutable(input.scope),
    resolved: detachedImmutable(input.resolved),
    validity: detachedImmutable(input.validity),
    resolutionProvenance: detachedImmutable(input.resolutionProvenance)
  });
}

export function createClaimEnvelope(input = {}) {
  const claimId = requiredString(input.claimId, "claimId");
  const action = requiredString(input.action, "action");
  return immutable({
    claimId,
    action,
    target: detachedImmutable(input.target ?? null),
    targetIncarnation: detachedImmutable(input.targetIncarnation ?? null),
    authoritativeReads: detachedImmutable([...requiredArray(input.authoritativeReads ?? [], "authoritativeReads")]),
    dependencies: detachedImmutable([...requiredArray(input.dependencies ?? [], "dependencies")]),
    predicateDependencies: detachedImmutable([...requiredArray(input.predicateDependencies ?? [], "predicateDependencies")]),
    derivedProvenance: detachedImmutable([...requiredArray(input.derivedProvenance ?? [], "derivedProvenance")]),
    policyContext: input.policyContext == null ? null : createPolicyContext(input.policyContext),
    causalInputs: detachedImmutable([...requiredArray(input.causalInputs ?? [], "causalInputs")]),
    sourceProvenance: detachedImmutable([...requiredArray(input.sourceProvenance ?? [], "sourceProvenance")])
  });
}

export function createCandidate({ claim, state, expectedRevision } = {}) {
  if (!claim || typeof claim !== "object" || Array.isArray(claim)) {
    throw new TypeError("candidate requires a ClaimEnvelope");
  }
  // Revalidate and detach the claim at this public boundary; callers must not
  // bypass createClaimEnvelope() by supplying a look-alike object.
  const validatedClaim = createClaimEnvelope(claim);
  if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
    throw new TypeError("expectedRevision must be a non-negative integer");
  }
  if (state === undefined) throw new TypeError("candidate requires isolated state");
  return { claim: validatedClaim, state: detachedMutable(state), expectedRevision };
}

export function createValidationResult(status, { reasons = [], evidence = [] } = {}) {
  if (!VALIDATION_STATES.includes(status)) throw new TypeError(`invalid validation status: ${status}`);
  requiredArray(reasons, "validation reasons");
  requiredArray(evidence, "validation evidence");
  return immutable({
    status,
    reasons: detachedImmutable(reasons),
    evidence: detachedImmutable(evidence)
  });
}

export function createCommitResult(status, { errorCode = null } = {}) {
  if (!COMMIT_STATES.includes(status)) throw new TypeError(`invalid commit status: ${status}`);
  return immutable({ status, errorCode });
}

export function createOutcome(kind, { reasons = [], evidence = [] } = {}) {
  if (!TERMINAL_OUTCOMES.includes(kind)) throw new TypeError(`invalid outcome: ${kind}`);
  requiredArray(reasons, "outcome reasons");
  requiredArray(evidence, "outcome evidence");
  return immutable({
    kind,
    reasons: detachedImmutable(reasons),
    evidence: detachedImmutable(evidence)
  });
}

const AUTHORITY_STATES = Object.freeze(["AUTHORIZED", "STOP", "UNKNOWN"]);

export function createAuthorityResult(status, { reasons = [], evidence = [] } = {}) {
  if (!AUTHORITY_STATES.includes(status)) throw new TypeError(`invalid authority status: ${status}`);
  requiredArray(reasons, "authority reasons");
  requiredArray(evidence, "authority evidence");
  return immutable({
    status,
    reasons: detachedImmutable(reasons),
    evidence: detachedImmutable(evidence)
  });
}

export const AUTHORITY = Object.freeze({
  AUTHORIZED: "AUTHORIZED",
  STOP: "STOP",
  UNKNOWN: "UNKNOWN"
});

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

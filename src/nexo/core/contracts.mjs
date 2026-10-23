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

const CONTRACT_LIMITS = Object.freeze({
  maxDepth: 40,
  maxNodes: 100_000,
  maxStringBytes: 16 * 1024 * 1024,
  maxTotalStringBytes: 17 * 1024 * 1024
});
const CONTRACT_TEXT_ENCODER = new TextEncoder();

function contractStringBytes(value) {
  return CONTRACT_TEXT_ENCODER.encode(value).byteLength;
}

function assertDeepFreezable(root) {
  const active = new WeakSet();
  const complete = new WeakSet();
  const stack = [{ value: root, depth: 0, entered: false }];
  let nodes = 0;
  let totalStringBytes = 0;

  function accountString(value) {
    const bytes = contractStringBytes(value);
    if (bytes > CONTRACT_LIMITS.maxStringBytes) {
      throw new TypeError("contract data exceeds resource limits: string too large");
    }
    totalStringBytes += bytes;
    if (totalStringBytes > CONTRACT_LIMITS.maxTotalStringBytes) {
      throw new TypeError("contract data exceeds resource limits: total string bytes exceeded");
    }
  }

  while (stack.length > 0) {
    const frame = stack[stack.length - 1];
    const value = frame.value;
    if (!frame.entered) {
      frame.entered = true;
      if (frame.depth > CONTRACT_LIMITS.maxDepth) {
        throw new TypeError("contract data exceeds resource limits: maximum depth exceeded");
      }
      if (typeof value === "string") accountString(value);
      if (value === null || typeof value !== "object") {
        stack.pop();
        continue;
      }
      if (active.has(value)) throw new TypeError("contract data must not contain cycles");
      if (complete.has(value)) {
        stack.pop();
        continue;
      }
      nodes += 1;
      if (nodes > CONTRACT_LIMITS.maxNodes) {
        throw new TypeError("contract data exceeds resource limits: maximum node count exceeded");
      }
      const isArray = Array.isArray(value);
      const prototype = Object.getPrototypeOf(value);
      if (isArray) {
        if (prototype !== Array.prototype) {
          throw new TypeError("contract arrays must use the canonical Array prototype");
        }
      } else if (prototype !== Object.prototype && prototype !== null) {
        throw new TypeError("contract data must contain only arrays and plain objects");
      }
      const keys = Reflect.ownKeys(value);
      if (isArray && (keys.length !== value.length + 1 || !keys.includes("length"))) {
        throw new TypeError("contract arrays must be dense and must not have extra properties");
      }
      const children = [];
      for (const key of keys) {
        if (typeof key === "symbol") {
          throw new TypeError("contract data must not contain symbol-keyed properties");
        }
        if (isArray && key === "length") continue;
        accountString(key);
        if (isArray) {
          const index = Number(key);
          if (!Number.isInteger(index) || index < 0 || index >= value.length || String(index) !== key) {
            throw new TypeError("contract arrays must be dense and must not have extra properties");
          }
        }
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
          throw new TypeError("contract data must contain only enumerable data properties");
        }
        children.push(descriptor.value);
      }
      if (isArray && children.length !== value.length) {
        throw new TypeError("contract arrays must be dense and must not have extra properties");
      }
      active.add(value);
      frame.children = children;
      frame.index = 0;
      continue;
    }
    if (frame.index < frame.children.length) {
      const child = frame.children[frame.index++];
      if (child !== null && typeof child === "object" && active.has(child)) {
        throw new TypeError("contract data must not contain cycles");
      }
      if (child !== null && typeof child === "object" && complete.has(child)) continue;
      stack.push({ value: child, depth: frame.depth + 1, entered: false });
      continue;
    }
    active.delete(value);
    complete.add(value);
    stack.pop();
  }
}

function immutable(value) {
  if (value === null || typeof value !== "object") return value;
  const seen = new WeakSet();
  const stack = [{ value, expanded: false }];
  while (stack.length > 0) {
    const frame = stack.pop();
    const current = frame.value;
    if (current === null || typeof current !== "object") continue;
    if (frame.expanded) {
      Object.freeze(current);
      continue;
    }
    if (seen.has(current)) continue;
    seen.add(current);
    stack.push({ value: current, expanded: true });
    const keys = Reflect.ownKeys(current);
    for (let i = keys.length - 1; i >= 0; i -= 1) {
      const key = keys[i];
      if (Array.isArray(current) && key === "length") continue;
      const descriptor = Object.getOwnPropertyDescriptor(current, key);
      if (descriptor && "value" in descriptor) stack.push({ value: descriptor.value, expanded: false });
    }
  }
  return value;
}

function detachedImmutable(value) {
  if (value === undefined) return value;
  // Validate the caller-owned graph before structuredClone: cloning can silently
  // omit symbol/non-enumerable properties and can execute getters.
  assertDeepFreezable(value);
  const clone = structuredClone(value);
  assertDeepFreezable(clone);
  return immutable(clone);
}

function detachedMutable(value) {
  if (value === undefined) return value;
  // Apply the same admission rules before cloning; structuredClone must not
  // normalize a malformed caller-owned graph into an accepted candidate.
  assertDeepFreezable(value);
  const clone = structuredClone(value);
  assertDeepFreezable(clone);
  return clone;
}

export function assertContractInput(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${field} must be a record`);
  }
  assertDeepFreezable(value);
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
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("policyContext.policyRef must be a record");
  }
  requiredString(value.id, "policyContext.policyRef.id");
  requiredString(value.semanticVersion, "policyContext.policyRef.semanticVersion");
  requiredString(value.hash, "policyContext.policyRef.hash");
  return value;
}

function createPolicyContext(input = {}) {
  assertContractInput(input, "policyContext");
  const policyRef = requiredPolicyRef(input.policyRef);
  if (input.scope === undefined) throw new TypeError("policyContext.scope is required");
  if (!input.validity || typeof input.validity !== "object" || Array.isArray(input.validity)) {
    throw new TypeError("policyContext.validity must be a record");
  }
  if (!POLICY_CONTEXT_STATUS.includes(input.validity.status)) {
    throw new TypeError("policyContext.validity.status must be VALID, FAIL, or UNKNOWN");
  }
  if (!input.resolved || typeof input.resolved !== "object" || Array.isArray(input.resolved)) {
    throw new TypeError("policyContext.resolved must be a record");
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
  assertContractInput(input, "claimEnvelope");
  const claimId = requiredString(input.claimId, "claimId");
  const action = requiredString(input.action, "action");
  return immutable({
    claimId,
    action,
    target: detachedImmutable(input.target ?? null),
    targetIncarnation: detachedImmutable(input.targetIncarnation ?? null),
    authoritativeReads: detachedImmutable(requiredArray(input.authoritativeReads ?? [], "authoritativeReads")),
    dependencies: detachedImmutable(requiredArray(input.dependencies ?? [], "dependencies")),
    predicateDependencies: detachedImmutable(requiredArray(input.predicateDependencies ?? [], "predicateDependencies")),
    derivedProvenance: detachedImmutable(requiredArray(input.derivedProvenance ?? [], "derivedProvenance")),
    policyContext: input.policyContext == null ? null : createPolicyContext(input.policyContext),
    causalInputs: detachedImmutable(requiredArray(input.causalInputs ?? [], "causalInputs")),
    sourceProvenance: detachedImmutable(requiredArray(input.sourceProvenance ?? [], "sourceProvenance"))
  });
}

export function createCandidate(input = {}) {
  assertContractInput(input, "candidate");
  const { claim, state, expectedRevision } = input;
  if (!claim || typeof claim !== "object" || Array.isArray(claim)) {
    throw new TypeError("candidate requires a ClaimEnvelope");
  }
  // Revalidate and detach the claim at this public boundary; callers must not
  // bypass createClaimEnvelope() by supplying a look-alike object.
  const validatedClaim = createClaimEnvelope(claim);
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || expectedRevision >= Number.MAX_SAFE_INTEGER) {
    throw new TypeError("expectedRevision must be a non-negative safe integer below MAX_SAFE_INTEGER");
  }
  if (state === undefined) throw new TypeError("candidate requires isolated state");
  return { claim: validatedClaim, state: detachedMutable(state), expectedRevision };
}

export function createValidationResult(status, options = {}) {
  assertContractInput(options, "validationResult options");
  const { reasons = [], evidence = [] } = options;
  if (!VALIDATION_STATES.includes(status)) throw new TypeError(`invalid validation status: ${status}`);
  requiredArray(reasons, "validation reasons");
  requiredArray(evidence, "validation evidence");
  return immutable({
    status,
    reasons: detachedImmutable(reasons),
    evidence: detachedImmutable(evidence)
  });
}

export function createCommitResult(status, options = {}) {
  assertContractInput(options, "commitResult options");
  const { errorCode = null } = options;
  if (!COMMIT_STATES.includes(status)) throw new TypeError(`invalid commit status: ${status}`);
  if (errorCode !== null) requiredString(errorCode, "commit errorCode");
  return immutable({ status, errorCode });
}

export function createOutcome(kind, options = {}) {
  assertContractInput(options, "outcome options");
  const { reasons = [], evidence = [] } = options;
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

export function createAuthorityResult(status, options = {}) {
  assertContractInput(options, "authorityResult options");
  const { reasons = [], evidence = [] } = options;
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

const RESOLUTION_INPUT_STATES = Object.freeze(["PASS", "FAIL", "UNKNOWN"]);
export const POLICY_CONTEXT_RESOLUTION = Object.freeze({ VALID: "VALID", FAIL: "FAIL", UNKNOWN: "UNKNOWN" });

function immutable(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) immutable(child, seen);
  return Object.freeze(value);
}

function assertPlainData(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("policy context data must contain only arrays and plain objects");
  }
  for (const child of Object.values(value)) assertPlainData(child, seen);
}

function detached(value) {
  const clone = structuredClone(value);
  assertPlainData(clone);
  return immutable(clone);
}

function check(name, value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || !RESOLUTION_INPUT_STATES.includes(value.status)) {
    throw new TypeError(`invalid status for ${name}`);
  }
  for (const field of ["reasons", "evidence"]) {
    if (value[field] !== undefined && !Array.isArray(value[field])) {
      throw new TypeError(`${name}.${field} must be an array`);
    }
  }
  return value;
}

export function resolvePolicyContext(input = {}) {
  if (!input.policyRef || typeof input.policyRef !== "object") throw new TypeError("policyRef is required");
  for (const field of ["id", "semanticVersion", "hash"]) {
    if (typeof input.policyRef[field] !== "string" || input.policyRef[field].trim().length === 0) {
      throw new TypeError(`policyRef.${field} is required`);
    }
  }
  if (input.scope === undefined) throw new TypeError("scope is required");
  const checks = {
    identity: check("identity", input.identity),
    applicability: check("applicability", input.applicability),
    dependencies: check("dependencies", input.dependencies),
    temporal: check("temporal", input.temporal),
    provenance: check("provenance", input.provenance)
  };
  const failures = Object.entries(checks).filter(([, value]) => value.status === "FAIL");
  const unknowns = Object.entries(checks).filter(([, value]) => value.status === "UNKNOWN");
  const status = failures.length ? POLICY_CONTEXT_RESOLUTION.FAIL : unknowns.length ? POLICY_CONTEXT_RESOLUTION.UNKNOWN : POLICY_CONTEXT_RESOLUTION.VALID;
  return immutable({
    status,
    reasons: detached([
      ...failures.map(([name, value]) => ({ check: name, reasons: value.reasons ?? [] })),
      ...unknowns.map(([name, value]) => ({ check: name, reasons: value.reasons ?? [] }))
    ]),
    evidence: detached(Object.fromEntries(Object.entries(checks).map(([name, value]) => [name, { status: value.status, evidence: value.evidence ?? [] }]))),
    policyRef: detached(input.policyRef),
    scope: detached(input.scope)
  });
}
const RESOLUTION_INPUT_STATES = Object.freeze(["PASS", "FAIL", "UNKNOWN"]);
export const POLICY_CONTEXT_RESOLUTION = Object.freeze({ VALID: "VALID", FAIL: "FAIL", UNKNOWN: "UNKNOWN" });

function immutable(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) immutable(child, seen);
  return Object.freeze(value);
}

function detached(value) { return immutable(structuredClone(value)); }

function check(name, value) {
  if (!value || typeof value !== "object" || !RESOLUTION_INPUT_STATES.includes(value.status)) {
    throw new TypeError(`invalid status for ${name}`);
  }
  return value;
}

export function resolvePolicyContext(input = {}) {
  if (!input.policyRef || typeof input.policyRef !== "object") throw new TypeError("policyRef is required");
  for (const field of ["id", "semanticVersion", "hash"]) {
    if (typeof input.policyRef[field] !== "string" || input.policyRef[field].length === 0) {
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
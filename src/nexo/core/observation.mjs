const ADMISSION_STATES = Object.freeze(["ADMITTED", "NOT_ADMITTED", "UNKNOWN"]);

function assertDeepFreezable(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);

  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("observation data must contain only arrays and plain objects");
  }

  for (const child of Object.values(value)) assertDeepFreezable(child, seen);
}

function immutable(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) immutable(child, seen);
  return Object.freeze(value);
}

function detachedImmutable(value) {
  if (value === undefined) return undefined;
  const clone = structuredClone(value);
  assertDeepFreezable(clone);
  return immutable(clone);
}

function requiredString(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-empty, non-blank string`);
  }
  return value;
}

function requiredArray(value, field) {
  if (!Array.isArray(value)) throw new TypeError(`${field} must be an array`);
  return value;
}

export const ADMISSION = Object.freeze({
  ADMITTED: "ADMITTED",
  NOT_ADMITTED: "NOT_ADMITTED",
  UNKNOWN: "UNKNOWN"
});

export function createObservationEnvelope(input = {}) {
  const source = requiredString(input.source, "source");
  const code = requiredString(input.code, "code");

  return immutable({
    source,
    code,
    severity: input.severity ?? null,
    target: detachedImmutable(input.target ?? null),
    targetIncarnation: detachedImmutable(input.targetIncarnation ?? null),
    inputs: detachedImmutable(input.inputs ?? null),
    freshness: detachedImmutable(input.freshness ?? null),
    derivedProvenance: detachedImmutable([...requiredArray(input.derivedProvenance ?? [], "derivedProvenance")]),
    proposedAction: detachedImmutable(input.proposedAction ?? null),
    explanatory: detachedImmutable(input.explanatory ?? null),
    existingIdentity: detachedImmutable(input.existingIdentity ?? null)
  });
}

export function createMissionCandidate({ observation, claim, admission = "UNKNOWN", admissionEvidence = [] } = {}) {
  if (!observation || typeof observation !== "object") {
    throw new TypeError("candidate requires an ObservationEnvelope");
  }
  requiredString(observation.source, "observation.source");
  requiredString(observation.code, "observation.code");
  if (!ADMISSION_STATES.includes(admission)) {
    throw new TypeError(`invalid admission state: ${admission}`);
  }

  return immutable({
    observation: detachedImmutable(observation),
    claim: detachedImmutable(claim ?? null),
    admission,
    admissionEvidence: detachedImmutable([...requiredArray(admissionEvidence, "admissionEvidence")])
  });
}

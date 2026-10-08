const ADMISSION_STATES = Object.freeze(["ADMITTED", "NOT_ADMITTED", "UNKNOWN"]);

function immutable(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) immutable(child, seen);
  return Object.freeze(value);
}

function detachedImmutable(value) {
  if (value === undefined) return undefined;
  return immutable(structuredClone(value));
}

function requiredString(value, field) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
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
    derivedProvenance: detachedImmutable([...(input.derivedProvenance ?? [])]),
    proposedAction: detachedImmutable(input.proposedAction ?? null),
    explanatory: detachedImmutable(input.explanatory ?? null),
    existingIdentity: detachedImmutable(input.existingIdentity ?? null)
  });
}

export function createMissionCandidate({ observation, claim, admission = "UNKNOWN", admissionEvidence = [] } = {}) {
  if (!observation || typeof observation.source !== "string" || typeof observation.code !== "string") {
    throw new TypeError("candidate requires an ObservationEnvelope");
  }
  if (!ADMISSION_STATES.includes(admission)) {
    throw new TypeError(`invalid admission state: ${admission}`);
  }

  return immutable({
    observation,
    claim: detachedImmutable(claim ?? null),
    admission,
    admissionEvidence: detachedImmutable([...admissionEvidence])
  });
}

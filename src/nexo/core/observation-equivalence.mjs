function immutable(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) immutable(child, seen);
  return Object.freeze(value);
}

function result(status, reasons = []) {
  return immutable({ status, reasons: [...reasons] });
}

export const EQUIVALENCE = Object.freeze({
  EQUIVALENT: "EQUIVALENT",
  NON_EQUIVALENT: "NON_EQUIVALENT",
  UNKNOWN: "UNKNOWN"
});

function sameSerialized(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function evaluateNegativeResourceEquivalence(a, b) {
  if (!a || !b || a.code !== "NEGATIVE_RESOURCE" || b.code !== "NEGATIVE_RESOURCE") {
    return result(EQUIVALENCE.UNKNOWN, ["unsupported_or_missing_observation"]);
  }

  if (a.source !== b.source || a.code !== b.code) {
    return result(EQUIVALENCE.NON_EQUIVALENT, ["source_or_code_differs"]);
  }

  const aType = a.inputs?.resourceType;
  const bType = b.inputs?.resourceType;
  const aAmount = a.inputs?.amount;
  const bAmount = b.inputs?.amount;

  if (aType !== undefined && bType !== undefined && aType !== bType) {
    return result(EQUIVALENCE.NON_EQUIVALENT, ["resource_type_differs"]);
  }

  if (aAmount !== undefined && bAmount !== undefined && aAmount !== bAmount) {
    return result(EQUIVALENCE.NON_EQUIVALENT, ["observed_amount_differs"]);
  }

  // The producer currently does not establish these dimensions. An empty
  // provenance collection is therefore absence of evidence, not proof of
  // equivalence.
  const dimensions = [
    ["resource_type", aType, bType],
    ["amount", aAmount, bAmount],
    ["resource_incarnation", a.targetIncarnation, b.targetIncarnation],
    ["freshness", a.freshness, b.freshness],
    ["causal_dependency", a.derivedProvenance, b.derivedProvenance]
  ];

  if (
    dimensions.some(([, left, right]) =>
      left === undefined ||
      right === undefined ||
      left === null ||
      right === null ||
      (Array.isArray(left) && left.length === 0) ||
      (Array.isArray(right) && right.length === 0)
    )
  ) {
    return result(EQUIVALENCE.UNKNOWN, ["claim_critical_dimension_missing"]);
  }

  if (!sameSerialized(a.targetIncarnation, b.targetIncarnation)) {
    return result(EQUIVALENCE.NON_EQUIVALENT, ["resource_incarnation_differs"]);
  }

  if (!sameSerialized(a.freshness, b.freshness)) {
    return result(EQUIVALENCE.NON_EQUIVALENT, ["freshness_differs"]);
  }

  if (!sameSerialized(a.derivedProvenance, b.derivedProvenance)) {
    return result(EQUIVALENCE.NON_EQUIVALENT, ["causal_dependency_differs"]);
  }

  return result(EQUIVALENCE.EQUIVALENT);
}

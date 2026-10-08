const RESULTS = Object.freeze(["EQUIVALENT", "NON_EQUIVALENT", "UNKNOWN"]);

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

export function evaluateNegativeResourceEquivalence(a, b) {
  if (!a || !b || a.code !== "NEGATIVE_RESOURCE" || b.code !== "NEGATIVE_RESOURCE") {
    return result("UNKNOWN", ["unsupported_or_missing_observation"]);
  }

  if (a.source !== b.source || a.code !== b.code) {
    return result("NON_EQUIVALENT", ["source_or_code_differs"]);
  }

  const aType = a.inputs?.resourceType;
  const bType = b.inputs?.resourceType;
  const aAmount = a.inputs?.amount;
  const bAmount = b.inputs?.amount;

  if (aType !== undefined && bType !== undefined && aType !== bType) {
    return result("NON_EQUIVALENT", ["resource_type_differs"]);
  }

  if (aAmount !== undefined && bAmount !== undefined && aAmount !== bAmount) {
    return result("NON_EQUIVALENT", ["observed_amount_differs"]);
  }

  const required = [
    ["resource_type", aType, bType],
    ["amount", aAmount, bAmount],
    ["resource_incarnation", a.targetIncarnation, b.targetIncarnation],
    ["freshness", a.freshness, b.freshness],
    ["causal_dependency", a.derivedProvenance, b.derivedProvenance]
  ];

  if (required.some(([, left, right]) => left === undefined || right === undefined || left === null || right === null)) {
    return result("UNKNOWN", ["claim_critical_dimension_missing"]);
  }

  if (JSON.stringify(a.targetIncarnation) !== JSON.stringify(b.targetIncarnation)) {
    return result("NON_EQUIVALENT", ["resource_incarnation_differs"]);
  }

  if (JSON.stringify(a.freshness) !== JSON.stringify(b.freshness)) {
    return result("NON_EQUIVALENT", ["freshness_differs"]);
  }

  if (JSON.stringify(a.derivedProvenance) !== JSON.stringify(b.derivedProvenance)) {
    return result("NON_EQUIVALENT", ["causal_dependency_differs"]);
  }

  return result("EQUIVALENT");
}

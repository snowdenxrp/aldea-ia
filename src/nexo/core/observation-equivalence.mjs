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

function isPlainJsonData(value, ancestors = new WeakSet()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object") return false;
  if (ancestors.has(value)) return false;

  const prototype = Object.getPrototypeOf(value);
  const isArray = Array.isArray(value);
  if (!isArray && prototype !== Object.prototype && prototype !== null) return false;

  ancestors.add(value);
  let valid = true;
  if (isArray) {
    const keys = Object.keys(value);
    if (keys.length !== value.length) valid = false;
    for (let index = 0; valid && index < value.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(value, index) ||
          !isPlainJsonData(value[index], ancestors)) valid = false;
    }
    if (valid && keys.some(key => !/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length)) {
      valid = false;
    }
  } else {
    for (const key of Object.keys(value)) {
      if (!isPlainJsonData(value[key], ancestors)) {
        valid = false;
        break;
      }
    }
  }
  ancestors.delete(value);
  return valid;
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map(key =>
      `${JSON.stringify(key)}:${canonicalJson(value[key])}`
    ).join(",")}}`;
  }
  return JSON.stringify(value);
}

function sameSerialized(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

export function evaluateNegativeResourceEquivalence(a, b) {
  if (!a || !b || a.code !== "NEGATIVE_RESOURCE" || b.code !== "NEGATIVE_RESOURCE") {
    return result(EQUIVALENCE.UNKNOWN, ["unsupported_or_missing_observation"]);
  }

  // This API is a public boundary: arbitrary objects can stringify to the same
  // empty JSON representation (e.g. distinct Maps), which is not evidence of
  // equivalent resource state. Malformed/non-JSON observations fail closed.
  if (!isPlainJsonData(a) || !isPlainJsonData(b)) {
    return result(EQUIVALENCE.UNKNOWN, ["malformed_observation_data"]);
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

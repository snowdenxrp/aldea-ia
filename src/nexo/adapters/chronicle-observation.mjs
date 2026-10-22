function readObservationOptions(options) {
  if (options === undefined) return null;
  if (!options || typeof options !== "object" || Array.isArray(options)) return null;
  try {
    const prototype = Object.getPrototypeOf(options);
    if (prototype !== Object.prototype && prototype !== null) return null;
    const values = Object.create(null);
    for (const key of ["store", "idempotencyKey", "missionId", "stepId", "action", "target"]) {
      const descriptor = Object.getOwnPropertyDescriptor(options, key);
      if (!descriptor) continue;
      if (!descriptor.enumerable || !("value" in descriptor)) return null;
      values[key] = descriptor.value;
    }
    return values;
  } catch {
    return null;
  }
}

/**
 * Trusted action-specific verifier for the native Chronicle append operation.
 * It reads the persisted store anew. Observation does not prove causal attribution.
 */
export async function observeChronicleOperation(options) {
  const input = readObservationOptions(options);
  if (!input) {
    return { status: "unknown", code: "NEXO_CHRONICLE_OBSERVATION_INPUT_INVALID", source: "nexo-chronicle-store" };
  }
  const { store, idempotencyKey, missionId, stepId, action, target = null } = input;
  let loadCurrent;
  try {
    const descriptor = store && typeof store === "object" && !Array.isArray(store)
      ? Object.getOwnPropertyDescriptor(store, "loadCurrent")
      : null;
    if (!descriptor || !("value" in descriptor) || typeof descriptor.value !== "function") {
      return { status: "unknown", code: "NEXO_CHRONICLE_OBSERVATION_INPUT_INVALID", source: "nexo-chronicle-store" };
    }
    loadCurrent = descriptor.value;
  } catch {
    return { status: "unknown", code: "NEXO_CHRONICLE_OBSERVATION_INPUT_INVALID", source: "nexo-chronicle-store" };
  }

  let targetContent;
  try {
    if (!target || typeof target !== "object" || Array.isArray(target)) {
      return { status: "unknown", code: "NEXO_CHRONICLE_OBSERVATION_INPUT_INVALID", source: "nexo-chronicle-store" };
    }
    const descriptor = Object.getOwnPropertyDescriptor(target, "content");
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      return { status: "unknown", code: "NEXO_CHRONICLE_OBSERVATION_INPUT_INVALID", source: "nexo-chronicle-store" };
    }
    targetContent = descriptor.value;
  } catch {
    return { status: "unknown", code: "NEXO_CHRONICLE_OBSERVATION_INPUT_INVALID", source: "nexo-chronicle-store" };
  }

  if (typeof loadCurrent !== "function" ||
      typeof idempotencyKey !== "string" || !idempotencyKey.trim() ||
      typeof missionId !== "string" || !missionId.trim() || missionId.includes(":") ||
      typeof stepId !== "string" || !stepId.trim() || stepId.includes(":") ||
      action !== "chronicle_append" ||
      typeof targetContent !== "string" || !targetContent.trim()) {
    return { status: "unknown", code: "NEXO_CHRONICLE_OBSERVATION_INPUT_INVALID", source: "nexo-chronicle-store" };
  }

  let current;
  try { current = await loadCurrent.call(store); }
  catch (error) {
    return { status: "unknown", code: error?.code ?? "NEXO_CHRONICLE_OBSERVATION_READ_FAILED", source: "nexo-chronicle-store" };
  }
  if (!current || !Array.isArray(current.entries) ||
      !Number.isSafeInteger(current.storeRevision) || current.storeRevision < 0 ||
      current.entries.some(entry => !entry || typeof entry !== "object" ||
        typeof entry.operationKey !== "string" || typeof entry.content !== "string")) {
    return { status: "unknown", code: "NEXO_CHRONICLE_OBSERVATION_STORE_SHAPE_INVALID", source: "nexo-chronicle-store" };
  }
  const matches = current.entries.filter(entry => entry.operationKey === idempotencyKey);
  const binding = { idempotencyKey, missionId, stepId, action, target: { content: targetContent }, observedRevision: current.storeRevision, source: "nexo-chronicle-store" };
  if (matches.length > 1) {
    return { ...binding, status: "unknown", code: "NEXO_CHRONICLE_DUPLICATE_OPERATION_KEY" };
  }
  if (matches.length === 0) {
    return {
      ...binding,
      status: "not_applied",
      evidence: {
        kind: "chronicle-operation-absence",
        operationKey: idempotencyKey,
        observedRevision: current.storeRevision,
        matchCount: 0
      },
      causalAttribution: "not_established"
    };
  }
  if (matches[0].content !== targetContent) {
    return { ...binding, status: "unknown", code: "NEXO_CHRONICLE_OPERATION_CONTENT_CONFLICT" };
  }
  return {
    ...binding,
    status: "applied",
    evidence: {
      kind: "persisted-chronicle-entry",
      operationKey: matches[0].operationKey,
      content: matches[0].content
    },
    causalAttribution: "not_established"
  };
}

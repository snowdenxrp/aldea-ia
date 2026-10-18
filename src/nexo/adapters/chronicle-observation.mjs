/**
 * Trusted action-specific verifier for the native Chronicle append operation.
 * It reads the persisted store anew. Observation does not prove causal attribution.
 */
export async function observeChronicleOperation({ store, idempotencyKey, missionId, stepId, action, target = null } = {}) {
  if (!store || typeof store.loadCurrent !== "function" ||
      typeof idempotencyKey !== "string" || !idempotencyKey.trim() ||
      typeof missionId !== "string" || !missionId.trim() || missionId.includes(":") ||
      typeof stepId !== "string" || !stepId.trim() || stepId.includes(":") ||
      action !== "chronicle_append" ||
      !target || typeof target !== "object" || Array.isArray(target) ||
      typeof target.content !== "string" || !target.content.trim()) {
    return { status: "unknown", code: "NEXO_CHRONICLE_OBSERVATION_INPUT_INVALID", source: "nexo-chronicle-store" };
  }

  let current;
  try { current = await store.loadCurrent(); }
  catch (error) {
    return { status: "unknown", code: error?.code ?? "NEXO_CHRONICLE_OBSERVATION_READ_FAILED", source: "nexo-chronicle-store" };
  }
  const matches = current.entries.filter(entry => entry.operationKey === idempotencyKey);
  const binding = { idempotencyKey, missionId, stepId, action, target, observedRevision: current.storeRevision, source: "nexo-chronicle-store" };
  if (matches.length > 1) {
    return { ...binding, status: "unknown", code: "NEXO_CHRONICLE_DUPLICATE_OPERATION_KEY" };
  }
  if (matches.length === 0) {
    return { ...binding, status: "not_applied", causalAttribution: "not_established" };
  }
  if (matches[0].content !== target.content) {
    return { ...binding, status: "unknown", code: "NEXO_CHRONICLE_OPERATION_CONTENT_CONFLICT" };
  }
  return { ...binding, status: "applied", causalAttribution: "not_established" };
}

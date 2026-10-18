/**
 * Reconciles a Chronicle operation only by reading the persisted Chronicle anew.
 * This observes stored state; it does not prove who caused that state.
 */
export async function observeChronicleOperation({ store, operationKey, expectedContent } = {}) {
  if (!store || typeof store.loadCurrent !== "function" ||
      typeof operationKey !== "string" || !operationKey.trim() ||
      typeof expectedContent !== "string" || !expectedContent.trim()) {
    return { status: "unknown", code: "NEXO_CHRONICLE_OBSERVATION_INPUT_INVALID", source: "nexo-chronicle-store" };
  }
  let current;
  try { current = await store.loadCurrent(); }
  catch (error) {
    return { status: "unknown", code: error?.code ?? "NEXO_CHRONICLE_OBSERVATION_READ_FAILED", source: "nexo-chronicle-store" };
  }
  const matches = current.entries.filter(entry => entry.operationKey === operationKey);
  if (matches.length > 1) {
    return { status: "unknown", code: "NEXO_CHRONICLE_DUPLICATE_OPERATION_KEY", source: "nexo-chronicle-store" };
  }
  if (matches.length === 0) {
    return { status: "not_applied", operationKey, source: "nexo-chronicle-store", causalAttribution: "not_established" };
  }
  if (matches[0].content !== expectedContent) {
    return { status: "unknown", code: "NEXO_CHRONICLE_OPERATION_CONTENT_CONFLICT", source: "nexo-chronicle-store" };
  }
  return { status: "applied", operationKey, source: "nexo-chronicle-store", causalAttribution: "not_established" };
}

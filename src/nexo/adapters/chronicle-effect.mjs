import { observeChronicleOperation } from "./chronicle-observation.mjs";

export const NEXO_CHRONICLE_APPEND_ACTION = "chronicle_append";

/**
 * Supplies the narrowly scoped handler, adapter verifier, owner verifier, and
 * postcondition for Chronicle append. Callers still decide whether to register
 * this capability; importing this module does not activate any runtime path.
 */
export function createNexoChronicleEffectContracts({ store } = {}) {
  if (!store || typeof store.append !== "function" || typeof store.loadCurrent !== "function") {
    const error = new Error("NEXO_CHRONICLE_STORE_REQUIRED");
    error.code = "NEXO_CHRONICLE_STORE_REQUIRED";
    throw error;
  }

  async function observe(operation) {
    return observeChronicleOperation({ store, ...operation });
  }

  async function handler({ missionId, stepId, action, target } = {}) {
    if (action !== NEXO_CHRONICLE_APPEND_ACTION ||
        typeof missionId !== "string" || !missionId.trim() || missionId.includes(":") ||
        typeof stepId !== "string" || !stepId.trim() || stepId.includes(":") ||
        !target || typeof target !== "object" || Array.isArray(target) ||
        typeof target.content !== "string" || !target.content.trim()) {
      return { status: "blocked", code: "NEXO_CHRONICLE_ENTRY_INVALID", verified: false };
    }
    const result = await store.append({
      operationKey: `${missionId}:${stepId}`,
      content: target.content
    });
    if (result.status === "committed" || result.status === "already_present") {
      return {
        status: "completed",
        verified: false,
        details: { storeStatus: result.status, storeRevision: result.storeRevision ?? null }
      };
    }
    return {
      status: "blocked",
      code: result.code ?? "NEXO_CHRONICLE_APPEND_OUTCOME_UNKNOWN",
      verified: false,
      uncertainty: result.status === "conflict" ? "operation_content_conflict" : "chronicle_write_not_confirmed"
    };
  }

  async function verifier(operation) {
    return observe(operation);
  }

  async function postcondition({ missionId, stepId, action, target } = {}) {
    const result = await observe({
      idempotencyKey: `${missionId}:${stepId}`,
      missionId, stepId, action, target: target ?? null
    });
    return result.status === "applied";
  }

  return Object.freeze({
    handlers: Object.freeze({ [NEXO_CHRONICLE_APPEND_ACTION]: handler }),
    verifiers: Object.freeze({ [NEXO_CHRONICLE_APPEND_ACTION]: verifier }),
    postcondition
  });
}

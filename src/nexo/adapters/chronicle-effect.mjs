import { observeChronicleOperation } from "./chronicle-observation.mjs";

export const NEXO_CHRONICLE_APPEND_ACTION = "chronicle_append";

/**
 * Supplies the narrowly scoped handler, adapter verifier, owner verifier, and
 * postcondition for Chronicle append. Callers still decide whether to register
 * this capability; importing this module does not activate any runtime path.
 */
function readPlainDataOptions(options, fields) {
  if (!options || typeof options !== "object" || Array.isArray(options)) return null;
  try {
    const prototype = Object.getPrototypeOf(options);
    if (prototype !== Object.prototype && prototype !== null) return null;
    const values = Object.create(null);
    for (const key of fields) {
      const descriptor = Object.getOwnPropertyDescriptor(options, key);
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) return null;
      values[key] = descriptor.value;
    }
    return values;
  } catch {
    return null;
  }
}

function readOperation(operation, fields) {
  return readPlainDataOptions(operation, fields);
}

export function createNexoChronicleEffectContracts(options) {
  const input = readPlainDataOptions(options, ["store"]);
  const store = input?.store;
  if (!store || typeof store !== "object" ||
      typeof Object.getOwnPropertyDescriptor(store, "append")?.value !== "function" ||
      typeof Object.getOwnPropertyDescriptor(store, "loadCurrent")?.value !== "function") {
    const error = new Error("NEXO_CHRONICLE_STORE_REQUIRED");
    error.code = "NEXO_CHRONICLE_STORE_REQUIRED";
    throw error;
  }

  async function observe(operation) {
    // Never spread an untrusted runtime operation: object spread executes
    // getters before observeChronicleOperation can inspect descriptors.
    const values = readOperation(operation, ["idempotencyKey", "missionId", "stepId", "action", "target"]);
    if (!values) {
      return { status: "unknown", code: "NEXO_CHRONICLE_OBSERVATION_INPUT_INVALID", source: "nexo-chronicle-store" };
    }
    return observeChronicleOperation({
      store,
      idempotencyKey: values.idempotencyKey,
      missionId: values.missionId,
      stepId: values.stepId,
      action: values.action,
      target: values.target
    });
  }

  async function handler(operation) {
    const input = readOperation(operation, ["missionId", "stepId", "action", "target"]);
    if (!input) return { status: "blocked", code: "NEXO_CHRONICLE_ENTRY_INVALID", verified: false };
    const { missionId, stepId, action, target } = input;
    const targetContent = target && typeof target === "object" && !Array.isArray(target)
      ? Object.getOwnPropertyDescriptor(target, "content")
      : null;
    if (action !== NEXO_CHRONICLE_APPEND_ACTION ||
        typeof missionId !== "string" || !missionId.trim() || missionId.includes(":") ||
        typeof stepId !== "string" || !stepId.trim() || stepId.includes(":") ||
        !target || typeof target !== "object" || Array.isArray(target) ||
        !targetContent || !targetContent.enumerable || !("value" in targetContent) ||
        typeof targetContent.value !== "string" || !targetContent.value.trim()) {
      return { status: "blocked", code: "NEXO_CHRONICLE_ENTRY_INVALID", verified: false };
    }
    const result = await store.append({
      operationKey: `${missionId}:${stepId}`,
      content: targetContent.value
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
      uncertainty: result.status === "conflict" ? "operation_content_conflict" : "chronicle_write_not_confirmed",
      ...(typeof result.phase === "string" ? { phase: result.phase } : {}),
      ...(typeof result.writeStarted === "boolean" ? { writeStarted: result.writeStarted } : {}),
      ...(result.lockRelease && typeof result.lockRelease === "object" ? { lockRelease: result.lockRelease } : {})
    };
  }

  async function verifier(operation) {
    return observe(operation);
  }

  async function postcondition(operation) {
    const input = readOperation(operation, ["missionId", "stepId", "action", "target"]);
    if (!input) return false;
    const { missionId, stepId, action, target } = input;
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

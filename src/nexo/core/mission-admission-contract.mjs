import { Buffer } from "node:buffer";

export const NEXO_MISSION_ADMISSION_LIMITS = Object.freeze({
  missionSteps: 256,
  dependenciesPerStep: 64,
  jsonNodes: 20_000,
  jsonDepth: 32,
  stringUtf8Bytes: 16 * 1024,
  requestIntentUtf8Bytes: 16 * 1024
});

function admissionError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

/**
 * Iterative structural guard for JSON-shaped mission inputs. It runs before
 * recursive contract validation/cloning so hostile nesting cannot exhaust the
 * JavaScript call stack first. Limits are v1 admission ceilings, not heap bounds.
 */
export function assertNexoMissionAdmission(input, { requestIntent = false } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
  }

  const seen = new WeakSet();
  const stack = [{ value: input, depth: 0 }];
  let nodes = 0;

  while (stack.length > 0) {
    const { value, depth } = stack.pop();
    nodes += 1;
    if (nodes > NEXO_MISSION_ADMISSION_LIMITS.jsonNodes ||
        depth > NEXO_MISSION_ADMISSION_LIMITS.jsonDepth) {
      throw admissionError("NEXO_MISSION_ADMISSION_RESOURCE_LIMIT_EXCEEDED");
    }

    if (typeof value === "string") {
      if (Buffer.byteLength(value, "utf8") > NEXO_MISSION_ADMISSION_LIMITS.stringUtf8Bytes) {
        throw admissionError("NEXO_MISSION_ADMISSION_RESOURCE_LIMIT_EXCEEDED");
      }
      continue;
    }
    if (value === null || typeof value === "boolean") continue;
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
      continue;
    }
    if (typeof value !== "object") throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
    if (seen.has(value)) throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
    seen.add(value);

    const isArray = Array.isArray(value);
    const prototype = Object.getPrototypeOf(value);
    if ((!isArray && prototype !== Object.prototype && prototype !== null) ||
        (isArray && prototype !== Array.prototype)) {
      throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
    }

    const keys = Reflect.ownKeys(value);
    if (keys.some(key => typeof key !== "string")) {
      throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
    }
    if (isArray) {
      if (value.length > NEXO_MISSION_ADMISSION_LIMITS.jsonNodes ||
          keys.length !== value.length + 1 ||
          keys.some(key => key !== "length" &&
            (!Number.isSafeInteger(Number(key)) || String(Number(key)) !== key ||
             Number(key) < 0 || Number(key) >= value.length))) {
        throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
      }
    }

    for (const key of keys) {
      if (isArray && key === "length") continue;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
        throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
      }
      if (Buffer.byteLength(key, "utf8") > NEXO_MISSION_ADMISSION_LIMITS.stringUtf8Bytes) {
        throw admissionError("NEXO_MISSION_ADMISSION_RESOURCE_LIMIT_EXCEEDED");
      }
      stack.push({ value: descriptor.value, depth: depth + 1 });
    }
  }

  if (requestIntent) {
    if (typeof input.intent !== "string" ||
        Buffer.byteLength(input.intent, "utf8") > NEXO_MISSION_ADMISSION_LIMITS.requestIntentUtf8Bytes) {
      throw admissionError("NEXO_MISSION_REQUEST_INTENT_RESOURCE_LIMIT_EXCEEDED");
    }
  } else {
    if (!Array.isArray(input.steps) ||
        input.steps.length > NEXO_MISSION_ADMISSION_LIMITS.missionSteps) {
      throw admissionError("NEXO_MISSION_ADMISSION_RESOURCE_LIMIT_EXCEEDED");
    }
    for (const step of input.steps) {
      const dependencies = step && typeof step === "object" ? (step.dependsOn ?? []) : [];
      if (!Array.isArray(dependencies) ||
          dependencies.length > NEXO_MISSION_ADMISSION_LIMITS.dependenciesPerStep) {
        throw admissionError("NEXO_MISSION_ADMISSION_RESOURCE_LIMIT_EXCEEDED");
      }
    }
  }

  return true;
}

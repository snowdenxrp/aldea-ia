import { Buffer } from "node:buffer";

export const NEXO_MISSION_ADMISSION_LIMITS = Object.freeze({
  missionSteps: 256,
  dependenciesPerStep: 64,
  jsonNodes: 20_000,
  jsonDepth: 32,
  stringUtf8Bytes: 256 * 1024,
  aggregateUtf8StringBytes: 4 * 1024 * 1024,
  requestIntentUtf8Bytes: 16 * 1024
});

function admissionError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function readAdmissionOptions(options) {
  if (options === undefined) return { requestIntent: false };
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
  }
  let prototype;
  let descriptor;
  try {
    prototype = Object.getPrototypeOf(options);
    if (prototype !== Object.prototype && prototype !== null) {
      throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
    }
    descriptor = Object.getOwnPropertyDescriptor(options, "requestIntent");
  } catch (error) {
    if (error?.code === "NEXO_MISSION_CONTEXT_INVALID") throw error;
    throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
  }
  if (!descriptor) return { requestIntent: false };
  if (!descriptor.enumerable || !("value" in descriptor) ||
      typeof descriptor.value !== "boolean") {
    throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
  }
  return { requestIntent: descriptor.value };
}

/**
 * Iterative structural guard for JSON-shaped mission inputs. It runs before
 * recursive contract validation/cloning so hostile nesting cannot exhaust the
 * JavaScript call stack first. Limits are v1 admission ceilings, not heap bounds.
 */
export function assertNexoMissionAdmission(input, options) {
  const { requestIntent } = readAdmissionOptions(options);
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
  }

  const active = new WeakSet();
  const stack = [{ value: input, depth: 0, exit: false }];
  let nodes = 0;
  let aggregateUtf8StringBytes = 0;

  while (stack.length > 0) {
    const { value, depth, exit } = stack.pop();
    if (exit) {
      active.delete(value);
      continue;
    }
    nodes += 1;
    if (nodes > NEXO_MISSION_ADMISSION_LIMITS.jsonNodes ||
        depth > NEXO_MISSION_ADMISSION_LIMITS.jsonDepth) {
      throw admissionError("NEXO_MISSION_ADMISSION_RESOURCE_LIMIT_EXCEEDED");
    }

    if (typeof value === "string") {
      const bytes = Buffer.byteLength(value, "utf8");
      aggregateUtf8StringBytes += bytes;
      if (bytes > NEXO_MISSION_ADMISSION_LIMITS.stringUtf8Bytes ||
          aggregateUtf8StringBytes > NEXO_MISSION_ADMISSION_LIMITS.aggregateUtf8StringBytes) {
        throw admissionError("NEXO_MISSION_ADMISSION_RESOURCE_LIMIT_EXCEEDED");
      }
      continue;
    }
    if (value === undefined || value === null || typeof value === "boolean") continue;
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
      continue;
    }
    if (typeof value !== "object") throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
    if (active.has(value)) throw admissionError("NEXO_MISSION_CONTEXT_INVALID");
    active.add(value);
    stack.push({ value, depth, exit: true });

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
      const keyBytes = Buffer.byteLength(key, "utf8");
      aggregateUtf8StringBytes += keyBytes;
      if (keyBytes > NEXO_MISSION_ADMISSION_LIMITS.stringUtf8Bytes ||
          aggregateUtf8StringBytes > NEXO_MISSION_ADMISSION_LIMITS.aggregateUtf8StringBytes) {
        throw admissionError("NEXO_MISSION_ADMISSION_RESOURCE_LIMIT_EXCEEDED");
      }
      stack.push({ value: descriptor.value, depth: depth + 1, exit: false });
    }
  }

  const mission = requestIntent ? input.missionDraft : input;
  if (requestIntent && typeof input.intent === "string" &&
      Buffer.byteLength(input.intent, "utf8") > NEXO_MISSION_ADMISSION_LIMITS.requestIntentUtf8Bytes) {
    throw admissionError("NEXO_MISSION_REQUEST_INTENT_RESOURCE_LIMIT_EXCEEDED");
  }
  if (mission && typeof mission === "object" && !Array.isArray(mission) &&
      Array.isArray(mission.steps)) {
    if (mission.steps.length > NEXO_MISSION_ADMISSION_LIMITS.missionSteps) {
      throw admissionError("NEXO_MISSION_ADMISSION_RESOURCE_LIMIT_EXCEEDED");
    }
    for (const step of mission.steps) {
      const dependencies = step && typeof step === "object" ? (step.dependsOn ?? []) : [];
      if (Array.isArray(dependencies) &&
          dependencies.length > NEXO_MISSION_ADMISSION_LIMITS.dependenciesPerStep) {
        throw admissionError("NEXO_MISSION_ADMISSION_RESOURCE_LIMIT_EXCEEDED");
      }
    }
  }

  return true;
}

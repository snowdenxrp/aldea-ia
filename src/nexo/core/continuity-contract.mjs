import { isDeepStrictEqual } from "node:util";
import { assertContractInput } from "./contracts.mjs";

const REQUIRED_COLLECTIONS = Object.freeze([
  "missions",
  "attempts",
  "doNotRepeat",
  "executions",
  "effectJournal"
]);

function contractError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function assertDenseArray(value) {
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw contractError("NEXO_MEMORY_SCHEMA_UNKNOWN");
    }
  }
}

/**
 * Validate only the persisted continuity shape needed to reconstruct a Nexo
 * mission and its unresolved prepared-effect obligations.
 *
 * This is structural validation, not authentication, authority, freshness,
 * provenance, or proof of external-effect truth.
 */
export function assertNexoContinuityMemoryShape(memory) {
  if (memory === null || memory === undefined) return true;

  try {
    // Reuse the canonical core data-shape guard so this public contract rejects
    // accessors, symbol keys, exotic records and non-data properties before reading fields.
    assertContractInput(memory, "nexo continuity memory");
  } catch {
    throw contractError("NEXO_MEMORY_SCHEMA_UNKNOWN");
  }
  if (!memory.nexo || typeof memory.nexo !== "object" || Array.isArray(memory.nexo) ||
      REQUIRED_COLLECTIONS.some(key => !Array.isArray(memory.nexo[key]))) {
    throw contractError("NEXO_MEMORY_SCHEMA_UNKNOWN");
  }
  for (const key of REQUIRED_COLLECTIONS) assertDenseArray(memory.nexo[key]);

  for (const entry of memory.nexo.effectJournal) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw contractError("NEXO_MEMORY_SCHEMA_UNKNOWN");
    }
    if (entry.status !== "prepared") continue;
    if (typeof entry.missionId !== "string" || !entry.missionId.trim() ||
        typeof entry.stepId !== "string" || !entry.stepId.trim() ||
        typeof entry.action !== "string" || !entry.action.trim()) {
      throw contractError("NEXO_RECOVERY_CONTEXT_MALFORMED");
    }
    const plan = memory.nexo.missions.find(item => item?.missionId === entry.missionId);
    const step = plan?.steps?.find(item => item?.id === entry.stepId);
    if (!step) throw contractError("NEXO_RECOVERY_CONTEXT_MISSING");
    if (step.action !== entry.action ||
        !isDeepStrictEqual(step.target ?? null, entry.target ?? null)) {
      throw contractError("NEXO_RECOVERY_CONTEXT_MISMATCH");
    }
  }
  return true;
}

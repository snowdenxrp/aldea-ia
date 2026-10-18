import { isDeepStrictEqual } from "node:util";

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

/**
 * Validate only the persisted continuity shape needed to reconstruct a Nexo
 * mission and its unresolved prepared-effect obligations.
 *
 * This is structural validation, not authentication, authority, freshness,
 * provenance, or proof of external-effect truth.
 */
export function assertNexoContinuityMemoryShape(memory) {
  if (memory === null || memory === undefined) return true;

  if (!memory || typeof memory !== "object" || Array.isArray(memory) ||
      !memory.nexo || typeof memory.nexo !== "object" || Array.isArray(memory.nexo) ||
      REQUIRED_COLLECTIONS.some(key => !Array.isArray(memory.nexo[key]))) {
    throw contractError("NEXO_MEMORY_SCHEMA_UNKNOWN");
  }

  for (const entry of memory.nexo.effectJournal.filter(item => item?.status === "prepared")) {
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

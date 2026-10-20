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

  // Mission and step identifiers form the durable operation identity
  // (missionId:stepId). Duplicate identities make reconstruction ambiguous.
  const missionIds = new Set();
  for (const mission of memory.nexo.missions) {
    // Persisted mission records must satisfy the same identity/steps minimum
    // as newly admitted missions. Do not silently reinterpret malformed legacy
    // records as empty missions during snapshot projection or reconstruction.
    if (!mission || typeof mission !== "object" || Array.isArray(mission) ||
        typeof mission.missionId !== "string" || !mission.missionId.trim() ||
        mission.missionId.includes(":") || !Array.isArray(mission.steps)) {
      throw contractError("NEXO_MEMORY_SCHEMA_UNKNOWN");
    }
    if (missionIds.has(mission.missionId)) throw contractError("NEXO_MEMORY_SCHEMA_UNKNOWN");
    missionIds.add(mission.missionId);
    const stepIds = new Set();
    for (const step of mission.steps) {
      if (!step || typeof step !== "object" || Array.isArray(step) ||
          typeof step.id !== "string" || !step.id.trim() || step.id.includes(":") ||
          typeof step.action !== "string" || !step.action.trim() || stepIds.has(step.id)) {
        throw contractError("NEXO_MEMORY_SCHEMA_UNKNOWN");
      }
      stepIds.add(step.id);
    }
    for (const step of mission.steps) {
      const dependencies = step.dependsOn ?? [];
      if (!Array.isArray(dependencies)) throw contractError("NEXO_MEMORY_SCHEMA_UNKNOWN");
      assertDenseArray(dependencies);
      if (dependencies.some(id => typeof id !== "string" || !id.trim() || !stepIds.has(id) || id === step.id) || new Set(dependencies).size !== dependencies.length) {
        throw contractError("NEXO_MEMORY_SCHEMA_UNKNOWN");
      }
    }
    const dependenciesByStep = new Map(mission.steps.map(step => [step.id, step.dependsOn ?? []]));
    const visiting = new Set();
    const visited = new Set();
    const visitDependency = id => {
      if (visiting.has(id)) throw contractError("NEXO_MEMORY_SCHEMA_UNKNOWN");
      if (visited.has(id)) return;
      visiting.add(id);
      for (const dependency of dependenciesByStep.get(id)) visitDependency(dependency);
      visiting.delete(id);
      visited.add(id);
    };
    for (const id of stepIds) visitDependency(id);
  }

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

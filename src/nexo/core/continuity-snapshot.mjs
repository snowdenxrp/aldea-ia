import { assertContractInput } from "./contracts.mjs";
import { assertNexoContinuityMemoryShape } from "./continuity-contract.mjs";
import { assertNexoContinuityDataBounded } from "./continuity-data-guard.mjs";

export const NEXO_CONTINUITY_SCHEMA = "NEXO_OPERATIONAL_CONTINUITY";
export const NEXO_CONTINUITY_SCHEMA_VERSION = 1;

const COLLECTIONS = Object.freeze([
  "missions",
  "attempts",
  "doNotRepeat",
  "executions",
  "effectJournal"
]);

function snapshotError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

/**
 * Validate a standalone Nexo operational-continuity snapshot.
 * No learning analytics, environment state, or authority is represented here.
 */
export function assertNexoContinuitySnapshot(snapshot) {
  assertNexoContinuityDataBounded(snapshot, {
    resourceLimitCode: "NEXO_CONTINUITY_SNAPSHOT_RESOURCE_LIMIT_EXCEEDED",
    invalidCode: "NEXO_CONTINUITY_SNAPSHOT_INVALID"
  });
  try {
    assertContractInput(snapshot, "Nexo continuity snapshot");
  } catch {
    throw snapshotError("NEXO_CONTINUITY_SNAPSHOT_INVALID");
  }
  const allowedKeys = new Set(["schema", "schemaVersion", ...COLLECTIONS]);
  if (Reflect.ownKeys(snapshot).some(key => typeof key !== "string" || !allowedKeys.has(key)) ||
      snapshot.schema !== NEXO_CONTINUITY_SCHEMA ||
      snapshot.schemaVersion !== NEXO_CONTINUITY_SCHEMA_VERSION ||
      COLLECTIONS.some(key => !Array.isArray(snapshot[key]))) {
    throw snapshotError("NEXO_CONTINUITY_SNAPSHOT_SCHEMA_UNKNOWN");
  }
  const memory = { version: 4, nexo: Object.fromEntries(COLLECTIONS.map(key => [key, snapshot[key]])) };
  try {
    assertNexoContinuityMemoryShape(memory);
  } catch (error) {
    throw snapshotError(error?.code ?? "NEXO_CONTINUITY_SNAPSHOT_INVALID");
  }
  return true;
}

/**
 * Build a detached standalone snapshot from the current prototype memory shape.
 * This is a projection only: it does not persist, migrate, or grant authority.
 */
export function projectNexoContinuitySnapshot(memory) {
  try {
    assertNexoContinuityMemoryShape(memory);
  } catch (error) {
    throw snapshotError(error?.code ?? "NEXO_MEMORY_SCHEMA_UNKNOWN");
  }
  if (!memory || typeof memory !== "object" || !memory.nexo) {
    throw snapshotError("NEXO_MEMORY_SCHEMA_UNKNOWN");
  }
  const snapshot = {
    schema: NEXO_CONTINUITY_SCHEMA,
    schemaVersion: NEXO_CONTINUITY_SCHEMA_VERSION
  };
  for (const key of COLLECTIONS) snapshot[key] = structuredClone(memory.nexo[key]);
  assertNexoContinuitySnapshot(snapshot);
  return snapshot;
}

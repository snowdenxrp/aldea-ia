import { assertContractInput } from "./contracts.mjs";
import { assertNexoContinuityMemoryShape } from "./continuity-contract.mjs";

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

const MAX_CONTINUITY_SNAPSHOT_DEPTH = 32;

/**
 * Iterative preflight before the generic recursive contract guard. Persisted
 * JSON is byte-bounded, but nesting depth must be checked before recursive
 * validation so malformed snapshots cannot exhaust the JS call stack first.
 */
function assertSnapshotGraphBounded(snapshot) {
  const active = new WeakSet();
  const stack = [{ value: snapshot, depth: 0, exit: false }];
  while (stack.length) {
    const { value, depth, exit } = stack.pop();
    if (value === null || typeof value !== "object") continue;
    if (exit) {
      active.delete(value);
      continue;
    }
    if (depth > MAX_CONTINUITY_SNAPSHOT_DEPTH) {
      throw snapshotError("NEXO_CONTINUITY_SNAPSHOT_RESOURCE_LIMIT_EXCEEDED");
    }
    if (active.has(value)) throw snapshotError("NEXO_CONTINUITY_SNAPSHOT_INVALID");
    const array = Array.isArray(value);
    const prototype = Object.getPrototypeOf(value);
    if ((!array && prototype !== Object.prototype && prototype !== null) ||
        (array && prototype !== Array.prototype)) {
      throw snapshotError("NEXO_CONTINUITY_SNAPSHOT_INVALID");
    }
    active.add(value);
    stack.push({ value, depth, exit: true });
    const keys = Reflect.ownKeys(value);
    if (keys.some(key => typeof key !== "string")) {
      throw snapshotError("NEXO_CONTINUITY_SNAPSHOT_INVALID");
    }
    if (array && (keys.length !== value.length + 1 ||
        keys.some(key => key !== "length" &&
          (!Number.isSafeInteger(Number(key)) || String(Number(key)) !== key ||
           Number(key) < 0 || Number(key) >= value.length)))) {
      throw snapshotError("NEXO_CONTINUITY_SNAPSHOT_INVALID");
    }
    for (const key of keys) {
      if (array && key === "length") continue;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
        throw snapshotError("NEXO_CONTINUITY_SNAPSHOT_INVALID");
      }
      stack.push({ value: descriptor.value, depth: depth + 1, exit: false });
    }
  }
}

/**
 * Validate a standalone Nexo operational-continuity snapshot.
 * No learning analytics, environment state, or authority is represented here.
 */
export function assertNexoContinuitySnapshot(snapshot) {
  assertSnapshotGraphBounded(snapshot);
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

// Preserve the 32-level per-mission admission budget after container nesting:
// snapshot root + collection array + mission record (or legacy root + nexo + array + mission).
const MAX_CONTINUITY_DATA_DEPTH = 35;

function dataGuardError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

/**
 * Iterative JSON-data preflight shared by snapshot and legacy-memory boundaries.
 * It must run before recursive contract validation to keep depth failure bounded.
 */
export function assertNexoContinuityDataBounded(value, {
  resourceLimitCode = "NEXO_CONTINUITY_SNAPSHOT_RESOURCE_LIMIT_EXCEEDED",
  invalidCode = "NEXO_CONTINUITY_SNAPSHOT_INVALID"
} = {}) {
  const active = new WeakSet();
  const stack = [{ value, depth: 0, exit: false }];
  while (stack.length) {
    const { value: current, depth, exit } = stack.pop();
    if (current === null || typeof current !== "object") continue;
    if (exit) {
      active.delete(current);
      continue;
    }
    if (depth > MAX_CONTINUITY_DATA_DEPTH) throw dataGuardError(resourceLimitCode);
    if (active.has(current)) throw dataGuardError(invalidCode);
    const array = Array.isArray(current);
    const prototype = Object.getPrototypeOf(current);
    if ((!array && prototype !== Object.prototype && prototype !== null) ||
        (array && prototype !== Array.prototype)) {
      throw dataGuardError(invalidCode);
    }
    active.add(current);
    stack.push({ value: current, depth, exit: true });
    const keys = Reflect.ownKeys(current);
    if (keys.some(key => typeof key !== "string")) throw dataGuardError(invalidCode);
    if (array && (keys.length !== current.length + 1 ||
        keys.some(key => key !== "length" &&
          (!Number.isSafeInteger(Number(key)) || String(Number(key)) !== key ||
           Number(key) < 0 || Number(key) >= current.length)))) {
      throw dataGuardError(invalidCode);
    }
    for (const key of keys) {
      if (array && key === "length") continue;
      const descriptor = Object.getOwnPropertyDescriptor(current, key);
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
        throw dataGuardError(invalidCode);
      }
      stack.push({ value: descriptor.value, depth: depth + 1, exit: false });
    }
  }
}

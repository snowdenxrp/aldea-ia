import { COMMIT, createCommitResult } from "../core/contracts.mjs";

/**
 * Adapts the established canonical persistState primitive to the
 * ConditionalCommit ownership port without exposing persistence details to Core.
 *
 * The candidate state is intentionally opaque here. The adapter only forwards
 * it to the supplied persistence primitive; Core remains schema-independent.
 */
function readConditionalCommitOptions(options) {
  if (options === undefined) return { clock: () => Date.now() };
  if (!options || typeof options !== "object" || Array.isArray(options)) return null;
  try {
    const prototype = Object.getPrototypeOf(options);
    if (prototype !== Object.prototype && prototype !== null) return null;
    const values = Object.create(null);
    for (const key of ["persistState", "statePath", "clock"]) {
      const descriptor = Object.getOwnPropertyDescriptor(options, key);
      if (!descriptor) continue;
      if (!descriptor.enumerable || !("value" in descriptor)) return null;
      values[key] = descriptor.value;
    }
    if (!Object.hasOwn(values, "clock")) values.clock = () => Date.now();
    return values;
  } catch {
    return null;
  }
}

export function createPersistStateConditionalCommit(options) {
  const input = readConditionalCommitOptions(options);
  if (!input) throw new TypeError("conditional commit options are invalid");
  const { persistState, statePath, clock } = input;
  if (typeof persistState !== "function") {
    throw new TypeError("persistState function is required");
  }
  if (typeof statePath !== "string" || !statePath.trim()) throw new TypeError("statePath is required");
  if (typeof clock !== "function") throw new TypeError("clock function is required");

  return Object.freeze({
    async commit(candidate) {
      if (!candidate || candidate.state === undefined) {
        throw new TypeError("candidate state is required");
      }

      const expectedRevision = candidate.expectedRevision;
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || expectedRevision >= Number.MAX_SAFE_INTEGER) {
        throw new TypeError("candidate expectedRevision must be a non-negative safe integer below MAX_SAFE_INTEGER");
      }

      try {
        await persistState(
          statePath,
          candidate.state,
          clock(),
          {
            expectedRevision,
            stateRevision: expectedRevision + 1
          }
        );
        return createCommitResult(COMMIT.COMMITTED);
      } catch (error) {
        if (error?.code === "STATE_REVISION_CONFLICT") {
          return createCommitResult(COMMIT.CONDITIONAL_CONFLICT, {
            errorCode: error.code
          });
        }
        return createCommitResult(COMMIT.UNKNOWN, {
          errorCode: error?.code ?? "PERSISTENCE_UNKNOWN"
        });
      }
    }
  });
}

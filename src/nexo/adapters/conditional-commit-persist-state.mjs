import { COMMIT, createCommitResult } from "../core/contracts.mjs";

/**
 * Adapts the established canonical persistState primitive to the
 * ConditionalCommit ownership port without exposing persistence details to Core.
 *
 * The candidate state is intentionally opaque here. The adapter only forwards
 * it to the supplied persistence primitive; Core remains schema-independent.
 */
export function createPersistStateConditionalCommit({
  persistState,
  statePath,
  clock = () => Date.now()
} = {}) {
  if (typeof persistState !== "function") {
    throw new TypeError("persistState function is required");
  }
  if (!statePath) throw new TypeError("statePath is required");

  return Object.freeze({
    async commit(candidate) {
      if (!candidate || candidate.state === undefined) {
        throw new TypeError("candidate state is required");
      }

      const expectedRevision = candidate.expectedRevision;
      if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
        throw new TypeError("candidate expectedRevision must be a non-negative integer");
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

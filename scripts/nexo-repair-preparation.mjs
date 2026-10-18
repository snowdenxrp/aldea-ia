import { loadStateStrict } from "./simulate.mjs";

const REPAIR_ACTIONS = new Set([
  "repair_agent_state",
  "repair_agent_needs",
  "repair_resource_state"
]);

/**
 * Bind a new repair PREPARED intent to the revision of a strictly loaded,
 * persisted Lúmina snapshot. This is a preparation step only: the environment
 * may change after this read, so dispatch must independently fence the revision.
 */
export async function prepareRepairAgainstPersistedState({
  owner,
  statePath,
  expectedContinuityRevision,
  operation
} = {}) {
  if (!owner || typeof owner.recordPrepared !== "function") {
    return { status: "blocked", code: "NEXO_CONTINUITY_OWNER_REQUIRED", preparedCommitted: false };
  }
  if (!REPAIR_ACTIONS.has(operation?.action)) {
    return { status: "blocked", code: "NEXO_REPAIR_ACTION_UNSUPPORTED", preparedCommitted: false };
  }
  if (!Number.isSafeInteger(expectedContinuityRevision) || expectedContinuityRevision < 0) {
    return { status: "blocked", code: "NEXO_CONTINUITY_STORE_EXPECTED_REVISION_INVALID", preparedCommitted: false };
  }

  let snapshot;
  try {
    snapshot = await loadStateStrict(statePath);
  } catch (error) {
    return {
      status: "blocked",
      code: error?.code ?? "NEXO_PERSISTED_ENVIRONMENT_LOAD_FAILED",
      preparedCommitted: false,
      environmentStateRevision: null
    };
  }

  const environmentStateRevision = snapshot.stateRevision;
  let prepared;
  try {
    prepared = await owner.recordPrepared({
      expectedRevision: expectedContinuityRevision,
      operation: { ...operation, environmentStateRevision }
    });
  } catch (error) {
    // A write can be durable even if its response is lost. Do not claim that
    // PREPARED failed to commit, and never dispatch without a confirmed result.
    return {
      status: "blocked",
      code: error?.code ?? "NEXO_PREPARED_COMMIT_OUTCOME_UNKNOWN",
      preparedCommitted: false,
      preparedCommitOutcome: "unknown",
      uncertainty: "prepared_commit_outcome_unknown",
      environmentStateRevision,
      environmentRevisionSource: "strict-persisted-world-state"
    };
  }
  return {
    ...prepared,
    environmentStateRevision,
    environmentRevisionSource: "strict-persisted-world-state"
  };
}

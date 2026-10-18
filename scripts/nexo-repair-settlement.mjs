import { loadStateStrict } from "./simulate.mjs";
import { observePersistedRepairInvariant } from "../src/nexo/adapters/persisted-repair-observation.mjs";
import { assertNexoContinuitySnapshot } from "../src/nexo/core/continuity-snapshot.mjs";

const REPAIR_ACTIONS = new Set([
  "repair_agent_state",
  "repair_agent_needs",
  "repair_resource_state"
]);

/**
 * Settle only a repair PREPARED entry when a strict persisted snapshot proves
 * its desired invariant at the bound revision or the immediately following
 * revision. This records observation, not causal attribution.
 *
 * The helper deliberately uses the store's conditional commit and does not
 * claim atomicity across Lúmina's environment file and Nexo's continuity file.
 */
export async function settlePreparedRepairFromPersistedState({
  store,
  statePath,
  idempotencyKey,
  expectedContinuityRevision
} = {}) {
  if (!store || typeof store.loadCurrent !== "function" || typeof store.commitIfCurrent !== "function" ||
      typeof idempotencyKey !== "string" || !idempotencyKey.trim() ||
      !Number.isSafeInteger(expectedContinuityRevision) || expectedContinuityRevision < 0) {
    return { status: "blocked", code: "NEXO_REPAIR_SETTLEMENT_CONTEXT_INVALID", verified: false };
  }

  let current;
  try {
    current = await store.loadCurrent();
  } catch (error) {
    return { status: "blocked", code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED", verified: false };
  }
  const matches = current.snapshot.effectJournal.filter(entry => entry?.idempotencyKey === idempotencyKey);
  if (matches.length !== 1) {
    return { status: "blocked", code: "NEXO_PREPARED_JOURNAL_ENTRY_UNKNOWN", verified: false, storeRevision: current.storeRevision };
  }
  const entry = matches[0];
  if (!REPAIR_ACTIONS.has(entry.action) ||
      !Number.isSafeInteger(entry.environmentStateRevision) || entry.environmentStateRevision < 0) {
    return { status: "blocked", code: "NEXO_PREPARED_REPAIR_REVISION_UNKNOWN", verified: false, storeRevision: current.storeRevision };
  }

  // A previous caller may have lost the response after the CAS actually
  // committed. Recover that uncertainty from the canonical journal rather
  // than misreporting a known settlement as an unknown PREPARED entry.
  // Validate the stored observation's shape and binding; do not redispatch or
  // infer causal attribution from this recovery path.
  if (entry.status === "settled_observed") {
    const settlement = entry.settlement;
    const validSettlement = settlement?.kind === "persisted-repair-invariant-observed" &&
      settlement.source === "world-state.json" &&
      settlement.observation === "desired_state_present" &&
      settlement.preparedEnvironmentStateRevision === entry.environmentStateRevision &&
      Number.isSafeInteger(settlement.environmentStateRevision) &&
      (settlement.environmentStateRevision === entry.environmentStateRevision ||
        settlement.environmentStateRevision === entry.environmentStateRevision + 1) &&
      settlement.causalAttribution === "not_claimed";
    if (!validSettlement) {
      return {
        status: "blocked",
        code: "NEXO_REPAIR_SETTLEMENT_RECORD_INVALID",
        verified: false,
        storeRevision: current.storeRevision
      };
    }
    return {
      status: "settled_observed",
      code: "NEXO_REPAIR_SETTLEMENT_ALREADY_JOURNALED",
      verified: true,
      recovered: true,
      causalAttribution: "not_claimed",
      environmentStateRevision: settlement.environmentStateRevision,
      storeRevision: current.storeRevision
    };
  }
  // Only a journal-confirmed settlement may recover across a changed store
  // revision. An unresolved PREPARED entry still requires the caller's exact
  // expected revision; otherwise return the CAS conflict without observing or
  // mutating anything.
  if (current.storeRevision !== expectedContinuityRevision) {
    return { status: "conflict", code: "NEXO_CONTINUITY_STORE_REVISION_CONFLICT", verified: false, storeRevision: current.storeRevision };
  }
  if (entry.status !== "prepared") {
    return { status: "blocked", code: "NEXO_PREPARED_JOURNAL_ENTRY_UNKNOWN", verified: false, storeRevision: current.storeRevision };
  }

  let environment;
  try {
    environment = await loadStateStrict(statePath);
  } catch (error) {
    return { status: "blocked", code: error?.code ?? "NEXO_PERSISTED_ENVIRONMENT_LOAD_FAILED", verified: false, storeRevision: current.storeRevision };
  }

  const expected = entry.environmentStateRevision;
  if (environment.stateRevision !== expected && environment.stateRevision !== expected + 1) {
    return {
      status: "blocked",
      code: "NEXO_REPAIR_SETTLEMENT_ENVIRONMENT_REVISION_UNRELATED",
      verified: false,
      expectedStateRevision: expected,
      currentStateRevision: environment.stateRevision,
      storeRevision: current.storeRevision
    };
  }

  const observation = observePersistedRepairInvariant({
    snapshot: environment,
    action: entry.action,
    target: entry.target
  });
  if (observation.outcome !== "desired_state_present") {
    return {
      status: "blocked",
      code: "NEXO_REPAIR_SETTLEMENT_INVARIANT_NOT_PROVEN",
      verified: false,
      observation,
      storeRevision: current.storeRevision
    };
  }

  const candidate = structuredClone(current.snapshot);
  const candidateEntry = candidate.effectJournal.find(item => item?.idempotencyKey === idempotencyKey);
  candidateEntry.status = "settled_observed";
  candidateEntry.settlement = {
    kind: "persisted-repair-invariant-observed",
    source: "world-state.json",
    observation: "desired_state_present",
    environmentStateRevision: environment.stateRevision,
    preparedEnvironmentStateRevision: expected,
    causalAttribution: "not_claimed",
    at: new Date().toISOString()
  };
  assertNexoContinuitySnapshot(candidate);

  let committed;
  try {
    committed = await store.commitIfCurrent(expectedContinuityRevision, candidate);
  } catch (error) {
    // The store may have failed before or after durable replacement. Do not
    // infer whether settlement committed; a later read/recovery must resolve it.
    return {
      status: "blocked",
      code: error?.code ?? "NEXO_REPAIR_SETTLEMENT_COMMIT_OUTCOME_UNKNOWN",
      verified: false,
      storeRevision: expectedContinuityRevision,
      uncertainty: "settlement_commit_outcome_unknown"
    };
  }
  if (committed.status !== "committed") {
    return {
      ...committed,
      verified: false,
      code: committed.code ?? "NEXO_REPAIR_SETTLEMENT_COMMIT_NOT_CONFIRMED"
    };
  }
  return {
    status: "settled_observed",
    code: "NEXO_REPAIR_DESIRED_STATE_OBSERVED_AND_JOURNALED",
    verified: true,
    causalAttribution: "not_claimed",
    environmentStateRevision: environment.stateRevision,
    storeRevision: committed.storeRevision
  };
}

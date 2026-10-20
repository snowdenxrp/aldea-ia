import { createNexoContinuityStore } from "./continuity-store.mjs";
import { NEXO_DEFAULT_LOCK_WAIT_MS } from "./lock-deadline.mjs";
import { createNexoContinuityOwner } from "./continuity-owner.mjs";
import {
  NEXO_CONTINUITY_SCHEMA,
  projectNexoContinuitySnapshot
} from "./continuity-snapshot.mjs";

function emptySnapshot() {
  return {
    schema: NEXO_CONTINUITY_SCHEMA,
    schemaVersion: 1,
    missions: [],
    attempts: [],
    doNotRepeat: [],
    executions: [],
    effectJournal: []
  };
}

/**
 * Open the independent Nexo operational store.
 *
 * Legacy memory is imported only when the separate store does not exist.
 * Once the store exists, it is the canonical operational-continuity source;
 * legacy copies are not merged or dual-written. Empty bootstrap is permitted
 * only when the caller has independently established that no prior world-state
 * file exists.
 */
export async function openNexoContinuityOwner({
  filePath,
  legacyMemory = null,
  allowEmptyInitialization = false,
  effectVerifiers = {},
  lockDeadline = null,
  lockWaitMs = NEXO_DEFAULT_LOCK_WAIT_MS
} = {}) {
  const store = createNexoContinuityStore({ filePath, lockDeadline, lockWaitMs });
  let current;

  try {
    current = await store.loadCurrent();
  } catch (error) {
    if (error?.code !== "NEXO_CONTINUITY_STORE_NOT_FOUND") throw error;
    let snapshot;
    if (legacyMemory !== null && legacyMemory !== undefined) {
      snapshot = projectNexoContinuitySnapshot(legacyMemory);
    } else if (allowEmptyInitialization === true) {
      snapshot = emptySnapshot();
    } else {
      const blocked = new Error("NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN");
      blocked.code = "NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN";
      throw blocked;
    }

    const initialized = await store.initialize(snapshot);
    if (initialized.status !== "committed" && initialized.status !== "conflict") {
      const blocked = new Error(initialized.code ?? "NEXO_CONTINUITY_INITIALIZATION_FAILED");
      blocked.code = initialized.code ?? "NEXO_CONTINUITY_INITIALIZATION_FAILED";
      if (typeof initialized.phase === "string") blocked.phase = initialized.phase;
      if (typeof initialized.writeStarted === "boolean") blocked.writeStarted = initialized.writeStarted;
      if (initialized.lockRelease && typeof initialized.lockRelease === "object") blocked.lockRelease = initialized.lockRelease;
      throw blocked;
    }
    current = await store.loadCurrent();
  }

  return Object.freeze({
    store,
    owner: createNexoContinuityOwner({ store, effectVerifiers }),
    current
  });
}

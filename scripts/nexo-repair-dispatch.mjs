import { loadStateStrict, persistState } from "./simulate.mjs";
import {
  createLuminaEffectAdapter,
  createLuminaEffectPostcondition
} from "../src/nexo/simulation-adapter.js";

const REPAIR_ACTIONS = new Set([
  "repair_agent_state",
  "repair_agent_needs",
  "repair_resource_state"
]);

/**
 * Execute only a prepared convergent repair against the durable environment
 * revision recorded by Nexo. The in-memory repair is not durable until the
 * existing conditional persistState write succeeds.
 *
 * This deliberately does not settle Nexo PREPARED. A crash after environment
 * persistence but before a future settlement remains an explicit recovery case.
 */
export async function dispatchPreparedRepair({
  statePath,
  preparedOperation,
  savedAt = Date.now()
} = {}) {
  const action = preparedOperation?.action;
  const target = preparedOperation?.target ?? null;
  const expectedRevision = preparedOperation?.environmentStateRevision;
  if (!REPAIR_ACTIONS.has(action) ||
      typeof preparedOperation?.idempotencyKey !== "string" ||
      typeof preparedOperation?.missionId !== "string" ||
      typeof preparedOperation?.stepId !== "string") {
    return { status: "blocked", code: "NEXO_REPAIR_OPERATION_CONTEXT_INVALID", persisted: false };
  }
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
    return { status: "blocked", code: "NEXO_PREPARED_ENVIRONMENT_REVISION_UNKNOWN", persisted: false };
  }

  let snapshot;
  try {
    snapshot = await loadStateStrict(statePath);
  } catch (error) {
    return { status: "blocked", code: error?.code ?? "NEXO_PERSISTED_ENVIRONMENT_LOAD_FAILED", persisted: false };
  }

  if (snapshot.stateRevision !== expectedRevision) {
    return {
      status: "blocked",
      code: "NEXO_PREPARED_ENVIRONMENT_REVISION_STALE",
      expectedStateRevision: expectedRevision,
      currentStateRevision: snapshot.stateRevision,
      persisted: false
    };
  }

  // Keep this repair-only execution object tied to the exact strict-loaded
  // snapshot. Do not use applyState(), which performs broader simulation recovery.
  const simulation = {
    world: snapshot.world,
    agents: snapshot.agents,
    day: Number(snapshot.day) || snapshot.world.day || 1,
    hour: Number.isFinite(Number(snapshot.hour)) ? Number(snapshot.hour) : (snapshot.world.timeOfDay || 8),
    events: Array.isArray(snapshot.events) ? snapshot.events : [],
    nexoEffectRevision: 0
  };
  const adapter = createLuminaEffectAdapter(simulation);
  const result = await adapter.execute({
    missionId: preparedOperation.missionId,
    stepId: preparedOperation.stepId,
    action,
    target,
    idempotencyKey: preparedOperation.idempotencyKey,
    postcondition: createLuminaEffectPostcondition(simulation, action, target)
  });

  if (result.status !== "completed") {
    return {
      ...result,
      persisted: false,
      environmentStateRevision: expectedRevision,
      uncertainty: result.uncertainty ?? "repair_not_durably_committed"
    };
  }

  const stateChanged = result.effectResult?.stateChanged === true;
  if (!stateChanged) {
    return {
      ...result,
      persisted: false,
      stateChanged: false,
      environmentStateRevision: expectedRevision,
      note: "desired_state_already_satisfied_or_no_persisted_change"
    };
  }

  try {
    const persisted = await persistState(statePath, simulation, savedAt, {
      expectedRevision,
      stateRevision: expectedRevision + 1,
      loadCurrentState: loadStateStrict
    });
    return {
      ...result,
      persisted: true,
      stateChanged: true,
      previousEnvironmentStateRevision: expectedRevision,
      environmentStateRevision: persisted.stateRevision
    };
  } catch (error) {
    return {
      status: "blocked",
      code: error?.code === "STATE_REVISION_CONFLICT"
        ? "NEXO_REPAIR_ENVIRONMENT_REVISION_CONFLICT"
        : "NEXO_REPAIR_PERSIST_OUTCOME_UNKNOWN",
      persisted: false,
      expectedStateRevision: expectedRevision,
      uncertainty: "prepared_repair_must_be_reconciled_before_retry"
    };
  }
}

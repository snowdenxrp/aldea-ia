import { loadStateStrict } from "./simulate.mjs";
import { observePersistedRepairInvariant } from "../src/nexo/adapters/persisted-repair-observation.mjs";

const REPAIR_ACTIONS = new Set([
  "repair_agent_state",
  "repair_agent_needs",
  "repair_resource_state"
]);

/**
 * Read-only mission-goal verifier for missions composed exclusively of
 * convergent repair actions already settled by persisted invariant observation.
 *
 * Returns goal_observed, never mission_completed. It proves only that every
 * required repair invariant is currently present in one strict-loaded snapshot.
 * It makes no causal attribution and performs no continuity write.
 */
export async function verifyRepairMissionGoalFromPersistedState({
  store,
  statePath,
  missionId
} = {}) {
  if (!store || typeof store.loadCurrent !== "function" ||
      typeof missionId !== "string" || !missionId.trim()) {
    return { status: "unknown", code: "NEXO_REPAIR_MISSION_VERIFICATION_CONTEXT_INVALID", verified: false };
  }

  let current;
  try {
    current = await store.loadCurrent();
  } catch (error) {
    return { status: "unknown", code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED", verified: false };
  }
  const missions = current.snapshot.missions.filter(item => item?.missionId === missionId);
  if (missions.length !== 1) {
    return { status: "unknown", code: "NEXO_REPAIR_MISSION_ID_UNKNOWN_OR_AMBIGUOUS", verified: false, storeRevision: current.storeRevision };
  }
  const mission = missions[0];
  if (!Array.isArray(mission.steps) || mission.steps.length === 0) {
    return { status: "unknown", code: "NEXO_REPAIR_MISSION_STEPS_UNKNOWN", verified: false, storeRevision: current.storeRevision };
  }

  const stepIds = new Set(mission.steps.map(step => step?.id));
  for (const step of mission.steps) {
    if (!step || typeof step.id !== "string" || !step.id.trim() ||
        !REPAIR_ACTIONS.has(step.action) || typeof step.target !== "string" || !step.target.trim() ||
        !Array.isArray(step.dependsOn) ||
        step.dependsOn.some(id => !stepIds.has(id) || id === step.id)) {
      return { status: "unknown", code: "NEXO_REPAIR_MISSION_STEP_OR_DEPENDENCY_UNSUPPORTED", verified: false, storeRevision: current.storeRevision };
    }
  }

  const dependencyMarks = new Map(mission.steps.map(step => [step.id, 0]));
  const visitDependency = id => {
    const mark = dependencyMarks.get(id);
    if (mark === 1) return true;
    if (mark === 2) return false;
    dependencyMarks.set(id, 1);
    const step = mission.steps.find(candidate => candidate.id === id);
    for (const dependency of step?.dependsOn ?? []) {
      if (visitDependency(dependency)) return true;
    }
    dependencyMarks.set(id, 2);
    return false;
  };
  if (mission.steps.some(step => visitDependency(step.id))) {
    return { status: "unknown", code: "NEXO_REPAIR_MISSION_DEPENDENCY_CYCLE", verified: false, storeRevision: current.storeRevision };
  }

  const journal = current.snapshot.effectJournal.filter(entry => entry?.missionId === missionId);
  if (journal.some(entry => entry.status === "prepared")) {
    return { status: "blocked", code: "NEXO_EFFECT_RECONCILIATION_REQUIRED", verified: false, storeRevision: current.storeRevision };
  }

  const settlements = [];
  for (const step of mission.steps) {
    const matches = journal.filter(entry => entry?.stepId === step.id);
    if (matches.length !== 1 || matches[0].status !== "settled_observed" ||
        matches[0].action !== step.action || matches[0].target !== step.target ||
        matches[0].settlement?.causalAttribution !== "not_claimed" ||
        !Number.isSafeInteger(matches[0].settlement?.environmentStateRevision) ||
        matches[0].settlement.environmentStateRevision < 0) {
      return { status: "unknown", code: "NEXO_REPAIR_MISSION_STEP_NOT_SETTLED_BY_OBSERVATION", verified: false, stepId: step.id, storeRevision: current.storeRevision };
    }
    settlements.push({ step, entry: matches[0] });
  }

  let snapshot;
  try {
    snapshot = await loadStateStrict(statePath);
  } catch (error) {
    return { status: "unknown", code: error?.code ?? "NEXO_PERSISTED_ENVIRONMENT_LOAD_FAILED", verified: false, storeRevision: current.storeRevision };
  }

  const stepObservations = [];
  for (const { step, entry } of settlements) {
    if (snapshot.stateRevision < entry.settlement.environmentStateRevision) {
      return {
        status: "unknown",
        code: "NEXO_REPAIR_MISSION_ENVIRONMENT_REVISION_ROLLBACK_OR_REPLAY",
        verified: false,
        stepId: step.id,
        currentStateRevision: snapshot.stateRevision,
        settledStateRevision: entry.settlement.environmentStateRevision,
        storeRevision: current.storeRevision
      };
    }
    const observation = observePersistedRepairInvariant({
      snapshot,
      action: step.action,
      target: step.target
    });
    if (observation.outcome !== "desired_state_present") {
      return {
        status: "blocked",
        code: "NEXO_REPAIR_MISSION_GOAL_INVARIANT_NOT_PRESENT",
        verified: false,
        stepId: step.id,
        observation,
        storeRevision: current.storeRevision
      };
    }
    stepObservations.push({
      stepId: step.id,
      action: step.action,
      target: step.target,
      environmentStateRevision: snapshot.stateRevision,
      outcome: observation.outcome
    });
  }

  return {
    status: "goal_observed",
    code: "NEXO_REPAIR_MISSION_GOAL_OBSERVED",
    verified: true,
    missionId,
    storeRevision: current.storeRevision,
    environmentStateRevision: snapshot.stateRevision,
    causalAttribution: "not_claimed",
    missionCompleted: false,
    stepObservations
  };
}

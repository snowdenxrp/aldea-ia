import { runNexoRepairOnce } from "./nexo-repair-entrypoint.mjs";

const REPAIR_ACTIONS = new Set([
  "repair_agent_state",
  "repair_agent_needs",
  "repair_resource_state"
]);

function blocked(code, extra = {}) {
  return { status: "blocked", code, persisted: false, ...extra };
}

/**
 * Canonical owner-backed session entry for one repair step.
 *
 * Mission, step, action, and target are derived from Nexo's persisted snapshot;
 * the caller selects only missionId and stepId. This is not a general runtime
 * and must not be used for non-repair or protected actions.
 */
export async function runNexoRepairSession({
  owner,
  store,
  statePath,
  missionId,
  stepId,
  savedAt = Date.now()
} = {}) {
  if (!owner || typeof owner.loadCurrent !== "function" ||
      !store || typeof store.loadCurrent !== "function" ||
      typeof store.commitIfCurrent !== "function" ||
      typeof statePath !== "string" || !statePath.trim() ||
      typeof missionId !== "string" || !missionId.trim() ||
      typeof stepId !== "string" || !stepId.trim()) {
    return blocked("NEXO_REPAIR_SESSION_CONTEXT_INVALID");
  }

  let current;
  try {
    current = await owner.loadCurrent();
  } catch (error) {
    return blocked(error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED");
  }

  const missions = current.snapshot.missions.filter(item => item?.missionId === missionId);
  if (missions.length !== 1) {
    return blocked(missions.length ? "NEXO_REPAIR_SESSION_MISSION_IDENTITY_AMBIGUOUS" : "NEXO_REPAIR_SESSION_MISSION_NOT_FOUND");
  }

  const mission = missions[0];
  const steps = (Array.isArray(mission.steps) ? mission.steps : []).filter(item => item?.id === stepId);
  if (steps.length !== 1) {
    return blocked(steps.length ? "NEXO_REPAIR_SESSION_STEP_IDENTITY_AMBIGUOUS" : "NEXO_REPAIR_SESSION_STEP_NOT_FOUND");
  }

  const step = steps[0];
  if (!REPAIR_ACTIONS.has(step.action)) {
    return blocked("NEXO_REPAIR_SESSION_ACTION_NOT_ELIGIBLE", { action: step.action ?? null });
  }
  if (["completed", "failed", "blocked"].includes(step.status)) {
    return blocked("NEXO_REPAIR_SESSION_STEP_TERMINAL", { stepStatus: step.status });
  }

  const operation = {
    idempotencyKey: `${missionId}:${stepId}`,
    missionId,
    stepId,
    action: step.action,
    target: structuredClone(step.target ?? null)
  };

  // runNexoRepairOnce persists PREPARED before dispatch and revalidates operation
  // identity against the canonical journal. This session never accepts a
  // caller-supplied action/target and never widens the repair-only allowlist.
  return runNexoRepairOnce({
    owner,
    store,
    statePath,
    expectedContinuityRevision: current.storeRevision,
    operation,
    savedAt
  });
}

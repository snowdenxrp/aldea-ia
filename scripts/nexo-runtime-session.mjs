import { runNexoRepairSession } from "./nexo-repair-session.mjs";

const REPAIR_ACTIONS = new Set([
  "repair_agent_state",
  "repair_agent_needs",
  "repair_resource_state"
]);

/**
 * Narrow runtime bridge for the assistants entrypoint.
 * It selects only a planned repair step from the canonical owner snapshot.
 * The repair session independently re-reads that snapshot before preparing.
 */
export async function runNexoRuntimeRepairSession({
  continuity,
  statePath,
  missionId
} = {}) {
  const owner = continuity?.owner;
  const store = continuity?.store;
  if (!owner || !store || typeof statePath !== "string" || !statePath.trim() ||
      typeof owner.loadCurrent !== "function") {
    return { status: "blocked", code: "NEXO_RUNTIME_SESSION_CONTEXT_INVALID", persisted: false };
  }

  let current;
  try {
    current = await owner.loadCurrent();
  } catch (error) {
    return { status: "blocked", code: error?.code ?? "NEXO_CONTINUITY_LOAD_FAILED", persisted: false };
  }

  const candidates = current.snapshot.missions.filter(item =>
    (!missionId || item?.missionId === missionId)
  );
  if (candidates.length !== 1) {
    return {
      status: "blocked",
      code: candidates.length ? "NEXO_RUNTIME_MISSION_IDENTITY_AMBIGUOUS" : "NEXO_RUNTIME_MISSION_NOT_FOUND",
      persisted: false
    };
  }

  const mission = candidates[0];
  const eligible = (Array.isArray(mission.steps) ? mission.steps : []).filter(step =>
    REPAIR_ACTIONS.has(step?.action) &&
    step.status === "planned" &&
    (step.dependsOn ?? []).every(dependencyId =>
      mission.steps.find(candidate => candidate?.id === dependencyId)?.status === "completed"
    )
  );
  if (!eligible.length) {
    return { status: "skipped", code: "NEXO_RUNTIME_NO_ELIGIBLE_REPAIR_STEP", missionId: mission.missionId, persisted: false };
  }

  // Only mission/step identifiers cross this seam. The session reloads the
  // canonical snapshot and derives action/target itself.
  return runNexoRepairSession({
    owner,
    store,
    statePath,
    missionId: mission.missionId,
    stepId: eligible[0].id
  });
}

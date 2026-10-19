import { createNexoContinuityStore } from "../core/continuity-store.mjs";
import { reconstructNexoMissionFromSnapshot } from "../core/continuity-operations.mjs";

export async function loadNexoContinuityStatus(continuityPath) {
  if (typeof continuityPath !== "string" || !continuityPath.trim()) {
    return { status: "blocked", code: "NEXO_STATUS_CONTINUITY_PATH_REQUIRED" };
  }
  try {
    const current = await createNexoContinuityStore({ filePath: continuityPath }).loadCurrent();
    const snapshot = current.snapshot;
    const journal = snapshot.effectJournal;
    return {
      status: "loaded",
      code: null,
      storeRevision: current.storeRevision,
      counts: {
        missions: snapshot.missions.length,
        attempts: snapshot.attempts.length,
        executions: snapshot.executions.length,
        journalEntries: journal.length,
        preparedObligations: journal.filter(entry => entry.status === "prepared").length,
        observedUnsettled: journal.filter(entry => entry.status === "reconciled_observed").length,
        settledObserved: journal.filter(entry => entry.status === "settled_observed").length
      }
    };
  } catch (error) {
    return { status: "blocked", code: error?.code ?? "NEXO_CONTINUITY_STATUS_UNAVAILABLE" };
  }
}

/** Reconstruct mission state from canonical continuity without exposing target/context payloads. */
export async function loadNexoMissionStatus(continuityPath, missionId) {
  if (typeof continuityPath !== "string" || !continuityPath.trim()) {
    return { status: "blocked", code: "NEXO_STATUS_CONTINUITY_PATH_REQUIRED" };
  }
  if (typeof missionId !== "string" || !missionId.trim()) {
    return { status: "blocked", code: "NEXO_MISSION_ID_REQUIRED" };
  }
  try {
    const store = createNexoContinuityStore({ filePath: continuityPath });
    // Read once: persisted and reconstructed status must refer to the same revision.
    const current = await store.loadCurrent();
    const persistedMission = current.snapshot.missions.find(item => item?.missionId === missionId);
    if (!persistedMission) {
      return { status: "not_found", code: "NEXO_MISSION_NOT_FOUND", storeRevision: current.storeRevision };
    }
    const reconstructed = reconstructNexoMissionFromSnapshot(current.snapshot, missionId);
    if (reconstructed.status !== "reconstructed") {
      return {
        status: "blocked",
        code: reconstructed.code ?? "NEXO_MISSION_RECONSTRUCTION_UNAVAILABLE",
        storeRevision: current.storeRevision
      };
    }
    const mission = reconstructed.mission;
    const persistedMissionStatus = persistedMission.status ?? "planned";
    return {
      status: "reconstructed",
      code: null,
      storeRevision: current.storeRevision,
      missionId: mission.missionId,
      persistedMissionStatus,
      missionStatus: mission.status,
      statusDiscrepancy: persistedMissionStatus !== mission.status,
      objective: mission.objective,
      uncertainty: mission.uncertainty,
      steps: mission.steps.map(step => ({
        stepId: step.id,
        action: step.action,
        status: step.status,
        dependencyCount: Array.isArray(step.dependsOn) ? step.dependsOn.length : 0,
        ...(typeof step.blockReason?.code === "string" ? { blockCode: step.blockReason.code } : {})
      }))
    };
  } catch (error) {
    return { status: "blocked", code: error?.code ?? "NEXO_MISSION_RECONSTRUCTION_UNAVAILABLE" };
  }
}

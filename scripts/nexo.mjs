import { pathToFileURL, fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createNexoContinuityStore } from "../src/nexo/core/continuity-store.mjs";
import { createNexoContinuityOwner } from "../src/nexo/core/continuity-owner.mjs";

/**
 * Nexo's independent command entrypoint.
 *
 * This is deliberately a narrow router, not a generic effect dispatcher.
 * Only the already-validated Chronicle vertical is exposed. Unsupported
 * commands fail closed; this module does not import Lúmina or its simulation.
 */
export function parseNexoEntrypointArguments(argv) {
  if (!Array.isArray(argv) || argv.some(value => typeof value !== "string")) {
    return { status: "blocked", code: "NEXO_COMMAND_ARGUMENTS_INVALID", dispatchAttempted: false };
  }
  if (argv.length === 0 || !argv[0].trim()) {
    return { status: "blocked", code: "NEXO_COMMAND_REQUIRED", dispatchAttempted: false };
  }
  if (argv[0] === "chronicle-append") {
    return { status: "dispatch", command: "chronicle-append", args: argv.slice(1) };
  }
  if (argv[0] === "status") {
    let continuityPath;
    for (let index = 1; index < argv.length; index += 1) {
      if (argv[index] !== "--continuity" || continuityPath !== undefined ||
          index + 1 >= argv.length || !argv[index + 1].trim() || argv[index + 1].startsWith("--")) {
        return { status: "blocked", code: "NEXO_STATUS_ARGUMENTS_INVALID", dispatchAttempted: false };
      }
      continuityPath = argv[++index];
    }
    if (typeof continuityPath !== "string") {
      return { status: "blocked", code: "NEXO_STATUS_CONTINUITY_PATH_REQUIRED", dispatchAttempted: false };
    }
    return { status: "status", continuityPath };
  }
  if (argv[0] === "mission-status") {
    let continuityPath;
    let missionId;
    for (let index = 1; index < argv.length; index += 1) {
      const option = argv[index];
      if ((option !== "--continuity" && option !== "--mission") ||
          index + 1 >= argv.length || !argv[index + 1].trim() || argv[index + 1].startsWith("--")) {
        return { status: "blocked", code: "NEXO_MISSION_STATUS_ARGUMENTS_INVALID", dispatchAttempted: false };
      }
      const value = argv[++index];
      if (option === "--continuity") {
        if (continuityPath !== undefined) return { status: "blocked", code: "NEXO_MISSION_STATUS_ARGUMENTS_INVALID", dispatchAttempted: false };
        continuityPath = value;
      } else {
        if (missionId !== undefined) return { status: "blocked", code: "NEXO_MISSION_STATUS_ARGUMENTS_INVALID", dispatchAttempted: false };
        missionId = value;
      }
    }
    if (typeof continuityPath !== "string") return { status: "blocked", code: "NEXO_STATUS_CONTINUITY_PATH_REQUIRED", dispatchAttempted: false };
    if (typeof missionId !== "string") return { status: "blocked", code: "NEXO_MISSION_ID_REQUIRED", dispatchAttempted: false };
    return { status: "mission-status", continuityPath, missionId };
  }
  return { status: "blocked", code: "NEXO_COMMAND_UNSUPPORTED", dispatchAttempted: false };
}

/** Read-only continuity summary. Missing/corrupt stores are never initialized or repaired. */
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
    const owner = createNexoContinuityOwner({ store });
    const reconstructed = await owner.reconstructMission(missionId);
    if (reconstructed.status !== "reconstructed") {
      return {
        status: reconstructed.status === "not_found" ? "not_found" : "blocked",
        code: reconstructed.status === "not_found" ? "NEXO_MISSION_NOT_FOUND" : reconstructed.code ?? "NEXO_MISSION_RECONSTRUCTION_UNAVAILABLE",
        storeRevision: reconstructed.storeRevision
      };
    }
    const mission = reconstructed.mission;
    return {
      status: "reconstructed",
      code: null,
      storeRevision: reconstructed.storeRevision,
      missionId: mission.missionId,
      missionStatus: mission.status,
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const parsed = parseNexoEntrypointArguments(process.argv.slice(2));
  if (parsed.status === "status") {
    const result = await loadNexoContinuityStatus(parsed.continuityPath);
    console.log(JSON.stringify(result));
    if (result.status !== "loaded") process.exitCode = 1;
  } else if (parsed.status === "mission-status") {
    const result = await loadNexoMissionStatus(parsed.continuityPath, parsed.missionId);
    console.log(JSON.stringify(result));
    if (result.status !== "reconstructed") process.exitCode = 1;
  } else if (parsed.status !== "dispatch") {
    console.log(JSON.stringify({
      status: parsed.status,
      code: parsed.code,
      dispatchAttempted: false
    }));
    process.exitCode = 1;
  } else {
    const chronicleEntrypoint = fileURLToPath(new URL("./nexo-chronicle-session.mjs", import.meta.url));
    const child = spawnSync(process.execPath, [chronicleEntrypoint, ...parsed.args], { stdio: "inherit" });
    if (child.error) {
      console.log(JSON.stringify({
        status: "blocked",
        code: "NEXO_ENTRYPOINT_DISPATCH_FAILED",
        dispatchAttempted: false
      }));
      process.exitCode = 1;
    } else {
      process.exitCode = Number.isInteger(child.status) ? child.status : 1;
    }
  }
}

import { pathToFileURL, fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { NEXO_RESOURCE_LIMITS, readUtf8FileBounded } from "../src/nexo/core/resource-limits.mjs";
import { loadNexoContinuityStatus, loadNexoMissionStatus, loadNexoMissionPlan, previewNexoMissionDraft, previewNexoMissionRequest } from "../src/nexo/application/index.mjs";

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
  if (argv[0] === "mission-plan") {
    let continuityPath;
    let missionId;
    for (let index = 1; index < argv.length; index += 1) {
      const option = argv[index];
      if ((option !== "--continuity" && option !== "--mission") ||
          index + 1 >= argv.length || !argv[index + 1].trim() || argv[index + 1].startsWith("--")) {
        return { status: "blocked", code: "NEXO_MISSION_PLAN_ARGUMENTS_INVALID", dispatchAttempted: false };
      }
      const value = argv[++index];
      if (option === "--continuity") {
        if (continuityPath !== undefined) return { status: "blocked", code: "NEXO_MISSION_PLAN_ARGUMENTS_INVALID", dispatchAttempted: false };
        continuityPath = value;
      } else {
        if (missionId !== undefined) return { status: "blocked", code: "NEXO_MISSION_PLAN_ARGUMENTS_INVALID", dispatchAttempted: false };
        missionId = value;
      }
    }
    if (typeof continuityPath !== "string") return { status: "blocked", code: "NEXO_STATUS_CONTINUITY_PATH_REQUIRED", dispatchAttempted: false };
    if (typeof missionId !== "string") return { status: "blocked", code: "NEXO_MISSION_ID_REQUIRED", dispatchAttempted: false };
    return { status: "mission-plan", continuityPath, missionId };
  }
  if (argv[0] === "mission-draft-preview") {
    let continuityPath;
    let draftPath;
    for (let index = 1; index < argv.length; index += 1) {
      const option = argv[index];
      if ((option !== "--continuity" && option !== "--draft") ||
          index + 1 >= argv.length || !argv[index + 1].trim() || argv[index + 1].startsWith("--")) {
        return { status: "blocked", code: "NEXO_MISSION_DRAFT_ARGUMENTS_INVALID", dispatchAttempted: false };
      }
      const value = argv[++index];
      if (option === "--continuity") {
        if (continuityPath !== undefined) return { status: "blocked", code: "NEXO_MISSION_DRAFT_ARGUMENTS_INVALID", dispatchAttempted: false };
        continuityPath = value;
      } else {
        if (draftPath !== undefined) return { status: "blocked", code: "NEXO_MISSION_DRAFT_ARGUMENTS_INVALID", dispatchAttempted: false };
        draftPath = value;
      }
    }
    if (typeof continuityPath !== "string") return { status: "blocked", code: "NEXO_STATUS_CONTINUITY_PATH_REQUIRED", dispatchAttempted: false };
    if (typeof draftPath !== "string") return { status: "blocked", code: "NEXO_MISSION_DRAFT_PATH_REQUIRED", dispatchAttempted: false };
    return { status: "mission-draft-preview", continuityPath, draftPath };
  }
  if (argv[0] === "mission-request-preview") {
    let continuityPath;
    let requestPath;
    for (let index = 1; index < argv.length; index += 1) {
      const option = argv[index];
      if ((option !== "--continuity" && option !== "--request") ||
          index + 1 >= argv.length || !argv[index + 1].trim() || argv[index + 1].startsWith("--")) {
        return { status: "blocked", code: "NEXO_MISSION_REQUEST_ARGUMENTS_INVALID", dispatchAttempted: false };
      }
      const value = argv[++index];
      if (option === "--continuity") {
        if (continuityPath !== undefined) return { status: "blocked", code: "NEXO_MISSION_REQUEST_ARGUMENTS_INVALID", dispatchAttempted: false };
        continuityPath = value;
      } else {
        if (requestPath !== undefined) return { status: "blocked", code: "NEXO_MISSION_REQUEST_ARGUMENTS_INVALID", dispatchAttempted: false };
        requestPath = value;
      }
    }
    if (typeof continuityPath !== "string") return { status: "blocked", code: "NEXO_STATUS_CONTINUITY_PATH_REQUIRED", dispatchAttempted: false };
    if (typeof requestPath !== "string") return { status: "blocked", code: "NEXO_MISSION_REQUEST_PATH_REQUIRED", dispatchAttempted: false };
    return { status: "mission-request-preview", continuityPath, requestPath };
  }
  return { status: "blocked", code: "NEXO_COMMAND_UNSUPPORTED", dispatchAttempted: false };
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
  } else if (parsed.status === "mission-draft-preview") {
    let draft;
    let draftReadFailed = false;
    try {
      draft = JSON.parse(await readUtf8FileBounded(fs, parsed.draftPath, NEXO_RESOURCE_LIMITS.missionPreviewInputBytes, "NEXO_MISSION_DRAFT_INPUT_RESOURCE_LIMIT_EXCEEDED"));
    } catch (error) {
      const code = error?.code === "ENOENT" ? "NEXO_MISSION_DRAFT_FILE_UNAVAILABLE" : error?.code === "NEXO_MISSION_DRAFT_INPUT_RESOURCE_LIMIT_EXCEEDED" ? error.code : "NEXO_MISSION_DRAFT_JSON_INVALID";
      console.log(JSON.stringify({ status: "blocked", code, authorization: "NOT_EVALUATED", dispatchAttempted: false, persisted: false }));
      process.exitCode = 1;
      draftReadFailed = true;
    }
    if (!draftReadFailed) {
      const result = await previewNexoMissionDraft(parsed.continuityPath, draft);
      console.log(JSON.stringify(result));
      if (result.status !== "validated") process.exitCode = 1;
    }
  } else if (parsed.status === "mission-request-preview") {
    let requestEnvelope;
    let requestReadFailed = false;
    try {
      requestEnvelope = JSON.parse(await readUtf8FileBounded(fs, parsed.requestPath, NEXO_RESOURCE_LIMITS.missionPreviewInputBytes, "NEXO_MISSION_REQUEST_INPUT_RESOURCE_LIMIT_EXCEEDED"));
    } catch (error) {
      const code = error?.code === "ENOENT" ? "NEXO_MISSION_REQUEST_FILE_UNAVAILABLE" : error?.code === "NEXO_MISSION_REQUEST_INPUT_RESOURCE_LIMIT_EXCEEDED" ? error.code : "NEXO_MISSION_REQUEST_JSON_INVALID";
      console.log(JSON.stringify({
        status: "blocked", code, requestInterpretation: "NOT_PERFORMED",
        intentDraftAlignment: "NOT_EVALUATED", authorization: "NOT_EVALUATED",
        dispatchAttempted: false, persisted: false
      }));
      process.exitCode = 1;
      requestReadFailed = true;
    }
    if (!requestReadFailed) {
      const result = await previewNexoMissionRequest(parsed.continuityPath, requestEnvelope);
      console.log(JSON.stringify(result));
      if (result.status !== "validated") process.exitCode = 1;
    }
  } else if (parsed.status === "mission-plan") {
    const result = await loadNexoMissionPlan(parsed.continuityPath, parsed.missionId);
    console.log(JSON.stringify(result));
    if (result.status !== "planned") process.exitCode = 1;
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

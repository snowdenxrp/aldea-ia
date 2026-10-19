import { pathToFileURL, fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createNexoContinuityStore } from "../src/nexo/core/continuity-store.mjs";

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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const parsed = parseNexoEntrypointArguments(process.argv.slice(2));
  if (parsed.status === "status") {
    const result = await loadNexoContinuityStatus(parsed.continuityPath);
    console.log(JSON.stringify(result));
    if (result.status !== "loaded") process.exitCode = 1;
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

import { pathToFileURL, fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

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
  if (argv[0] !== "chronicle-append") {
    return { status: "blocked", code: "NEXO_COMMAND_UNSUPPORTED", dispatchAttempted: false };
  }
  return { status: "dispatch", command: "chronicle-append", args: argv.slice(1) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const parsed = parseNexoEntrypointArguments(process.argv.slice(2));
  if (parsed.status !== "dispatch") {
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

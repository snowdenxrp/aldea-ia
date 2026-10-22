import { pathToFileURL } from "node:url";
import { runNexoChronicleAppend } from "../src/nexo/application/index.mjs";
import { NEXO_RESOURCE_LIMITS } from "../src/nexo/core/resource-limits.mjs";

export { runNexoChronicleAppend };

function blocked(code) {
  return { status: "blocked", code, dispatchAttempted: false };
}

export function parseNexoChronicleArguments(argv) {
  const values = Object.create(null);
  const valueOptions = new Set(["--continuity", "--chronicle", "--mission", "--step"]);
  const flags = new Set(["--initialize-continuity", "--initialize-chronicle", "--content-stdin"]);
  function invalid() {
    const error = new Error("NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID");
    error.code = "NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID";
    throw error;
  }
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (flags.has(key)) {
      if (Object.hasOwn(values, key)) invalid();
      values[key] = true;
      continue;
    }
    if (!valueOptions.has(key) || Object.hasOwn(values, key) ||
        index + 1 >= argv.length || argv[index + 1].startsWith("--")) invalid();
    values[key] = argv[++index];
  }
  return {
    continuityPath: values["--continuity"],
    chroniclePath: values["--chronicle"],
    missionId: values["--mission"],
    stepId: values["--step"],
    contentFromStdin: values["--content-stdin"] === true,
    initializeContinuity: values["--initialize-continuity"] === true,
    initializeChronicle: values["--initialize-chronicle"] === true
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let result;
  try {
    const args = parseNexoChronicleArguments(process.argv.slice(2));
    if (!args.contentFromStdin) {
      const error = new Error("NEXO_CHRONICLE_CLI_CONTENT_SOURCE_REQUIRED");
      error.code = "NEXO_CHRONICLE_CLI_CONTENT_SOURCE_REQUIRED";
      throw error;
    }
    if (process.stdin.isTTY) {
      const error = new Error("NEXO_CHRONICLE_CLI_STDIN_PIPE_REQUIRED");
      error.code = "NEXO_CHRONICLE_CLI_STDIN_PIPE_REQUIRED";
      throw error;
    }
    const chunks = [];
    let totalBytes = 0;
    for await (const chunk of process.stdin) {
      // Node stdin chunks are already Buffers; retain the chunk instead of copying
      // the entire chunk before checking the cumulative input limit.
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += bytes.length;
      if (totalBytes > NEXO_RESOURCE_LIMITS.stdinBytes) {
        const error = new Error("NEXO_CHRONICLE_STDIN_RESOURCE_LIMIT_EXCEEDED");
        error.code = "NEXO_CHRONICLE_STDIN_RESOURCE_LIMIT_EXCEEDED";
        throw error;
      }
      chunks.push(bytes);
    }
    const content = Buffer.concat(chunks, totalBytes).toString("utf8");
    result = await runNexoChronicleAppend({ ...args, content });
  } catch (error) {
    result = blocked(error?.code ?? "NEXO_CHRONICLE_SESSION_FAILED");
  }
  // Do not echo Chronicle content, raw errors, or filesystem paths to logs.
  console.log(JSON.stringify({
    status: result.status,
    code: result.code ?? null,
    missionId: result.missionId ?? null,
    stepId: result.stepId ?? null,
    dispatchAttempted: result.dispatchAttempted ?? false,
    terminalOutcomeRecorded: result.terminalOutcomeRecorded ?? false,
    redispatchAuthorized: result.redispatchAuthorized ?? false,
    authorization: result.authorization ?? "NOT_EVALUATED",
    phase: result.phase ?? null,
    writeStarted: typeof result.writeStarted === "boolean" ? result.writeStarted : null,
    lockRelease: result.lockRelease ?? null,
    lockAcquisitionCode: result.lockAcquisitionCode ?? null
  }));
  if (result.status !== "completed") process.exitCode = 1;
}

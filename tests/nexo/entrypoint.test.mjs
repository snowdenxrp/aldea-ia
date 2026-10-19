import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseNexoEntrypointArguments } from "../../scripts/nexo.mjs";

const entrypointPath = fileURLToPath(new URL("../../scripts/nexo.mjs", import.meta.url));
assert.deepEqual(parseNexoEntrypointArguments([]), {
  status: "blocked", code: "NEXO_COMMAND_REQUIRED", dispatchAttempted: false
});
assert.deepEqual(parseNexoEntrypointArguments(["repair"]), {
  status: "blocked", code: "NEXO_COMMAND_UNSUPPORTED", dispatchAttempted: false
});
assert.deepEqual(parseNexoEntrypointArguments(["chronicle-append", "--content-stdin"]), {
  status: "dispatch", command: "chronicle-append", args: ["--content-stdin"]
});
assert.equal(parseNexoEntrypointArguments([null]).code, "NEXO_COMMAND_ARGUMENTS_INVALID");

const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-main-entrypoint-"));
try {
  const unknown = spawnSync(process.execPath, [entrypointPath, "repair"], {
    cwd: process.cwd(), encoding: "utf8"
  });
  assert.equal(unknown.status, 1);
  assert.equal(unknown.stderr, "");
  assert.deepEqual(JSON.parse(unknown.stdout), {
    status: "blocked", code: "NEXO_COMMAND_UNSUPPORTED", dispatchAttempted: false
  });

  const continuityPath = path.join(root, "continuity.json");
  const chroniclePath = path.join(root, "chronicle.json");
  const privateSentinel = "NEXO_PRIVATE_CONTENT_SENTINEL_7F2A";
  const valid = spawnSync(process.execPath, [
    entrypointPath, "chronicle-append",
    "--continuity", continuityPath,
    "--chronicle", chroniclePath,
    "--mission", "entrypoint-mission",
    "--step", "entrypoint-step",
    "--initialize-continuity",
    "--initialize-chronicle",
    "--content-stdin"
  ], {
    cwd: process.cwd(), input: privateSentinel, encoding: "utf8"
  });
  assert.equal(valid.status, 0, valid.stderr || valid.stdout);
  assert.equal(valid.stderr, "");
  assert.equal(valid.stdout.includes(privateSentinel), false);
  const result = JSON.parse(valid.stdout);
  assert.equal(result.status, "completed");
  assert.equal(result.code, null);
  assert.equal(result.missionId, "entrypoint-mission");
  assert.equal(result.stepId, "entrypoint-step");
  assert.equal(result.dispatchAttempted, true);
  assert.equal(result.terminalOutcomeRecorded, true);
  assert.equal(result.redispatchAuthorized, false);

  const persistedChronicle = JSON.parse(await fs.readFile(chroniclePath, "utf8"));
  assert.equal(persistedChronicle.entries.length, 1);
  assert.equal(persistedChronicle.entries[0].content, privateSentinel);
  const persistedContinuity = JSON.parse(await fs.readFile(continuityPath, "utf8"));
  assert.equal(persistedContinuity.nexo.effectJournal[0].status, "settled_observed");
} finally {
  await fs.rm(root, { recursive: true, force: true });
}

console.log("Nexo independent entrypoint: unsupported commands fail closed; Chronicle delegates without Lúmina or content leakage.");

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseNexoEntrypointArguments } from "../../scripts/nexo.mjs";

const entrypointPath = fileURLToPath(new URL("../../scripts/nexo.mjs", import.meta.url));
const chronicleSessionSource = await fs.readFile(new URL("../../scripts/nexo-chronicle-session.mjs", import.meta.url), "utf8");
const ownerRuntimeSource = await fs.readFile(new URL("../../src/nexo/core/owner-backed-runtime.mjs", import.meta.url), "utf8");
assert.equal(chronicleSessionSource.includes("../src/nexo/runtime.js"), false);
assert.equal(chronicleSessionSource.includes("../src/nexo/core/owner-backed-runtime.mjs"), true);
for (const luminaCoupling of ["simulation-adapter.js", "../assistants/memory.js", "world.js", "simulation.js", "simulate.mjs"]) {
  assert.equal(ownerRuntimeSource.includes(luminaCoupling), false, `owner-backed runtime must not depend on ${luminaCoupling}`);
}
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
assert.deepEqual(parseNexoEntrypointArguments(["status", "--continuity", "continuity.json"]), {
  status: "status", continuityPath: "continuity.json"
});
assert.equal(parseNexoEntrypointArguments(["status", "--continuity", "a", "--continuity", "b"]).code, "NEXO_STATUS_ARGUMENTS_INVALID");
assert.equal(parseNexoEntrypointArguments(["status"]).code, "NEXO_STATUS_CONTINUITY_PATH_REQUIRED");

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

  const missingContinuityPath = path.join(root, "missing-continuity.json");
  const missingStatus = spawnSync(process.execPath, [entrypointPath, "status", "--continuity", missingContinuityPath], {
    cwd: process.cwd(), encoding: "utf8"
  });
  assert.equal(missingStatus.status, 1);
  assert.equal(missingStatus.stderr, "");
  assert.deepEqual(JSON.parse(missingStatus.stdout), {
    status: "blocked", code: "NEXO_CONTINUITY_STORE_NOT_FOUND"
  });
  await assert.rejects(fs.access(missingContinuityPath), { code: "ENOENT" });

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
  assert.equal(result.code, "NEXO_CHRONICLE_APPEND_SETTLED");
  assert.equal(result.missionId, "entrypoint-mission");
  assert.equal(result.stepId, "entrypoint-step");
  assert.equal(result.dispatchAttempted, true);
  assert.equal(result.terminalOutcomeRecorded, true);
  assert.equal(result.redispatchAuthorized, false);

  const persistedChronicle = JSON.parse(await fs.readFile(chroniclePath, "utf8"));
  assert.equal(persistedChronicle.entries.length, 1);
  assert.equal(persistedChronicle.entries[0].content, privateSentinel);
  const persistedContinuity = JSON.parse(await fs.readFile(continuityPath, "utf8"));
  assert.equal(persistedContinuity.snapshot.effectJournal[0].status, "settled_observed");

  // Status is read-only and emits counts, not mission content or target payloads.
  const continuityBytesBeforeStatus = await fs.readFile(continuityPath, "utf8");
  const statusResult = spawnSync(process.execPath, [entrypointPath, "status", "--continuity", continuityPath], {
    cwd: process.cwd(), encoding: "utf8"
  });
  assert.equal(statusResult.status, 0, statusResult.stderr || statusResult.stdout);
  assert.equal(statusResult.stderr, "");
  assert.equal(statusResult.stdout.includes(privateSentinel), false);
  const statusSummary = JSON.parse(statusResult.stdout);
  assert.equal(statusSummary.status, "loaded");
  assert.equal(statusSummary.storeRevision, persistedContinuity.storeRevision);
  assert.equal(statusSummary.counts.missions, 1);
  assert.equal(statusSummary.counts.attempts, 1);
  assert.equal(statusSummary.counts.executions, 1);
  assert.equal(statusSummary.counts.journalEntries, 1);
  assert.equal(statusSummary.counts.preparedObligations, 0);
  assert.equal(statusSummary.counts.observedUnsettled, 0);
  assert.equal(statusSummary.counts.settledObserved, 1);
  assert.equal(await fs.readFile(continuityPath, "utf8"), continuityBytesBeforeStatus);
} finally {
  await fs.rm(root, { recursive: true, force: true });
}

console.log("Nexo independent entrypoint: unsupported commands fail closed; Chronicle delegates without Lúmina or content leakage.");

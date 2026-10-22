import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseNexoEntrypointArguments } from "../../scripts/nexo.mjs";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";
import * as nexoApplication from "../../src/nexo/application/index.mjs";

assert.deepEqual(Object.keys(nexoApplication).sort(), [
  "loadNexoContinuityStatus", "loadNexoMissionStatus", "runNexoChronicleAppend"
].sort(), "public Nexo application API must remain narrow and must not expose a generic dispatcher");
for (const exportedUseCase of Object.values(nexoApplication)) assert.equal(typeof exportedUseCase, "function");

const entrypointPath = fileURLToPath(new URL("../../scripts/nexo.mjs", import.meta.url));
const chronicleSessionSource = await fs.readFile(new URL("../../scripts/nexo-chronicle-session.mjs", import.meta.url), "utf8");
const chronicleApplicationSource = await fs.readFile(new URL("../../src/nexo/application/chronicle-append.mjs", import.meta.url), "utf8");
const ownerRuntimeSource = await fs.readFile(new URL("../../src/nexo/core/owner-backed-runtime.mjs", import.meta.url), "utf8");
assert.equal(chronicleSessionSource.includes("../src/nexo/runtime.js"), false);
assert.equal(chronicleSessionSource.includes("../src/nexo/core/owner-backed-runtime.mjs"), false,
  "CLI wrapper must not own runtime orchestration");
assert.equal(chronicleApplicationSource.includes("../core/owner-backed-runtime.mjs"), true,
  "Nexo application service must call the isolated owner-backed runtime");
for (const luminaCoupling of ["simulation-adapter.js", "../assistants/memory.js", "world.js", "simulation.js", "simulate.mjs"]) {
  assert.equal(ownerRuntimeSource.includes(luminaCoupling), false, `owner-backed runtime must not depend on ${luminaCoupling}`);
}
// Walk the static local-import graph from both Nexo command entrypoints.
// This catches accidental transitive imports of the legacy Lúmina runtime/memory.
// The generic effect adapter is an internal collaborator for the Chronicle-only use case; the public API must not export it, and the owner-backed runtime allowlist remains the action gate.
const forbiddenImport = /(?:^|\/)(?:assistants\/memory\.js|simulation-adapter\.js|world\.js|simulation\.js|simulate\.mjs|nexo\/runtime\.js)$/;
const auditedFiles = new Set();
async function auditNexoImportGraph(relativePath) {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  if (auditedFiles.has(absolutePath)) return;
  auditedFiles.add(absolutePath);
  const source = await fs.readFile(absolutePath, "utf8");
  // Follow both imports and re-exports: the public application index uses
  // "export ... from", so ignoring re-exports would leave its implementation
  // graph outside this architectural guard.
  const specifiers = [...source.matchAll(/\b(?:import|export)\s+(?:[^'";]*?\s+from\s+)?["']([^"']+)["']/g)]
    .map(match => match[1]);
  for (const specifier of specifiers) {
    assert.equal(forbiddenImport.test(specifier), false,
      `Nexo-only import graph must not depend on legacy module ${specifier} (from ${relativePath})`);
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      const dependency = path.resolve(path.dirname(absolutePath), specifier);
      await auditNexoImportGraph(path.relative(process.cwd(), dependency));
    }
  }
}
await auditNexoImportGraph("scripts/nexo.mjs");
await auditNexoImportGraph("scripts/nexo-chronicle-session.mjs");
assert.equal(auditedFiles.has(path.resolve(process.cwd(), "src/nexo/application/chronicle-append.mjs")), true,
  "import graph guard must traverse the public index re-export to the mutating use case");
assert.equal(auditedFiles.has(path.resolve(process.cwd(), "src/nexo/application/continuity-queries.mjs")), true,
  "import graph guard must traverse public read-only query re-exports");
assert.equal(auditedFiles.has(path.resolve(process.cwd(), "src/nexo/runtime.js")), false,
  "the independent Nexo entrypoints must not transitively import the compatibility runtime");
assert.deepEqual(parseNexoEntrypointArguments([]), {
  status: "blocked", code: "NEXO_COMMAND_REQUIRED", dispatchAttempted: false
});
assert.deepEqual(parseNexoEntrypointArguments(["repair"]), {
  status: "blocked", code: "NEXO_COMMAND_UNSUPPORTED", dispatchAttempted: false
});
for (const unsupportedCommand of ["execute", "run", "simulate", "shell", "http", "effect", "repair"]) {
  assert.deepEqual(parseNexoEntrypointArguments([unsupportedCommand]), {
    status: "blocked", code: "NEXO_COMMAND_UNSUPPORTED", dispatchAttempted: false
  }, `scope A must reject generic or effect-capable command ${unsupportedCommand} before dispatch`);
}
assert.deepEqual(parseNexoEntrypointArguments(["chronicle-append", "--content-stdin"]), {
  status: "dispatch", command: "chronicle-append", args: ["--content-stdin"]
});
assert.equal(parseNexoEntrypointArguments([null]).code, "NEXO_COMMAND_ARGUMENTS_INVALID");
assert.deepEqual(parseNexoEntrypointArguments(["status", "--continuity", "continuity.json"]), {
  status: "status", continuityPath: "continuity.json"
});
assert.equal(parseNexoEntrypointArguments(["status", "--continuity", "a", "--continuity", "b"]).code, "NEXO_STATUS_ARGUMENTS_INVALID");
assert.equal(parseNexoEntrypointArguments(["status"]).code, "NEXO_STATUS_CONTINUITY_PATH_REQUIRED");
assert.deepEqual(parseNexoEntrypointArguments(["mission-status", "--continuity", "continuity.json", "--mission", "mission-1"]), {
  status: "mission-status", continuityPath: "continuity.json", missionId: "mission-1"
});
assert.equal(parseNexoEntrypointArguments(["mission-status", "--continuity", "a", "--mission", "b", "--mission", "c"]).code, "NEXO_MISSION_STATUS_ARGUMENTS_INVALID");
assert.equal(parseNexoEntrypointArguments(["mission-status", "--continuity", "a"]).code, "NEXO_MISSION_ID_REQUIRED");

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

  // A second OS process simulates restart: replay the same mission/step and
  // prove the existing Chronicle append is observed without a second dispatch.
  const replayBytesBefore = await fs.readFile(continuityPath, "utf8");
  const replayChronicleBytesBefore = await fs.readFile(chroniclePath, "utf8");
  const replay = spawnSync(process.execPath, [
    entrypointPath, "chronicle-append",
    "--continuity", continuityPath,
    "--chronicle", chroniclePath,
    "--mission", "entrypoint-mission",
    "--step", "entrypoint-step",
    "--initialize-continuity",
    "--initialize-chronicle",
    "--content-stdin"
  ], { cwd: process.cwd(), input: privateSentinel, encoding: "utf8" });
  assert.equal(replay.status, 0, replay.stderr || replay.stdout);
  assert.equal(replay.stderr, "");
  assert.equal(replay.stdout.includes(privateSentinel), false);
  const replayResult = JSON.parse(replay.stdout);
  assert.equal(replayResult.status, "completed");
  assert.equal(replayResult.dispatchAttempted, false);
  assert.equal(replayResult.terminalOutcomeRecorded, true);
  assert.equal(replayResult.redispatchAuthorized, false);
  assert.equal(await fs.readFile(continuityPath, "utf8"), replayBytesBefore);
  assert.equal(await fs.readFile(chroniclePath, "utf8"), replayChronicleBytesBefore);
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

  // Mission reconstruction reads canonical continuity after restart without
  // printing the stored target/content payload or mutating the store.
  const missionStatus = spawnSync(process.execPath, [
    entrypointPath, "mission-status", "--continuity", continuityPath, "--mission", "entrypoint-mission"
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(missionStatus.status, 0, missionStatus.stderr || missionStatus.stdout);
  assert.equal(missionStatus.stderr, "");
  assert.equal(missionStatus.stdout.includes(privateSentinel), false);
  const missionSummary = JSON.parse(missionStatus.stdout);
  assert.equal(missionSummary.status, "reconstructed");
  assert.equal(missionSummary.missionId, "entrypoint-mission");
  assert.equal(missionSummary.steps.length, 1);
  assert.equal(missionSummary.steps[0].stepId, "entrypoint-step");
  assert.equal(missionSummary.steps[0].action, "chronicle_append");
  assert.equal(missionSummary.steps[0].status, "completed");
  assert.equal("target" in missionSummary.steps[0], false);
  assert.equal(await fs.readFile(continuityPath, "utf8"), continuityBytesBeforeStatus);

  const missingMission = spawnSync(process.execPath, [
    entrypointPath, "mission-status", "--continuity", continuityPath, "--mission", "missing-mission"
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(missingMission.status, 1);
  assert.deepEqual(JSON.parse(missingMission.stdout), {
    status: "not_found", code: "NEXO_MISSION_NOT_FOUND", storeRevision: persistedContinuity.storeRevision
  });
  assert.equal(await fs.readFile(continuityPath, "utf8"), continuityBytesBeforeStatus);

  // An unresolved PREPARED obligation must reconstruct as blocked after restart.
  const preparedContinuityPath = path.join(root, "prepared-continuity.json");
  const preparedPayload = "PREPARED_PRIVATE_SENTINEL_DO_NOT_OUTPUT";
  const preparedLegacyMemory = {
    version: 4, runs: [], lessons: [], patterns: [],
    nexo: {
      missions: [{
        missionId: "prepared-mission", status: "planned", objective: "chronicle_append",
        steps: [{ id: "step-1", action: "chronicle_append", target: { content: preparedPayload }, status: "planned", dependsOn: [] }]
      }],
      attempts: [], doNotRepeat: [], executions: [],
      effectJournal: [{
        idempotencyKey: "prepared-mission:step-1",
        missionId: "prepared-mission", stepId: "step-1", action: "chronicle_append",
        target: { content: preparedPayload }, status: "prepared", at: "2026-10-19T00:00:00.000Z"
      }]
    }
  };
  await openNexoContinuityOwner({ filePath: preparedContinuityPath, legacyMemory: preparedLegacyMemory });
  const preparedBytesBefore = await fs.readFile(preparedContinuityPath, "utf8");
  const preparedMissionStatus = spawnSync(process.execPath, [
    entrypointPath, "mission-status", "--continuity", preparedContinuityPath, "--mission", "prepared-mission"
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(preparedMissionStatus.status, 0, preparedMissionStatus.stderr || preparedMissionStatus.stdout);
  assert.equal(preparedMissionStatus.stderr, "");
  assert.equal(preparedMissionStatus.stdout.includes(preparedPayload), false);
  const preparedSummary = JSON.parse(preparedMissionStatus.stdout);
  assert.equal(preparedSummary.status, "reconstructed");
  assert.equal(preparedSummary.missionStatus, "blocked");
  assert.equal(preparedSummary.steps[0].status, "blocked");
  assert.equal(preparedSummary.steps[0].blockCode, "NEXO_EFFECT_RECONCILIATION_REQUIRED");
  assert.equal(await fs.readFile(preparedContinuityPath, "utf8"), preparedBytesBefore);
  // Public status must expose persisted/reconstructed disagreement from one canonical read.
  const contradictoryContinuityPath = path.join(root, "contradictory-continuity.json");
  const contradictoryMemory = {
    version: 4, runs: [], lessons: [], patterns: [],
    nexo: {
      missions: [{
        missionId: "contradictory-mission", status: "completed", objective: "descriptive-only",
        steps: [{
          id: "step-1", action: "chronicle_append",
          target: { content: "STATUS_PRIVATE_SENTINEL_DO_NOT_OUTPUT" },
          status: "planned", dependsOn: []
        }]
      }],
      attempts: [], doNotRepeat: [], executions: [], effectJournal: []
    }
  };
  await openNexoContinuityOwner({
    filePath: contradictoryContinuityPath,
    legacyMemory: contradictoryMemory
  });
  const contradictoryBytesBefore = await fs.readFile(contradictoryContinuityPath, "utf8");
  const contradictoryStatus = spawnSync(process.execPath, [
    entrypointPath, "mission-status", "--continuity", contradictoryContinuityPath,
    "--mission", "contradictory-mission"
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(contradictoryStatus.status, 1, contradictoryStatus.stderr || contradictoryStatus.stdout);
  assert.equal(contradictoryStatus.stderr, "");
  assert.equal(contradictoryStatus.stdout.includes("STATUS_PRIVATE_SENTINEL_DO_NOT_OUTPUT"), false);
  const contradictorySummary = JSON.parse(contradictoryStatus.stdout);
  assert.equal(contradictorySummary.status, "blocked");
  assert.equal(contradictorySummary.code, "NEXO_MISSION_STATUS_DISCREPANCY");
  assert.equal(contradictorySummary.persistedMissionStatus, "completed");
  assert.equal(contradictorySummary.missionStatus, "planned");
  assert.equal(contradictorySummary.statusDiscrepancy, true);
  assert.equal("steps" in contradictorySummary, false, "contradictory state must not be projected as a usable mission");
  assert.equal(await fs.readFile(contradictoryContinuityPath, "utf8"), contradictoryBytesBefore);
  // Coordinated bootstrap is not atomic across the two independent files.
  // If Continuity initializes but Chronicle's parent directory is unavailable,
  // the first attempt must remain blocked with no mission/effect admitted.
  // A retry against the same Continuity file and a valid Chronicle path must
  // resume from that durable empty state without duplicate initialization.
  const partialBootstrapContinuityPath = path.join(root, "partial-bootstrap-continuity.json");
  const unavailableChroniclePath = path.join(root, "missing-parent", "chronicle.json");
  const partialBootstrap = spawnSync(process.execPath, [
    entrypointPath, "chronicle-append",
    "--continuity", partialBootstrapContinuityPath,
    "--chronicle", unavailableChroniclePath,
    "--mission", "partial-bootstrap-mission",
    "--step", "step-1",
    "--initialize-continuity",
    "--initialize-chronicle",
    "--content-stdin"
  ], { cwd: process.cwd(), input: "bootstrap-retry-content", encoding: "utf8" });
  assert.equal(partialBootstrap.status, 1);
  assert.equal(partialBootstrap.stderr, "");
  const partialBootstrapResult = JSON.parse(partialBootstrap.stdout);
  assert.equal(partialBootstrapResult.status, "blocked");
  assert.equal(partialBootstrapResult.code, "NEXO_CHRONICLE_PARENT_PATH_UNAVAILABLE");
  assert.equal(partialBootstrapResult.dispatchAttempted, false);
  assert.equal(partialBootstrapResult.redispatchAuthorized, false);
  assert.equal(partialBootstrapResult.authorization, "NOT_EVALUATED");
  const partialContinuity = JSON.parse(await fs.readFile(partialBootstrapContinuityPath, "utf8"));
  assert.equal(partialContinuity.storeRevision, 0);
  assert.deepEqual(partialContinuity.snapshot.missions, []);
  await assert.rejects(fs.access(unavailableChroniclePath), { code: "ENOENT" });

  const retryChroniclePath = path.join(root, "partial-bootstrap-chronicle.json");
  const bootstrapRetry = spawnSync(process.execPath, [
    entrypointPath, "chronicle-append",
    "--continuity", partialBootstrapContinuityPath,
    "--chronicle", retryChroniclePath,
    "--mission", "partial-bootstrap-mission",
    "--step", "step-1",
    "--initialize-continuity",
    "--initialize-chronicle",
    "--content-stdin"
  ], { cwd: process.cwd(), input: "bootstrap-retry-content", encoding: "utf8" });
  assert.equal(bootstrapRetry.status, 0, bootstrapRetry.stderr || bootstrapRetry.stdout);
  assert.equal(bootstrapRetry.stderr, "");
  const bootstrapRetryResult = JSON.parse(bootstrapRetry.stdout);
  assert.equal(bootstrapRetryResult.status, "completed");
  assert.equal(bootstrapRetryResult.dispatchAttempted, true);
  const retryContinuity = JSON.parse(await fs.readFile(partialBootstrapContinuityPath, "utf8"));
  const retryChronicle = JSON.parse(await fs.readFile(retryChroniclePath, "utf8"));
  assert.equal(retryContinuity.snapshot.missions.filter(item => item.missionId === "partial-bootstrap-mission").length, 1);
  assert.equal(retryContinuity.snapshot.effectJournal.length, 1);
  assert.equal(retryContinuity.snapshot.effectJournal[0].status, "settled_observed");
  assert.equal(retryChronicle.entries.filter(item => item.content === "bootstrap-retry-content").length, 1);

} finally {
  await fs.rm(root, { recursive: true, force: true });
}

console.log("Nexo independent entrypoint: unsupported commands fail closed; Chronicle delegates without Lúmina or content leakage.");

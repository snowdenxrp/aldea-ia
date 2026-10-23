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
  "loadNexoContinuityStatus", "loadNexoMissionPlan", "loadNexoMissionStatus", "loadNexoOpenLoops", "previewNexoMissionDraft", "previewNexoMissionRequest", "runNexoChronicleAppend"
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
assert.deepEqual(parseNexoEntrypointArguments(["mission-plan", "--continuity", "continuity.json", "--mission", "mission-1"]), {
  status: "mission-plan", continuityPath: "continuity.json", missionId: "mission-1"
});
assert.equal(parseNexoEntrypointArguments(["mission-plan", "--continuity", "a"]).code, "NEXO_MISSION_ID_REQUIRED");
assert.deepEqual(parseNexoEntrypointArguments(["mission-draft-preview", "--continuity", "continuity.json", "--draft", "draft.json"]), {
  status: "mission-draft-preview", continuityPath: "continuity.json", draftPath: "draft.json"
});
assert.equal(parseNexoEntrypointArguments(["mission-draft-preview", "--continuity", "a"]).code, "NEXO_MISSION_DRAFT_PATH_REQUIRED");

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

  // Oversized stdin must be rejected before opening/initializing either store.
  const oversizedContinuityPath = path.join(root, "oversized-stdin-continuity.json");
  const oversizedChroniclePath = path.join(root, "oversized-stdin-chronicle.json");
  const oversizedInput = spawnSync(process.execPath, [
    entrypointPath, "chronicle-append",
    "--continuity", oversizedContinuityPath,
    "--chronicle", oversizedChroniclePath,
    "--mission", "oversized-stdin-mission",
    "--step", "oversized-stdin-step",
    "--initialize-continuity",
    "--initialize-chronicle",
    "--content-stdin"
  ], {
    cwd: process.cwd(),
    input: "x".repeat(256 * 1024 + 1),
    encoding: "utf8"
  });
  assert.equal(oversizedInput.status, 1);
  assert.equal(oversizedInput.stderr, "");
  assert.equal(oversizedInput.stdout.includes("x".repeat(128)), false,
    "oversized stdin payload must not be echoed to output");
  assert.deepEqual(JSON.parse(oversizedInput.stdout), {
    status: "blocked",
    code: "NEXO_CHRONICLE_STDIN_RESOURCE_LIMIT_EXCEEDED",
    missionId: null,
    stepId: null,
    dispatchAttempted: false,
    terminalOutcomeRecorded: false,
    redispatchAuthorized: false,
    authorization: "NOT_EVALUATED",
    phase: null,
    writeStarted: null,
    lockRelease: null,
    lockAcquisitionCode: null
  });
  await assert.rejects(fs.access(oversizedContinuityPath), { code: "ENOENT" });
  await assert.rejects(fs.access(oversizedChroniclePath), { code: "ENOENT" });

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
  // Mission planning projects dependency state without exposing targets or authorizing execution.
  const missionPlan = spawnSync(process.execPath, [
    entrypointPath, "mission-plan", "--continuity", continuityPath, "--mission", "entrypoint-mission"
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(missionPlan.status, 0, missionPlan.stderr || missionPlan.stdout);
  assert.equal(missionPlan.stderr, "");
  assert.equal(missionPlan.stdout.includes(privateSentinel), false);
  const missionPlanSummary = JSON.parse(missionPlan.stdout);
  assert.equal(missionPlanSummary.status, "planned");
  assert.equal(missionPlanSummary.missionStatus, "awaiting_verification");
  assert.equal(missionPlanSummary.steps[0].status, "completed");
  assert.equal(missionPlanSummary.steps[0].planningState, "completed", "a completed step must not be represented as pending planning work");
  assert.deepEqual(missionPlanSummary.steps[0].dependsOn, []);
  assert.equal(missionPlanSummary.authorization, "NOT_EVALUATED");
  assert.equal(missionPlanSummary.dispatchAttempted, false);
  assert.equal(await fs.readFile(continuityPath, "utf8"), continuityBytesBeforeStatus);

  // A proposed mission draft is validated through the existing mission contract,
  // topologically ordered, and never persisted or dispatched.
  const draftPath = path.join(root, "mission-draft.json");
  const draftPrivate = "PRIVATE_DRAFT_TARGET_SHOULD_NEVER_BE_OUTPUT";
  const draft = {
    missionId: "new-preview-mission",
    objective: "local_analysis",
    status: "planned",
    steps: [
      { id: "second", action: "local_analysis", target: draftPrivate, status: "planned", dependsOn: ["first"] },
      { id: "first", action: "local_analysis", target: "PRIVATE_FIRST_DRAFT_TARGET", status: "planned", dependsOn: [] }
    ]
  };
  await fs.writeFile(draftPath, JSON.stringify(draft), "utf8");
  const draftPreview = spawnSync(process.execPath, [
    entrypointPath, "mission-draft-preview", "--continuity", continuityPath, "--draft", draftPath
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(draftPreview.status, 0, draftPreview.stderr || draftPreview.stdout);
  assert.equal(draftPreview.stderr, "");
  assert.equal(draftPreview.stdout.includes(draftPrivate), false);
  assert.equal(draftPreview.stdout.includes("PRIVATE_FIRST_DRAFT_TARGET"), false);
  const draftSummary = JSON.parse(draftPreview.stdout);
  assert.equal(draftSummary.status, "validated");
  assert.equal(draftSummary.missionId, "new-preview-mission");
  assert.equal(draftSummary.stepCount, 2);
  assert.deepEqual(draftSummary.steps.map(step => step.stepId), ["first", "second"]);
  assert.equal(draftSummary.steps[1].dependsOn[0], "first");
  assert.equal(draftSummary.authorization, "NOT_EVALUATED");
  assert.equal(draftSummary.dispatchAttempted, false);
  assert.equal(draftSummary.persisted, false);
  assert.equal(await fs.readFile(continuityPath, "utf8"), continuityBytesBeforeStatus);

  const invalidDraftPath = path.join(root, "invalid-mission-draft.json");
  await fs.writeFile(invalidDraftPath, JSON.stringify({
    missionId: "invalid-cycle-draft",
    objective: "local_analysis",
    steps: [
      { id: "cycle-a", action: "local_analysis", dependsOn: ["cycle-b"] },
      { id: "cycle-b", action: "local_analysis", dependsOn: ["cycle-a"] }
    ]
  }), "utf8");
  const invalidDraftPreview = spawnSync(process.execPath, [
    entrypointPath, "mission-draft-preview", "--continuity", continuityPath, "--draft", invalidDraftPath
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(invalidDraftPreview.status, 1);
  assert.equal(invalidDraftPreview.stderr, "");
  const invalidDraftSummary = JSON.parse(invalidDraftPreview.stdout);
  assert.equal(invalidDraftSummary.status, "blocked");
  assert.equal(invalidDraftSummary.code, "NEXO_MISSION_CONTEXT_INVALID");
  assert.equal(invalidDraftSummary.authorization, "NOT_EVALUATED");
  assert.equal(invalidDraftSummary.dispatchAttempted, false);
  assert.equal(invalidDraftSummary.persisted, false);
  assert.equal(await fs.readFile(continuityPath, "utf8"), continuityBytesBeforeStatus);

  const duplicateDraftPath = path.join(root, "duplicate-mission-draft.json");
  await fs.writeFile(duplicateDraftPath, JSON.stringify({
    missionId: "entrypoint-mission", objective: "local_analysis",
    steps: [{ id: "different-step", action: "local_analysis", dependsOn: [] }]
  }), "utf8");
  const duplicateDraftPreview = spawnSync(process.execPath, [
    entrypointPath, "mission-draft-preview", "--continuity", continuityPath, "--draft", duplicateDraftPath
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(duplicateDraftPreview.status, 1);
  assert.equal(duplicateDraftPreview.stderr, "");
  assert.equal(JSON.parse(duplicateDraftPreview.stdout).code, "NEXO_MISSION_ID_ALREADY_BOUND");
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

  const blockedMissionPlan = spawnSync(process.execPath, [
    entrypointPath, "mission-plan", "--continuity", preparedContinuityPath, "--mission", "prepared-mission"
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(blockedMissionPlan.status, 0, blockedMissionPlan.stderr || blockedMissionPlan.stdout);
  assert.equal(blockedMissionPlan.stderr, "");
  assert.equal(blockedMissionPlan.stdout.includes(preparedPayload), false);
  const blockedPlanSummary = JSON.parse(blockedMissionPlan.stdout);
  assert.equal(blockedPlanSummary.status, "planned");
  assert.equal(blockedPlanSummary.missionStatus, "blocked");
  assert.equal(blockedPlanSummary.steps[0].planningState, "blocked");
  assert.equal(blockedPlanSummary.steps[0].blockCode, "NEXO_EFFECT_RECONCILIATION_REQUIRED");
  assert.equal(blockedPlanSummary.authorization, "NOT_EVALUATED");
  assert.equal(blockedPlanSummary.dispatchAttempted, false);
  assert.equal(await fs.readFile(preparedContinuityPath, "utf8"), preparedBytesBefore);

  const missingMissionPlan = spawnSync(process.execPath, [
    entrypointPath, "mission-plan", "--continuity", preparedContinuityPath, "--mission", "missing-mission"
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(missingMissionPlan.status, 1);
  assert.equal(missingMissionPlan.stderr, "");
  assert.deepEqual(JSON.parse(missingMissionPlan.stdout), {
    status: "not_found", code: "NEXO_MISSION_NOT_FOUND",
    storeRevision: JSON.parse(preparedBytesBefore).storeRevision,
    authorization: "NOT_EVALUATED", dispatchAttempted: false
  });
  assert.equal(await fs.readFile(preparedContinuityPath, "utf8"), preparedBytesBefore);
  const dependencyContinuityPath = path.join(root, "dependency-continuity.json");
  await openNexoContinuityOwner({
    filePath: dependencyContinuityPath,
    legacyMemory: {
      version: 4, runs: [], lessons: [], patterns: [],
      nexo: {
        missions: [{
          missionId: "dependency-mission",
          status: "planned",
          objective: "local_analysis",
          steps: [
            { id: "first", action: "local_analysis", target: "PRIVATE_FIRST_TARGET", status: "planned", dependsOn: [] },
            { id: "second", action: "local_analysis", target: "PRIVATE_SECOND_TARGET", status: "planned", dependsOn: ["first"] }
          ]
        }],
        attempts: [], doNotRepeat: [], executions: [], effectJournal: []
      }
    }
  });
  const dependencyBytesBefore = await fs.readFile(dependencyContinuityPath, "utf8");
  const dependencyPlan = spawnSync(process.execPath, [
    entrypointPath, "mission-plan", "--continuity", dependencyContinuityPath, "--mission", "dependency-mission"
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(dependencyPlan.status, 0, dependencyPlan.stderr || dependencyPlan.stdout);
  assert.equal(dependencyPlan.stderr, "");
  assert.equal(dependencyPlan.stdout.includes("PRIVATE_FIRST_TARGET"), false);
  assert.equal(dependencyPlan.stdout.includes("PRIVATE_SECOND_TARGET"), false);
  const dependencySummary = JSON.parse(dependencyPlan.stdout);
  assert.equal(dependencySummary.steps[0].planningState, "dependencies_satisfied");
  assert.equal(dependencySummary.steps[1].dependencyState, "waiting");
  assert.equal(dependencySummary.steps[1].planningState, "waiting_for_dependencies");
  assert.deepEqual(dependencySummary.steps[1].dependencyStatuses, [{ stepId: "first", status: "planned" }]);
  assert.equal(dependencySummary.authorization, "NOT_EVALUATED");
  assert.equal(dependencySummary.dispatchAttempted, false);
  assert.equal(await fs.readFile(dependencyContinuityPath, "utf8"), dependencyBytesBefore);

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

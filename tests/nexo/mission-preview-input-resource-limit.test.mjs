import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { NEXO_RESOURCE_LIMITS } from "../../src/nexo/core/resource-limits.mjs";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";

const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-preview-input-limit-"));
const limit = NEXO_RESOURCE_LIMITS.missionPreviewInputBytes;
const cliPath = fileURLToPath(new URL("../../scripts/nexo.mjs", import.meta.url));

function runPreview(command, continuityPath, inputPath) {
  const flag = command === "mission-draft-preview" ? "--draft" : "--request";
  return spawnSync(process.execPath, [cliPath, command, "--continuity", continuityPath, flag, inputPath], {
    cwd: process.cwd(), encoding: "utf8"
  });
}

try {
  const continuityPath = path.join(root, "continuity.json");
  await openNexoContinuityOwner({
    filePath: continuityPath,
    legacyMemory: {
      version: 4, runs: [], lessons: [], patterns: [],
      nexo: { missions: [], attempts: [], doNotRepeat: [], executions: [], effectJournal: [] }
    }
  });
  const continuityBefore = await fs.readFile(continuityPath, "utf8");

  for (const [command, fileName, expectedCode] of [
    ["mission-draft-preview", "draft.json", "NEXO_MISSION_DRAFT_INPUT_RESOURCE_LIMIT_EXCEEDED"],
    ["mission-request-preview", "request.json", "NEXO_MISSION_REQUEST_INPUT_RESOURCE_LIMIT_EXCEEDED"]
  ]) {
    const inputPath = path.join(root, fileName);

    // Below-limit valid JSON is read and reaches the domain validator.
    await fs.writeFile(inputPath, "null", "utf8");
    const below = runPreview(command, continuityPath, inputPath);
    assert.equal(below.status, 1);
    assert.equal(below.stderr, "");
    assert.equal(JSON.parse(below.stdout).status, "blocked");

    // Exactly the byte limit is accepted by the reader; JSON null is then
    // rejected by the domain validator, proving the resource boundary is inclusive.
    const exact = "null" + " ".repeat(limit - Buffer.byteLength("null", "utf8"));
    assert.equal(Buffer.byteLength(exact, "utf8"), limit);
    await fs.writeFile(inputPath, exact, "utf8");
    const exactRun = runPreview(command, continuityPath, inputPath);
    assert.equal(exactRun.status, 1);
    assert.equal(exactRun.stderr, "");
    const exactResult = JSON.parse(exactRun.stdout);
    assert.equal(exactResult.status, "blocked");
    assert.notEqual(exactResult.code, expectedCode);
    assert.equal(exactResult.dispatchAttempted, false);
    assert.equal(exactResult.persisted, false);

    // One byte over is rejected before JSON.parse and without echoing payload.
    const privateMarker = "PRIVATE_OVERSIZE_PREVIEW_PAYLOAD";
    await fs.writeFile(inputPath, " " .repeat(limit) + privateMarker, "utf8");
    const oversized = runPreview(command, continuityPath, inputPath);
    assert.equal(oversized.status, 1);
    assert.equal(oversized.stderr, "");
    const oversizedResult = JSON.parse(oversized.stdout);
    assert.equal(oversizedResult.status, "blocked");
    assert.equal(oversizedResult.code, expectedCode);
    assert.equal(oversizedResult.dispatchAttempted, false);
    assert.equal(oversizedResult.persisted, false);
    assert.equal(oversized.stdout.includes(privateMarker), false);
    assert.equal(await fs.readFile(continuityPath, "utf8"), continuityBefore);
  }
} finally {
  await fs.rm(root, { recursive: true, force: true });
}

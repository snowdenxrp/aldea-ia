import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openNexoContinuityOwner } from "../../src/nexo/core/continuity-service.mjs";

const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-continuity-service-options-"));
try {
  let getterCalls = 0;
  const accessorPathOptions = {};
  Object.defineProperty(accessorPathOptions, "filePath", {
    enumerable: true,
    get() {
      getterCalls += 1;
      throw new Error("filePath getter must not execute");
    }
  });
  await assert.rejects(
    openNexoContinuityOwner(accessorPathOptions),
    error => error.code === "NEXO_CONTINUITY_STORE_PATH_REQUIRED"
  );
  assert.equal(getterCalls, 0, "service must reject filePath accessors before opening the store");

  const accessorMemoryPath = path.join(root, "accessor-memory.json");
  const accessorMemoryOptions = { filePath: accessorMemoryPath };
  Object.defineProperty(accessorMemoryOptions, "legacyMemory", {
    enumerable: true,
    get() {
      getterCalls += 1;
      throw new Error("legacyMemory getter must not execute");
    }
  });
  await assert.rejects(
    openNexoContinuityOwner(accessorMemoryOptions),
    error => error.code === "NEXO_STORE_OPTIONS_INVALID"
  );
  assert.equal(getterCalls, 0, "service must reject non-path option accessors before store access");
  await assert.rejects(fs.access(accessorMemoryPath), { code: "ENOENT" });

  const inheritedOptions = Object.create({
    filePath: path.join(root, "inherited.json"),
    allowEmptyInitialization: true
  });
  await assert.rejects(
    openNexoContinuityOwner(inheritedOptions),
    error => error.code === "NEXO_STORE_OPTIONS_INVALID"
  );
  await assert.rejects(fs.access(path.join(root, "inherited.json")), { code: "ENOENT" });

  const validPath = path.join(root, "valid-continuity.json");
  const opened = await openNexoContinuityOwner({
    filePath: validPath,
    legacyMemory: {
      version: 4, runs: [], lessons: [], patterns: [],
      nexo: { missions: [], attempts: [], doNotRepeat: [], executions: [], effectJournal: [] }
    }
  });
  assert.equal(opened.current.status, "loaded");
  assert.equal(opened.current.storeRevision, 0);
  assert.equal(opened.current.snapshot.missions.length, 0);
} finally {
  await fs.rm(root, { recursive: true, force: true });
}

console.log("Nexo continuity service options input guard tests passed.");

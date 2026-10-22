import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createNexoContinuityStore } from "../../src/nexo/core/continuity-store.mjs";
import { createNexoChronicleStore } from "../../src/nexo/core/chronicle-store.mjs";
import { NEXO_RESOURCE_LIMITS } from "../../src/nexo/core/resource-limits.mjs";

const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-temp-cleanup-bounds-"));
try {
  const snapshot = {
    schema: "NEXO_CONTINUITY_SNAPSHOT",
    schemaVersion: 1,
    missions: [], attempts: [], doNotRepeat: [], executions: [], effectJournal: []
  };
  const continuityPath = path.join(root, "continuity.json");
  const continuity = createNexoContinuityStore({ filePath: continuityPath });
  const initialized = await continuity.initialize(snapshot);
  assert.equal(initialized.status, "committed");
  const canonicalContinuity = await fs.readFile(continuityPath);
  const continuityTemps = Array.from({ length: NEXO_RESOURCE_LIMITS.staleTemporaryFiles + 1 }, (_, i) =>
    `${continuityPath}.tmp-stale-${i}`);
  for (const p of continuityTemps) await fs.writeFile(p, "stale", "utf8");
  const commit = await continuity.commitIfCurrent(0, snapshot);
  assert.equal(commit.status, "failed");
  assert.deepEqual(await fs.readFile(continuityPath), canonicalContinuity);
  for (const p of continuityTemps) await assert.doesNotReject(() => fs.access(p));

  const chroniclePath = path.join(root, "chronicle.json");
  const chronicle = createNexoChronicleStore({ filePath: chroniclePath });
  assert.equal((await chronicle.initialize()).status, "committed");
  const canonicalChronicle = await fs.readFile(chroniclePath);
  const chronicleTemps = Array.from({ length: NEXO_RESOURCE_LIMITS.staleTemporaryFiles + 1 }, (_, i) =>
    `${chroniclePath}.tmp-stale-${i}`);
  for (const p of chronicleTemps) await fs.writeFile(p, "stale", "utf8");
  const append = await chronicle.append({ operationKey: "cleanup-boundary", content: "must remain uncommitted" });
  assert.equal(append.status, "unknown");
  assert.deepEqual(await fs.readFile(chroniclePath), canonicalChronicle);
  for (const p of chronicleTemps) await assert.doesNotReject(() => fs.access(p));
} finally {
  await fs.rm(root, { recursive: true, force: true });
}
console.log("Nexo bounded temporary cleanup regression passed");

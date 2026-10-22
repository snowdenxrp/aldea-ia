import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createNexoContinuityStore } from "../../src/nexo/core/continuity-store.mjs";
import { createNexoChronicleStore } from "../../src/nexo/core/chronicle-store.mjs";
import { NEXO_RESOURCE_LIMITS } from "../../src/nexo/core/resource-limits.mjs";

function makeFsWithOverflowingDirectory(directory, baseName) {
  let overflow = false;
  const removed = [];
  return {
    fsModule: {
      ...fs,
      opendir: async target => {
        if (!overflow || String(target) !== directory) return fs.opendir(target);
        let index = 0;
        return {
          async *[Symbol.asyncIterator]() {
            while (index <= NEXO_RESOURCE_LIMITS.staleTemporaryFiles) {
              const name = `${baseName}.tmp-stale-${index++}`;
              yield { name, isFile: () => true };
            }
          },
          async close() {}
        };
      },
      rm: async (target, ...args) => {
        if (String(target).includes(".tmp-stale-")) removed.push(String(target));
        return fs.rm(target, ...args);
      }
    },
    enableOverflow: () => { overflow = true; },
    removed
  };
}

const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-temp-cleanup-boundary-"));
try {
  const snapshot = {
    schema: "NEXO_OPERATIONAL_CONTINUITY",
    schemaVersion: 1,
    missions: [], attempts: [], doNotRepeat: [], executions: [], effectJournal: []
  };
  const continuityPath = path.join(root, "continuity.json");
  const continuityFs = makeFsWithOverflowingDirectory(root, "continuity.json");
  const continuity = createNexoContinuityStore({ filePath: continuityPath, fsModule: continuityFs.fsModule });
  assert.equal((await continuity.initialize(snapshot)).status, "committed");
  const continuityBefore = await fs.readFile(continuityPath);
  continuityFs.enableOverflow();
  const commit = await continuity.commitIfCurrent(0, snapshot);
  assert.equal(commit.status, "failed");
  assert.deepEqual(await fs.readFile(continuityPath), continuityBefore);
  assert.deepEqual(continuityFs.removed, []);

  const chroniclePath = path.join(root, "chronicle.json");
  const chronicleFs = makeFsWithOverflowingDirectory(root, "chronicle.json");
  const chronicle = createNexoChronicleStore({ filePath: chroniclePath, fsModule: chronicleFs.fsModule });
  assert.equal((await chronicle.initialize()).status, "committed");
  const chronicleBefore = await fs.readFile(chroniclePath);
  chronicleFs.enableOverflow();
  const append = await chronicle.append({ operationKey: "bounded-cleanup", content: "must not commit" });
  assert.equal(append.status, "unknown");
  assert.deepEqual(await fs.readFile(chroniclePath), chronicleBefore);
  assert.deepEqual(chronicleFs.removed, []);
} finally {
  await fs.rm(root, { recursive: true, force: true });
}
console.log("Nexo bounded temporary cleanup regression passed");

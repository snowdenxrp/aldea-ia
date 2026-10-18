import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createNexoChronicleStore } from "../../src/nexo/core/chronicle-store.mjs";
import { observeChronicleOperation } from "../../src/nexo/adapters/chronicle-observation.mjs";

const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-chronicle-"));
try {
  const filePath = path.join(root, "chronicle.json");
  const store = createNexoChronicleStore({ filePath });
  assert.equal((await store.loadCurrent().catch(error => ({ code: error.code }))).code, "NEXO_CHRONICLE_NOT_FOUND");
  assert.equal((await store.append({ operationKey: "mission-1:step-1", content: "record" })).status, "blocked");
  assert.equal((await store.initialize()).status, "committed");
  assert.equal((await store.initialize()).status, "conflict");

  const writes = await Promise.all([
    store.append({ operationKey: "mission-1:step-1", content: "record" }),
    store.append({ operationKey: "mission-1:step-1", content: "record" })
  ]);
  assert.equal(writes.filter(result => result.status === "committed").length, 1);
  assert.equal(writes.filter(result => result.status === "already_present").length, 1);
  assert.equal((await store.append({ operationKey: "mission-1:step-1", content: "different" })).status, "conflict");

  // Independent reader: discard the writer instance and reopen from the persisted path.
  const reopened = createNexoChronicleStore({ filePath });
  const loaded = await reopened.loadCurrent();
  assert.equal(loaded.entries.length, 1);
  assert.deepEqual(loaded.entries[0], { operationKey: "mission-1:step-1", content: "record" });
  assert.deepEqual(await observeChronicleOperation({
    store: reopened, idempotencyKey: "mission-1:step-1", missionId: "mission-1",
    stepId: "step-1", action: "chronicle_append", target: { content: "record" }
  }), {
    status: "applied", idempotencyKey: "mission-1:step-1", missionId: "mission-1",
    stepId: "step-1", action: "chronicle_append", target: { content: "record" },
    observedRevision: 1, source: "nexo-chronicle-store", causalAttribution: "not_established"
  });
  assert.equal((await observeChronicleOperation({
    store: reopened, idempotencyKey: "mission-1:step-2", missionId: "mission-1",
    stepId: "step-2", action: "chronicle_append", target: { content: "missing" }
  })).status, "not_applied");

  // Independent operations written concurrently must not overwrite each other.
  await Promise.all([
    reopened.append({ operationKey: "mission-1:step-2", content: "second" }),
    reopened.append({ operationKey: "mission-1:step-3", content: "third" })
  ]);
  assert.equal((await reopened.loadCurrent()).entries.length, 3);

  // Simulate a lost writer response after the atomic rename already changed persisted state.
  const lostPath = path.join(root, "lost-response.json");
  let loseNextRename = false;
  const fsWithLostResponse = {
    ...fs,
    rename: async (from, to) => {
      await fs.rename(from, to);
      if (loseNextRename) {
        loseNextRename = false;
        throw new Error("simulated response lost after rename");
      }
    }
  };
  const lostWriter = createNexoChronicleStore({ filePath: lostPath, fsModule: fsWithLostResponse });
  assert.equal((await lostWriter.initialize()).status, "committed");
  loseNextRename = true;
  const recoveredWrite = await lostWriter.append({ operationKey: "mission-2:step-1", content: "survived" });
  assert.equal(recoveredWrite.status, "committed");
  assert.equal(recoveredWrite.recoveredAfterWriteError, true);
  const lostResponseReader = createNexoChronicleStore({ filePath: lostPath });
  assert.equal((await observeChronicleOperation({
    store: lostResponseReader, idempotencyKey: "mission-2:step-1", missionId: "mission-2",
    stepId: "step-1", action: "chronicle_append", target: { content: "survived" }
  })).status, "applied");

  // Corrupt persisted state is UNKNOWN, never silently reset.
  await fs.writeFile(filePath, "{invalid", "utf8");
  assert.equal((await observeChronicleOperation({
    store: reopened, idempotencyKey: "mission-1:step-1", missionId: "mission-1",
    stepId: "step-1", action: "chronicle_append", target: { content: "record" }
  })).status, "unknown");
} finally {
  await fs.rm(root, { recursive: true, force: true });
}
console.log("Nexo Chronicle store contract tests passed");

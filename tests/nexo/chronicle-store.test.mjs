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
    store: reopened, operationKey: "mission-1:step-1", expectedContent: "record"
  }), {
    status: "applied", operationKey: "mission-1:step-1",
    source: "nexo-chronicle-store", causalAttribution: "not_established"
  });
  assert.equal((await observeChronicleOperation({
    store: reopened, operationKey: "mission-1:step-2", expectedContent: "missing"
  })).status, "not_applied");

  // Corrupt persisted state is UNKNOWN, never silently reset.
  await fs.writeFile(filePath, "{invalid", "utf8");
  assert.equal((await observeChronicleOperation({
    store: reopened, operationKey: "mission-1:step-1", expectedContent: "record"
  })).status, "unknown");
} finally {
  await fs.rm(root, { recursive: true, force: true });
}
console.log("Nexo Chronicle store contract tests passed");

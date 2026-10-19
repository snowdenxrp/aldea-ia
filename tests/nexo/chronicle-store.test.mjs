import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createNexoChronicleStore } from "../../src/nexo/core/chronicle-store.mjs";
import { observeChronicleOperation } from "../../src/nexo/adapters/chronicle-observation.mjs";
import { createNexoChronicleEffectContracts } from "../../src/nexo/adapters/chronicle-effect.mjs";

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
    observedRevision: 1, source: "nexo-chronicle-store",
    evidence: {
      kind: "persisted-chronicle-entry",
      operationKey: "mission-1:step-1",
      content: "record"
    },
    causalAttribution: "not_established"
  });


  // Colon-delimited operation identity must reject ambiguous identifier pairs.
  assert.equal((await observeChronicleOperation({
    store: reopened, idempotencyKey: "mission-1:step-1", missionId: "mission-1:step",
    stepId: "1", action: "chronicle_append", target: { content: "record" }
  })).status, "unknown");

  // Independent operations written concurrently must not overwrite each other.
  await Promise.all([
    reopened.append({ operationKey: "mission-1:step-2", content: "second" }),
    reopened.append({ operationKey: "mission-1:step-3", content: "third" })
  ]);
  assert.equal((await reopened.loadCurrent()).entries.length, 3);

  // Separate Node processes must serialize cooperating appends without losing either entry.
  const crossProcessPath = path.join(root, "cross-process.json");
  const crossProcessStore = createNexoChronicleStore({ filePath: crossProcessPath });
  assert.equal((await crossProcessStore.initialize()).status, "committed");
  const moduleUrl = new URL("../../src/nexo/core/chronicle-store.mjs", import.meta.url).href;
  function appendInChild(operationKey, content) {
    const source = `import { createNexoChronicleStore } from ${JSON.stringify(moduleUrl)};
const store = createNexoChronicleStore({ filePath: ${JSON.stringify(crossProcessPath)} });
const result = await store.append({ operationKey: ${JSON.stringify(operationKey)}, content: ${JSON.stringify(content)} });
console.log(JSON.stringify(result));
if (result.status !== "committed") process.exitCode = 1;`;
    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ["--input-type=module", "-e", source], { cwd: process.cwd() });
      let stdout = "";
      let stderr = "";
      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", chunk => { stdout += chunk; });
      child.stderr.on("data", chunk => { stderr += chunk; });
      child.on("error", reject);
      child.on("close", code => {
        if (code !== 0) return reject(new Error(`cross-process append failed: ${stderr}`));
        try { resolve(JSON.parse(stdout.trim())); } catch (error) { reject(error); }
      });
    });
  }
  const crossProcessResults = await Promise.all([
    appendInChild("cross-process-a", "entry A"),
    appendInChild("cross-process-b", "entry B")
  ]);
  assert.equal(crossProcessResults.filter(result => result.status === "committed").length, 2);
  const crossProcessReopened = createNexoChronicleStore({ filePath: crossProcessPath });
  const crossProcessEntries = (await crossProcessReopened.loadCurrent()).entries;
  assert.equal(crossProcessEntries.length, 2);
  assert.deepEqual(new Set(crossProcessEntries.map(entry => entry.operationKey)), new Set(["cross-process-a", "cross-process-b"]));

  // A stale lock must fail closed; automatic check-then-remove reclamation is racy.
  const staleLockPath = path.join(root, "stale-lock.json");
  const staleLockStore = createNexoChronicleStore({ filePath: staleLockPath });
  assert.equal((await staleLockStore.initialize()).status, "committed");
  const staleLockDir = `${staleLockPath}.lock`;
  await fs.mkdir(staleLockDir);
  await fs.writeFile(path.join(staleLockDir, "owner.json"), JSON.stringify({ pid: 2147483647, token: "dead-owner" }), "utf8");
  const staleTime = new Date(Date.now() - 120_000);
  await fs.utimes(staleLockDir, staleTime, staleTime);
  await assert.rejects(
    () => staleLockStore.append({ operationKey: "stale-lock:step", content: "must not write" }),
    error => error?.code === "NEXO_CHRONICLE_LOCK_STALE_RECOVERY_REQUIRED"
  );
  assert.equal((await staleLockStore.loadCurrent()).entries.length, 0);
  assert.equal((await fs.readFile(path.join(staleLockDir, "owner.json"), "utf8")).includes("dead-owner"), true);

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

  // A matching operation key alone is insufficient to prove this append committed:
  // simulate a competing mutation after rename but before the writer's response returns.
  const ambiguousPath = path.join(root, "ambiguous-append.json");
  let corruptAfterRename = false;
  const fsWithAmbiguousOutcome = {
    ...fs,
    rename: async (from, to) => {
      await fs.rename(from, to);
      if (corruptAfterRename) {
        corruptAfterRename = false;
        const observed = JSON.parse(await fs.readFile(to, "utf8"));
        observed.storeRevision += 1;
        observed.entries.push({ operationKey: "concurrent-change", content: "not part of candidate" });
        await fs.writeFile(to, JSON.stringify(observed, null, 2) + "\n", "utf8");
        throw new Error("simulated competing mutation after rename");
      }
    }
  };
  const ambiguousStore = createNexoChronicleStore({ filePath: ambiguousPath, fsModule: fsWithAmbiguousOutcome });
  assert.equal((await ambiguousStore.initialize()).status, "committed");
  corruptAfterRename = true;
  assert.deepEqual(
    await ambiguousStore.append({ operationKey: "ambiguous-operation", content: "candidate content" }),
    { status: "unknown", code: "NEXO_CHRONICLE_APPEND_OUTCOME_UNKNOWN" }
  );
  const ambiguousObserved = await createNexoChronicleStore({ filePath: ambiguousPath }).loadCurrent();
  assert.equal(ambiguousObserved.storeRevision, 2);
  assert.deepEqual(ambiguousObserved.entries, [
    { operationKey: "ambiguous-operation", content: "candidate content" },
    { operationKey: "concurrent-change", content: "not part of candidate" }
  ]);

  // The action-specific contract writes only through Chronicle and verifies through a fresh read.
  const contracts = createNexoChronicleEffectContracts({ store: reopened });
  const effectResult = await contracts.handlers.chronicle_append({
    missionId: "mission-3", stepId: "step-1", action: "chronicle_append",
    target: { content: "native Nexo history" }
  });
  assert.equal(effectResult.status, "completed");
  assert.equal(await contracts.postcondition({
    missionId: "mission-3", stepId: "step-1", action: "chronicle_append",
    target: { content: "native Nexo history" }
  }), true);
  const ownerObservation = await contracts.verifiers.chronicle_append({
    idempotencyKey: "mission-3:step-1", missionId: "mission-3", stepId: "step-1",
    action: "chronicle_append", target: { content: "native Nexo history" }
  });
  assert.equal(ownerObservation.status, "applied");
  assert.equal(ownerObservation.idempotencyKey, "mission-3:step-1");
  assert.equal(ownerObservation.action, "chronicle_append");
  assert.deepEqual(ownerObservation.target, { content: "native Nexo history" });
  assert.equal(Number.isSafeInteger(ownerObservation.observedRevision), true);
  assert.deepEqual(ownerObservation.evidence, {
    kind: "persisted-chronicle-entry",
    operationKey: "mission-3:step-1",
    content: "native Nexo history"
  });

  // Revision exhaustion must reject before any persisted mutation.
  const exhaustedPath = path.join(root, "revision-exhausted.json");
  const maxRevisionDocument = {
    schema: "NEXO_CHRONICLE",
    schemaVersion: 1,
    storeRevision: Number.MAX_SAFE_INTEGER,
    entries: [{ operationKey: "existing-operation", content: "preserve this entry" }]
  };
  const maxRevisionBytes = JSON.stringify(maxRevisionDocument, null, 2) + "\n";
  await fs.writeFile(exhaustedPath, maxRevisionBytes, "utf8");
  const exhaustedStore = createNexoChronicleStore({ filePath: exhaustedPath });
  assert.deepEqual(
    await exhaustedStore.append({ operationKey: "new-operation", content: "must not be written" }),
    {
      status: "blocked",
      code: "NEXO_CHRONICLE_REVISION_EXHAUSTED",
      storeRevision: Number.MAX_SAFE_INTEGER
    }
  );
  assert.equal(await fs.readFile(exhaustedPath, "utf8"), maxRevisionBytes);
  const exhaustedRead = await exhaustedStore.loadCurrent();
  assert.equal(exhaustedRead.storeRevision, Number.MAX_SAFE_INTEGER);
  assert.deepEqual(exhaustedRead.entries, maxRevisionDocument.entries);

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

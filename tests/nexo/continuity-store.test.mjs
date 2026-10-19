import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createNexoContinuityStore } from "../../src/nexo/core/continuity-store.mjs";
import { NEXO_CONTINUITY_SCHEMA } from "../../src/nexo/core/continuity-snapshot.mjs";

const directory = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-owned-continuity-"));
const filePath = path.join(directory, "nexo-continuity.json");
const store = createNexoContinuityStore({ filePath });
const emptySnapshot = {
  schema: NEXO_CONTINUITY_SCHEMA,
  schemaVersion: 1,
  missions: [],
  attempts: [],
  doNotRepeat: [],
  executions: [],
  effectJournal: []
};

await assert.rejects(
  () => store.loadCurrent(),
  error => error?.code === "NEXO_CONTINUITY_STORE_NOT_FOUND",
  "missing Nexo state must not be normalized into an empty store"
);

const initialized = await store.initialize(emptySnapshot);
assert.equal(initialized.status, "committed");
assert.equal(initialized.storeRevision, 0);
assert.equal((await store.loadCurrent()).storeRevision, 0);
assert.equal((await store.initialize(emptySnapshot)).status, "conflict");

const candidateA = { ...emptySnapshot, doNotRepeat: [{ action: "repair_agent_state", target: "alex" }] };
const candidateB = { ...emptySnapshot, doNotRepeat: [{ action: "repair_agent_needs", target: "bruno" }] };
const outcomes = await Promise.all([
  store.commitIfCurrent(0, candidateA),
  store.commitIfCurrent(0, candidateB)
]);
assert.equal(outcomes.filter(result => result.status === "committed").length, 1);
assert.equal(outcomes.filter(result => result.status === "conflict").length, 1);
assert.equal((await store.loadCurrent()).storeRevision, 1);

const loaded = await store.loadCurrent();
assert.equal("world" in loaded.snapshot, false, "Nexo continuity store must not own Lúmina world state");
assert.equal("agents" in loaded.snapshot, false, "Nexo continuity store must not own Lúmina agents");
assert.equal("runs" in loaded.snapshot, false, "Nexo continuity store must not own learning analytics");
assert.equal("authority" in loaded.snapshot, false, "continuity persistence must not mint authority");

const bad = { ...emptySnapshot, authority: { status: "AUTHORIZED" } };
assert.deepEqual(
  await store.commitIfCurrent(1, bad),
  { status: "failed", code: "NEXO_CONTINUITY_SNAPSHOT_SCHEMA_UNKNOWN" },
  "unknown authority fields must be rejected rather than persisted"
);

// Initialization must reconcile a lost response against the exact persisted envelope.
const initializeLostDirectory = path.join(directory, "initialize-lost-response");
await fs.mkdir(initializeLostDirectory);
const initializeLostPath = path.join(initializeLostDirectory, "continuity.json");
let loseInitializeResponse = true;
const fsWithLostInitializeResponse = {
  ...fs,
  rename: async (from, to) => {
    await fs.rename(from, to);
    if (loseInitializeResponse) {
      loseInitializeResponse = false;
      throw new Error("simulated response lost after initialization rename");
    }
  }
};
const initializeLostStore = createNexoContinuityStore({
  filePath: initializeLostPath,
  fsModule: fsWithLostInitializeResponse
});
assert.deepEqual(
  await initializeLostStore.initialize(emptySnapshot),
  {
    status: "committed",
    storeRevision: 0,
    snapshot: emptySnapshot,
    recoveredAfterWriteError: true
  },
  "a matching persisted envelope proves initialization committed despite a lost response"
);
assert.equal((await createNexoContinuityStore({ filePath: initializeLostPath }).loadCurrent()).storeRevision, 0);

// If the write fails before rename and the target remains absent, failure is confirmed.
const initializeFailedDirectory = path.join(directory, "initialize-failed");
await fs.mkdir(initializeFailedDirectory);
const initializeFailedPath = path.join(initializeFailedDirectory, "continuity.json");
const fsWithFailedInitializeWrite = {
  ...fs,
  rename: async () => { throw new Error("simulated rename failure before persistence"); }
};
const initializeFailedStore = createNexoContinuityStore({
  filePath: initializeFailedPath,
  fsModule: fsWithFailedInitializeWrite
});
assert.deepEqual(
  await initializeFailedStore.initialize(emptySnapshot),
  { status: "failed", code: "NEXO_CONTINUITY_STORE_INITIALIZE_FAILED" },
  "an absent target after failed write confirms initialization did not commit"
);
await assert.rejects(
  () => initializeFailedStore.loadCurrent(),
  error => error?.code === "NEXO_CONTINUITY_STORE_NOT_FOUND"
);

// Exhausted safe-integer revisions must fail before writing an invalid envelope.
const exhaustedDirectory = path.join(directory, "revision-exhausted");
await fs.mkdir(exhaustedDirectory);
const exhaustedFilePath = path.join(exhaustedDirectory, "continuity.json");
const exhaustedStore = createNexoContinuityStore({ filePath: exhaustedFilePath });
const maxRevisionEnvelope = {
  schema: "NEXO_CONTINUITY_STORE",
  schemaVersion: 1,
  storeRevision: Number.MAX_SAFE_INTEGER,
  snapshot: emptySnapshot
};
await fs.writeFile(exhaustedFilePath, JSON.stringify(maxRevisionEnvelope, null, 2) + "\n", "utf8");
const exhaustedBytesBefore = await fs.readFile(exhaustedFilePath, "utf8");
assert.deepEqual(
  await exhaustedStore.commitIfCurrent(Number.MAX_SAFE_INTEGER, candidateA),
  {
    status: "failed",
    code: "NEXO_CONTINUITY_STORE_REVISION_EXHAUSTED",
    storeRevision: Number.MAX_SAFE_INTEGER
  },
  "revision exhaustion must fail closed rather than write an unsafe integer"
);
assert.equal(await fs.readFile(exhaustedFilePath, "utf8"), exhaustedBytesBefore,
  "revision exhaustion must leave the canonical envelope byte-for-byte unchanged");
assert.equal((await exhaustedStore.loadCurrent()).storeRevision, Number.MAX_SAFE_INTEGER,
  "the existing envelope must remain readable after rejected revision exhaustion");

// A stale lock must not be reclaimed through a racy check-then-remove sequence.
const staleDirectory = path.join(directory, "stale-lock-case");
await fs.mkdir(staleDirectory);
const staleFilePath = path.join(staleDirectory, "continuity.json");
const staleStore = createNexoContinuityStore({ filePath: staleFilePath });
assert.equal((await staleStore.initialize(emptySnapshot)).status, "committed");
const staleLockDir = `${staleFilePath}.lock`;
await fs.mkdir(staleLockDir);
await fs.writeFile(path.join(staleLockDir, "owner.json"), JSON.stringify({ pid: 2147483647, token: "dead-owner" }), "utf8");
const staleTime = new Date(Date.now() - 120_000);
await fs.utimes(staleLockDir, staleTime, staleTime);
await assert.rejects(
  () => staleStore.commitIfCurrent(0, emptySnapshot),
  error => error?.code === "NEXO_CONTINUITY_STORE_LOCK_STALE_RECOVERY_REQUIRED"
);
assert.equal((await staleStore.loadCurrent()).storeRevision, 0);
assert.equal((await fs.readFile(path.join(staleLockDir, "owner.json"), "utf8")).includes("dead-owner"), true);

await fs.writeFile(filePath, "{broken", "utf8");
await assert.rejects(
  () => store.loadCurrent(),
  error => error?.code === "NEXO_CONTINUITY_STORE_INVALID_JSON",
  "corrupt Nexo continuity must fail closed"
);

await fs.rm(directory, { recursive: true, force: true });
console.log("Nexo-owned continuity store: independent file boundary, strict load, conditional commit and stale-writer conflict OK.");

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
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

const unavailableParentStore = createNexoContinuityStore({
  filePath: path.join(directory, "missing-parent", "continuity.json")
});
assert.deepEqual(
  await unavailableParentStore.initialize(emptySnapshot),
  { status: "failed", code: "NEXO_CONTINUITY_STORE_PARENT_PATH_UNAVAILABLE" },
  "a missing parent path must be a structured store failure, not a raw ENOENT"
);
assert.deepEqual(
  await unavailableParentStore.commitIfCurrent(0, emptySnapshot),
  { status: "failed", code: "NEXO_CONTINUITY_STORE_PARENT_PATH_UNAVAILABLE" },
  "conditional commit must normalize a missing parent before any write"
);
const fileAsParent = path.join(directory, "not-a-directory");
await fs.writeFile(fileAsParent, "file blocks directory traversal", "utf8");
const invalidParentStore = createNexoContinuityStore({ filePath: path.join(fileAsParent, "continuity.json") });
assert.deepEqual(
  await invalidParentStore.initialize(emptySnapshot),
  { status: "failed", code: "NEXO_CONTINUITY_STORE_PARENT_PATH_UNAVAILABLE" },
  "initialize must normalize ENOTDIR as an unavailable parent path"
);
assert.deepEqual(
  await invalidParentStore.commitIfCurrent(0, emptySnapshot),
  { status: "failed", code: "NEXO_CONTINUITY_STORE_PARENT_PATH_UNAVAILABLE" },
  "conditional commit must normalize ENOTDIR as an unavailable parent path"
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

// Failed owner-record creation must not leave a lock directory that blocks future work.
const ownerFailureDir = path.join(directory, "lock-owner-write-failure");
await fs.mkdir(ownerFailureDir);
const ownerFailurePath = path.join(ownerFailureDir, "continuity.json");
const fsWithOwnerWriteFailure = {
  ...fs,
  writeFile: async (file, ...args) => {
    if (String(file).endsWith(path.join("continuity.json.lock", "owner.json"))) {
      throw new Error("simulated lock owner record failure");
    }
    return fs.writeFile(file, ...args);
  }
};
const ownerFailureStore = createNexoContinuityStore({ filePath: ownerFailurePath, fsModule: fsWithOwnerWriteFailure });
assert.deepEqual(
  await ownerFailureStore.initialize(emptySnapshot),
  { status: "failed", code: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED" },
  "Continuity must normalize lock owner-record failures at its store boundary"
);
await assert.rejects(() => fs.access(ownerFailurePath + ".lock"), error => error?.code === "ENOENT");

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

// Cross-process characterization: a live lock owner makes another process wait
// until the lock disappears. This test deliberately does not impose a new timeout
// policy; it records the existing contract gap without changing runtime behavior.
const crossProcessDir = path.join(directory, "cross-process-live-owner");
await fs.mkdir(crossProcessDir);
const crossProcessPath = path.join(crossProcessDir, "continuity.json");
const crossProcessStore = createNexoContinuityStore({ filePath: crossProcessPath });
assert.equal((await crossProcessStore.initialize(emptySnapshot)).status, "committed");
const crossProcessLock = `${crossProcessPath}.lock`;
await fs.mkdir(crossProcessLock);
await fs.writeFile(path.join(crossProcessLock, "owner.json"), JSON.stringify({
  pid: process.pid,
  token: "test-live-owner",
  createdAt: Date.now()
}), "utf8");

const childScript = [
  'const { createNexoContinuityStore } = await import(process.env.NEXO_STORE_MODULE_URL);',
  'process.stdout.write("attempting\\n");',
  'const store = createNexoContinuityStore({ filePath: process.env.NEXO_STORE_FILE });',
  'const snapshot = JSON.parse(process.env.NEXO_STORE_SNAPSHOT);',
  'const result = await store.commitIfCurrent(0, snapshot);',
  'process.stdout.write(JSON.stringify(result) + "\\n");'
].join("\n");
const child = spawn(process.execPath, ["--input-type=module", "-e", childScript], {
  env: {
    ...process.env,
    NEXO_STORE_MODULE_URL: new URL("../../src/nexo/core/continuity-store.mjs", import.meta.url).href,
    NEXO_STORE_FILE: crossProcessPath,
    NEXO_STORE_SNAPSHOT: JSON.stringify(candidateA)
  },
  stdio: ["ignore", "pipe", "pipe"]
});
let childStdout = "";
let childStderr = "";
child.stdout.setEncoding("utf8");
child.stderr.setEncoding("utf8");
child.stdout.on("data", chunk => { childStdout += chunk; });
child.stderr.on("data", chunk => { childStderr += chunk; });
let childExited = false;
const childExit = new Promise((resolve, reject) => {
  child.once("error", reject);
  child.once("exit", (code, signal) => {
    childExited = true;
    resolve({ code, signal });
  });
});
const childStarted = new Promise((resolve, reject) => {
  const deadline = setTimeout(() => reject(new Error("cross-process lock contender did not start")), 5_000);
  const inspect = () => {
    if (childStdout.includes("attempting\n")) {
      clearTimeout(deadline);
      resolve();
    } else if (childExited) {
      clearTimeout(deadline);
      reject(new Error(`cross-process contender exited early: ${childStderr}`));
    }
  };
  child.stdout.on("data", inspect);
  child.once("exit", inspect);
});
await childStarted;
await new Promise(resolve => setTimeout(resolve, 100));
assert.equal(childExited, false,
  "a different process waits while the lock owner PID is alive; no bounded acquisition outcome exists");
await fs.rm(crossProcessLock, { recursive: true, force: true });
const crossProcessTimeout = setTimeout(() => {
  child.kill("SIGKILL");
}, 5_000);
crossProcessTimeout.unref();
const crossProcessExit = await childExit;
clearTimeout(crossProcessTimeout);
assert.deepEqual(crossProcessExit, { code: 0, signal: null }, `cross-process contender should resume after explicit lock removal: ${childStderr}`);
assert.equal((await crossProcessStore.loadCurrent()).storeRevision, 1,
  "the cross-process contender commits only after the existing lock disappears");

// Characterize lock-release failure separately from persistence outcome.
// The injected rm failure is restricted to the lock directory; canonical file reads
// use the real filesystem and therefore independently reveal whether persistence occurred.
async function makeLockReleaseFailureStore(targetPath, persistent = false) {
  let failed = false;
  const fsWithLockReleaseFailure = {
    ...fs,
    rm: async (target, options) => {
      if ((persistent || !failed) && String(target) === targetPath + ".lock") {
        failed = true;
        const error = new Error("simulated lock release failure");
        error.code = "EACCES";
        throw error;
      }
      return fs.rm(target, options);
    }
  };
  return createNexoContinuityStore({ filePath: targetPath, fsModule: fsWithLockReleaseFailure });
}

const releaseInitializeDir = path.join(directory, "lock-release-initialize");
await fs.mkdir(releaseInitializeDir);
const releaseInitializePath = path.join(releaseInitializeDir, "continuity.json");
const releaseInitializeStore = await makeLockReleaseFailureStore(releaseInitializePath);
const releaseInitializeResult = await releaseInitializeStore.initialize(emptySnapshot);
assert.equal(releaseInitializeResult.status, "committed");
assert.deepEqual(releaseInitializeResult.lockRelease, {
  status: "released_after_retry",
  initialCode: "EACCES"
}, "transient cleanup failure must be visible without replacing the persistence outcome");
await assert.rejects(
  () => fs.access(releaseInitializePath + ".lock"),
  error => error?.code === "ENOENT",
  "one retry releases the lock after a transient cleanup failure"
);
assert.equal(
  (await createNexoContinuityStore({ filePath: releaseInitializePath }).loadCurrent()).storeRevision,
  0,
  "independent read proves initialize persisted before lock cleanup failed"
);
const releaseCommitDir = path.join(directory, "lock-release-commit");
await fs.mkdir(releaseCommitDir);
const releaseCommitPath = path.join(releaseCommitDir, "continuity.json");
const releaseCommitBase = createNexoContinuityStore({ filePath: releaseCommitPath });
assert.equal((await releaseCommitBase.initialize(emptySnapshot)).status, "committed");
const releaseCommitStore = await makeLockReleaseFailureStore(releaseCommitPath);
const releaseCommitResult = await releaseCommitStore.commitIfCurrent(0, candidateA);
assert.equal(releaseCommitResult.status, "committed");
assert.deepEqual(releaseCommitResult.lockRelease, {
  status: "released_after_retry",
  initialCode: "EACCES"
}, "conditional commit must preserve its persisted result and disclose recovered cleanup");
const releaseCommitObserved = await createNexoContinuityStore({ filePath: releaseCommitPath }).loadCurrent();
assert.equal(releaseCommitObserved.storeRevision, 1,
  "independent read proves conditional commit persisted before lock cleanup failed");
assert.deepEqual(releaseCommitObserved.snapshot, candidateA);
await assert.rejects(
  () => fs.access(releaseCommitPath + ".lock"),
  error => error?.code === "ENOENT",
  "one retry removes the lock after a transient cleanup failure"
);

const persistentReleaseDir = path.join(directory, "lock-release-persistent-failure");
await fs.mkdir(persistentReleaseDir);
const persistentReleasePath = path.join(persistentReleaseDir, "continuity.json");
const persistentReleaseStore = await makeLockReleaseFailureStore(persistentReleasePath, true);
const persistentReleaseResult = await persistentReleaseStore.initialize(emptySnapshot);
assert.deepEqual(persistentReleaseResult, {
  status: "failed",
  code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
  persistenceStatus: "committed",
  storeRevision: 0,
  lockRelease: {
    status: "failed",
    code: "EACCES",
    initialCode: "EACCES"
  }
}, "persistent cleanup failure must expose persisted state but block successful handoff");
assert.equal((await createNexoContinuityStore({ filePath: persistentReleasePath }).loadCurrent()).storeRevision, 0,
  "independent read confirms canonical persistence despite persistent cleanup failure");
await assert.doesNotReject(
  () => fs.access(persistentReleasePath + ".lock"),
  "persistent cleanup failure leaves a lock requiring explicit recovery"
);
await assert.rejects(
  () => persistentReleaseStore.commitIfCurrent(0, candidateA),
  error => error?.code === "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
  "the same process must fail closed instead of waiting indefinitely behind a lock it failed to release"
);
await fs.rm(persistentReleasePath + ".lock", { recursive: true, force: true });

await fs.writeFile(filePath, "{broken", "utf8");
await assert.rejects(
  () => store.loadCurrent(),
  error => error?.code === "NEXO_CONTINUITY_STORE_INVALID_JSON",
  "corrupt Nexo continuity must fail closed"
);

await fs.rm(directory, { recursive: true, force: true });
console.log("Nexo-owned continuity store: independent file boundary, strict load, conditional commit and stale-writer conflict OK.");

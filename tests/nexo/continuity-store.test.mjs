import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createNexoContinuityStore } from "../../src/nexo/core/continuity-store.mjs";
import { NEXO_RESOURCE_LIMITS, assertContinuityResourceLimits } from "../../src/nexo/core/resource-limits.mjs";
import { NEXO_CONTINUITY_SCHEMA, assertNexoContinuitySnapshot } from "../../src/nexo/core/continuity-snapshot.mjs";

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

// Serialized envelope budget is enforced separately from collection cardinality.
const nearLimitContinuity = {
  ...emptySnapshot,
  missions: Array.from({ length: 63 }, () => ({ payload: "x".repeat(256 * 1024) }))
};
assert.doesNotThrow(() => assertContinuityResourceLimits(nearLimitContinuity, 0),
  "candidate below the serialized Continuity limit remains admissible");
const overLimitContinuity = {
  ...emptySnapshot,
  missions: Array.from({ length: 64 }, () => ({ payload: "x".repeat(256 * 1024) }))
};
assert.throws(() => assertContinuityResourceLimits(overLimitContinuity, 0), {
  code: "NEXO_CONTINUITY_STORE_RESOURCE_LIMIT_EXCEEDED"
}, "candidate above the serialized Continuity limit is rejected");

// Each accepted Continuity collection maximum is inclusive; one additional item fails closed.
for (const [collection, maximum] of Object.entries(NEXO_RESOURCE_LIMITS.continuityCollections)) {
  const atLimit = { ...emptySnapshot, [collection]: Array.from({ length: maximum }, () => null) };
  assert.doesNotThrow(() => assertContinuityResourceLimits(atLimit, 0),
    `${collection} at the accepted maximum is within the resource profile`);
  const overLimit = { ...emptySnapshot, [collection]: Array.from({ length: maximum + 1 }, () => null) };
  assert.throws(() => assertContinuityResourceLimits(overLimit, 0), {
    code: "NEXO_CONTINUITY_STORE_RESOURCE_LIMIT_EXCEEDED"
  }, `${collection} above the accepted maximum is rejected`);
}


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

// Reconcile abandoned temporary files under the existing store lock before
// reusing the one stable temporary path.
await fs.writeFile(filePath + ".tmp-old-process-1", "abandoned", "utf8");
await fs.writeFile(filePath + ".tmp", "abandoned stable temp", "utf8");

const candidateA = { ...emptySnapshot, doNotRepeat: [{ action: "repair_agent_state", target: "alex" }] };
const candidateB = { ...emptySnapshot, doNotRepeat: [{ action: "repair_agent_needs", target: "bruno" }] };
const outcomes = await Promise.all([
  store.commitIfCurrent(0, candidateA),
  store.commitIfCurrent(0, candidateB)
]);
assert.equal(outcomes.filter(result => result.status === "committed").length, 1);
assert.equal(outcomes.filter(result => result.status === "conflict").length, 1);
assert.deepEqual(
  (await fs.readdir(directory)).filter(name => name.startsWith("nexo-continuity.json.tmp")),
  [],
  "successful Continuity write must not leave stable or legacy temporary files"
);
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

// OS-level lock acquisition failures must not leak through either public
// operation: initialize() and commitIfCurrent() share a structured result contract.
const lockAcquisitionFailureDir = path.join(directory, "lock-acquisition-eacces");
await fs.mkdir(lockAcquisitionFailureDir);
const lockAcquisitionFailurePath = path.join(lockAcquisitionFailureDir, "continuity.json");
const fsWithLockAcquisitionFailure = {
  ...fs,
  mkdir: async (target, ...args) => {
    if (String(target) === lockAcquisitionFailurePath + ".lock") {
      const error = new Error("simulated OS lock acquisition denial");
      error.code = "EACCES";
      throw error;
    }
    return fs.mkdir(target, ...args);
  }
};
const lockAcquisitionFailureStore = createNexoContinuityStore({
  filePath: lockAcquisitionFailurePath,
  fsModule: fsWithLockAcquisitionFailure
});
assert.deepEqual(
  await lockAcquisitionFailureStore.initialize(emptySnapshot),
  { status: "failed", code: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED" },
  "initialize must normalize OS lock-acquisition codes behind the Nexo store contract"
);
assert.deepEqual(
  await lockAcquisitionFailureStore.commitIfCurrent(0, emptySnapshot),
  {
    status: "failed",
    code: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED",
    phase: "lock_acquisition",
    writeStarted: false
  },
  "commitIfCurrent must normalize OS lock-acquisition errors like initialize() and confirm no write started"
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

// A present but malformed owner record is not the same as a not-yet-created owner.
const malformedOwnerDir = path.join(directory, "malformed-owner-case");
await fs.mkdir(malformedOwnerDir);
const malformedOwnerPath = path.join(malformedOwnerDir, "continuity.json");
const malformedOwnerLock = malformedOwnerPath + ".lock";
await fs.mkdir(malformedOwnerLock);
await fs.writeFile(path.join(malformedOwnerLock, "owner.json"), "{broken", "utf8");
const malformedOwnerStore = createNexoContinuityStore({ filePath: malformedOwnerPath });
assert.deepEqual(
  await malformedOwnerStore.initialize(emptySnapshot),
  { status: "failed", code: "NEXO_CONTINUITY_STORE_LOCK_STATE_UNKNOWN" },
  "Continuity must stop immediately on an unreadable owner record instead of waiting on ambiguous lock state"
);
await assert.doesNotReject(() => fs.access(malformedOwnerLock),
  "Continuity must preserve the lock when owner identity cannot be established");
await assert.rejects(() => fs.access(malformedOwnerPath), error => error?.code === "ENOENT",
  "Continuity must not initialize when lock ownership is unknown");
// Syntactically valid JSON with an invalid owner schema is equally UNKNOWN.
await fs.writeFile(path.join(malformedOwnerLock, "owner.json"), "42", "utf8");
assert.deepEqual(
  await malformedOwnerStore.initialize(emptySnapshot),
  { status: "failed", code: "NEXO_CONTINUITY_STORE_LOCK_STATE_UNKNOWN" },
  "Continuity must reject valid JSON that lacks a positive PID and non-empty token"
);
await assert.doesNotReject(() => fs.access(malformedOwnerLock),
  "Continuity must preserve the lock when its owner schema is invalid");
await assert.rejects(() => fs.access(malformedOwnerPath), error => error?.code === "ENOENT",
  "Continuity must not initialize under an invalid owner schema");
await fs.rm(malformedOwnerLock, { recursive: true, force: true });

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
assert.deepEqual(
  await staleStore.commitIfCurrent(0, emptySnapshot),
  {
    status: "failed",
    code: "NEXO_CONTINUITY_STORE_LOCK_STALE_RECOVERY_REQUIRED",
    phase: "lock_acquisition",
    writeStarted: false
  },
  "stale lock recovery must remain fail-closed under the shared structured result contract"
);
assert.equal((await staleStore.loadCurrent()).storeRevision, 0);
assert.equal((await fs.readFile(path.join(staleLockDir, "owner.json"), "utf8")).includes("dead-owner"), true);

// Cross-process characterization: a live lock owner makes another process wait
// while the lock is present, then the contender resumes when the lock is explicitly
// removed before the default acquisition budget expires. Timeout behavior is tested below.
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
  "a different process waits while the lock exists and before the default acquisition budget expires");
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
assert.deepEqual(
  await persistentReleaseStore.commitIfCurrent(0, candidateA),
  {
    status: "failed",
    code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
    phase: "lock_acquisition",
    writeStarted: false
  },
  "the same process must return a structured fail-closed result instead of waiting behind a lock it failed to release"
);
await fs.rm(persistentReleasePath + ".lock", { recursive: true, force: true });


/* Conditional-commit write failure classification.
 * Keep these injections at the store boundary: caller-level crash-cut tests
 * do not exercise writeEnvelope()'s rename/re-read branch directly.
 */
const conditionalFailureDir = path.join(directory, "conditional-commit-write-failure");
await fs.mkdir(conditionalFailureDir);
const conditionalFailurePath = path.join(conditionalFailureDir, "continuity.json");
const conditionalFailureBase = createNexoContinuityStore({ filePath: conditionalFailurePath });
assert.equal((await conditionalFailureBase.initialize(emptySnapshot)).status, "committed");
const conditionalBefore = await fs.readFile(conditionalFailurePath, "utf8");
const fsWithConditionalRenameFailure = {
  ...fs,
  rename: async () => { throw Object.assign(new Error("simulated rename failure before replacement"), { code: "EIO" }); }
};
const conditionalFailureStore = createNexoContinuityStore({
  filePath: conditionalFailurePath,
  fsModule: fsWithConditionalRenameFailure
});
assert.deepEqual(
  await conditionalFailureStore.commitIfCurrent(0, candidateA),
  { status: "failed", code: "NEXO_CONTINUITY_STORE_WRITE_FAILED" },
  "a failed conditional rename with the previous canonical revision still readable is a confirmed write failure"
);
assert.equal(await fs.readFile(conditionalFailurePath, "utf8"), conditionalBefore,
  "a confirmed pre-replacement failure leaves the canonical bytes unchanged");

const conditionalLostResponseDir = path.join(directory, "conditional-commit-lost-response");
await fs.mkdir(conditionalLostResponseDir);
const conditionalLostResponsePath = path.join(conditionalLostResponseDir, "continuity.json");
const conditionalLostResponseBase = createNexoContinuityStore({ filePath: conditionalLostResponsePath });
assert.equal((await conditionalLostResponseBase.initialize(emptySnapshot)).status, "committed");
let loseConditionalCommitResponse = true;
const fsWithLostConditionalCommitResponse = {
  ...fs,
  rename: async (from, to) => {
    await fs.rename(from, to);
    if (loseConditionalCommitResponse) {
      loseConditionalCommitResponse = false;
      throw Object.assign(new Error("simulated response lost after conditional rename"), { code: "EIO" });
    }
  }
};
const conditionalLostResponseStore = createNexoContinuityStore({
  filePath: conditionalLostResponsePath,
  fsModule: fsWithLostConditionalCommitResponse
});
assert.deepEqual(
  await conditionalLostResponseStore.commitIfCurrent(0, candidateA),
  { status: "committed", storeRevision: 1, snapshot: candidateA },
  "a lost rename response is committed only when the canonical envelope exactly matches the candidate"
);
const conditionalLostResponseObserved = await conditionalLostResponseBase.loadCurrent();
assert.equal(conditionalLostResponseObserved.storeRevision, 1);
assert.deepEqual(conditionalLostResponseObserved.snapshot, candidateA);

const conditionalUnknownDir = path.join(directory, "conditional-commit-outcome-unknown");
await fs.mkdir(conditionalUnknownDir);
const conditionalUnknownPath = path.join(conditionalUnknownDir, "continuity.json");
const conditionalUnknownBase = createNexoContinuityStore({ filePath: conditionalUnknownPath });
assert.equal((await conditionalUnknownBase.initialize(emptySnapshot)).status, "committed");
let failRecoveryRead = false;
const fsWithUnknownConditionalOutcome = {
  ...fs,
  open: async (target, ...args) => {
    if (failRecoveryRead && String(target) === conditionalUnknownPath) {
      failRecoveryRead = false;
      throw Object.assign(new Error("simulated canonical re-read failure"), { code: "EIO" });
    }
    return fs.open(target, ...args);
  },
  readFile: async (target, ...args) => {
    if (failRecoveryRead && String(target) === conditionalUnknownPath) {
      failRecoveryRead = false;
      throw Object.assign(new Error("simulated canonical re-read failure"), { code: "EIO" });
    }
    return fs.readFile(target, ...args);
  },
  rename: async () => {
    failRecoveryRead = true;
    throw Object.assign(new Error("simulated write failure with unreadable recovery state"), { code: "EIO" });
  }
};
const conditionalUnknownStore = createNexoContinuityStore({
  filePath: conditionalUnknownPath,
  fsModule: fsWithUnknownConditionalOutcome
});
assert.deepEqual(
  await conditionalUnknownStore.commitIfCurrent(0, candidateA),
  { status: "unknown", code: "NEXO_CONTINUITY_STORE_COMMIT_OUTCOME_UNKNOWN" },
  "a write failure followed by an unreadable canonical state must remain UNKNOWN"
);
const conditionalUnknownObserved = await conditionalUnknownBase.loadCurrent();
assert.equal(conditionalUnknownObserved.storeRevision, 0,
  "an independent read shows this injected pre-replacement failure left the old envelope intact");
assert.deepEqual(conditionalUnknownObserved.snapshot, emptySnapshot);

const conditionalReadFailureDir = path.join(directory, "conditional-commit-read-failure");
await fs.mkdir(conditionalReadFailureDir);
const conditionalReadFailurePath = path.join(conditionalReadFailureDir, "continuity.json");
const conditionalReadFailureBase = createNexoContinuityStore({ filePath: conditionalReadFailurePath });
assert.equal((await conditionalReadFailureBase.initialize(emptySnapshot)).status, "committed");
const conditionalReadFailureBefore = await fs.readFile(conditionalReadFailurePath, "utf8");
const fsWithConditionalReadFailure = {
  ...fs,
  open: async (target, ...args) => {
    if (String(target) === conditionalReadFailurePath) {
      throw Object.assign(new Error("simulated canonical envelope read failure inside commit"), { code: "EACCES" });
    }
    return fs.open(target, ...args);
  },
  readFile: async (target, ...args) => {
    if (String(target) === conditionalReadFailurePath) {
      throw Object.assign(new Error("simulated canonical envelope read failure inside commit"), { code: "EACCES" });
    }
    return fs.readFile(target, ...args);
  }
};
const conditionalReadFailureStore = createNexoContinuityStore({
  filePath: conditionalReadFailurePath,
  fsModule: fsWithConditionalReadFailure
});
assert.deepEqual(
  await conditionalReadFailureStore.commitIfCurrent(0, candidateA),
  { status: "unknown", code: "NEXO_CONTINUITY_STORE_READ_FAILED" },
  "a canonical envelope read failure under lock must return UNKNOWN before attempting a write"
);
assert.equal(await fs.readFile(conditionalReadFailurePath, "utf8"), conditionalReadFailureBefore,
  "a failed canonical read must not alter the envelope");

/* Characterize the intentionally mixed public lock-acquisition behavior. */
const lockAcquireErrorDir = path.join(directory, "lock-acquisition-error");
await fs.mkdir(lockAcquireErrorDir);
const lockAcquireErrorPath = path.join(lockAcquireErrorDir, "continuity.json");
const fsWithLockAcquireError = {
  ...fs,
  mkdir: async (target, ...args) => {
    if (String(target) === lockAcquireErrorPath + ".lock") {
      throw Object.assign(new Error("simulated lock acquisition permission error"), { code: "EACCES" });
    }
    return fs.mkdir(target, ...args);
  }
};
const lockAcquireErrorStore = createNexoContinuityStore({
  filePath: lockAcquireErrorPath,
  fsModule: fsWithLockAcquireError
});
assert.deepEqual(
  await lockAcquireErrorStore.initialize(emptySnapshot),
  { status: "failed", code: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED" },
  "initialize normalizes a non-path lock-acquisition error to the Nexo store contract"
);
assert.deepEqual(
  await lockAcquireErrorStore.commitIfCurrent(0, emptySnapshot),
  {
    status: "failed",
    code: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED",
    phase: "lock_acquisition",
    writeStarted: false
  },
  "commitIfCurrent normalizes a non-path lock-acquisition error to the Nexo store contract"
);
await assert.rejects(
  () => fs.access(lockAcquireErrorPath),
  error => error?.code === "ENOENT",
  "lock acquisition failure must not create the canonical envelope"
);

const notOwnedLockDir = path.join(directory, "lock-not-owned-after-commit");
await fs.mkdir(notOwnedLockDir);
const notOwnedLockPath = path.join(notOwnedLockDir, "continuity.json");
const notOwnedBase = createNexoContinuityStore({ filePath: notOwnedLockPath });
assert.equal((await notOwnedBase.initialize(emptySnapshot)).status, "committed");
const fsWithNotOwnedRelease = {
  ...fs,
  readFile: async (target, ...args) => {
    if (String(target) === notOwnedLockPath + ".lock/owner.json") {
      return JSON.stringify({ pid: process.pid, token: "different-owner", createdAt: Date.now() });
    }
    return fs.readFile(target, ...args);
  }
};
const notOwnedStore = createNexoContinuityStore({ filePath: notOwnedLockPath, fsModule: fsWithNotOwnedRelease });
assert.deepEqual(
  await notOwnedStore.commitIfCurrent(0, candidateA),
  {
    status: "failed",
    code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
    persistenceStatus: "committed",
    storeRevision: 1,
    lockRelease: { status: "not_owned" }
  },
  "a not-owned lock release must block successful handoff while preserving confirmed persistence"
);
const notOwnedObserved = await notOwnedBase.loadCurrent();
assert.equal(notOwnedObserved.storeRevision, 1);
assert.deepEqual(notOwnedObserved.snapshot, candidateA);
await fs.rm(notOwnedLockPath + ".lock", { recursive: true, force: true });

const lockStatFailureDir = path.join(directory, "lock-stat-failure");
await fs.mkdir(lockStatFailureDir);
const lockStatFailurePath = path.join(lockStatFailureDir, "continuity.json");
const lockStatFailureLock = lockStatFailurePath + ".lock";
await fs.mkdir(lockStatFailureLock);
await fs.writeFile(path.join(lockStatFailureLock, "owner.json"), JSON.stringify({
  pid: process.pid, token: "known-owner", createdAt: Date.now()
}), "utf8");
const fsWithLockStatFailure = {
  ...fs,
  stat: async (target, ...args) => {
    if (String(target) === lockStatFailureLock) {
      throw Object.assign(new Error("simulated inability to inspect lock age"), { code: "EACCES" });
    }
    return fs.stat(target, ...args);
  }
};
const lockStatFailureStore = createNexoContinuityStore({
  filePath: lockStatFailurePath,
  fsModule: fsWithLockStatFailure
});
assert.deepEqual(
  await lockStatFailureStore.initialize(emptySnapshot),
  { status: "failed", code: "NEXO_CONTINUITY_STORE_LOCK_STATE_UNKNOWN" },
  "if lock age cannot be inspected, acquisition must fail closed instead of retrying indefinitely"
);
await assert.doesNotReject(() => fs.access(lockStatFailureLock),
  "uncertain lock must be preserved for explicit recovery");
await assert.rejects(() => fs.access(lockStatFailurePath), error => error?.code === "ENOENT",
  "lock inspection uncertainty must not initialize the canonical store");
await fs.rm(lockStatFailureLock, { recursive: true, force: true });

// A valid lock held by this live process must time out without initializing or writing.
const timeoutInitPath = path.join(directory, "timeout-initialize", "continuity.json");
await fs.mkdir(path.dirname(timeoutInitPath), { recursive: true });
const timeoutInitLock = timeoutInitPath + ".lock";
await fs.mkdir(timeoutInitLock);
await fs.writeFile(path.join(timeoutInitLock, "owner.json"), JSON.stringify({
  pid: process.pid, token: "timeout-test-owner", createdAt: Date.now()
}), "utf8");
const timeoutInitStore = createNexoContinuityStore({ filePath: timeoutInitPath, lockWaitMs: 25 });
assert.deepEqual(await timeoutInitStore.initialize(emptySnapshot), {
  status: "failed",
  code: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT",
  phase: "lock_acquisition",
  writeStarted: false
});
await assert.rejects(() => fs.access(timeoutInitPath), error => error?.code === "ENOENT");
await fs.rm(timeoutInitLock, { recursive: true, force: true });

// A timeout while conditionally committing preserves the existing canonical revision.
const timeoutCommitPath = path.join(directory, "timeout-commit", "continuity.json");
await fs.mkdir(path.dirname(timeoutCommitPath), { recursive: true });
const timeoutCommitBase = createNexoContinuityStore({ filePath: timeoutCommitPath });
assert.equal((await timeoutCommitBase.initialize(emptySnapshot)).status, "committed");
const timeoutCommitLock = timeoutCommitPath + ".lock";
await fs.mkdir(timeoutCommitLock);
await fs.writeFile(path.join(timeoutCommitLock, "owner.json"), JSON.stringify({
  pid: process.pid, token: "timeout-test-owner", createdAt: Date.now()
}), "utf8");
const timeoutCommitStore = createNexoContinuityStore({ filePath: timeoutCommitPath, lockWaitMs: 25 });
assert.deepEqual(await timeoutCommitStore.commitIfCurrent(0, emptySnapshot), {
  status: "failed",
  code: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT",
  phase: "lock_acquisition",
  writeStarted: false
});
assert.equal((await timeoutCommitBase.loadCurrent()).storeRevision, 0);
await fs.rm(timeoutCommitLock, { recursive: true, force: true });

// If mkdir resolves after the deadline, the store must release its own late lock and never write.
const lateAcquirePath = path.join(directory, "late-acquire", "continuity.json");
await fs.mkdir(path.dirname(lateAcquirePath), { recursive: true });
const lateAcquireLock = lateAcquirePath + ".lock";
const fsWithLateLockAcquire = {
  ...fs,
  mkdir: async (target, ...args) => {
    if (String(target) === lateAcquireLock) await new Promise(resolve => setTimeout(resolve, 40));
    return fs.mkdir(target, ...args);
  }
};
const lateAcquireStore = createNexoContinuityStore({
  filePath: lateAcquirePath, fsModule: fsWithLateLockAcquire, lockWaitMs: 20
});
assert.deepEqual(await lateAcquireStore.initialize(emptySnapshot), {
  status: "failed",
  code: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT",
  phase: "lock_acquisition",
  writeStarted: false,
  lockRelease: { status: "released" }
});
await assert.rejects(() => fs.access(lateAcquirePath), error => error?.code === "ENOENT");
await assert.rejects(() => fs.access(lateAcquireLock), error => error?.code === "ENOENT");

// A late-acquired lock that cannot be released must report both facts, not claim cleanup.
const lateReleaseFailurePath = path.join(directory, "late-release-failure", "continuity.json");
await fs.mkdir(path.dirname(lateReleaseFailurePath), { recursive: true });
const lateReleaseFailureLock = lateReleaseFailurePath + ".lock";
const fsWithLateAcquireReleaseFailure = {
  ...fs,
  mkdir: async (target, ...args) => {
    if (String(target) === lateReleaseFailureLock) await new Promise(resolve => setTimeout(resolve, 40));
    return fs.mkdir(target, ...args);
  },
  rm: async (target, ...args) => {
    if (String(target) === lateReleaseFailureLock) {
      throw Object.assign(new Error("simulated late-lock release failure"), { code: "EACCES" });
    }
    return fs.rm(target, ...args);
  }
};
const lateReleaseFailureStore = createNexoContinuityStore({
  filePath: lateReleaseFailurePath, fsModule: fsWithLateAcquireReleaseFailure, lockWaitMs: 20
});
assert.deepEqual(await lateReleaseFailureStore.initialize(emptySnapshot), {
  status: "failed",
  code: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT",
  phase: "lock_acquisition",
  writeStarted: false,
  lockRelease: {
    status: "failed",
    code: "EACCES",
    initialCode: "EACCES"
  }
});
await assert.rejects(() => fs.access(lateReleaseFailurePath), error => error?.code === "ENOENT");
await fs.rm(lateReleaseFailureLock, { recursive: true, force: true });

// Oversized but structurally valid candidate must be rejected before mutation.
const oversizedCandidateDirectory = path.join(directory, "oversized-candidate-no-mutation");
await fs.mkdir(oversizedCandidateDirectory);
const oversizedCandidatePath = path.join(oversizedCandidateDirectory, "continuity.json");
const oversizedCandidateStore = createNexoContinuityStore({ filePath: oversizedCandidatePath });
assert.equal((await oversizedCandidateStore.initialize(emptySnapshot)).status, "committed");
const oversizedCandidateBytesBefore = await fs.readFile(oversizedCandidatePath);
const oversizedValidSnapshot = {
  ...emptySnapshot,
  doNotRepeat: [{ payload: "x".repeat(NEXO_RESOURCE_LIMITS.continuityDocumentBytes) }]
};
const oversizedCandidateResult = await oversizedCandidateStore.commitIfCurrent(0, oversizedValidSnapshot);
assert.deepEqual(oversizedCandidateResult, {
  status: "failed",
  code: "NEXO_CONTINUITY_STORE_RESOURCE_LIMIT_EXCEEDED"
}, "oversized valid snapshot candidate must fail with a known capacity result");
assert.deepEqual(await fs.readFile(oversizedCandidatePath), oversizedCandidateBytesBefore,
  "oversized candidate must preserve the canonical file byte-for-byte");
assert.equal((await oversizedCandidateStore.loadCurrent()).storeRevision, 0,
  "oversized candidate must not advance the canonical revision");

// Two valid near-limit candidates racing on the same revision cannot both be admitted.
const concurrentCapacityDirectory = path.join(directory, "concurrent-near-limit-capacity");
await fs.mkdir(concurrentCapacityDirectory);
const concurrentCapacityPath = path.join(concurrentCapacityDirectory, "continuity.json");
const concurrentCapacityStore = createNexoContinuityStore({ filePath: concurrentCapacityPath });
assert.equal((await concurrentCapacityStore.initialize(emptySnapshot)).status, "committed");
const nearLimitPayloadBytes = 14 * 1024 * 1024;
const nearLimitCandidateA = {
  ...emptySnapshot,
  doNotRepeat: [{ payload: "a".repeat(nearLimitPayloadBytes) }]
};
const nearLimitCandidateB = {
  ...emptySnapshot,
  doNotRepeat: [{ payload: "b".repeat(nearLimitPayloadBytes) }]
};
assert.doesNotThrow(() => assertContinuityResourceLimits(nearLimitCandidateA, 1));
assert.doesNotThrow(() => assertContinuityResourceLimits(nearLimitCandidateB, 1));
const concurrentCapacityOutcomes = await Promise.all([
  concurrentCapacityStore.commitIfCurrent(0, nearLimitCandidateA),
  concurrentCapacityStore.commitIfCurrent(0, nearLimitCandidateB)
]);
assert.equal(concurrentCapacityOutcomes.filter(result => result.status === "committed").length, 1,
  "exactly one near-limit concurrent candidate may commit against the same revision");
assert.equal(concurrentCapacityOutcomes.filter(result => result.status === "conflict").length, 1,
  "the losing near-limit candidate must observe a revision conflict");
const concurrentCapacityFinal = await concurrentCapacityStore.loadCurrent();
assert.equal(concurrentCapacityFinal.storeRevision, 1,
  "concurrent near-limit writes must advance the revision exactly once");
const concurrentCapacityWinner = concurrentCapacityOutcomes.find(result => result.status === "committed");
assert.ok(concurrentCapacityWinner, "one concurrent capacity candidate must report a committed result");
assert.equal(concurrentCapacityWinner.storeRevision, concurrentCapacityFinal.storeRevision,
  "the reported committed revision must match the revision reloaded from disk");
assert.deepEqual(concurrentCapacityWinner.snapshot, concurrentCapacityFinal.snapshot,
  "the reported committed snapshot must match the canonical snapshot reloaded from disk");
const concurrentCapacityRaw = await fs.readFile(concurrentCapacityPath, "utf8");
const concurrentCapacityExpectedRaw = JSON.stringify({
  schema: "NEXO_CONTINUITY_STORE",
  schemaVersion: 1,
  storeRevision: concurrentCapacityFinal.storeRevision,
  snapshot: concurrentCapacityFinal.snapshot
}, null, 2) + "\n";
assert.equal(concurrentCapacityRaw, concurrentCapacityExpectedRaw,
  "persisted bytes must exactly encode the confirmed committed revision and snapshot");
assert.ok(
  Buffer.byteLength(JSON.stringify({
    schema: "NEXO_CONTINUITY_STORE",
    schemaVersion: 1,
    storeRevision: concurrentCapacityFinal.storeRevision,
    snapshot: concurrentCapacityFinal.snapshot
  }, null, 2) + "\\n", "utf8") <= NEXO_RESOURCE_LIMITS.continuityDocumentBytes,
  "the committed envelope must remain within the serialized byte budget"
);
assert.ok(
  ["a", "b"].includes(concurrentCapacityFinal.snapshot.doNotRepeat[0].payload[0]),
  "the final snapshot must equal one complete candidate, never a merged or partial write"
);

const oversizedContinuityPath = path.join(directory, "oversized-existing-continuity.json");
await fs.writeFile(oversizedContinuityPath, Buffer.alloc(NEXO_RESOURCE_LIMITS.continuityDocumentBytes + 1, 0x20));
const oversizedContinuityBefore = await fs.stat(oversizedContinuityPath);
await assert.rejects(
  () => createNexoContinuityStore({ filePath: oversizedContinuityPath }).loadCurrent(),
  error => error?.code === "NEXO_CONTINUITY_STORE_RESOURCE_LIMIT_EXCEEDED",
  "Continuity must reject oversized raw bytes before attempting JSON.parse"
);
assert.equal((await fs.stat(oversizedContinuityPath)).size, oversizedContinuityBefore.size,
  "oversized Continuity bytes remain unchanged");

// A structurally valid candidate that exceeds the serialized snapshot budget must be
// rejected before lock acquisition or persistence, preserving the exact prior envelope.
const oversizedValidSnapshotPath = path.join(directory, "oversized-valid-candidate.json");
const oversizedValidSnapshotStore = createNexoContinuityStore({ filePath: oversizedValidSnapshotPath });
assert.deepEqual(
  await oversizedValidSnapshotStore.initialize(emptySnapshot),
  { status: "committed", storeRevision: 0, snapshot: emptySnapshot }
);
const oversizedValidBytesBefore = await fs.readFile(oversizedValidSnapshotPath);
const oversizedValidCandidate = {
  ...emptySnapshot,
  // Each mission stays inside the per-mission admission budget; the collection
  // collectively exceeds the serialized store budget. This isolates the store
  // envelope ceiling from the mission admission ceiling.
  missions: Array.from({ length: 65 }, (_, missionIndex) => ({
    missionId: `oversized-valid-mission-${missionIndex}`,
    steps: [{
      id: "step-1",
      action: "noop",
      context: "x".repeat(256 * 1024),
      dependsOn: []
    }]
  }))
};
assert.doesNotThrow(
  () => assertNexoContinuitySnapshot(oversizedValidCandidate),
  "oversized candidate must be structurally valid so this test exercises the resource boundary"
);
const oversizedValidResult = await oversizedValidSnapshotStore.commitIfCurrent(0, oversizedValidCandidate);
assert.deepEqual(
  oversizedValidResult,
  { status: "failed", code: "NEXO_CONTINUITY_STORE_RESOURCE_LIMIT_EXCEEDED" },
  "a structurally valid candidate above the serialized Continuity budget must be rejected"
);
assert.deepEqual(
  await fs.readFile(oversizedValidSnapshotPath),
  oversizedValidBytesBefore,
  "rejected oversized candidate must preserve the existing envelope byte-for-byte"
);
assert.equal(
  (await oversizedValidSnapshotStore.loadCurrent()).storeRevision,
  0,
  "rejected oversized candidate must not advance the canonical revision"
);
await assert.rejects(
  () => fs.access(oversizedValidSnapshotPath + ".lock"),
  error => error?.code === "ENOENT",
  "known resource excess must be rejected before creating a lock"
);

await fs.writeFile(filePath, "{broken", "utf8");
await assert.rejects(
  () => store.loadCurrent(),
  error => error?.code === "NEXO_CONTINUITY_STORE_INVALID_JSON",
  "corrupt Nexo continuity must fail closed"
);

await fs.rm(directory, { recursive: true, force: true });
console.log("Nexo-owned continuity store: independent file boundary, strict load, conditional commit and stale-writer conflict OK.");

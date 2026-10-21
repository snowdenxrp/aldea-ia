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
  const unavailableParentStore = createNexoChronicleStore({
    filePath: path.join(root, "missing-parent", "chronicle.json")
  });
  assert.deepEqual(
    await unavailableParentStore.append({ operationKey: "mission-missing-parent:step-1", content: "must not write" }),
    { status: "blocked", code: "NEXO_CHRONICLE_PARENT_PATH_UNAVAILABLE" },
    "append must normalize a missing parent before any Chronicle write"
  );
  const fileAsParent = path.join(root, "not-a-directory");
  await fs.writeFile(fileAsParent, "file blocks directory traversal", "utf8");
  const invalidParentStore = createNexoChronicleStore({ filePath: path.join(fileAsParent, "chronicle.json") });
  assert.deepEqual(
    await invalidParentStore.initialize(),
    { status: "blocked", code: "NEXO_CHRONICLE_PARENT_PATH_UNAVAILABLE" },
    "initialize must normalize ENOTDIR as an unavailable parent path"
  );
  assert.deepEqual(
    await invalidParentStore.append({ operationKey: "mission-invalid-parent:step-1", content: "must not write" }),
    { status: "blocked", code: "NEXO_CHRONICLE_PARENT_PATH_UNAVAILABLE" },
    "append must normalize ENOTDIR as an unavailable parent path"
  );
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

  // Failed lock owner-record creation must clean up the directory created by this process.
  const ownerFailurePath = path.join(root, "owner-write-failure.json");
  const fsWithOwnerWriteFailure = {
    ...fs,
    writeFile: async (file, ...args) => {
      if (String(file).endsWith(path.join("owner-write-failure.json.lock", "owner.json"))) {
        throw new Error("simulated lock owner record failure");
      }
      return fs.writeFile(file, ...args);
    }
  };
  const ownerFailureStore = createNexoChronicleStore({ filePath: ownerFailurePath, fsModule: fsWithOwnerWriteFailure });
  assert.deepEqual(
    await ownerFailureStore.initialize(),
    { status: "blocked", code: "NEXO_CHRONICLE_LOCK_ACQUISITION_FAILED" },
    "Chronicle must normalize lock owner-record failures at its store boundary"
  );
  await assert.rejects(() => fs.access(String(ownerFailurePath) + ".lock"), error => error?.code === "ENOENT");

  // If the existing lock's age cannot be inspected, fail closed rather than wait forever.
  const lockStatFailurePath = path.join(root, "lock-stat-failure.json");
  const lockStatFailureLock = String(lockStatFailurePath) + ".lock";
  await fs.mkdir(lockStatFailureLock);
  await fs.writeFile(path.join(lockStatFailureLock, "owner.json"), JSON.stringify({
    pid: process.pid, token: "known-owner"
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
  const lockStatFailureStore = createNexoChronicleStore({
    filePath: lockStatFailurePath,
    fsModule: fsWithLockStatFailure
  });
  assert.deepEqual(
    await lockStatFailureStore.initialize(),
    { status: "blocked", code: "NEXO_CHRONICLE_LOCK_STATE_UNKNOWN" },
    "Chronicle must fail closed when it cannot inspect an existing lock"
  );
  await assert.doesNotReject(() => fs.access(lockStatFailureLock),
    "Chronicle must preserve an uninspectable lock for explicit recovery");
  await assert.rejects(() => fs.access(lockStatFailurePath), error => error?.code === "ENOENT",
    "Chronicle must not initialize when lock state is unknown");
  await fs.rm(lockStatFailureLock, { recursive: true, force: true });

  // A present but malformed owner record is not the same as a not-yet-created owner.
  const malformedOwnerPath = path.join(root, "malformed-owner.json");
  const malformedOwnerLock = String(malformedOwnerPath) + ".lock";
  await fs.mkdir(malformedOwnerLock);
  await fs.writeFile(path.join(malformedOwnerLock, "owner.json"), "{broken", "utf8");
  const malformedOwnerStore = createNexoChronicleStore({ filePath: malformedOwnerPath });
  assert.deepEqual(
    await malformedOwnerStore.initialize(),
    { status: "blocked", code: "NEXO_CHRONICLE_LOCK_STATE_UNKNOWN" },
    "Chronicle must stop immediately on an unreadable owner record instead of waiting on ambiguous lock state"
  );
  await assert.doesNotReject(() => fs.access(malformedOwnerLock),
    "Chronicle must preserve the lock when owner identity cannot be established");
  await assert.rejects(() => fs.access(malformedOwnerPath), error => error?.code === "ENOENT",
    "Chronicle must not initialize when lock ownership is unknown");
  // Syntactically valid JSON with an invalid owner schema is equally UNKNOWN.
  await fs.writeFile(path.join(malformedOwnerLock, "owner.json"), "42", "utf8");
  assert.deepEqual(
    await malformedOwnerStore.initialize(),
    { status: "blocked", code: "NEXO_CHRONICLE_LOCK_STATE_UNKNOWN" },
    "Chronicle must reject valid JSON that lacks a positive PID and non-empty token"
  );
  await assert.doesNotReject(() => fs.access(malformedOwnerLock),
    "Chronicle must preserve the lock when its owner schema is invalid");
  await assert.rejects(() => fs.access(malformedOwnerPath), error => error?.code === "ENOENT",
    "Chronicle must not initialize under an invalid owner schema");
  await fs.rm(malformedOwnerLock, { recursive: true, force: true });

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

  // A committed append must not be reported as a successful handoff if this process no longer owns the lock.
  const notOwnedReleasePath = path.join(root, "not-owned-release.json");
  const notOwnedReleaseBase = createNexoChronicleStore({ filePath: notOwnedReleasePath });
  assert.equal((await notOwnedReleaseBase.initialize()).status, "committed");
  const notOwnedReleaseLock = String(notOwnedReleasePath) + ".lock";
  const fsWithNotOwnedRelease = {
    ...fs,
    readFile: async (target, ...args) => {
      if (String(target) === path.join(notOwnedReleaseLock, "owner.json")) {
        return JSON.stringify({ pid: process.pid, token: "different-owner" });
      }
      return fs.readFile(target, ...args);
    }
  };
  const notOwnedReleaseStore = createNexoChronicleStore({
    filePath: notOwnedReleasePath,
    fsModule: fsWithNotOwnedRelease
  });
  assert.deepEqual(
    await notOwnedReleaseStore.append({ operationKey: "not-owned-release:1", content: "persist but block handoff" }),
    {
      status: "blocked",
      code: "NEXO_CHRONICLE_LOCK_RELEASE_FAILED",
      persistenceStatus: "committed",
      storeRevision: 1,
      lockRelease: { status: "not_owned" }
    },
    "Chronicle must disclose confirmed persistence while blocking handoff when lock ownership cannot be confirmed"
  );
  const notOwnedReleaseObserved = await notOwnedReleaseBase.loadCurrent();
  assert.equal(notOwnedReleaseObserved.storeRevision, 1);
  assert.deepEqual(notOwnedReleaseObserved.entries, [
    { operationKey: "not-owned-release:1", content: "persist but block handoff" }
  ]);
  await assert.doesNotReject(() => fs.access(notOwnedReleaseLock),
    "Chronicle must not delete a lock whose owner token does not match");
  await fs.rm(notOwnedReleaseLock, { recursive: true, force: true });

  // Persistent cleanup failure must preserve the commit fact but block the public handoff.
  const releaseFailurePath = path.join(root, "release-failure.json");
  const releaseFailureBase = createNexoChronicleStore({ filePath: releaseFailurePath });
  assert.equal((await releaseFailureBase.initialize()).status, "committed");
  const releaseFailureLock = String(releaseFailurePath) + ".lock";
  const fsWithReleaseFailure = {
    ...fs,
    rm: async (target, ...args) => {
      if (String(target) === releaseFailureLock) {
        throw Object.assign(new Error("simulated lock cleanup permission error"), { code: "EACCES" });
      }
      return fs.rm(target, ...args);
    }
  };
  const releaseFailureStore = createNexoChronicleStore({
    filePath: releaseFailurePath,
    fsModule: fsWithReleaseFailure
  });
  assert.deepEqual(
    await releaseFailureStore.append({ operationKey: "release-failure:1", content: "persist despite cleanup failure" }),
    {
      status: "blocked",
      code: "NEXO_CHRONICLE_LOCK_RELEASE_FAILED",
      persistenceStatus: "committed",
      storeRevision: 1,
      lockRelease: { status: "failed", code: "EACCES" }
    },
    "a lock cleanup error must not be mistaken for successful transaction handoff"
  );
  const releaseFailureObserved = await releaseFailureBase.loadCurrent();
  assert.equal(releaseFailureObserved.storeRevision, 1);
  assert.deepEqual(releaseFailureObserved.entries, [
    { operationKey: "release-failure:1", content: "persist despite cleanup failure" }
  ]);
  await assert.doesNotReject(() => fs.access(releaseFailureLock),
    "failed cleanup leaves the lock for explicit recovery");
  await fs.rm(releaseFailureLock, { recursive: true, force: true });

  // Initialization can also lose its response after the atomic rename. Re-read the
  // exact persisted empty envelope before deciding whether bootstrap failed.
  const lostInitializePath = path.join(root, "lost-initialize-response.json");
  let loseInitializeRename = true;
  const fsWithLostInitializeResponse = {
    ...fs,
    rename: async (from, to) => {
      await fs.rename(from, to);
      if (loseInitializeRename) {
        loseInitializeRename = false;
        throw new Error("simulated initialization response lost after rename");
      }
    }
  };
  const lostInitializer = createNexoChronicleStore({
    filePath: lostInitializePath,
    fsModule: fsWithLostInitializeResponse
  });
  assert.deepEqual(await lostInitializer.initialize(), {
    status: "committed",
    storeRevision: 0,
    entries: []
  }, "a matching persisted Chronicle envelope confirms initialization despite a lost response");
  assert.deepEqual(await createNexoChronicleStore({
    filePath: lostInitializePath
  }).loadCurrent(), {
    status: "loaded",
    storeRevision: 0,
    entries: []
  });

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

  // A live lock beyond the configured budget blocks initialization before any write.
  const timeoutInitPath = path.join(root, "timeout-initialize.json");
  const timeoutInitLock = timeoutInitPath + ".lock";
  await fs.mkdir(timeoutInitLock);
  await fs.writeFile(path.join(timeoutInitLock, "owner.json"), JSON.stringify({
    pid: process.pid, token: "timeout-test-owner"
  }), "utf8");
  const timeoutInitStore = createNexoChronicleStore({ filePath: timeoutInitPath, lockWaitMs: 25 });
  assert.deepEqual(await timeoutInitStore.initialize(), {
    status: "blocked",
    code: "NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT",
    phase: "lock_acquisition",
    writeStarted: false
  });
  await assert.rejects(() => fs.access(timeoutInitPath), error => error?.code === "ENOENT");
  await fs.rm(timeoutInitLock, { recursive: true, force: true });

  // Append timeout must not mutate the canonical document or claim an append.
  const timeoutAppendPath = path.join(root, "timeout-append.json");
  const timeoutAppendBase = createNexoChronicleStore({ filePath: timeoutAppendPath });
  assert.equal((await timeoutAppendBase.initialize()).status, "committed");
  const timeoutAppendLock = timeoutAppendPath + ".lock";
  await fs.mkdir(timeoutAppendLock);
  await fs.writeFile(path.join(timeoutAppendLock, "owner.json"), JSON.stringify({
    pid: process.pid, token: "timeout-test-owner"
  }), "utf8");
  const timeoutAppendStore = createNexoChronicleStore({ filePath: timeoutAppendPath, lockWaitMs: 25 });
  assert.deepEqual(await timeoutAppendStore.append({
    operationKey: "timeout-operation",
    content: "must not be appended"
  }), {
    status: "blocked",
    code: "NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT",
    phase: "lock_acquisition",
    writeStarted: false
  });
  const timeoutAppendObserved = await timeoutAppendBase.loadCurrent();
  assert.equal(timeoutAppendObserved.storeRevision, 0);
  assert.deepEqual(timeoutAppendObserved.entries, []);
  await fs.rm(timeoutAppendLock, { recursive: true, force: true });

  // If mkdir resolves after the deadline, release only the newly acquired lock and do not initialize.
  const lateAcquirePath = path.join(root, "late-acquire.json");
  const lateAcquireLock = lateAcquirePath + ".lock";
  const fsWithLateLockAcquire = {
    ...fs,
    mkdir: async (target, ...args) => {
      if (String(target) === lateAcquireLock) await new Promise(resolve => setTimeout(resolve, 40));
      return fs.mkdir(target, ...args);
    }
  };
  const lateAcquireStore = createNexoChronicleStore({
    filePath: lateAcquirePath, fsModule: fsWithLateLockAcquire, lockWaitMs: 20
  });
  assert.deepEqual(await lateAcquireStore.initialize(), {
    status: "blocked",
    code: "NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT",
    phase: "lock_acquisition",
    writeStarted: false,
    lockRelease: { status: "released" }
  });
  await assert.rejects(() => fs.access(lateAcquirePath), error => error?.code === "ENOENT");
  await assert.rejects(() => fs.access(lateAcquireLock), error => error?.code === "ENOENT");

  // If releasing a late-acquired lock fails, preserve that uncertainty alongside timeout.
  const lateReleaseFailurePath = path.join(root, "late-release-failure.json");
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
  const lateReleaseFailureStore = createNexoChronicleStore({
    filePath: lateReleaseFailurePath, fsModule: fsWithLateAcquireReleaseFailure, lockWaitMs: 20
  });
  assert.deepEqual(await lateReleaseFailureStore.initialize(), {
    status: "blocked",
    code: "NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT",
    phase: "lock_acquisition",
    writeStarted: false,
    lockRelease: { status: "failed", code: "EACCES" }
  });
  await assert.rejects(() => fs.access(lateReleaseFailurePath), error => error?.code === "ENOENT");
  await fs.rm(lateReleaseFailureLock, { recursive: true, force: true });

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

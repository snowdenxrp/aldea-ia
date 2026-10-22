import fs from "node:fs/promises";
import path from "node:path";
import { NEXO_DEFAULT_LOCK_WAIT_MS, resolveNexoLockDeadline, remainingNexoLockWaitMs, nexoLockDeadlineExpired } from "./lock-deadline.mjs";
import { assertNexoContinuitySnapshot } from "./continuity-snapshot.mjs";
import { NEXO_RESOURCE_LIMITS, readUtf8FileBounded, serializedUtf8Bytes, assertContinuityResourceLimits } from "./resource-limits.mjs";

export const NEXO_CONTINUITY_STORE_SCHEMA = "NEXO_CONTINUITY_STORE";
export const NEXO_CONTINUITY_STORE_VERSION = 1;

const LOCK_RETRY_MS = 10;
const LOCK_STALE_MS = 60_000;
const lockReleaseFailures = new Set();

function storeError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function lockPathFor(filePath) {
  return `${filePath}.lock`;
}

function processIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (error) { return error?.code === "EPERM"; }
}

async function readLockOwner(fsModule, lockPath) {
  try { return JSON.parse(await fsModule.readFile(path.join(lockPath, "owner.json"), "utf8")); }
  catch { return null; }
}

async function acquireLock(fsModule, filePath, deadlineAt, timeoutCode) {
  const lockPath = lockPathFor(filePath);
  if (lockReleaseFailures.has(lockPath)) {
    try {
      await fsModule.access(lockPath);
      throw storeError("NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      // Explicit external cleanup removed the previously failed lock.
      lockReleaseFailures.delete(lockPath);
    }
  }
  const token = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const owner = { pid: process.pid, token, createdAt: Date.now() };
  while (true) {
    if (nexoLockDeadlineExpired(deadlineAt)) throw storeError(timeoutCode);
    try {
      await fsModule.mkdir(lockPath);
      try {
        await fsModule.writeFile(path.join(lockPath, "owner.json"), JSON.stringify(owner), "utf8");
      } catch (error) {
        // This process created the lock directory; remove its incomplete lock
        // before propagating owner-record creation failure.
        await fsModule.rm(lockPath, { recursive: true, force: true }).catch(() => {});
        throw error;
      }
      const release = async () => {
        const current = await readLockOwner(fsModule, lockPath);
        if (current?.token !== token) return { status: "not_owned" };
        try {
          await fsModule.rm(lockPath, { recursive: true, force: true });
          lockReleaseFailures.delete(lockPath);
          return { status: "released" };
        } catch (firstError) {
          // A transient cleanup failure must not erase the already-determined
          // persistence result. Retry cleanup once, and expose the recovery.
          try {
            await fsModule.rm(lockPath, { recursive: true, force: true });
            lockReleaseFailures.delete(lockPath);
            return {
              status: "released_after_retry",
              initialCode: firstError?.code ?? "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED"
            };
          } catch (secondError) {
            lockReleaseFailures.add(lockPath);
            return {
              status: "failed",
              code: secondError?.code ?? "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
              initialCode: firstError?.code ?? "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED"
            };
          }
        }
      };
      if (nexoLockDeadlineExpired(deadlineAt)) {
        const timeout = storeError(timeoutCode);
        timeout.lockRelease = await release();
        throw timeout;
      }
      return release;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      let current = await readLockOwner(fsModule, lockPath);
      if (!current) {
        let rawOwner;
        try { rawOwner = await fsModule.readFile(path.join(lockPath, "owner.json"), "utf8"); }
        catch (error) {
          // A lock creator may still be writing owner.json; retry only when absent.
          if (error?.code === "ENOENT") continue;
          throw storeError("NEXO_CONTINUITY_STORE_LOCK_STATE_UNKNOWN");
        }
        try { current = JSON.parse(rawOwner); }
        catch { throw storeError("NEXO_CONTINUITY_STORE_LOCK_STATE_UNKNOWN"); }
      }
      if (!current || typeof current !== "object" || Array.isArray(current) ||
          !Number.isSafeInteger(current.pid) || current.pid <= 0 ||
          typeof current.token !== "string" || !current.token.trim()) {
        throw storeError("NEXO_CONTINUITY_STORE_LOCK_STATE_UNKNOWN");
      }
      let age;
      try { age = Date.now() - (await fsModule.stat(lockPath)).mtimeMs; }
      catch (error) {
        // The owner may have released the lock after mkdir returned EEXIST.
        // Retry that race; other inspection errors make lock state unknown.
        if (error?.code === "ENOENT") continue;
        throw storeError("NEXO_CONTINUITY_STORE_LOCK_STATE_UNKNOWN");
      }
      const stale = current
        ? age > LOCK_STALE_MS && !processIsAlive(Number(current.pid))
        : age > LOCK_STALE_MS;
      if (stale) {
        // Check-then-rm can delete a newer lock created by a competing reaper.
        // Do not reclaim automatically; fail closed for explicit recovery.
        throw storeError("NEXO_CONTINUITY_STORE_LOCK_STALE_RECOVERY_REQUIRED");
      }
      const remainingMs = remainingNexoLockWaitMs(deadlineAt);
      if (remainingMs <= 0) throw storeError(timeoutCode);
      await new Promise(resolve => setTimeout(resolve, Math.min(LOCK_RETRY_MS, remainingMs)));
    }
  }
}

function validateEnvelope(envelope) {
  if (!envelope || typeof envelope !== "object" || Array.isArray(envelope) ||
      envelope.schema !== NEXO_CONTINUITY_STORE_SCHEMA ||
      envelope.schemaVersion !== NEXO_CONTINUITY_STORE_VERSION ||
      !Number.isSafeInteger(envelope.storeRevision) || envelope.storeRevision < 0 ||
      !envelope.snapshot || typeof envelope.snapshot !== "object") {
    throw storeError("NEXO_CONTINUITY_STORE_SCHEMA_UNKNOWN");
  }
  assertNexoContinuitySnapshot(envelope.snapshot);
  assertContinuityResourceLimits(envelope.snapshot, envelope.storeRevision);
  return envelope;
}

async function readEnvelope(fsModule, filePath) {
  let raw;
  try { raw = await readUtf8FileBounded(fsModule, filePath, NEXO_RESOURCE_LIMITS.continuityDocumentBytes, "NEXO_CONTINUITY_STORE_RESOURCE_LIMIT_EXCEEDED"); }
  catch (error) {
    throw storeError(error?.code === "ENOENT" ? "NEXO_CONTINUITY_STORE_NOT_FOUND" : error?.code === "NEXO_CONTINUITY_STORE_RESOURCE_LIMIT_EXCEEDED" ? error.code : "NEXO_CONTINUITY_STORE_READ_FAILED");
  }
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { throw storeError("NEXO_CONTINUITY_STORE_INVALID_JSON"); }
  return validateEnvelope(parsed);
}

async function removeStaleTemporaryFiles(fsModule, filePath) {
  const directory = path.dirname(filePath);
  const baseName = path.basename(filePath);
  const legacyPrefix = `${baseName}.tmp-`;
  const stableTempName = `${baseName}.tmp`;
  const entries = await fsModule.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || (entry.name !== stableTempName && !entry.name.startsWith(legacyPrefix))) continue;
    await fsModule.rm(path.join(directory, entry.name), { force: true });
  }
}

async function writeEnvelope(fsModule, filePath, envelope) {
  assertContinuityResourceLimits(envelope.snapshot, envelope.storeRevision);
  if (serializedUtf8Bytes(envelope) > NEXO_RESOURCE_LIMITS.continuityDocumentBytes) {
    throw storeError("NEXO_CONTINUITY_STORE_RESOURCE_LIMIT_EXCEEDED");
  }
  const tempPath = `${filePath}.tmp`;
  try {
    // This writer already holds the store lock: clean abandoned stable/legacy
    // temporaries, then reuse one bounded temporary path.
    await removeStaleTemporaryFiles(fsModule, filePath);
    await fsModule.writeFile(tempPath, JSON.stringify(envelope, null, 2) + "\n", "utf8");
    await fsModule.rename(tempPath, filePath);
  } catch (error) {
    await fsModule.rm(tempPath, { force: true }).catch(() => {});
    throw error;
  }
}

/**
 * Nexo-owned operational continuity file store.
 *
 * The store is independent of Lúmina's world-state lifecycle. storeRevision
 * coordinates cooperating local writers only; it is not authority, a global
 * fence, rollback protection, or proof of external-effect truth.
 *
 * This implementation does not claim fsync/power-loss durability or support
 * network/distributed filesystems. Missing/corrupt state is never regenerated.
 * filePath is trusted configuration, not a sandbox boundary: callers must use a
 * trusted local directory and prevent untrusted processes from mutating paths or
 * lock entries. Symlink/path-attack resistance is not claimed.
 */
export function createNexoContinuityStore({ filePath, fsModule = fs, lockDeadline = null, lockWaitMs = NEXO_DEFAULT_LOCK_WAIT_MS } = {}) {
  if (typeof filePath !== "string" || !filePath.trim()) {
    throw storeError("NEXO_CONTINUITY_STORE_PATH_REQUIRED");
  }
  if (lockDeadline == null && (typeof lockWaitMs !== "number" || !Number.isFinite(lockWaitMs) || lockWaitMs <= 0)) {
    throw storeError("NEXO_LOCK_WAIT_BUDGET_INVALID");
  }

  async function loadCurrent() {
    const envelope = await readEnvelope(fsModule, filePath);
    return {
      status: "loaded",
      storeRevision: envelope.storeRevision,
      snapshot: structuredClone(envelope.snapshot)
    };
  }

  async function initialize(snapshot) {
    assertNexoContinuitySnapshot(snapshot);
    assertContinuityResourceLimits(snapshot, 0);
    const deadlineAt = resolveNexoLockDeadline(lockDeadline, lockWaitMs);
    let releaseLock;
    try {
      releaseLock = await acquireLock(fsModule, filePath, deadlineAt, "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT");
    } catch (error) {
      // Initialization has not begun writing until its lock is acquired.
      // Keep OS filesystem codes behind the Nexo store contract.
      if (error?.code === "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT") {
        return { status: "failed", code: error.code, phase: "lock_acquisition", writeStarted: false, ...(error.lockRelease ? { lockRelease: error.lockRelease } : {}) };
      }
      if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
        return { status: "failed", code: "NEXO_CONTINUITY_STORE_PARENT_PATH_UNAVAILABLE" };
      }
      return {
        status: "failed",
        code: typeof error?.code === "string" && error.code.startsWith("NEXO_CONTINUITY_STORE_")
          ? error.code
          : "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED"
      };
    }
    let result;
    let lockRelease;
    try {
      result = await (async () => {
      try {
        await fsModule.access(filePath);
        return { status: "conflict", code: "NEXO_CONTINUITY_STORE_ALREADY_EXISTS" };
      } catch (error) {
        if (error?.code !== "ENOENT") return { status: "failed", code: "NEXO_CONTINUITY_STORE_ACCESS_FAILED" };
      }
      const envelope = {
        schema: NEXO_CONTINUITY_STORE_SCHEMA,
        schemaVersion: NEXO_CONTINUITY_STORE_VERSION,
        storeRevision: 0,
        snapshot: structuredClone(snapshot)
      };
      try {
        await writeEnvelope(fsModule, filePath, envelope);
        return { status: "committed", storeRevision: 0, snapshot: structuredClone(envelope.snapshot) };
      } catch {
        try {
          const observed = await readEnvelope(fsModule, filePath);
          if (observed.storeRevision === envelope.storeRevision &&
              JSON.stringify(observed.snapshot) === JSON.stringify(envelope.snapshot)) {
            return {
              status: "committed",
              storeRevision: observed.storeRevision,
              snapshot: structuredClone(observed.snapshot),
              recoveredAfterWriteError: true
            };
          }
        } catch (error) {
          if (error?.code === "NEXO_CONTINUITY_STORE_NOT_FOUND") {
            return { status: "failed", code: "NEXO_CONTINUITY_STORE_INITIALIZE_FAILED" };
          }
        }
        return { status: "unknown", code: "NEXO_CONTINUITY_STORE_INITIALIZE_OUTCOME_UNKNOWN" };
      }
      })();
    } finally {
      lockRelease = await releaseLock();
    }
    if (lockRelease?.status === "failed" || lockRelease?.status === "not_owned") {
      // Persistence may have committed, but the store transaction is not safe
      // to hand off as a successful operation while its lock remains unresolved.
      // Keep the persisted fact explicit while forcing callers to stop dispatch.
      return {
        status: "failed",
        code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
        persistenceStatus: result?.status ?? "unknown",
        ...(Number.isSafeInteger(result?.storeRevision) ? { storeRevision: result.storeRevision } : {}),
        lockRelease
      };
    }
    if (lockRelease?.status === "released_after_retry") return { ...result, lockRelease };
    return result;
  }

  async function commitIfCurrent(expectedRevision, candidate) {
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
      return { status: "failed", code: "NEXO_CONTINUITY_STORE_EXPECTED_REVISION_INVALID" };
    }
    try {
      assertNexoContinuitySnapshot(candidate);
      assertContinuityResourceLimits(candidate, expectedRevision + 1);
    } catch (error) { return { status: "failed", code: error?.code ?? "NEXO_CONTINUITY_SNAPSHOT_INVALID" }; }

    const deadlineAt = resolveNexoLockDeadline(lockDeadline, lockWaitMs);
    let releaseLock;
    try {
      releaseLock = await acquireLock(fsModule, filePath, deadlineAt, "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT");
    } catch (error) {
      if (error?.code === "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT") {
        return { status: "failed", code: error.code, phase: "lock_acquisition", writeStarted: false, ...(error.lockRelease ? { lockRelease: error.lockRelease } : {}) };
      }
      if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
        return { status: "failed", code: "NEXO_CONTINUITY_STORE_PARENT_PATH_UNAVAILABLE" };
      }
      // Keep the store's public result contract consistent with initialize():
      // do not leak OS-specific lock-acquisition exceptions to callers.
      return {
        status: "failed",
        code: typeof error?.code === "string" && error.code.startsWith("NEXO_CONTINUITY_STORE_")
          ? error.code
          : "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED",
        phase: "lock_acquisition",
        writeStarted: false
      };
    }
    let result;
    let lockRelease;
    try {
      result = await (async () => {
      let current;
      try { current = await readEnvelope(fsModule, filePath); }
      catch (error) { return { status: "unknown", code: error?.code ?? "NEXO_CONTINUITY_STORE_READ_FAILED" }; }
      if (current.storeRevision !== expectedRevision) {
        return { status: "conflict", code: "NEXO_CONTINUITY_STORE_REVISION_CONFLICT", storeRevision: current.storeRevision };
      }
      // The persisted envelope requires a safe integer revision. Never write a
      // snapshot whose next revision cannot be represented by that contract.
      if (current.storeRevision === Number.MAX_SAFE_INTEGER) {
        return { status: "failed", code: "NEXO_CONTINUITY_STORE_REVISION_EXHAUSTED", storeRevision: current.storeRevision };
      }

      const next = {
        schema: NEXO_CONTINUITY_STORE_SCHEMA,
        schemaVersion: NEXO_CONTINUITY_STORE_VERSION,
        storeRevision: current.storeRevision + 1,
        snapshot: structuredClone(candidate)
      };
      try {
        await writeEnvelope(fsModule, filePath, next);
        return { status: "committed", storeRevision: next.storeRevision, snapshot: structuredClone(next.snapshot) };
      } catch {
        // Rename/write errors are not promoted to success. Read-after-error only
        // distinguishes a visibly committed candidate; otherwise preserve UNKNOWN.
        try {
          const observed = await readEnvelope(fsModule, filePath);
          if (observed.storeRevision === next.storeRevision &&
              JSON.stringify(observed.snapshot) === JSON.stringify(next.snapshot)) {
            return { status: "committed", storeRevision: observed.storeRevision, snapshot: structuredClone(observed.snapshot) };
          }
          if (observed.storeRevision === current.storeRevision) {
            return { status: "failed", code: "NEXO_CONTINUITY_STORE_WRITE_FAILED" };
          }
        } catch {}
        return { status: "unknown", code: "NEXO_CONTINUITY_STORE_COMMIT_OUTCOME_UNKNOWN" };
      }
      })();
    } finally {
      lockRelease = await releaseLock();
    }
    if (lockRelease?.status === "failed" || lockRelease?.status === "not_owned") {
      // Persistence may have committed, but the store transaction is not safe
      // to hand off as a successful operation while its lock remains unresolved.
      // Keep the persisted fact explicit while forcing callers to stop dispatch.
      return {
        status: "failed",
        code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
        persistenceStatus: result?.status ?? "unknown",
        ...(Number.isSafeInteger(result?.storeRevision) ? { storeRevision: result.storeRevision } : {}),
        lockRelease
      };
    }
    if (lockRelease?.status === "released_after_retry") return { ...result, lockRelease };
    return result;
  }

  return Object.freeze({ loadCurrent, initialize, commitIfCurrent });
}

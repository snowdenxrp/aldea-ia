import fs from "node:fs/promises";
import path from "node:path";
import { NEXO_RESOURCE_LIMITS, readUtf8FileBounded, serializedUtf8Bytes, assertUtf8ByteLimit, assertChronicleResourceLimits } from "./resource-limits.mjs";
import { NEXO_DEFAULT_LOCK_WAIT_MS, resolveNexoLockDeadline, remainingNexoLockWaitMs, nexoLockDeadlineExpired } from "./lock-deadline.mjs";

export const NEXO_CHRONICLE_SCHEMA = "NEXO_CHRONICLE";
export const NEXO_CHRONICLE_VERSION = 1;
const LOCK_RETRY_MS = 10;
const LOCK_STALE_MS = 60_000;
let tempSequence = 0;

function fail(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function validEntry(entry) {
  return entry && typeof entry === "object" && !Array.isArray(entry) &&
    typeof entry.operationKey === "string" && entry.operationKey.trim() !== "" &&
    typeof entry.content === "string" && entry.content.trim() !== "";
}

function validateDocument(document) {
  if (!document || typeof document !== "object" || Array.isArray(document) ||
      document.schema !== NEXO_CHRONICLE_SCHEMA ||
      document.schemaVersion !== NEXO_CHRONICLE_VERSION ||
      !Number.isSafeInteger(document.storeRevision) || document.storeRevision < 0 ||
      !Array.isArray(document.entries) || !document.entries.every(validEntry)) {
    throw fail("NEXO_CHRONICLE_SCHEMA_UNKNOWN");
  }
  const keys = new Set();
  for (const entry of document.entries) {
    if (keys.has(entry.operationKey)) throw fail("NEXO_CHRONICLE_DUPLICATE_OPERATION_KEY");
    keys.add(entry.operationKey);
  }
  assertChronicleResourceLimits(document);
  return document;
}

function lockPath(filePath) { return `${filePath}.lock`; }

function processIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; }
  catch (error) { return error?.code === "EPERM"; }
}

async function readLockOwner(fsModule, lock) {
  try { return JSON.parse(await fsModule.readFile(path.join(lock, "owner.json"), "utf8")); }
  catch { return null; }
}

async function acquireLock(fsModule, filePath, deadlineAt, timeoutCode) {
  const lock = lockPath(filePath);
  const token = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  while (true) {
    if (nexoLockDeadlineExpired(deadlineAt)) throw fail(timeoutCode);
    try {
      await fsModule.mkdir(lock);
      try {
        await fsModule.writeFile(path.join(lock, "owner.json"), JSON.stringify({ pid: process.pid, token }), "utf8");
      } catch (error) {
        // This process created the lock directory; remove its incomplete lock
        // before propagating owner-record creation failure.
        await fsModule.rm(lock, { recursive: true, force: true }).catch(() => {});
        throw error;
      }
      const release = async () => {
        const owner = await readLockOwner(fsModule, lock);
        if (owner?.token !== token) return { status: "not_owned" };
        try {
          await fsModule.rm(lock, { recursive: true, force: true });
          return { status: "released" };
        } catch (error) {
          return {
            status: "failed",
            code: error?.code ?? "NEXO_CHRONICLE_LOCK_RELEASE_FAILED"
          };
        }
      };
      if (nexoLockDeadlineExpired(deadlineAt)) {
        const timeout = fail(timeoutCode);
        timeout.lockRelease = await release();
        throw timeout;
      }
      return release;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      let owner = await readLockOwner(fsModule, lock);
      if (!owner) {
        let rawOwner;
        try { rawOwner = await fsModule.readFile(path.join(lock, "owner.json"), "utf8"); }
        catch (error) {
          // A lock creator may still be writing owner.json; retry only when absent.
          if (error?.code === "ENOENT") continue;
          throw fail("NEXO_CHRONICLE_LOCK_STATE_UNKNOWN");
        }
        try { owner = JSON.parse(rawOwner); }
        catch { throw fail("NEXO_CHRONICLE_LOCK_STATE_UNKNOWN"); }
      }
      if (!owner || typeof owner !== "object" || Array.isArray(owner) ||
          !Number.isSafeInteger(owner.pid) || owner.pid <= 0 ||
          typeof owner.token !== "string" || !owner.token.trim()) {
        throw fail("NEXO_CHRONICLE_LOCK_STATE_UNKNOWN");
      }
      let age;
      try { age = Date.now() - (await fsModule.stat(lock)).mtimeMs; }
      catch (error) {
        // The owner may have released the lock after mkdir returned EEXIST.
        // Retry that race; other inspection errors make lock state unknown.
        if (error?.code === "ENOENT") continue;
        throw fail("NEXO_CHRONICLE_LOCK_STATE_UNKNOWN");
      }
      const stale = age > LOCK_STALE_MS && (!owner || !processIsAlive(Number(owner.pid)));
      if (stale) {
        // Reclaiming by check-then-rm is racy: another process may replace the
        // lock between the stale check and removal. Fail closed and require
        // explicit operator recovery rather than deleting a possibly new lock.
        throw fail("NEXO_CHRONICLE_LOCK_STALE_RECOVERY_REQUIRED");
      }
      const remainingMs = remainingNexoLockWaitMs(deadlineAt);
      if (remainingMs <= 0) throw fail(timeoutCode);
      await new Promise(resolve => setTimeout(resolve, Math.min(LOCK_RETRY_MS, remainingMs)));
    }
  }
}

async function readDocument(fsModule, filePath) {
  let raw;
  try { raw = await readUtf8FileBounded(fsModule, filePath, NEXO_RESOURCE_LIMITS.chronicleDocumentBytes, "NEXO_CHRONICLE_RESOURCE_LIMIT_EXCEEDED"); }
  catch (error) {
    throw fail(error?.code === "ENOENT" ? "NEXO_CHRONICLE_NOT_FOUND" : error?.code === "NEXO_CHRONICLE_RESOURCE_LIMIT_EXCEEDED" ? error.code : "NEXO_CHRONICLE_READ_FAILED");
  }
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { throw fail("NEXO_CHRONICLE_INVALID_JSON"); }
  return validateDocument(parsed);
}

async function writeDocument(fsModule, filePath, document) {
  assertChronicleResourceLimits(document);
  if (serializedUtf8Bytes(document) > NEXO_RESOURCE_LIMITS.chronicleDocumentBytes) {
    throw fail("NEXO_CHRONICLE_RESOURCE_LIMIT_EXCEEDED");
  }
  const temp = `${filePath}.tmp-${process.pid}-${Date.now()}-${++tempSequence}`;
  try {
    await fsModule.writeFile(temp, JSON.stringify(document, null, 2) + "\n", "utf8");
    await fsModule.rename(temp, filePath);
  } catch (error) {
    await fsModule.rm(temp, { force: true }).catch(() => {});
    throw error;
  }
}

/**
 * Nexo-owned durable history, separate from the operational continuity journal.
 * This local store does not claim fsync/power-loss durability or rollback protection.
 * Missing state is never silently initialized by read or append.
 * filePath is trusted configuration, not a sandbox boundary: callers must use a
 * trusted local directory and prevent untrusted processes from mutating paths or
 * lock entries. Symlink/path-attack resistance is not claimed.
 */
export function createNexoChronicleStore({ filePath, fsModule = fs, lockDeadline = null, lockWaitMs = NEXO_DEFAULT_LOCK_WAIT_MS } = {}) {
  if (typeof filePath !== "string" || !filePath.trim()) throw fail("NEXO_CHRONICLE_PATH_REQUIRED");
  if (lockDeadline == null && (typeof lockWaitMs !== "number" || !Number.isFinite(lockWaitMs) || lockWaitMs <= 0)) {
    throw fail("NEXO_LOCK_WAIT_BUDGET_INVALID");
  }

  async function loadCurrent() {
    const document = await readDocument(fsModule, filePath);
    return { status: "loaded", storeRevision: document.storeRevision, entries: structuredClone(document.entries) };
  }

  async function initialize() {
    const deadlineAt = resolveNexoLockDeadline(lockDeadline, lockWaitMs);
    let release;
    try {
      release = await acquireLock(fsModule, filePath, deadlineAt, "NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT");
    } catch (error) {
      if (error?.code === "NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT") {
        return { status: "blocked", code: error.code, phase: "lock_acquisition", writeStarted: false, ...(error.lockRelease ? { lockRelease: error.lockRelease } : {}) };
      }
      // Lock acquisition happens before any Chronicle initialization write.
      // Normalize filesystem failures at the store boundary instead of leaking
      // raw OS codes through the public Nexo application result.
      if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
        return { status: "blocked", code: "NEXO_CHRONICLE_PARENT_PATH_UNAVAILABLE" };
      }
      return {
        status: "blocked",
        code: error?.code ?? "NEXO_CHRONICLE_LOCK_ACQUISITION_FAILED"
      };
    }
    let result;
    let lockRelease;
    try {
      result = await (async () => {
        try {
          await fsModule.access(filePath);
          return { status: "conflict", code: "NEXO_CHRONICLE_ALREADY_EXISTS" };
        } catch (error) {
          if (error?.code !== "ENOENT") return { status: "unknown", code: "NEXO_CHRONICLE_ACCESS_UNKNOWN" };
        }
        const document = { schema: NEXO_CHRONICLE_SCHEMA, schemaVersion: NEXO_CHRONICLE_VERSION, storeRevision: 0, entries: [] };
        try {
          await writeDocument(fsModule, filePath, document);
          return { status: "committed", storeRevision: 0, entries: [] };
        } catch {
          try {
            const observed = await readDocument(fsModule, filePath);
            if (observed.storeRevision === 0 && observed.entries.length === 0) return { status: "committed", storeRevision: 0, entries: [] };
          } catch {}
          return { status: "unknown", code: "NEXO_CHRONICLE_INITIALIZE_OUTCOME_UNKNOWN" };
        }
      })();
    } finally {
      lockRelease = await release();
    }
    if (lockRelease?.status === "failed" || lockRelease?.status === "not_owned") {
      return {
        status: "blocked",
        code: "NEXO_CHRONICLE_LOCK_RELEASE_FAILED",
        persistenceStatus: result?.status ?? "unknown",
        ...(Number.isSafeInteger(result?.storeRevision) ? { storeRevision: result.storeRevision } : {}),
        lockRelease
      };
    }
    return result;
  }

  async function append({ operationKey, content } = {}) {
    if (typeof operationKey !== "string" || !operationKey.trim() ||
        typeof content !== "string" || !content.trim()) {
      return { status: "blocked", code: "NEXO_CHRONICLE_ENTRY_INVALID" };
    }
    try { assertUtf8ByteLimit(content, NEXO_RESOURCE_LIMITS.chronicleEntryBytes, "NEXO_CHRONICLE_RESOURCE_LIMIT_EXCEEDED"); }
    catch (error) { return { status: "blocked", code: error?.code ?? "NEXO_CHRONICLE_RESOURCE_LIMIT_EXCEEDED" }; }
    const deadlineAt = resolveNexoLockDeadline(lockDeadline, lockWaitMs);
    let release;
    try {
      release = await acquireLock(fsModule, filePath, deadlineAt, "NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT");
    } catch (error) {
      if (error?.code === "NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT") {
        return { status: "blocked", code: error.code, phase: "lock_acquisition", writeStarted: false, ...(error.lockRelease ? { lockRelease: error.lockRelease } : {}) };
      }
      if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
        return { status: "blocked", code: "NEXO_CHRONICLE_PARENT_PATH_UNAVAILABLE" };
      }
      throw error;
    }
    let result;
    let lockRelease;
    try {
      result = await (async () => {
        let current;
        try { current = await readDocument(fsModule, filePath); }
        catch (error) { return { status: "blocked", code: error?.code ?? "NEXO_CHRONICLE_READ_FAILED" }; }

        const existing = current.entries.find(entry => entry.operationKey === operationKey);
        if (existing) {
          if (existing.content !== content) return { status: "conflict", code: "NEXO_CHRONICLE_OPERATION_CONTENT_CONFLICT" };
          return { status: "already_present", storeRevision: current.storeRevision, entry: structuredClone(existing) };
        }

        if (current.storeRevision === Number.MAX_SAFE_INTEGER) {
          return {
            status: "blocked",
            code: "NEXO_CHRONICLE_REVISION_EXHAUSTED",
            storeRevision: current.storeRevision
          };
        }

        const candidate = {
          schema: NEXO_CHRONICLE_SCHEMA,
          schemaVersion: NEXO_CHRONICLE_VERSION,
          storeRevision: current.storeRevision + 1,
          entries: [...current.entries, { operationKey, content }]
        };
        try {
          assertChronicleResourceLimits(candidate);
          if (serializedUtf8Bytes(candidate) > NEXO_RESOURCE_LIMITS.chronicleDocumentBytes) {
            return { status: "blocked", code: "NEXO_CHRONICLE_RESOURCE_LIMIT_EXCEEDED", storeRevision: current.storeRevision };
          }
          await writeDocument(fsModule, filePath, candidate);
          return { status: "committed", storeRevision: candidate.storeRevision, entry: { operationKey, content } };
        } catch {
          try {
            const observed = await readDocument(fsModule, filePath);
            const matches = observed.entries.filter(entry => entry.operationKey === operationKey);
            if (observed.storeRevision === candidate.storeRevision &&
                JSON.stringify(observed.entries) === JSON.stringify(candidate.entries)) {
              return {
                status: "committed",
                storeRevision: observed.storeRevision,
                entry: structuredClone(matches[0]),
                recoveredAfterWriteError: true
              };
            }
            if (matches.length === 1 && matches[0].content !== content) {
              return { status: "conflict", code: "NEXO_CHRONICLE_OPERATION_CONTENT_CONFLICT" };
            }
            return { status: "unknown", code: "NEXO_CHRONICLE_APPEND_OUTCOME_UNKNOWN" };
          } catch {}
          return { status: "unknown", code: "NEXO_CHRONICLE_APPEND_OUTCOME_UNKNOWN" };
        }
      })();
    } finally {
      lockRelease = await release();
    }
    if (lockRelease?.status === "failed" || lockRelease?.status === "not_owned") {
      return {
        status: "blocked",
        code: "NEXO_CHRONICLE_LOCK_RELEASE_FAILED",
        persistenceStatus: result?.status ?? "unknown",
        ...(Number.isSafeInteger(result?.storeRevision) ? { storeRevision: result.storeRevision } : {}),
        lockRelease
      };
    }
    return result;
  }

  return Object.freeze({ initialize, loadCurrent, append });
}

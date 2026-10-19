import fs from "node:fs/promises";
import path from "node:path";

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

async function acquireLock(fsModule, filePath) {
  const lock = lockPath(filePath);
  const token = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  while (true) {
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
      return async () => {
        const owner = await readLockOwner(fsModule, lock);
        if (owner?.token === token) await fsModule.rm(lock, { recursive: true, force: true });
      };
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      const owner = await readLockOwner(fsModule, lock);
      let age = 0;
      try { age = Date.now() - (await fsModule.stat(lock)).mtimeMs; } catch {}
      const stale = age > LOCK_STALE_MS && (!owner || !processIsAlive(Number(owner.pid)));
      if (stale) {
        // Reclaiming by check-then-rm is racy: another process may replace the
        // lock between the stale check and removal. Fail closed and require
        // explicit operator recovery rather than deleting a possibly new lock.
        throw fail("NEXO_CHRONICLE_LOCK_STALE_RECOVERY_REQUIRED");
      }
      await new Promise(resolve => setTimeout(resolve, LOCK_RETRY_MS));
    }
  }
}

async function readDocument(fsModule, filePath) {
  let raw;
  try { raw = await fsModule.readFile(filePath, "utf8"); }
  catch (error) {
    throw fail(error?.code === "ENOENT" ? "NEXO_CHRONICLE_NOT_FOUND" : "NEXO_CHRONICLE_READ_FAILED");
  }
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { throw fail("NEXO_CHRONICLE_INVALID_JSON"); }
  return validateDocument(parsed);
}

async function writeDocument(fsModule, filePath, document) {
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
export function createNexoChronicleStore({ filePath, fsModule = fs } = {}) {
  if (typeof filePath !== "string" || !filePath.trim()) throw fail("NEXO_CHRONICLE_PATH_REQUIRED");

  async function loadCurrent() {
    const document = await readDocument(fsModule, filePath);
    return { status: "loaded", storeRevision: document.storeRevision, entries: structuredClone(document.entries) };
  }

  async function initialize() {
    const release = await acquireLock(fsModule, filePath);
    try {
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
    } finally {
      await release();
    }
  }

  async function append({ operationKey, content } = {}) {
    if (typeof operationKey !== "string" || !operationKey.trim() ||
        typeof content !== "string" || !content.trim()) {
      return { status: "blocked", code: "NEXO_CHRONICLE_ENTRY_INVALID" };
    }
    const release = await acquireLock(fsModule, filePath);
    try {
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
    } finally {
      await release();
    }
  }

  return Object.freeze({ initialize, loadCurrent, append });
}

import path from "node:path";
import fs from "node:fs/promises";
import { createNexoContinuityStore } from "./continuity-store.mjs";
import { NEXO_DEFAULT_LOCK_WAIT_MS } from "./lock-deadline.mjs";
import { createNexoContinuityOwner } from "./continuity-owner.mjs";
import {
  NEXO_CONTINUITY_SCHEMA,
  projectNexoContinuitySnapshot
} from "./continuity-snapshot.mjs";

function emptySnapshot() {
  return {
    schema: NEXO_CONTINUITY_SCHEMA,
    schemaVersion: 1,
    missions: [],
    attempts: [],
    doNotRepeat: [],
    executions: [],
    effectJournal: []
  };
}

/**
 * Open the independent Nexo operational store.
 *
 * Legacy memory is imported only when the separate store does not exist.
 * Once the store exists, it is the canonical operational-continuity source;
 * legacy copies are not merged or dual-written. Empty bootstrap is permitted
 * only when the caller has independently established that no prior world-state
 * file exists.
 */
function continuityServiceError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function readContinuityServiceOptions(options) {
  if (options === undefined) options = {};
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw continuityServiceError("NEXO_CONTINUITY_STORE_PATH_REQUIRED");
  }
  let prototype;
  try {
    prototype = Object.getPrototypeOf(options);
  } catch {
    throw continuityServiceError("NEXO_STORE_OPTIONS_INVALID");
  }
  if (prototype !== Object.prototype && prototype !== null) {
    throw continuityServiceError("NEXO_STORE_OPTIONS_INVALID");
  }

  const values = Object.create(null);
  for (const key of [
    "filePath", "legacyMemory", "allowEmptyInitialization",
    "effectVerifiers", "lockDeadline", "lockWaitMs"
  ]) {
    let descriptor;
    try {
      descriptor = Object.getOwnPropertyDescriptor(options, key);
    } catch {
      throw continuityServiceError("NEXO_STORE_OPTIONS_INVALID");
    }
    if (!descriptor) continue;
    if (!descriptor.enumerable || !("value" in descriptor)) {
      throw continuityServiceError(key === "filePath"
        ? "NEXO_CONTINUITY_STORE_PATH_REQUIRED"
        : "NEXO_STORE_OPTIONS_INVALID");
    }
    values[key] = descriptor.value;
  }
  return {
    filePath: values.filePath,
    legacyMemory: values.legacyMemory === undefined ? null : values.legacyMemory,
    allowEmptyInitialization: values.allowEmptyInitialization === undefined
      ? false : values.allowEmptyInitialization,
    effectVerifiers: values.effectVerifiers === undefined ? {} : values.effectVerifiers,
    lockDeadline: values.lockDeadline === undefined ? null : values.lockDeadline,
    lockWaitMs: values.lockWaitMs === undefined ? NEXO_DEFAULT_LOCK_WAIT_MS : values.lockWaitMs
  };
}

function readBootstrapOptions(options) {
  if (!options || typeof options !== "object" || Array.isArray(options)) throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID");
  let prototype;
  try { prototype = Object.getPrototypeOf(options); } catch { throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID"); }
  if (prototype !== Object.prototype && prototype !== null) throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID");
  const allowed = new Set(["root", "relativePath", "expectedDestination", "lockDeadline", "lockWaitMs"]);
  const values = Object.create(null);
  let keys;
  try { keys = Reflect.ownKeys(options); } catch { throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID"); }
  for (const key of keys) {
    if (typeof key !== "string" || !allowed.has(key)) throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID");
    let descriptor;
    try { descriptor = Object.getOwnPropertyDescriptor(options, key); } catch { throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID"); }
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID");
    values[key] = descriptor.value;
  }
  return values;
}

async function resolveBootstrapInputs(options) {
  const values = readBootstrapOptions(options);
  const root = values.root;
  const relativePath = values.relativePath;
  if (typeof root !== "string" || !root.trim() || !path.isAbsolute(root) || root.includes(String.fromCharCode(0))) {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_ROOT_INVALID");
  }
  if (typeof relativePath !== "string" || !relativePath.trim() || path.isAbsolute(relativePath) ||
      relativePath.includes(String.fromCharCode(0)) || path.normalize(relativePath) !== relativePath ||
      relativePath === "." || relativePath === ".." || relativePath.startsWith(".." + path.sep)) {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_RELATIVE_PATH_INVALID");
  }
  const lexicalRoot = path.resolve(root);
  let rootStat;
  try { rootStat = await fs.lstat(lexicalRoot); } catch { throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_ROOT_UNAVAILABLE"); }
  if (rootStat.isSymbolicLink()) throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_PATH_SYMLINK");
  if (!rootStat.isDirectory()) throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_ROOT_INVALID");
  let resolvedRoot;
  try { resolvedRoot = await fs.realpath(lexicalRoot); } catch { throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_ROOT_UNAVAILABLE"); }
  const relativeDirectory = path.dirname(relativePath);
  let parentDirectory = resolvedRoot;
  if (relativeDirectory !== ".") {
    for (const segment of relativeDirectory.split(path.sep)) {
      parentDirectory = path.join(parentDirectory, segment);
      let parentStat;
      try { parentStat = await fs.lstat(parentDirectory); } catch { throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_PARENT_STATE_UNKNOWN"); }
      if (parentStat.isSymbolicLink()) throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_PATH_SYMLINK");
      if (!parentStat.isDirectory()) throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_PARENT_STATE_UNKNOWN");
    }
  }
  const filePath = path.resolve(resolvedRoot, relativePath);
  const relativeDestination = path.relative(resolvedRoot, filePath);
  if (!relativeDestination || relativeDestination === ".." || relativeDestination.startsWith(".." + path.sep) || path.isAbsolute(relativeDestination)) {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_DESTINATION_OUTSIDE_ROOT");
  }
  const baseName = path.basename(filePath);
  let parentEntries;
  try { parentEntries = await fs.readdir(parentDirectory, { withFileTypes: true }); }
  catch { throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_PARENT_STATE_UNKNOWN"); }
  if (parentEntries.some(entry => entry.name === baseName + ".tmp" || entry.name.startsWith(baseName + ".tmp-"))) {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_TEMPORARY_STATE_UNKNOWN");
  }
  return { values, destination: Object.freeze({ root: resolvedRoot, relativePath, filePath }) };
}

/**
 * Read-only preflight. It neither creates nor reserves filesystem objects.
 * Bootstrap resolves and validates the same root/path contract again before
 * calling the store's exclusive initializer.
 */
export async function preflightNexoContinuityBootstrap(options = {}) {
  const { destination } = await resolveBootstrapInputs(options);
  try {
    await fs.lstat(destination.filePath);
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_DESTINATION_EXISTS");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  try {
    await fs.lstat(destination.filePath + ".lock");
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_LOCK_STATE_UNKNOWN");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  return Object.freeze({ status: "prepared", destination });
}

/** Restricted M0 first publication; never opens an owner or continues to Chronicle. */
export async function bootstrapNexoContinuityStore(options = {}) {
  const { values, destination } = await resolveBootstrapInputs(options);
  if (values.expectedDestination !== undefined &&
      (typeof values.expectedDestination !== "string" || values.expectedDestination !== destination.filePath)) {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_DESTINATION_CHANGED");
  }
  const store = createNexoContinuityStore({
    filePath: destination.filePath,
    ...(values.lockDeadline !== undefined ? { lockDeadline: values.lockDeadline } : {}),
    ...(values.lockWaitMs !== undefined ? { lockWaitMs: values.lockWaitMs } : {})
  });
  const result = await store.initializeExclusive(emptySnapshot());
  return Object.freeze({ ...result, destination });
}

export async function openNexoContinuityOwner(options = {}) {
  const {
    filePath, legacyMemory, allowEmptyInitialization,
    effectVerifiers, lockDeadline, lockWaitMs
  } = readContinuityServiceOptions(options);
  const store = createNexoContinuityStore({ filePath, lockDeadline, lockWaitMs });
  let current;

  try {
    current = await store.loadCurrent();
  } catch (error) {
    if (error?.code !== "NEXO_CONTINUITY_STORE_NOT_FOUND") throw error;
    let snapshot;
    if (legacyMemory !== null && legacyMemory !== undefined) {
      snapshot = projectNexoContinuitySnapshot(legacyMemory);
    } else if (allowEmptyInitialization === true) {
      snapshot = emptySnapshot();
    } else {
      const blocked = new Error("NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN");
      blocked.code = "NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN";
      throw blocked;
    }

    const initialized = await store.initialize(snapshot);
    if (initialized.status !== "committed" && initialized.status !== "conflict") {
      const blocked = new Error(initialized.code ?? "NEXO_CONTINUITY_INITIALIZATION_FAILED");
      blocked.code = initialized.code ?? "NEXO_CONTINUITY_INITIALIZATION_FAILED";
      if (typeof initialized.phase === "string") blocked.phase = initialized.phase;
      if (typeof initialized.writeStarted === "boolean") blocked.writeStarted = initialized.writeStarted;
      if (initialized.lockRelease && typeof initialized.lockRelease === "object") blocked.lockRelease = initialized.lockRelease;
      throw blocked;
    }
    current = await store.loadCurrent();
  }

  return Object.freeze({
    store,
    owner: createNexoContinuityOwner({ store, effectVerifiers }),
    current
  });
}

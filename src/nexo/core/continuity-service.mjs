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

/**
 * Perform the restricted M0 first-publication operation only.
 *
 * The destination is derived from an explicit absolute root and a normalized
 * relative path supplied for this invocation. This operation never accepts
 * legacy memory, never loads/project legacy state, and never returns an
 * operational owner. It is not an authority/root-commissioning mechanism and
 * does not claim symlink/path-attack resistance or global writer exclusion.
 */
export async function bootstrapNexoContinuityStore(options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID");
  }
  let prototype;
  try { prototype = Object.getPrototypeOf(options); }
  catch { throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID"); }
  if (prototype !== Object.prototype && prototype !== null) {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID");
  }

  const allowed = new Set(["root", "relativePath", "lockDeadline", "lockWaitMs"]);
  const values = Object.create(null);
  let keys;
  try { keys = Reflect.ownKeys(options); }
  catch { throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID"); }
  for (const key of keys) {
    if (typeof key !== "string" || !allowed.has(key)) {
      throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID");
    }
    let descriptor;
    try { descriptor = Object.getOwnPropertyDescriptor(options, key); }
    catch { throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID"); }
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_OPTIONS_INVALID");
    }
    values[key] = descriptor.value;
  }

  const root = values.root;
  const relativePath = values.relativePath;
  if (typeof root !== "string" || !root.trim() || !path.isAbsolute(root) ||
      root.includes(String.fromCharCode(0))) {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_ROOT_INVALID");
  }
  if (typeof relativePath !== "string" || !relativePath.trim() ||
      path.isAbsolute(relativePath) || relativePath.includes(String.fromCharCode(0)) ||
      path.normalize(relativePath) !== relativePath || relativePath === "." ||
      relativePath === ".." || relativePath.startsWith(`..${path.sep}`)) {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_RELATIVE_PATH_INVALID");
  }

  const lexicalRoot = path.resolve(root);
  let rootStat;
  try { rootStat = await fs.lstat(lexicalRoot); }
  catch { throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_ROOT_UNAVAILABLE"); }
  if (rootStat.isSymbolicLink()) {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_PATH_SYMLINK");
  }
  if (!rootStat.isDirectory()) {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_ROOT_INVALID");
  }

  // Canonicalize the explicit anchor so platform aliases in its ancestors do
  // not change the effective destination after validation. The anchor itself
  // and every relative parent component must be real directories, not symlinks.
  let resolvedRoot;
  try { resolvedRoot = await fs.realpath(lexicalRoot); }
  catch { throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_ROOT_UNAVAILABLE"); }

  const relativeDirectory = path.dirname(relativePath);
  let parentDirectory = resolvedRoot;
  if (relativeDirectory !== ".") {
    for (const segment of relativeDirectory.split(path.sep)) {
      parentDirectory = path.join(parentDirectory, segment);
      let parentStat;
      try { parentStat = await fs.lstat(parentDirectory); }
      catch { throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_PARENT_STATE_UNKNOWN"); }
      if (parentStat.isSymbolicLink()) {
        throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_PATH_SYMLINK");
      }
      if (!parentStat.isDirectory()) {
        throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_PARENT_STATE_UNKNOWN");
      }
    }
  }

  const filePath = path.resolve(resolvedRoot, relativePath);
  const relativeDestination = path.relative(resolvedRoot, filePath);
  if (!relativeDestination || relativeDestination === ".." ||
      relativeDestination.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativeDestination)) {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_DESTINATION_OUTSIDE_ROOT");
  }

  // For M0 first publication, every pre-existing reserved temp name is
  // ambiguous, regardless of whether it names a file, directory, or symlink.
  const baseName = path.basename(filePath);
  let parentEntries;
  try {
    parentEntries = await fs.readdir(parentDirectory, { withFileTypes: true });
  } catch {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_PARENT_STATE_UNKNOWN");
  }
  if (parentEntries.some(entry =>
      entry.name === `${baseName}.tmp` || entry.name.startsWith(`${baseName}.tmp-`))) {
    throw continuityServiceError("NEXO_CONTINUITY_BOOTSTRAP_TEMPORARY_STATE_UNKNOWN");
  }

  const store = createNexoContinuityStore({
    filePath,
    ...(values.lockDeadline !== undefined ? { lockDeadline: values.lockDeadline } : {}),
    ...(values.lockWaitMs !== undefined ? { lockWaitMs: values.lockWaitMs } : {})
  });
  const result = await store.initializeExclusive(emptySnapshot());
  // Preserve the store's explicit conflict/unknown/failure result. In every
  // case this API stops here; it never loads state or constructs an owner.
  return Object.freeze({
    ...result,
    destination: Object.freeze({
      root: resolvedRoot,
      relativePath,
      filePath
    })
  });
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

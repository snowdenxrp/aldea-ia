import { openNexoContinuityOwner } from "../core/continuity-service.mjs";
import { createNexoContinuityStore } from "../core/continuity-store.mjs";
import { createNexoChronicleStore } from "../core/chronicle-store.mjs";
import { createNexoChronicleEffectContracts, NEXO_CHRONICLE_APPEND_ACTION } from "../adapters/chronicle-effect.mjs";
import { createEffectAdapter } from "../effect-adapter.js";
import { executeNexoStepWithContinuityOwner } from "../core/owner-backed-runtime.mjs";
import { NEXO_DEFAULT_LOCK_WAIT_MS, createNexoLockDeadline } from "../core/lock-deadline.mjs";
import { NEXO_RESOURCE_LIMITS, assertUtf8ByteLimit } from "../core/resource-limits.mjs";

function blocked(code, details = null) {
  return {
    status: "blocked", code, authorization: "NOT_EVALUATED",
    dispatchAttempted: false, redispatchAuthorized: false,
    ...(typeof details?.phase === "string" ? { phase: details.phase } : {}),
    ...(typeof details?.writeStarted === "boolean" ? { writeStarted: details.writeStarted } : {}),
    ...(details?.lockRelease && typeof details.lockRelease === "object" ? { lockRelease: details.lockRelease } : {})
  };
}

const PUBLIC_CHRONICLE_STATUSES = new Set([
  "completed", "blocked", "conflict", "unknown", "observed", "invalid"
]);
function readChronicleSessionOptions(options) {
  if (!options || typeof options !== "object" || Array.isArray(options)) return null;
  try {
    const prototype = Object.getPrototypeOf(options);
    if (prototype !== Object.prototype && prototype !== null) return null;
    const values = Object.create(null);
    for (const key of [
      "continuityPath", "chroniclePath", "missionId", "stepId", "content",
      "initializeContinuity", "initializeChronicle", "lockWaitMs"
    ]) {
      const descriptor = Object.getOwnPropertyDescriptor(options, key);
      if (!descriptor) continue;
      if (!descriptor.enumerable || !("value" in descriptor)) return null;
      values[key] = descriptor.value;
    }
    if (!Object.hasOwn(values, "initializeContinuity")) values.initializeContinuity = false;
    if (!Object.hasOwn(values, "initializeChronicle")) values.initializeChronicle = false;
    if (!Object.hasOwn(values, "lockWaitMs")) values.lockWaitMs = NEXO_DEFAULT_LOCK_WAIT_MS;
    return values;
  } catch {
    return null;
  }
}

const TRI_STATE_FIELDS = new Set([
  "preparedCommitted", "lineageCommitted", "journalSettled",
  "terminalOutcomeRecorded", "missionAdmissionCommitted"
]);

function isPublicDataRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

function readPublicDataField(record, key) {
  if (!isPublicDataRecord(record)) return undefined;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(record, key);
    return descriptor && descriptor.enumerable && "value" in descriptor
      ? descriptor.value
      : undefined;
  } catch {
    return undefined;
  }
}

function sanitizePublicLockRelease(value) {
  if (!isPublicDataRecord(value)) return undefined;
  const status = readPublicDataField(value, "status");
  const code = readPublicDataField(value, "code");
  if (typeof status !== "string" || typeof code !== "string") return undefined;
  return { status, code };
}

export function publicChronicleResult(result, missionId, stepId) {
  // This exported sanitizer is also a public boundary. Never read caller-owned
  // result fields through ordinary property access: accessors may execute here.
  const statusValue = readPublicDataField(result, "status");
  const codeValue = readPublicDataField(result, "code");
  const dispatchAttempted = readPublicDataField(result, "dispatchAttempted");
  const safe = {
    status: typeof statusValue === "string" && PUBLIC_CHRONICLE_STATUSES.has(statusValue)
      ? statusValue : "unknown",
    // No owner-authority evaluator is wired into this prototype. Never let a
    // successful local Chronicle settlement imply authorization.
    authorization: "NOT_EVALUATED",
    dispatchAttempted: dispatchAttempted === true,
    redispatchAuthorized: false,
    missionId: typeof missionId === "string" ? missionId : null,
    stepId: typeof stepId === "string" ? stepId : null
  };
  if (typeof codeValue === "string") safe.code = codeValue;
  for (const field of TRI_STATE_FIELDS) {
    const value = readPublicDataField(result, field);
    if (typeof value === "boolean" || value === "UNKNOWN") safe[field] = value;
  }
  const storeRevision = readPublicDataField(result, "storeRevision");
  if (Number.isSafeInteger(storeRevision) && storeRevision >= 0) {
    safe.storeRevision = storeRevision;
  }

  const timeoutSources = [
    result,
    readPublicDataField(result, "prepared"),
    readPublicDataField(result, "lineage"),
    readPublicDataField(result, "reconciliation"),
    readPublicDataField(result, "outcome"),
    readPublicDataField(result, "adapterResult")
  ];
  const timeoutSource = timeoutSources.find(value => value &&
    (readPublicDataField(value, "phase") === "lock_acquisition" ||
      typeof readPublicDataField(value, "writeStarted") === "boolean" ||
      readPublicDataField(value, "lockRelease") !== undefined));
  const timeoutCodeSource = timeoutSources.find(value => {
    const code = readPublicDataField(value, "code");
    return typeof code === "string" && code.endsWith("_LOCK_ACQUISITION_TIMEOUT");
  });
  if (timeoutSource) {
    const phase = readPublicDataField(timeoutSource, "phase");
    const writeStarted = readPublicDataField(timeoutSource, "writeStarted");
    const lockRelease = sanitizePublicLockRelease(readPublicDataField(timeoutSource, "lockRelease"));
    if (typeof phase === "string") safe.phase = phase;
    if (typeof writeStarted === "boolean") safe.writeStarted = writeStarted;
    if (lockRelease) safe.lockRelease = lockRelease;
  }
  if (timeoutCodeSource) {
    const timeoutCode = readPublicDataField(timeoutCodeSource, "code");
    if (!(typeof codeValue === "string" && codeValue.endsWith("_LOCK_ACQUISITION_TIMEOUT"))) {
      safe.lockAcquisitionCode = timeoutCode;
    }
  }
  return safe;
}

function readMissionAdmissionOptions(options) {
  if (!options || typeof options !== "object" || Array.isArray(options)) return null;
  try {
    const prototype = Object.getPrototypeOf(options);
    if (prototype !== Object.prototype && prototype !== null) return null;
    const values = Object.create(null);
    for (const key of ["owner", "expectedRevision", "mission"]) {
      const descriptor = Object.getOwnPropertyDescriptor(options, key);
      if (!descriptor) continue;
      if (!descriptor.enumerable || !("value" in descriptor)) return null;
      values[key] = descriptor.value;
    }
    const recordMission = readPublicDataField(values.owner, "recordMission");
    if (typeof recordMission !== "function" ||
        !Number.isSafeInteger(values.expectedRevision) || values.expectedRevision < 0 ||
        !values.mission || typeof values.mission !== "object" || Array.isArray(values.mission)) {
      return null;
    }
    return { ...values, recordMission };
  } catch {
    return null;
  }
}

function readMissionAdmissionResult(result) {
  if (!isPublicDataRecord(result)) return null;
  try {
    const values = Object.create(null);
    for (const key of ["status", "code", "persistenceStatus", "missionAdmissionCommitted", "storeRevision"]) {
      const descriptor = Object.getOwnPropertyDescriptor(result, key);
      if (!descriptor) continue;
      if (!descriptor.enumerable || !("value" in descriptor)) return null;
      values[key] = descriptor.value;
    }
    if (typeof values.status !== "string") return null;
    if (Object.hasOwn(values, "persistenceStatus") && typeof values.persistenceStatus !== "string") return null;
    if (Object.hasOwn(values, "code") && typeof values.code !== "string") return null;
    if (Object.hasOwn(values, "storeRevision") &&
        (!Number.isSafeInteger(values.storeRevision) || values.storeRevision < 0)) return null;
    if (Object.hasOwn(values, "missionAdmissionCommitted") &&
        typeof values.missionAdmissionCommitted !== "boolean" &&
        values.missionAdmissionCommitted !== "UNKNOWN") return null;
    return values;
  } catch {
    return null;
  }
}

/**
 * Mission admission can persist before its response is lost. Do not let a raw
 * store exception escape or claim that admission definitely failed.
 */
export async function recordNexoMissionSafely(options) {
  const input = readMissionAdmissionOptions(options);
  if (!input) {
    return {
      status: "blocked",
      code: "NEXO_CHRONICLE_MISSION_ADMISSION_INPUT_INVALID",
      missionAdmissionCommitted: false,
      dispatchAttempted: false,
      redispatchAuthorized: false
    };
  }
  const { owner, recordMission, expectedRevision, mission } = input;
  try {
    const rawResult = await recordMission.call(owner, { expectedRevision, mission });
    const result = readMissionAdmissionResult(rawResult);
    if (!result) {
      return {
        status: "unknown",
        code: "NEXO_CHRONICLE_MISSION_ADMISSION_RESULT_INVALID",
        missionAdmissionCommitted: "UNKNOWN",
        dispatchAttempted: false,
        redispatchAuthorized: false
      };
    }
    const storeRevision = Number.isSafeInteger(result.storeRevision) && result.storeRevision >= 0
      ? result.storeRevision : undefined;
    const code = typeof result.code === "string" && result.code.trim()
      ? result.code : undefined;
    // Preserve a known durable commit while blocking an unsafe lock handoff.
    if (result.persistenceStatus === "committed") {
      return {
        status: "blocked",
        code: code ?? "NEXO_CHRONICLE_MISSION_ADMISSION_HANDOFF_UNSAFE",
        missionAdmissionCommitted: true,
        dispatchAttempted: false,
        redispatchAuthorized: false,
        ...(storeRevision !== undefined ? { storeRevision } : {})
      };
    }
    if (result.status === "unknown" || result.missionAdmissionCommitted === "UNKNOWN" ||
        result.persistenceStatus === "unknown") {
      return {
        status: "unknown",
        code: code ?? "NEXO_CHRONICLE_MISSION_ADMISSION_OUTCOME_UNKNOWN",
        missionAdmissionCommitted: "UNKNOWN",
        dispatchAttempted: false,
        redispatchAuthorized: false,
        ...(storeRevision !== undefined ? { storeRevision } : {})
      };
    }
    return {
      status: result.status,
      ...(code ? { code } : {}),
      ...(storeRevision !== undefined ? { storeRevision } : {}),
      ...(typeof result.missionAdmissionCommitted === "boolean" ||
        result.missionAdmissionCommitted === "UNKNOWN"
        ? { missionAdmissionCommitted: result.missionAdmissionCommitted } : {}),
      dispatchAttempted: false,
      redispatchAuthorized: false
    };
  } catch (error) {
    let code;
    try {
      const descriptor = error && (typeof error === "object" || typeof error === "function")
        ? Object.getOwnPropertyDescriptor(error, "code") : null;
      if (descriptor && descriptor.enumerable && "value" in descriptor &&
          typeof descriptor.value === "string" && descriptor.value.trim()) {
        code = descriptor.value;
      }
    } catch { /* use the closed fallback below */ }
    return {
      status: "unknown",
      code: code ?? "NEXO_CHRONICLE_MISSION_ADMISSION_OUTCOME_UNKNOWN",
      missionAdmissionCommitted: "UNKNOWN",
      dispatchAttempted: false,
      redispatchAuthorized: false
    };
  }
}

export async function runNexoChronicleAppend(options) {
  const input = readChronicleSessionOptions(options);
  if (!input) return blocked("NEXO_CHRONICLE_SESSION_INPUT_INVALID");
  const {
    continuityPath, chroniclePath, missionId, stepId, content,
    initializeContinuity, initializeChronicle, lockWaitMs
  } = input;
  if (typeof continuityPath !== "string" || !continuityPath.trim() ||
      typeof chroniclePath !== "string" || !chroniclePath.trim() ||
      typeof missionId !== "string" || !missionId.trim() ||
      typeof stepId !== "string" || !stepId.trim() ||
      typeof content !== "string" || !content.trim() ||
      typeof initializeContinuity !== "boolean" || typeof initializeChronicle !== "boolean" ||
      typeof lockWaitMs !== "number" || !Number.isFinite(lockWaitMs) || lockWaitMs <= 0) {
    return blocked("NEXO_CHRONICLE_SESSION_INPUT_INVALID");
  }
  try { assertUtf8ByteLimit(content, NEXO_RESOURCE_LIMITS.chronicleEntryBytes, "NEXO_CHRONICLE_RESOURCE_LIMIT_EXCEEDED"); }
  catch (error) { return blocked(error?.code ?? "NEXO_CHRONICLE_RESOURCE_LIMIT_EXCEEDED"); }

  // The continuity journal currently defines operation identity as
  // `${missionId}:${stepId}`; reject separators to prevent tuple collisions.
  if (missionId.includes(":") || stepId.includes(":") ||
      missionId !== missionId.trim() || stepId !== stepId.trim()) {
    return blocked("NEXO_CHRONICLE_ID_INVALID");
  }

  // One monotonic deadline is shared by both stores and every nested mutation
  // in this interactive operation; the budget is never reset at each layer.
  const lockDeadline = createNexoLockDeadline(lockWaitMs);
  const chronicleStore = createNexoChronicleStore({ filePath: chroniclePath, lockDeadline });
  const continuityStore = createNexoContinuityStore({ filePath: continuityPath, lockDeadline });
  let chronicleMissing = false;
  let continuityMissing = false;

  // Preflight BOTH stores before initializing either one. A known-corrupt or
  // unapproved-missing companion store must not cause partial bootstrap writes.
  try { await chronicleStore.loadCurrent(); }
  catch (error) {
    if (error?.code === "NEXO_CHRONICLE_NOT_FOUND") chronicleMissing = true;
    else return blocked(error?.code ?? "NEXO_CHRONICLE_STORE_UNAVAILABLE");
  }
  try { await continuityStore.loadCurrent(); }
  catch (error) {
    if (error?.code === "NEXO_CONTINUITY_STORE_NOT_FOUND") continuityMissing = true;
    else return blocked(error?.code ?? "NEXO_CONTINUITY_STORE_UNAVAILABLE");
  }
  if (chronicleMissing && !initializeChronicle) return blocked("NEXO_CHRONICLE_STORE_UNAVAILABLE");
  if (continuityMissing && !initializeContinuity) return blocked("NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN");

  const contracts = createNexoChronicleEffectContracts({ store: chronicleStore });
  let opened;
  try {
    opened = await openNexoContinuityOwner({
      filePath: continuityPath,
      allowEmptyInitialization: initializeContinuity,
      effectVerifiers: contracts.verifiers,
      lockDeadline, lockWaitMs
    });
  } catch (error) {
    return blocked(error?.code ?? "NEXO_CONTINUITY_STORE_UNAVAILABLE", error);
  }
  if (chronicleMissing) {
    try {
      const initialized = await chronicleStore.initialize();
      if (initialized.status !== "committed") {
        return blocked(initialized.code ?? "NEXO_CHRONICLE_INITIALIZE_FAILED", initialized);
      }
    } catch (error) {
      return blocked(error?.code ?? "NEXO_CHRONICLE_INITIALIZE_FAILED");
    }
  }

  const target = { content };
  let current = opened.current;
  let mission = current.snapshot.missions.find(item => item?.missionId === missionId);
  if (!mission) {
    const candidate = {
      missionId,
      status: "planned",
      objective: NEXO_CHRONICLE_APPEND_ACTION,
      steps: [{ id: stepId, action: NEXO_CHRONICLE_APPEND_ACTION, target, status: "planned", dependsOn: [] }]
    };
    const recorded = await recordNexoMissionSafely({
      owner: opened.owner, expectedRevision: current.storeRevision, mission: candidate
    });
    if (recorded.status === "unknown") return publicChronicleResult(recorded, missionId, stepId);
    if (recorded.status === "conflict") {
      return {
        status: "conflict",
        code: recorded.code ?? "NEXO_CHRONICLE_MISSION_ADMISSION_CONFLICT",
        authorization: "NOT_EVALUATED",
        dispatchAttempted: false,
        storeRevision: recorded.storeRevision,
        redispatchAuthorized: false
      };
    }
    if (recorded.missionAdmissionCommitted === true) {
      // Admission is durably known, but an unsafe lock handoff forbids continuing.
      return publicChronicleResult(recorded, missionId, stepId);
    }
    if (recorded.status !== "committed" && recorded.status !== "already_recorded") {
      return blocked(recorded.code ?? "NEXO_CHRONICLE_MISSION_ADMISSION_FAILED", recorded);
    }
    try { current = await opened.owner.loadCurrent(); }
    catch (error) { return blocked(error?.code ?? "NEXO_CHRONICLE_MISSION_RELOAD_FAILED"); }
    mission = current.snapshot.missions.find(item => item?.missionId === missionId);
  }

  // A caller cannot reuse an existing mission identity to change the prepared payload.
  if (!mission || mission.steps?.length !== 1) return blocked("NEXO_CHRONICLE_MISSION_SHAPE_MISMATCH");
  const step = mission.steps[0];
  if (step?.id !== stepId || step?.action !== NEXO_CHRONICLE_APPEND_ACTION ||
      JSON.stringify(step?.target ?? null) !== JSON.stringify(target)) {
    return blocked("NEXO_CHRONICLE_MISSION_CONTENT_MISMATCH");
  }

  const adapter = createEffectAdapter({
    handlers: contracts.handlers,
    verifiers: contracts.verifiers
  });
  const result = await executeNexoStepWithContinuityOwner({
    missionId, stepId, owner: opened.owner, adapter,
    postcondition: contracts.postcondition
  });
  return publicChronicleResult(result, missionId, stepId);
}


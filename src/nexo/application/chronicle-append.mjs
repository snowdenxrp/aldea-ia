import { openNexoContinuityOwner } from "../core/continuity-service.mjs";
import { createNexoContinuityStore } from "../core/continuity-store.mjs";
import { createNexoChronicleStore } from "../core/chronicle-store.mjs";
import { createNexoChronicleEffectContracts, NEXO_CHRONICLE_APPEND_ACTION } from "../adapters/chronicle-effect.mjs";
import { createEffectAdapter } from "../effect-adapter.js";
import { executeNexoStepWithContinuityOwner } from "../core/owner-backed-runtime.mjs";

function blocked(code) {
  return { status: "blocked", code, dispatchAttempted: false, redispatchAuthorized: false };
}

export function publicChronicleResult(result, missionId, stepId) {
  const safe = {
    status: typeof result?.status === "string" ? result.status : "unknown",
    dispatchAttempted: result?.dispatchAttempted === true,
    redispatchAuthorized: result?.redispatchAuthorized === true,
    missionId,
    stepId
  };
  for (const field of [
    "code", "preparedCommitted", "lineageCommitted", "journalSettled",
    "terminalOutcomeRecorded", "missionAdmissionCommitted", "storeRevision"
  ]) {
    if (result && Object.hasOwn(result, field)) safe[field] = result[field];
  }
  return safe;
}

/**
 * Mission admission can persist before its response is lost. Do not let a raw
 * store exception escape or claim that admission definitely failed.
 */
export async function recordNexoMissionSafely({ owner, expectedRevision, mission } = {}) {
  try {
    const result = await owner.recordMission({ expectedRevision, mission });
    if (result?.status === "unknown" || result?.missionAdmissionCommitted === "UNKNOWN") {
      return {
        status: "unknown",
        code: result.code ?? "NEXO_CHRONICLE_MISSION_ADMISSION_OUTCOME_UNKNOWN",
        missionAdmissionCommitted: "UNKNOWN",
        dispatchAttempted: false,
        redispatchAuthorized: false,
        ...(Number.isSafeInteger(result.storeRevision) ? { storeRevision: result.storeRevision } : {})
      };
    }
    return result;
  } catch (error) {
    return {
      status: "unknown",
      code: error?.code ?? "NEXO_CHRONICLE_MISSION_ADMISSION_OUTCOME_UNKNOWN",
      missionAdmissionCommitted: "UNKNOWN",
      dispatchAttempted: false,
      redispatchAuthorized: false
    };
  }
}

export async function runNexoChronicleAppend({
  continuityPath, chroniclePath, missionId, stepId, content,
  initializeContinuity = false, initializeChronicle = false
} = {}) {
  if (typeof continuityPath !== "string" || !continuityPath.trim() ||
      typeof chroniclePath !== "string" || !chroniclePath.trim() ||
      typeof missionId !== "string" || !missionId.trim() ||
      typeof stepId !== "string" || !stepId.trim() ||
      typeof content !== "string" || !content.trim() ||
      typeof initializeContinuity !== "boolean" || typeof initializeChronicle !== "boolean") {
    return blocked("NEXO_CHRONICLE_SESSION_INPUT_INVALID");
  }

  // The continuity journal currently defines operation identity as
  // `${missionId}:${stepId}`; reject separators to prevent tuple collisions.
  if (missionId.includes(":") || stepId.includes(":") ||
      missionId !== missionId.trim() || stepId !== stepId.trim()) {
    return blocked("NEXO_CHRONICLE_ID_INVALID");
  }

  const chronicleStore = createNexoChronicleStore({ filePath: chroniclePath });
  const continuityStore = createNexoContinuityStore({ filePath: continuityPath });
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
      effectVerifiers: contracts.verifiers
    });
  } catch (error) {
    return blocked(error?.code ?? "NEXO_CONTINUITY_STORE_UNAVAILABLE");
  }
  if (chronicleMissing) {
    try {
      const initialized = await chronicleStore.initialize();
      if (initialized.status !== "committed") {
        return blocked(initialized.code ?? "NEXO_CHRONICLE_INITIALIZE_FAILED");
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
        dispatchAttempted: false,
        storeRevision: recorded.storeRevision,
        redispatchAuthorized: false
      };
    }
    if (recorded.status !== "committed" && recorded.status !== "already_recorded") {
      return blocked(recorded.code ?? "NEXO_CHRONICLE_MISSION_ADMISSION_FAILED");
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


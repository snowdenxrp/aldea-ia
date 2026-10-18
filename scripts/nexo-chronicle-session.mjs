import { pathToFileURL } from "node:url";
import { openNexoContinuityOwner } from "./nexo-continuity.mjs";
import { createNexoContinuityStore } from "../src/nexo/core/continuity-store.mjs";
import { createNexoChronicleStore } from "../src/nexo/core/chronicle-store.mjs";
import { createNexoChronicleEffectContracts, NEXO_CHRONICLE_APPEND_ACTION } from "../src/nexo/adapters/chronicle-effect.mjs";
import { createEffectAdapter } from "../src/nexo/effect-adapter.js";
import { executeNexoStepWithContinuityOwner } from "../src/nexo/runtime.js";

function blocked(code) {
  return { status: "blocked", code, dispatchAttempted: false };
}

/**
 * Explicit, local-first entrypoint for the first native Nexo capability.
 * It never imports Lúmina/simulation. IDs and store paths are caller supplied;
 * new continuity/Chronicle stores are created only when their opt-in flags are true.
 */
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
    const recorded = await opened.owner.recordMission({ expectedRevision: current.storeRevision, mission: candidate });
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
  return { ...result, missionId, stepId };
}

export function parseNexoChronicleArguments(argv) {
  const values = Object.create(null);
  const valueOptions = new Set(["--continuity", "--chronicle", "--mission", "--step", "--content"]);
  const flags = new Set(["--initialize-continuity", "--initialize-chronicle"]);
  function invalid() {
    const error = new Error("NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID");
    error.code = "NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID";
    throw error;
  }
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (flags.has(key)) {
      if (Object.hasOwn(values, key)) invalid();
      values[key] = true;
      continue;
    }
    if (!valueOptions.has(key) || Object.hasOwn(values, key) ||
        index + 1 >= argv.length || argv[index + 1].startsWith("--")) invalid();
    values[key] = argv[++index];
  }
  return {
    continuityPath: values["--continuity"],
    chroniclePath: values["--chronicle"],
    missionId: values["--mission"],
    stepId: values["--step"],
    content: values["--content"],
    initializeContinuity: values["--initialize-continuity"] === true,
    initializeChronicle: values["--initialize-chronicle"] === true
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let result;
  try {
    result = await runNexoChronicleAppend(parseNexoChronicleArguments(process.argv.slice(2)));
  } catch (error) {
    result = blocked(error?.code ?? "NEXO_CHRONICLE_SESSION_FAILED");
  }
  // Do not echo Chronicle content, raw errors, or filesystem paths to logs.
  console.log(JSON.stringify({
    status: result.status,
    code: result.code ?? null,
    missionId: result.missionId ?? null,
    stepId: result.stepId ?? null,
    dispatchAttempted: result.dispatchAttempted ?? false,
    terminalOutcomeRecorded: result.terminalOutcomeRecorded ?? false,
    redispatchAuthorized: result.redispatchAuthorized ?? false
  }));
  if (result.status !== "completed") process.exitCode = 1;
}

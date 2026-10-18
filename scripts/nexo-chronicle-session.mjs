import { pathToFileURL } from "node:url";
import { openNexoContinuityOwner } from "./nexo-continuity.mjs";
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

  const chronicleStore = createNexoChronicleStore({ filePath: chroniclePath });
  try {
    if (initializeChronicle) {
      const initialized = await chronicleStore.initialize();
      if (initialized.status !== "committed" && initialized.status !== "conflict") {
        return blocked(initialized.code ?? "NEXO_CHRONICLE_INITIALIZE_FAILED");
      }
    }
    // Explicitly load to distinguish an existing store from a missing one.
    await chronicleStore.loadCurrent();
  } catch (error) {
    return blocked(error?.code ?? "NEXO_CHRONICLE_STORE_UNAVAILABLE");
  }

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
  return executeNexoStepWithContinuityOwner({
    missionId, stepId, owner: opened.owner, adapter,
    postcondition: contracts.postcondition
  });
}

function parseArguments(argv) {
  const values = Object.create(null);
  const flags = new Set(["--initialize-continuity", "--initialize-chronicle"]);
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (flags.has(key)) {
      values[key] = true;
      continue;
    }
    if (key.startsWith("--") && index + 1 < argv.length) values[key] = argv[++index];
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
  const result = await runNexoChronicleAppend(parseArguments(process.argv.slice(2)));
  // Do not echo Chronicle content to logs.
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

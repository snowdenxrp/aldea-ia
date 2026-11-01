import { assertContractInput } from "../nexo/core/contracts.mjs";
import {
  createLuminaEffectAdapter,
  createLuminaActionPostcondition,
  createLuminaEffectPostcondition
} from "./simulation-adapter.mjs";
import { executeNexoStep } from "../nexo/runtime.js";

function isValidContractRecord(value, field) {
  try {
    assertContractInput(value, field);
    return true;
  } catch {
    return false;
  }
}

function readRuntimeOptions(options, fields) {
  if (options === undefined) options = {};
  if (!options || typeof options !== "object" || Array.isArray(options)) return null;
  try {
    const prototype = Object.getPrototypeOf(options);
    if (prototype !== Object.prototype && prototype !== null) return null;
    const values = Object.create(null);
    for (const key of fields) {
      const descriptor = Object.getOwnPropertyDescriptor(options, key);
      if (!descriptor) continue;
      if (!descriptor.enumerable || !("value" in descriptor)) return null;
      values[key] = descriptor.value;
    }
    return values;
  } catch {
    return null;
  }
}

/**
 * Canonical owner-backed execution slice for actions with a trusted verifier.
 * PREPARED must be committed before adapter dispatch. Any ambiguous result keeps
 * the obligation open; this path never retries and never declares a terminal
 * mission outcome from adapter status alone.
 *
 * Repair actions remain on their dedicated revision-bound settlement path.
 */
export async function executeLuminaNexoStep(options = {}) {
  const input = readRuntimeOptions(options, ["simulation", "mission", "stepId", "memory", "context", "precondition", "postcondition", "persistPreparedIntent"]);
  if (!input) return { mission: null, memory: null, adapterResult: null, status: "invalid", code: "NEXO_RUNTIME_OPTIONS_INVALID" };
  const simulation = input.simulation;
  const mission = input.mission;
  const stepId = input.stepId;
  const memory = input.memory === undefined ? null : input.memory;
  const context = input.context === undefined ? {} : input.context;
  const precondition = input.precondition;
  const postcondition = input.postcondition;
  const persistPreparedIntent = input.persistPreparedIntent === undefined ? null : input.persistPreparedIntent;
  if (!isValidContractRecord(mission, "mission")) {
    return { mission: null, memory, adapterResult: null, status: "invalid", code: "NEXO_RUNTIME_CONTRACT_INPUT_INVALID" };
  }
  if(!simulation)return{mission:null,memory,adapterResult:null,status:"invalid"};
  const runtimeMemory=memory ?? null;
  const executionJournal=Array.isArray(runtimeMemory?.nexo?.effectJournal)?runtimeMemory.nexo.effectJournal:[];
  const adapter=createLuminaEffectAdapter(simulation,{executionJournal,persistPreparedIntent});
  const step=mission?.steps?.find(s=>s.id===stepId); const actionIntent=step?.context?.action??context?.action??null;
  const effectivePostcondition=postcondition??(step?.action==="execute_lumina_action"&&actionIntent?createLuminaActionPostcondition(simulation,actionIntent,step.target):["repair_agent_state","repair_agent_needs","repair_resource_state"].includes(step?.action)?createLuminaEffectPostcondition(simulation,step.action,step.target):undefined);
  return executeNexoStep({mission,stepId,adapter,memory:runtimeMemory,context,precondition,postcondition:effectivePostcondition});
}

import { assertM0OptionAEffectAllowed } from "./nexo-m0-gate.mjs";
import { runNexoRepairOnceProtocol } from "./nexo-repair-protocol.mjs";

function blockedByM0(error) {
  return { status: "blocked", code: error.code, persisted: false, dispatchAttempted: false };
}

export async function runNexoRepairOnce(args = {}) {
  try {
    assertM0OptionAEffectAllowed("runNexoRepairOnce");
  } catch (error) {
    if (error?.code === "NEXO_M0_OPTION_A_EFFECT_EXCLUDED") return blockedByM0(error);
    throw error;
  }
  return runNexoRepairOnceProtocol(args);
}

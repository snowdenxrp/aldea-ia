/**
 * NCS M0 Option A: fail closed before any repair protocol access.
 * This module is internal and is not exported by the CLI or application API.
 */
export function assertM0OptionAEffectAllowed(callerTag) {
  const error = new Error(`NCS M0 excludes Lúmina effects: ${String(callerTag ?? "unknown")}`);
  error.name = "NexoM0EffectExcludedError";
  error.code = "NEXO_M0_OPTION_A_EFFECT_EXCLUDED";
  error.status = "blocked";
  error.persisted = false;
  error.dispatchAttempted = false;
  error.callerTag = String(callerTag ?? "unknown");
  throw error;
}

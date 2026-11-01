import assert from "node:assert/strict";
import { assertM0OptionAEffectAllowed } from "../../scripts/nexo-m0-gate.mjs";
import { runNexoRepairSession } from "../../scripts/nexo-repair-session.mjs";
import { runNexoRepairOnce } from "../../scripts/nexo-repair-entrypoint.mjs";
import { dispatchPreparedRepair } from "../../scripts/nexo-repair-dispatch.mjs";
import { runNexoRuntimeRepairSession } from "../../scripts/nexo-runtime-session.mjs";

let touched = 0;
const forbidden = new Proxy({}, {
  get() { touched += 1; throw new Error("blocked entrypoint touched a dependency"); }
});
const args = {
  get owner() { touched += 1; throw new Error("owner getter must not run"); },
  get store() { touched += 1; throw new Error("store getter must not run"); },
  get statePath() { touched += 1; throw new Error("statePath getter must not run"); },
  get operation() { touched += 1; throw new Error("operation getter must not run"); }
};

for (const [name, invoke] of [
  ["runNexoRepairSession", () => runNexoRepairSession(args)],
  ["runNexoRepairOnce", () => runNexoRepairOnce(args)],
  ["dispatchPreparedRepair", () => dispatchPreparedRepair(args)]
]) {
  const result = await invoke();
  assert.deepEqual(result, {
    status: "blocked",
    code: "NEXO_M0_OPTION_A_EFFECT_EXCLUDED",
    persisted: false,
    dispatchAttempted: false
  }, name);
}
assert.equal(touched, 0, "M0 gates must run before reading caller arguments or dependencies");
assert.deepEqual(await runNexoRuntimeRepairSession(), {
  status: "blocked",
  code: "NEXO_M0_OPTION_A_EFFECT_EXCLUDED",
  persisted: false,
  dispatchAttempted: false
});
assert.throws(
  () => assertM0OptionAEffectAllowed("test"),
  error => error.code === "NEXO_M0_OPTION_A_EFFECT_EXCLUDED" &&
    error.status === "blocked" && error.persisted === false && error.dispatchAttempted === false
);
console.log("NCS M0: all public repair entrypoints fail closed before accessing dependencies.");

import assert from "node:assert/strict";
import { assertNexoMissionAdmission } from "../../src/nexo/core/mission-admission-contract.mjs";

const mission = {
  missionId: "admission-options-regression",
  steps: [{ id: "step-1", action: "local_analysis", dependsOn: [] }]
};

let getterCalls = 0;
const accessorOptions = {};
Object.defineProperty(accessorOptions, "requestIntent", {
  enumerable: true,
  get() {
    getterCalls += 1;
    return false;
  }
});
assert.throws(
  () => assertNexoMissionAdmission(mission, accessorOptions),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID"
);
assert.equal(getterCalls, 0, "admission options must be rejected without invoking getters");

const hiddenOptions = {};
Object.defineProperty(hiddenOptions, "requestIntent", {
  enumerable: false,
  value: false
});
assert.throws(
  () => assertNexoMissionAdmission(mission, hiddenOptions),
  error => error?.code === "NEXO_MISSION_CONTEXT_INVALID"
);

assert.equal(assertNexoMissionAdmission(mission), true);
assert.equal(assertNexoMissionAdmission(mission, { requestIntent: false }), true);
assert.equal(assertNexoMissionAdmission({
  intent: "analyze locally",
  missionDraft: mission
}, { requestIntent: true }), true);

console.log("Nexo mission admission options input guard tests passed");

import assert from "node:assert/strict";
import { recordNexoMissionSafely } from "../../src/nexo/application/chronicle-append.mjs";

let ownerCalls = 0;
const owner = {
  async recordMission() {
    ownerCalls += 1;
    return { status: "committed" };
  }
};

let getterCalls = 0;
const hostileOptions = {
  owner,
  expectedRevision: 0,
  mission: { missionId: "mission-guard", steps: [] }
};
Object.defineProperty(hostileOptions, "mission", {
  enumerable: true,
  get() {
    getterCalls += 1;
    throw new Error("getter must not execute");
  }
});

const hostileResult = await recordNexoMissionSafely(hostileOptions);
assert.equal(hostileResult.status, "blocked");
assert.equal(hostileResult.code, "NEXO_CHRONICLE_MISSION_ADMISSION_INPUT_INVALID");
assert.equal(hostileResult.missionAdmissionCommitted, false);
assert.equal(hostileResult.dispatchAttempted, false);
assert.equal(hostileResult.redispatchAuthorized, false);
assert.equal(getterCalls, 0);
assert.equal(ownerCalls, 0);

const inheritedOptions = Object.create({
  owner,
  expectedRevision: 0,
  mission: { missionId: "inherited", steps: [] }
});
const inheritedResult = await recordNexoMissionSafely(inheritedOptions);
assert.equal(inheritedResult.status, "blocked");
assert.equal(inheritedResult.code, "NEXO_CHRONICLE_MISSION_ADMISSION_INPUT_INVALID");
assert.equal(ownerCalls, 0);

const result = await recordNexoMissionSafely({
  owner,
  expectedRevision: 0,
  mission: { missionId: "mission-valid-shape", steps: [] }
});
assert.equal(result.status, "committed");
assert.equal(ownerCalls, 1);

console.log("Nexo mission admission options input guard tests passed.");

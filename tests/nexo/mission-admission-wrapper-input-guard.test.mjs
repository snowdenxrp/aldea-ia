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

// The injected owner capability and its result are public-boundary inputs too.
let ownerMethodGetterCalls = 0;
const accessorOwner = {};
Object.defineProperty(accessorOwner, "recordMission", {
  enumerable: true,
  get() {
    ownerMethodGetterCalls += 1;
    throw new Error("owner method getter must not execute");
  }
});
const accessorOwnerResult = await recordNexoMissionSafely({
  owner: accessorOwner,
  expectedRevision: 0,
  mission: { missionId: "accessor-owner", steps: [] }
});
assert.equal(ownerMethodGetterCalls, 0);
assert.equal(accessorOwnerResult.status, "blocked");
assert.equal(accessorOwnerResult.code, "NEXO_CHRONICLE_MISSION_ADMISSION_INPUT_INVALID");
assert.equal(accessorOwnerResult.dispatchAttempted, false);

let ownerResultGetterCalls = 0;
const resultOwner = {
  async recordMission() {
    const raw = { status: "committed", storeRevision: 3 };
    Object.defineProperty(raw, "persistenceStatus", {
      enumerable: true,
      get() {
        ownerResultGetterCalls += 1;
        throw new Error("owner result getter must not execute");
      }
    });
    return raw;
  }
};
const unsafeOwnerResult = await recordNexoMissionSafely({
  owner: resultOwner,
  expectedRevision: 0,
  mission: { missionId: "accessor-owner-result", steps: [] }
});
assert.equal(ownerResultGetterCalls, 0);
assert.equal(unsafeOwnerResult.status, "unknown");
assert.equal(unsafeOwnerResult.code, "NEXO_CHRONICLE_MISSION_ADMISSION_RESULT_INVALID");
assert.equal(unsafeOwnerResult.missionAdmissionCommitted, "UNKNOWN");
assert.equal(unsafeOwnerResult.dispatchAttempted, false);
assert.equal(unsafeOwnerResult.redispatchAuthorized, false);
assert.equal(Object.hasOwn(unsafeOwnerResult, "storeRevision"), false);

console.log("Nexo mission admission options input guard tests passed.");

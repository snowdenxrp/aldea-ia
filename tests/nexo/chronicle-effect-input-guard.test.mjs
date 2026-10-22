import assert from "node:assert/strict";
import {
  createNexoChronicleEffectContracts,
  NEXO_CHRONICLE_APPEND_ACTION
} from "../../src/nexo/adapters/chronicle-effect.mjs";

let getterCalls = 0;
let loadCalls = 0;
const badFactoryOptions = {};
Object.defineProperty(badFactoryOptions, "store", {
  enumerable: true,
  get() { getterCalls += 1; return { append: async () => ({}), loadCurrent: async () => ({ entries: [], storeRevision: 0 }) }; }
});
assert.throws(
  () => createNexoChronicleEffectContracts(badFactoryOptions),
  error => error?.code === "NEXO_CHRONICLE_STORE_REQUIRED"
);
assert.equal(getterCalls, 0, "factory option accessors must not execute");

let appendCalls = 0;
const contracts = createNexoChronicleEffectContracts({
  store: {
    append: async () => { appendCalls += 1; return { status: "committed", storeRevision: 1 }; },
    loadCurrent: async () => { loadCalls += 1; return { entries: [], storeRevision: 0 }; }
  }
});

const badOperation = {};
Object.defineProperty(badOperation, "missionId", {
  enumerable: true,
  get() { getterCalls += 1; return "mission-a"; }
});
const blocked = await contracts.handlers[NEXO_CHRONICLE_APPEND_ACTION](badOperation);
assert.equal(blocked.status, "blocked");
assert.equal(blocked.code, "NEXO_CHRONICLE_ENTRY_INVALID");
assert.equal(getterCalls, 0, "handler operation accessors must not execute");
assert.equal(appendCalls, 0, "invalid operation must not reach Chronicle append");

const badTarget = {};
Object.defineProperty(badTarget, "content", {
  enumerable: true,
  get() { getterCalls += 1; return "untrusted"; }
});
const blockedTarget = await contracts.handlers[NEXO_CHRONICLE_APPEND_ACTION]({
  missionId: "mission-a",
  stepId: "step-a",
  action: NEXO_CHRONICLE_APPEND_ACTION,
  target: badTarget
});
assert.equal(blockedTarget.status, "blocked");
assert.equal(getterCalls, 0, "target content accessor must not execute");
assert.equal(appendCalls, 0);

const badVerifierOperation = {};
Object.defineProperty(badVerifierOperation, "missionId", {
  enumerable: true,
  get() { getterCalls += 1; return "mission-a"; }
});
const observation = await contracts.verifiers[NEXO_CHRONICLE_APPEND_ACTION](badVerifierOperation);
assert.equal(observation.status, "unknown");
assert.equal(observation.code, "NEXO_CHRONICLE_OBSERVATION_INPUT_INVALID");
assert.equal(getterCalls, 0, "verifier must inspect descriptors before copying operation fields");
assert.equal(loadCalls, 0, "invalid verifier operation must not reach Chronicle store");

console.log("Nexo Chronicle effect input guard tests passed");

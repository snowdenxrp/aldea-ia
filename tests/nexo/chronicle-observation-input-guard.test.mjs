import assert from "node:assert/strict";
import { observeChronicleOperation } from "../../src/nexo/adapters/chronicle-observation.mjs";

let getterCalls = 0;
const invalidOptions = {};
Object.defineProperty(invalidOptions, "missionId", {
  enumerable: true,
  get() { getterCalls += 1; return "mission-a"; }
});
assert.deepEqual(await observeChronicleOperation(invalidOptions), {
  status: "unknown",
  code: "NEXO_CHRONICLE_OBSERVATION_INPUT_INVALID",
  source: "nexo-chronicle-store"
});
assert.equal(getterCalls, 0, "option accessors must not execute during observation admission");

const target = {};
Object.defineProperty(target, "content", {
  enumerable: true,
  get() { getterCalls += 1; return "hello"; }
});
const store = {
  async loadCurrent() { return { storeRevision: 1, entries: [] }; }
};
const targetResult = await observeChronicleOperation({
  store, idempotencyKey: "mission-a:step-a", missionId: "mission-a",
  stepId: "step-a", action: "chronicle_append", target
});
assert.equal(targetResult.status, "unknown");
assert.equal(targetResult.code, "NEXO_CHRONICLE_OBSERVATION_INPUT_INVALID");
assert.equal(getterCalls, 0, "target accessors must not execute during observation admission");

let reads = 0;
const validStore = {
  async loadCurrent() { reads += 1; return { storeRevision: 7, entries: [] }; }
};
const absent = await observeChronicleOperation({
  store: validStore,
  idempotencyKey: "mission-a:step-a",
  missionId: "mission-a",
  stepId: "step-a",
  action: "chronicle_append",
  target: { content: "hello" }
});
assert.equal(absent.status, "not_applied");
assert.equal(absent.observedRevision, 7);
assert.equal(absent.causalAttribution, "not_established");
assert.equal(reads, 1);

console.log("Nexo Chronicle observation input guard tests passed");

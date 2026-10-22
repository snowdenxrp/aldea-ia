import assert from "node:assert/strict";
import {
  observePersistedRepairInvariant,
  comparePersistedRepairRevision
} from "../../src/nexo/adapters/persisted-repair-observation.mjs";

let getterCalls = 0;
const invalidObservation = {};
Object.defineProperty(invalidObservation, "snapshot", {
  enumerable: true,
  get() { getterCalls += 1; return {}; }
});
assert.deepEqual(observePersistedRepairInvariant(invalidObservation), {
  status: "observed",
  outcome: "unknown",
  reason: "REPAIR_OPERATION_CONTEXT_INVALID",
  evidence: {
    kind: "persisted-repair-invariant-observation",
    source: "world-state.json",
    action: null,
    target: null,
    stateRevision: null
  }
});
assert.equal(getterCalls, 0, "snapshot option accessors must not execute");

const invalidRevision = {};
Object.defineProperty(invalidRevision, "expectedStateRevision", {
  enumerable: true,
  get() { getterCalls += 1; return 7; }
});
assert.deepEqual(comparePersistedRepairRevision(invalidRevision), {
  status: "observed",
  outcome: "unknown",
  reason: "REPAIR_REVISION_CONTEXT_INVALID",
  expectedStateRevision: null,
  currentStateRevision: null
});
assert.equal(getterCalls, 0, "revision option accessors must not execute");

const valid = observePersistedRepairInvariant({
  snapshot: {
    stateRevision: 4,
    world: { resources: {} },
    agents: [{ id: "agent-a", alive: true, position: { x: 1, z: 2 } }]
  },
  action: "repair_agent_state",
  target: "agent-a"
});
assert.equal(valid.outcome, "desired_state_present");
assert.equal(valid.evidence.stateRevision, 4);

const sameRevision = comparePersistedRepairRevision({
  expectedStateRevision: 4,
  currentSnapshot: { stateRevision: 4 }
});
assert.equal(sameRevision.outcome, "current");

console.log("Nexo persisted repair observation input guard tests passed");

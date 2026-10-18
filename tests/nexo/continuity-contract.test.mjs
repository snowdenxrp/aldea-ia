import assert from "node:assert/strict";
import { assertNexoContinuityMemoryShape } from "../../src/nexo/core/continuity-contract.mjs";

const plan = {
  missionId: "mission-a",
  steps: [{ id: "step-a", action: "repair_agent_state", target: { agentId: "alex" }, status: "planned", dependsOn: [] }]
};
const prepared = {
  idempotencyKey: "mission-a:step-a",
  missionId: "mission-a",
  stepId: "step-a",
  action: "repair_agent_state",
  target: { agentId: "alex" },
  status: "prepared"
};
const validMemory = {
  version: 4,
  runs: [],
  lessons: [],
  patterns: [],
  nexo: {
    missions: [plan],
    attempts: [],
    doNotRepeat: [],
    executions: [],
    effectJournal: [prepared]
  }
};

assert.equal(assertNexoContinuityMemoryShape(null), true);
assert.equal(assertNexoContinuityMemoryShape(validMemory), true);

let getterCalls = 0;
const accessorMemory = {};
Object.defineProperty(accessorMemory, "nexo", {
  enumerable: true,
  get() { getterCalls += 1; return validMemory.nexo; }
});
assert.throws(
  () => assertNexoContinuityMemoryShape(accessorMemory),
  error => error?.code === "NEXO_MEMORY_SCHEMA_UNKNOWN"
);
assert.equal(getterCalls, 0, "continuity validation must reject accessors without invoking them");

const sparseMemory = structuredClone(validMemory);
sparseMemory.nexo.effectJournal = new Array(1);
assert.throws(
  () => assertNexoContinuityMemoryShape(sparseMemory),
  error => error?.code === "NEXO_MEMORY_SCHEMA_UNKNOWN"
);

assert.throws(
  () => assertNexoContinuityMemoryShape({version:4,nexo:{missions:[]}}),
  error => error?.code === "NEXO_MEMORY_SCHEMA_UNKNOWN"
);
assert.throws(
  () => assertNexoContinuityMemoryShape({
    ...validMemory,
    nexo: {...validMemory.nexo,effectJournal:[{status:"prepared",missionId:"mission-a"}]}
  }),
  error => error?.code === "NEXO_RECOVERY_CONTEXT_MALFORMED"
);
assert.throws(
  () => assertNexoContinuityMemoryShape({
    ...validMemory,
    nexo: {...validMemory.nexo,effectJournal:[{...prepared,missionId:"missing-mission"}]}
  }),
  error => error?.code === "NEXO_RECOVERY_CONTEXT_MISSING"
);
assert.throws(
  () => assertNexoContinuityMemoryShape({
    ...validMemory,
    nexo: {...validMemory.nexo,effectJournal:[{...prepared,action:"repair_agent_needs"}]}
  }),
  error => error?.code === "NEXO_RECOVERY_CONTEXT_MISMATCH"
);
assert.throws(
  () => assertNexoContinuityMemoryShape({
    ...validMemory,
    nexo: {...validMemory.nexo,effectJournal:[{...prepared,target:{agentId:"bruno"}}]}
  }),
  error => error?.code === "NEXO_RECOVERY_CONTEXT_MISMATCH"
);

console.log("Nexo continuity shape and prepared-operation context contract OK.");

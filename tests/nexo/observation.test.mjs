import assert from "node:assert/strict";
import { createObservationEnvelope, createMissionCandidate, ADMISSION } from "../../src/nexo/core/observation.mjs";

const source = { assistant: "VisualAgent" };
const inputs = { mesh: false, probe: { frame: 12 } };
const observation = createObservationEnvelope({
  source: source.assistant,
  code: "MESH_MISSING",
  severity: "error",
  target: "agent-1",
  inputs,
  explanatory: { message: "mesh missing" }
});

assert.equal(observation.source, "VisualAgent");
assert.equal(observation.code, "MESH_MISSING");
assert.equal(observation.target, "agent-1");
assert.equal(observation.inputs.probe.frame, 12);
assert.throws(() => { observation.inputs.probe.frame = 99; }, TypeError);
assert.throws(() => createObservationEnvelope({ source: "", code: "X" }), /source/);
assert.throws(() => createObservationEnvelope({ source: "VisualAgent", code: "" }), /code/);

// Frozen Map/Set/Date instances still have mutable internal state. The envelope
// accepts plain data only so its immutability guarantee is enforceable.
assert.throws(() => createObservationEnvelope({
  source: "VisualAgent", code: "MESH_MISSING", inputs: new Map([["frame", 12]])
}), /arrays and plain objects/);
assert.throws(() => createObservationEnvelope({
  source: "VisualAgent", code: "MESH_MISSING", freshness: new Date("2026-10-16T00:00:00Z")
}), /arrays and plain objects/);
assert.throws(() => createObservationEnvelope({
  source: "VisualAgent", code: "MESH_MISSING", inputs: { nested: new Set(["x"]) }
}), /arrays and plain objects/);
assert.throws(() => createMissionCandidate({
  observation: { source: "VisualAgent", code: "MESH_MISSING" },
  claim: { details: new Map() }
}), /arrays and plain objects/);

const candidateInputObservation = {
  source: "VisualAgent",
  code: "MESH_MISSING",
  inputs: { probe: { frame: 12 } }
};
const candidate = createMissionCandidate({
  observation,
  claim: { action: "repair_visual_mesh", target: "agent-1" },
  admission: ADMISSION.NOT_ADMITTED
});
assert.equal(candidate.admission, "NOT_ADMITTED");
assert.equal(candidate.claim.action, "repair_visual_mesh");
assert.equal(candidate.observation.code, "MESH_MISSING");
assert.notEqual(candidate.observation, observation);
assert.throws(() => { candidate.observation.inputs.probe.frame = 99; }, TypeError);

// Candidate construction detaches and freezes the supplied observation instead of
// freezing the caller's object or retaining caller-owned nested references.
const detachedCandidate = createMissionCandidate({ observation: candidateInputObservation });
candidateInputObservation.inputs.probe.frame = 77;
assert.equal(detachedCandidate.observation.inputs.probe.frame, 12);
assert.equal(Object.isFrozen(candidateInputObservation), false);
assert.equal(detachedCandidate.admission, "UNKNOWN");
assert.throws(() => createMissionCandidate({
  observation: { source: "", code: "MESH_MISSING" }
}), /observation.source/);
assert.throws(() => createMissionCandidate({
  observation: { source: "VisualAgent", code: "" }
}), /observation.code/);

assert.throws(() => createObservationEnvelope({ source: "VisualAgent" }), /code/);
assert.throws(() => createMissionCandidate({ observation, admission: "FAILED" }), /invalid admission state/);

const unknownCandidate = createMissionCandidate({ observation });
assert.equal(unknownCandidate.admission, "UNKNOWN");

console.log("NEXO STEP 7 observation contract tests: PASS");

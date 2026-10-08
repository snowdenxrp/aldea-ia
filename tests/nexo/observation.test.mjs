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

const candidate = createMissionCandidate({
  observation,
  claim: { action: "repair_visual_mesh", target: "agent-1" },
  admission: ADMISSION.NOT_ADMITTED
});
assert.equal(candidate.admission, "NOT_ADMITTED");
assert.equal(candidate.claim.action, "repair_visual_mesh");
assert.equal(candidate.observation.code, "MESH_MISSING");

assert.throws(() => createObservationEnvelope({ source: "VisualAgent" }), /code/);
assert.throws(() => createMissionCandidate({ observation, admission: "FAILED" }), /invalid admission state/);

const unknownCandidate = createMissionCandidate({ observation });
assert.equal(unknownCandidate.admission, "UNKNOWN");

console.log("NEXO STEP 7 observation contract tests: PASS");

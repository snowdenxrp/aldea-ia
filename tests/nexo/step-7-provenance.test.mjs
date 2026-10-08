import assert from "node:assert/strict";
import { createObservationEnvelope, createMissionCandidate, ADMISSION } from "../../src/nexo/core/observation.mjs";

const observationA = createObservationEnvelope({
  source: "VisualAgent",
  code: "MESH_MISSING",
  severity: "error",
  target: "agent-1",
  inputs: { meshPresent: false, frame: 12 },
  freshness: { sample: "frame-12" },
  derivedProvenance: [{ field: "meshPresent", source: "scene-render" }],
  proposedAction: { action: "repair_visual_mesh", target: "agent-1" },
  explanatory: { message: "mesh missing" }
});

const observationB = createObservationEnvelope({
  source: "VisualAgent",
  code: "MESH_MISSING",
  severity: "error",
  target: "agent-1",
  inputs: { meshPresent: false, frame: 13 },
  freshness: { sample: "frame-13" },
  derivedProvenance: [{ field: "meshPresent", source: "scene-render" }],
  proposedAction: { action: "repair_visual_mesh", target: "agent-1" },
  explanatory: { message: "mesh missing at a later observation" }
});

const candidateA = createMissionCandidate({
  observation: observationA,
  claim: { action: "repair_visual_mesh", target: "agent-1" },
  admission: ADMISSION.ADMITTED,
  admissionEvidence: [{ basis: "budget-slot-1" }]
});

const candidateB = createMissionCandidate({
  observation: observationB,
  claim: { action: "repair_visual_mesh", target: "agent-1" },
  admission: ADMISSION.NOT_ADMITTED,
  admissionEvidence: [{ basis: "budget-exhausted" }]
});

// Same action+target does not establish observational equivalence.
assert.equal(candidateA.claim.action, candidateB.claim.action);
assert.equal(candidateA.claim.target, candidateB.claim.target);
assert.notDeepEqual(candidateA.observation.inputs, candidateB.observation.inputs);
assert.notDeepEqual(candidateA.observation.freshness, candidateB.observation.freshness);
assert.notDeepEqual(candidateA.observation.explanatory, candidateB.observation.explanatory);

// Provenance remains attached to each candidate.
assert.equal(candidateA.observation.source, "VisualAgent");
assert.equal(candidateA.observation.code, "MESH_MISSING");
assert.equal(candidateA.observation.derivedProvenance[0].source, "scene-render");
assert.equal(candidateB.observation.freshness.sample, "frame-13");

// Admission is explicit and bounded; NOT_ADMITTED is not another outcome name.
assert.equal(candidateA.admission, ADMISSION.ADMITTED);
assert.equal(candidateB.admission, ADMISSION.NOT_ADMITTED);
assert.notEqual(candidateB.admission, "FAILED");
assert.notEqual(candidateB.admission, "RESOLVED");
assert.notEqual(candidateB.admission, "COMMITTED");
assert.notEqual(candidateB.admission, "RETRIED");

// UNKNOWN remains explicit when classification evidence is insufficient.
const unknown = createMissionCandidate({ observation: observationA });
assert.equal(unknown.admission, ADMISSION.UNKNOWN);

// Candidate remains non-authoritative data; it has no authority/commit declaration.
assert.equal("authority" in candidateA, false);
assert.equal("commit" in candidateA, false);
assert.equal("safeCommit" in candidateA, false);

// Detached candidate data cannot mutate the source observation.
assert.throws(() => { candidateA.observation.inputs.frame = 99; }, TypeError);

console.log("NEXO STEP 7 semantic provenance tests: PASS");

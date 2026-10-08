import assert from "node:assert/strict";
import {
  createObservationEnvelope,
  createMissionCandidate,
  ADMISSION
} from "../../src/nexo/core/observation.mjs";
import {
  evaluateNegativeResourceEquivalence,
  EQUIVALENCE
} from "../../src/nexo/core/observation-equivalence.mjs";

const makeObservation = (amount = -2) => createObservationEnvelope({
  source: "EcosystemAgent",
  code: "NEGATIVE_RESOURCE",
  inputs: { resourceType: "wood", amount },
  freshness: null,
  targetIncarnation: null,
  derivedProvenance: [],
  proposedAction: { action: "repair_resource_state" }
});

const observation = makeObservation();
const comparison = evaluateNegativeResourceEquivalence(
  observation,
  makeObservation()
);

// Existing producer evidence is insufficient to establish equivalence.
assert.equal(comparison.status, EQUIVALENCE.UNKNOWN);

const candidate = createMissionCandidate({
  observation,
  claim: { action: "repair_resource_state" },
  admission: ADMISSION.UNKNOWN,
  admissionEvidence: [{
    basis: "negative-resource-equivalence",
    status: comparison.status,
    reasons: comparison.reasons
  }]
});

assert.equal(candidate.admission, ADMISSION.UNKNOWN);
assert.equal(candidate.observation.code, "NEGATIVE_RESOURCE");
assert.equal(candidate.observation.inputs.resourceType, "wood");
assert.equal(candidate.observation.inputs.amount, -2);
assert.equal(candidate.admissionEvidence[0].status, EQUIVALENCE.UNKNOWN);

// UNKNOWN equivalence is not silently converted into admission.
assert.notEqual(candidate.admission, ADMISSION.ADMITTED);
assert.notEqual(candidate.admission, ADMISSION.NOT_ADMITTED);

// The candidate carries no authority or commit capability.
assert.equal("authority" in candidate, false);
assert.equal("commit" in candidate, false);
assert.equal("safeCommit" in candidate, false);

// The original observation remains detached and immutable.
assert.throws(() => {
  candidate.observation.inputs.amount = -99;
}, TypeError);

console.log("NEXO STEP 7 negative-resource handoff tests: PASS");

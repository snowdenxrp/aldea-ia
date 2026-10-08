import assert from "node:assert/strict";
import { createObservationEnvelope } from "../../src/nexo/core/observation.mjs";
import { evaluateNegativeResourceEquivalence, EQUIVALENCE } from "../../src/nexo/core/observation-equivalence.mjs";

const make = (inputs) => createObservationEnvelope({
  source: "EcosystemAgent",
  code: "NEGATIVE_RESOURCE",
  inputs,
  freshness: null,
  targetIncarnation: null,
  derivedProvenance: []
});

const base = make({ resourceType: "wood", amount: -2 });

const differentAmount = make({ resourceType: "wood", amount: -3 });
assert.equal(
  evaluateNegativeResourceEquivalence(base, differentAmount).status,
  EQUIVALENCE.NON_EQUIVALENT
);

const differentResource = make({ resourceType: "stone", amount: -2 });
assert.equal(
  evaluateNegativeResourceEquivalence(base, differentResource).status,
  EQUIVALENCE.NON_EQUIVALENT
);

const sameAvailableFields = make({ resourceType: "wood", amount: -2 });
const incomplete = evaluateNegativeResourceEquivalence(base, sameAvailableFields);
assert.equal(incomplete.status, EQUIVALENCE.UNKNOWN);
assert.deepEqual(incomplete.reasons, ["claim_critical_dimension_missing"]);

console.log("NEXO STEP 7 negative-resource equivalence tests: PASS");

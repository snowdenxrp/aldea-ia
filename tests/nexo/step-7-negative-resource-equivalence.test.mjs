import assert from "node:assert/strict";
import { createObservationEnvelope } from "../../src/nexo/core/observation.mjs";
import { evaluateNegativeResourceEquivalence, EQUIVALENCE } from "../../src/nexo/core/observation-equivalence.mjs";

const make = (overrides = {}) => createObservationEnvelope({
  source: "EcosystemAgent",
  code: "NEGATIVE_RESOURCE",
  inputs: { resourceType: "wood", amount: -2 },
  freshness: null,
  targetIncarnation: null,
  derivedProvenance: [],
  ...overrides
});

const differentAmount = make({ inputs: { resourceType: "wood", amount: -3 } });
assert.equal(
  evaluateNegativeResourceEquivalence(make(), differentAmount).status,
  EQUIVALENCE.NON_EQUIVALENT
);

const differentResource = make({ inputs: { resourceType: "stone", amount: -2 } });
assert.equal(
  evaluateNegativeResourceEquivalence(make(), differentResource).status,
  EQUIVALENCE.NON_EQUIVALENT
);

const sameAvailableFields = make();
const sameAvailableFields2 = make();
const incomplete = evaluateNegativeResourceEquivalence(sameAvailableFields, sameAvailableFields2);
assert.equal(incomplete.status, EQUIVALENCE.UNKNOWN);
assert.deepEqual(incomplete.reasons, ["claim_critical_dimension_missing"]);

const completeA = make({
  targetIncarnation: { id: "resource-1", version: 7 },
  freshness: { revision: 12 },
  derivedProvenance: [{ source: "world.resources", revision: 12 }]
});
const completeB = make({
  targetIncarnation: { id: "resource-1", version: 7 },
  freshness: { revision: 12 },
  derivedProvenance: [{ source: "world.resources", revision: 12 }]
});
assert.equal(
  evaluateNegativeResourceEquivalence(completeA, completeB).status,
  EQUIVALENCE.EQUIVALENT
);

const differentIncarnation = make({
  targetIncarnation: { id: "resource-2", version: 7 },
  freshness: { revision: 12 },
  derivedProvenance: [{ source: "world.resources", revision: 12 }]
});
assert.equal(
  evaluateNegativeResourceEquivalence(completeA, differentIncarnation).status,
  EQUIVALENCE.NON_EQUIVALENT
);

console.log("NEXO STEP 7 negative-resource equivalence tests: PASS");

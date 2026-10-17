import assert from "node:assert/strict";
import {
  EQUIVALENCE,
  evaluateNegativeResourceEquivalence
} from "../../src/nexo/core/observation-equivalence.mjs";

function observation(overrides = {}) {
  return {
    source: "ResourceAgent",
    code: "NEGATIVE_RESOURCE",
    inputs: { resourceType: "water", amount: 0 },
    targetIncarnation: { resourceId: "well-1", generation: 3 },
    freshness: { snapshot: "world-revision-14" },
    derivedProvenance: [{ field: "amount", source: "resource-scan-4" }],
    ...overrides
  };
}

{
  const result = evaluateNegativeResourceEquivalence(
    observation(),
    observation()
  );
  assert.equal(result.status, EQUIVALENCE.EQUIVALENT);
  assert.deepEqual(result.reasons, []);
  assert.throws(() => { result.reasons.push("mutate"); }, TypeError);
}

{
  const result = evaluateNegativeResourceEquivalence(
    observation(),
    observation({ inputs: { resourceType: "ore", amount: 0 } })
  );
  assert.equal(result.status, EQUIVALENCE.NON_EQUIVALENT);
  assert.deepEqual(result.reasons, ["resource_type_differs"]);
}

{
  const result = evaluateNegativeResourceEquivalence(
    observation(),
    observation({ inputs: { resourceType: "water", amount: 5 } })
  );
  assert.equal(result.status, EQUIVALENCE.NON_EQUIVALENT);
  assert.deepEqual(result.reasons, ["observed_amount_differs"]);
}

{
  const result = evaluateNegativeResourceEquivalence(
    observation(),
    observation({ targetIncarnation: { resourceId: "well-1", generation: 4 } })
  );
  assert.equal(result.status, EQUIVALENCE.NON_EQUIVALENT);
  assert.deepEqual(result.reasons, ["resource_incarnation_differs"]);
}

{
  const result = evaluateNegativeResourceEquivalence(
    observation(),
    observation({ freshness: { snapshot: "world-revision-15" } })
  );
  assert.equal(result.status, EQUIVALENCE.NON_EQUIVALENT);
  assert.deepEqual(result.reasons, ["freshness_differs"]);
}

{
  const result = evaluateNegativeResourceEquivalence(
    observation(),
    observation({ derivedProvenance: [{ field: "amount", source: "resource-scan-5" }] })
  );
  assert.equal(result.status, EQUIVALENCE.NON_EQUIVALENT);
  assert.deepEqual(result.reasons, ["causal_dependency_differs"]);
}

{
  const result = evaluateNegativeResourceEquivalence(
    observation(),
    observation({ source: "DifferentProducer" })
  );
  assert.equal(result.status, EQUIVALENCE.NON_EQUIVALENT);
  assert.deepEqual(result.reasons, ["source_or_code_differs"]);
}

{
  const incomplete = observation();
  delete incomplete.freshness;
  const result = evaluateNegativeResourceEquivalence(incomplete, observation());
  assert.equal(result.status, EQUIVALENCE.UNKNOWN);
  assert.deepEqual(result.reasons, ["claim_critical_dimension_missing"]);
}

{
  const result = evaluateNegativeResourceEquivalence(
    observation({ code: "OTHER_FINDING" }),
    observation()
  );
  assert.equal(result.status, EQUIVALENCE.UNKNOWN);
  assert.deepEqual(result.reasons, ["unsupported_or_missing_observation"]);
}

{
  const result = evaluateNegativeResourceEquivalence(null, observation());
  assert.equal(result.status, EQUIVALENCE.UNKNOWN);
  assert.deepEqual(result.reasons, ["unsupported_or_missing_observation"]);
}


{
  // Maps can stringify identically despite carrying different internal state.
  // They are not admissible observation data and must never prove equivalence.
  const left = observation({ targetIncarnation: new Map([["generation", 1]]) });
  const right = observation({ targetIncarnation: new Map([["generation", 2]]) });
  const result = evaluateNegativeResourceEquivalence(left, right);
  assert.equal(result.status, EQUIVALENCE.UNKNOWN);
  assert.deepEqual(result.reasons, ["malformed_observation_data"]);
}

{
  const result = evaluateNegativeResourceEquivalence(
    observation({ freshness: new Date("2026-10-17T00:00:00Z") }),
    observation()
  );
  assert.equal(result.status, EQUIVALENCE.UNKNOWN);
  assert.deepEqual(result.reasons, ["malformed_observation_data"]);
}

{
  const cyclic = observation();
  cyclic.inputs.loop = cyclic;
  const result = evaluateNegativeResourceEquivalence(cyclic, observation());
  assert.equal(result.status, EQUIVALENCE.UNKNOWN);
  assert.deepEqual(result.reasons, ["malformed_observation_data"]);
}

{
  // Valid JSON arrays with multiple entries must remain admissible.
  const left = observation({ derivedProvenance: [
    { field: "amount", source: "scan-1" },
    { field: "resourceType", source: "scan-2" }
  ] });
  const right = observation({ derivedProvenance: [
    { field: "amount", source: "scan-1" },
    { field: "resourceType", source: "scan-2" }
  ] });
  const result = evaluateNegativeResourceEquivalence(left, right);
  assert.equal(result.status, EQUIVALENCE.EQUIVALENT);
  assert.deepEqual(result.reasons, []);
}

{
  // Plain-record key order is representational, not semantic.
  const result = evaluateNegativeResourceEquivalence(
    observation({ targetIncarnation: { resourceId: "well-1", generation: 3 } }),
    observation({ targetIncarnation: { generation: 3, resourceId: "well-1" } })
  );
  assert.equal(result.status, EQUIVALENCE.EQUIVALENT);
}

console.log("NEXO M0 observation-equivalence contract tests: PASS");

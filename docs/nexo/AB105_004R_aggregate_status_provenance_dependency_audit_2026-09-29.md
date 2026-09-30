# AB105.004R — aggregate drift status requires dependency provenance; status alone does not expose the evidence set

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When CloudFormation exposes an aggregate stack drift status, can that status alone be treated as the complete evidence object, or must the supporting observations and their scope remain reconstructable?

## Fresh evidence
AWS states that a stack is considered drifted when one or more resources drift, while `IN_SYNC` means the current configuration of each supported resource matches expected configuration. The drift operation has its own detection ID, status, timestamp, and optional logical-resource-ID filter. Resource-drift results separately identify the resources that were actually checked. citeturn0search0turn0search2turn0search5

## Findings
1. An aggregate status is a derived claim over a population of resource observations; it is not itself equivalent to the complete set of observations.
2. The detection ID, timestamp, filter/scope, and resource-level results are distinct evidence dimensions and must remain associated with the aggregate claim.
3. `IN_SYNC` can only mean consistency over the supported/selected population covered by that detection operation; unsupported or unselected resources remain outside the claim.
4. Reconstructability matters: without the supporting evidence set and scope, a later consumer cannot determine what population justified the aggregate status.
5. Therefore Nexo should model aggregate evidence as a claim with explicit dependencies rather than as a primitive fact.
6. A derived claim should retain provenance links to the observation events from which it was calculated and preserve the coverage denominator used at derivation time.
7. Later evidence may supersede or invalidate a derived claim for a new decision, but must not rewrite the historical dependency graph that produced the earlier claim.
8. No new top-level interaction class is justified; this is a provenance/dependency refinement of I19/I21/I22 and classes 7, 12, 17, 19.

## Anti-collapse
`AGGREGATE_STATUS != PRIMITIVE_OBSERVATION`
`IN_SYNC_CLAIM != UNIVERSAL_STATE`
`DETECTION_ID != EVIDENCE_SET`
`CURRENT_STATUS != COMPLETE_PROVENANCE`
`LATER_EVIDENCE != HISTORICAL_REWRITE`
`DERIVED_CLAIM != SOURCE_OBSERVATION`
`COVERAGE_SCOPE != TARGET_NAME`
`UNKNOWN != FAILED`

## Nexo implication
An aggregate evidence object should conceptually bind:
`claim_id + derivation_time + operation_id + scope/coverage + supporting_evidence_ids + authority + freshness + derivation_rule`.

A decision consuming the aggregate claim must be able to determine what evidence population supported it. If the dependency set is unavailable or incomplete, the claim's evidentiary strength must be downgraded rather than silently treated as a primitive observation.

## Classification
Primary: I19, I21, I22.
Interactions: classes 7, 12, 17, 19.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB105.004R establishes that aggregate status needs provenance dependencies. Nexo must preserve not only the resulting status but also the operation identity, observation scope, supporting evidence set, derivation rule, authority, and freshness that justify the claim. An aggregate status without reconstructable dependencies must not be treated as equivalent to a primitive observation.

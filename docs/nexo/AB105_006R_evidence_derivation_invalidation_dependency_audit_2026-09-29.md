# AB105.006R — derived evidence must carry dependency invalidation semantics

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When an aggregate claim is derived from a set of resource observations, what happens to that claim when one supporting observation becomes stale, changes, or is superseded?

## Fresh evidence
AWS CloudFormation exposes resource drift observations with an explicit detection timestamp, and `DescribeStackResourceDrifts` returns only resources that have actually been checked. A new drift operation produces a new detection result ID. AWS also permits individual-resource drift checks, which can change the aggregate stack drift state without rechecking every resource. citeturn0search0turn0search1turn0search2

## Findings
1. An aggregate claim is derived from a bounded dependency set; it is not an independent timeless observation.
2. If a supporting observation is superseded or becomes outside its freshness contract, the derived claim may become stale even if its stored value has not changed.
3. A new observation of one member does not automatically establish that all sibling dependencies remain valid.
4. Therefore derived claims need dependency lineage and invalidation/revalidation semantics.
5. A claim should not silently retain authoritative status merely because its underlying value is unchanged; validity depends on the status of its evidence dependencies.
6. Revalidation is a new evidence/derivation event and should preserve the prior claim as historical rather than overwrite it.
7. This directly strengthens the Evidence Dependency Graph and Claim Contract concepts: dependency freshness and scope are inputs to claim validity.
8. No new top-level interaction class is justified; this is a provenance/temporal dependency refinement of I19/I21/I22 and classes 7, 12, 17, 19.

## Anti-collapse
DERIVED_CLAIM != INDEPENDENT_OBSERVATION
VALUE_UNCHANGED != EVIDENCE_STILL_VALID
DEPENDENCY_STALE != CLAIM_CURRENT
MEMBER_RECHECK != ALL_DEPENDENCIES_RECHECKED
REVALIDATION != HISTORICAL_OVERWRITE
NEW_EVIDENCE != RETROACTIVE_PROOF
UNKNOWN != FAILED

## Nexo implication
Conceptually, a claim should retain:
`claim_id + derivation_rule + dependency_ids + dependency_scope + dependency_freshness + observation_times + authority + validity_status`.

If a dependency becomes stale/invalid, the claim must transition according to an explicit policy (for example `STALE`, `PENDING_REVALIDATION`, or `UNKNOWN`) rather than silently remaining authoritative.

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
AB105.006R establishes dependency invalidation as part of evidence semantics: a derived claim's validity depends on the current validity, scope, and freshness of the observations from which it was derived. Nexo must preserve lineage and explicitly manage stale or superseded dependencies instead of silently treating an old aggregate claim as current truth.

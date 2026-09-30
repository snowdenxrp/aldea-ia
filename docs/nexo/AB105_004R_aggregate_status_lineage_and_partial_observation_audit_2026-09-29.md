# AB105.004R — aggregate status is derived evidence and must retain lineage to the supporting observation set

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When a stack-level drift status changes because one or more individual resources were checked, can the aggregate status be treated as an independent full-scope observation, or must it retain lineage to the resource observations that produced it?

## Fresh evidence
AWS states that stack drift status is based on the drift status of its resources: a stack is `DRIFTED` if one or more resources have drifted. AWS also documents that detecting drift on an individual resource updates the overall stack drift status; a stack can move from `IN_SYNC` to `DRIFTED`, or back to `IN_SYNC`, after checking only the relevant resource again. AWS separately states that `DescribeStackResourceDrifts` returns only resources that have been checked, while resources not yet checked are not included. citeturn0search9turn0search2

The `DescribeStackDriftDetectionStatus` API further states that filtered drift detection checks only the supplied logical resource IDs, while `DETECTION_COMPLETE` means completion for the resources included in that operation that support detection. citeturn0search1

## Findings
1. Aggregate stack status can be derived from a subset of resource observations; it is not necessarily the result of a fresh complete-stack scan.
2. A transition to `IN_SYNC` can therefore be caused by rechecking a previously drifted resource without re-observing every other resource.
3. The aggregate status must retain lineage to the observations and coverage assumptions supporting it.
4. An aggregate status without its supporting evidence set is insufficient to reconstruct what population was actually observed at the time of the status transition.
5. A decision layer must not silently treat aggregate status as a universal direct observation.
6. This strengthens the Evidence Dependency Graph requirement: derived claims need explicit parent evidence, derivation rule, scope, freshness, and authority.
7. No new top-level interaction class is justified. This is a provenance/derived-claim refinement of I19/I21/I22 and classes 7, 12, 17, 19.

## Anti-collapse
AGGREGATE_STATUS != DIRECT_OBSERVATION
STACK_IN_SYNC != FULL_RESCAN
DERIVED_CLAIM != SOURCE_OBSERVATION
STATUS_TRANSITION != UNIVERSAL_REOBSERVATION
AGGREGATE_VALUE != COMPLETE_LINEAGE
PARTIAL_SUPPORT != GLOBAL_COVERAGE
LATER_DERIVATION != EARLIER_FULL_OBSERVATION
UNKNOWN != FAILED

## Nexo implication
A derived evidence object should conceptually bind:
`claim_id + derivation_rule + parent_evidence_set + coverage_set + observation_times + authority + freshness`.

If parent evidence is partial, the derived claim inherits that scope unless an explicit, separately evidenced rule establishes broader coverage. Aggregate labels must never erase the provenance and coverage of the observations from which they were derived.

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
AB105.004R establishes that aggregate status is derived evidence, not automatically a fresh global observation. Nexo must preserve lineage from aggregate claims to the exact observations, scope, freshness and authority that support them.

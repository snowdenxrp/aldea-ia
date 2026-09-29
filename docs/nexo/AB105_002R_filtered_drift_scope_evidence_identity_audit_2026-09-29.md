# AB105.002R — filtered/partial drift checks cannot be promoted to whole-resource coverage

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does a successful drift operation prove coverage of the entire target when the operation can be filtered to selected logical resource IDs?

## Fresh evidence
AWS documents that `DetectStackDrift` can be run for all supported resources or with logical-resource-ID filters. When filters are supplied, only those resources are checked for drift. `DescribeStackDriftDetectionStatus` explicitly states that `DETECTION_COMPLETE` means completion for the resources in the operation that support drift detection, and if logical IDs were supplied, only those logical IDs are checked. citeturn0search2turn0search5

AWS also states that nested stacks are not included in a parent-stack drift operation and must be checked separately. citeturn0search1turn0search5

## Findings
1. A completed drift operation can be intentionally partial because the caller selected a subset of resources.
2. Therefore `DETECTION_COMPLETE` is an operation-completion fact, not a universal coverage fact.
3. The coverage denominator must include the actual resource-selection scope, not merely the parent stack identifier.
4. A later full-stack check is a new observation and cannot retroactively change the scope of the earlier filtered result.
5. Nested stacks create another explicit boundary: parent-stack coverage does not imply nested-stack coverage.
6. This makes operation parameters part of evidence provenance: the same stack with different filters represents different observation claims.
7. No new top-level interaction class is justified. This is a provenance/coverage refinement of I19/I21/I22 and classes 7, 12, 17, 19.

## Anti-collapse
`DETECTION_COMPLETE(filtered) != DETECTION_COMPLETE(all_supported)`
`FILTERED_SCOPE != PARENT_STACK_SCOPE`
`PARENT_STACK_CHECK != NESTED_STACK_CHECK`
`OPERATION_SUCCESS != UNIVERSAL_COVERAGE`
`LATER_FULL_CHECK != EARLIER_FULL_COVERAGE`
`SAME_STACK_ID != SAME_EVIDENCE_SCOPE`
`UNKNOWN != FAILED`

## Nexo implication
Evidence identity should bind not only source and timestamp but also the observation operation's scope/parameters. A useful conceptual tuple is:
`(evidence_id, source, operation, target, selection_scope, observation_time, authority, result)`.

A decision contract must reject silent scope widening. If an evidence object covers only a subset, downstream reasoning may use it only for that subset unless an explicit relation establishes broader coverage.

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
AB105.002R establishes that observation scope is part of evidence identity. A successful filtered operation is not evidence about unselected resources, and a parent-stack observation is not evidence about nested stacks. Nexo must preserve selection scope and prevent silent widening from partial observation to global claim.

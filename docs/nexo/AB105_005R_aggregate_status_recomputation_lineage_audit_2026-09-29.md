# AB105.005R — aggregate status recomputation must preserve dependency lineage

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When an aggregate status changes after a partial resource observation, can the new aggregate value be treated as a fresh universal observation, or must its derivation and supporting evidence remain explicit?

## Fresh evidence
AWS documents that individual-resource drift detection updates the overall stack drift status. A stack can therefore move from DRIFTED to IN_SYNC after the resource responsible for the drift is corrected and checked again, without rerunning drift detection over the entire stack. AWS also states that `DescribeStackResourceDrifts` returns information only for resources that have been checked; resources not yet checked are not included. citeturn0search4turn0search0

## Findings
1. An aggregate status may be recomputed from a changed subset of underlying observations.
2. The new aggregate value is a derived claim, not necessarily a new observation of every member of the aggregate population.
3. Therefore aggregate recomputation must retain its dependency set and derivation rule.
4. If the dependency set is partial, the aggregate claim must not silently acquire broader coverage than the rule and evidence support.
5. A later direct observation of one member does not establish unchanged state for unobserved members.
6. The Evidence Dependency Graph must distinguish source observations from derived aggregate claims and preserve invalidation/recomputation relationships.
7. No new top-level interaction class is justified. This refines I19/I21/I22 and classes 7, 12, 17, 19.

## Anti-collapse
AGGREGATE_RECOMPUTATION != FULL_REOBSERVATION
DERIVED_STATUS != DIRECT_OBSERVATION
UPDATED_MEMBER != ALL_MEMBERS_REOBSERVED
NEW_AGGREGATE_VALUE != NEW_UNIVERSAL_EVIDENCE
DERIVATION_RULE != OBSERVATION_MECHANISM
PARTIAL_DEPENDENCY_SET != COMPLETE_COVERAGE
UNKNOWN != FAILED

## Nexo implication
A derived evidence claim should bind at least:
`claim_id + derivation_rule + dependency_set + dependency_scope + observation_times + freshness + authority`.

When a dependency changes, the system should be able to identify which aggregate claims become stale or require recomputation. A new aggregate value must not erase the provenance of the observations from which it was derived.

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
AB105.005R establishes that aggregate-state recomputation is itself a derived-evidence event. Nexo must preserve dependency lineage and distinguish recomputation from full re-observation, preventing a partial update from being silently promoted into universal evidence.

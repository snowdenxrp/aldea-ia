# AB105.003R — aggregate drift status can change from a single resource observation; aggregate state is derived, not independent evidence

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If drift is checked on an individual resource, can the resulting stack-level drift status change without a full-stack detection operation, and what does that imply for interpreting aggregate status as evidence?

## Fresh evidence
AWS documents that `DetectStackResourceDrift` checks an individual resource and updates the overall stack drift status when applicable. AWS gives the concrete example that a stack marked `IN_SYNC` can become `DRIFTED` after a single-resource drift check finds a change; conversely, if that resource is restored and checked again, CloudFormation can update both the resource and stack drift status back to `IN_SYNC` without requiring drift detection for the entire stack. citeturn0search9

AWS separately states that `DescribeStackResourceDrifts` returns drift information for resources that have actually been checked; resources not yet checked are not included, and unsupported resources are not checked. citeturn0search5

## Findings
1. Stack-level drift status is an aggregate/derived state that can be affected by a single-resource observation.
2. A current aggregate `IN_SYNC` value therefore does not, by itself, identify which resources were most recently observed or establish a contemporaneous full-stack observation.
3. Resource-level observations can update aggregate state without producing a new full-stack coverage event.
4. Conversely, a stack-level aggregate can retain unresolved coverage boundaries even while its current status is `IN_SYNC`.
5. Therefore aggregate state and observation coverage must remain separate evidence dimensions.
6. A decision consuming aggregate state must know the observation lineage/coverage that supports the aggregate value; otherwise the aggregate can be over-interpreted as a fresh complete scan.
7. A later single-resource observation that changes aggregate status is new evidence about that resource and an aggregate derivation event; it does not establish simultaneous observation of all other resources.
8. No new top-level interaction class is justified. This refines I19/I21/I22 and classes 7, 12, 17, 19.

## Anti-collapse
`STACK_IN_SYNC != FULL_STACK_JUST_SCANNED`
`AGGREGATE_STATUS != COVERAGE_SET`
`RESOURCE_OBSERVATION != FULL_STACK_OBSERVATION`
`AGGREGATE_UPDATE != UNIVERSAL_REOBSERVATION`
`CURRENT_AGGREGATE != COMPLETE_LINEAGE`
`SINGLE_RESOURCE_CHECK != ALL_RESOURCES_CHECKED`
`UNKNOWN != FAILED`

## Nexo implication
Aggregate claims should carry derivation lineage, not just a Boolean/status. Conceptually:
`aggregate_status + derivation_event + supporting_evidence_set + coverage_set + freshness`.

A policy/decision layer must not treat a derived aggregate as if it were itself a direct observation over the entire population.

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
AB105.003R establishes that aggregate operational/evidence status can be updated from narrower observations. Therefore aggregate state needs explicit derivation lineage and coverage metadata; it must not be mistaken for a fresh universal observation. Nexo should preserve the distinction between direct evidence, derived aggregate state, and the population actually covered.

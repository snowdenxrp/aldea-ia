# AB104.999R — evidence-coverage UNKNOWN has multiple causes; NOT_CHECKED must preserve its reason/scope

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does a generic NOT_CHECKED/UNKNOWN state have one semantic meaning, or must Nexo preserve why evidence is unavailable and what population was actually covered?

## Fresh evidence
AWS CloudFormation distinguishes drift statuses including `NOT_CHECKED`, `UNKNOWN`, `IN_SYNC`, `MODIFIED`, and `DELETED`. `NOT_CHECKED` means CloudFormation has not checked whether actual configuration differs from expected configuration; `UNKNOWN` means drift detection could not be run for a resource. AWS further states that resources included in `ResourcesToSkip` during `ContinueUpdateRollback` receive `NOT_CHECKED`, while resources that do not support drift detection also receive `NOT_CHECKED`. citeturn0search0turn0search1

AWS also states that drift detection results are available only for resources on which detection successfully completed, and that drift detection covers only supported resources/properties. citeturn0search0turn0search3

## Findings
1. `NOT_CHECKED` is not a single causal condition: it can mean the resource was intentionally skipped during rollback or that its type does not support drift detection.
2. `UNKNOWN` has a different semantic cause: detection could not run for the resource.
3. Therefore an evidence state needs at least status + reason/scope, rather than a bare Boolean checked/not-checked flag.
4. Coverage must be represented explicitly: a stack-level `IN_SYNC` claim is bounded by the resources/properties that CloudFormation can actually inspect.
5. An unresolved subset cannot be silently promoted to covered evidence merely because the aggregate orchestration state is terminal.
6. Later successful detection creates new evidence with a new observation time; it does not retroactively change what was known at the earlier checkpoint.
7. This is directly relevant to Nexo's Evidence Dependency Graph: unresolved nodes need provenance explaining whether they were skipped, unsupported, failed-to-observe, stale, or otherwise outside the authority/coverage boundary.
8. No new top-level interaction class is justified. This is an epistemic/provenance refinement of I19/I21/I22 and classes 7, 12, 17, 19.

## Anti-collapse
NOT_CHECKED != UNKNOWN
NOT_CHECKED != IN_SYNC
UNKNOWN != ABSENCE
UNSUPPORTED != PROVEN_CLEAR
SKIPPED != VERIFIED
AGGREGATE_STATUS != COMPLETE_COVERAGE
LATER_OBSERVATION != EARLIER_KNOWLEDGE
NO_COVERAGE_REASON != NO_PROBLEM

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
AB104.999R establishes that UNKNOWN/NOT_CHECKED must not be flattened into one generic absence state. Nexo should preserve the cause, scope, timestamp, authority and coverage boundary of missing evidence. This is necessary to prevent a terminal aggregate status from silently converting incomplete observation into a safety claim.

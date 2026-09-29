# AB105.000R — aggregate drift completion is coverage-bounded, not universal state proof

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does `DETECTION_COMPLETE` or an aggregate `IN_SYNC` drift result prove that every relevant resource/property and every nested domain is covered and consistent?

## Fresh evidence
AWS states that `DETECTION_COMPLETE` means drift detection successfully completed for all resources that support drift detection, while resources that do not support detection remain unchecked. AWS also states that nested stacks are not checked by a parent-stack drift operation and must be checked separately. Only explicitly specified template properties are compared; defaults and some properties that cannot be mapped back to template values are outside the comparison boundary. citeturn0search0turn0search6turn0search12

AWS's API further distinguishes `IN_SYNC` from `NOT_CHECKED`, `UNKNOWN`, and `UNSUPPORTED`, and records a `LastCheckTimestamp`, making the observation boundary explicit. citeturn0search1turn0search4

## Findings
1. `DETECTION_COMPLETE` means completion of the supported detection operation, not universal inspection of every possible state dimension.
2. `IN_SYNC` is bounded by the resources and properties actually covered by the drift mechanism.
3. Nested stacks can remain outside the parent operation's observation boundary.
4. Unsupported resources/properties and unspecified/default values can remain outside comparison even when the supported detection operation completes.
5. Therefore an aggregate terminal observation must carry an explicit coverage set/denominator; otherwise `IN_SYNC` can be over-interpreted as a global safety claim.
6. This directly reinforces the Nexo requirement that evidence claims be scoped to their authority, observation mechanism, time, and covered population.
7. A later expanded observation is new evidence and does not retroactively expand the earlier observation's coverage.
8. No new top-level interaction class is justified; this is a coverage/provenance refinement of I19/I21/I22 and classes 7, 12, 17, 19.

## Anti-collapse
DETECTION_COMPLETE != UNIVERSAL_OBSERVATION
IN_SYNC_SUPPORTED_SET != GLOBAL_IN_SYNC
PARENT_STACK_CHECK != NESTED_STACK_CHECK
SUPPORTED_PROPERTIES != ALL_PROPERTIES
TERMINAL_DETECTION != COMPLETE_COVERAGE
CURRENT_OBSERVATION_SCOPE != HISTORICAL_SCOPE
LATER_EXPANDED_CHECK != EARLIER_COVERAGE
UNKNOWN != FAILED

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
AB105.000R establishes the next boundary: aggregate evidence must carry its coverage denominator and scope. A completed detection operation or `IN_SYNC` result is authoritative only for the population and properties its mechanism actually observes. Nexo must never silently widen a bounded observation into a universal claim.

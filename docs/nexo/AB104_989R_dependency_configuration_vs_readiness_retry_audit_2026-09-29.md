# AB104.989R — dependency satisfaction is not dependency readiness

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When CloudFormation Express Mode confirms that a referenced resource's configuration is applied before starting a dependent resource, does that dependency boundary prove that the referenced resource is fully ready for the dependent operation?

## Fresh evidence
AWS documents that Express Mode respects resource dependencies: when a resource references another resource's ID or attribute, CloudFormation confirms that the referenced resource's configuration is applied before starting the dependent resource. AWS simultaneously states that Express Mode does not wait for full resource stabilization and that dependent resources can encounter transient failures when the referenced resource is not yet ready; CloudFormation retries such dependent operations. AWS's June 2026 launch material likewise states that resources continue becoming operational in the background and that dependent-resource retries handle timing issues during stabilization.

## Findings
1. Express Mode establishes a dependency boundary at configuration application, not necessarily at full runtime readiness.
2. A dependent operation can therefore legitimately begin while the referenced resource is still stabilizing.
3. A transient dependent failure followed by retry is consistent with the documented orchestration semantics; it does not by itself prove that the dependency was incorrectly declared or that the earlier configuration-complete observation was false.
4. Dependency satisfaction and dependency readiness are separate evidence claims.
5. A successful retry proves the dependent operation reached its own applicable success boundary; it does not retroactively prove that the dependency was fully ready at the first attempt unless additional evidence establishes that fact.
6. The dependency edge therefore needs temporal semantics: configuration dependency, readiness dependency, and effect dependency are not interchangeable.
7. No new top-level interaction class is justified. The result reinforces I7/I19/I21/I22 and classes 7, 8, 11, 17, 19; class 20 remains conditional.

## Anti-collapse
DEPENDENCY_CONFIGURED != DEPENDENCY_READY
DEPENDENCY_SATISFIED != RUNTIME_READY
FIRST_ATTEMPT_FAILURE != INVALID_DEPENDENCY
RETRY_SUCCESS != RETROACTIVE_FIRST_ATTEMPT_READINESS
DEPENDENCY_EDGE != GLOBAL_SERIALIZATION
ORCHESTRATION_RETRY != EFFECT_HISTORY_ERASURE
UNKNOWN != FAILED

## Classification
Primary: I7, I19, I21, I22.
Interactions: classes 7, 8, 11, 17, 19.
Conditional: class 20 only where an explicitly declared atomic boundary spans dependency readiness and the dependent external effect.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.989R establishes a concrete temporal distinction in orchestration: an Express Mode dependency can be satisfied when configuration is confirmed even while the dependency continues stabilizing. CloudFormation may then retry the dependent operation if readiness has not yet arrived. Nexo must therefore model dependency edges with explicit semantic and temporal scope rather than treating dependency satisfaction as universal readiness.

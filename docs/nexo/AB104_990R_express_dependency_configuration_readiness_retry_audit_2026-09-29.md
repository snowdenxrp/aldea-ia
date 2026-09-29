# AB104.990R — explicit dependency readiness boundary does not eliminate background effect concurrency

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does CloudFormation Express Mode's dependency handling convert a dependent resource's successful start into proof that the referenced resource is fully ready, or can CloudFormation proceed after configuration is applied while readiness continues and retry transient dependency failures?

## Fresh evidence
AWS documents that Express Mode respects declared resource dependencies, but for Ref/Fn::GetAtt dependencies it confirms that the referenced resource's configuration is applied before starting the dependent resource. AWS separately states that resources may still be initializing or propagating changes after an Express operation completes, and that dependent resources can encounter transient failures because Express Mode does not wait for full stabilization; CloudFormation may retry such operations. STANDARD, by contrast, waits for resources to be ready to serve traffic before completing.

## Findings
1. A declared dependency in Express Mode establishes a configuration-order boundary, not universal runtime-readiness ordering.
2. A dependent operation may therefore begin after configuration is applied while the referenced resource continues asynchronous readiness work.
3. A transient downstream failure followed by retry is compatible with the documented Express semantics; it does not by itself prove that the dependency relation was violated.
4. Therefore dependency satisfaction, resource readiness, downstream success, and eventual convergence are distinct evidence states.
5. A successful dependent operation later in time does not retroactively prove that the dependency was fully operational at its initial start.
6. The deployment mode and dependency mechanism are part of the provenance needed to interpret the event sequence.
7. No new top-level interaction class is justified. The finding reinforces I7/I19/I21/I22 and classes 7, 8, 11, 12, 16, 17, 19; class 20 remains conditional.

## Anti-collapse
DEPENDENCY_SATISFIED != RUNTIME_READY
CONFIGURATION_ORDER != READINESS_ORDER
DEPENDENT_START != DEPENDENCY_OPERATIONAL
TRANSIENT_RETRY != DEPENDENCY_VIOLATION
LATER_SUCCESS != EARLIER_READINESS_PROOF
EXPRESS_SUCCESS != QUIESCENCE
UNKNOWN != FAILED

## Classification
Primary: I7, I19, I21, I22.
Interactions: classes 7, 8, 11, 12, 16, 17, 19.
Conditional: class 20 only where an explicit contract makes the dependency and downstream effect boundary atomic.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.990R establishes that Express Mode dependency handling provides a configuration-order guarantee, not a universal runtime-readiness guarantee. CloudFormation may begin dependent work while the referenced resource is still stabilizing and may retry transient failures. Nexo must preserve dependency semantics, readiness semantics, retry history, and deployment mode as separate evidence rather than collapsing them into one ordering fact.

# AB104.980R — handler SUCCESS may depend on stabilization semantics, not merely request dispatch

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does Cloud Control SUCCESS have one universal meaning for downstream completion, or can the resource type's stabilization contract determine what SUCCESS actually establishes?

## Fresh evidence
AWS ProgressEvent defines SUCCESS as the resource operation having successfully completed, while the Cloud Control API exposes a NotStabilized error when a downstream resource fails to complete all of its ready-state checks. AWS documents that resource handlers can perform multiple calls to underlying services and that resource operation requests are asynchronous. The UpdateResource API also distinguishes handler/service failures and NotStabilized from the generic terminal status. These contracts show that Cloud Control's terminal status is mediated by resource-handler semantics, including stabilization, rather than being a universal statement about every external side effect that may exist beyond the handler's declared resource boundary.

## Findings
1. SUCCESS is a terminal status of the Cloud Control resource operation request under the resource-handler contract.
2. The existence of NotStabilized demonstrates that readiness/stabilization is part of the resource-operation semantics for applicable handlers.
3. Therefore SUCCESS can establish stronger evidence than mere request dispatch for the resource state covered by that handler contract.
4. However, it still does not universally establish completion of effects outside the handler/resource contract, such as independent downstream workflows, later external mutations, or effects whose lifecycle is not represented by the resource's stabilization semantics.
5. Consequently, the evidentiary strength of SUCCESS is resource-contract dependent; Nexo must not assign it one universal global meaning.
6. A provider-specific contract may explicitly bind SUCCESS to downstream completion. Such a contract is evidence that can close a particular boundary, but it must be recorded with scope and semantics.
7. No new top-level interaction class is justified. This refines I19/I21/I22 and classes 11, 12, 17, 19; class 20 remains conditional.

## Anti-collapse
SUCCESS != UNIVERSAL_EFFECT_COMPLETION
NOT_STABILIZED != GENERIC_FAILURE
HANDLER_SUCCESS != ALL_EXTERNAL_EFFECTS_COMMITTED
RESOURCE_STABILIZATION != GLOBAL_SYSTEM_STABILIZATION
CONTRACT_SCOPED_SUCCESS != TIMELESS_GLOBAL_FACT
RESOURCE_HANDLER_BOUNDARY != ALL_DOWNSTREAM_DOMAINS
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22.
Interactions: I15; classes 11, 12, 17, 19.
Conditional: class 20 where a declared atomic boundary crosses the handler/resource boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.980R narrows the prior claim: Cloud Control SUCCESS is meaningful terminal evidence within the resource-handler contract, and stabilization can be part of that contract, but SUCCESS is not a universal oracle for every external effect. Nexo must attach terminal-status claims to an explicit semantic boundary and preserve UNKNOWN outside that boundary.

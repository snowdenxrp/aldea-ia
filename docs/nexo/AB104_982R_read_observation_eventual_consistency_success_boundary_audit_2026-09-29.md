# AB104.982R — desired-state SUCCESS verification can be bounded by read-observation semantics

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When CloudFormation verifies desired state through a Read handler before returning SUCCESS, does that Read observation universally prove that the underlying resource has globally reached the requested state and that no later/intervening mutation exists?

## Fresh evidence
AWS states that desired-state stabilization for Create/Update is verified by calling the Read handler. AWS also explicitly documents eventual consistency: an API command's result may not be immediately visible to subsequent commands, and this visibility issue is part of desired-state stabilization. AWS further distinguishes desired-state stabilization from runtime-state stabilization and notes that additional mutating calls or dependent-resource consumption may occur as part of runtime behavior.

## Findings
1. CloudFormation's desired-state SUCCESS boundary is explicitly tied to the handler's Read-based verification contract.
2. Read verification is an observation of resource state; AWS explicitly recognizes eventual-consistency boundaries around that observation.
3. Therefore READ_SUCCESS_AT_T != GLOBAL_STATE_STABILITY_AT_ALL_TIMES.
4. A successful Read establishes that the required representation was observed under the handler/provider semantics at the relevant observation point; it does not by itself prove absence of an intervening or subsequent mutation outside that serialization boundary.
5. A resource-specific provider may have stronger consistency/serialization guarantees. If those are explicitly documented, they can strengthen the evidence for that provider/resource boundary.
6. The distinction is therefore between observed desired state, the provider's consistency contract, and global historical/effect truth.
7. No new top-level interaction class is justified. The finding reinforces I19/I21/I22 and classes 7, 11, 12, 17, 19; class 20 remains conditional on an explicitly declared cross-domain atomic boundary.

## Anti-collapse
READ_SUCCESS != GLOBAL_STATE_STABILITY
OBSERVED_DESIRED_STATE != COMPLETE_HISTORY
EVENTUAL_CONSISTENCY != ABSENCE_OF_EFFECT
READ_OBSERVATION != SERIALIZATION_PROOF
SUCCESS_AT_T != SUCCESS_FOR_ALL_FUTURE_T
RESOURCE_CONSISTENCY_CONTRACT != GLOBAL_CONSISTENCY
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22.
Interactions: classes 7, 11, 12, 17, 19.
Conditional: class 20 where a declared atomic boundary explicitly spans the observation and external-effect domains.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.982R establishes that desired-state SUCCESS is an observation-bound contractual claim, not a timeless global state claim. CloudFormation's Read-based stabilization is meaningful evidence within the provider/resource consistency contract, while eventual consistency and later/intervening mutation remain separate dimensions. Nexo must preserve observation time, consistency semantics, and scope rather than promoting one successful read into universal historical or future-state truth.

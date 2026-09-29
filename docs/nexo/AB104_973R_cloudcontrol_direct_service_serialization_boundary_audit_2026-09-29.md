# AB104.973R — Cloud Control serialization does not cover direct underlying-service mutation

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does Cloud Control's rule that only one resource operation can be performed at a time establish exclusive serialization over the resource itself?

## Fresh evidence
Current AWS documentation states that Cloud Control performs resource operations individually and that only one Cloud Control resource operation can be performed at a time on a given resource. The same documentation explicitly states that the resource can still be operated on directly through the underlying service, and warns that doing so may lead to unpredictable behavior. AWS also documents that Cloud Control obtains current state before an update and then invokes the resource handler; GetResource separately returns the resource's current state. Therefore the Cloud Control request serialization boundary is narrower than the underlying resource's total mutation domain.

## Findings
1. ONE_CLOUD_CONTROL_OPERATION_AT_A_TIME is a serialization guarantee about Cloud Control operations, not a universal serialization guarantee over every actor capable of mutating the underlying resource.
2. A Cloud Control UPDATE can therefore have a valid terminal status while a direct underlying-service actor remains outside the Cloud Control serialization domain.
3. A later GetResource result may reflect a mutation performed outside the original Cloud Control operation, even when the same resource Identifier is used.
4. Consequently, SUCCESS + CURRENT_MATCH cannot be promoted to NO_EXTERNAL_MUTATION without an explicit authority/serialization boundary covering the underlying service.
5. The inverse also matters: a later mismatch does not by itself prove that the original Cloud Control operation failed; it may represent a subsequent mutation.
6. This is an authority-domain boundary, not merely a timestamp problem: the relevant question is which actors are covered by the serialization/authority contract.
7. No new top-level interaction class is justified. The finding strengthens I19/I21/I22 and classes 7, 8, 9, 11, 12, 17, 18, 19; class 20 is conditional where cross-domain atomicity is claimed.

## Anti-collapse
CLOUD_CONTROL_SERIALIZATION != GLOBAL_RESOURCE_SERIALIZATION
SUCCESS != EXCLUSIVE_RESOURCE_HISTORY
CURRENT_MATCH != NO_EXTERNAL_MUTATION
CURRENT_MISMATCH != ORIGINAL_OPERATION_FAILURE
SAME_RESOURCE_ID != SAME_ACTOR_DOMAIN
ONE_AT_A_TIME != ALL_ACTORS_SERIALIZED
OBSERVATION != CAUSAL_ATTRIBUTION
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22; classes 7, 8, 9, 11, 12, 17, 18, 19.
Conditional: class 20 when an intended atomic boundary spans Cloud Control and the underlying service.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.973R establishes a concrete authority-domain boundary: Cloud Control's one-operation-at-a-time rule does not establish exclusive serialization over direct mutations through the underlying service. Nexo must bind any claim of exclusive history to an explicitly defined actor/authority domain rather than to the resource identifier alone.

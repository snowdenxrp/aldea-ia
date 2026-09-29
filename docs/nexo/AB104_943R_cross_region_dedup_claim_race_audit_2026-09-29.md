# AB104.943R — cross-region deduplication claim race and external-effect boundary audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If two regional consumers independently replay the same logical event and both lack the deduplication record locally, can a non-atomic check-then-set create duplicate external effects, and does this justify a new top-level interaction class?

## Fresh evidence
Microsoft Event Sourcing states that event delivery is typically at-least-once and duplicate processing must be idempotent. Microsoft Idempotent Consumer guidance recommends an atomic uniqueness constraint or conditional write for claiming a message and warns against check-then-set races in caches. For external effects that cannot join the consumer transaction, it recommends recording an in-progress state before the external action and later recording completion; an in-progress record means the prior attempt may have partially completed and requires reconciliation.
AWS EventBridge global-endpoint guidance states that cross-Region replication/replay requires immutable correlation and idempotent consumers. AWS documentation also specifies bounded deduplication scopes in some event-bus configurations, so deduplication at one layer cannot be assumed to be global.

## Scenario
Logical source event E0 is replicated to R1 and R2.
Both consumers receive E0 around the same time.
Both execute:
1. check local dedup key K;
2. observe K absent;
3. attempt external effect;
4. record K completed.
If the claim is not atomic/global, both may reach the external provider.
The provider may deduplicate, execute twice, or return UNKNOWN.

## Findings
1. A local check followed by a separate local set is not a globally atomic deduplication claim.
2. Atomic uniqueness at one regional database prevents two claimants only within that authority boundary; it does not automatically coordinate another region.
3. A shared/global claim authority can serialize the logical operation, but its scope and failure semantics must be explicit.
4. An IN_PROGRESS claim is not evidence that the external effect did not occur. It is a signal requiring reconciliation when the external action may have happened.
5. A COMPLETED dedup record is evidence of the consumer's recorded outcome, not universal proof of provider-side effect unless the contract binds them.
6. If both regions obtain independent claims because the claim scope is regional, both external effects may be real. Preserve both effects rather than selecting one by arrival time or region priority.
7. Provider-side deduplication is a separate identity/scope/retention contract. A successful provider deduplication response and a local duplicate suppression are distinct facts.
8. If the provider outcome is UNKNOWN, neither local claim state nor a later successful retry can prove that the first attempt had no effect.
9. A later reconciliation may establish that the two attempts refer to one provider effect, or may establish two distinct effects; the representation must preserve the evidence path.
10. This scenario does not create a new top-level interaction class. It composes I15/I22 (idempotency/retry), I18 (namespace/region identity), I19 (provenance), I21 (stale/concurrent observation), class 11 (external-effect ambiguity), class 12 (reconciliation), and class 20 when the claim record and external effect are intended as one atomic boundary.
11. I24 applies if the claim remains IN_PROGRESS across an authority/context transition.
12. The research strengthens the requirement that deduplication claims themselves need explicit authority scope, atomicity model, lifecycle, and UNKNOWN handling.

## Representation
E0 -> R1 / R2
R1: CLAIM(K) -> IN_PROGRESS -> EFFECT-1 -> COMPLETED
R2: CLAIM(K) -> IN_PROGRESS -> EFFECT-2 -> COMPLETED
If claim scope is shared and atomic, one claimant may win and the other becomes duplicate/rejected.
If claim scope is regional, both may legitimately proceed under their local contracts.
If provider result is UNKNOWN, retain UNKNOWN until authoritative reconciliation.
If EFFECT-1 and EFFECT-2 both occurred, preserve both and any later compensation as new effects.

## Anti-collapse
CHECK_THEN_SET != ATOMIC_CLAIM
REGIONAL_CLAIM != GLOBAL_CLAIM
IN_PROGRESS != EFFECT_ABSENT
COMPLETED_CLAIM != UNIVERSAL_EFFECT_PROOF
PROVIDER_DEDUP != CONSUMER_DEDUP
REGION_PRIORITY != CAUSAL_AUTHORITY
SUCCESSFUL_RETRY != PRIOR_NONEXECUTION
UNKNOWN != FAILED
ONE_LOGICAL_EVENT != ONE_EXTERNAL_EFFECT
CLAIM_ID != EFFECT_ID

## Classification
Primary: I15/I22, I18, I19, I21, class 11, class 12.
Class 20 applies where the claim lifecycle and external effect are intended as one atomic boundary.
I24 applies to in-progress authority/context transitions.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
The cross-region deduplication claim is itself a distributed authority boundary. The key distinction is between claiming permission to process a logical identity and proving what happened at the external provider. Atomic local claiming improves duplicate suppression within its scope but cannot by itself establish global effect truth. Current evidence continues to support existing interaction families rather than a new class.

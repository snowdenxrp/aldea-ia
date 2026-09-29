# AB104.907R — Concurrent corrections against the same historical effect
Date: 2026-09-29

## Question
Two independently authorized correction operations target the same historical external effect concurrently. Does correct target binding plus valid authority eliminate the ambiguity?

## Fresh evidence
- Microsoft Event Sourcing guidance states that concurrent handlers can act on the same state and recommends optimistic concurrency control; if the event stream changed since it was read, an append can be rejected and the handler must reload/re-evaluate.
- Microsoft Compensating Transaction guidance notes compensation is application-specific, can be eventually consistent, can fail, and individual compensation steps may be retried; steps should therefore be idempotent.
- The HTTPAPI Idempotency-Key draft explicitly distinguishes a concurrent request from a completed duplicate and describes conflict handling for a request still outstanding.
- AWS Event Sourcing guidance likewise identifies event collisions from concurrent updates and points to optimistic concurrency/versioning strategies.

## Attack
Historical target:
EFFECT-1 on R1/gen41.

At T1:
C1 is authorized by current authority and targets EFFECT-1.

At T1 + epsilon:
C2 is independently authorized by current authority and targets the same EFFECT-1.

C1 and C2 execute concurrently.

Cases:
A) C1 and C2 are semantically identical and same idempotency identity.
B) C1 and C2 are distinct correction operations with compatible effects.
C) C1 and C2 are distinct and incompatible.
D) C1 commits externally before C2 observes C1.
E) C1/C2 both produce externally irreversible effects before either learns of the other.

## Findings
1. Correct target binding and valid executor authority do NOT by themselves serialize corrections.
2. A correction operation needs its own operation identity; target identity is not an idempotency key.
3. Same logical correction retried concurrently can be handled as duplicate/concurrent idempotency semantics when the downstream contract supports it.
4. Distinct correction operations may both be legitimate if policy explicitly permits multiple compensations and their effects are compatible; no universal winner exists.
5. If corrections are mutually exclusive under the domain contract, an optimistic-concurrency/version guard or equivalent serialization rule is needed to reject/re-evaluate the stale second operation.
6. If both external effects commit before the conflict is observed, local serialization cannot retroactively erase the external effect; reconciliation is required.
7. If the external system provides no shared idempotency/serialization boundary, two locally authorized corrections can still become two external effects.
8. Therefore target binding + authority proves who may attempt C1/C2 and what historical target they name, but does not prove that C1 and C2 are mutually compatible or that only one effect occurred.
9. This remains within I19 (correction/reversal), I21 (ordering/concurrency), I15/I22 where idempotency/expiry matter, class11 for external-effect ambiguity, and class12 for reconciliation. No new top-level class.

## Refinements
- TARGET_BINDING != SERIALIZATION
- CORRECTION_AUTHORITY != CORRECTION_EXCLUSIVITY
- CORRECTION_OPERATION_ID != HISTORICAL_TARGET_ID
- DUPLICATE_CORRECTION != DISTINCT_CORRECTIONS
- CONCURRENT_AUTHORIZATION != UNIQUE_EFFECT
- LOCAL_CONCURRENCY_CONTROL != EXTERNAL_EFFECT_SERIALIZATION
- CONFLICT_DETECTED_AFTER_EFFECT != EFFECT_UNDONE
- SAME_TARGET != SAME_OPERATION

## Epistemic status
No Nexo implementation. No formal verification. No semantic freeze. No new top-level class frozen. 20-class taxonomy remains unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.

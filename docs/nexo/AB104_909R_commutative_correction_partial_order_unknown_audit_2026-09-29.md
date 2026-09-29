# AB104.909R — Commutative corrections with partial provider order and UNKNOWN outcome
Date: 2026-09-29

## Question
A policy declares two corrections semantically commutative, but the external provider guarantees only partial ordering and one correction returns UNKNOWN. Can the system infer the combined outcome from commutativity alone?

## Fresh evidence
- AWS Event Sourcing identifies concurrent event collisions and says optimistic concurrency/versioning is needed when concurrent updates can conflict; the event stream records the history rather than making final state alone the complete proof.
- Microsoft Compensating Transaction guidance states compensation is eventually consistent, can fail, can be retried, and must account for concurrent work. It also requires end-to-end correlation/auditing of original operation and compensation.
- HTTPAPI Idempotency-Key guidance distinguishes retries of the same request from distinct concurrent requests and permits resource-defined idempotency scope/expiry; idempotency does not itself establish the outcome of an unknown external request.

## Attack
EFFECT-1 is the historical target.

C1 and C2 are distinct correction operations.
Policy declares C1 and C2 commutative under the provider contract.
Provider guarantees only partial ordering.
C1 returns CONFIRMED.
C2 returns UNKNOWN after timeout.
No direct provider evidence yet establishes whether C2 was applied.

## Findings
1. Declared commutativity can establish that C1 and C2 are order-independent only if the declaration actually covers the concrete external effects and their target domains.
2. Commutativity does not turn UNKNOWN into CONFIRMED or FAILED.
3. If C2 may have happened, the system cannot infer the combined external state merely from C1 success plus commutativity.
4. If the provider contract offers an authoritative query that uniquely identifies C2's effect, reconciliation may resolve C2.
5. If the provider does not expose sufficient evidence, C2 remains UNKNOWN even though C1 is confirmed.
6. Partial ordering means the absence of a local order does not prove concurrency or non-execution; ordering guarantees must be interpreted within the provider contract.
7. If C1 and C2 truly commute, an UNKNOWN C2 may permit a bounded statement such as "C1 is confirmed and C2 outcome is unknown"; it does not justify "both corrections are confirmed."
8. A final state that is observationally compatible with either C2 execution or non-execution cannot resolve the historical effect ambiguity.
9. Therefore commutativity constrains the semantic impact of order, but it is not an effect-outcome oracle.
10. No new top-level interaction class is justified; the case remains I19 + I21 + class11 + class12, with I15/I22 when idempotency/retry horizons matter.

## Refinements
- COMMUTATIVITY != OUTCOME_PROOF
- COMMUTATIVITY != EFFECT_EXISTENCE
- CONFIRMED(C1) != CONFIRMED(C2)
- UNKNOWN(C2) != FAILED(C2)
- PARTIAL_ORDER != EXECUTION_ORDER
- FINAL_STATE_COMPATIBILITY != HISTORICAL_EFFECT_PROOF
- PROVIDER_QUERY_WITH_UNIQUE_LINEAGE CAN RESOLVE UNKNOWN
- ABSENCE_OF_ORDER != ABSENCE_OF_EFFECT
- SEMANTIC_ORDER_INDEPENDENCE != EFFECT_OBSERVABILITY
- UNKNOWN MUST REMAIN PRESERVED UNTIL POSITIVE EVIDENCE RESOLVES IT

## Epistemic status
No Nexo implementation. No formal verification. No semantic freeze. No new top-level class frozen. 20-class taxonomy remains unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.

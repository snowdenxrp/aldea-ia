# AB104.936R — Downstream projection freshness vs post-arbitration remediation audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence pending unless GitHub write succeeds.

## Question
Does cross-projection freshness plus arbitration create an independent interaction, or does it remain covered by I21 stale observation/order + I19 provenance/conflict + class 11/12 external-effect/reconciliation?

## Scenario
EFFECT-2 is confirmed. Arbitration A arrives with incomplete, aggregate-specific, or disputed scope. Projection P1 has observed A; P2 remains pre-arbitration/stale. P1 initiates compensation/remediation C1. P2 later observes older state and independently initiates C2, possibly against the same or downstream resource.

## Fresh evidence
Microsoft's Event-Driven Architecture guidance states that during propagation different parts of an event-driven system can have different views of current state and consumers must tolerate stale or partially updated data under eventual consistency. Microsoft Event Sourcing guidance states that materialized projections are eventually consistent, delivery is typically at-least-once, and conflicts spanning multiple entities require application-level reconciliation. AWS Saga guidance documents compensation across multiple participants and notes stale data under concurrent orchestration and the need for idempotency.

## Findings
1. Cross-projection freshness is a real temporal/provenance condition, but the pattern is expressible as stale observation/order (I21) combined with provenance/conflict (I19) and reconciliation/external-effect semantics (classes 11/12).
2. A downstream consumer acting on a pre-arbitration projection creates a new operation/effect; it does not erase the arbitration, upstream effect, or stale observation.
3. P1 observing arbitration before P2 does not establish causal precedence over P2's later-arriving action. Arrival order is not causal order.
4. If C1 and C2 target the same invariant, compatibility/serialization must be contract-defined. Local optimistic concurrency on one aggregate does not by itself arbitrate a conflict spanning multiple aggregates.
5. If arbitration scope covers aggregate A but remediation spans aggregate B, the scope boundary must be explicit. A-level arbitration is not automatically B-level authorization or semantic disposition.
6. If C2 was generated from stale P2 state, that is evidence about C2's decision context, not proof that C2's external effect did not occur.
7. If C1 commits and C2 is later rejected locally, local rejection is not universal proof of provider non-execution; outcome remains UNKNOWN until authoritative evidence exists.
8. If both C1 and C2 commit, both effects remain historical facts. Later arbitration may classify one as conflicting, invalid under an invariant, or requiring compensation, but cannot rewrite occurrence history.
9. Later compensation D is another operation/effect with its own identity, authority, target, lifecycle, idempotency and outcome. It does not prove C1/C2 never happened.
10. If P2 has not observed arbitration, that is a freshness gap; if it observed arbitration but used an incompatible interpretation, that is additionally a semantic/version/provenance issue. Neither alone establishes a new top-level class.
11. The interaction can fan out recursively: arbitration -> remediation -> stale downstream projection -> second remediation. This remains a graph of facts and typed relations, not a single rollback chain.

## Representation
EFFECT-2 -> A(arbitration)
A -> P1(view@vA) -> C1 -> EFFECT-3
EFFECT-2 -> P2(view@v0) -> C2 -> EFFECT-4
STALE(P2,A)
SCOPE(A, aggregate-A)
TARGET(C1, aggregate-B)
TARGET(C2, aggregate-B)
INCOMPATIBLE(C1,C2, INVARIANT-ID) when authoritative evidence exists
D -> EFFECT-5 with COMPENSATES(D, EFFECT-3/EFFECT-4) only when explicitly evidenced

## Classification
- No new top-level interaction class justified.
- Primary: I21, I19, and I24 when remediation is IN_PROGRESS across changing context.
- Secondary: class 11 external-effect ambiguity and class 12 reconciliation; I15/I22 for retries/idempotency; I9 for authority-generation boundaries.
- W19/W20 remain NOT FROZEN.
- Coverage denominator remains NOT FROZEN.
- Formal verification NOT PERFORMED.
- Implementation NOT STARTED.
- Architecture/semantic freeze NOT DECLARED.

## Anti-collapse rules
PROJECTION_FRESHNESS != AUTHORITY
ARBITRATION_OBSERVED != ARBITRATION_APPLIES_TO_ALL_TARGETS
ARRIVAL_ORDER != CAUSAL_ORDER
LOCAL_REJECTION != PROVIDER_NON_EXECUTION
COMPENSATION != ERASURE
STALE_DECISION_CONTEXT != EFFECT_ABSENCE
CURRENT_PROJECTION != HISTORICAL_EVENT_GRAPH
ONE_AGGREGATE_ARBITRATION != GLOBAL_ARBITRATION

## Conclusion
Cross-projection freshness plus post-arbitration remediation is an important composite attack surface and must be represented explicitly in Nexo's provenance/reconciliation model. The evidence does not justify a new top-level class: the scenario decomposes into I21 + I19 + I24 and classes 11/12, with I9/I15/I22 as parameterized dimensions where applicable. Concrete implementation or incident evidence is still required for any stronger witness claim.

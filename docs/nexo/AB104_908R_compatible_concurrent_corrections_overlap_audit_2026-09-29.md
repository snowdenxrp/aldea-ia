# AB104.908R — Compatible concurrent corrections with overlapping effects
Date: 2026-09-29

## Question
Two authorized corrections target the same historical effect and are described by policy as compatible, but their external effects partially overlap. Can compatibility be established before observing the external result?

## Fresh evidence
- AWS Event Sourcing guidance warns that concurrent conflicting events can collide and recommends optimistic concurrency control; it also warns that replay or event processing can touch external systems and therefore external updates require explicit control.
- Microsoft Compensating Transaction guidance states that compensation is application-specific, may be eventually consistent, may fail, and steps may execute multiple times; compensating steps therefore need idempotent design. It also notes that some compensation steps can run in parallel.
- The HTTPAPI Idempotency-Key draft distinguishes retries of the same request from distinct concurrent requests. An idempotency key is for recognizing the same request, not for proving that two different correction operations have compatible business effects.

## Attack
Historical target EFFECT-1.

C1 and C2:
- both authorized by current policy;
- both bind to EFFECT-1;
- different operation identities;
- policy says they are "compatible";
- each invokes an external provider;
- provider effects overlap partially.

Cases:
A) C1 and C2 are mathematically commutative under a declared provider contract.
B) They are only apparently compatible from local state.
C) Provider applies them in an order not visible locally.
D) both commit but resulting state hides the fact that two effects occurred.
E) one succeeds and one partially succeeds.

## Findings
1. "Compatible" is not a universal property; it requires a declared semantic/contractual definition.
2. Local state equivalence is insufficient to establish external-effect equivalence.
3. If the provider contract proves the operations commute and each effect has independent durable identity, both may be accepted without choosing a winner.
4. If compatibility is only inferred from the current local projection, the system cannot promote that inference to a safety claim about the external effects.
5. If provider ordering is unspecified, arrival/projection order cannot be treated as causal order.
6. If two effects collapse to the same final state, STATE_EQUIVALENCE != EFFECT_EQUIVALENCE; historical effect count and provenance can remain materially different.
7. Partial success requires per-effect status/reconciliation; one correction's success does not imply the other's success.
8. Idempotency protects recognition of the same logical request; it does not establish semantic compatibility between two distinct requests.
9. Therefore the required evidence is contract-specific: operation semantics, target/effect identity, ordering guarantees, and provider outcome evidence.
10. No new top-level interaction class is justified; this is an interaction among I19, I21, class11 and class12, with I15/I22 where duplicate/expiry semantics enter.

## Refinements
- COMPATIBILITY != LOCAL_STATE_EQUIVALENCE
- COMPATIBILITY MUST BE CONTRACT-DEFINED
- STATE_EQUIVALENCE != EFFECT_EQUIVALENCE
- FINAL_STATE_EQUALITY != HISTORICAL_EFFECT_EQUALITY
- DISTINCT_OPERATION_IDS != INCOMPATIBLE_OPERATIONS
- IDEMPOTENCY != SEMANTIC_COMPATIBILITY
- PROVIDER_ORDER != CAUSAL_ORDER UNLESS CONTRACTUALLY GUARANTEED
- ONE_CORRECTION_SUCCESS != ALL_CORRECTIONS_SUCCESS
- PARALLEL_COMPENSATION != ATOMIC_COMPENSATION
- EXTERNAL_EFFECT_COMPATIBILITY REQUIRES DOMAIN/PROVIDER EVIDENCE

## Epistemic status
No Nexo implementation. No formal verification. No semantic freeze. No new top-level class frozen. 20-class taxonomy remains unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.

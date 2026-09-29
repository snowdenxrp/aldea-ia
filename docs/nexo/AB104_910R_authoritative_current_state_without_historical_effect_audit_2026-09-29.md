# AB104.910R — Authoritative current-state query without explicit historical effect evidence
Date: 2026-09-29

## Question
An UNKNOWN correction C2 is followed by an authoritative provider query that returns the current resource state, but the response does not explicitly identify whether C2 occurred. Can the current state resolve C2?

## Fresh evidence
- AWS Event Sourcing guidance distinguishes immutable event history from derived current state/materialized views. The event store is the historical record; current state can be derived from events, and external-system query results may need to be stored separately for replay.
- RFC 9110 defines idempotency in terms of intended effect, while noting that servers may still retain separate request history/side effects. Therefore an apparently identical current state is not itself a complete historical-effect record.
- The HTTPAPI Idempotency-Key draft describes idempotency keys as identifiers for retries of the same request and notes that after a timeout the client may not know whether processing completed; a later response/query must actually provide evidence about that operation.
- The 2026 IETF Action Evidence Boundary draft states that EXECUTED requires authoritative evidence matched to the exact action/operation/provider context, while FAILED requires evidence that the effect did not occur; missing response or timeout alone is insufficient.

## Attack
C2 is dispatched against EFFECT-1.
Provider response is lost.
Local state: C2 = UNKNOWN.

Later authoritative query Q returns:
resource_state = S_final

But Q contains no:
- C2 operation identifier,
- C2 native effect identifier,
- execution receipt,
- historical event sequence proving C2.

Cases:
A) S_final is reachable both with and without C2.
B) S_final is mathematically unique to C2 under a declared provider contract.
C) provider state is authoritative for current state but not historical operation lineage.
D) Q includes an authoritative event/history endpoint separately identifying C2.

## Findings
1. An authoritative current-state answer is authoritative for the claim it actually covers; it does not automatically prove every historical operation that may have contributed to that state.
2. If S_final is reachable both with and without C2, Q cannot resolve C2; C2 remains UNKNOWN.
3. If a declared provider contract proves S_final is uniquely caused by C2 and the query evidence is bound to the exact target/incarnation, C2 may be resolved, but this is a domain-specific causal contract rather than a generic property of current-state queries.
4. If Q is authoritative only for present resource state, it cannot be promoted to historical effect lineage without an explicit provenance/causal guarantee.
5. A separate provider history/event/receipt query that binds C2 to its native effect can resolve UNKNOWN.
6. Therefore AUTHORITATIVE_CURRENT_STATE != AUTHORITATIVE_HISTORICAL_EFFECT_EVIDENCE unless the contract explicitly establishes the implication.
7. This preserves UNKNOWN rather than converting a complete current-state observation into an unsupported historical safety claim.
8. No new top-level class is justified; the case remains class11/class12 with I19/I21 and the existing provenance/authority distinctions.

## Refinements
- CURRENT_STATE_AUTHORITY != HISTORICAL_EFFECT_AUTHORITY
- QUERY_AUTHORITY IS CLAIM-SCOPED
- CURRENT_STATE != OPERATION_RECEIPT
- CURRENT_STATE != EFFECT_LINEAGE
- STATE_CAUSAL_UNIQUENESS MUST BE CONTRACT-PROVEN
- COMPLETE_CURRENT_STATE_QUERY != COMPLETE_HISTORICAL_QUERY
- AUTHORITATIVE_QUERY != UNIVERSAL_EFFECT_ORACLE
- UNKNOWN_REMAINS_UNRESOLVED WITHOUT POSITIVE OPERATION EVIDENCE

## Epistemic status
No Nexo implementation. No formal verification. No semantic freeze. No new top-level class frozen. 20-class taxonomy remains unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.

# AB104.945R — failover retry with provider idempotency-key reuse and semantic payload drift audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
After failover, if a successor retries using the same provider idempotency key but the retry payload or authorization context differs from the original attempt, can the key safely establish equivalence?

## Fresh evidence
AWS Durable Execution guidance states that an idempotency key should be stable across retries and that generating a new key on replay defeats deduplication. AWS Well-Architected guidance likewise recommends propagating the same idempotency token through downstream calls. Microsoft Idempotent Consumer guidance warns that when a duplicate key already exists, the current message must be compared with the stored immutable/business fields; reuse of an identifier with different content can indicate producer identifier reuse or changed details and should not be silently accepted. The same guidance emphasizes that external effects can occur before the deduplication marker is recorded.

## Scenario
R1 submits provider request P1 with key K and payload X under authority A1.
R1 loses connectivity; outcome UNKNOWN.
A2 succeeds R1's ownership and authorizes recovery.
R2 retries with the same key K but payload Y, where Y differs from X due to a refreshed projection, changed policy, or correction.
Provider behavior may be:
- reject key reuse with conflicting parameters;
- return the original result;
- treat K as the same operation and ignore Y;
- execute Y if the provider's key scope/retention does not cover P1;
- return UNKNOWN.

## Findings
1. Reusing an idempotency key can preserve operation correlation only when the provider contract defines the key as stable identity for that operation.
2. Same key plus different payload is not automatically safe equivalence.
3. A provider that rejects conflicting reuse gives evidence of an identity/payload conflict, not proof that the first effect was absent.
4. A provider that returns the original result establishes provider-level deduplication semantics for that key scope; it does not mean payload Y was executed.
5. If provider key retention expired, the same key may no longer protect against duplicate execution.
6. A new authorization A2 does not authorize changing the historical meaning of P1 merely by reusing K.
7. If Y is intentionally a correction/new semantic action, it should normally receive a distinct operation identity and explicit relation to P1; reusing K would conflate retry identity with correction identity unless the provider contract explicitly defines such semantics.
8. If the payload difference is only a transport-level normalization that the provider defines as equivalent, equivalence may be established by contract; it must not be inferred from superficial equality or final state.
9. UNKNOWN remains UNKNOWN until authoritative provider evidence resolves it.
10. The scenario composes I15/I22, I19, I21, I9, class 11 and class 12; I18 if key namespace/incarnation changes; class 20 where local recovery state and external effect are claimed atomic.
11. No new top-level class justified.

## Representation
P1(K,X,A1) -> UNKNOWN
A2 authorizes recovery
P2(K,Y,A2) -> provider response
If provider deduplicates: RESULT(P1), P2_NOT_EXECUTED
If conflict: KEY_REUSE_CONFLICT, preserve P1 outcome
If retention expired and Y executes: EFFECT-2 is a new effect
If UNKNOWN: preserve UNKNOWN.

## Anti-collapse
SAME_KEY != SAME_PAYLOAD
SAME_KEY != SAME_EFFECT
RETRY != CORRECTION
NEW_AUTHORITY != OLD_AUTHORITY
KEY_REUSE != PROOF_OF_NONEXECUTION
PROVIDER_DEDUP_RESPONSE != LOCAL_DEDUP_RECORD
KEY_EXPIRY != EFFECT_ABSENCE
PAYLOAD_NORMALIZATION != SEMANTIC_EQUIVALENCE
UNKNOWN != FAILED

## Classification
Primary: I15/I22, I19, I21, I9, class 11, class 12.
I18 applies if key scope crosses namespace/incarnation boundaries.
Class 20 applies where recovery state and external effect are intended as one atomic boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
The critical distinction is between retry identity and semantic intent. A stable idempotency key can make a retry safe only within the provider's declared identity, parameter-binding, scope, and retention contract. It must not be reused to silently transform an UNKNOWN historical attempt into a different correction or payload.

# AB104.944R — cross-region claim failover and lease-expiry external-effect audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If a regional deduplication claim expires or its authority fails over while the original external effect is still in progress or UNKNOWN, can a successor region safely claim the same logical operation without creating a duplicate?

## Fresh evidence
Microsoft Event Sourcing and Idempotent Consumer guidance distinguish consumer progress/deduplication state from external side effects and require reconciliation when a consumer may have acted before losing its state. AWS guidance for distributed idempotency emphasizes stable client/request identity and bounded retention; lease/lock systems generally coordinate ownership for a bounded validity interval rather than prove completion of an external action. Kubernetes Lease documentation similarly describes leases as coordination/leader-election primitives, not universal effect-outcome records. Temporal's durable execution documentation distinguishes workflow retries/recovery from the external activity result and uses activity-level retry/idempotency mechanisms.

## Scenario
R1 owns claim K under lease L1.
R1 sends EFFECT-1 to an external provider.
Before receiving a definitive result, R1 loses connectivity and L1 expires.
R2 acquires a successor claim for K.
R2 may:
- wait for authoritative reconciliation;
- reuse the same provider idempotency identity;
- issue a new external request;
- discover EFFECT-1 confirmed;
- discover EFFECT-1 absent;
- remain UNKNOWN because provider evidence is incomplete.

## Findings
1. Lease/claim expiry is an authority-ownership transition, not proof that EFFECT-1 failed or was never submitted.
2. Successor ownership does not automatically imply successor execution is safe.
3. If the provider supports a stable idempotency identity spanning the failover scope, R2 can use that contract to make a retry/dedup decision; the provider response still needs correct interpretation.
4. If provider idempotency scope is narrower than the failover boundary, R2 cannot assume the old identity will deduplicate.
5. Reusing the logical operation identity does not erase R1's prior attempt; attempts and effects remain individually auditable.
6. A new operation identity after failover is not proof that the old operation had no effect.
7. A local claim state of EXPIRED/RELEASED is not equivalent to FAILED.
8. If R2 proceeds while EFFECT-1 remains UNKNOWN, the system can produce EFFECT-2; both must be preserved if both occur.
9. A later confirmed EFFECT-1 does not retroactively make R2's attempt nonexistent. Its semantic status depends on explicit retry/duplicate/compensation rules.
10. If R1's authority expires before effect commitment, whether a later provider commit is valid depends on the declared authorization checkpoint; lease expiry alone cannot answer it.
11. This is existing I9 authority-generation/fencing, I15/I22 idempotency/retry, I24 in-progress transition, I19 provenance, I21 stale/concurrent observation, class 11 external-effect ambiguity, class 12 reconciliation, and class 20 for claim/effect atomicity boundaries.
12. No new top-level interaction class is justified.

## Representation
R1 owns K under L1
R1 -> EFFECT-1 -> UNKNOWN
L1 expires
R2 acquires K
R2 -> reconcile(EFFECT-1)
or R2 -> retry(K) -> EFFECT-2
Outcomes:
- EFFECT-1 CONFIRMED: preserve it; classify R2 separately.
- EFFECT-1 ABSENT by authoritative evidence: retry may proceed according to policy.
- EFFECT-1 UNKNOWN: do not collapse to FAILED; retry requires explicit risk/idempotency policy.
- EFFECT-1 and EFFECT-2 both confirmed: preserve both; later compensation/correction is a new operation/effect.

## Anti-collapse
LEASE_EXPIRY != EFFECT_FAILURE
CLAIM_RELEASE != EFFECT_ABSENCE
SUCCESSOR_OWNER != SAFE_RETRY
NEW_OWNER != NEW_HISTORY
NEW_OPERATION != PROOF_OF_OLD_NONEXECUTION
SAME_LOGICAL_KEY != SAME_EFFECT
PROVIDER_DEDUP_SCOPE != CLAIM_SCOPE
FENCE/LEASE != EFFECT_ORACLE
UNKNOWN != FAILED
RECONCILIATION != HISTORY_REWRITE

## Classification
Primary: I9, I15/I22, I24, I19, I21, class 11, class 12.
Class 20 applies when claim/lease state and external effect are treated as one atomic boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
Failover converts ownership; it does not convert an unresolved external outcome into failure. A successor may continue only under an explicit policy that accounts for the previous attempt, provider idempotency scope, authorization checkpoint, and reconciliation evidence. The evidence continues to fit existing interaction families.

# AB104.932R — Concurrent corrections over one historical effect
Date: 2026-09-29

## Question
Multiple correction operations C1 and C2 concurrently target EFFECT-2. When may they coexist, when do they require serialization, and when can one remain UNKNOWN without invalidating the other?

## Fresh evidence
Microsoft's current Event Sourcing guidance describes immutable append-only events and compensating events as new events that reverse or correct earlier effects; the original event remains in the history. It also notes that optimistic concurrency can reject competing appends when the stream changed. citeturn0search0turn0search2

## Scenario
EFFECT-2 is confirmed.
C1 and C2 are independently authorized to correct/compensate EFFECT-2.
They overlap in time and may produce EFFECT-3 and EFFECT-4.

## Findings
1. Same historical target does not imply that C1 and C2 are the same operation.
2. C1 and C2 may coexist if the domain contract explicitly permits concurrent corrections and defines their compatibility/commutativity.
3. If both mutate the same exclusive invariant, the system needs a declared serialization/concurrency rule; optimistic concurrency is one implementation pattern, not a universal semantic rule.
4. Rejection of C2 because C1 won a concurrency check does not prove C2 had no external effect if C2 crossed an external-effect boundary before rejection evidence became authoritative.
5. C1=CONFIRMED does not imply C2=FAILED.
6. C2=UNKNOWN does not invalidate C1=CONFIRMED.
7. If C1 and C2 are both confirmed, each effect remains independently factual even when their causal/correction relation is UNKNOWN.
8. If C2 is intended as a correction of C1 rather than directly of EFFECT-2, that edge must be explicit; sequence or payload similarity is insufficient.
9. If C1 and C2 are incompatible, the resulting state may be CONFLICTING/UNKNOWN until an authoritative arbitration or reconciliation rule resolves the conflict.
10. A final state that looks compensated does not prove which correction produced it, nor that both corrections occurred in the presumed order.
11. Compensation remains a new event/effect; it does not erase EFFECT-2 or another correction.
12. If corrections span different authority generations, each must be evaluated against its own authority and target-binding rules; concurrency does not merge their authority.
13. Idempotency can suppress duplicate delivery of the same correction identity, but it does not decide semantic compatibility between distinct correction identities.

## Safe representation
Keep independent nodes:
EFFECT-2
C1
EFFECT-3
C2
EFFECT-4

And explicit edges where evidence/contracts establish them:
CORRECTS(C1,EFFECT-2)
COMPENSATES(EFFECT-3,EFFECT-2)
CORRECTS(C2,EFFECT-2)
COMPATIBLE(C1,C2)
ORDER(C1,C2)
CONFLICTS(C1,C2)

Absent evidence, edge status remains UNKNOWN rather than being inferred.

## Critical distinctions
CONCURRENT_CORRECTIONS != DUPLICATE_CORRECTION
CONCURRENCY_REJECTION != EXTERNAL_EFFECT_ABSENCE
C1_CONFIRMED != C2_FAILED
C2_UNKNOWN != C1_INVALID
SAME_TARGET != SAME_OPERATION
SAME_PAYLOAD != SAME_CAUSALITY
FINAL_STATE != COMPLETE_HISTORY
COMPENSATION != ERASURE
IDEMPOTENCY != SEMANTIC_COMPATIBILITY

## Classification
No new top-level interaction class. Primarily I24/I19/I21 + class11/class12; I9 when authority generations differ; I15/I22 when retry/idempotency is involved.

## Epistemic status
Research only. No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.

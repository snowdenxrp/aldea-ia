# AB104.996R — rollback failure creates a new unresolved effect boundary; successful resources may remain while failed paths are retried

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
After a provisioning/update failure, can rollback failure, preservation of successful resources, or a later retry be treated as proof that the original failed path produced no external effect?

## Fresh evidence
AWS documents that CloudFormation can preserve resources that were successfully provisioned while failed resources remain failed, and can later retry failed provisioning actions after remediation. It also documents `UPDATE_ROLLBACK_FAILED` when CloudFormation cannot roll back all changes, with manual continuation or resource skipping possible. Skipped resources can become inconsistent with the stack template. citeturn0search2turn0search1turn0search3

The resource-type contract states that a handler can return `FAILED` for downstream service errors, networking failures, or lack of stabilization, while resource leakage is explicitly recognized as a handler failure mode. CloudFormation also requires create handlers to be idempotent because reinvocation can otherwise create multiple resources. citeturn0search0turn0search4

CloudTrail provides a separate record of CloudFormation API calls, reinforcing that orchestration status and underlying request history are distinct evidence domains. citeturn0search8

## Findings
1. `ROLLBACK_FAILED` is not an absence proof. It means the orchestration layer could not restore all changes to its intended prior state.
2. A later retry is a new execution attempt and must not be assumed to be a continuation of an effect-free first attempt.
3. Preserved successful resources demonstrate that overall operation failure can coexist with durable successful effects.
4. A failed path may have produced a partial downstream effect before the handler returned FAILED; the handler status alone cannot establish absence.
5. Resource skipping or manual recovery changes orchestration state but does not rewrite the underlying historical effect graph.
6. A later successful retry does not prove the first attempt had no effect; duplicate prevention requires idempotency/effect evidence at the relevant boundary.
7. `ROLLBACK_COMPLETE` or an equivalent orchestration terminal state is not automatically a proof that every historical external effect has been reversed exactly once.
8. This strengthens I3/I15/I19/I21/I22 and classes 3, 6, 11, 12, 14, 16, 17, 19. No new top-level interaction class is justified.

## Anti-collapse
ROLLBACK_FAILED != EFFECT_ABSENCE
ROLLBACK_COMPLETE != HISTORICAL_ERASURE
RETRY != FIRST_ATTEMPT_ABSENT
PRESERVED_RESOURCE != GLOBAL_OPERATION_SUCCESS
HANDLER_FAILED != NO_PARTIAL_EFFECT
MANUAL_SKIP != COMPENSATION_PROOF
ORCHESTRATION_STATE != EFFECT_HISTORY
UNKNOWN != FAILED

## Classification
Primary: I3, I15, I19, I21, I22.
Interactions: classes 3, 6, 11, 12, 14, 16, 17, 19.
Conditional: class 20 only where an explicit atomic rollback contract covers the complete external boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.996R establishes that rollback is itself a potentially incomplete effect process. A failed rollback, preserved successful resources, skipped resources, or a later retry all demonstrate that orchestration state cannot substitute for historical effect evidence. Nexo must preserve the original attempt, rollback attempt, retry attempt, and their evidence/relations separately.

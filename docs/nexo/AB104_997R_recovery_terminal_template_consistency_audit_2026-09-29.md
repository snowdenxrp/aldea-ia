# AB104.997R — preserved resource state and rollback state can diverge from template state; recovery is not historical reconciliation

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does returning orchestration to a working/terminal state establish that resource state and historical effects have been reconciled with the intended template/history?

## Fresh evidence
AWS CloudFormation explicitly permits preserving successfully provisioned resources after an overall operation failure while failed resources remain failed; retry can later resume provisioning from the point of failure. During update failure, successfully provisioned resources can remain in CREATE_COMPLETE/UPDATE_COMPLETE while failed resources are rolled back to a last known stable state. citeturn0search0

AWS's ContinueUpdateRollback API states that skipped resources are marked UPDATE_COMPLETE so the stack can continue, but after rollback those resources can be inconsistent with the stack template and must be reconciled before another update. citeturn0search1turn0search2

## Findings
1. A terminal/working orchestration state can coexist with resource/template inconsistency when recovery intentionally skips a failed resource.
2. Therefore `ORCHESTRATION_TERMINAL != TEMPLATE_CONSISTENT`.
3. `ROLLBACK_COMPLETE/UPDATE_ROLLBACK_COMPLETE` is an orchestration state, not a universal proof that every resource reached the intended historical state through a complete compensating sequence.
4. A resource can be marked UPDATE_COMPLETE by the recovery procedure while its actual state remains inconsistent with the template; status labeling and physical/effect state are therefore distinct evidence domains.
5. Retry after failure resumes provisioning actions, but it does not by itself establish that the first attempt was effect-free or that every earlier effect was reversed exactly once.
6. The recovery graph therefore needs explicit relations among original attempt, rollback attempt, skipped resource, subsequent reconciliation, and retry.
7. No new top-level interaction class is justified; this reinforces I3/I15/I19/I21/I22 and classes 3, 6, 11, 12, 14, 16, 17, 19.

## Anti-collapse
ORCHESTRATION_TERMINAL != TEMPLATE_CONSISTENT
ROLLBACK_COMPLETE != HISTORICAL_ERASURE
STATUS_UPDATE_COMPLETE != PHYSICAL_STATE_PROOF
RECOVERY_SUCCESS != COMPLETE_COMPENSATION
RETRY != FIRST_ATTEMPT_ABSENT
SKIP != RECONCILIATION
CURRENT_LABEL != COMPLETE_HISTORY
UNKNOWN != FAILED

## Classification
Primary: I3, I15, I19, I21, I22.
Interactions: classes 3, 6, 11, 12, 14, 16, 17, 19.
Conditional: class 20 only where a declared atomic recovery contract actually covers the full external boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.997R establishes a sharper recovery boundary: making an orchestration layer operational again does not necessarily reconcile physical resource state, template state, and historical effect history. Nexo must treat recovery status, physical observation, correction/reconciliation, and historical effect evidence as distinct facts and relations.

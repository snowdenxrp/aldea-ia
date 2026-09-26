# NEXO AB104.365 — Partial-effect compensation and reconciliation V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RATS places application-specific authorization at the Relying Party and explicitly warns that state and appraisal policies can change immediately after evidence/results are generated; freshness only narrows acceptable recentness and does not eliminate the race. citeturn0search0turn0search24

## Finding
After emergency revocation, a partial external effect cannot be repaired merely by replaying the original operation. Compensation is a new operation with its own authorization, semantic contract, identity, and effect evidence.

Candidate reconciliation states:
RECONCILIATION_REQUIRED
COMPENSATION_AUTHORIZED
COMPENSATION_REJECTED
COMPENSATION_COMMITTED
COMPENSATION_UNKNOWN_EXTERNAL
MANUAL_REVIEW
CONFLICT

## Rule
1. Preserve the original effect evidence and its authority frontier.
2. Create a distinct compensation operation_id; never reuse the original operation identity.
3. Re-evaluate compensation against the CURRENT policy/authority frontier.
4. Bind compensation to the exact observed/claimed partial state.
5. Require target-side idempotency/effect evidence for compensation.
6. If the target state or authority frontier is unknown, compensation cannot be assumed safe; enter UNKNOWN/MANUAL_REVIEW.
7. Successful compensation does not erase the historical partial-effect fact.

## New boundary
ORIGINAL_EFFECT_HISTORY and CURRENT_RECONCILIATION_AUTHORITY are separate dimensions.

Therefore:
PARTIAL_EFFECT != FAILURE
COMPENSATED != NEVER_OCCURRED
COMPENSATION_AUTHORIZED != COMPENSATION_COMMITTED
COMPENSATION_ABSENT != PROOF_OF_NO_COMPENSATION

## Status
No implementation; no formal verification. Exact reconciliation policy and compensation admissibility conditions remain UNSELECTED.

## Next
AB104.366 — research idempotent compensation and semantic fingerprints: preventing a recovery action from being mistaken for the original operation or from silently applying to changed target state.

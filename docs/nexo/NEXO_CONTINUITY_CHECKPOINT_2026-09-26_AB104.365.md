# NEXO CONTINUITY — AB104.365

AB104.365 persisted. Research only; no implementation.

Finding: after emergency revocation, a partial external effect must not be repaired by replaying the original operation. Compensation is a DISTINCT operation with its own operation_id, authorization, semantic contract, target-state binding, and effect evidence.

Candidate states:
RECONCILIATION_REQUIRED | COMPENSATION_AUTHORIZED | COMPENSATION_REJECTED | COMPENSATION_COMMITTED | COMPENSATION_UNKNOWN_EXTERNAL | MANUAL_REVIEW | CONFLICT

Rules:
- Preserve original effect evidence and authority frontier.
- Re-evaluate compensation against CURRENT authority/policy.
- Unknown target state/frontier => UNKNOWN/MANUAL_REVIEW.
- Compensation success does not erase historical partial effect.

Key distinction:
PARTIAL_EFFECT != FAILURE
COMPENSATED != NEVER_OCCURRED
COMPENSATION_AUTHORIZED != COMPENSATION_COMMITTED

RATS supports the separation: Relying Party applies application-specific policy, and freshness does not eliminate races after evidence generation. citeturn0search0turn0search24

Constraints: no V21, no implementation, no formal verification claim, preserve AB50–AB58 residuals, no overwrite/delete.

Exact next action: AB104.366 — idempotent compensation + semantic fingerprints, preventing recovery from being confused with the original operation or applied to changed target state.

DO-NOT-REPEAT: never reuse original operation identity for compensation.

# NEXO CONTINUITY — AB104.364

AB104.364 persisted. Research only; no implementation.

## Finding
RATS makes authorization application-specific and freshness architectural; policy/state may change immediately after evidence generation. RFC 6024 requires replay detection and recovery for trust-anchor management. citeturn0search0turn0search1

For multi-target emergency revocation:
- Shared authority epoch does NOT prove all targets observed/enforced the same frontier.
- Aggregate COMMITTED only if every required target has effect evidence satisfying the contract at the relevant policy/authority frontier.
- Candidate per-target states remain distinct: REJECTED_STALE, EFFECT_COMMITTED, EFFECT_OBSERVED, UNKNOWN_EXTERNAL, CONFLICT.
- Any required UNKNOWN_EXTERNAL prevents collapsing aggregate status to COMMITTED or NOT_COMMITTED.
- Missing target frontier evidence is an evidence gap, not proof of non-execution.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.365 — compensation/reconciliation after partial effects under emergency revocation, including whether compensation itself needs a newer authority frontier.

## DO-NOT-REPEAT
Do not infer global non-execution or global commitment from one target's receipt/rejection.

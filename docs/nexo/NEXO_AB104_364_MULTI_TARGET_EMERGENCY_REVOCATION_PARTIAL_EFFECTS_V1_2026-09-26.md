# NEXO AB104.364 — Multi-target emergency revocation and partial effects V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RATS places application-specific authorization decisions at the Relying Party and makes freshness an architectural decision; it also explicitly notes that policy/state can change immediately after evidence/results are generated. citeturn0search0turn0search25 RFC 6024 requires replay detection for trust-anchor management because replay can reintroduce old/compromised authority, and requires recovery mechanisms for compromise/loss. citeturn0search1turn0search2

## Finding
For a mission affecting multiple targets, one shared authority epoch does not prove that every target observed/enforced the same frontier. Emergency revocation therefore requires per-target effect evidence plus an aggregate contract.

Candidate per-target state:
REJECTED_STALE | EFFECT_COMMITTED | EFFECT_OBSERVED | UNKNOWN_EXTERNAL | CONFLICT

Candidate aggregate:
ALL_REQUIRED_TARGETS_COMMITTED
PARTIAL_EFFECT
UNKNOWN_SCOPE
CONFLICTING_EFFECTS
NOT_COMMITTED_ONLY_IF_NEGATIVE_EVIDENCE_IS_COMPLETE

## Rule
Aggregate COMMITTED only when every required target has evidence satisfying the mission's effect contract at the relevant authority/policy frontier. One target reporting rejection does not prove the other targets did not execute. One target's receipt cannot prove another target's state.

If any required target is UNKNOWN_EXTERNAL, aggregate status cannot silently collapse to NOT_COMMITTED or COMMITTED. It remains UNKNOWN/PARTIAL according to the contract.

## Recovery implication
After emergency revocation, a target with stale or missing authority knowledge must not be treated as equivalent to a target that actively rejected the old epoch. Missing frontier evidence is an evidence gap, not a negative execution proof.

## Status
No implementation; no formal verification. Exact aggregate state machine and cross-target atomicity protocol remain UNSELECTED.

## Next
AB104.365 — research compensation/reconciliation after partial effects under emergency revocation, including when compensation itself requires a newer authority frontier.

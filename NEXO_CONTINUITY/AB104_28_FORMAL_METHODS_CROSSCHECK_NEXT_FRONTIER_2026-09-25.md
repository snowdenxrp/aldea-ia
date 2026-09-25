# AB104.28 — Formal-methods crosscheck and next frontier — 2026-09-25

Status: RESEARCH ONLY.

## External crosscheck

Lamport's TLA defines an action as a relation between an old state and a new state. Auxiliary history variables can preserve information about past behavior without changing the underlying system semantics when used according to the formal rules. citeturn0search12turn0search14

## Consequence for Nexo reconstruction

The current AB104 fixture is methodologically aligned with that distinction:
- replay history may be represented as evidence;
- a missing LEASE_CONSUME relation cannot be replaced by an imperative mutation;
- a future observation is only concrete when the allowed successor relation is sufficiently specified;
- an UNKNOWN successor relation must remain epistemically open.

## Next frontier

The highest-value remaining task is therefore not another speculative completion. It is to audit the canonical repository for an actually specified next-state relation or executable gate evidence that could close one of:
1. LEASE_CONSUME;
2. LEASE_RENEW;
3. AB65 execution.

Until one closes, the semantic statuses remain unchanged.

## Status

LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_STATE_RECONSTRUCTION = UNKNOWN
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
SEMANTIC_FREEZE = NOT_DECLARED
AB65_EXECUTION = NOT_VERIFIED

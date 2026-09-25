# AB104.45 — Explicit invalidation/order frontier — 2026-09-25

Status: RESEARCH ONLY.

## Result

The remaining fully explicit frontier is limited to invalidation/order paths whose complete transition contracts are already recovered.

Safe rule:
- if both event contracts explicitly determine the relevant preconditions, post-state, frame and invalidation, their order may be compared;
- if either event leaves a P_AA-relevant successor field unresolved, the comparison propagates UNKNOWN;
- event-order difference alone is not a collision.

No new P_AA separator was established in this checkpoint.

## Boundary

EXPLICIT_INVALIDATION_ORDER = OPEN
QUOTIENT_CONGRUENCE = UNKNOWN
NEW_PAA_SEPARATOR = NONE_ESTABLISHED
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
AB65_EXECUTION = NOT_VERIFIED

## Next

Audit the explicit invalidation pairs against their actual ADMIT observation consequences, preserving UNKNOWN at the first incomplete transition.
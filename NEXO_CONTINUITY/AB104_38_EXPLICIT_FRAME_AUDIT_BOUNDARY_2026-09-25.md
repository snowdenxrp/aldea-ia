# AB104.38 — Explicit-frame audit boundary — 2026-09-25

Status: RESEARCH ONLY.

## Finding

The formal crosscheck confirms that a transition/action is a relation over complete old/new states; an incompletely specified successor cannot safely be treated as a unique next state. Explicit UNCHANGED/frame constraints are the standard way to state intended non-mutation. citeturn0search12turn0search4

## Audit result

For the currently recovered Nexo transition contracts, the known actions can only constrain fields explicitly covered by their recovered Post/Frame/Invalidation clauses. Any field omitted from the recovered contract remains epistemically unresolved unless another canonical source closes it.

This does not discover a new protocol law. It strengthens the stopping rule:

UNKNOWN_FRAME => UNKNOWN_SUCCESSOR

when the omitted field can affect future P_AA observation.

## Boundary

LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_STATE_RECONSTRUCTION = UNKNOWN
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
QUOTIENT_CONGRUENCE = UNKNOWN
AB65_EXECUTION = NOT_VERIFIED

## Next

Continue only with explicit-frame transitions and audit whether any recovered transition yields a new P_AA-relevant separator without relying on unresolved renewal/consume semantics.
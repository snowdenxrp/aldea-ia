# AB104.37 — Frame completeness and explicit unchanged-state boundary — 2026-09-25

Status: RESEARCH ONLY.

## Formal crosscheck

Lamport defines an action as a relation between old and new states. The TLA+ action guidance also notes that variables not constrained by an action are not thereby guaranteed unchanged; explicit UNCHANGED/frame constraints are needed when that is the intended semantics. citeturn0search12turn0search5

## Consequence for Nexo reconstruction

This sharpens the six-part contract already recovered in AB25/AB26:

- Post fields alone do not establish the full successor.
- Frame fields must be explicit wherever unchanged behavior is relied upon.
- An omitted field cannot be silently treated as unchanged.
- Conversely, an omitted field cannot be silently treated as mutable.
- Therefore an incomplete Frame is another reason to preserve UNKNOWN successor semantics.

## Applied to unresolved events

LEASE_RENEW and LEASE_CONSUME remain incomplete not only because their mutation law is missing, but because their complete frame/invalidation behavior is also not recovered.

No protocol semantics are added.

## Status

LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_STATE_RECONSTRUCTION = UNKNOWN
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
QUOTIENT_CONGRUENCE = UNKNOWN
AB65_EXECUTION = NOT_VERIFIED

## Next

Audit the known explicit transitions for hidden frame assumptions; persist only evidence-backed corrections.
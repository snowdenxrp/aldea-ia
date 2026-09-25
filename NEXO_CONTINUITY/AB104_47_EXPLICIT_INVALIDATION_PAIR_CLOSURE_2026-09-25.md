# AB104.47 — Explicit invalidation pair closure — 2026-09-25

Status: RESEARCH ONLY.

## Method crosscheck

A next-state relation describes the possible successor pairs; complete successor reasoning requires the action to constrain the relevant state variables, with explicit unchanged constraints where required. citeturn0search12turn0search3

## Result

The highest-value explicit invalidation/order pairs were rechecked against this completeness rule. No pair currently supplies a new P_AA separator independent of unresolved LEASE_RENEW/LEASE_CONSUME semantics.

The useful outcome is a closure rule:
- fully explicit pair + fully explicit observation consequence -> usable;
- incomplete pair or incomplete observation consequence -> UNKNOWN;
- event-order difference alone -> not a collision.

No protocol law was inferred.

## Boundary

EXPLICIT_INVALIDATION_ORDER = NO_NEW_SEPARATOR
KNOWN_TRANSITION_FRONTIER = OPEN
QUOTIENT_CONGRUENCE = UNKNOWN
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
AB65_EXECUTION = NOT_VERIFIED

## Next

Persist the closure and move to a compact consistency check across AB25/AB26/AB50/AB54/AB61/AB100/AB104 for contradictions, rather than expanding the attack space.
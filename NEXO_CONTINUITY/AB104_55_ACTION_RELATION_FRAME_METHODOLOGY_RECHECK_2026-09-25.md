# AB104.55 — Action-relation/frame methodology recheck — 2026-09-25

Status: RESEARCH ONLY.

## New external crosscheck

Lamport's TLA material confirms that an action is a relation between old and new states. The TLA+ guidance also makes explicit that successor generation requires every relevant state variable to be constrained or explicitly left unchanged; an incompletely specified successor is therefore not a uniquely determined next state. citeturn0search12turn0search4turn0search9

## Applied to Nexo

This independently revalidates the core AB104 rule:

- partial Post is not a complete successor relation;
- omitted Frame cannot be silently interpreted as UNCHANGED;
- implementation behavior cannot fill a missing canonical relation;
- history evidence can constrain observations but does not define missing successor semantics.

No new Nexo protocol law was inferred.

## Boundary

LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_STATE_RECONSTRUCTION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
AB65_EXECUTION = NOT_VERIFIED
SEMANTIC_FREEZE = NOT_DECLARED

## Next

Use this as a methodology checkpoint only; return to canonical Nexo evidence rather than generating more synthetic semantics.
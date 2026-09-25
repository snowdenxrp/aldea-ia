# AB104.40 — Explicit-transition separator audit — 2026-09-25

Status: RESEARCH ONLY.

## Result

A state-transition action constrains a relation over complete old/new states. Therefore a separator is usable only when the recovered action contract establishes both the relevant predecessor condition and the successor/observation consequence. citeturn0search12turn0search0

Audit of the currently recovered explicit-transition frontier found no new concrete P_AA separator that is independent of the unresolved LEASE_RENEW/LEASE_CONSUME laws.

The existing candidates remain:
- historical admission linkage: preserved as immutable evidence;
- policy/resource/authority/invalidation ordering: usable only where their explicit contracts constrain the resulting observation;
- replay/consumption: candidate only;
- lease renewal: unresolved.

No quotient congruence or collision is promoted.

## Boundary

KNOWN_TRANSITION_FRONTIER = OPEN
NEW_PAA_SEPARATOR = NONE_ESTABLISHED
LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_STATE_RECONSTRUCTION = UNKNOWN
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
QUOTIENT_CONGRUENCE = UNKNOWN
AB65_EXECUTION = NOT_VERIFIED

## Next

Shift from separator enumeration to a compact audit matrix of each recovered explicit action: Pre, Post, Frame, Invalidation, HistorySupport, AdmissionLink, and whether its effect can reach future P_AA without an unresolved transition.
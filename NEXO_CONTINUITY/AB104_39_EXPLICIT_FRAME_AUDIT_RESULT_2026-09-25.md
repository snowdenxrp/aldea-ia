# AB104.39 — Explicit-frame audit result — 2026-09-25

Status: RESEARCH ONLY.

## Audit result

The formal crosscheck confirms that an action is a relation between complete old/new states, and that explicit unchanged constraints are required when non-mutation is part of the intended transition contract. citeturn0search12turn0search14

Applied to the recovered Nexo actions:

- No new P_AA separator was established by the frame audit.
- No unresolved field may be silently classified as unchanged.
- Known explicit transitions remain usable only for the fields actually constrained by their recovered contracts.
- Any future path whose result depends on an unconstrained field must propagate UNKNOWN.

## Boundary

KNOWN_TRANSITION_FRONTIER = OPEN
LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_STATE_RECONSTRUCTION = UNKNOWN
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
QUOTIENT_CONGRUENCE = UNKNOWN
AB65_EXECUTION = NOT_VERIFIED

## Next

Target the remaining explicit transitions for a P_AA-relevant separator that is independent of LEASE_RENEW/LEASE_CONSUME. If none appears, preserve the frontier and do not expand speculative cases.
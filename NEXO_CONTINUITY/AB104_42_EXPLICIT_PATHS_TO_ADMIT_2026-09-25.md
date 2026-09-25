# AB104.42 — Explicit paths to ADMIT — 2026-09-25

Status: RESEARCH ONLY.

## Result

Tracing only recovered explicit actions toward ADMIT produces three usable categories:

1. Direct ADMIT from a state whose actual admission linkage is already known.
2. Paths through explicit invalidation/change events where the resulting observation is constrained by the recovered contract.
3. Paths that encounter an unresolved transition, incomplete frame, or missing admission linkage; these remain UNKNOWN.

The key boundary is preserved: historical validity of a bridge is not substituted for the actual UsedAdmissionContext. A path cannot establish P_AA merely because some valid witness exists.

No new concrete P_AA separator or collision was established.

## Boundary

EXPLICIT_PATH_TO_ADMIT = PARTIALLY_CLOSED
NEW_PAA_SEPARATOR = NONE_ESTABLISHED
LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_STATE_RECONSTRUCTION = UNKNOWN
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
QUOTIENT_CONGRUENCE = UNKNOWN
AB65_EXECUTION = NOT_VERIFIED

## Next

Audit whether two histories that reach ADMIT through only explicit transitions can be observationally equivalent under the lower-arity quotient while differing in actual admission linkage. If the quotient itself is not canonical, preserve UNKNOWN rather than declaring a collision.
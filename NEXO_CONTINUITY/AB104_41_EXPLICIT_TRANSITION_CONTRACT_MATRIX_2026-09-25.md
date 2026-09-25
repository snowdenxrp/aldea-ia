# AB104.41 — Explicit transition contract matrix — 2026-09-25

Status: RESEARCH ONLY.

## Matrix purpose

Reduce the remaining explicit-transition frontier to contract dimensions already recovered in AB25/AB26. No new protocol law is inferred.

| Action family | Pre | Post | Frame | Invalidation | History/Admission | Future P_AA |
|---|---|---|---|---|---|---|
| Authority/Policy/Delegation/Resource changes | explicit in recovered contracts | explicit where recovered | only explicit fields | explicit where recovered | event/history support | conditionally usable |
| LeaseIssue | recovered | bound lease creation | limited to recovered contract | recovered issuance effects | lease history | usable only within recovered scope |
| LeaseExpire | recovered | lease no longer protocol-valid | recovered fields only | expiry effect | temporal support | usable within scope |
| RetryAttempt | recovered conditionally | new attempt under explicit rule | prior-attempt inheritance not assumed | recovered | attempt history | cannot assume inherited bridge |
| Admit | actual linkage + predicates | AdmissionRecord | admission linkage preserved | recovered | UsedAdmissionContext | directly P_AA-relevant |
| LEASE_RENEW | incomplete | UNKNOWN | UNKNOWN | UNKNOWN | partial | UNKNOWN |
| LEASE_CONSUME | incomplete | UNKNOWN | UNKNOWN | UNKNOWN | partial replay evidence | UNKNOWN |

## Result

The matrix yields no new concrete P_AA separator. The highest-value explicit transition remains ADMIT because its actual admission linkage is directly claim-relative; however, this does not by itself establish a collision.

No unresolved field is promoted to UNCHANGED, and no historical replay field is promoted to a consume mutation.

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

Use the matrix to trace only explicit paths ending at ADMIT. Stop at any unresolved transition or missing frame/invalidation condition.
# AB104.43 — Quotient/UsedAdmissionContext audit boundary — 2026-09-25

Status: RESEARCH ONLY.

## Result

A TLA action defines a relation over old/new states, while the next-state relation determines which successor steps are possible. citeturn0search12turn0search8

Applied to the ADMIT frontier:

- Two histories may share the same currently observed lower-arity fields without being proven P_AA-equivalent.
- Actual UsedAdmissionContext remains claim-relative historical evidence.
- A quotient that omits admission-link identity is not yet established as behavior-preserving.
- Therefore equal snapshots under the current lower-arity projection cannot establish equivalence.
- A difference in admission linkage alone also does not establish a collision unless a legal future P_AA observation distinguishes the histories.

No new collision or congruence result is established.

## Boundary

EXPLICIT_PATH_TO_ADMIT = PARTIALLY_CLOSED
REPLAY_SEPARATOR = CANDIDATE_ONLY
NEW_PAA_SEPARATOR = NONE_ESTABLISHED
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
QUOTIENT_CONGRUENCE = UNKNOWN
LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
AB65_EXECUTION = NOT_VERIFIED

## Next

Keep the quotient boundary open only for evidence-backed admission-link observations. Do not manufacture a collision from snapshot equality.
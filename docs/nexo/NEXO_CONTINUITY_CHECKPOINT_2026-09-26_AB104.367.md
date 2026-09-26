# NEXO CONTINUITY — AB104.367

AB104.367 persisted. Research only; no implementation.

## Finding
RFC 7232 shows that conditional mutation preconditions (e.g. If-Match/entity-tags) are evaluated before a state-changing method and failed preconditions prevent the mutation. A verified duplicate/final state can be acknowledged without repeating the mutation. citeturn0search2turn0search4

RFC 9334 says freshness is architectural and policy/state can change after evidence generation; freshness does not eliminate the race. citeturn0search0

Therefore CAS/version is a TARGET-STATE guard, not an AUTHORITY guard.

Candidate compensation admission:
AUTHORITY_FRONTIER_VALID AND TARGET_VERSION_PRECONDITION_VALID

Cases:
- version match + current authority known => candidate admission;
- version mismatch => reject/revalidate;
- missing/unreliable version => UNKNOWN/STOP when exact state binding is required;
- version match + stale/unknown authority => UNKNOWN/STOP;
- already-reflected same logical compensation => candidate idempotent success if verified;
- incarnation changed => old version insufficient.

CAS does not prove current authority, historical non-execution, external effects outside the guarded target, or semantic equivalence across migrations.

Constraints: no V21, no implementation, no formal verification claim, preserve AB50–AB58 residuals, no overwrite/delete.

Exact next action: AB104.368 — combined admission predicate and conflict matrix when authority and target-version frontiers disagree.

DO-NOT-REPEAT: do not treat target CAS/version as proof of current authority.

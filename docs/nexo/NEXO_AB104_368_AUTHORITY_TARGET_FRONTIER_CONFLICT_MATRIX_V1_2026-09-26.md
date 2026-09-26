# NEXO AB104.368 — Authority × target frontier conflict matrix V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RFC 7232 requires a state-changing request's If-Match precondition to be evaluated before the method; a false condition prevents the mutation, except where the server can verify the requested state change already succeeded. RFC 9110 carries the same conditional semantics in current HTTP semantics. citeturn0search0turn0search5

## Finding
Compensation admission has two independent frontiers:
A = current authority/policy frontier
T = target state/version/incarnation frontier

Neither frontier proves the other.

## Matrix
A VALID + T VALID -> ADMISSIBLE candidate, subject to full operation/effect contract.
A VALID + T STALE -> REJECT/REVALIDATE.
A VALID + T UNKNOWN -> UNKNOWN/STOP when exact target binding is required.
A STALE + T VALID -> REJECT/REVALIDATE; target correctness cannot authorize obsolete policy.
A STALE + T STALE -> REJECT.
A STALE + T UNKNOWN -> REJECT/UNKNOWN depending on whether authority staleness is established or only suspected.
A UNKNOWN + T VALID -> UNKNOWN/STOP.
A UNKNOWN + T STALE -> UNKNOWN/STOP.
A UNKNOWN + T UNKNOWN -> UNKNOWN/STOP.

## Conflict rule
If evidence says A and T are both valid but their semantic/lineage bindings conflict, status is CONFLICT, not ADMISSIBLE.

## Important boundary
CAS/validator semantics can protect the target mutation from a stale observed representation, but they do not establish current Nexo authority. Conversely, a current authority token does not establish that the target remains at the expected state. RFC 7232 explicitly scopes conditional requests to target-resource state. citeturn0search1turn0search2

## Status
Exact authority validator, target validator, incarnation representation, and conflict-resolution policy remain UNSELECTED. No implementation; no formal verification.

## Next
AB104.369 — research atomic binding of authority frontier + target precondition at the actual mutation boundary, including whether a mediator can safely compose them without creating a new split-brain gap.

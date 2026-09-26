# NEXO AB104.367 — CAS/version preconditions and authoritative compensation frontier V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RFC 7232 defines conditional state-changing requests using validators such as entity-tags and requires the recipient to evaluate the precondition before performing the method; a failed If-Match condition must not cause the requested mutation. It also allows a successful response when the requested final state is already present and the server can verify the duplicate/change condition. citeturn0search2turn0search4

RFC 9334 distinguishes freshness from authorization and states that policy/state can change immediately after evidence generation; freshness narrows acceptable age but cannot eliminate the race. citeturn0search0

## Finding
CAS/version preconditions are useful at the target mutation boundary because they bind the compensation attempt to a target state observed earlier. They are not, by themselves, proof of current policy authority.

Candidate admission requires both:
AUTHORITY_FRONTIER_VALID
AND
TARGET_VERSION_PRECONDITION_VALID

## Cases
1. Version matches + current authority known → compensation may be admitted subject to the full contract.
2. Version mismatch + target reports current version → reject/revalidate; do not silently apply.
3. Version missing/unreliable → UNKNOWN/STOP for contracts requiring exact state binding.
4. Version matches but policy/authority frontier is stale/unknown → UNKNOWN/STOP.
5. Mutation already reflected and target can verify it is the same logical compensation → candidate idempotent success; preserve evidence.
6. Version is monotonic only locally but target incarnation changed → old version is not sufficient; require incarnation binding.

## Key distinction
CAS proves a target-state precondition at the mutation boundary; it does NOT prove:
- current policy authority,
- complete historical non-execution,
- external effects outside the CAS-controlled target,
- semantic equivalence across schema migration.

## Status
Exact target protocol, validator semantics, incarnation model, and compensation contract remain UNSELECTED. No implementation; no formal verification.

## Next
AB104.368 — research the combined admission predicate and conflict matrix when authority frontier and target-version frontier disagree.

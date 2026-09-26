# NEXO AB104.301 — Revocation, supersession, and historical authority
Date: 2026-09-26
Status: RESEARCH-ONLY

## Findings
1. A valid authorization at issuance can become stale before protected effect; current revocation/generation state must be load-bearing at the execution boundary. Recent IETF drafts explicitly identify this gap. citeturn0search0turn0search2
2. Generation/epoch fencing is a practical way to retire stale authority: an execution handle bound to an older generation must fail against newer protected state. citeturn0search4turn0search6
3. Revocation and supersession are different events. Revocation retires authority; supersession may replace an active operation/plan with a successor while preserving selected immutable identity/intent bindings. citeturn0search10
4. Historical validity must remain distinguishable from current executability. A revoked authorization can remain valid historical evidence that authorization existed at t0, but must not authorize a protected effect at t2 after the applicable fence.
5. Rollback is dangerous: restoring older protected state can resurrect spent authority. Therefore restoration must not silently restore current authorization validity; monotonic generation, external anchoring, append-only protected journals, or equivalent rollback resistance may be required. citeturn0search4turn0search6
6. For Nexo, candidate state separation is: `HISTORICAL_VALID`, `CURRENT_EXECUTABLE`, `REVOKED`, `SUPERSEDED`, `EXPIRED`, `UNKNOWN`. Historical evidence and execution authority must never be conflated.
7. A successor should bind its predecessor and relevant frozen identity/intent fields. A changed authority/intent digest should normally create a new authorization lineage rather than mutate the predecessor. citeturn0search10
8. Missing or conflicting revocation evidence must not silently become permission. Recent work on action/evidence boundaries likewise recommends refusal when the durable authority state is unavailable, stale, non-atomic, or ambiguous. citeturn0search7

## Candidate invariant
`CURRENT_GENERATION > bound_generation => stale authority MUST NOT execute protected effect`.
`REVOKED/SUPERSEDED historical record != executable authority`.
`RESTORE(old_state) != RESTORE(current_authority)` unless rollback safety is independently established.

## Non-claims
No architecture selected, implementation, formal verification, or semantic freeze. Recent IETF documents are drafts/work in progress, not settled standards.

## Next exact step
AB104.302 — study crash/recovery during revocation and supersession races: ordering of revoke, successor admission, in-flight execution, and restore.

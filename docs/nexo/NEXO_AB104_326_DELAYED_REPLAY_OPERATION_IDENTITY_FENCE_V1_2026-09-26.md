# NEXO AB104.326 — Delayed-message replay after recovery

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
Asynchronous networks can delay, reorder, duplicate, or lose messages; therefore a request arriving after recovery may be an old request whose sender is no longer current. citeturn0search1 Raft rejects stale protocol messages using terms, while its client-side duplicate suppression uses unique serial numbers plus remembered results. citeturn0search14turn0search15 External-effect fencing additionally requires the target to remember a monotonically increasing fence and reject older tokens. citeturn0search0

## Nexo consequence
No single field is sufficient across all replay cases. Candidate execution identity is the combination:
`target_id + target_incarnation + logical_operation_id + effect_semantics_fingerprint + authority_epoch/fence`

The target must validate this identity at the actual effect boundary. Candidate outcomes:
- same identity + same semantics + already committed => return authoritative prior result; do not execute again;
- same operation ID + different effect semantics => `CONFLICT`;
- old/invalid fence or authority epoch => `REPLAY_REJECTED`;
- target incarnation mismatch => `STALE_INCARNATION`;
- missing historical dedupe/receipt coverage => `UNKNOWN_EXTERNAL`, not `NOT_COMMITTED`.

## Important limitation
Operation identity + incarnation + fence can reject many stale requests, but it does not prove an ambiguous old effect never happened if the target lost the historical registry/receipt. In that case the safety mechanism prevents unsafe re-execution only if the target retains a monotonic fence/incarnation barrier; historical truth may still remain UNKNOWN.

## Candidate invariant
`A request may execute only if its authority/fence is current for the target incarnation AND its operation identity/semantics are admissible at the target effect boundary.`

No implementation or formal proof performed.

## Next
AB104.327 — study target-side persistence failure: what happens when the fence high-water mark or idempotency registry itself is partially lost, restored, or corrupted, and how recovery should distinguish UNKNOWN from safe re-admission.

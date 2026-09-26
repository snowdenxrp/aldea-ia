# NEXO CONTINUITY — AB104.309

## Canonical state
AB104.309 research persisted. No implementation performed.

## Finding
Target-side idempotency can safely absorb retries when operation identity and request semantics are durably bound, but idempotency does not itself prove the historical outcome of an ambiguous request. Authoritative target receipt/state is required to resolve UNKNOWN_EXTERNAL. citeturn0search1turn0search4turn0search8

## Required semantics
Same operation identity + materially different effect semantics => CONFLICT. Missing/expired idempotency evidence != NOT_COMMITTED. Receipt validity is scoped to target identity/incarnation and the actual target commit boundary.

## Constraints
Research first; no V21; no historical patching; no unsupported security/correctness/verification claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.310: study idempotency retention/eviction, target restore, and interaction with target incarnation changes.

## DO-NOT-REPEAT
Do not use absence of a dedupe record, timeout, or expired idempotency window as proof that an external effect never happened.

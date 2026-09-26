# NEXO CONTINUITY — AB104.326

## Canonical state
AB104.326 research persisted. No implementation performed.

## Finding
Delayed/reordered/duplicated messages require protocol-level freshness and target-side replay protection. Raft uses terms for stale protocol messages and unique client serial numbers for duplicate commands; fencing requires the target to reject older tokens. citeturn0search14turn0search15turn0search0

## Candidate execution identity
`target_id + target_incarnation + logical_operation_id + effect_semantics_fingerprint + authority_epoch/fence`

Candidate outcomes: already committed => return authoritative prior result; semantic mismatch => `CONFLICT`; stale fence/epoch => `REPLAY_REJECTED`; incarnation mismatch => `STALE_INCARNATION`; missing historical coverage => `UNKNOWN_EXTERNAL`.

## Critical boundary
These mechanisms can prevent unsafe re-execution when their durable state is intact, but cannot prove a missing historical effect did not happen. Lost/ambiguous target history remains UNKNOWN.

## Constraints
Research first; no V21; no implementation; no unsupported verification/security claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.327: study partial loss/restore/corruption of target fence high-water mark and idempotency/receipt registry, and recovery classification.

## DO-NOT-REPEAT
Do not claim operation_id, idempotency, incarnation, or fence alone provides universal exactly-once or historical non-execution proof.

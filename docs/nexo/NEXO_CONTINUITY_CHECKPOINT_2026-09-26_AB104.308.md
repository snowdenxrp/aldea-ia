# NEXO CONTINUITY — AB104.308

## Canonical state
AB104.308 research persisted. No implementation performed.

## Finding
Transactional outbox durably binds local state to outbound intent/message, but does not prove the final external effect. Relay duplication and downstream failures require separate target-side idempotency/reconciliation semantics. citeturn0search1turn0search6

## Required semantics
Keep INTENT_DURABLE, REQUEST_ACCEPTED, EFFECT_COMMITTED, EFFECT_OBSERVED, and UNKNOWN_EXTERNAL distinct. Intermediary acceptance is not final-target commitment.

## Constraints
Research first; no V21; no historical patching; no unsupported security/correctness/verification claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.309: research target-side idempotency and receipt protocols, especially how to resolve UNKNOWN_EXTERNAL without unsafe replay.

## DO-NOT-REPEAT
Do not convert durable outbox intent, broker publication, or intermediary acceptance into proof that the final external target committed the effect.

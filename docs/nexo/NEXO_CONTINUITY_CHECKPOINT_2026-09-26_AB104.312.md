# NEXO CONTINUITY — AB104.312

## Canonical state
AB104.312 research persisted. No implementation performed.

## Finding
When target mutation + operation registry + authoritative receipt share one durable transaction, recovery can reconstruct the committed result without re-executing the effect. If the boundary is split, UNKNOWN_EXTERNAL remains possible.

## Crash states
BEFORE_COMMIT; DURING_COMMIT/RECOVERY-DEPENDENT; AFTER_ATOMIC_COMMIT_BEFORE_RESPONSE; OUTSIDE_TARGET_TRANSACTION.

## Required semantics
Recovery reads authoritative target state/receipt first. A durable commit record is a recovery fact, not permission to repeat the effect. Missing evidence across a split boundary remains UNKNOWN_EXTERNAL.

## Constraints
Research first; no V21; no historical patching; no unsupported security/correctness/verification claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.313: study separately materialized/cached receipts, replica lag, stale reads, and how recovery establishes authoritative evidence.

## DO-NOT-REPEAT
Do not treat client timeout, cached receipt, or non-authoritative replica state as proof of target commit when the actual commit boundary is elsewhere.

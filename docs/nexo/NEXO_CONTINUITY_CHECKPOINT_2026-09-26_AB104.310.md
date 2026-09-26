# NEXO CONTINUITY — AB104.310

## Canonical state
AB104.310 research persisted. No implementation performed.

## Finding
Idempotency keys/records have a defined scope and lifecycle. Expiry or eviction removes deduplication protection but does not prove historical non-execution. Restore without a provably complete historical idempotency/effect registry requires a new target incarnation before resuming effects.

## Required semantics
Bind idempotency evidence to target identity/incarnation and effect semantics. Historical receipt from incarnation I is not automatically current evidence for J. Ambiguous pre-restore operations remain UNKNOWN_EXTERNAL unless authoritative evidence resolves them.

## Constraints
Research first; no V21; no historical patching; no unsupported security/correctness/verification claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.311: study durable idempotency/effect registries and whether dedupe record + target mutation + receipt can share one atomic boundary.

## DO-NOT-REPEAT
Do not interpret expired/evicted idempotency state as proof of absence, or restore an old dedupe registry as current without proving target incarnation and coverage.

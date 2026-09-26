# NEXO CONTINUITY CHECKPOINT — AB104.304
Date: 2026-09-26

## Completed
AB104.304 studied fencing/epochs against revocation→execution races.

## Key result
Client-side authorization checks and lease expiry do not close the race. Correctness-sensitive mutation requires an epoch/fencing value validated atomically at the protected effect boundary. Stale epochs must be rejected. Fencing improves stale-writer safety but does not prove external commit or eliminate UNKNOWN.

## Preserved unresolved state
AB50–AB58 residuals unchanged. Research-only; no implementation/formal verification/semantic freeze/V21.

## Do-not-repeat
Fence advancement != effect commit. Local auth check != atomic effect authorization. Restore must not reset the resource's highest accepted fence.

## Next exact action
AB104.305 — study fencing-token persistence/rollback under snapshot restore and quorum loss, including how monotonicity survives recovery without resurrecting stale authority.

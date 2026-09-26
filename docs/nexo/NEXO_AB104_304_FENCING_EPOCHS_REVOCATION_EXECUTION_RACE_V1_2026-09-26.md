# NEXO AB104.304 — Fencing/epochs against revocation→execution races
Date: 2026-09-26
Status: RESEARCH-ONLY

## Findings
1. Lease expiry or a client-side authorization check cannot by itself stop a paused/stale process from reaching the protected resource.
2. A fencing token/epoch must be issued in monotonically advancing order and carried to the mutation boundary; the protected resource must reject stale generations atomically. citeturn0search0turn0search6
3. Therefore `CHECK_AUTH -> EFFECT` is unsafe when authorization can change between the two steps. The decisive validity check belongs at the effect boundary or in an atomic intermediary that owns that boundary.
4. Epoch advancement is an ordering mechanism, not proof that an external effect happened. A higher epoch can safely reject stale work while the effect itself remains UNKNOWN if the target response is lost.
5. A durable resource-side highest-accepted fence is required; resetting it during restore can resurrect stale writers. citeturn0search3
6. If an external API cannot validate fencing tokens, a controlled intermediary can provide the fence only for effects it actually governs; it cannot retroactively fence an uncontrolled request already accepted by the external provider.
7. Candidate Nexo rule: every revocable execution authority carries an epoch/fence; every correctness-sensitive mutation validates that fence against current resource state atomically; stale epoch => REJECT_STALE, never silently retry as a new operation.
8. Fencing protects ordering/stale-writer safety, not end-to-end atomicity, delivery certainty, or historical observability.

## Candidate invariants
`EFFECT_ACCEPTED => fence >= resource.current_fence` at the authoritative mutation boundary.
`fence_old < fence_current => old execution cannot mutate protected state`.
`FENCE_ADVANCED != EFFECT_COMMITTED`.

## Non-claims
No architecture selected, implementation, formal verification, semantic freeze, or V21 patch.

## Next exact step
AB104.305 — study fencing-token persistence/rollback, including snapshot restore, quorum loss, and whether monotonicity survives recovery without creating false authority.

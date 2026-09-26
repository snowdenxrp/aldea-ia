# NEXO AB104.289 — Fencing persistence across restore/incarnation

Date: 2026-09-26
Status: RESEARCH ONLY.

## Sources studied
- Google Chubby: sequencers encode lock generation and protected servers validate them; stale sequencers are rejected. The Chubby paper also documents master epoch changes and client cache invalidation after master failure. citeturn0search24turn0search26
- etcd recovery documentation: restoring a snapshot can move the visible revision backward; restore creates a new logical cluster identity, and revision bumps/compaction are used to prevent consumers from treating old history as current. citeturn0search4turn0search13

## Findings
1. A fencing sequence cannot safely reset after restore. If old clients can return, a reset counter can make an ancient token appear current.
2. Restore is therefore an authority/incarnation boundary, not merely a data reload.
3. The protected target should reject a token from an obsolete target incarnation, even if its numeric generation looks valid.
4. Chubby's generation/epoch approach supports the principle that authority generation changes across master transitions; etcd's restore behavior reinforces that a restored system must not be treated as a continuation merely because its data parses and hashes correctly. citeturn0search26turn0search4
5. A revision bump is useful for preventing consumers from observing a decreasing revision, but it does not by itself establish cross-domain effect history, current authority, or proof that an external operation did not occur before restore. This is consistent with the multidimensional recovery-frontier work already recorded.
6. Therefore Nexo should distinguish at least: authority generation, target incarnation, resource/version frontier, and operation/effect evidence frontier. Exact representation remains unselected.
7. If restore lineage cannot establish continuity of the fencing state, safe behavior is to fence/rehydrate authority and reconcile outstanding UNKNOWN operations rather than treating restored absence as NOT_COMMITTED.
8. Fencing persistence solves stale-owner rejection; it does not solve UNKNOWN_EXTERNAL or prove historical non-occurrence.

## Candidate invariant
`RESTORED_TARGET_WITH_UNPROVEN_FENCE_CONTINUITY => NO_EXECUTABLE_PERMISSION_FROM_PRE_RESTORE_FENCE`

## Explicit non-claims
No architecture selected, no formal proof, no implementation, no semantic freeze.

## Next exact step
AB104.290 — investigate how target-side fencing state, operation registries, and authoritative receipts can be jointly restored without creating a false NOT_COMMITTED result or resurrecting stale operations.
# NEXO AB104.249 — TARGET OPERATION REGISTRY CRASH/RESTORE, TOMBSTONES AND AUTHORITATIVE NEGATIVE EVIDENCE V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core finding
A target can only authoritatively classify an operation as NOT_COMMITTED when its negative evidence is protected against both history loss and target rollback. Mere absence from a current registry, expired retention, a compacted journal, or a post-restart empty cache is insufficient.

## Registry and negative evidence
Candidate target registry must distinguish at least:
UNSEEN, RESERVED, ACCEPTED, COMMITTED, RECEIPT_AVAILABLE, REJECTED_PRE_ACCEPTANCE, UNKNOWN_EXTERNAL, PARTIAL, CONFLICT, EXPIRED_HISTORICAL, QUARANTINED.

A definitive NOT_COMMITTED claim requires a target-side guarantee covering:
1. the operation namespace and exact operation identity;
2. the relevant target incarnation;
3. an authority/fence generation applicable to the operation;
4. the retention interval in which the target promises complete history;
5. an atomic or linearizable observation boundary;
6. an authenticated/durable absence marker or equivalent complete-history proof;
7. anti-rollback continuity proving the evidence was not restored from an older target state.

Without these, result is UNKNOWN or UNKNOWN_PERMANENT, not NOT_COMMITTED.

## Tombstones
A tombstone can convert simple key absence into durable historical information, but only while its coverage and retention guarantees remain valid. Compaction may physically remove old history; therefore compaction is not itself a proof that an operation never committed. etcd documents that compaction makes prior revisions inaccessible, while its MVCC model otherwise preserves historical versions. citeturn0search1turn0search8 RocksDB similarly retains tombstones until compaction and snapshot constraints permit their removal; removal is a storage lifecycle operation, not semantic proof of non-occurrence. citeturn0search6turn0search15

## Linearizable observation vs watch/history
Historical streams can be ordered without being linearizable. etcd explicitly documents that watch is not linearizable and recommends correlating revisions with a linearizable operation when current state must be established. citeturn0search2 Therefore a delayed event stream, cached registry, or local replay cannot alone authorize NOT_COMMITTED.

## Crash/restore matrix
- crash before reservation: potentially NOT_COMMITTED only if the target provides a complete authoritative absence guarantee for that identity/incarnation; otherwise UNKNOWN.
- reservation durable, no acceptance: NOT_COMMITTED only if reservation semantics and atomic boundary prove no external effect was possible after reservation; otherwise UNKNOWN.
- acceptance/commit durable, response lost: COMMITTED after authoritative registry/receipt reconciliation.
- registry says absent after restore: not enough if restore may be older than the operation; UNKNOWN.
- tombstone retained and current incarnation/authority covers the query: candidate NOT_COMMITTED evidence.
- tombstone compacted with a documented gap: historical proof expires; do not infer NOT_COMMITTED.
- target incarnation changed: old absence cannot answer a new-incarnation query unless the contract explicitly binds the historical operation to the new incarnation.
- target rolled back: prior negative/positive evidence must be revalidated against anti-rollback continuity.

## Compaction rule
Safe compaction requires preserving a certificate/anchor that states what history was covered, through which revision/sequence, for which namespace/incarnation, under which authority and retention policy. The certificate itself must survive compaction. If it is absent or untrusted, old claims become UNKNOWN rather than being converted to NOT_COMMITTED.

## Freshness and evidence boundary
A current empty registry answers only 'nothing currently retained is visible here.' It does not answer 'the operation never committed.' This distinction is central to negative evidence.

## Target incarnation
Operation identity should not silently span target reincarnations. A stable operation_id can be globally unique, but its evidence must also state target incarnation. Otherwise a restored or replaced target could accidentally inherit or reject an operation based on stale history.

## Code study
GitHub indexed searches for effect-adapter/operation-registry terms returned no indexed results in this pass. This is not evidence of absence. Earlier direct inspection of effect-adapter/runtime/orchestrator/tests remains prototype evidence. No code was changed.

## Persistent AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.

## DO-NOT-REPEAT
absence != NOT_COMMITTED; compaction != proof; tombstone != perpetual proof; receipt != permission; watch/history != linearizable current-state proof; target restart != fresh truth; target incarnation cannot be ignored; no V21; no architecture implementation; no unsupported verification claims.

## Exact next mission
AB104.250: authoritative negative evidence and expiry semantics — design the evidence contract for NOT_COMMITTED, including coverage intervals, tombstone certificates, retention expiry, target incarnation transitions, quorum/authority dependence, and the UNKNOWN_PERMANENT boundary.
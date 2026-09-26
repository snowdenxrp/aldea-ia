# NEXO AB104.291 — Crash-consistent cross-domain checkpoints

Date: 2026-09-26
Status: RESEARCH ONLY.

## Evidence
etcd persists applied state at a specific Raft-log point (`consistent_index`), and its transactional KV operations are atomic within the etcd transaction/consensus domain. citeturn0search11turn0search10
Snapshot restore is explicitly a new cluster identity and may require revision bumping/compaction so consumers do not treat old revisions and caches as current. citeturn0search2
Chubby reconstructs volatile state from persistent state during failover and introduces a new client epoch before normal operations resume; this separates persistent reconstruction from current authority. citeturn0search24

## Findings
1. Crash consistency is strongest when all state participating in one invariant shares one atomic persistence/commit domain.
2. A single-domain atomic snapshot does not automatically make external domains atomic. An etcd transaction can atomically commit its own keys, but that does not atomically commit an arbitrary external effect. citeturn0search10
3. A multi-domain checkpoint can bind several snapshots by digest/lineage, but binding snapshots does not prove they were simultaneous unless the protocol explicitly defines a common commit/checkpoint boundary.
4. Therefore Nexo should not infer `JOINT_ATOMIC` from matching timestamps, revisions, hashes, or individually durable snapshots.
5. A crash-consistent checkpoint should distinguish: (a) durable local state, (b) authoritative target state, (c) authority/fence state, and (d) evidence coverage. Each can have a different frontier.
6. The cleanest candidate is a common authenticated checkpoint/commit boundary inside one authoritative domain, with external effects treated as separately reconciled unless the external target participates in an equivalent atomic protocol.
7. If no common boundary exists, recovery should preserve a bounded uncertainty interval rather than manufacture a total order from local persistence order.
8. Snapshot restore must advance/change the authority/incarnation context so stale pre-restore permissions cannot be reconstructed as current executable permissions. etcd's new cluster identity and revision-bump guidance illustrate this principle, but do not constitute a generic Nexo solution. citeturn0search2

## Candidate invariant
`LOCAL_CHECKPOINT_ATOMIC != CROSS_DOMAIN_EFFECT_ATOMIC` unless the external target participates in the same protected commit boundary or an equivalent protocol with authoritative semantics.

## Status
Research only. No architecture selected; no formal proof; no implementation; no semantic freeze.

## Next exact step
AB104.292 — investigate commit-index/checkpoint barriers and two-phase/three-phase coordination limits for binding authority state to external-effect evidence without falsely claiming atomicity.
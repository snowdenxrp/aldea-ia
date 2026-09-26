# NEXO AB104.271 — Archival certificate and safe compaction — 2026-09-26

Research-only.

Evidence:
- Raft snapshotting compacts committed log history by preserving a stable snapshot plus metadata identifying the last included index/term; compaction is safe only for state already represented by the snapshot. citeturn0search0turn0search2turn0search5
- etcd/raft implementations distinguish committed, persisted and applied frontiers; recovery must preserve ordering/invariants across snapshot and remaining log. citeturn0search2turn0search4

Findings:
1. Safe compaction is not deletion alone: retained state/certificate must carry the semantic information needed after the discarded history is gone.
2. For Nexo effect/dedupe evidence, a compacted certificate must preserve at least operation identity, target identity/incarnation, payload fingerprint, authority generation/fence context, covered sequence/revision range, predecessor/lineage digest, resolution state, evidence references, retention policy and certificate authenticity/integrity.
3. UNKNOWN must be representable in the compacted result. Compaction must never turn missing historical detail into NOT_COMMITTED.
4. A certificate proves what the archival domain attests about its covered history; it does not by itself prove the external target's mutation unless the target's authoritative commit boundary is included in that evidence.
5. A new live segment must link cryptographically/semantically to the sealed predecessor so compaction cannot create an alternate history by omission.
6. Restore must validate snapshot/certificate lineage, authority generation and target incarnation before using reconstructed state for execution.
7. The 200-entry prototype journal is not an archival certificate: it discards entries without demonstrated semantic coverage/certificate continuity.

Candidate lifecycle:
LIVE → SEALED → CERTIFIED_ARCHIVED/COMPACTED → LIVE_NEXT
with the certificate retaining resolution semantics and lineage.

No architecture selected or implemented. Research-only.

AB50–AB58 residuals unchanged. Next: AB104.272 — archive certificate dependencies/common-mode and whether multiple certificates can jointly prove a negative claim.
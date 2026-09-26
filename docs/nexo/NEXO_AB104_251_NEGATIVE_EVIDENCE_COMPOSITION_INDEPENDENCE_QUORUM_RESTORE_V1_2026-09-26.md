# NEXO AB104.251 — NEGATIVE EVIDENCE COMPOSITION, INDEPENDENCE, QUORUM AND RESTORE V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core finding
Multiple negative claims cannot be counted as independent evidence merely because they come from multiple replicas. Evidence composition must operate on a dependency graph whose edges capture shared issuer, trust root, snapshot lineage, replication history, storage/failure domain, target incarnation and observation boundary.

## Candidate evidence graph
Each claim node carries:
- operation identity/fingerprint;
- target/resource/incarnation;
- authority root/epoch/fence;
- covered revision/sequence interval;
- observation boundary and consistency mode;
- issuer and trust anchor;
- storage/snapshot lineage;
- replication ancestry;
- failure domain;
- retention/expiry;
- dependency nodes.

Two claims are independent only to the extent that the graph demonstrates non-common failure dependencies relevant to the claim. N distinct views of the same restored snapshot are one common-mode evidence family, not N independent proofs.

## Quorum is a protocol property, not a magic evidence multiplier
Raft commits entries after replication to a majority under its protocol, and its safety depends on log matching and election/commit rules, not on raw vote counting. citeturn0search12 etcd likewise defines completed operations through consensus and describes quorum as the basis for cluster agreement. citeturn0search0turn0search3 Therefore a Nexo negative certificate should not say 'N replicas agree' without specifying the consensus rule, eligible authorities, epoch/configuration, exact statement digest, and freshness/lineage guarantees.

## Contradictory replicas
If authoritative evidence says NOT_COMMITTED while another equally admissible authoritative source says COMMITTED, do not resolve by majority count, newest arrival, timestamp, or local preference. Candidate result: CONFLICT/QUARANTINED until the authority/lineage protocol determines which statement is admissible. If one source is demonstrably stale or below the current authority generation, it can be downgraded as stale evidence rather than treated as an equal contradiction.

## Restore and migration
A restore creates a semantic boundary: a snapshot can reconstruct historical state but does not automatically reconstruct authority freshness or complete operation history after the snapshot point. etcd's recovery documentation explicitly describes snapshot restore and special handling of revision continuity; it also warns that restore can require revision changes/compaction markers for consumers. citeturn0search10 This supports a Nexo rule: restored state must carry explicit provenance, snapshot coverage and post-restore incarnation/authority context before it can issue negative claims.

Migration is evidence transformation, not evidence multiplication. Migrating one certificate into three formats does not create three independent witnesses. A migrated claim inherits the source dependency graph and cannot gain authority/freshness merely through representation change.

## Candidate composition rules
- UNION of independent coverage intervals is valid only when gaps are proven covered and all intervals refer to the same target incarnation/authority semantics.
- INTERSECTION of claims can strengthen confidence only if each claim covers the exact predicate being asserted.
- Shared common-mode dependency collapses apparent multiplicity.
- One unresolved dependency blocks a definitive negative claim if that dependency could contain the missing commit.
- A quorum certificate is admissible only when signer eligibility, configuration/epoch, statement digest, coverage and anti-rollback semantics are all bound.

## Restore attack examples
1. Three replicas all restored from the same old snapshot report ABSENT: three views, one stale history.
2. Two replicas have current history, one old snapshot says ABSENT: old claim is stale if current authority/lineage dominates.
3. Migrated certificate copied across replicas: copies are not independent witnesses.
4. Replica A says NOT_COMMITTED at epoch 8; target is now epoch 9 and the operation could have executed after the boundary: epoch-8 claim cannot answer epoch-9 coverage.
5. Quorum members share a compromised/rooted trust anchor: raw threshold does not prove independence from that common dependency.

## Code study
Indexed GitHub search still did not surface an operation registry. This is not proof of absence. No implementation changed.

## Persistent AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.

## DO-NOT-REPEAT
N replicas != N independent proofs; quorum != generic truth; migrated copies != independent evidence; old snapshot != current absence; contradiction != timestamp contest; no V21; no implementation; no unsupported verification.

## Exact next mission
AB104.252: investigate evidence conflict resolution and stale-source dominance — authority generations, epoch fencing, snapshot lineage, equivocation, split-brain negative claims, and safe quarantine/recovery without rewriting historical facts.
# NEXO AB104.779R — fencing-state recovery, snapshot restore, and monotonicity

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Scope
Attack the resource-side fencing high-water mark during restart, failover, snapshot restore, and state reconstruction.

## Findings
1. Current etcd recovery documentation explicitly identifies revision rollback as a correctness hazard. A snapshot contains an earlier point in the revision lineage, so a restored cluster can otherwise report a lower revision than clients previously observed. etcd provides --bump-revision to prevent revisions from decreasing after restore, and --mark-compacted to invalidate historical watches/caches when that recovery mode is needed. citeturn0search0

2. Current etcd snapshot source exposes the recovery controls directly in RestoreConfig: RevisionBump and MarkCompacted. Restore applies the revision modification before writing the restored WAL/snapshot state. This confirms that monotonicity after restore is not merely client advice; the restore mechanism has an explicit state-reconstruction step for it.

3. A fresh process-local fencing guard is not equivalent to recovered fencing state. The independent disco Guard supports seeding its high-water mark from persisted state specifically so a restarted resource does not begin by accepting an old token. This establishes a practical recovery invariant: stale-token rejection state must survive the failure domain that the fence is intended to cover.

4. etcd also documents that snapshot restore creates a new logical cluster and rewrites member/cluster identity metadata. This matters for Nexo: authority continuity cannot be inferred from process identity or node identity alone after recovery. The recovered authority state and its fencing namespace must be explicitly reconstructed.

5. Current etcd recovery guidance also warns that old members can become 'zombie' members in certain historical recovery/restore scenarios; maintainers published a 2025 post describing triggers involving snapshot restore and forced cluster recreation. This is separate from revision fencing but is relevant to authority continuity: recovery can create identities/processes that must not regain authority merely because they still possess old state. citeturn0search2

## Recovery safety model
Normal runtime:
g1 < g2 < g3 ...
highestAccepted never decreases.

Unsafe restore:
highestAccepted = 51 before failure
restore -> 34
old token 40 -> ACCEPTED

Safe restore:
restore preserves or advances the acceptance floor
highestAccepted >= 51
old token 40 -> REJECTED

The exact mechanism can be a revision bump, persisted generation, quorum-backed epoch, or another monotonic recovery construction. The invariant is not the integer itself; it is preservation of the ordering relation used by the effect guard.

## Important distinction
Snapshot integrity is not the same as fencing continuity. A snapshot may be internally valid and still represent an earlier authority position. Therefore integrity validation answers 'is this snapshot internally consistent?' while fencing recovery answers 'can this recovered state safely reject operations from before the superseding authority?'

Likewise, marking old revisions compacted addresses stale observers/watchers; it does not by itself establish that an arbitrary external resource will reject an old fencing token.

## Evidence ledger
RESTORE_CAN_REGRESS_REVISION_WITHOUT_BUMP: SOURCE CONFIRMED
REVISION_BUMP_RECOVERY_MECHANISM: SOURCE CONFIRMED
MARK_COMPACTED_RECOVERY_MECHANISM: SOURCE CONFIRMED
RESTORE_REWRITES_CLUSTER_IDENTITY: SOURCE CONFIRMED
RESOURCE_FENCING_HIGH_WATER_MUST_SURVIVE_RESTART: SOURCE CONFIRMED BY INDEPENDENT IMPLEMENTATION DESIGN
SNAPSHOT_INTEGRITY_EQUALS_FENCING_CONTINUITY: FALSE
COMPACTION_EQUALS_EXTERNAL_FENCE: FALSE
RECOVERY_ZOMBIE_IDENTITY_RISK: SOURCE CONFIRMED
EXECUTED RESTART/FENCING RACE BY THIS AUDIT: NO
FORMAL PROOF: NOT ESTABLISHED

## Nexo implication
Fencing state belongs to the protected authority/effect domain and must have an explicit recovery invariant. A restart that reconstructs storage but lowers the acceptance floor can resurrect stale authority. Therefore recovery must be analyzed as part of the safety boundary, not as an operational afterthought.

Candidate recovery invariant:
`After any recovery event, the accepted-authority ordering for protected namespace R must not move backward relative to the greatest generation that could already have been accepted before the failure, unless the protocol explicitly establishes a new authority epoch that makes all prior credentials invalid.`

This is a candidate invariant, not final Nexo law.

## Exact next action
AB104.780R: investigate failover/leader-change semantics rather than full snapshot restore. Determine whether the fencing state can temporarily diverge across replicas, which replica is allowed to accept effects, and whether an old replica can resume with stale acceptance state. Then connect this to authority_epoch/fencing_epoch and split-brain prevention.

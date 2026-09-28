# NEXO GLOBAL AUDIT-094 — Checkpoint and Identity Continuity Across Recovery

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Audit-094 attacks restore-created incarnations, cluster/member identity, operation-ID continuity, fencing epoch monotonicity, dedup epoch continuity, provider identity migration, stale snapshots, anti-rollback, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence

HashiCorp Raft's current code defines LocalID as a unique server identifier across all time and exposes snapshot restore separately from applied-index/configuration state. citeturn0search1turn0search3

etcd's current recovery documentation states that snapshot restore overwrites member and cluster IDs, so the restored cluster is a new logical identity; it also recommends revision bumping/compaction to invalidate stale watchers and caches when restoring an older snapshot. citeturn0search8

AWS Durable Execution exposes a deterministic OperationId for a step and an attempt number, while completed step results are replayed from checkpoints. Its documentation warns that non-deterministic identity generation outside a durable step can produce a different ID on replay and defeat idempotency. citeturn0search5turn0search9

## Findings

### 1. Restore can create a new incarnation

A restored system may intentionally preserve business data while becoming a different runtime/cluster identity.

RESTORED DATA != RESTORED INCARNATION
RESTORE SUCCESS != IDENTITY CONTINUITY

etcd provides a concrete implementation example: restore overwrites member/cluster identity to prevent accidental rejoining of the former cluster. citeturn0search8

### 2. Stable identity must be scoped

A stable operation identifier is useful only relative to its namespace, provider, execution, contract epoch and incarnation.

STABLE ID != GLOBAL IDENTITY
OPERATION-ID STABILITY != SEMANTIC CONTINUITY

AWS's OperationId is deterministic for a durable step, but the surrounding execution still has attempts and replay semantics. citeturn0search9

### 3. Operation-ID reuse after restore

If a restored system reuses an old operation ID against a provider whose dedup state belongs to a different epoch, the same string can represent a different external operation.

SAME OPERATION_ID != SAME EXTERNAL OPERATION

A recovery boundary must distinguish identifier continuity from provider deduplication continuity.

### 4. Fencing epoch rollback

Persisting an older fencing epoch during disaster recovery can resurrect a writer that should no longer have authority.

RESTORED EPOCH != CURRENT AUTHORITY
EPOCH PERSISTENCE != PROOF OF MONOTONICITY

Anti-rollback requires an authoritative monotonic boundary external to the restored state or an equivalent proven mechanism.

### 5. Dedup epoch continuity

Deduplication state has temporal meaning. Restoring an old dedup database can make a previously processed operation appear new.

RESTORED DEDUP STATE != CURRENT DEDUP STATE
DEDUP EPOCH ROLLBACK != HISTORICAL NON-EXECUTION

### 6. Provider identity migration

Changing provider accounts, regions, clusters or namespaces can preserve business intent while changing operation identity semantics.

BUSINESS ID CONTINUITY != PROVIDER ID CONTINUITY
PROVIDER MIGRATION != IDENTITY PRESERVATION

A mapping needs scope, effective interval, authority and incarnation.

### 7. Stale snapshot replay

A stale snapshot can be cryptographically valid and internally consistent while semantically obsolete.

VALID SNAPSHOT != CURRENT SNAPSHOT
SNAPSHOT INTEGRITY != FRESHNESS
FRESHNESS != HISTORICAL COMPLETENESS

### 8. Anti-rollback scope

Anti-rollback protects against selected historical regressions, but a monotonic version does not by itself prove that no semantically relevant external event occurred outside the tracked version domain.

ANTI-ROLLBACK != WORLD COMPLETENESS
MONOTONIC VERSION != FUTURE FINALITY

### 9. Identity mapping across incarnations

An identity registry can map old and new incarnations, but the mapping itself is evidence and can become stale, revoked or common-mode.

MAPPING != IDENTITY PROOF
AUTHENTIC MAPPING != COMPLETE HISTORICAL MAPPING

### 10. Recovery and replay

AWS documents that replay returns checkpointed results for completed steps while incomplete steps may execute again; therefore a deterministic operation identity does not imply a single physical execution. citeturn0search0turn0search9

DETERMINISTIC REPLAY != SINGLE EXECUTION
CHECKPOINT REUSE != EXTERNAL EFFECT SINGULARITY

### 11. Cross-provider identity

Provider A and provider B can each expose authentic IDs for the same business intent without establishing that their histories are the same.

AUTHENTIC IDs != SHARED HISTORY
CROSS-PROVIDER MAPPING != HISTORICAL EQUIVALENCE

### 12. FutureObs_PAA

Identity continuity can be bounded over a declared recovery interval. It cannot prove that future observations will never expose a later incarnation, dedup reset, stale mapping or external event.

IDENTITY CLOSURE != FUTURE FINALITY
RECOVERY IDENTITY PROOF != FUTUREOBS_PAA CLOSURE

## Research-only identity/recovery boundary

Candidate record must bind:

- logical entity identity;
- runtime/cluster/member incarnation;
- provider identity;
- provider namespace/region;
- operation identity and namespace;
- execution/attempt identity;
- migration epoch;
- fencing/authority epoch;
- dedup epoch/window;
- snapshot/checkpoint identity and revision;
- restoration event;
- anti-rollback state;
- identity mapping provenance;
- provider contract version;
- receipt/reconciliation lineage;
- retention/compaction loss;
- dependency/common-mode closure;
- revocation/conflict status.

This remains research-only and is not a frozen Nexo protocol.

## Verdict

P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
population completeness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

## Mandatory AB55/AB56 carryover

AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission

GLOBAL-AUDIT-095 — attack identity/authority continuity under split-brain and rollback:
old/new incarnations concurrently alive, stale writers after restore, provider namespace reuse, operation-ID collisions, fencing divergence, dedup divergence, identity-map conflicts, anti-rollback bypasses, and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.

# NEXO — G-A14-01 CODE STUDY / PROTOCOL FEASIBILITY DELTA V1 — 2026-09-24

Status: FEASIBILITY / PROTOCOL RESEARCH
Scope: G-A14-01 only
Purpose: study real implementations after the semantic research delta
Implementation of Nexo: NOT STARTED
Technology selection for Nexo: NOT STARTED
Predecessor artifacts modified: NONE

## 1. Why this artifact exists

The semantic delta established that durability is necessary but insufficient: protected authority also requires non-regressive currentness. This artifact studies real code and operational recovery behavior to determine which parts existing systems actually guarantee and which guarantees remain application-level.

No implementation is being selected for Nexo by this study.

## 2. Code/system studied

### 2.1 etcd/raft

The etcd/raft implementation explicitly models persisted Raft state separately from application state. Its `Storage` interface is the persistence boundary, and on restart Raft reconstructs its previous state/configuration from storage. The code also carries an `Applied` index and deliberately documents that this is application-dependent configuration; if it is not restored correctly, previously applied entries may be returned again. This is strong evidence that consensus/log persistence does not automatically solve application-level duplicate-effect semantics.

The in-memory Raft storage rejects an incoming snapshot when the existing snapshot index is already greater than or equal to the incoming snapshot index (`ErrSnapOutOfDate`). This prevents a simple stale-snapshot overwrite inside that storage abstraction, but it does not establish a global anti-rollback guarantee across arbitrary restoration of the whole storage domain.

### 2.2 etcd snapshot restore

Current etcd recovery tooling explicitly supports `--bump-revision` and `--mark-compacted` during snapshot restore. The documented purpose is to prevent clients/caches from treating revisions from before the restore as if they were still part of the current history. The etcd recovery documentation states that, for Kubernetes controllers, revisions can be marked compacted so watchers are terminated and informer caches are invalidated.

This is highly relevant to Nexo: restoration is not treated merely as copying bytes back. The recovered system needs a semantic discontinuity that invalidates assumptions based on the old timeline.

However, etcd's revision bump is not by itself a generic Nexo authority epoch. It protects etcd's revision/cache semantics. Nexo would still need to bind authority, fencing, STOP, UNKNOWN, decommission and effect identity to an equivalent currentness protocol.

### 2.3 PostgreSQL WAL

PostgreSQL's WAL implementation provides crash recovery by replaying durable WAL records. Its documentation explicitly describes WAL as allowing committed transactions to survive crashes and permitting point-in-time recovery by restoring a prior physical backup and replaying WAL to a selected time.

This creates an important distinction for Nexo:

CRASH RECOVERY SAFETY != ANTI-ROLLBACK AUTHORITY SAFETY

PostgreSQL can legitimately support restoration to an earlier point in time. That is a database recovery feature, not a proof that the restored point is the newest state that may safely issue external authority.

PostgreSQL also exposes durability modes where a client can receive success before the transaction is guaranteed safe against a server crash (`synchronous_commit=off`). Therefore a protocol cannot infer its own required safety semantics merely from the existence of a database commit API; it must choose and enforce the required durability level.

The source code separates WAL management, recovery and startup responsibilities (`xlog.c`, `xlogrecovery.c`, `xlogreader.c`, etc.). This supports treating storage durability/recovery as a subsystem with explicit contracts rather than assuming a generic database transaction equals the complete Nexo protected transition.

## 3. Code-derived findings

### CF-01 — Consensus storage is not the whole application state

The etcd/raft code separates Raft storage from the application that applies committed entries. The `Applied` index is application-dependent. Therefore:

CONSENSUS LOG STATE != COMPLETE PROTECTED APPLICATION STATE

For Nexo, EffectBinding, UNKNOWN, external reconciliation, evidence invalidation and decommission state cannot be assumed safe merely because the consensus log is durable.

### CF-02 — Snapshot freshness is a semantic property

etcd explicitly prevents older snapshots from replacing a newer in-memory snapshot and its recovery tooling can bump revisions and mark old revisions compacted.

This supports the Nexo contract:

AUTHENTIC SNAPSHOT != CURRENT SNAPSHOT

and shows that recovery may need an explicit timeline/currentness transition.

### CF-03 — Revision bump is useful but domain-specific

etcd's revision bump protects the etcd revision namespace and cache/watch semantics. It should not be generalized into proof that every Nexo safety fact is monotonic.

Nexo still needs separate monotonic protection for at least:
- authority epoch;
- coordination fence/generation;
- STOP epoch;
- recovery epoch;
- decommission state;
- operation/effect identity history;
- VersionSet safety context;
- unresolved UNKNOWN.

### CF-04 — WAL protects crash consistency, not external truth

PostgreSQL WAL can reconstruct committed database state after crash. Nothing in that guarantee establishes that an external provider performed an effect.

Therefore the Nexo chain remains:

protected commit -> external attempt -> UNKNOWN/OUTCOME -> observation -> reconciliation -> claim

and never:

protected commit -> external truth.

### CF-05 — Point-in-time restore is intentionally allowed in normal databases

PostgreSQL explicitly supports point-in-time recovery. This means a generic database's notion of "successful recovery" can include intentionally returning to an earlier database state.

For Nexo, that is unacceptable for safety-critical authority unless a separate currentness/anti-resurrection protocol proves that the restored state cannot re-enable superseded authority.

### CF-06 — Durability level is configurable and therefore must be contractual

PostgreSQL documents that asynchronous commit can report success before the transaction is guaranteed durable against a crash. Nexo cannot leave this implicit. Each protected transition needs an explicit durability requirement tied to its safety semantics.

### CF-07 — Duplicate prevention has multiple layers

Raft/etcd can preserve ordered log entries, but application-level duplicate-effect semantics still depend on operation identity and applied-state continuity. Therefore Nexo should preserve the previously defined distinction:

operation_id = logical operation identity
effect_key = semantic external-effect identity
attempt_id = individual execution attempt

and require recovery to preserve the first two even when attempts are retried.

### CF-08 — Recovery itself is a state transition

etcd recovery code coordinates snapshot persistence, application, Raft state and notification. It does not simply replace a file and immediately declare the whole application semantically recovered.

This supports Nexo's existing:

RESTART -> QUARANTINE -> ATTEST -> VERIFY -> RECONCILE -> EXPLICIT RELEASE

model.

## 4. New counterexamples from code study

CE-C01 — Durable Raft log but lost application-applied identity causes repeated application of an old entry.

CE-C02 — Valid etcd snapshot restored without revision bump lets clients/caches retain assumptions tied to the old revision timeline.

CE-C03 — Valid database PITR restores a state older than a previously consumed Nexo authority epoch.

CE-C04 — Database reports success under weaker durability than the protected transition requires, followed by crash and state loss.

CE-C05 — Consensus commit is treated as external effect completion.

CE-C06 — Snapshot integrity/hash is treated as proof of snapshot currentness.

CE-C07 — Restored storage is considered equivalent to restored authority without an explicit recovery release gate.

## 5. Protocol implications

The code study strengthens, but does not replace, PSC-01 through PSC-10 from the prior semantic delta.

New explicit requirement:

PSC-11 — Recovery Timeline Contract

A protected recovery operation must establish whether the restored state belongs to the currently admissible safety timeline. If the system cannot establish that the restored state is at least as current as the last accepted protected safety state, the restored state must remain non-authoritative/quarantined.

A timeline discontinuity may be represented by a new epoch/generation/revision, but the mechanism must itself survive or independently detect rollback.

PSC-12 — Applied-State Continuity Contract

For every protected transition whose duplicate admission could create a safety violation, recovery must preserve enough applied/operation identity state to distinguish:
- never admitted;
- admitted but response lost;
- committed;
- attempted externally;
- UNKNOWN;
- reconciled;
- terminal/decommissioned.

A consensus/log layer alone does not satisfy this unless the application state is proven to refine the log semantics.

PSC-13 — Recovery-Durability Contract

Each protected transition must specify the durability point required before the protocol may return success or cross an authority boundary. Configurable weaker durability cannot be silently accepted for a safety-critical transition.

## 6. Mechanism-class assessment

### A. WAL / transactional database

Strengths:
- crash recovery;
- atomic transaction boundaries;
- durable ordering/history depending on configuration.

Insufficient alone for:
- anti-rollback against intentional/administrative PITR;
- external effect truth;
- stale actor fencing across a restored authority domain;
- independent currentness witness.

Assessment: candidate storage primitive, not complete Nexo authority protocol.

### B. Consensus / replicated state machine

Strengths:
- ordered replicated commands;
- quorum-based commitment;
- leader/term semantics;
- snapshot/log recovery.

Insufficient alone for:
- external-world effect truth;
- application-state refinement unless explicitly proven;
- protection against restoring the entire consensus domain to an older valid state;
- all evidence/reconciliation semantics.

Assessment: strong candidate for protected linearization, but not a complete solution.

### C. Snapshot + revision/epoch discontinuity

Strengths:
- can invalidate stale clients/caches;
- can make recovery timeline changes explicit.

Insufficient alone for:
- independent proof that the new revision cannot itself be rolled back;
- all Nexo P0 state;
- external effects.

Assessment: useful protocol component.

### D. Independent anti-rollback witness

Potential strength:
- can distinguish an authentic old snapshot from current state even when the primary store is rolled back.

Costs:
- new dependency/common-mode analysis;
- potential TCB expansion;
- availability semantics;
- witness recovery semantics become part of the formal model.

Assessment: promising but unresolved.

### E. Hybrid

A likely architecture class is:

consensus/transactional protected state
+
explicit monotonic/currentness witness
+
application operation/effect identity
+
reconciliation protocol
+
recovery fence

This is only a candidate architecture class, not a final choice.

## 7. Key feasibility result

The code study produces no evidence that a single generic storage feature automatically supplies all required Nexo properties.

The strongest observed pattern is layered:

1. storage durability;
2. ordered/atomic state transition;
3. application-level identity continuity;
4. recovery timeline/currentness;
5. fencing;
6. external reconciliation;
7. claim validation.

This is consistent with the A05/A06 topology and strengthens the need to keep those concerns separate.

## 8. Mini-audit impact

No contradiction with A01-A14 was found.

The code study refines three existing claims:

1. A05: authoritative state must include not only durable state but currentness/non-regression semantics.
2. A06: linearization must survive recovery semantically; a transaction/log commit that can later be forgotten is insufficient.
3. A07-A10: recovery, evidence, dependency and TCB contracts must account for the anti-rollback/currentness mechanism as a first-class dependency.

No predecessor document is modified.

## 9. Status

G-A14-01 semantic contract: DESIGNATED / substantially designed.

G-A14-01 mechanism feasibility: OPEN.

Concrete technology selection: OPEN.

Formal SANY/TLC: OPEN.

Implementation: NOT STARTED.

Fault injection: OPEN.

## 10. Next research step

Before selecting a concrete technology, perform a focused mechanism comparison for the unresolved property:

"How can Nexo preserve or independently establish a non-regressive currentness witness when the primary protected store, its replicas, snapshots, logs, and recovery media can fail or roll back together?"

The comparison must include failure-domain/common-mode analysis and must determine whether the witness becomes part of TCB, whether loss of the witness is fail-closed, and whether recovery of the witness itself can regress.

Do not proceed to G-A14-02 until the mini-audit of this code-study delta is complete.

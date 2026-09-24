# NEXO — G-A14-01 MINI-AUDIT OF CODE STUDY DELTA V1 — 2026-09-24

Status: FEASIBILITY / PROTOCOL RESEARCH
Scope: coherence audit after semantic + code-study deltas
Predecessors modified: NONE
Implementation: NOT STARTED
Technology selection: NOT STARTED
SANY/TLC: NOT EXECUTED

## 1. Purpose

This mini-audit checks whether the G-A14-01 semantic research and code-study deltas remain coherent with A01-A14 and whether the study introduced an unsupported assumption.

The audit is deliberately narrow. It does not close G-A14-01 and does not select a technology.

## 2. Evidence checked

The audit was performed against:
- A05/A06 authoritative state and linearization architecture;
- A07-A10 STOP, recovery, evidence, dependencies and TCB;
- A11 adversarial failure/interleaving audit;
- A12 formal boundary/canonical model;
- A13 deployment mapping;
- A14 completeness self-audit;
- G-A14-01 semantic research delta;
- G-A14-01 code-study/protocol-feasibility delta.

External implementation evidence was rechecked against primary/maintainer sources:
- etcd/raft Storage and snapshot behavior;
- etcd snapshot restore revision bump / compaction behavior;
- PostgreSQL WAL/PITR/timeline behavior;
- NIST SP 800-193 rollback/resilience guidance.

## 3. Audit findings

### F-01 — No contradiction: durability vs currentness

The code study strengthens rather than changes the existing distinction:

DURABLE != CURRENT

PostgreSQL explicitly supports point-in-time recovery to an earlier state, while etcd explicitly adds revision-bump/compaction behavior after restore to preserve API/cache semantics. Therefore the architecture must keep recovery consistency separate from currentness.

Status: CONFIRMED.

### F-02 — No contradiction: consensus vs application state

The etcd/raft Storage interface separates Raft persistence from application-applied state. Therefore the previous A05/A06 decision that the authoritative state must be defined semantically, rather than equated with a consensus log, remains valid.

Status: CONFIRMED.

### F-03 — Important refinement: PMA is a property, not yet an object

The prior semantic delta introduced Protected Monotonicity Anchor (PMA). The code study does NOT justify making PMA a single canonical object.

PMA must remain a semantic requirement until mechanism research determines whether it is implemented as:
- a witness;
- an independent epoch;
- a timeline relation;
- a quorum property;
- a platform primitive;
- or a hybrid.

Therefore PMA must NOT yet be inserted as a new canonical object in A12.

Status: DESIGNATED, not canonicalized.

### F-04 — Important refinement: timeline != clock

The research uses "timeline/currentness" semantically. It must not be interpreted as requiring trusted wall-clock time.

A timeline can be represented by logical ordering, generation, epoch, lineage, or another protected relation.

This preserves G-A14-02 (trusted time) as a separate open gap.

Status: CONFIRMED.

### F-05 — No contradiction: restore != authority restore

The code evidence strongly supports the existing A07 recovery sequence:

RESTART -> QUARANTINE -> ATTEST -> VERIFY -> RECONCILE -> EXPLICIT RELEASE

Successful restoration of storage is not sufficient for release.

Status: CONFIRMED.

### F-06 — New common-mode concern

The proposed independent witness cannot automatically be called independent.

If the witness shares the same:
- storage substrate;
- backup repository;
- administrative authority;
- trust root;
- recovery mechanism;
- deployment failure domain;
- clock source;
- network partition domain;
- operator;

then it may not provide the independence required to defeat common rollback.

This links directly to A09 and A10.

Status: OPEN RESEARCH REQUIREMENT.

### F-07 — New fail-closed rule for witness loss

If currentness cannot be established because the proposed witness is unavailable or contradictory, protected release cannot infer freshness from the primary store alone.

Required semantic result:

CURRENTNESS = UNKNOWN
=> PROTECTED RELEASE = BLOCKED

This is a derived contract candidate, not yet formally verified.

Status: DESIGNATED.

### F-08 — Recovery may create a new lineage rather than resume the old one

PostgreSQL timelines demonstrate that recovery can intentionally create a new history branch. This does not solve Nexo's authority problem, but it reveals a useful architectural distinction:

RESTORED STATE LINEAGE
!=
CURRENT AUTHORITY LINEAGE

A future Nexo recovery protocol may need to explicitly create a new recovery lineage/epoch rather than pretending the restored state is a seamless continuation.

Status: DESIGNATED for further protocol research.

## 4. Adversarial checks

### Check A — Can an authentic old snapshot regain authority?

Yes, if no independent/currentness rule exists.

Therefore the architecture must block this case.

Result: requirement confirmed.

### Check B — Can an epoch protect itself if the epoch store rolls back?

No.

An epoch is only useful against stale actors if the system can establish that the accepted current epoch did not regress.

Result: requirement confirmed.

### Check C — Can a consensus log alone prove an external effect happened?

No.

Consensus orders/protects internal state; external execution remains a separate effect boundary.

Result: invariant preserved.

### Check D — Can snapshot integrity prove currentness?

No.

Integrity establishes authenticity/integrity of the image, not that it is the newest admissible image.

Result: invariant preserved.

### Check E — Can a restored application state be trusted merely because Raft/storage recovery succeeded?

No.

Application state continuity and currentness remain separate contracts.

Result: invariant preserved.

### Check F — Does an independent witness automatically solve rollback?

No.

If the witness shares the failure domain or can itself regress, the rollback problem remains.

Result: new open requirement.

## 5. Corrections to avoid overclaiming

The code-study delta must not be interpreted as proving that a hybrid witness architecture is necessary in every implementation.

It establishes a feasibility requirement:

SOME mechanism must provide non-regressive currentness across the modeled rollback domain.

The exact mechanism remains OPEN.

Likewise, etcd and PostgreSQL are evidence of concrete mechanisms and failure semantics, not evidence that their complete architectures are suitable for Nexo.

## 6. Updated contract set

The following remain designated, not formally verified:

PSC-01 through PSC-10.
PSC-11 Recovery Timeline Contract.
PSC-12 Applied-State Continuity Contract.
PSC-13 Recovery-Durability Contract.

Derived candidate rule:

PSC-14 Currentness Fail-Closed Contract

If the protected system cannot establish currentness/non-regression for a safety-relevant recovery, it MUST NOT enter an execution-enabled state. It may remain quarantined, restricted, or require explicit recovery resolution.

PSC-14 remains DESIGNATED until the concrete mechanism and formal model are defined.

## 7. A01-A14 coherence result

A01 Context: unchanged.

A02 Authority: strengthened; authority depends on currentness, not merely durable representation.

A03 Canonical Objects: unchanged. PMA is not yet promoted to a canonical object.

A04 Transitions: strengthened; recovery/currentness must be part of protected transition contracts where relevant.

A05 Authoritative State: strengthened; P0 includes currentness/non-regression semantics.

A06 Linearization: unchanged in definition; persistence across recovery is now explicitly required.

A07 STOP/Recovery: strengthened; successful storage restore cannot clear STOP or release authority.

A08 Evidence/Claims: unchanged; storage evidence cannot prove external truth.

A09 Dependencies/Common-mode: strengthened; an anti-rollback witness must be analyzed as a dependency and common-mode failure domain.

A10 TCB: strengthened; any mechanism trusted to establish currentness may become claim-specific TCB.

A11 Adversarial Audit: no invalidation found. New storage/recovery counterexamples are consistent extensions.

A12 Formal Boundary: no change yet. PMA/PSC-14 should enter the formal model only after mechanism semantics are selected.

A13 Deployment Mapping: no change yet. Witness topology remains an open feasibility question.

A14 Self-Audit: G-A14-01 remains open exactly as intended; the gap has been refined into explicit semantic and mechanism sub-gaps.

## 8. Status after mini-audit

G-A14-01 semantic contract: DESIGNATED / substantially specified.

G-A14-01 code-study findings: ACCEPTED WITH REFINEMENTS.

G-A14-01 concrete mechanism: OPEN.

G-A14-01 common-mode analysis: OPEN.

G-A14-01 formal verification: OPEN.

G-A14-01 implementation: NOT STARTED.

No predecessor artifact was overwritten or modified.

## 9. Next step

The next research phase remains inside G-A14-01:

Compare mechanism classes for a non-regressive currentness witness under common-mode failure.

Required comparison dimensions:
1. crash;
2. partition;
3. quorum loss;
4. complete rollback of primary store;
5. rollback of backups/snapshots;
6. corruption;
7. witness loss;
8. witness rollback;
9. disagreement between witness and primary;
10. recovery of the witness;
11. administrative/operator compromise;
12. trust-root compromise;
13. availability impact;
14. TCB impact;
15. formalizability;
16. implementation/testability.

Only after this research should concrete technologies be compared.

## Final gate

G-A14-01 remains OPEN.

The mini-audit found no contradiction requiring rework of A01-A14.

The principal new requirement is:

**A recovery mechanism must not merely reconstruct an internally consistent state; it must establish non-regressive currentness for every safety fact whose rollback could resurrect authority.**

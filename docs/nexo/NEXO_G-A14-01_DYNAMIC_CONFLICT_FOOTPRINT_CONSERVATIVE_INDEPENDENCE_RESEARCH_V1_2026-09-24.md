# NEXO G-A14-01 — Dynamic Conflict Footprints and Conservative Independence
## Research Delta V1 — 2026-09-24

Status: DESIGN RESEARCH / ADVERSARIAL
No implementation. No formal proof.

## 1. Question

Can Nexo safely infer that two operations are independent when conflict footprints are dynamic, partially unknown, or affected by resources, predicates, policy, migration, and recovery?

## 2. Research evidence

FoundationDB documents strict serializability through read/write conflict ranges and allows explicit conflict ranges when an invariant is broader than the keys directly accessed. It also supports adaptive sharding for highly contended structures. This demonstrates a useful pattern: the conflict domain may be declared explicitly and can be broader than the physical data touched.

etcd transactions atomically evaluate comparisons over multiple keys and apply a success/failure branch. This supports multi-key guards inside one transaction, but does not establish independence across separate etcd transactions.

PostgreSQL Serializable Snapshot Isolation tracks predicate/read dependencies, and may coarsen predicate locks when tracking resources are constrained. Coarser tracking can increase false-positive serialization failures while preserving the safety objective. This is directly relevant to conservative conflict detection.

## 3. Central finding

A safe conflict detector does NOT need to identify the smallest possible conflict domain.

It DOES need to avoid false negatives for safety-relevant conflicts.

Therefore:

FALSE POSITIVE
→ unnecessary serialization / retry / reduced throughput

FALSE NEGATIVE
→ possible safety violation

For Nexo, the architecture must prefer conservative over-approximation.

## 4. Conservative footprint principle

Let ActualConflict(O) be the real protected dependencies of operation O.

Let DeclaredFootprint(O) be the dependencies used by coordination.

Required safety relation:

ActualConflict(O) ⊆ DeclaredFootprint(O)

If this inclusion cannot be established, independent execution is not proven safe.

The reverse is allowed:

DeclaredFootprint(O) ⊃ ActualConflict(O)

This causes extra contention but not a semantic safety failure.

## 5. Dynamic resources

An operation may not know every concrete resource at planning time.

Example:
- provider chooses a concrete execution slot;
- target resolves dynamically;
- resource allocation changes during admission;
- policy introduces a new constrained resource;
- reconciliation discovers an external dependency.

Therefore the initial footprint may be provisional.

Candidate lifecycle:

FOOTPRINT_UNKNOWN
→ FOOTPRINT_DECLARED
→ FOOTPRINT_BOUND
→ FOOTPRINT_VALIDATED
→ COMMIT_ELIGIBLE

A transition that discovers a dependency not covered by the current protected domain must not silently continue.

Required response:
EXPAND FOOTPRINT + REVALIDATE
or
ABORT/HOLD/QUARANTINE.

## 6. Unknown dependency rule

UNKNOWN dependency cannot be treated as empty dependency.

Canonical safety rule candidate:

UNKNOWN_DEPENDENCY
→ NO_INDEPENDENT_RELEASE

Possible implementation choices:
- conservative super-domain;
- global safety domain;
- operation-specific quarantine;
- explicit dependency resolution before commit.

No implementation selected.

## 7. Predicate dependencies

Key equality is insufficient for some invariants.

Example:
capacity < 10

An operation may read:
all reservations satisfying resource=R.

A new reservation can violate the predicate without modifying the exact key read by the first operation.

This is why systems such as PostgreSQL serializable isolation use predicate/dependency tracking, and FoundationDB permits explicit conflict ranges broader than directly read keys.

Nexo therefore needs a semantic distinction between:
KEY CONFLICT
and
INVARIANT/PREDICATE CONFLICT.

## 8. Dynamic footprint expansion

If an operation begins with:
F0 = {E1, Resource R}

and discovers:
F1 = F0 ∪ {AuthorityDomain A}

then F1 cannot simply be appended after another transaction has independently committed against A.

The expansion itself must be linearized or validated against intervening commits.

Candidate protocol:

1. read current footprint epoch
2. propose expansion
3. acquire/validate new conflict domain
4. validate old reads and assumptions
5. linearize expanded footprint
6. continue
or fail/retry.

## 9. Cross-shard implication

A transaction may initially belong to shard A and later discover a dependency in shard B.

Therefore:
SHARD ASSIGNMENT BEFORE FULL FOOTPRINT BINDING
is unsafe unless the protocol explicitly supports dynamic expansion.

Safe choices:
- conservative initial super-shard;
- transactional cross-shard footprint acquisition;
- deterministic pre-declaration with rejection on mismatch;
- optimistic validation with abort.

## 10. False positives are acceptable but must be bounded operationally

Conservative over-approximation can cause:
- contention;
- retries;
- hotspot formation;
- resource pressure;
- starvation.

These are availability/performance hazards, not permission to weaken the safety relation.

Resource exhaustion must therefore transition toward:
NORMAL → RESTRICTED → HOLD
rather than dropping conflict protection.

## 11. Footprint evidence

The system should distinguish:
DECLARED
OBSERVED
VALIDATED
PROVEN-BOUNDED

A declaration from an untrusted planner is not proof of completeness.

Potential evidence sources:
- typed operation schema;
- policy/invariant compiler;
- protected admission logic;
- runtime resource binding;
- provider contract;
- verified dependency closure;
- static analysis;
- runtime conflict detection.

No single source is automatically authoritative.

## 12. Changing invariants

If VersionSet or PolicyBaseline changes while an operation is pending, the old footprint may no longer be sufficient.

Therefore:
VersionSet change
→ invalidate footprint validation
→ recompute/revalidate
→ no release from stale footprint.

This connects directly to existing VersionSet and evidence invalidation rules.

## 13. Migration

During shard migration, the old and new placement cannot be treated as independent safety domains.

For a coupled operation:
- source and destination lineage must be coordinated;
- stale source writers must be fenced;
- dependency closure must survive cutover;
- old state cannot be compacted until successor validation exists.

## 14. Reconciliation and compaction

If reconciliation discovers a new dependency, compaction eligibility may be invalidated.

Therefore:
RECONCILIATION DISCOVERY
→ FOOTPRINT EXPANSION
→ COMPACTION RECHECK

Compaction must never rely on a footprint that became stale during reconciliation.

## 15. Research-derived candidate protocol

Protected operation lifecycle:

PROPOSED
→ FOOTPRINT_UNKNOWN
→ FOOTPRINT_DECLARED
→ FOOTPRINT_BOUND
→ ADMISSION_VALIDATED
→ LINEARIZED
→ EFFECT_PENDING/EXECUTING
→ RECONCILIATION
→ TERMINAL_VERIFIED
→ COMPACTION_ELIGIBLE
→ COMPACTED_WITH_SUMMARY

At every transition, if required footprint completeness/currentness becomes UNKNOWN:
→ HOLD / QUARANTINE / REVALIDATE.

## 16. New contracts

PSC-50 — Conservative Footprint Soundness
Actual protected conflicts must be contained by the coordination footprint.

PSC-51 — Unknown Dependency Non-Independence
Unknown dependency cannot authorize independent protected commit.

PSC-52 — Dynamic Footprint Expansion
Newly discovered protected dependencies require protected expansion and revalidation.

PSC-53 — Predicate/Invariant Conflict Coverage
Key-level conflict tracking is insufficient where safety depends on predicates/invariants.

PSC-54 — Footprint Version Binding
A validated footprint is bound to its VersionSet/PolicyBaseline/InvariantBaseline context.

PSC-55 — Footprint Evidence Integrity
Footprint completeness claims require evidence appropriate to their assurance level.

PSC-56 — Compaction Dependency Revalidation
Newly discovered dependencies invalidate affected compaction eligibility.

## 17. New invariants

INV-GA14-01-64:
No operation may independently commit unless its protected conflict footprint is conservatively sound.

INV-GA14-01-65:
Unknown dependency cannot be interpreted as no dependency.

INV-GA14-01-66:
Footprint expansion cannot bypass already-linearized conflicting operations.

INV-GA14-01-67:
Version/policy/invariant changes invalidate dependent footprint validation.

INV-GA14-01-68:
Compaction cannot remove information needed to establish conservative conflict soundness.

INV-GA14-01-69:
False-positive conflict detection may reduce concurrency but must not weaken safety.

## 18. Adversarial cases checked

A. Two effects same target:
must conflict.

B. Different targets, same provider:
may be independent only if provider-level invariant permits it.

C. Different effects, shared capacity:
must coordinate through resource/invariant domain.

D. Dynamic provider-selected resource:
must bind before protected release or enter conservative domain.

E. Unknown dependency:
no independent commit.

F. Footprint expands after another shard commits:
expansion must revalidate; cannot retroactively assume independence.

G. Policy changes while pending:
old footprint invalidated.

H. Reconciliation discovers dependency during compaction:
compaction must stop/revalidate.

I. Shard migration during pending effect:
source/destination coordination and fencing required.

J. Dependency graph incomplete:
cannot claim PROVEN-BOUNDED.

## 19. Mini-audit

No contradiction found with A01-A14 or previous G-A14-01 artifacts.

This research sharpens, rather than replaces, the existing conflict-footprint model.

Important limitation:
The proposed subset relation is semantic. It is not yet a proof that a concrete runtime can compute ActualConflict or a safe over-approximation.

## 20. Status

G-A14-01k conflict partitioning: DESIGN REFINED.
G-A14-01l dynamic conflict-footprint soundness: OPEN.
Concrete mechanism: OPEN.
Formal model: NOT PROVEN.
Implementation: NOT STARTED.

Next research target:
Determine whether Nexo can obtain a conservative footprint from typed operation schemas + invariant/resource declarations + runtime binding, and define the exact failure semantics when completeness cannot be proven.

Continuity rule:
DESIGNED != IMPLEMENTED != PROVED != VERIFIED != DEPLOYED VERIFIED.

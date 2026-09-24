# NEXO G-A14-01 — Conflict Partitioning, Sharding and Cross-Effect Invariants
## Research Delta V1 — 2026-09-24

Status: DESIGN RESEARCH / ADVERSARIAL
No implementation. No formal proof.

## 1. Research question

Can protected effect coordination be partitioned for scale without allowing two independently linearized operations to violate a shared authority/resource/invariant constraint?

## 2. Evidence studied

etcd transactions atomically evaluate multiple comparisons and apply a success/failure request block, showing that a transaction can span multiple keys within one linearization domain.

PostgreSQL Serializable Snapshot Isolation detects dangerous read/write dependency structures and aborts transactions when no valid serial order exists. Its predicate-lock implementation retains dependency information beyond a single statement and may combine locks when tracking resources are constrained.

Spanner distinguishes linearizability of individual objects from external consistency of transactions spanning multiple objects. This demonstrates that per-object linearization and multi-object transaction ordering are different guarantees.

These are comparative mechanisms, not technology selections.

## 3. Central finding

Per-effect serialization is insufficient when effects share a safety dependency.

Example:
E1 writes Resource R.
E2 writes Resource R.
Both individually have valid effect keys.
If E1 and E2 are placed in independent shards, each shard may linearize correctly while the combined system violates a capacity/invariant constraint.

Therefore conflict partitioning must follow the protected conflict footprint, not merely effect identity.

## 4. Conflict classes

For each operation:
- EffectSet
- ResourceSet
- AuthorityDomainSet
- InvariantSet
- VersionSet
- ExternalSystemSet
- RecoverySet
- EvidenceDependencySet

Two operations may share a conflict domain if any safety-relevant member intersects, or if an invariant explicitly couples them.

Candidate rule:
CONFLICT_DOMAIN = closure(EffectSet ∪ ResourceSet ∪ AuthorityDomainSet ∪ InvariantSet ∪ VersionSet ∪ required dependencies)

Exact closure algorithm remains OPEN.

## 5. Safe independent sharding

Two operations can be independently linearized only if:
- their protected conflict footprints are disjoint under the declared invariant model;
- neither operation can alter the authority/fence required by the other;
- neither depends on a shared capacity/invariant not represented in the footprint;
- cross-shard dependencies are either absent or coordinated by a higher-level protected transaction/order.

No independence may be inferred merely because keys differ.

## 6. Cross-shard operation

If an operation touches:
Shard A + Shard B
then one of the following must exist:
- atomic multi-shard transaction;
- deterministic global ordering/coordination;
- reservation protocol with protected commit;
- higher-level invariant protocol whose correctness is formally specified.

Without one of these, local linearization does not imply global safety.

## 7. Important distinction

LOCAL LINEARIZABILITY
≠
GLOBAL INVARIANT PRESERVATION

A system can have perfectly linearizable shards and still violate a shared invariant if the invariant crosses shard boundaries.

## 8. Example

Capacity invariant:
R.total_reserved <= R.capacity

E1 reserves 7.
E2 reserves 7.
Capacity = 10.

If E1 and E2 use independent shards and both read available capacity 10 before either reservation is globally visible, both may commit locally.

Local correctness:
PASS.

Global invariant:
FAIL.

Therefore capacity/invariant dependency must belong to the same protected coordination domain or use a cross-domain protocol.

## 9. Cross-effect fencing

If E1 and E2 share a resource or authority domain:
- fencing must prevent stale owners from acting;
- resource reservation must be protected;
- retry identity remains effect-specific;
- a stale retry for E1 cannot consume capacity released/reassigned under a newer epoch.

This connects resource reservation to the earlier A04/A06 fencing model.

## 10. Compaction implications

Compaction of E1 cannot be independently performed if its terminal summary is needed to prove a shared invariant involving E2.

Therefore compaction eligibility must consider cross-effect dependency closure.

This refines:
COMPACTION_ELIGIBLE
from an effect-local predicate
to a potentially dependency-closed predicate.

## 11. Migration implications

If E1 is migrated while E2 remains in the old shard/version and they share an invariant, cutover cannot be treated as independent.

Migration requires:
- compatibility proof;
- shared invariant continuity;
- cross-shard fencing/cutover;
- no stale writer;
- preserved dependency lineage.

## 12. Candidate architecture patterns

A. Effect-sharded state machines
Good scalability when conflict footprints are genuinely disjoint.
Failure mode: hidden cross-effect dependencies.

B. Resource/invariant sharding
Partition by the thing whose safety invariant is actually protected.
Potentially safer for shared resources, but can create hotspots.

C. Hierarchical coordination
Local effect shards + protected global/resource coordinator.
Adds complexity and coordinator failure semantics.

D. Multi-shard consensus transaction
Strong semantics for cross-shard state.
Adds coordination latency and failure modes.

E. Optimistic serializable validation
Allow concurrency, detect dependency conflicts, abort/retry.
Requires complete conflict detection and bounded retained dependency state.

No pattern selected.

## 13. New contracts

PSC-44 — Conflict-Footprint Partitioning
Partitioning is safe only when protected conflict footprints are disjoint or a higher-level protocol coordinates them.

PSC-45 — Cross-Shard Invariant Preservation
A local commit cannot be considered globally safe when it may violate an invariant spanning shards.

PSC-46 — Hidden-Dependency Prohibition
Unmodeled shared resources, authority domains, invariants or dependencies cannot be assumed independent.

PSC-47 — Cross-Shard Recovery
Recovery must restore/validate the complete cross-shard dependency context before release.

PSC-48 — Cross-Effect Compaction Closure
Compaction must preserve dependency summaries needed to establish shared-effect safety.

PSC-49 — Cross-Effect Migration Continuity
Migration cannot split a coupled invariant across incompatible versions without protected coordination.

## 14. New invariants

INV-GA14-01-57:
Independent shard commits preserve safety only when their protected conflict footprints are disjoint or coordinated.

INV-GA14-01-58:
Different effect keys do not imply independent safety domains.

INV-GA14-01-59:
A shared resource/capacity invariant requires a shared protected coordination mechanism.

INV-GA14-01-60:
Cross-shard recovery cannot release authority while required dependency state is unknown.

INV-GA14-01-61:
Cross-shard compaction cannot remove the last dependency evidence needed for invariant validation.

INV-GA14-01-62:
A stale actor cannot regain cross-shard authority through a shard-local retry.

INV-GA14-01-63:
Migration cannot silently split one invariant across incompatible coordination domains.

## 15. Important result

The research rejects a simplistic design of:
one effect = one shard = independent safety.

The correct unit of partitioning is the protected conflict domain.

This does not require a globally serialized Nexo. It requires a provable mechanism for detecting/declaring when global coordination is necessary.

## 16. Next research question

The remaining mechanism question becomes:
Can conflict footprints be computed conservatively and safely enough to permit scalable sharding, including dynamic resources, shared invariants, changing VersionSets, migration, and incomplete dependency graphs?

If not, the architecture needs a conservative fallback:
UNKNOWN DEPENDENCY → NO INDEPENDENT COMMIT.

## 17. Mini-audit

No contradiction found with A01-A14 or prior G-A14-01 deltas.

The result strengthens the existing:
ReadSet/WriteSet/EffectSet/ResourceSet/InvariantSet/ExternalSystemSet/AuthorityDomainSet/conflict-footprint model.

It also clarifies that partitioning is a semantic claim that itself requires evidence and versioned policy.

## 18. Status

G-A14-01a non-regression semantics: SUBSTANTIALLY DESIGNED.
G-A14-01b anti-rollback mechanism: OPEN.
G-A14-01c cross-domain atomicity: OPEN.
G-A14-01d anchor/state binding: OPEN.
G-A14-01e ambiguous pending lifecycle: DESIGN REFINED.
G-A14-01f fault injection: DESIGN REFINED.
G-A14-01g formal verification: NOT PROVEN.
G-A14-01h migration/decommission interaction: DESIGN REFINED.
G-A14-01i retention/compaction/resource protocol: DESIGN REFINED.
G-A14-01j concurrent compaction/reconciliation/retry/recovery: DESIGN REFINED.
G-A14-01k conflict partitioning/sharding: DESIGN REFINED.

No implementation gate opened.

## Sources
- etcd API transactions: https://etcd.io/docs/v3.7/learning/api/
- PostgreSQL transaction isolation: https://www.postgresql.org/docs/15/transaction-iso.html
- PostgreSQL predicate locking source: https://github.com/postgres/postgres/blob/master/src/backend/storage/lmgr/predicate.c
- Google Spanner external consistency: https://docs.cloud.google.com/spanner/docs/true-time-external-consistency

Continuity rule:
DESIGNED != IMPLEMENTED != PROVED != VERIFIED != DEPLOYED VERIFIED.

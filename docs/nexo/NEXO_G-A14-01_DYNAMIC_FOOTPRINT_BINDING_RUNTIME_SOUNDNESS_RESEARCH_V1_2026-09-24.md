# NEXO G-A14-01 — Dynamic Footprint Binding and Runtime Soundness
## Research Delta V1 — 2026-09-24

Status: DESIGN RESEARCH / CODE STUDY / ADVERSARIAL
No implementation. No formal proof.

## 1. Research question
Can Nexo construct a conservative conflict footprint from typed operation schemas, declared resources/invariants, and runtime-discovered bindings without allowing an incomplete dependency model to authorize independent protected commit?

## 2. Evidence studied
FoundationDB: strict serializability uses read/write conflict ranges; applications can explicitly add broader conflict ranges; some exact conflict ranges become known only after reads or at commit; broad ranges reduce concurrency but preserve the safety contract. cite turn0search0 turn0search7

PostgreSQL: Serializable Snapshot Isolation uses predicate locking/dependency tracking; predicate locks can be promoted to coarser granularity under memory pressure, accepting false-positive serialization failures as graceful performance degradation. The PostgreSQL source documents this explicitly. cite turn0search2 turn0search8

Kubernetes admission control validates requests before persistence and can have side effects whose reclamation/reconciliation is needed when later admission rejects the request. cite turn0search4

These systems do not implement Nexo semantics, but provide concrete evidence for:
1. conflict scope can be broader than physical keys;
2. exact conflict scope can become known during execution/commit;
3. conservative broadening is preferable to unsound narrowing.

## 3. Critical distinction
A planner's dependency graph is NOT authoritative proof of dependency completeness.

Separate:
D_DECLARED
D_BOUND
D_OBSERVED
D_VALIDATED
D_PROVEN_BOUNDED

Protected independent commit requires more than planner declaration.

## 4. Soundness contract
For operation O and protected context C:

ActualProtectedDependencies(O,C) ⊆ ProtectedFootprint(O,C)

The right side must be conservative.

If inclusion cannot be established:
INDEPENDENT_COMMIT = FORBIDDEN.

Exact computation is not required if a sound over-approximation exists.

## 5. Typed operation schema
Candidate categories:
- target identity
- target selection rule
- effect class
- resource requirements
- authority domain
- invariant references
- external systems/providers
- recovery domain
- evidence dependencies
- VersionSet / PolicyBaseline / InvariantBaseline
- migration/decommission dependencies
- retry/idempotency class

A missing field is not equivalent to an empty field.

external_systems = UNKNOWN must not silently become external_systems = {}.

## 6. Runtime binding
Before protected linearization, runtime binding should resolve:
- concrete target
- target version/fingerprint
- concrete resources
- provider/tool identity
- authority epoch
- policy/invariant context
- external-system domain
- conflict domain
- recovery/decommission status

If runtime binding adds a dependency, expand/revalidate the footprint.

## 7. TOCTOU attack
Unsafe:
1. planner computes F0;
2. admission checks F0;
3. environment changes;
4. runtime discovers D;
5. operation executes under F0.

Candidate rule:
BOUND_FOOTPRINT is tied to exact admission context and invalidated by relevant changes.

## 8. Dynamic resources
Resource existence can itself be safety-relevant:
capacity changes, provider allocation changes, target moves, quota changes, authority-domain changes, external constraints.

A resource reference needs a context/fingerprint or equivalent binding. A stale binding cannot be reused merely because its name is unchanged.

## 9. Unknown dependency
Keep three states distinct:
NO_DEPENDENCY_PROVEN
DEPENDENCY_PRESENT
DEPENDENCY_UNKNOWN

Only the first may support independent execution.

DEPENDENCY_UNKNOWN → conservative super-domain OR resolution required OR HOLD/QUARANTINE.

No independent commit.

## 10. Discovery during execution
If dependency D is discovered after linearization:
A. D was already inside the conservative footprint: safe with respect to that discovery.
B. D was outside it: cannot retroactively claim independence.

Before external effect: stop/revalidate.
After external attempt: preserve exact effect identity and enter reconciliation/UNKNOWN as appropriate.
Never silently widen history after the fact.

## 11. Admission side effects
Kubernetes provides a useful implementation lesson: admission may have side effects even though later admission stages can reject the request, requiring reclamation/reconciliation. cite turn0search4

Nexo therefore distinguishes:
ADMISSION_VALIDATION
from
ADMISSION_SIDE_EFFECT.

A reservation made during admission remains a tracked effect until explicitly released/reconciled.

## 12. Footprint assurance is categorical
Do not create a numeric confidence score that permits safety release.

Use:
UNKNOWN
DECLARED
BOUND
VALIDATED
PROVEN_BOUNDED

PROVEN_BOUNDED means a concrete argument/evidence exists that all protected dependencies relevant to the claim are covered.

## 13. Graph completeness
GRAPH INTEGRITY: represented edges are valid and correctly bound.
GRAPH COMPLETENESS: all relevant protected edges are represented.

Integrity without completeness is insufficient.

GRAPH_INCOMPLETE → NO_INDEPENDENT_COMMIT.

## 14. Conservative closure
If precise dependency cannot be resolved, map it to a conservative ancestor/super-domain known to contain it.

Examples:
unknown provider sub-resource → provider safety domain
unknown resource partition → resource pool domain
unknown invariant dependency → invariant super-domain

If no sound containing domain exists → HOLD/QUARANTINE.

The mapping must be governed and versioned.

## 15. Dynamic footprint expansion candidate
1. Capture operation identity.
2. Capture VersionSet/PolicyBaseline/InvariantBaseline.
3. Compute initial declared footprint.
4. Bind concrete target/resources/provider.
5. Expand to conservative protected footprint.
6. Validate against current protected state.
7. Acquire/validate coordination domains.
8. Re-check context and footprint epoch.
9. Linearize admission.
10. Before external effect, revalidate exact execution binding.
11. If dependency expansion occurs, return to validation or enter effect-specific recovery/reconciliation.
12. Preserve identity and UNKNOWN semantics across retry.

UNKNOWN dependency never becomes empty dependency.

## 16. Footprint epoch
Candidate footprint_epoch identifies the validated dependency context.

Changes in target, resource, provider, policy, invariant, VersionSet, dependency graph, migration lineage, or authority context invalidate the footprint epoch.

Stale footprint_epoch cannot authorize protected execution.

## 17. Sharding
Physical shard assignment is not the semantic conflict domain.

Safe independent execution requires:
Footprint(A) ∩ Footprint(B) = ∅
under the protected dependency model.

If intersection is UNKNOWN:
not proven disjoint → no independent commit.

If an operation expands from shard A into B: cross-shard coordination or abort/retry.

## 18. Compaction
Compaction can remove dependency information only when a protected terminal summary retains every fact required for identity continuity, no duplicate effect, no stale authority, reconciliation closure, conflict-domain reconstruction, and migration/decommission continuity.

If dependency completeness is still required for any unresolved claim, compaction is forbidden.

## 19. Version/policy changes
Footprint validation is context-bound. PolicyBaseline, InvariantBaseline, or VersionSet changes can alter dependency closure even if physical data is unchanged.

context change → footprint invalidation → recomputation/revalidation → no stale independent release.

## 20. Adversarial cases
1. Planner omits provider dependency: UNKNOWN → block.
2. Provider dynamically allocates resource: bind before release or use conservative provider domain.
3. Resource disappears after validation: invalidate binding.
4. New policy introduces shared quota: old footprint invalid.
5. Graph edges valid but one edge omitted: integrity passes, completeness fails → block.
6. New dependency after linearization: no retroactive independence.
7. Cross-shard dependency appears: cross-shard coordination or abort/retry.
8. Admission reservation succeeds but later validation fails: reconcile/release reservation.
9. Compaction removes last dependency evidence: forbidden unless terminal summary preserves closure.
10. Runtime cannot establish a containing super-domain: quarantine.

## 21. New contracts
PSC-57 — Typed Footprint Input
PSC-58 — Declaration Non-Authority
PSC-59 — Runtime Binding Completeness
PSC-60 — Dependency-State Separation
PSC-61 — Conservative Super-Domain
PSC-62 — Footprint Epoch
PSC-63 — Post-Linearization Discovery
PSC-64 — Admission Side-Effect Reconciliation

## 22. New invariants
INV-GA14-01-70: Planner declarations alone cannot satisfy footprint completeness.
INV-GA14-01-71: Independent commit requires conservative coverage of protected dependencies.
INV-GA14-01-72: UNKNOWN dependency cannot be treated as an empty dependency.
INV-GA14-01-73: Stale footprint epoch cannot authorize protected execution.
INV-GA14-01-74: Dynamic dependency discovery outside the footprint prevents retroactive independence.
INV-GA14-01-75: Graph integrity does not imply graph completeness.
INV-GA14-01-76: An admission side effect remains tracked until explicitly reconciled.
INV-GA14-01-77: Compaction cannot remove the last information needed to establish protected dependency closure.

## 23. Mini-audit
No semantic contradiction found with previous G-A14-01 work.

Limitation: we have not proven that a general implementation can derive PROVEN_BOUNDED for arbitrary operations.

Safe fallback hierarchy:
PROVEN_BOUNDED → independent coordination may be considered.
VALIDATED/BOUND but completeness not proven → conservative super-domain or coordinated execution.
UNKNOWN → no independent commit.
No sound containing domain → HOLD/QUARANTINE.

This is a safety rule, not a performance policy.

## 24. Status
Dynamic conflict-footprint soundness: DESIGN REFINED.
Runtime binding: DESIGN REFINED.
General completeness proof: OPEN.
Concrete footprint compiler/analyzer: OPEN.
Formal verification: NOT PROVEN.
Implementation: NOT STARTED.

Next research target:
Study whether dependency closure can be made mechanically auditable from typed schemas, invariant declarations, runtime bindings, and protected admission code; identify where static analysis necessarily becomes incomplete and how the protected core must detect/contain that incompleteness.

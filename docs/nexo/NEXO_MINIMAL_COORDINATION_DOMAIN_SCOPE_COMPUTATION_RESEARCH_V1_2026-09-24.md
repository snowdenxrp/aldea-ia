# NEXO — MINIMAL COORDINATION DOMAIN / SCOPE COMPUTATION RESEARCH V1
Date: 2026-09-24
Status: RESEARCH / ARCHITECTURAL DESIGN ONLY
Verification status: NOT SANY/TLC VERIFIED; NOT IMPLEMENTATION VERIFIED; NOT RUNTIME VERIFIED

## 1. Objective

Determine how Nexo can compute the smallest authoritative coordination domain required by a protected safety claim, without creating a safety hole through scope underapproximation and without unnecessarily serializing unrelated work.

Core question:

> Given a protected effect or containment/release claim E, what is the smallest set of state, constraints, resources, dependencies, fences, incarnations, queues, and interacting effects that must participate in one authoritative safety order?

Existing principle:

ONE AUTHORITATIVE SAFETY ORDER PER INTERACTING CLAIM.

This research does not select a concrete implementation technology.

## 2. External cross-checks

etcd transactions demonstrate a useful primitive: multiple comparisons can be evaluated atomically and the success/failure branch applied as one transaction. This supports the architectural idea that a computed coordination scope must be checked against a current authoritative state at admission rather than treated as a permanently valid discovery result. etcd also distinguishes linearizable operations from serializable/stale reads, reinforcing that scope discovery based on stale state cannot automatically support a current safety claim. [Source: etcd API / guarantees]

Kubernetes uses resourceVersion-based optimistic concurrency so an update based on an older observed version can be rejected rather than silently overwriting a newer state. Kubernetes documentation also exposes consistency boundaries around list/watch snapshots and resource versions. This is relevant to scope computation: the graph used to compute a coordination domain needs a bound context/version, and a stale scope must fail or be recomputed rather than silently reused. [Source: Kubernetes API / controller-runtime documentation]

Database serializability provides a useful conceptual cross-check: conflicts can be represented as a graph, and an acyclic conflict graph permits a serial order. Nexo must not simply copy database serializability, because external effects, fences, epistemic UNKNOWN states, and world reconciliation add semantics absent from ordinary database transactions. The useful transferable idea is conflict-closure analysis, not the assumption that a database transaction solves external-world atomicity.

TLA+ provides the formal-methods cross-check that concurrent behavior should be modeled as state transitions and that refinement connects lower-level behavior to higher-level specifications. Scope computation therefore needs a formal relation between abstract safety scope and implementation-level resources/operations.

## 3. First distinction: scope is a safety object, not a scheduling hint

A coordination scope is not merely:
- a set of locks;
- a list of services;
- a process group;
- a network boundary;
- a transaction participant list;
- a UI hierarchy;
- a deployment topology.

It is the set of state and enforcement domains whose concurrent evolution can affect the truth of a specific protected claim.

Therefore:

COORDINATION_SCOPE != DEPLOYMENT_SCOPE

and:

SCOPE_INCLUSION != AUTHORITY_INCLUSION

A larger deployment does not automatically require one global coordinator. A smaller deployment does not prove that local coordination is sufficient.

## 4. Scope closure

For a protected effect E, define a conceptual closure:

ECC(E) =
  direct effect resources
  + applicable hierarchical constraints
  + shared-footprint resources
  + effect interaction domains
  + required resource fences
  + relevant queues/workers/child effects
  + authorization dependencies
  + claim-specific evidence dependencies
  + recovery/reconciliation domains
  + continuity/version context required by the claim.

This is a research abstraction, not yet a final schema.

The closure must distinguish at least:

1. EFFECT footprint
2. AUTHORITY footprint
3. COORDINATION footprint
4. ENFORCEMENT footprint
5. EVIDENCE footprint
6. RECOVERY footprint

These sets may overlap but are not interchangeable.

## 5. Soundness vs completeness

Two different properties must be tracked.

SCOPE SOUNDNESS:
Every included member really belongs to the coordination domain for the claim.

SCOPE COMPLETENESS:
Every member whose concurrent behavior can invalidate the claim is included.

An underapproximation is dangerous:

UNDERAPPROXIMATION → possible safety hole.

An overapproximation primarily harms liveness/performance:

OVERAPPROXIMATION → unnecessary serialization / reduced concurrency.

For safety-critical claims, completeness has priority over minimality.

Therefore the architecture must never optimize for "smallest scope" before proving that the scope is complete enough for the claim.

## 6. Minimality is conditional

The target is not absolute minimum.

The target is:

MINIMAL SAFE COORDINATION DOMAIN

subject to:
- complete required dependency closure;
- current topology;
- current shared-footprint closure;
- current resource incarnations;
- current policy/invariant context;
- current authority;
- current fences;
- current claim requirements;
- explicit treatment of UNKNOWN dependencies.

A scope that is smaller because a dependency was missed is not minimal; it is incomplete.

## 7. Scope computation must itself be protected

A major newly identified issue:

SCOPE_COMPUTATION is a safety-relevant operation.

Bad sequence:

1. discover scope;
2. topology changes;
3. dependency changes;
4. resource incarnation changes;
5. admission uses old scope;
6. protected effect executes outside the assumptions used to compute scope.

Therefore:

SCOPE_DISCOVERY != SCOPE_FREEZE != ADMISSION

The computed scope requires context binding.

Candidate lifecycle:

SCOPE_REQUESTED
→ SCOPE_DISCOVERED
→ SCOPE_CLOSURE_CHECKED
→ SCOPE_FROZEN
→ ADMISSION_VALIDATED
→ EFFECT_ADMITTED

Any relevant change between these states can invalidate the scope.

## 8. Candidate ScopeContext

Provisional object:

ScopeContext {
  scope_id
  effect_id
  effect_class
  effective_safety_scope
  coordination_domain
  dependency_closure_version
  topology_version
  policy_version
  invariant_version
  authority_epoch
  fence_set
  resource_incarnations
  context_identity
  completeness_status
  freshness_context
  invalidation_triggers
  computation_evidence
  computation_owner
}

Important:

A ScopeContext is evidence/context, not authority.

It does not grant authority merely because it was successfully computed.

## 9. Completeness and freshness are different

SCOPE_COMPLETE does not imply SCOPE_CURRENT.

SCOPE_CURRENT does not imply SCOPE_COMPLETE.

Examples:

- A complete graph from yesterday may be stale.
- A current graph that omits a hidden provider queue may be incomplete.
- A current and complete graph can still be unauthorized.
- An authorized scope can become invalid after topology/resource changes.

Therefore release/admission needs both claim-specific completeness and currentness.

## 10. Static + dynamic footprint

The footprint should be divided conceptually:

STATIC_FOOTPRINT:
Known from effect contract, policy, artifact, declared dependencies, resource schema, topology constraints.

DYNAMIC_FOOTPRINT:
Discovered from current state, runtime resolution, provider routing, child work, queues, delegated resources, or effect-specific expansion.

Critical rule:

DISCOVERED_DEPENDENCY != AUTHORIZED_DEPENDENCY

Runtime discovery must not silently expand authority.

If an effect discovers a new protected resource after admission, one of three things must be true:

A. the new resource was already inside the frozen authorized scope;
B. a new protected admission/authority transition expands the scope;
C. the operation is blocked/quarantined/reconciled.

There must be no implicit fourth option:

D. silently use newly discovered capability.

## 11. Scope widening

Scope widening is itself a protected transition.

Candidate:

SCOPE_WIDEN_REQUEST
→ DEPENDENCY_DISCOVERY
→ SAFETY_CLOSURE_RECOMPUTE
→ CONFLICT_CHECK
→ AUTHORITY_REVALIDATION
→ FENCE/COORDINATION_UPDATE
→ PROTECTED_SCOPE_WIDEN_LINEARIZATION
→ ADMISSION CONTINUES

If the widening cannot be safely coordinated with already-admitted work, the original operation must not simply continue.

Possible outcomes:
- deny;
- pause;
- quarantine;
- finish only within original scope;
- restart under a new protected context;
- reconcile.

## 12. Scope shrinkage

Shrinkage is not automatically safe either.

If a resource is removed from the computed scope while an effect can still reach it, the operation may become under-scoped.

Therefore:

SCOPE_SHRINK != SAFETY_IMPROVEMENT

A removed member must be proven unreachable, fenced, irrelevant to the claim, or otherwise excluded by a current protected rule.

## 13. Dynamic dependency race

Adversarial sequence:

E starts with scope {A,B}.
While running, B discovers C.
C shares a physical resource with A.
A's safety invariant depends on C not being concurrently modified.

If C was absent from the frozen closure, E cannot simply access C.

Required alternatives:
- C was already conservatively included;
- scope widening is admitted through a protected transition;
- C is inaccessible to E;
- E is stopped/quarantined/reconciled.

This closes a hidden route by which dynamic discovery could bypass coordination.

## 14. Hidden downstream footprint

The scope must include effect paths that can still produce protected effects after the initiating command returns.

Potential members:
- provider queues;
- asynchronous workers;
- child operations;
- retries;
- redrive mechanisms;
- scheduled continuations;
- callbacks;
- webhooks;
- compensations;
- failover controllers;
- cached commands;
- durable outbox entries;
- autonomous resource behavior.

Therefore:

QUEUE_EMPTY != HISTORICAL_NO_EFFECT

and:

COMMAND_RETURNED != EFFECT_TERMINATED

The footprint is about reachable protected effects, not merely currently running processes.

## 15. Scope computation under UNKNOWN

If closure computation encounters:

UNKNOWN_DEPENDENCY

it cannot be silently converted to:

NO_DEPENDENCY.

For a claim requiring complete closure:

UNKNOWN required member → HOLD/RESTRICT/QUARANTINE/REVALIDATE.

A weaker claim may tolerate UNKNOWN only if its contract explicitly proves that the unknown domain cannot invalidate that claim.

Thus uncertainty is claim-relative.

## 16. Scope computation and concurrent topology changes

Adversarial sequence:

1. Compute ECC(E) under topology T1.
2. Another operation moves resource R under ancestor P2.
3. E still holds a scope computed under T1.
4. E attempts protected effect.

The old scope is stale even if its members are individually unchanged.

Candidate invariant:

TOPOLOGY_CHANGE_INVALIDATES_DEPENDENT_SCOPE

The dependency is not merely object identity; it includes relationships.

Relevant generations may include:
- topology generation;
- dependency graph generation;
- resource incarnation;
- authority epoch;
- policy/invariant generation;
- fence generation;
- context identity.

Numeric generation equality alone does not establish semantic continuity.

## 17. Scope computation and resource incarnation

If resource R is replaced:

R@incarnation1 != R@incarnation2

even if the external identifier is identical.

A scope containing "R" without incarnation binding is insufficient for protected claims that depend on resource history, fencing, or evidence.

Therefore scope context should bind the relevant ResourceIncarnation.

## 18. Minimal coordination domain

Candidate definition:

CCD(E, C) = the smallest authoritative coordination domain that must serialize or jointly validate all safety-relevant transitions capable of changing the truth of claim C for effect E.

This does NOT necessarily mean one process or one database.

It means one coherent safety-order relation for the interacting claim.

Possible implementation forms remain open:
- one authoritative store;
- sharded coordination with a common ordering relation;
- hierarchical coordinators;
- transaction protocol;
- fencing protocol;
- effect-specific coordination;
- hybrid.

No technology is selected here.

## 19. When separate coordinators are actually valid

Separate coordinators can remain separate only if the safety claim can be decomposed.

Required proof conditions include:
- no shared protected invariant;
- no shared physical footprint;
- no shared fence requirement;
- no shared queue/continuation;
- no required cross-domain ordering;
- no coupled compensation;
- no shared recovery decision;
- no dependency whose state jointly determines authorization;
- no claim requiring a cross-domain atomic fact.

If these conditions fail, the coordination domain must be expanded or an explicit cross-domain protocol must establish the needed safety order.

## 20. Conflict graph interpretation

A useful abstraction is a graph:

Nodes = protected transitions/effects.
Edges = interactions that can make concurrent execution relevant to the claim.

Edge types may include:
- READ_WRITE;
- WRITE_WRITE;
- MUTUAL_EXCLUSION;
- ORDER_DEPENDENCY;
- FENCE_DEPENDENCY;
- SHARED_PHYSICAL_RESOURCE;
- SHARED_QUEUE;
- SHARED_AUTHORITY;
- SHARED_RECOVERY;
- SHARED_CONTINUITY;
- CLAIM_DEPENDENCY.

The connected component is a candidate coordination domain.

But connected-component closure alone is not enough:
- some edges are conditional;
- some interactions are commutative;
- some are claim-specific;
- some are only relevant to evidence;
- some require causal ordering but not mutual exclusion;
- some are UNKNOWN.

Therefore the graph must carry semantic edge labels, not just adjacency.

## 21. Interaction classes

Candidate classification:

DISJOINT
COMMUTATIVE
ORDER_SENSITIVE
MUTUALLY_EXCLUSIVE
CONDITIONALLY_COMPATIBLE
CONFLICTING
UNKNOWN

UNKNOWN interaction must not be treated as DISJOINT.

A claim that depends on proving non-interference requires the interaction classification itself to be supported.

## 22. Scope computation as a fixed-point problem

Dynamic dependencies suggest a closure algorithm:

S0 = direct protected footprint.

Repeatedly add:
- applicable ancestor constraints;
- shared-footprint domains;
- dependent resources;
- reachable child effects;
- queues/workers capable of protected continuation;
- fences;
- recovery/reconciliation domains;
- claim-critical evidence dependencies;
- transitive dependencies.

Stop only when:

closure(Sn+1) = closure(Sn)

or when the architecture reaches a proven boundary beyond which dependencies cannot affect the claim.

If closure does not converge within a defined bound, this is not permission to truncate silently.

Possible outcomes:
- conservative expansion;
- claim downgrade;
- hold/quarantine;
- explicit bounded-closure contract.

## 23. Bounded closure

Some systems cannot enumerate an infinite or open-ended world.

A bounded closure contract therefore may be required:

CLOSURE_BOUND =
  explicit resource classes
  + explicit provider boundaries
  + explicit child-effect rules
  + explicit queue rules
  + explicit delegation rules
  + explicit unknown handling.

The bound itself becomes safety-critical and must be versioned, authorized, current, and invalidatable.

A boundary that says "outside this domain nothing can affect the claim" is itself a safety assertion requiring evidence.

## 24. Admission rule candidate

For effect E:

ADMIT(E) only if:

CurrentIdentity
AND CurrentAuthority
AND CurrentContext
AND ScopeCompleteForClaim
AND ScopeCurrent
AND TopologyCurrent
AND DependencyClosureAcceptable
AND RequiredFencesCurrent
AND ResourceIncarnationsCurrent
AND ApplicableConstraintsPermit
AND RequiredEvidenceValid
AND CoordinationDomainCurrent
AND ProtectedAdmissionLinearizationSucceeds.

Any mandatory UNKNOWN:
→ HOLD / REVALIDATE / QUARANTINE.

## 25. Execution-time scope invariant

Once admitted:

E may only produce protected effects within its authorized frozen scope.

If a new protected path appears:

NEW_PATH ∉ FROZEN_SCOPE

then:

NO_SILENT_ACCESS.

This is stronger than simply checking permissions at startup.

The effect boundary must enforce the scope.

## 26. Scope and capability are separate

A capability says:

"this actor may perform operation X."

A scope says:

"this operation is coordinated with these safety-relevant domains under this context."

Therefore:

CAPABILITY != COORDINATION_SCOPE

A valid capability used outside its current coordination context is insufficient.

Likewise:

SCOPE_CERTIFICATE != AUTHORITY_GRANT

Both must be validated at the protected boundary.

## 27. Scope and evidence

Evidence about scope computation should bind:
- effect identity;
- scope identity;
- graph/dependency versions;
- topology version;
- authority epoch;
- resource incarnations;
- policy/invariant versions;
- computation time/context;
- completeness method;
- unresolved dependencies;
- invalidation triggers.

A proof that the scope was complete yesterday cannot automatically support today's release claim.

## 28. Scope invalidation triggers

At minimum:

- topology mutation;
- dependency graph mutation;
- policy change;
- invariant change;
- authority revocation;
- fence change;
- resource replacement;
- recovery transition;
- STOP transition;
- decommission;
- trust-root change;
- artifact/config change;
- discovered dynamic dependency;
- queue/child-effect expansion;
- change in effect class;
- claim requirement change;
- continuity uncertainty.

Invalidation must be explicit and durable enough to survive the crash windows relevant to the claim.

## 29. Recovery interaction

Recovery must not inherit an old scope blindly.

Recovery sequence should recompute:

CURRENT_EFFECT_IDENTITY
→ CURRENT_RESOURCE_INCARNATIONS
→ CURRENT_TOPOLOGY
→ CURRENT_DEPENDENCY_CLOSURE
→ CURRENT_CONTAINMENT_CONSTRAINTS
→ CURRENT_FENCE_SET
→ CURRENT_RECOVERY_SCOPE
→ RECONCILIATION
→ RELEASE_ELIGIBILITY.

A historical RecoveryProgress object is evidence of prior work, not current coordination authority.

## 30. Containment interaction

For containment claim K:

CCD(K) must include every domain whose continued execution can violate K.

Therefore:

LOCAL_CONTAINMENT
does not imply
GROUP_CONTAINMENT
does not imply
MISSION_CONTAINMENT.

Promotion requires closure/refinement evidence.

If one required domain is UNKNOWN or unenforced:

combined claim remains UNKNOWN/HOLD.

## 31. Important distinction: coordination domain vs containment domain

They overlap but are not identical.

COORDINATION_DOMAIN:
Where concurrent safety-relevant state transitions must share an authoritative order.

CONTAINMENT_DOMAIN:
Where continued effect capability must be blocked or controlled to support a containment claim.

A containment domain may be larger because it includes downstream effect paths that do not participate in the same state transaction.

Thus:

CCD != containment footprint

They must be related explicitly.

## 32. Important distinction: coordination domain vs evidence domain

A verifier may need observations from domains outside the coordination domain.

Those observations do not necessarily need to join the same write ordering.

But if the claim depends on those observations being independent/current/authenticated, their trust and failure domains become part of the evidence dependency closure.

Therefore:

EVIDENCE_DEPENDENCY != COORDINATION_PARTICIPANT

but:

EVIDENCE_DEPENDENCY can invalidate the claim.

## 33. Safety/liveness tradeoff

The architecture should optimize in this order:

1. safety completeness;
2. enforcement completeness;
3. claim correctness;
4. coordination minimality;
5. concurrency/performance.

Not:

1. smallest lock scope;
2. highest throughput;
3. then safety.

The minimal domain is a result of proof, not a starting assumption.

## 34. Candidate formal state

For each protected operation:

ScopeState =
  {
    DirectFootprint,
    EffectiveSafetyScope,
    CoordinationDomain,
    ContainmentDomain,
    EvidenceDependencies,
    ClosureVersion,
    TopologyVersion,
    AuthorityEpoch,
    FenceSet,
    ResourceIncarnations,
    ContextIdentity,
    Completeness,
    Freshness,
    InvalidationState
  }

A protected admission is valid only when the relevant state is mutually compatible.

## 35. Candidate invariants

INV-SCOPE-01:
Every admitted protected effect has an explicit claim-bound coordination scope.

INV-SCOPE-02:
Scope completeness is claim-specific.

INV-SCOPE-03:
UNKNOWN dependency cannot be treated as absence of dependency.

INV-SCOPE-04:
Scope computation does not grant authority.

INV-SCOPE-05:
Dynamic discovery cannot silently expand protected authority.

INV-SCOPE-06:
Topology changes invalidate dependent frozen scopes.

INV-SCOPE-07:
Resource incarnation changes invalidate dependent scope/evidence/fence bindings.

INV-SCOPE-08:
A protected effect cannot cross its frozen scope boundary without a new protected admission.

INV-SCOPE-09:
A required scope participant that cannot be enforced prevents the corresponding strong claim.

INV-SCOPE-10:
Overapproximation may reduce liveness but underapproximation cannot be accepted as a safety optimization.

INV-SCOPE-11:
A scope certificate is not itself an authority grant.

INV-SCOPE-12:
Recovery cannot reuse historical scope as current authority without revalidation.

INV-SCOPE-13:
Containment scope and coordination scope are distinct claim-specific objects.

INV-SCOPE-14:
Scope invalidation survives or is recoverable across relevant crash/restart boundaries.

INV-SCOPE-15:
Scope widening is a protected transition.

INV-SCOPE-16:
Scope shrinkage requires proof that removed domains cannot affect the protected claim.

INV-SCOPE-17:
Independent coordinators are valid only when the claim's interaction closure permits decomposition.

INV-SCOPE-18:
A coordination domain must provide one authoritative safety order for all interacting transitions covered by the claim.

INV-SCOPE-19:
Scope freshness and scope completeness are separate predicates.

INV-SCOPE-20:
A bounded closure contract is itself safety-critical and versioned.

## 36. New adversarial attack sequence

Primary attack:

E1 computes scope {A,B}.
→ topology changes.
→ B dynamically discovers C.
→ C shares physical resource with A.
→ E1 attempts to access C.
→ coordinator still reports old scope.
→ C has a child queue Q.
→ E1 is STOPPED.
→ recovery restores old ScopeContext.
→ resource C is replaced with incarnation C2.
→ stale scope attempts release.

Required result:
NO stale scope may authorize the final protected effect.

At minimum:
- dynamic dependency invalidates old scope;
- topology generation mismatch invalidates old scope;
- resource incarnation mismatch invalidates old fence/evidence;
- STOP invalidates release;
- recovery must recompute current closure;
- release remains blocked until current scope and enforcement are verified.

## 37. Research conclusion

The minimal coordination domain is not a static configuration parameter.

It is a derived, claim-specific safety object whose correctness depends on:
- dependency closure;
- shared-footprint interaction;
- topology;
- resource incarnation;
- authority;
- fencing;
- containment;
- evidence requirements;
- recovery;
- continuity.

The strongest current candidate architecture is:

DISCOVER
→ COMPUTE CLOSURE
→ CHECK COMPLETENESS
→ BIND CONTEXT
→ FREEZE SCOPE
→ PROTECTED ADMISSION
→ ENFORCE SCOPE AT EFFECT BOUNDARY
→ INVALIDATE ON MATERIAL CHANGE
→ RECOMPUTE / RECONCILE
→ RELEASE ONLY AFTER CURRENT CLAIM VALIDATION.

Central rule:

THE SMALLEST COORDINATION DOMAIN IS THE SMALLEST DOMAIN FOR WHICH CLAIM-SPECIFIC SAFETY CLOSURE IS PROVEN COMPLETE AND CURRENT.

Notably, this is a design conclusion, not a correctness proof.

## 38. Open gaps created by this round

G-SCOPE-01:
Formal definition of scope closure and completeness.

G-SCOPE-02:
Formal relation between interaction graph and authoritative coordination domain.

G-SCOPE-03:
Dynamic scope widening atomicity.

G-SCOPE-04:
Bounded closure semantics for open-ended providers.

G-SCOPE-05:
Runtime enforcement that effect paths cannot escape frozen scope.

G-SCOPE-06:
Scope invalidation propagation under crash/replay.

G-SCOPE-07:
Scope computation under concurrent topology mutation.

G-SCOPE-08:
Multi-domain coordination when no single store can host the CCD.

G-SCOPE-09:
Formal refinement from abstract CCD to implementation-level locks/fences/transactions.

G-SCOPE-10:
SANY/TLC model and adversarial state-space checking.

G-SCOPE-11:
Interaction between CCD and the existing EffectOutcomeUncertaintySet.

G-SCOPE-12:
Interaction between CCD and hierarchical containment claim promotion.

## 39. Distillation classification

CARRY_FORWARD:
- One authoritative safety order per interacting claim.
- Effective Constraint Closure.
- Shared-footprint graph.
- Claim-specific independence.
- Dynamic footprint cannot silently expand authority.
- UNKNOWN blocks strong claims when required.
- Resource incarnation binding.
- Topology/dependency version binding.
- Scope invalidation.
- Protected effect boundary enforcement.

REWORK:
- Exact ScopeContext schema.
- Scope completeness proof.
- CCD computation algorithm.
- Scope widening protocol.
- Bounded closure semantics.
- Graph edge semantics.

OPEN:
- Formal proof.
- Implementation refinement.
- Runtime enforcement.
- Fault injection.
- SANY/TLC.
- Multi-coordinator protocol.

REJECTED:
- "Smallest lock set" as the architectural definition.
- Static deployment topology as sufficient scope.
- Dynamic discovery as implicit authority expansion.
- Scope certificate as authority.

HISTORICAL_ONLY:
- Any earlier implementation-specific scope assumptions that cannot satisfy the above closure/currentness requirements.

## 40. Gate

No V21 implementation.
No runtime construction.
No claim of formal correctness.
No claim that a specific technology solves the problem.

Next research attack:
BOUNDED UNCERTAINTY / ABSORBING SAFE STATE — specifically whether a safe absorbing state can reduce coordination scope without hiding unresolved external effects, and when a local monotonic safety action can be proven safe across the full uncertainty set.

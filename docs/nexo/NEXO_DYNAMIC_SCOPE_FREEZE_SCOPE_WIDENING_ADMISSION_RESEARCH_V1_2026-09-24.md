# NEXO - DYNAMIC SCOPE FREEZE / SCOPE WIDENING ADMISSION RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can Nexo safely prepare an admission while the set of effects relevant to a mission invariant is changing because providers discover child work, queues expand, resources are replaced, topology changes, or retries/redrives appear?

## External cross-check

Kubernetes uses resourceVersion to reject stale updates and exposes semantics where some reads may be older than the newest state; clients that cannot tolerate stale data need stronger semantics. This supports separating discovered scope from current authoritative scope. citeturn0search3 AWS notes that asynchronous systems can acknowledge registration before downstream work completes, that message ordering is not universally guaranteed, and that duplicate delivery requires idempotent handling. citeturn0search9 AWS Durable Execution documents that replay/retry can execute an operation more than once and that retry semantics do not provide exactly-once execution across an entire workflow. citeturn0search5 TLA+ expresses concurrent systems as state-transition specifications and requires invariants to hold across permitted behaviors; implementation/refinement claims require an explicit relation to the higher-level specification. citeturn0search25

## Core result

A safety-critical admission cannot rely on a scope that is merely a snapshot of discovery.

The architecture needs three distinct states:

SCOPE_DISCOVERED != SCOPE_FROZEN != SCOPE_CURRENT

And:

SCOPE_CURRENT != SCOPE_COMPLETE

A discovered scope may become stale before admission. A frozen scope may become invalid while it is being used. A scope can be current but still incomplete if closure has not been established.

## Dynamic scope is a safety event

A new relevant dependency can arrive through provider child effect, retry/redrive, queue insertion, delayed callback, delegated capability, resource replacement, topology change, shared-resource discovery, policy/invariant change, recovery, compensation, update or migration.

Therefore SCOPE_WIDENING is a safety-relevant state transition, not telemetry.

## Stale-scope race

Adversarial sequence:

SCOPE_DISCOVER(E) -> SCOPE={A} -> PREPARE_ADMISSION -> provider creates child B -> B can affect mission invariant M -> admission continues using {A} -> external effect crosses boundary.

If B was safety-relevant and the admission did not account for it, the admission used an underapproximation of closure. For strong safety claims, underapproximated scope is unsafe.

## Strategies

A. Freeze before admission. Compute closure and create a protected scope generation G. Admission binds to G. Any relevant scope change invalidates G. Admission is accepted only while G remains current at protected admission linearization.

B. Dynamic widening during preparation. Allow expansion only if every widening is serialized/validated against final admission and no effect can cross the protected boundary using an incomplete scope. This risks unbounded preparation and liveness problems.

C. Boundary-based closure. Prove every relevant path crosses an enforceable boundary. Internal scope can stop at that boundary when the boundary contract is sufficient.

## Candidate admission rule

ADMISSION_ALLOWED(E,C) requires ScopeComplete(C,G), ScopeCurrent(C,G), NoRelevantWideningAfterCutoff(C,G), ProtectedAdmissionLinearization(C,G), and EffectBoundaryEnforced(C,G).

Mandatory UNKNOWN -> HOLD / REVALIDATE / QUARANTINE.

## Scope cutoff

Candidate sequence:

SCOPE_DISCOVERY -> CLOSURE_COMPUTATION -> SCOPE_FREEZE_REQUEST -> SCOPE_CUTOFF_LINEARIZATION -> FROZEN_SCOPE(G) -> ADMISSION_CHECK -> ADMISSION_LINEARIZATION(G) -> DURABLE_INTENT.

The cutoff is an authoritative ordering point, not merely a timestamp.

## New dependency after cutoff

If irrelevant and complete closure proves disjointness, no invalidation is required. If relevant but fenceable, invalidate/revalidate or force it behind an already verified boundary. If relevant and not fenceable, the old scope cannot support the strong claim.

## Child effects and queues

Provider child work, retries, redrives, delayed callbacks, compensation and queued messages belong to effect-path closure when they can produce relevant effects. Queue emptiness does not prove historical absence. A provider may avoid internal enumeration only when an enforceable boundary bounds the entire downstream path.

## Resource replacement and topology

R1 -> R2 is a new resource incarnation unless an explicit transfer contract proves compatibility. An admission bound to R1 cannot silently continue against R2.

Topology changes can change ancestor constraints and effective safety scope, so topology changes invalidate in-flight scope unless compatibility is explicitly established.

## Scope versus authority

SCOPE_WIDENING != AUTHORITY_WIDENING.

Discovering resource B does not grant authority over B. New scope requires a new authority check.

## Scope freeze versus world freeze

SCOPE_FREEZE != EXTERNAL_QUIESCENCE.

A frozen scope is a control-plane safety context. External resources may continue changing; those changes must either be outside the claim, fenced, or invalidate the context.

## Version binding

Candidate separate generations:
scope_generation, topology_generation, dependency_generation, policy_generation, invariant_generation, boundary_generation, resource_incarnation, authority_epoch, recovery_epoch, stop_epoch.

Independent numeric epochs must not be assumed to form one global order. Admission binds to the required version set.

## Monotonic invalidation

If scope G is invalidated, restoring an old snapshot must not resurrect G as current.

INVALIDATED_SCOPE != RESTORABLE_CURRENT_SCOPE.

## Ordering cases

A: SCOPE_CUTOFF < WIDENING. The widening must be handled against the admitted/in-flight effect.

B: WIDENING < SCOPE_CUTOFF. The widening is included before freeze.

C: ORDER_UNKNOWN. If the claim requires ordering and no boundary makes stale scope ineffective, HOLD / REVALIDATE.

## Scope widening after external attempt

If the effect already crossed the boundary and a new relevant path is discovered, the attempt remains historical. Nexo preserves history, invalidates continuation/release claims as required, fences new paths, reconciles affected resources and recomputes mission claims.

## Bounded dynamic scope

Dynamic scope need not freeze the entire mission if a proven boundary bounds every relevant expansion. Then Nexo can reason about the boundary rather than enumerate every dynamically discovered child.

## Candidate objects

ScopeFreeze:
freeze_id, effect_id, claim_id, scope_generation, effective_safety_scope, coordination_domain, effect_path_closure, dependency_closure, topology_generation, resource_incarnations, boundary_generations, policy/invariant versions, authority epoch, invalidation generation, completeness status, cutoff reference, invalidation triggers, release conditions, verification evidence.

ScopeWideningEvent:
widening_id, triggering path/object, old/new scope generation, affected claims/effects/resources, dependency/topology change, discovery evidence, authoritative ordering, invalidation result, fence requirements, revalidation status.

## Candidate protocol

DISCOVER -> CLASSIFY -> COMPUTE_IMPACT -> AUTHORITATIVE_CUTOFF -> INVALIDATE_OLD_SCOPE -> FREEZE_NEW_SCOPE -> REVALIDATE -> PROTECTED_ADMISSION.

If widening occurs before admission linearization, old scope cannot authorize admission. If it occurs after admission linearization, it enters in-flight effect/recovery/reconciliation handling.

## Candidate theorem

Not formally proven: if a protected admission binds to a complete scope closure at generation G; admission linearization is ordered against scope invalidation; every relevant widening either cannot affect the claim or invalidates/fences the old scope before a new protected effect can cross the boundary; and crash/replay cannot resurrect invalidated G, then dynamic scope changes cannot cause stale-scope admission to produce an unaccounted protected effect for the claim.

This requires formalization and implementation refinement before being treated as a guarantee.

## Candidate invariants INV-DSF-01..38

01 Discovered scope is not frozen scope.
02 Frozen scope is not necessarily current scope.
03 Current scope is not necessarily complete scope.
04 Scope underapproximation is safety-dangerous.
05 Scope widening is safety-relevant state.
06 Dynamic discovery cannot silently widen authority.
07 Relevant widening invalidates affected scope.
08 Irrelevant widening may be excluded only with complete disjointness proof.
09 Scope cutoff requires authoritative ordering.
10 Admission binds to scope generation.
11 Scope invalidation and admission must be ordered or protected by an equivalent stale-context boundary.
12 Unknown ordering blocks strong admission when order matters.
13 Provider child effects belong to effect-path closure unless bounded by an enforceable boundary.
14 Queue continuations belong to scope when they can produce relevant effects.
15 Retry/redrive paths belong to scope when relevant.
16 Compensation paths belong to scope when relevant.
17 Resource replacement changes incarnation and may invalidate scope.
18 Topology changes may change effective safety scope.
19 Scope widening does not grant authority.
20 Scope freeze does not freeze the external world.
21 Frozen scope binds required dependency/policy/invariant/boundary versions.
22 Snapshot restore must not resurrect invalidated scope generation.
23 External attempt before widening remains historical; widening affects continuation/claims.
24 Post-admission widening requires explicit in-flight handling.
25 Scope completeness is claim-specific.
26 Boundary-bounded closure can replace unbounded internal enumeration when enforced.
27 Unknown provider continuation prevents strong closure unless bounded.
28 Scope certificates do not grant authority.
29 Scope computation evidence is not world truth.
30 Scope reduction requires proof of irrelevance/absorption.
31 Higher-order interactions must be included when relevant.
32 Dynamic scope invalidation participates in proof/assurance invalidation.
33 Recovery recomputes current scope.
34 Recovery cannot inherit stale scope authority.
35 Scope generation alone does not establish semantic continuity.
36 Resource incarnation must be part of scope identity where relevant.
37 Invalidation must be durable/replay-safe.
38 No strong claim may depend on a scope that can silently become incomplete.

## Architectural result

The clean architecture needs a dedicated Scope/Closure Plane:

DISCOVERY -> DEPENDENCY CLOSURE -> EFFECT-PATH CLOSURE -> MISSION INVARIANT CLOSURE -> SCOPE FREEZE -> INVALIDATION/WIDENING -> ADMISSION.

A protected admission is never based on whatever the system knew when planning started. It is based on a current, frozen, claim-specific safety context whose invalidation semantics are themselves protected.

## Open gaps

G-DSF-01 formal scope-freeze/invalidation theorem.
G-DSF-02 dynamic child-effect closure.
G-DSF-03 queue/continuation boundary semantics.
G-DSF-04 topology mutation during admission.
G-DSF-05 resource replacement during scope freeze.
G-DSF-06 bounded boundary closure proof.
G-DSF-07 higher-order dynamic interaction detection.
G-DSF-08 crash/replay of scope freeze and widening.
G-DSF-09 runtime enforcement.
G-DSF-10 actual SANY/TLC/TLAPS.
G-DSF-11 implementation refinement.
G-DSF-12 fault-injection/long-duration validation.

## Next attack

SCOPE FREEZE + DISCOVERED CHILD EFFECT + ADMISSION LINEARIZATION + CRASH/REPLAY.

Question: what happens if the scope is frozen, admission linearizes, a provider creates an unobserved child effect, Nexo crashes, and recovery restores the old ScopeFreeze? The next round will attack whether scope continuity can prevent a historical freeze from authorizing a new post-crash effect.
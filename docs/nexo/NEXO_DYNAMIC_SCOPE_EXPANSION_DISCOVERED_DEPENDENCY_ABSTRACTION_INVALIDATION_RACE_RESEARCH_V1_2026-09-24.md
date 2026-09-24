# NEXO — DYNAMIC SCOPE EXPANSION + DISCOVERED DEPENDENCIES + ABSTRACTION INVALIDATION RACE — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution.

## Research question

What happens when an AbstractionCertificate was valid at time T1, an effect is already in flight, and at T2 Nexo discovers a dependency/effect path that was previously UNKNOWN?

## External cross-check

Open-system reasoning in TLA+ requires explicit environment assumptions: guarantees hold only under the stated assumptions about the environment. citeturn0search28turn0search29 TLA+ refinement also treats lower-level implementations as representations that must preserve the higher-level behavior being claimed; auxiliary/history variables can be needed to expose information required for that correspondence. citeturn0search31turn0search32 NIST SP 800-193 separately emphasizes protection, detection and recovery, and notes the importance of compatibility between updated code and critical data plus safeguards around rollback/recovery. citeturn0search0turn0search27

## Core result

A scope or abstraction certificate is not a permanent truth. It is a **time/context-bound assurance artifact**.

The discovery of a previously unknown effect-capable dependency is itself a safety-relevant event:

`DISCOVERY != TELEMETRY`
`DISCOVERY != PROOF_OF_EFFECT`
`DISCOVERY = POSSIBLE_CHANGE_TO_CLOSURE`

If the new dependency can affect the claim, existing scope/abstraction/release evidence must be invalidated or revalidated before the protected effect continues.

## 1. Canonical race

T1:
- effect E admitted;
- scope S computed;
- abstraction certificate A issued;
- effect begins execution.

T2:
- provider/plugin discovers D;
- D was absent from dependency closure;
- D can influence E, a child effect, a queue, a resource, a boundary, evidence, or recovery.

T3:
- E is still in flight;
- old A/S are still cached;
- another component attempts to continue/retry/release E.

The dangerous behavior is:

`OLD_ASSURANCE + NEW_UNKNOWN_DEPENDENCY → CONTINUE`

The safe default for a claim affected by D is:

`INVALIDATE → FENCE/RESTRICT → RECOMPUTE CLOSURE → REVALIDATE → CONTINUE or HOLD`.

## 2. Discovery does not prove the dependency is active

Finding D does not prove D produced an effect.

But if D is capable of producing or modifying a protected effect, the prior assumption that D was irrelevant is no longer justified.

Therefore:

`UNKNOWN_DEPENDENCY → NO_DEPENDENCY` is forbidden.

The system may later establish that D is irrelevant, bounded, or fenced, but that is a new claim requiring evidence.

## 3. Three different events

A. Dependency discovery:
"D may exist or may influence E."

B. Dependency activation:
"D actually participated in this execution."

C. Dependency effect:
"D caused/modified an external protected effect."

These must not be conflated.

Discovery can invalidate an assurance certificate even when activation/effect remains UNKNOWN.

## 4. Dynamic scope widening

If D can affect a protected claim, the effect's scope may need to widen:

`S_old ⊂ S_new`.

But widening scope is itself protected state.

It cannot silently grant the new dependency authority.

Candidate sequence:

`DISCOVER → CLASSIFY → IMPACT_ANALYSIS → INVALIDATE_AFFECTED_ASSURANCE → FREEZE/RESTRICT → SCOPE_WIDEN → AUTHORIZATION_REVALIDATION → BOUNDARY/FENCE_VALIDATION → EFFECT_RECONCILIATION → NEW_CERTIFICATE or HOLD`.

## 5. Scope widening must not automatically widen authority

A newly discovered provider is not automatically authorized merely because it is now in scope.

Therefore:

`SCOPE_WIDENING != AUTHORITY_WIDENING`.

If the provider needs capability not already granted, a separate protected authorization transition is required.

This preserves the earlier separation:

`INFORMATION != CAPABILITY != AUTHORITY`.

## 6. What gets invalidated?

Potentially affected artifacts include:

- ScopeContext;
- EffectPathClosure;
- AbstractionCertificate;
- dependency closure;
- interaction graph;
- uncertainty set;
- causal-order claims;
- evidence records whose validity depends on closure;
- ReleaseEligibility;
- recovery progress;
- containment claims;
- absorption certificates;
- fence coverage claims;
- provider compatibility claims;
- formal-model assumptions.

Invalidation must be claim-specific. Discovery D may affect a strong global claim but not a narrow local claim.

## 7. In-flight effect semantics

An in-flight effect cannot simply be classified as "still authorized" because its original admission was valid.

Required distinction:

`VALID_AT_ADMISSION != VALID_AT_CONTINUATION`.

A continuation requires current validation of:

- effect identity;
- attempt identity;
- current authority;
- policy/invariant version;
- dependency closure;
- effect-path closure;
- boundary generation;
- resource incarnation;
- STOP/recovery state;
- interaction graph;
- compatibility;
- required evidence.

## 8. Revocation is not necessarily cancellation

Discovery can invalidate authority for future transitions while the external effect continues.

Therefore:

`INVALIDATED_AUTHORITY != EFFECT_STOPPED`.

Nexo must separately determine:

1. whether future attempts are blocked;
2. whether in-flight execution can be interrupted;
3. whether provider continuation can persist;
4. whether resource-side enforcement exists;
5. what external effect remains UNKNOWN.

## 9. Discovery can enlarge uncertainty

Before discovery:

U1 = worlds consistent with known closure.

After discovery:

U2 may be larger because new histories become possible.

Therefore:

`DISCOVERY → U may expand`.

This is the opposite of normal evidence reduction.

If a prior abstraction relied on D being impossible/irrelevant, that abstraction may become invalid immediately.

## 10. Race with abstraction publication

Dangerous sequence:

A certificate is published.
D discovered.
Old certificate remains cached.
Effect continues using old abstraction.
D later influences effect.

The cache must not be treated as authoritative truth.

Candidate rule:

`CERTIFICATE_VALID => CONTEXT_CURRENT ∧ DEPENDENCY_CLOSURE_CURRENT ∧ BOUNDARY_CURRENT ∧ ASSUMPTIONS_CURRENT`.

## 11. Invalidation must itself be ordered

An invalidation event cannot rely on ordinary asynchronous notification if safety depends on it.

We need to distinguish:

`DISCOVERY_ORDER`
`INVALIDATION_ORDER`
`FENCE_ORDER`
`EFFECT_ORDER`
`OBSERVATION_ORDER`

Message arrival order does not establish any of these.

If an effect can cross the boundary between discovery and enforcement, the architecture needs explicit semantics for that window.

## 12. Candidate invalidation barrier

Introduce:

`INVALIDATION_BARRIER`.

A barrier represents the protected point after which affected old assurance cannot authorize new protected effects.

Possible lifecycle:

`DISCOVERED → IMPACT_CONFIRMED → INVALIDATION_PENDING → INVALIDATION_LINEARIZED → ENFORCEMENT_UPDATED → REVALIDATION → RELEASE_OR_HOLD`.

`INVALIDATION_LINEARIZED` means the authoritative decision changed.

It does NOT mean every external component has already stopped.

## 13. Boundary generation

Each effect-capable boundary should expose a generation/incarnation that changes when its enforcement semantics materially change.

An old attempt bound to B1 cannot silently continue through B2 unless compatibility is explicitly proven.

Therefore:

`BOUNDARY_GENERATION != CONFIG_VERSION`.

A configuration version may be identical while enforcement context differs due to resource, dependency, authority or continuity changes.

## 14. Discovery race with queued work

Old queued work can survive discovery.

Examples:

- provider retry;
- delayed queue item;
- callback;
- child workflow;
- scheduled task;
- cached capability;
- delegated capability;
- offline device;
- autonomous resource.

Invalidating the controller does not necessarily remove these paths.

They must be fenced, drained with claim-adequate evidence, or explicitly included in the remaining uncertainty.

## 15. Discovery race with resource replacement

If D causes a resource replacement or reveals a hidden resource, the logical resource name is insufficient.

Need:

`ResourceIncarnation + BoundaryGeneration + ContinuityContext`.

A certificate for R1 cannot automatically authorize R2.

## 16. Discovery race with recovery

Recovery may begin using historical scope S1.

If D is discovered while recovery is active:

`RECOVERY_PROGRESS(S1)` becomes potentially stale.

Recovery must not self-upgrade its own authority to cover D.

It must recompute current closure and acquire any separately required authority.

## 17. Discovery race with STOP

If STOP is active, discovery can increase uncertainty but must not weaken STOP.

The correct behavior is generally:

`STOP remains authoritative → affected assurance invalidated → new effects blocked → reconciliation/closure work continues under recovery rules`.

Discovery cannot be used as a reason to clear STOP.

## 18. Discovery race with absorption

An absorbing safe state was previously proven safe because all relevant paths were covered.

If D is discovered outside that closure, the absorption claim may be invalid.

Therefore:

`ABSORPTION_CERTIFICATE + NEW_EFFECT_PATH → REVALIDATE_ABSORPTION`.

If D can bypass the boundary, scope reduction must be reversed or the claim downgraded.

## 19. Open-world interpretation

For an open provider, an unknown dependency cannot be assumed absent merely because no telemetry showed it.

TLA+ open-system reasoning explicitly requires assumptions about uncontrolled environment behavior. citeturn0search28

Thus Nexo should distinguish:

`CLOSED`
`BOUNDARY-BOUNDED`
`ASSUMED`
`UNKNOWN`

and claims cannot exceed the strength of the applicable assumption.

## 20. New object: InvalidationBarrier

Candidate fields:

- barrier_id;
- triggering_change;
- affected claims;
- affected scope/closures;
- old context/generation;
- new required context/generation;
- linearization reference;
- fence set;
- propagation state;
- external enforcement state;
- reconciliation requirements;
- release invalidation;
- dependency/topology versions;
- continuity anchor;
- expiry/invalidation conditions.

## 21. New object: DependencyDiscoveryRecord

Candidate fields:

- discovery_id;
- dependency identity;
- discovery source;
- first-seen context;
- confidence/evidence;
- effect-capability classification;
- reachable paths;
- affected boundaries;
- affected claims;
- activation status;
- dependency incarnation/version;
- invalidation references.

DiscoveryRecord is evidence, not authority.

## 22. New object: AssuranceContext

Candidate aggregate context:

- context_id;
- scope version;
- dependency closure version;
- effect-path closure version;
- interaction graph version;
- boundary generations;
- resource incarnations;
- policy/invariant versions;
- authority epoch;
- STOP/recovery epochs;
- continuity anchor;
- assumptions;
- abstraction certificates;
- invalidation status.

A claim is evaluated against one coherent AssuranceContext, not a mixture of independently current fragments.

## 23. Candidate invariants INV-DSA-01..28

INV-DSA-01 Assurance certificates are context-bound.
INV-DSA-02 Discovery of an effect-capable unknown dependency can invalidate affected assurance.
INV-DSA-03 Discovery does not prove activation or external effect.
INV-DSA-04 Unknown dependency is never silently treated as no dependency.
INV-DSA-05 Scope widening does not grant authority.
INV-DSA-06 Affected in-flight continuation requires current revalidation.
INV-DSA-07 Invalidated authority does not imply external cancellation.
INV-DSA-08 Discovery can expand uncertainty.
INV-DSA-09 Cached assurance cannot bypass current invalidation state.
INV-DSA-10 Invalidation order is distinct from discovery and message order.
INV-DSA-11 Critical invalidation requires a protected ordering point.
INV-DSA-12 Invalidation linearization does not prove external enforcement.
INV-DSA-13 Boundary generation is part of continuation compatibility.
INV-DSA-14 Old boundary context cannot silently authorize new boundary context.
INV-DSA-15 Queued/child/provider continuations are included in invalidation closure when effect-capable.
INV-DSA-16 Resource replacement invalidates incompatible bindings.
INV-DSA-17 Recovery progress is invalidatable by closure changes.
INV-DSA-18 Recovery cannot self-grant authority for newly discovered dependencies.
INV-DSA-19 STOP cannot be weakened by discovery.
INV-DSA-20 Absorption certificates require revalidation after closure changes.
INV-DSA-21 Scope, dependency, interaction and effect-path versions are distinct.
INV-DSA-22 A claim cannot combine fragments from incompatible AssuranceContexts.
INV-DSA-23 Dependency assumptions are claim-specific.
INV-DSA-24 Boundary-bounded claims require current boundary enforcement.
INV-DSA-25 Unknown provider behavior can prevent strong claims without a boundary.
INV-DSA-26 New dependency discovery invalidates only claims actually affected by its closure.
INV-DSA-27 Invalidation itself requires recovery/crash semantics.
INV-DSA-28 Loss of current AssuranceContext defaults to HOLD/REVALIDATE/QUARANTINE for claims requiring it.

## 24. Formal model direction

Add variables:

`dependencyClosureVersion`
`effectPathClosureVersion`
`interactionGraphVersion`
`boundaryGeneration`
`scopeVersion`
`assuranceContext`
`invalidationBarrier`
`discoverySet`
`affectedClaims`
`inFlightEffects`

Candidate safety property:

`CONTINUE(e) => CURRENT_ASSURANCE_CONTEXT(e) ∧ NO_UNRESOLVED_AFFECTING_INVALIDATION(e)`.

Candidate race property:

`DISCOVERY_AFFECTS_CLAIM(d,c) => INVALIDATE_OR_REVALIDATE(c)`

before any new protected transition relying on the invalidated claim.

Candidate abstraction property:

`ABSTRACTION_VALID(c) => ALL_ASSUMPTIONS_CURRENT(c) ∧ CLOSURE_CURRENT(c)`.

## 25. Architectural consequence

The earlier Invalidation Plane now needs to be connected directly to the Assurance Abstraction Plane:

`DISCOVERY/CHANGE`
→ `IMPACT ANALYSIS`
→ `INVALIDATION BARRIER`
→ `ASSURANCE INVALIDATION`
→ `FENCE/RESTRICT`
→ `CLOSURE RECOMPUTE`
→ `CONTEXT REBUILD`
→ `RECONCILE`
→ `REVALIDATE ABSTRACTION`
→ `REVALIDATE AUTHORITY`
→ `EXPLICIT CONTINUE/RELEASE`

No cached certificate can jump across the barrier.

## 26. Important new distinction

A discovered dependency creates three possible outcomes:

A. **Bounded and irrelevant** — proven unable to affect claim; certificate may be revalidated.
B. **Relevant and enforceable** — closure/scope expands, boundary/fence updated, claim revalidated.
C. **Relevant but not bounded/enforceable** — strong claim must degrade or remain HOLD/QUARANTINE.

This gives the system a controlled response instead of treating discovery as either harmless or catastrophic.

## 27. Remaining gaps

G-DSA-01 formal invalidation-barrier linearization.
G-DSA-02 atomicity between discovery and protected admission.
G-DSA-03 dynamic closure computation completeness.
G-DSA-04 concurrent discoveries and coalescing.
G-DSA-05 rollback of discovery metadata and continuity.
G-DSA-06 crash during invalidation propagation.
G-DSA-07 provider-side enforcement of invalidation.
G-DSA-08 stale cached certificate elimination.
G-DSA-09 abstraction refinement under dynamic scope.
G-DSA-10 actual TLC/SANY verification.
G-DSA-11 implementation refinement.
G-DSA-12 fault injection for discovery/invalidation races.

## Conclusion

A safety certificate is not a permanent fact. It is a claim about a specific coherent context.

The strongest new rule is:

`NO CURRENT ASSURANCE CONTEXT → NO CONTINUATION THAT DEPENDS ON IT`.

And:

`NEW EFFECT-CAPABLE DEPENDENCY → POSSIBLE ASSURANCE INVALIDATION`.

The system does not need to panic at every discovery. It needs to classify the dependency, determine claim impact, establish a protected invalidation boundary, recompute closure, and only then decide whether the previous assurance can survive.

## Next attack

**DISCOVERY/INVALIDATION ATOMICITY + SIMULTANEOUS ADMISSION RACE + STALE CACHE + CRASH BETWEEN BARRIER AND ENFORCEMENT**

Question: can an effect slip through the exact window in which a new dependency is discovered but its old assurance has not yet been fully invalidated and enforced?

# NEXO - DYNAMIC PROVIDER DISCOVERY / PLUGIN EXPANSION / SCOPE WIDENING RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can a dynamically discovered provider, plugin, delegated capability, queue, or runtime dependency expand an already-admitted effect's path/scope without a new protected transition?

## External cross-checks

Kubernetes documents dynamic admission webhooks that can be configured at runtime, including matching rules and external webhook endpoints. It also notes that validating admission should see the final object after mutations, and that webhook failures can be configured to fail closed or be ignored. This is a useful concrete analogue: dynamic admission configuration changes the effective control path, so its current configuration and failure semantics are part of the admission context. citeturn0search0turn0search2

Kubernetes also documents that admission webhooks may have out-of-band side effects and therefore require reconciliation because an admission call does not guarantee that the admitted object is ultimately persisted. This reinforces the distinction between admission and world effect. citeturn0search0

## Core result

A dynamically discovered component must not silently enlarge the protected effect scope after admission.

Candidate rule:

DYNAMIC_DISCOVERY != DYNAMIC_AUTHORITY.

And:

SCOPE_AT_ADMISSION != SCOPE_AT_EXECUTION

unless continuity and compatibility explicitly prove that the execution remains inside the admitted closure.

Therefore:

UNPLANNED_SCOPE_EXPANSION
→ NEW_PROTECTED_TRANSITION
or
→ DENY / HOLD / QUARANTINE.

## Why this matters

Suppose:
1. E is admitted with provider P1.
2. E's scope closure contains P1, resource R1 and queue Q1.
3. During execution, P1 discovers plugin P2.
4. P2 introduces a new resource R2.
5. P2 delegates to worker W2.
6. W2 can create a protected effect.

If Nexo simply says "P2 is part of the same operation", the original admission proof no longer covers the complete effect path.

The correct interpretation is:

OLD_SCOPE != NEW_SCOPE.

The operation must either:
- remain bounded so P2 cannot create a protected effect outside the frozen scope;
- or execute a protected scope-widening transition before P2 becomes effective.

## New object: ScopeExpansionProposal

Candidate fields:
- expansion_id;
- effect_id;
- attempt_id;
- previous_scope_id;
- proposed_scope_id;
- newly discovered providers;
- new resources/incarnations;
- new queues/workers;
- new capabilities/delegations;
- dependency closure delta;
- effect-path closure delta;
- boundary closure delta;
- interaction/coordination delta;
- mission-invariant impact;
- policy/invariant versions;
- continuity context;
- current fence set;
- required evidence;
- authorization basis;
- protected linearization;
- result ALLOW / DENY / HOLD / QUARANTINE.

## Scope widening is not discovery

Discovery is epistemic:

"I found something."

Scope widening is authoritative:

"This new thing is now allowed to participate in the protected effect."

Therefore:

DISCOVERY != ADMISSION.

And:

DISCOVERED_PROVIDER != AUTHORIZED_PROVIDER.

## Frozen effect scope

At admission, Nexo records the exact claim-relevant closure:
- effect identity;
- attempt identity;
- provider identities;
- resource identities/incarnations;
- capability set;
- delegation limits;
- queues;
- worker identities;
- boundary set;
- dependency closure;
- coordination domain;
- mission obligations;
- environment assumptions;
- policy/invariant versions;
- continuity context.

Execution may discover additional information, but discovery cannot automatically enlarge authority.

## Dynamic discovery cases

### Case A: discovery is observational only

Provider P2 is discovered but cannot produce a protected effect.

No scope widening is required.

It may enter an observation/evidence graph.

### Case B: P2 can produce a protected effect but is already inside a bounded boundary

No global closure expansion may be needed if the existing boundary contract explicitly covers P2 and its behavior.

This requires a current, claim-specific proof.

### Case C: P2 can produce a protected effect outside the frozen boundary

Scope widening is mandatory.

### Case D: P2 is discovered but its semantics are UNKNOWN

If the unknown behavior can affect the protected claim:

HOLD / QUARANTINE.

It cannot be silently treated as harmless.

## Provider plugins

A plugin system creates a special closure hazard.

Plugin loading can alter:
- effect classes;
- provider capabilities;
- data sources;
- network paths;
- credentials;
- resource targets;
- child processes;
- queues;
- retry semantics;
- update paths.

Therefore plugin installation/loading is itself a safety-relevant transition whenever the plugin can influence a protected effect.

Candidate:

PLUGIN_LOAD = UPDATE + DEPENDENCY_EXPANSION + EFFECT_PATH_EXPANSION

when applicable.

## Capability expansion

Suppose an admitted operation has:

CAP(A) = {read(R1), write(R1)}

A plugin requests:

CAP(A)' = {write(R2), invoke(P2)}

This is not a harmless runtime detail.

It is:

CAPABILITY_SCOPE_WIDENING.

Candidate rule:

CAPABILITY_EXPANSION_REQUIRES_PROTECTED_ADMISSION.

Unless the original capability was explicitly defined as a bounded capability that already includes that class of delegation.

## Delegation

Delegation creates lineage:

A → B → C.

Every delegated capability must retain:
- effect identity/domain;
- target;
- resource incarnation;
- authority epoch;
- boundary generation;
- scope;
- expiry;
- revocation generation;
- policy/invariant context;
- continuity context.

A delegate must not be able to create authority broader than its parent capability.

Candidate invariant:

DELEGATED_SCOPE ⊆ GRANTED_SCOPE.

And:

DELEGATED_AUTHORITY != PARENT_AUTHORITY.

The child receives a constrained capability, not the parent's unrestricted authority.

## Dynamic provider identity

Provider name is insufficient.

Need ProviderIdentity:
- provider_id;
- provider_incarnation;
- contract identity;
- effect classes;
- capability fingerprint;
- boundary generation;
- dependency closure;
- trust identity;
- continuity context.

Provider replacement:

P1 → P2

even when the logical provider name remains unchanged.

Old authorization does not silently transfer.

## Dynamic dependency discovery

A provider may discover a new dependency after admission.

This is equivalent to:

DEPENDENCY_CLOSURE_EXPANSION.

If the dependency can change a safety claim, the current assurance context becomes stale until the new dependency is incorporated.

Candidate:

NEW_SAFETY_RELEVANT_DEPENDENCY
→ IMPACT ANALYSIS
→ INVALIDATION / REVALIDATION
→ SCOPE WIDENING IF NEEDED
→ NEW PROTECTED ADMISSION.

## Dynamic queues

A provider can dynamically enqueue child work.

If child work can produce protected effects, it becomes part of EffectPathClosure.

Therefore:

QUEUE_DISCOVERY != QUEUE_AUTHORIZATION.

And:

CHILD_EFFECT != INTERNAL_IMPLEMENTATION_DETAIL.

## Runtime discovery and admission linearization

The dangerous race is:
1. Admission freezes Scope S.
2. Execution begins.
3. Provider discovers P2.
4. P2 creates protected effect.
5. Nexo notices P2 only afterward.

This creates:

UNAUTHORIZED_SCOPE_EXPANSION.

The architecture must make one of these true:

A. P2 was already covered by a boundary that made the new path irrelevant to the claim.

B. P2 cannot act until scope widening commits.

C. The original operation is not permitted to continue.

No fourth option should be "we discovered it afterward and retroactively call it authorized."

## Scope-widening transition

Candidate protocol:

DISCOVER
→ DESCRIBE DELTA
→ COMPUTE EFFECT/PATH/DEPENDENCY CLOSURE
→ COMPUTE MISSION IMPACT
→ CHECK INTERACTIONS
→ CHECK BOUNDARY COVERAGE
→ CHECK AUTHORITY
→ CHECK CONTINUITY
→ PREPARE SCOPE WIDENING
→ PROTECTED SCOPE-WIDENING LINEARIZATION
→ ACTIVATE REQUIRED FENCES/CAPABILITIES
→ VERIFY ENFORCEMENT
→ PUBLISH NEW SCOPE
→ CONTINUE

Any critical UNKNOWN:
HOLD / QUARANTINE.

## Scope widening versus scope shrinking

Widening is safety-sensitive.

But shrinking can also be unsafe if the removed component still has an active path to the protected effect.

Therefore:

SCOPE_SHRINK != AUTOMATICALLY_SAFE.

A component can be removed from intended scope while still being active in the world.

Removal requires:
- revocation/fencing;
- effect-path closure update;
- child/queue handling;
- reconciliation where necessary;
- proof that the removed path cannot continue violating the claim.

## Dynamic admission analogy

Kubernetes dynamic admission is a useful real-world analogue because webhook configurations can be changed at runtime, and the API server evaluates active configuration when deciding which webhook participates. It also documents fail-open versus fail-closed behavior for webhook failures. This supports treating dynamic policy/control-path changes as current admission context, not inert metadata. citeturn0search0

The analogy is not a claim that Nexo should copy Kubernetes.

## Failure policy

For safety-critical dynamic providers, a generic IGNORE failure mode is dangerous if the provider was required to establish a safety property.

Candidate rule:

If provider P is required to prove a claim:

P_FAILURE
→ CLAIM_UNKNOWN
→ HOLD/DENY

unless an independent boundary preserves the claim.

If P is merely optimization/telemetry:

P_FAILURE
→ CLAIM MAY REMAIN CURRENT

only if dependency closure proves P is irrelevant to that claim.

## Side effects

Kubernetes warns that admission webhooks with out-of-band side effects need reconciliation because admission does not guarantee the admitted object is ultimately persisted. This is directly relevant conceptually: an admission interaction can have effects not represented by the admitted object. citeturn0search0

Therefore Nexo must distinguish:

ADMISSION_EFFECT
SIDE_EFFECT
EXTERNAL_EFFECT
OBSERVED_EFFECT

and not assume the admission response is the complete world transition.

## New object: DynamicCapabilityContext

Candidate fields:
- context_id;
- parent_context;
- capability set;
- delegation lineage;
- provider identities/incarnations;
- scope;
- boundary generations;
- revocation generation;
- authority epoch;
- policy/invariant versions;
- continuity context;
- expiry;
- invalidation triggers.

## New object: ProviderContractBinding

Candidate fields:
- provider identity/incarnation;
- contract identity;
- effect classes;
- ACK semantics;
- idempotency;
- retry/redrive;
- cancellation/fencing;
- history/status;
- resource replacement;
- autonomous continuation;
- boundary coverage;
- dependency closure;
- assumptions;
- currentness;
- invalidation triggers.

## New invariant family INV-DYN-01..34

01 Dynamic discovery does not grant authority.
02 Discovered provider is not automatically authorized.
03 Frozen scope remains authoritative until protected widening.
04 Protected effect cannot escape frozen scope.
05 Scope widening is a protected transition.
06 Scope widening requires current authority.
07 Scope widening requires current boundary coverage.
08 Scope widening requires current dependency closure.
09 Scope widening requires current mission-invariant impact analysis.
10 Unknown new provider cannot silently become safe.
11 Provider replacement requires new incarnation/context.
12 Provider contract changes invalidate dependent assurance.
13 Dynamic plugin load can be a safety-relevant transition.
14 Capability expansion requires protected admission.
15 Delegated scope cannot exceed granted scope.
16 Delegated authority is distinct from parent authority.
17 Delegation lineage must be revocable/fenceable where required.
18 Dynamic dependency expansion invalidates incomplete assurance.
19 Dynamically created child effects enter effect-path closure.
20 Dynamic queues enter closure if they can produce protected effects.
21 Discovery after admission cannot retroactively authorize a new effect path.
22 Existing boundary may absorb discovery only if coverage is explicit and current.
23 Failure of a required provider blocks the dependent claim unless another boundary preserves it.
24 Failure of an irrelevant provider need not invalidate unrelated claims.
25 Scope shrinkage requires revocation/fencing where removed paths remain active.
26 Runtime provider discovery cannot silently widen coordination domain.
27 Runtime provider discovery cannot silently widen mission footprint.
28 Capability caches cannot silently outlive scope/authority generations.
29 Provider identity requires incarnation/context binding.
30 Plugin update can invalidate proof/assurance context.
31 Recovery must recompute dynamic provider closure.
32 Rollback must not restore historical dynamic authority.
33 Unknown dynamic interaction is not disjoint.
34 Safe non-convergence is preferred to unauthorized dynamic expansion.

## Candidate theorem

Not formally proven:

If an admitted effect has a frozen claim-relevant scope S, and every runtime-discovered component capable of affecting the protected claim is either already covered by a current enforceable boundary or must pass a protected scope-widening transition before producing a protected effect, then runtime discovery cannot silently expand the effect's authorized safety domain.

Required premises:
- frozen scope is authoritative;
- effect-path closure is complete relative to the claim;
- dynamic components cannot bypass the boundary;
- capability/delegation enforcement is current;
- provider identity/incarnation is current;
- scope-widening linearization is authoritative;
- queues/children/retries/redrives are covered;
- update/recovery paths are included.

## Major architectural consequence

We now need an explicit distinction:

DISCOVERY PLANE
versus
AUTHORITY / SCOPE PLANE.

Discovery may continuously learn.

Authority cannot continuously expand merely because discovery learned something new.

Candidate relationship:

DISCOVERY
→ PROPOSED SCOPE DELTA
→ SAFETY ANALYSIS
→ PROTECTED SCOPE TRANSITION
→ AUTHORITY UPDATE

not:

DISCOVERY
→ AUTOMATIC AUTHORITY.

## Next attack

SCOPE WIDENING + IN-FLIGHT EFFECT + CRASH + DUPLICATE PROVIDER + OLD SCOPE TOKEN + NEW SCOPE TOKEN

Question: what happens if widening is prepared but the process crashes before widening linearizes, while an old-scope actor and a new-scope actor both possess capabilities? The next round will attack anti-ABA scope generations, capability overlap, crash recovery, and whether widening itself needs a two-sided cutoff/fence exactly like invalidation versus admission.
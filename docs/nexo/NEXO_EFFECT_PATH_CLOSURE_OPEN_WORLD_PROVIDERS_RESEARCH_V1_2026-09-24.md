# NEXO — EFFECT-PATH CLOSURE COMPLETENESS / OPEN-WORLD PROVIDERS RESEARCH V1
Date: 2026-09-24
Status: RESEARCH / ARCHITECTURAL DESIGN ONLY
Verification: NOT SANY/TLC VERIFIED; NOT IMPLEMENTATION VERIFIED; NOT RUNTIME VERIFIED

## 1. Objective

Determine whether Nexo can ever prove complete closure over every path capable of producing a protected external effect when the environment is open-ended.

Core result:

For a genuinely open world, Nexo cannot prove unrestricted global effect-path completeness from finite local observations alone.

Therefore strong safety claims must be bounded by an explicit environment contract, capability boundary, enforceable effect boundary, or conservative quarantine.

This is consistent with the TLA+ open-system model: a component interacting with an environment requires explicit environment assumptions; a guarantee cannot simply be asserted against arbitrary uncontrolled behavior. The important architectural consequence is that an "open-world" assumption must become an explicit contract rather than an implicit hope. citeturn0search24turn0search26

## 2. Central theorem candidate

OPEN_WORLD + UNBOUNDED_EXTERNAL_EFFECT_PATHS
=> NO_FINITE_PROOF_OF_GLOBAL_EFFECT_PATH_COMPLETENESS

This is a design theorem candidate, not formally proven.

Reason:
A finite observation can establish only the paths covered by its model/contract. An uncontrolled external actor can always introduce a path outside that model unless the architecture constrains what paths can reach the protected effect boundary.

Therefore the architecture has only three defensible strategies:

A. close the world with an enforceable boundary;
B. explicitly assume a bounded environment contract;
C. refuse the strong claim.

## 3. What "complete" must mean

Effect-path completeness must be claim-relative.

For claim C and effect E:

EPC_COMPLETE(E,C)

means:

Every path capable of causing an effect relevant to C is either:
1. represented in the closure;
2. forced through a known enforcement boundary;
3. proven unable to reach the protected effect;
4. explicitly included in an environment assumption;
5. or the strong claim is not admissible.

This avoids requiring Nexo to know every process in existence.

## 4. Unknown external world

The architecture must distinguish:

UNKNOWN_PATH
from
NO_PATH.

UNKNOWN_PATH means Nexo cannot establish whether a path exists.

NO_PATH requires a proof/boundary sufficient for the claim.

Therefore:

UNKNOWN_PATH != NO_PATH

and:

UNOBSERVED != INACTIVE.

## 5. Open-world boundary

The most important new architectural concept:

EFFECT_BOUNDARY

An effect boundary is the last enforceable point through which a protected external effect must pass.

If every relevant effect must cross the boundary, Nexo does not need omniscience about the whole external world.

It needs:
- identity;
- authorization;
- current fence;
- scope;
- effect class;
- current resource incarnation;
- enforcement;
- durable effect identity;
- evidence/reconciliation semantics

at that boundary.

This converts an impossible global-knowledge problem into a bounded enforcement problem.

## 6. Boundary completeness vs world completeness

WORLD_COMPLETENESS:
Nexo knows every relevant actor/path in the environment.

Generally impossible in an open world.

BOUNDARY_COMPLETENESS:
Every relevant protected effect must cross an enforceable boundary.

Potentially achievable, claim-specific.

Therefore the architecture should prefer:

BOUNDARY_COMPLETENESS

over:

GLOBAL_DISCOVERY.

## 7. Closed-world vs open-world contracts

Candidate environment modes:

CLOSED_WORLD:
All effect-producing paths are enumerated within the authoritative domain.

BOUNDARY_WORLD:
The environment may be open internally, but all protected effects must cross defined enforcement boundaries.

ASSUMED_WORLD:
Some environment behavior is outside control but is explicitly constrained by an assumption/guarantee contract.

UNKNOWN_WORLD:
The relevant environment cannot be bounded or constrained enough for the requested claim.

Only the first three can support strong claims, and only to the extent their assumptions are actually enforceable/valid.

TLA+ research directly supports explicit environment assumptions for open systems. citeturn0search24turn0search26

## 8. Environment assumption is not evidence

A declared assumption such as:

"provider X will never perform effect Y outside API Z"

is not evidence that it is true.

The architecture must distinguish:

ASSUMPTION_DECLARED
ASSUMPTION_ATTESTED
ASSUMPTION_ENFORCED
ASSUMPTION_VERIFIED

A safety claim depending on a merely declared assumption should be marked accordingly.

## 9. Assumption strength

Candidate levels:

A0 UNKNOWN
A1 DECLARED
A2 DOCUMENTED
A3 AUTHENTICATED/ATTESTED
A4 ENFORCED
A5 VERIFIED_FOR_CLAIM

A4/A5 are not universally achievable; the level is claim-specific.

No stronger claim may silently inherit a weaker assumption.

## 10. Boundary capability

A boundary must itself be authoritative enough to reject protected effects.

A logging gateway that records requests but cannot reject them is an observation point, not an enforcement boundary.

Therefore:

OBSERVATION_POINT != EFFECT_BOUNDARY.

Likewise:

AUTHORIZATION_DECISION != ENFORCEMENT

unless the protected resource actually enforces the decision.

## 11. Bypass analysis

For every boundary B:

BYPASS_PATHS(B,C)

must be analyzed.

A boundary is complete only if every path relevant to C either:
- crosses B;
- is separately covered by another boundary;
- or is proven irrelevant.

This creates a boundary graph rather than a simple API list.

## 12. Boundary composition

Suppose:
E1 crosses B1.
E2 crosses B2.

If E1 and E2 share a physical resource, then separate boundaries may not establish independent containment.

The boundary graph must therefore incorporate:
- shared resources;
- shared queues;
- shared trust roots;
- shared credentials;
- shared control plane;
- shared provider;
- shared autonomous behavior.

This reuses the existing common-mode/failure-domain research.

## 13. Capability-based closure

A potentially stronger method is to ensure that protected effects are only possible through explicit capabilities.

Then effect-path closure can be bounded by:

CAPABILITY_REACHABILITY

instead of global process discovery.

But this only works if:
- capabilities cannot be forged;
- capabilities cannot be duplicated outside policy;
- resource enforces them;
- old capabilities can be revoked/fenced;
- delegated capabilities remain within closure;
- ambient authority is absent or bounded.

Therefore:

CAPABILITY_BOUNDARY != COMPLETE BY DEFAULT.

## 14. Delegation expansion

A holder can delegate capability to another actor.

That creates a new effect path.

Therefore capability closure must include:

delegation → delegated capability → recipient → further delegation

until:
- delegation is prohibited;
- delegation is bounded;
- capability reaches an enforceable boundary;
- or closure becomes UNKNOWN.

Unbounded delegation is equivalent to an open effect path.

## 15. Plugin/provider boundary

A plugin can dynamically load:
- libraries;
- subprocesses;
- network destinations;
- credentials;
- child agents;
- queues;
- external APIs.

Therefore "plugin X is inside the scope" is insufficient.

The plugin's effect surface must be:
- declared;
- constrained;
- observed;
- enforced;
- or treated as open/UNKNOWN.

A software inventory such as an SBOM can document component relationships, but it does not by itself prove runtime effect-path completeness. NIST describes SBOMs as formal records of component and supply-chain relationships and notes that SBOMs can be generated with incomplete historical dependency information; this supports treating inventory as provenance/context rather than automatic runtime closure proof. citeturn0search9turn0search10

## 16. Dynamic dependency discovery

If a runtime discovers a new provider:

DISCOVERED_PROVIDER P

does not imply:

AUTHORIZED_EFFECT_PATH P.

The path must either:
- already lie inside a pre-authorized boundary;
- be admitted through a protected widening transition;
- or be blocked.

This carries forward the prior scope rule.

## 17. Unknown dependency strategy

When closure encounters an unknown path:

For weak claims:
- possibly continue under an explicit degraded claim.

For strong claims:
- HOLD;
- QUARANTINE;
- or establish an enforcement boundary that makes the unknown path irrelevant.

There is no safe generic transformation:

UNKNOWN_PATH → NO_PATH.

## 18. The "boundary closure" theorem candidate

Candidate:

If every path capable of violating claim C must cross at least one boundary in set B, and each boundary in B enforces the current claim-compatible policy, then global discovery of all internal paths is unnecessary for proving C.

This is a much more tractable proof obligation.

Formally:

∀ violating path p:
  ∃ boundary b ∈ B:
    crosses(p,b)
    ∧ EnforcedFor(b,C)

Then:

GlobalPathEnumerationNotRequiredFor(C)

subject to the correctness of the boundary assumptions.

This is a candidate theorem, not verified.

## 19. Boundary escape

The theorem fails if:
- a new transport bypasses B;
- a resource has ambient authority;
- provider has an alternate API;
- queue injects directly into resource;
- stale capability remains accepted;
- resource autonomously acts;
- replacement resource lacks B;
- break-glass path bypasses B;
- administrator has an undocumented path.

Therefore boundary bypass is a first-class safety audit.

## 20. Break-glass

Emergency override is an effect path.

Therefore:

BREAK_GLASS != OUTSIDE_CLOSURE

A break-glass capability must have:
- scope;
- identity;
- authorization;
- effect class;
- expiration;
- audit/evidence;
- resource enforcement;
- revocation/fencing;
- explicit claim impact.

An undocumented break-glass path destroys boundary completeness.

## 21. Human path

Human approval is not automatically equivalent to technical enforcement.

A human may authorize an action, but the protected effect still needs to cross the technical effect boundary.

Therefore:

HUMAN_APPROVAL != EFFECT_ENFORCEMENT.

Human approval can be an authority input, evidence input, or governance transition, but not a substitute for resource enforcement.

## 22. Provider-side autonomous behavior

If a provider can continue executing after API disconnect:
- Nexo cannot equate API session closure with effect termination.
- provider-side cancellation/reconciliation semantics become part of the claim.
- the provider may need its own effect identity/fence.

Therefore:

SESSION_CLOSED != EFFECT_TERMINATED.

## 23. Open-ended provider with no enforceable boundary

If provider P can produce a protected effect through unknown paths and Nexo cannot enforce or constrain those paths:

STRONG_CLAIM(P,C) = NOT_ADMISSIBLE.

The correct result is not a weaker verbal assertion disguised as a strong one.

Possible outcomes:
- deny;
- isolate;
- restrict claim scope;
- quarantine;
- require provider integration that establishes a boundary.

## 24. Claim degradation

Claims should have explicit strength.

Candidate:

CLAIM_GLOBAL_NO_PROTECTED_EFFECT
CLAIM_BOUNDARY_NO_PROTECTED_EFFECT
CLAIM_RESOURCE_NO_PROTECTED_EFFECT
CLAIM_CONTROLLER_NO_PROTECTED_EFFECT

A lower claim cannot be silently presented as the higher one.

This extends claim-specific TCB and evidence semantics.

## 25. Scope closure levels

Candidate levels:

S0 UNKNOWN
S1 OBSERVED
S2 DECLARED
S3 CONTRACT_BOUNDED
S4 ENFORCEMENT_BOUNDED
S5 CLAIM_VERIFIED

A system can have a large amount of telemetry while remaining S1.

A small but strongly enforced boundary may reach S4/S5 for a particular claim without enumerating the whole world.

## 26. Effect-path closure certificate

Candidate object:

EffectPathClosureCertificate {
  closure_id
  claim_id
  effect_id
  boundary_set
  covered_paths
  excluded_paths
  unknown_paths
  environment_assumptions
  capability/delegation closure
  topology_version
  dependency_graph_version
  resource_incarnations
  authority_epoch
  policy/invariant versions
  boundary_enforcement_evidence
  completeness_method
  claim_strength
  invalidation_triggers
}

Certificate is evidence/context, not authority.

## 27. Boundary graph

Candidate graph:

Nodes:
- effect sources;
- queues;
- workers;
- providers;
- resources;
- capability issuers;
- delegation domains;
- boundaries.

Edges:
- CAN_INVOKE;
- CAN_DELEGATE;
- CAN_QUEUE;
- CAN_CALLBACK;
- CAN_RETRY;
- CAN_REDRIVE;
- CAN_FAILOVER;
- CAN_AUTONOMOUSLY_ACT;
- SHARES_RESOURCE;
- SHARES_TRUST;
- BYPASSES.

A strong claim requires closure over all edges relevant to the claim.

## 28. Open-world impossibility boundary

A key architectural principle:

Nexo should never attempt to prove:

"Nothing anywhere in the world can produce effect X"

unless it owns or has a verified boundary over every path relevant to X.

Instead it should prove:

"Within defined claim scope and under explicit environment assumptions, every relevant path is covered by these enforcement boundaries."

This is both more rigorous and more implementable.

## 29. Interaction with absorbing states

An absorbing state can solve the open-world problem only if it creates an enforceable boundary that blocks every relevant future effect.

If the environment remains capable of bypassing that boundary:

ABSORPTION_CLAIM = INVALID/DEGRADED.

Thus:

ABSORBING_STATE + BOUNDARY_COMPLETENESS

is the stronger construction.

## 30. Interaction with coordination domain

CCD can now be defined relative to the boundary graph.

If an unknown internal provider cannot escape a boundary, it may not need to join the same coordination domain.

If it can escape, its domain becomes relevant.

Therefore:

CCD depends on EFFECT_BOUNDARY topology.

This can reduce coordination without assuming global observability.

## 31. Interaction with TCB

The enforcement boundary becomes part of the TCB for claims relying on it.

TCB should include:
- boundary implementation;
- resource enforcement;
- capability validation;
- fence state;
- identity;
- continuity;
- configuration;
- update path;
- dependency closure;
- recovery path.

If any component changes, claim assurance may need revalidation.

## 32. Open-world recovery rule

During recovery:

If current effect-path closure is not established, recovery cannot publish a strong global claim.

It may still establish a bounded local claim by fencing known paths, provided the claim explicitly excludes unknown external paths.

This is important:

UNKNOWN_WORLD does not necessarily force all safety actions to stop.

It forces the claim to be honest about what is actually bounded.

## 33. Candidate invariants

INV-OPEN-01:
UNKNOWN_PATH != NO_PATH.

INV-OPEN-02:
Global effect-path completeness requires either world closure, boundary closure, or explicit environment assumptions.

INV-OPEN-03:
Observation does not establish enforcement.

INV-OPEN-04:
Authorization does not establish enforcement.

INV-OPEN-05:
An effect boundary must reject/prohibit relevant effects, not merely observe them.

INV-OPEN-06:
Every bypass path capable of violating a claim must be covered or the strong claim is invalid.

INV-OPEN-07:
Capability delegation expands effect-path closure.

INV-OPEN-08:
Unbounded delegation prevents finite closure unless a boundary terminates the delegation chain.

INV-OPEN-09:
Dynamic provider discovery cannot silently expand authority.

INV-OPEN-10:
Break-glass paths are inside the effect-path closure.

INV-OPEN-11:
Human approval is not technical enforcement.

INV-OPEN-12:
Provider session termination is not proof of effect termination.

INV-OPEN-13:
Resource replacement requires boundary re-establishment.

INV-OPEN-14:
A claim cannot exceed the strength of its environment assumptions.

INV-OPEN-15:
Boundary completeness is claim-specific.

INV-OPEN-16:
EffectPathClosureCertificate is evidence/context, not authority.

INV-OPEN-17:
An unknown external path may force claim degradation without forcing unsafe continued execution.

INV-OPEN-18:
Absorption requires boundary completeness for the protected future-effect claim.

INV-OPEN-19:
CCD may exclude internally unknown providers only when their effect paths are contained by an enforceable boundary.

INV-OPEN-20:
Boundary/TCB changes invalidate dependent assurance.

## 34. Formal model extension

The finite TLC model should add:

EnvironmentMode =
  {Closed, BoundaryBounded, Assumed, Unknown}

BoundaryState =
  {Absent, Declared, Enforced, Verified, Invalid}

PathState =
  {Known, Unknown, Blocked, Allowed}

DelegationDepth =
  {0,1,2,...,Bound}

ProviderIncarnation =
  {P1,P2}

Bypass =
  {false,true}

ClaimStrength =
  {Local,Resource,Boundary,Global}

Safety invariant candidate:

NoStrongClaimWithoutBoundaryCoverage

For every published claim C:
if ClaimStrength(C) >= Boundary
then every path capable of violating C is either covered by a verified boundary or explicitly included in a valid environment assumption.

## 35. Refinement

L0:
Claim + environment assumption + boundary closure.

L1:
Boundary graph + capability/delegation + resource fences + scope.

L2:
Actual APIs, queues, processes, provider adapters, resource controls.

A refinement proof must demonstrate that every L2 effect capable of violating L0 is represented by an L1 path and crosses the corresponding enforcement boundary.

This follows the assume/guarantee/open-system and refinement framing in TLA+. citeturn0search24turn0search11

## 36. Major result

The open-world attack changes the architecture in one important way:

Nexo should NOT attempt universal environmental omniscience.

Instead:

PROTECTED CLAIM
→ EFFECT-PATH CLOSURE
→ BOUNDARY COVERAGE
→ ENVIRONMENT ASSUMPTIONS
→ TCB/DEPENDENCY CLOSURE
→ CLAIM STRENGTH

If the boundary cannot be proven complete:
strong claim is unavailable.

This is safer and more scalable than trying to enumerate every possible external actor.

## 37. Distillation

CARRY_FORWARD:
- UNKNOWN_PATH != NO_PATH.
- Boundary completeness.
- EffectPathClosure.
- Explicit environment assumptions.
- Capability/delegation closure.
- Break-glass inclusion.
- Human approval != enforcement.
- Provider session != effect termination.
- Claim-strength degradation.
- Boundary-specific TCB.

REWORK:
- EffectPathClosureCertificate.
- Boundary graph schema.
- Environment contract levels.
- Claim strength model.
- Open-world finite TLC abstraction.

REJECTED:
- Global omniscience as architecture.
- Telemetry as complete closure.
- SBOM as runtime effect-path proof.
- API session closure as effect termination.
- Undocumented break-glass paths.
- "No observed path" => "no path".

OPEN:
- Formal proof of boundary-closure theorem.
- Completeness of bypass enumeration.
- Dynamic capability delegation.
- Provider-specific autonomous behavior.
- TLC/SANY.
- Runtime boundary enforcement.

## 38. Next attack

Next research target:

**BOUNDARY BYPASS / AMBIENT AUTHORITY / CAPABILITY ESCAPE**

Attack the strongest remaining assumption: even if Nexo has a declared effect boundary, can an actor/resource/provider reach the protected world through ambient authority, alternate APIs, inherited credentials, side channels, privileged administrators, shared infrastructure, or stale capabilities?

The question is whether the boundary can be made genuinely NON-BYPASSABLE for the claim.

Gate remains:
NO V21 IMPLEMENTATION.
NO RUNTIME CORRECTNESS CLAIM.
NO FORMAL VERIFICATION CLAIM.

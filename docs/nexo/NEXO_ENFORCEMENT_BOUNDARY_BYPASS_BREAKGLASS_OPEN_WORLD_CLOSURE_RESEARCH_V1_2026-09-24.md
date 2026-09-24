# NEXO - ENFORCEMENT BOUNDARY BYPASS / BREAK-GLASS / OPEN-WORLD CLOSURE RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can Nexo prove a finite closure of every path capable of bypassing an enforcement boundary, including break-glass, maintenance, update, recovery, physical access and open-world providers? Or must strong claims always be explicitly bounded to an enforceable boundary and declared assumptions?

## External cross-checks

NIST SP 800-193 treats protection, detection and recovery as distinct resiliency functions and emphasizes Roots/Chains of Trust. It also notes that security functionality may be provided by another device, creating a critical trust relationship. This supports making the trust and enforcement chain explicit rather than treating the controller as the whole boundary. citeturn0search36

NIST Zero Trust Architecture distinguishes the Policy Decision Point from the Policy Enforcement Point; the PEP is the location where the access decision is actually enforced against the protected resource. This is a useful architectural analogue for Nexo's distinction between authorization and enforcement. citeturn0search37turn0search13

Lamport's open-system treatment makes the environment an explicit part of the specification: a system guarantee is meaningful only relative to assumptions about the environment. An unrestricted arbitrary environment cannot be silently assumed to behave correctly. citeturn0search38turn0search4

## Core result

A universal finite closure of every possible external bypass path is generally unavailable in an open world.

The architecture therefore needs three distinct modes:

1. CLOSED / ENFORCED WORLD
2. BOUNDED OPEN WORLD
3. UNKNOWN OPEN WORLD

Strong claims require either a closed/enforced world, a bounded environment contract with complete boundary coverage, or an explicitly restricted claim.

Therefore:

UNKNOWN_BYPASS != NO_BYPASS

and:

UNOBSERVED_PATH != INACTIVE_PATH.

## New concept: Boundary Closure

Candidate:

BoundaryClosure(E,C)

contains every path that can create, modify, cancel, retry, redrive, compensate, delegate, bypass, update, recover, or otherwise influence protected effect E with respect to claim C.

A path is acceptable for strong closure if it is:
- inside the authoritative effect boundary;
- forced through an enforceable PEP-like mechanism;
- proven unable to affect the claim;
- covered by an explicit environment assumption;
- or rendered harmless by a verified absorbing state.

Otherwise closure is UNKNOWN.

## Four path classes

Every discovered path should be classified:

P0 ENFORCED
P1 BOUNDED_BY_CONTRACT
P2 PROVEN_IRRELEVANT
P3 UNKNOWN/BYPASS

Strong claim requires no unresolved P3 path capable of violating the claim.

## Break-glass

Break-glass is not an exception outside the model.

It is an additional effect path.

Therefore:

BREAK_GLASS ∈ EFFECT_PATH_CLOSURE.

A break-glass mechanism needs its own:
- authority;
- effect class;
- target;
- scope;
- fence;
- expiry;
- identity;
- audit;
- reconciliation;
- failure-domain closure;
- bypass closure;
- update/recovery semantics.

Human approval is not equivalent to technical enforcement. Approval can authorize an action, but the protected resource still needs a mechanism that enforces the resulting decision.

## Maintenance path

Physical or administrative maintenance can bypass ordinary software controls.

Examples conceptually:
- direct console;
- firmware maintenance;
- service account;
- debug port;
- emergency controller;
- manual actuator;
- direct provider credentials;
- alternate API;
- out-of-band management.

If any such path can produce the protected effect, it belongs in the claim's boundary closure.

If it cannot be enumerated or bounded:

GLOBAL_PREVENTION_CLAIM = INVALID/UNKNOWN.

The architecture should instead publish a bounded claim such as:

NO_EFFECT_THROUGH_DECLARED_ENFORCEMENT_DOMAIN.

## Update path

Update is itself an effect path because an update can alter:
- policy;
- authority;
- enforcement;
- queue behavior;
- retry semantics;
- provider identity;
- resource acceptance;
- bypass behavior.

Therefore:

UPDATE_PATH ∈ BOUNDARY_CLOSURE.

NIST SP 800-193 explicitly separates the Root of Trust for Update from detection and recovery functions, illustrating why update authority must be modeled as a security-relevant trust dependency rather than an ordinary deployment event. citeturn0search36

Candidate rule:

UPDATE_CHANGE_RELEVANT_TO_ENFORCEMENT → INVALIDATE_DEPENDENT_ENFORCEMENT_CLAIMS.

## Recovery path

Recovery cannot be treated as outside the enforcement boundary.

A recovery actor may possess capabilities that normal execution does not.

Therefore:

RECOVERY_PATH ∈ BOUNDARY_CLOSURE.

Recovery must not be able to use a stale checkpoint to recreate historical authority.

RESTORE != REAUTHORIZATION.

## Physical bypass

A physical path can be outside software enumeration.

This creates an explicit limit:

If the claim is “nothing can actuate resource R”, but an unmodeled physical maintenance path can actuate R, the universal claim is not established.

The correct claim must either:
- include the physical path in the enforcement model;
- impose a physical/environment assumption;
- physically isolate the resource;
- or weaken the claim.

## Open-world modes

### CLOSED_WORLD

All relevant effect paths are known and enforceable.

Strongest claim class is potentially available, subject to verification.

### BOUNDARY_WORLD

The internal world may be open, but every claim-relevant path is required to cross an enforceable boundary.

This is the preferred scalable model.

The proof target becomes:

ALL_VIOLATING_PATHS_CROSS_BOUNDARY_B.

No need to enumerate every irrelevant external behavior.

### ASSUMED_WORLD

Some paths are not enforced but are governed by explicit assumptions.

Claims are conditional:

ASSUMPTION_A → GUARANTEE_G.

The assumption must be declared, versioned, dependency-bound and invalidated when its basis changes.

### UNKNOWN_WORLD

Relevant paths cannot be bounded, enforced or safely assumed.

Strong global claims are unavailable.

## Boundary bypass theorem candidate

Not formally proven:

If every behavior capable of violating claim C must cross at least one boundary in set B, and each boundary in B is currently enforced for C, then complete enumeration of all external behaviors is unnecessary for C.

Required premises:
- effect-path closure is sound for the claim;
- boundary coverage is complete;
- each boundary actually enforces the required property;
- bypass paths are covered;
- boundary dependencies are current;
- resource incarnations are current;
- environment assumptions are explicit;
- recovery/update/break-glass paths are included;
- no hidden delegation path escapes the boundary.

This is a claim-specific theorem, not universal environmental control.

## Boundary composition

One boundary may not be enough.

Example:

Nexo admission → provider → queue → worker → resource.

If only the Nexo admission is fenced, a queued request may bypass the intended safety condition.

Therefore the composed boundary must cover the whole protected effect path.

Candidate:

BoundarySet(C,E) = {B1, B2, ..., Bn}

and:

COVERAGE(C,E) = every violating path crosses at least one B_i.

## Bypass graph

New candidate graph:

EFFECT → PATH → COMPONENT → BOUNDARY → ENFORCEMENT → RESOURCE.

Additional edge types:
- BYPASSES;
- DELEGATES_TO;
- REQUEUES;
- RETRIES;
- REDRIVES;
- COMPENSATES;
- UPDATES;
- RECOVERS;
- MAINTAINS;
- ESCALATES.

The graph is not merely dependency metadata. It becomes part of the safety claim's closure.

## Delegation

Delegation is a closure-expansion operation.

If A can delegate capability to B and B can delegate to C:

A → B → C.

Without a bounded delegation depth or terminating enforcement boundary:

FINITE_CLOSURE cannot be assumed.

Candidate rule:

UNBOUNDED_DELEGATION + NO_TERMINATING_BOUNDARY → STRONG_CLAIM_UNAVAILABLE.

## Human authority

Human approval can be part of authorization.

But:

HUMAN_APPROVAL != TECHNICAL_ENFORCEMENT.

A human may approve an operation; the protected resource still needs a mechanism that accepts/rejects the operation according to the current protected context.

## Emergency maintenance

Emergency maintenance must be treated as an effect class.

It cannot simply bypass all safety gates.

Candidate contract:

BreakGlassEffectContract.

Required:
- named authority;
- exact scope;
- explicit effect class;
- current identity;
- bounded lifetime;
- current fence;
- resource incarnation;
- policy/invariant compatibility;
- dependency closure;
- audit;
- reconciliation;
- post-action verification;
- automatic invalidation;
- no unrestricted delegation.

## Boundary continuity

A boundary can survive while its context becomes stale.

Therefore:

BOUNDARY_PRESENT != BOUNDARY_CURRENT.

Similarly:

BOUNDARY_AUTHENTIC != BOUNDARY_ENFORCING.

Update, restore, resource replacement, policy changes and trust-root changes can invalidate boundary claims.

## Boundary failure

States:

BOUNDARY_CURRENT
BOUNDARY_DEGRADED
BOUNDARY_UNKNOWN
BOUNDARY_BYPASSED
BOUNDARY_LOST
BOUNDARY_REESTABLISHING

Transitions toward LOST/BYPASSED must invalidate dependent strong claims.

## Candidate claim levels

CLAIM_LOCAL
CLAIM_PROVIDER
CLAIM_RESOURCE
CLAIM_BOUNDARY
CLAIM_MISSION
CLAIM_GLOBAL

The claim may never exceed the closure and enforcement actually established.

## Formal implication

The clean formal model should not attempt to model the entire universe.

Instead:

SYSTEM_SPEC + ENVIRONMENT_ASSUMPTIONS + BOUNDARY_CONTRACT

defines the exact claim domain.

This matches the open-system framing in TLA+: the environment is part of the specification contract rather than an invisible assumption. citeturn0search38turn0search4

## Candidate invariants INV-BC-01..40

01 UNKNOWN_BYPASS is not NO_BYPASS.
02 UNOBSERVED_PATH is not INACTIVE_PATH.
03 Break-glass is an effect path.
04 Recovery is an effect path.
05 Update is an effect path.
06 Maintenance is an effect path.
07 Delegation expands effect-path closure.
08 Unbounded delegation prevents finite closure without a terminating boundary.
09 Human approval is not technical enforcement.
10 Authorization is not enforcement.
11 Observation is not enforcement.
12 Boundary presence is not boundary currentness.
13 Boundary authenticity is not boundary enforcement.
14 Every strong claim needs complete claim-relevant boundary coverage.
15 A bypass-capable path outside closure invalidates the strong claim.
16 Physical paths require explicit inclusion or environmental assumption.
17 Provider queues are part of closure when they can produce protected effects.
18 Autonomous workers are part of closure.
19 Child effects are part of closure.
20 Retry/redrive paths are part of closure.
21 Compensation paths are part of closure.
22 Update paths can invalidate boundary claims.
23 Recovery paths can invalidate boundary claims.
24 Resource replacement invalidates old boundary assumptions.
25 Continuity changes invalidate dependent boundary claims.
26 Trust-root changes invalidate dependent boundary claims.
27 Boundary dependencies need failure-domain closure.
28 Multiple boundaries require path-coverage composition.
29 A boundary set is claim-specific.
30 Bounded environment assumptions must be explicit and versioned.
31 Assumption changes trigger invalidation.
32 Unknown environment cannot support universal claims.
33 Closed-world claims require actual closure evidence.
34 Boundary-world claims require boundary completeness.
35 Safe absorbing state can terminate closure only if it itself is enforced.
36 Scope reduction requires proof that omitted paths cannot violate the claim.
37 Break-glass cannot silently enlarge authority.
38 Recovery cannot silently restore historical authority.
39 Strong claims must not exceed enforcement scope.
40 Safe non-convergence/quarantine is valid when closure cannot be established.

## New objects

### BoundaryClosure

Candidate fields:
- closure_id;
- claim_id;
- effect_id/effect class;
- included paths;
- excluded paths;
- boundary set;
- bypass set;
- delegation closure;
- update/recovery/maintenance closure;
- environment assumptions;
- resource incarnations;
- dependency closure;
- completeness status;
- currentness;
- computation evidence;
- invalidation triggers.

### BreakGlassEffectContract

Candidate fields:
- contract_id;
- authority;
- effect class;
- scope;
- lifetime;
- fence;
- resource incarnation;
- policy/invariant versions;
- dependency closure;
- audit;
- reconciliation;
- post-action verification;
- invalidation/revocation;
- delegation limits.

### EnvironmentContract

Candidate fields:
- environment_id;
- mode;
- assumptions;
- covered boundaries;
- excluded behavior;
- dependency closure;
- failure-domain closure;
- continuity context;
- validity period/generation;
- invalidation conditions.

## Architectural consequence

The enforcement boundary is not a single wall.

It is a claim-specific closure:

EFFECT
→ PATH CLOSURE
→ BOUNDARY SET
→ ENFORCEMENT
→ RESOURCE
→ WORLD

and, in open systems:

ENVIRONMENT ASSUMPTIONS

must be attached explicitly.

This produces a clean rule:

Nexo does not need omniscience. Nexo needs complete coverage of every path relevant to the claim.

## Strong conclusion

The architecture should never claim:

“Nothing anywhere can produce X.”

Instead it should state:

“Within claim C, every relevant path capable of producing X is covered by boundary set B, under environment assumptions A, with enforcement state E and current continuity context K.”

If that statement cannot be constructed and verified:

STRONG_CLAIM = UNKNOWN / UNAVAILABLE.

This is more precise than trying to make Nexo omnipotent.

## Next attack

BOUNDARY CLOSURE COMPLETENESS + DYNAMIC DISCOVERY + PROVIDER PLUGINS + UNBOUNDED DELEGATION + BOUNDARY UPDATE

Question: can Nexo safely allow dynamic plugins/providers and capability delegation without letting the effect-path closure expand after admission, or must every dynamic expansion become a protected scope-widening transition?
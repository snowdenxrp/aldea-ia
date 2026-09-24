# NEXO - ENFORCEMENT BOUNDARY / CONTROL LIMIT / SOFTWARE-ONLY SAFETY LIMIT RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

If arbitration is unavailable and an independent fence is also unavailable or uncertain while a stale authority may still reach an active resource, can software inside Nexo honestly guarantee that the external protected effect will not occur?

## External cross-checks

NIST SP 800-193 separates protection, detection and recovery and describes Roots of Trust as foundations that extend trust into mechanisms implementing those functions. It also notes that a device may rely on another device for security functionality, creating a critical trust relationship. This supports treating the actual enforcement boundary as a distinct architectural dependency rather than assuming controller state is itself enforcement. citeturn0search26turn0search0

TLA+ defines safety as a property where a violation is observable in a finite behavior prefix, while liveness concerns eventual progress. This permits a formal specification to stop granting progress in order to preserve safety. citeturn0search24turn0search1

TLA+ also emphasizes that checked properties are properties of the modeled behaviors. Therefore a safety claim about an external resource cannot silently exceed the model's boundary or its assumptions about that resource. citeturn0search4turn0search13

## Core result

There is a hard architectural limit.

If Nexo has neither:
1. current authority capable of changing the resource state; nor
2. an independently enforceable boundary that rejects the forbidden effect;

then Nexo cannot honestly guarantee that the external effect will not occur merely by changing its own internal state.

Therefore:

CONTROLLED_LOCAL_STATE != EXTERNAL_EFFECT_PREVENTION

and:

NO_LOCAL_EXECUTION != NO_EXTERNAL_EFFECT.

This is not a failure of the architecture. It is an explicit enforcement boundary.

## New concept: Enforcement Boundary

Candidate definition:

EnforcementBoundary(C,E) is the last claim-relevant mechanism that can causally prevent, reject, isolate, or make impossible the protected external effect E required by claim C.

Possible boundaries:
- Nexo admission;
- capability validator;
- queue gate;
- provider API;
- provider-side idempotency/fence;
- resource controller;
- resource firmware;
- hardware interlock;
- physical isolation.

The mechanism is effect-class specific.

## Critical separation

AUTHORITY answers whether Nexo may request an effect.

ENFORCEMENT answers whether the effect can actually be prevented/rejected.

OBSERVATION answers what is observed.

RECONCILIATION answers what can be established about what happened.

None substitutes for another.

## Four boundary positions

### B0: Nexo-only boundary

Nexo can stop its own submissions.

But an already-issued capability, queue, provider retry, child process or autonomous resource can continue.

Therefore B0 cannot support a strong global no-effect claim unless effect-path closure proves no external continuation exists.

### B1: Provider boundary

Provider rejects stale or revoked effects.

This can support stronger claims, but only within the provider contract and failure assumptions.

### B2: Resource boundary

The resource itself rejects stale authority/fence generations.

This is stronger for resource-side enforcement because the final protected target participates in rejection.

### B3: Physical / hardware boundary

A mechanism physically prevents the effect.

This may provide a stronger last-resort boundary, but it still requires analysis of continuity, update, recovery and bypass paths.

These labels are Nexo architectural categories, not standards.

## New rule: Claim cannot exceed enforcement boundary

Candidate invariant:

CLAIM_SCOPE <= ENFORCEMENT_SCOPE

If a claim says “no protected effect can occur anywhere” but architecture only controls “no new request leaves Nexo”, the claim is invalid.

Correct downgrade:

NEXO_LOCAL_EXECUTION_BLOCKED

rather than:

EXTERNAL_EFFECT_IMPOSSIBLE.

## Enforcement boundary versus observation point

An observer may report resource_state = safe.

That does not mean the observer can prevent the next unsafe command.

Therefore:

OBSERVATION_POINT != ENFORCEMENT_BOUNDARY.

Likewise:

AUTHORIZATION_POINT != ENFORCEMENT_BOUNDARY

unless the same mechanism actually rejects unauthorized effects.

## Enforcement boundary versus effect boundary

EffectBoundary = every path capable of producing the protected effect must cross here.

EnforcementBoundary = the boundary can actually prevent/reject that effect under the claim.

An effect boundary without enforcement is observation/coordination only.

For strong claims:

EFFECT_PATH_CLOSURE -> ENFORCEMENT_BOUNDARY.

## Impossible-control case

Assume:
- A has stale authority;
- B is intended current authority;
- arbitration is unavailable;
- resource is active;
- resource fence is unavailable;
- provider can continue queued work;
- network partition prevents reaching resource;
- Nexo cannot physically isolate resource.

Nexo can:
- STOP LOCAL PROCESS;
- BLOCK LOCAL ADMISSION;
- PRESERVE HISTORY;
- RECORD UNKNOWN.

But it cannot honestly conclude:

RESOURCE WILL NOT ACT.

Correct state:

EXTERNAL_EFFECT_CONTROL = UNKNOWN / UNAVAILABLE.

If the claim requires prevention:

STRONG SAFETY CLAIM = NOT ESTABLISHED.

## Why this is not merely epistemic uncertainty

There are two different cases.

### Epistemic uncertainty

Nexo does not know whether the resource is safe, but an enforceable boundary exists and can guarantee future rejection.

Example:

resource fence current but observation unavailable.

Future safety may remain provable while historical knowledge is UNKNOWN.

### Enforcement absence

No mechanism capable of rejecting the effect exists.

Example:

resource accepts stale capability and cannot be isolated.

This is not merely “we do not know.”

The architecture lacks causal control.

Therefore introduce:

CONTROL_UNAVAILABLE

separate from:

WORLD_UNKNOWN.

## New state dimensions

Do not collapse these into one boolean:

AUTHORITY_STATE
ENFORCEMENT_STATE
OBSERVATION_STATE
WORLD_EFFECT_STATE
RECONCILIATION_STATE

Example:

AUTHORITY = REVOKED
ENFORCEMENT = UNKNOWN
OBSERVATION = LOST
WORLD_EFFECT = UNKNOWN
RECONCILIATION = BLOCKED

This is a valid state.

## Control-loss taxonomy

Candidate:
C0 CONTROLLED
C1 CONTROL_DEGRADED
C2 ENFORCEMENT_DEGRADED
C3 ENFORCEMENT_UNKNOWN
C4 CONTROL_UNAVAILABLE
C5 UNBOUNDED_EXTERNAL_EFFECT_RISK

Transition toward C4/C5 must never silently remain represented as normal execution.

## What Nexo can still guarantee

Even when external enforcement is unavailable, Nexo may establish narrower properties:
- no new local admission;
- no new local authority;
- historical record preserved;
- stale local credentials invalidated;
- recovery blocked;
- claims downgraded;
- reconciliation required;
- local process quarantined.

These are control-plane claims, not world-effect claims.

## What Nexo cannot infer

From local STOP alone: NO_EXTERNAL_EFFECT.

From missing log: NO_EFFECT.

From unreachable resource: RESOURCE_STOPPED.

From revoked local authority: REMOTE_AUTHORITY_REJECTED.

From stale observation: CURRENT_WORLD_STATE.

From process termination: PROVIDER_TERMINATED.

From network partition: REMOTE_QUIESCENCE.

All require the relevant enforcement contract to prove them.

## Safety under loss of control

Candidate principle:

WHEN CONTROL IS LOST, REDUCE THE CLAIM BEFORE REDUCING THE EVIDENCE STANDARD.

Do not solve an enforcement failure by relaxing evidence.

Instead:

STRONG CLAIM -> WEAKER CLAIM -> UNKNOWN

while preserving historical facts.

## Claim lattice

Candidate:

GLOBAL_EXTERNAL_PREVENTION
↓
BOUNDARY_PREVENTION
↓
RESOURCE_PREVENTION
↓
PROVIDER_PREVENTION
↓
NEXO_EXECUTION_PREVENTION
↓
OBSERVATION_ONLY
↓
UNKNOWN

Promotion requires actual enforcement refinement, not confidence.

A lower claim must never silently grant authority appropriate only to a higher claim.

## Safe response to enforcement loss

Candidate sequence:

DETECT_ENFORCEMENT_LOSS
→ AUTHORITATIVE_CUTOFF
→ BLOCK_NEW_LOCAL_EFFECTS
→ INVALIDATE_STALE_RELEASE
→ QUARANTINE_UNFENCED_TARGETS
→ PRESERVE_HISTORY
→ CLASSIFY_WORLD_UNKNOWN
→ REESTABLISH_ENFORCEMENT
→ RECONCILE
→ REVALIDATE
→ EXPLICIT_RELEASE

If re-establishment is impossible:

PERMANENT_OR_REVIEWABLE_QUARANTINE

may be the only honest state for that claim.

## Software-only guarantee boundary

Candidate theorem, not formally proven:

If a protected effect can occur through a path that does not cross any currently enforceable mechanism under Nexo's authority and assumptions, then Nexo cannot prove a universal prevention claim for that effect solely from internal control state.

This is an architectural boundary theorem, not a theorem that all real systems are uncontrollable.

## Implication for formal modeling

The formal model must include the external boundary explicitly.

If the model contains only NexoAdmission and omits ProviderQueue, ResourceAcceptance, ResourceFence, AutonomousContinuation, or Bypass, then a proof of “no effect after STOP” could simply be proving a property of an incomplete model.

TLA+ checks properties over represented behaviors; boundary assumptions and omitted external behaviors must therefore be explicit. citeturn0search4turn0search13

## Candidate invariants INV-EB-01..36

01 Local state change is not external prevention.
02 Local STOP is not remote cancellation.
03 No local submission is not no external effect.
04 Authority revocation is not resource rejection.
05 Observation is not enforcement.
06 Authorization is not enforcement unless the authorization point rejects the effect.
07 Effect-path closure must reach an enforceable boundary for strong prevention claims.
08 Claim scope cannot exceed enforcement scope.
09 Unknown enforcement is not enforcement.
10 Missing observation does not prove missing effect.
11 Unreachable resource does not prove stopped resource.
12 Provider termination does not prove downstream termination.
13 Network partition does not prove quiescence.
14 Process termination does not prove provider termination.
15 Enforcement absence differs from epistemic uncertainty.
16 CONTROL_UNAVAILABLE differs from WORLD_UNKNOWN.
17 Control claims and world claims must remain separate.
18 Enforcement boundaries require failure-domain closure.
19 Enforcement boundaries require bypass closure.
20 Enforcement boundaries require continuity semantics.
21 Resource replacement invalidates old enforcement assumptions.
22 Restore can regress enforcement state.
23 Update can alter enforcement semantics.
24 Recovery can invalidate enforcement context.
25 External queues belong to effect-path closure.
26 Autonomous continuations belong to effect-path closure.
27 Child effects belong to effect-path closure.
28 Break-glass cannot bypass required enforcement.
29 Lower claims cannot silently grant higher authority.
30 Claim promotion requires enforcement refinement.
31 Loss of enforcement invalidates dependent strong claims.
32 Evidence standards must not be weakened to hide control loss.
33 Permanent quarantine can be a valid safety state.
34 Strong prevention claims require actual causal control.
35 Formal models must represent or explicitly assume external enforcement.
36 No software-only claim may exceed the modeled and enforceable boundary.

## Candidate object: EnforcementBoundary

Fields:
- boundary_id;
- claim_id;
- effect classes;
- protected target;
- boundary type;
- enforcement mechanism;
- current generation;
- resource incarnation;
- authority dependency;
- continuity dependency;
- provider contract;
- queue/child closure;
- bypass closure;
- failure-domain closure;
- crash semantics;
- restore semantics;
- update semantics;
- partition semantics;
- enforcement evidence;
- verification method;
- claim strength;
- invalidation triggers.

## Architectural consequence

A new explicit object/plane is required:

ENFORCEMENT BOUNDARY / CONTROL LIMIT

It sits between the authoritative core and the external world.

Nexo must be able to state:

“Here is the last point at which Nexo can causally prevent the protected effect.”

Beyond that point:

- external contract;
- reconciliation;
- evidence;
- assumptions;
- uncertainty

govern what can be claimed.

## Strong conclusion

NEXO_CONTROL != WORLD_CONTROL

Nexo can have strong internal authority semantics.

It cannot manufacture external causal control where no enforceable boundary exists.

When the boundary disappears:

FAIL CLOSED
+
DOWNGRADE CLAIM
+
PRESERVE EVIDENCE
+
QUARANTINE
+
RECONCILE WHEN POSSIBLE.

## Next attack

ENFORCEMENT BOUNDARY + BYPASS PATH + HUMAN/BREAK-GLASS + PHYSICAL RESOURCE + UPDATE/RECOVERY

Question: can every path that can bypass the declared enforcement boundary itself be included in a finite closure, or do open-world, break-glass and physical-maintenance paths force Nexo to define a bounded claim instead of a universal safety claim?
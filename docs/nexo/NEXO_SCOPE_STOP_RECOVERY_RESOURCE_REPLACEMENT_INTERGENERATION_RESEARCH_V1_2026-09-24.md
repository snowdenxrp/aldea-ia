# NEXO - SCOPE CUTOVER / INVALIDATION / STOP / RECOVERY INTERSECTION RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can a capability valid under scope S1 safely survive simultaneous scope transition, invalidation, STOP, recovery, resource replacement and provider retry/redrive?

## External cross-check

Kubernetes rejects stale writes when a client supplies an old resourceVersion, illustrating that current coordination state must be checked at the authoritative write point rather than inferred from cached state. cite: turn0search0, turn0search1.

TLA+ models concurrent behavior as state transitions and supports refinement mappings between implementation and higher-level specifications; therefore these races should be represented as explicit transitions and mapped to abstract safety state rather than treated as incidental events. cite: turn0search5, turn0search24.

## Core result

A capability cannot survive a material context intersection merely because its original scope is still syntactically recognizable.

Material changes include:
- scope cutover;
- invalidation generation;
- STOP generation;
- recovery generation;
- resource incarnation;
- provider incarnation;
- boundary generation;
- policy/invariant change;
- effect-path change.

Candidate principle:

MATERIAL_CONTEXT_CHANGE
→ CONTINUATION_REVALIDATION

If compatibility is not established:

HOLD / FENCE / QUARANTINE / NEW_PROTECTED_ADMISSION.

## Canonical scenario

E1 starts under S1.

Then:

S1 -> S2 scope widening
+
D1 invalidates an assumption
+
STOP is requested
+
resource R1 is replaced by R2
+
provider P1 retries an old attempt
+
Nexo crashes
+
recovery begins.

The old capability may still physically exist in:
- worker memory;
- queues;
- provider retries;
- cached credentials;
- delayed callbacks;
- resource controllers;
- snapshots;
- delegated capabilities.

Therefore revocation must cover the complete effect path, not just the local capability registry.

## New separation

The following must remain distinct:

SCOPE_IDENTITY
AUTHORITY_IDENTITY
STOP_CONTEXT
RECOVERY_CONTEXT
RESOURCE_INCARNATION
PROVIDER_INCARNATION
BOUNDARY_GENERATION
EFFECT_IDENTITY
ATTEMPT_IDENTITY.

A capability is valid only as a relation across these contexts, not as an isolated token.

## STOP interaction

STOP does not automatically classify old effects.

If E1 is already in flight:

STOP
→ blocks/fences future protected effects where enforcement exists
→ preserves uncertainty about historical external effects
→ invalidates release eligibility
→ requires reconciliation.

It does not mean:

STOP → E1 never happened.

## Scope transition during STOP

Suppose S1 -> S2 is prepared while STOP is active.

S2 must not become executable merely because the scope transition commits.

Candidate rule:

STOP_ACTIVE
→ NEW_SCOPE_EXECUTION_BLOCKED

unless the explicit STOP policy for that effect class authorizes a safety-only action.

Examples that may remain admissible under a STOP state, depending on claim and policy:
- fencing;
- isolation;
- reconciliation;
- safety-preserving absorption;
- decommission;
- evidence preservation.

These are not ordinary mission execution.

## Invalidation interaction

If a dependency used by S1 is invalidated while S2 is being prepared:

S2 cannot inherit S1's proof automatically.

The widening must recompute:
- dependency closure;
- proof context;
- effect-path closure;
- mission impact;
- boundary coverage;
- current authority.

Thus:

SCOPE_WIDENING != ASSURANCE_INHERITANCE.

## Resource replacement

R1 -> R2 is a new incarnation unless explicit transfer semantics prove continuity.

An S1 capability bound to R1 cannot silently act on R2.

Even if:
- same resource name;
- same hardware model;
- same configuration;
- same bytes;
- same logical identifier.

The new incarnation must establish:
- current identity;
- boundary;
- fence;
- effect contract;
- reconciliation state;
- compatibility.

## Provider retry/redrive

An old provider retry is a new execution attempt even when the logical effect_id remains the same.

Therefore:

SAME_EFFECT_ID != SAME_ATTEMPT.

And:

OLD_ATTEMPT != CURRENT_AUTHORITY.

A retry after scope cutover, STOP, invalidation or resource replacement must be evaluated against current context.

If provider retry cannot be fenced or identified:

UNKNOWN may remain unresolved.

## Recovery

Recovery cannot simply choose:

"Use S1 because that was before the crash."

or:

"Use S2 because that was being prepared."

It must reconstruct the protected ordering and external state.

Candidate:

RESTORE_HISTORICAL_BASELINE
→ CREATE_NEW_RECOVERY_CONTEXT
→ REPLAY_SCOPE/INVALIDATION_INTENTS
→ ESTABLISH_CURRENT_STOP
→ ESTABLISH_CURRENT_FENCES
→ IDENTIFY_RESOURCE/PROVIDER INCARNATIONS
→ FIND_IN_FLIGHT_ATTEMPTS
→ RECONCILE_EXTERNAL_EFFECTS
→ RECOMPUTE_SCOPE
→ REVALIDATE_PROOF/CLAIMS
→ EXPLICIT_RELEASE.

## Inter-generation continuation

An old effect E1 under S1 may continue under S2 only through an explicit compatibility decision.

Candidate ContinuationTransition(E1, S1 -> S2) requires:
- same logical effect identity;
- attempt identity;
- compatible semantics;
- current authority;
- current STOP/recovery state;
- current resource/provider incarnation;
- current boundary;
- current dependency closure;
- current mission invariant;
- safe interaction with new effects;
- uncertainty-safe continuation where historical outcome is unresolved.

If any required dimension is UNKNOWN:

no automatic continuation.

## Shared footprint

Suppose E1 under S1 is still active on R1.

S2 introduces E2 on the same physical footprint.

Even if E1 and E2 are individually safe:

INDIVIDUAL_SAFE(E1)
+
INDIVIDUAL_SAFE(E2)

does not establish:

JOINT_SAFE(E1,E2).

The system needs an interaction contract:

DISJOINT
COMMUTATIVE
ORDER_SENSITIVE
MUTUALLY_EXCLUSIVE
CONDITIONALLY_COMPATIBLE
CONFLICTING
UNKNOWN.

UNKNOWN => no strong joint admission.

## Compensation

If E1 is UNKNOWN and S2 introduces compensation C1, C1 is a new protected effect.

It cannot use the fact that E1 belongs to an old scope as permission to compensate.

The compensation must be safe across the remaining uncertainty set.

If it is safe only when E1 did not happen, while unsafe when E1 did happen:

C1 is not admissible under UNKNOWN.

## Stronger cutover model

The research now suggests three distinct boundaries:

1. SCOPE_AUTHORITY_CUTOFF
2. EFFECT_ADMISSION_CUTOFF
3. ENFORCEMENT_BOUNDARY

A scope can become authoritative while a particular effect class remains blocked.

This lets Nexo preserve safety without pretending that all transitions are globally atomic.

## Candidate SafetyReleaseContext

For any release following this intersection:
- current scope context;
- authority epoch;
- STOP context;
- recovery epoch;
- resource incarnations;
- provider incarnations;
- boundary generations;
- invalidation generation;
- effect/attempt identities;
- interaction closure;
- uncertainty set;
- required reconciliation;
- proof/assurance currentness;
- continuity anchor;
- protected release linearization.

Release eligibility is derived from this context, never stored as a free boolean.

## Candidate invariant family INV-SCRI-01..32

01 Material context changes invalidate incompatible continuation.
02 Scope cutover does not clear STOP.
03 STOP does not classify historical UNKNOWN.
04 Recovery does not restore historical authority.
05 Resource replacement invalidates old bindings.
06 Provider replacement invalidates old bindings.
07 Retry after context change requires current admission.
08 Same effect_id does not imply same attempt.
09 Old attempts cannot inherit new authority automatically.
10 Scope widening cannot inherit invalidated assurance.
11 New scope execution remains blocked while required STOP constraints apply.
12 Recovery replays invalidation before release.
13 Recovery re-establishes current fences.
14 Release requires current resource/provider incarnations.
15 Shared-footprint old/new effects require interaction analysis.
16 UNKNOWN interaction is not disjoint.
17 Compensation is a new protected effect.
18 Compensation under UNKNOWN requires branch-invariant safety.
19 Scope change does not prove historical effect outcome.
20 STOP does not prove external quiescence.
21 Fence activation does not prove historical completion.
22 Provider ACK does not automatically clear UNKNOWN.
23 Reconciliation must be bound to current incarnation/context.
24 Stale retry must be rejected at the relevant boundary.
25 Queue/child/retry paths belong to revocation closure.
26 Snapshot restore cannot recreate current continuity.
27 Numeric generations cannot replace continuity identity.
28 Concurrent scope and invalidation transitions need authoritative ordering.
29 Current scope does not imply current proof.
30 Current proof does not imply current authority.
31 Current authority does not imply world effect success.
32 Safe quarantine is preferred to ambiguous inter-generation authority.

## Candidate theorem

Not formally proven:

If every protected capability is bound to scope, authority, STOP/recovery, boundary, resource/provider incarnation and continuity context; every material context change invalidates incompatible capabilities; stale capabilities are rejected at the relevant enforcement boundary; and continuation/new admission is permitted only after current interaction, uncertainty and mission-safety checks, then simultaneous scope transition, invalidation, STOP, recovery, resource replacement and provider retry cannot silently convert a historical capability into current protected authority.

Required premises remain open and must eventually be checked by formalization, refinement and runtime fault injection.

## Architecture consequence

The clean architecture now needs a dedicated:

INTER-GENERATION CONTINUITY / COMPATIBILITY CHECK

between old effect state and new authority/scope admission.

Flow:

OLD EFFECT
→ MATERIAL CHANGE DETECTED
→ INVALIDATE/STOP/FENCE AS REQUIRED
→ RECOMPUTE CURRENT CONTEXT
→ CHECK CONTINUATION COMPATIBILITY
→ CONTINUE UNDER PROTECTED TRANSITION
or
→ NEW ATTEMPT / NEW ADMISSION
or
→ HOLD / QUARANTINE.

This is stronger than simply version-checking a capability.

## Formal model direction

The finite model should combine:
- two scope generations;
- two provider incarnations;
- two resource incarnations;
- old and new attempts;
- STOP;
- invalidation;
- recovery;
- retry/redrive;
- compensation;
- shared footprint;
- crash at every transition;
- stale capability delivery.

The primary safety property should be about protected effect admission under current compatible context, not merely token equality.

TLA+ supports modeling such concurrent systems as state machines and proving/refining higher-level safety specifications, but this research document does not claim that the model has yet been executed or verified. cite: turn0search5, turn0search24.

## Next attack

SCOPE CUTOVER + MULTIPLE IN-FLIGHT EFFECTS + SHARED FOOTPRINT + OLD/NEW CONTINUATION + COMPENSATION + PROVIDER REDRIVE

Question: can an old-scope effect safely continue while a new-scope effect is admitted on the same footprint, or does widening require an explicit inter-generation interaction contract and possibly a shared coordination domain?
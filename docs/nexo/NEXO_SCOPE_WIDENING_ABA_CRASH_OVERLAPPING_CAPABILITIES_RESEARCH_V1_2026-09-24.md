# NEXO - SCOPE WIDENING ABA / CRASH / OVERLAPPING CAPABILITIES RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

What happens if scope widening is prepared but crashes before linearization while old-scope and new-scope actors/capabilities coexist? Can an old token be mistaken for a current scope after rollback, retry, provider duplication, or recovery?

## External cross-checks

Kubernetes uses resourceVersion to detect stale writes and reject updates made against an out-of-date object; it documents HTTP 409 conflicts for stale resourceVersion writes. This is a useful coordination analogue for rejecting old scope state, but it is not by itself a safety proof for Nexo. cite: turn0search0.

Kubernetes also notes that resourceVersion is meaningful within the same resource type and that stale/cache-served data can be older than previously observed state under some read semantics. This reinforces that a numeric/version token alone does not establish global semantic continuity. cite: turn0search0.

TLA+ refinement requires an explicit mapping between lower-level state and the higher-level specification; therefore a scope token is not sufficient unless its semantics can be mapped to the abstract scope state and its crash/recovery behavior. cite: turn0search24, turn0search25.

## Core result

Scope widening is not just another mutation.

It is a bidirectional safety transition involving:
1. cutoff of old scope authority;
2. admission of new scope authority;
3. capability/fence activation;
4. crash-recovery semantics;
5. anti-ABA identity.

Candidate rule:

SCOPE_WIDENING != VERSION_INCREMENT

and:

NEW_SCOPE_ID != NEW_AUTHORITY unless protected activation commits.

## The ABA attack

Sequence:

S0 = scope {P1,R1}

1. E admitted under S0.
2. S1 proposal adds {P2,R2}.
3. S1 prepared but not linearized.
4. Process crashes.
5. Old process incarnation restarts with S0.
6. Another recovery process reconstructs S1 proposal.
7. A provider presents a token that appears to identify S1.
8. A stale S0 capability remains usable.
9. Both paths can reach the same effect.

The dangerous outcome is ambiguous authority:

CAP(S0) and CAP(S1) coexist without a single authoritative interpretation of which scope is current.

## Scope generations need more than integers

Candidate identity: ScopeContext

Fields:
- scope_id;
- parent_scope_id;
- scope_incarnation;
- effect_id;
- attempt_id;
- authority_epoch;
- boundary_generation;
- resource_incarnation set;
- dependency_generation;
- topology_generation;
- policy/invariant versions;
- continuity_context_id;
- invalidation_generation;
- coordination_domain;
- activation_state.

A monotonically increasing number is insufficient if restoration can resurrect an old value.

Therefore:

NUMERIC_MONOTONICITY != SEMANTIC_CONTINUITY.

## Scope lifecycle

Candidate states:

SCOPE_NONE
→ SCOPE_PROPOSED
→ SCOPE_PREPARED
→ SCOPE_CUTOFF_PENDING
→ SCOPE_ACTIVATION_PENDING
→ SCOPE_ACTIVE
→ SCOPE_SUPERSEDED
→ SCOPE_REVOKED
→ SCOPE_RECONCILING
→ SCOPE_QUARANTINED

Important:

PREPARED != ACTIVE

and:

SUPERSEDED != FENCED unless enforcement has actually been established.

## Two-sided cutoff

The research strongly supports a two-sided transition.

Side A — old scope cutoff:
prevent new protected effects from using S0 after S1 becomes authoritative.

Side B — new scope activation:
prevent S1 capabilities from acting until the new scope's boundary, dependencies, resources and authority are current.

Therefore:

SCOPE_CUTOFF_LINEARIZATION
and
SCOPE_ACTIVATION_LINEARIZATION

are separate conceptual events.

A combined protected transition may serialize them, but the architecture must not pretend they are the same property.

## Candidate ScopeTransitionCommit

Fields:
- transition_id;
- effect_id;
- attempt_id;
- old_scope_id/incarnation;
- new_scope_id/incarnation;
- old authority epoch;
- new authority epoch;
- old boundary generation;
- new boundary generation;
- affected resources/incarnations;
- capability delta;
- dependency delta;
- interaction/coordination delta;
- mission-invariant delta;
- continuity context;
- cutoff state;
- activation state;
- enforcement verification;
- reconciliation requirements;
- protected linearization reference;
- crash/replay semantics.

## Crash matrix

W0 — before prepare:
No widening exists.

W1 — after prepare, before cutoff:
S0 remains authoritative. S1 must not act.

W2 — after old cutoff, before new activation:
Neither old nor new scope may create unauthorized protected effects. This is a deliberate safety gap.

W3 — after new activation, before local publication:
Resource/provider may already enforce S1 while local state is incomplete. Recovery must reconcile the external boundary before release.

W4 — after publication, before process crash:
S1 is authoritative if the protected transition committed.

W5 — crash during replay:
Recovery cannot guess whether S1 committed. It must use the authoritative commit record/fence or preserve UNKNOWN.

## Key principle

A crash cannot transform UNKNOWN_COMMIT into S0_ACTIVE merely because the local snapshot predates S1.

That would be restoration of historical authority.

## Capability tokens

Every protected capability should carry at least:
- capability_id;
- effect_id;
- attempt_id;
- scope_id;
- scope_incarnation;
- authority_epoch;
- boundary_generation;
- resource_incarnation;
- policy/invariant context;
- continuity context;
- expiry/revocation generation;
- delegation lineage.

The target/resource and scope identity must be checked at the enforcement point.

## Old token behavior

If S1 supersedes S0:

CAP(S0) must become unusable for protected effects covered by the widening.

But this cannot be inferred from a local boolean.

The stale resource/provider must reject S0 or an equivalent fence must prevent S0 from reaching the effect.

Therefore:

LOCAL_SCOPE_SUPERSEDED != REMOTE_SCOPE_FENCED.

## New token behavior

CAP(S1) must not become usable merely because a token was minted.

Required:

S1_CURRENT
AND AUTHORITY_CURRENT
AND BOUNDARY_CURRENT
AND RESOURCE_CURRENT
AND DEPENDENCIES_CURRENT
AND MISSION_CLAIM_CURRENT.

Then protected activation can occur.

## Duplicate provider attack

Suppose P1 and P1' are two provider incarnations both claiming provider_id = P1.

Logical identity alone is insufficient.

Need ProviderIncarnation.

A provider restart or replacement must create a new incarnation unless a continuity contract explicitly proves continuation.

Thus:

SAME_PROVIDER_ID != SAME_PROVIDER_INCARNATION.

## Old provider + new provider

If both are active:

P1(old) → S0
P1(new) → S1

the resource must not blindly accept both.

Possible safe arrangements:
A. resource-side fence rejects old generation;
B. effect classes prove both are commutative and safe;
C. common coordination domain serializes them;
D. both are constrained to disjoint protected footprints.

Otherwise:

HOLD / QUARANTINE.

## Capability overlap

If CAP(S0) ∩ CAP(S1) != ∅, the overlap needs explicit semantics.

It can be:
DISJOINT
COMMUTATIVE
ORDER_SENSITIVE
MUTUALLY_EXCLUSIVE
CONDITIONALLY_COMPATIBLE
CONFLICTING
UNKNOWN

Unknown overlap cannot be treated as harmless.

## Scope widening and in-flight effects

An effect admitted under S0 may already be externally active when S1 is proposed.

Therefore widening must distinguish:

OLD_EFFECT_CONTINUATION

from:

NEW_EFFECT_ADMISSION.

A scope widening must not retroactively rewrite the historical authorization context of an already-running attempt.

The old attempt remains a historical execution under S0, subject to current fencing and continuation compatibility.

If continuation under S1 is desired, it is a new protected ContinuationTransition.

## Recovery after widening crash

Candidate sequence:

RESTORE_HISTORICAL_BASELINE
→ CREATE_NEW_RECOVERY_CONTEXT
→ IDENTIFY_SCOPE_PROPOSALS
→ DISCOVER_AUTHORITATIVE_SCOPE_COMMIT
→ DISCOVER_CURRENT_FENCE
→ DISCOVER_PROVIDER/RESOURCE INCARNATIONS
→ RECONCILE OLD/NEW CAPABILITIES
→ CLASSIFY IN-FLIGHT EFFECTS
→ INVALIDATE STALE TOKENS
→ REESTABLISH CURRENT SCOPE
→ RECOMPUTE CLAIMS
→ EXPLICIT RELEASE

Recovery does not simply restore S0 or S1 from whichever snapshot was available.

## Anti-ABA rule

Candidate:

ScopeIdentity = (scope_id, scope_incarnation, continuity_context_id, authority_epoch, boundary_generation)

A reused scope_id with a different incarnation is not the same scope.

Therefore:

SCOPE_ID_REUSE != SCOPE_CONTINUITY.

Likewise:

TOKEN_VALUE_REUSE != TOKEN_AUTHORITY_CONTINUITY.

## Scope cutover boundary

New concept:

ScopeCutoverBoundary

It marks the protected transition at which the old scope ceases to be admissible and the new scope becomes eligible.

It must be distinct from:
- proposal;
- preparation;
- token issuance;
- local publication;
- external enforcement;
- observation.

## Candidate theorem

Not formally proven:

If every protected capability is bound to a non-reusable scope incarnation and current authority/boundary/resource context, old capabilities are rejected at the relevant enforcement boundary after the authoritative cutoff, and new capabilities cannot act before protected activation, then a crash during widening cannot cause simultaneous ambiguous authority between old and new scope generations.

Required premises:
- authoritative scope commit survives crash or has an equivalent recoverable fence;
- continuity cannot be rolled back;
- enforcement actually rejects stale capabilities;
- provider/resource incarnations are current;
- queues/retries/delegations carry scope identity;
- recovery revalidates all relevant state;
- no bypass path exists outside the closure.

## Formalization direction

The high-level TLA+ model should represent:
Scope
ScopeIncarnation
AuthorityEpoch
BoundaryGeneration
Capability
ProviderIncarnation
ResourceIncarnation
WideningTransition
Cutoff
Activation
Crash
Recovery
ExternalEffect.

Safety candidate:

ADMITTED_EFFECT(e) => capability_scope(e) == current_compatible_scope(e)

or, for a continuing old effect:

CONTINUE(e,S_new) => COMPATIBLE(S_old,S_new,e) AND SAFE_UNDER_CURRENT_CONTEXT.

Refinement then needs to map implementation-level tokens, caches, records and fences to the abstract scope state; TLA+ explicitly treats refinement as an implementation-to-higher-level mapping rather than assuming lower-level representation is itself the abstract state. cite: turn0search24, turn0search25.

## Candidate invariants INV-SWA-01..36

01 Prepared scope is not active scope.
02 Proposed scope is not authorized scope.
03 Scope ID is not sufficient for continuity.
04 Scope incarnation prevents ABA reuse.
05 Numeric monotonicity is not semantic continuity.
06 Old scope and new scope cannot both hold unrestricted protected authority.
07 Old scope cutoff is distinct from new scope activation.
08 New scope activation requires current boundary.
09 New scope activation requires current resources/incarnations.
10 New scope activation requires current dependencies.
11 New scope activation requires current mission claims.
12 Old capabilities become invalid after authoritative cutoff.
13 Local invalidation is not remote enforcement.
14 New capability issuance is not enforcement activation.
15 Provider identity requires incarnation.
16 Resource identity requires incarnation.
17 Delegation carries scope identity.
18 Queue work carries scope identity.
19 Retry/redrive carries scope identity.
20 Child effects carry scope identity.
21 Scope widening cannot retroactively authorize old attempts.
22 Continuation across scope generations requires compatibility.
23 Crash cannot restore historical scope authority.
24 Snapshot restoration cannot restore historical authority.
25 Unknown widening commit remains unknown after crash until reconciled.
26 Old/new capability overlap requires interaction semantics.
27 Unknown overlap is not disjoint.
28 Provider replacement invalidates old scope bindings unless continuity is proven.
29 Resource replacement invalidates old scope bindings unless transfer is proven.
30 Scope cutover requires authoritative ordering.
31 Recovery must establish a new current context.
32 Scope shrink requires fencing/revocation where old paths remain active.
33 Strong claims require scope closure and boundary closure.
34 No stale scope token may cross the protected effect boundary.
35 Scope transition itself is safety-critical state.
36 Safe quarantine is preferred to ambiguous dual authority.

## Major architectural result

The previous hypothesis is strengthened:

Scope widening needs the same conceptual machinery as invalidation-versus-admission races.

It needs:

OLD_SCOPE_CUTOFF
+
NEW_SCOPE_ACTIVATION
+
AUTHORITATIVE ORDER
+
FENCING
+
ANTI-ABA IDENTITY
+
CRASH/REPLAY SEMANTICS.

The safest conceptual protocol is:

PROPOSE
→ PREPARE
→ CUTOFF OLD
→ ACTIVATE NEW
→ VERIFY ENFORCEMENT
→ PUBLISH
→ RECONCILE

A temporary state where neither generation can produce protected effects is acceptable for safety; it may hurt liveness, but that is preferable to ambiguous authority. TLA+ distinguishes safety from liveness in this way: preventing an action forever can preserve a safety invariant even though it sacrifices progress. cite: turn0search4.

## Next attack

SCOPE CUTOVER + MULTIPLE IN-FLIGHT EFFECTS + SHARED FOOTPRINT + OLD/NEW CONTINUATION + COMPENSATION + PROVIDER REDRIVE

Question: can an old-scope effect safely continue while a new-scope effect is admitted on the same footprint, or does widening require an explicit inter-generation interaction contract and possibly a shared coordination domain?
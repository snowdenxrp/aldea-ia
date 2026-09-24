# NEXO - INTER-GENERATION SHARED-FOOTPRINT / CONTINUATION / COORDINATION RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can an old in-flight attempt under scope S1 coexist safely with a new attempt under S2 on the same footprint, without forcing the entire mission into one global coordination domain?

## External cross-checks

Kubernetes uses resourceVersion-based conditional updates to reject stale writes, while its documentation also warns that some read/watch modes can expose older state and that clients must handle expired historical versions. This supports the Nexo distinction between a version token, current coordination state, and continuity. citeturn0search0turn0search8

AWS documents idempotency as a way to make repeated identical requests safer, while noting the difficulty of guaranteeing exactly-once behavior in distributed systems. This supports treating idempotency as a retry property, not as proof of isolation or cross-generation safety. citeturn0search3

Lamport's current material on concurrent programs explicitly treats concurrent behavior as a state-transition problem and provides refinement material for relating implementation to higher-level specifications. This supports a claim-specific formal model for inter-generation interaction rather than a token-only rule. citeturn0search1turn0search7

## Core result

Two generations of the same logical effect may coexist only if their joint interaction is explicitly safe for the relevant claim.

Therefore:

OLD_GENERATION_SAFE
+
NEW_GENERATION_SAFE
!=
JOINTLY_SAFE.

And:

SAME_EFFECT_ID
!=
SAME_AUTHORITY
!=
SAME_ATTEMPT.

## Shared-footprint classification

For old attempt E1@S1 and new attempt E2@S2, classify their claim-relevant interaction:

1. DISJOINT
2. COMMUTATIVE
3. ORDER_SENSITIVE
4. MUTUALLY_EXCLUSIVE
5. CONDITIONALLY_COMPATIBLE
6. CONFLICTING
7. UNKNOWN

The classification is claim-specific and context-specific.

UNKNOWN cannot be promoted to DISJOINT merely because no conflict was observed.

## Candidate object: InterGenerationInteractionContract

Fields:
- contract_id;
- claim_id;
- old_effect_id;
- old_attempt_id;
- old_scope_context;
- new_effect_id;
- new_attempt_id;
- new_scope_context;
- shared resources/incarnations;
- shared physical footprint;
- shared queues/workers;
- provider interactions;
- causal constraints;
- temporal overlap constraints;
- mission invariant dependencies;
- uncertainty set;
- commutativity relation;
- allowed interleavings;
- excluded interleavings;
- fence requirements;
- coordination domain;
- boundary coverage;
- assumptions;
- proof/evidence;
- invalidation triggers;
- verification status.

## Important discovery: pairwise safety is insufficient

Even if:

E1 is safe with E2
and
E1 is safe with E3
and
E2 is safe with E3,

the set {E1,E2,E3} may still violate a nonlinear mission invariant.

Therefore:

PAIRWISE_COMPATIBILITY != SET_COMPATIBILITY.

This reopens the higher-order interaction work.

A mission invariant such as:

A + B + C <= capacity

may be violated only by the aggregate, even when every pair individually satisfies the pairwise bound.

## Temporal overlap

Two effects can be individually valid but jointly unsafe because of overlap duration.

Example:

E1 occupies capacity for interval [t1,t4].
E2 occupies capacity for [t2,t5].

Even if each effect separately satisfies capacity, the overlap may violate the temporal invariant.

Therefore the interaction contract needs:
- start/end uncertainty;
- overlap constraints;
- ordering constraints;
- delayed release;
- queue delay;
- retry delay;
- compensation timing.

## Causal order

If the mission invariant depends on:

E1 BEFORE E2

then observing:

E1 completed
E2 completed

does not prove the required causal order.

Need a claim-specific causal relation or a proof that all allowed interleavings are safe.

Candidate:

SAFE_FOR_ALL_ALLOWED_INTERLEAVINGS({E1,E2}, M, C)

If true, coordination may be reduced.

If false or unknown, the interacting effects need a stronger ordering domain.

## Continuation under new scope

An old effect E1 can potentially continue under S2 only if:

CONTINUATION_COMPATIBLE(E1,S1,S2,C)

and:

SAFE_UNDER_CURRENT_UNCERTAINTY(CONTINUE,U,M).

Compatibility must cover:
- effect semantics;
- target/resource incarnation;
- provider incarnation;
- authority scope;
- policy/invariant;
- boundary generation;
- dependency closure;
- topology;
- STOP/recovery;
- continuity;
- provider contract;
- interactions with concurrent effects.

A byte-identical configuration is insufficient.

## Four continuation outcomes

For an old in-flight attempt:

A. CONTINUE
- compatibility proven;
- current authority;
- current boundary;
- interaction safe.

B. FENCE
- continuation not safe;
- external effect can be safely stopped/fenced.

C. RECONCILE
- world state/outcome is uncertain;
- provider/resource history can resolve the uncertainty.

D. HOLD/QUARANTINE
- uncertainty can violate the claim and no safe continuation/fence/reconciliation exists.

This prevents a generic recovery engine from deciding that every old attempt should either continue or be cancelled.

## Idempotency boundary

Idempotency helps when the same logical request is retried.

But:

IDEMPOTENCY != COMMUTATIVITY
IDEMPOTENCY != ISOLATION
IDEMPOTENCY != CAUSAL ORDER
IDEMPOTENCY != MISSION SAFETY.

AWS explicitly describes idempotency as making repeated identical requests safer, while noting the difficulty of exactly-once guarantees in distributed systems. citeturn0search3

Therefore an idempotent E1 can still conflict with E2.

## Shared physical resource

The strongest interaction is a shared physical resource.

Examples:
- actuator;
- inventory unit;
- compute slot;
- energy budget;
- physical machine;
- network link;
- storage device;
- external account balance.

If both generations can affect the same physical state, logical scope separation is not sufficient.

The physical resource becomes part of the coordination closure unless a boundary proves that the effects commute for the relevant invariant.

## Mission-budget interaction

Suppose:

S1 reserves 6 units.
S2 reserves 5 units.
Mission budget = 10.

Individually:

6 <= 10
5 <= 10

Together:

11 > 10.

Therefore old/new generation coordination cannot be reduced by pairwise local validity.

The mission invariant itself can force the coordination domain to include both generations.

## Safe reduction condition

Coordination may be reduced only when a proof/contract establishes:

1. interaction closure is complete;
2. shared physical footprints are included;
3. temporal interaction is included;
4. causal constraints are included;
5. higher-order interactions are included;
6. mission aggregate constraints remain satisfied;
7. retries/redrives/compensation are included;
8. provider autonomous continuations are included;
9. resource/provider incarnations are current;
10. uncertainty is safe under all allowed interleavings.

If any required condition is UNKNOWN:

do not reduce the coordination domain for the strong claim.

## Candidate InterGenerationReductionCertificate

Fields:
- reduction_id;
- claim_id;
- effect/generation set;
- full interaction closure;
- omitted domains;
- pairwise interactions;
- higher-order interactions;
- temporal constraints;
- causal constraints;
- mission invariants;
- provider/environment assumptions;
- uncertainty model;
- resource/provider incarnations;
- fence generations;
- continuity context;
- reduced coordination domain;
- verification status;
- invalidation triggers.

This extends the existing ReductionCertificate rather than replacing it.

## Scope cutover + shared footprint

If S1 is still executing while S2 becomes authoritative, the cutover cannot mean:

S1 stops existing.

It means:

S1 authority for NEW protected admissions may end.

Historical/in-flight E1 remains an existing world interaction.

Therefore:

SCOPE_CUTOFF
!=
HISTORICAL_EFFECT_TERMINATION.

If E1 remains capable of affecting the shared footprint, it remains part of the interaction closure.

## Provider retry after cutover

Sequence:

E1@S1 timeout
→ UNKNOWN
→ S2 becomes current
→ provider retries E1
→ E2@S2 admitted.

Now the world may contain:

W1 E1 only
W2 E2 only
W3 E1 then E2
W4 E2 then E1
W5 both overlapping
W6 one queued and later executed
W7 provider history incomplete.

If the mission invariant differs among these worlds, generic continuation is unsafe.

This is an instance of:

JOINT_OUTCOME_UNCERTAINTY.

## Compensation race

Suppose E1 is UNKNOWN and C1 is proposed as compensation while E2 is admitted.

C1 may interact with both possible E1 outcomes and E2.

Therefore the uncertainty set is no longer merely:

U(E1).

It becomes:

U(E1,E2,C1)

with causal and temporal relations.

A compensation decision must be evaluated against the joint uncertainty set.

## Coordination domain result

The previous principle becomes more precise:

ONE AUTHORITATIVE SAFETY ORDER PER INTERACTING CLAIM.

Not:

ONE GLOBAL COORDINATOR FOR EVERYTHING.

Therefore:
- unrelated effects may use separate coordination domains;
- disjoint effects may avoid joint coordination;
- commutative effects may share reduced coordination;
- aggregate/temporal/higher-order interactions force expansion;
- UNKNOWN interaction prevents unjustified reduction.

## Candidate coordination decision

For a claim M and effect set E:

CCD(E,M,C) must contain every domain whose state can change the truth of M through:
- effect interaction;
- mission aggregate;
- temporal overlap;
- causal order;
- physical footprint;
- provider continuation;
- retry/redrive;
- compensation;
- fencing;
- resource incarnation;
- continuity;
- recovery.

This is stronger than simple graph adjacency.

## Candidate invariants INV-IGI-01..34

01 Individual safety does not imply joint safety.
02 Same effect identity does not imply same attempt.
03 Same logical effect does not imply same authority.
04 Old in-flight effects remain in interaction closure.
05 Scope cutoff does not terminate historical effects.
06 New scope cannot ignore old shared-footprint effects.
07 Shared physical resources require interaction analysis.
08 Pairwise compatibility does not imply set compatibility.
09 Temporal overlap is claim-relevant.
10 Causal order is claim-relevant when the invariant depends on order.
11 Unknown order is not arbitrary harmless order.
12 Idempotency is not commutativity.
13 Idempotency is not isolation.
14 Provider retries remain in effect-path closure.
15 Compensation remains a protected effect.
16 Compensation expands joint uncertainty when applicable.
17 Mission aggregate constraints can force cross-generation coordination.
18 Resource incarnation changes invalidate old bindings.
19 Provider incarnation changes invalidate old bindings.
20 STOP does not classify old effect outcomes.
21 Fence does not prove historical completion.
22 Reconciliation evidence is context-bound.
23 Safe continuation requires current compatibility.
24 Unknown compatibility blocks strong continuation.
25 New effects require current authority.
26 Old attempts cannot acquire new authority implicitly.
27 Coordination reduction requires complete interaction closure.
28 Higher-order interactions must be included.
29 Unknown interaction prevents unjustified reduction.
30 Reduction certificate is not authority.
31 Scope context is not world truth.
32 Recovery recomputes cross-generation interaction.
33 Safe non-convergence is preferable to unsafe continuation.
34 Mission-level claims cannot exceed the closure of their interacting effects.

## Candidate theorem

Not formally proven:

If an old and new generation share a footprint, and their complete interaction closure, temporal/causal constraints, higher-order interactions and uncertainty set are known, then coordination can be reduced only when every allowed joint execution preserves the target invariant.

If any relevant interaction remains UNKNOWN, the strong claim requires retaining that interaction in the coordination domain or establishing an independent enforcement boundary that makes it irrelevant.

## Architecture consequence

The clean architecture should not force every generation into one global coordinator.

Instead:

DISCOVER INTERACTION CLOSURE
→ CLASSIFY INTERACTION
→ CHECK HIGHER-ORDER EFFECTS
→ CHECK TEMPORAL/CAUSAL CONSTRAINTS
→ CHECK MISSION AGGREGATES
→ CHECK UNCERTAINTY
→ COMPUTE MINIMAL SAFE CCD
→ PROTECTED ADMISSION.

This connects directly to the existing minimal-coordination and partial-order-reduction work.

## Formalization target

A future model should include at least:
- E1 old generation;
- E2 new generation;
- E3 optional third effect;
- shared resource;
- mission budget;
- temporal occupancy;
- provider retry;
- compensation;
- STOP;
- scope cutoff;
- resource incarnation;
- partial order;
- UNKNOWN outcomes.

The model should test not only pairwise invariants but aggregate and temporal invariants.

TLA+ is suitable for expressing these concurrent transitions and refinement relationships; actual SANY/TLC execution remains an explicit open verification gate. citeturn0search1turn0search7

## Next attack

The next adversarial round should attack **nonlinear mission invariants and hypergraph coordination** directly:

three or more individually compatible generations/effects whose combination violates the mission invariant, including dynamic scope widening and recovery.

The question is whether Nexo can compute a minimal safe CCD without relying on pairwise edges alone, and what conservative abstraction is required when the exact higher-order interaction graph is too large.
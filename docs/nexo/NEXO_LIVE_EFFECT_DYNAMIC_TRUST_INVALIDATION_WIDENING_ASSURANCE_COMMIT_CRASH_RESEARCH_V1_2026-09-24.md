NEXO - LIVE EFFECT / DYNAMIC TRUST EXPANSION / INVALIDATION RACE / ASSURANCE COMMIT / CRASH-RECOVERY RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

QUESTION
If a live effect needs a newly discovered provider/dependency while invalidation or quarantine races with scope widening, what minimum ordering prevents the effect from crossing the old boundary under old authority while the new path remains unverified?

EXTERNAL CROSS-CHECKS
etcd transactions atomically evaluate multiple comparisons and apply a success/failure block, which is a useful reference for protected compare-and-commit ordering. etcd also distinguishes linearizable operations from watch delivery; watches are not themselves linearizable, so observation order cannot substitute for authoritative ordering. cite: turn0search0, turn0search3.
TLA+ emphasizes choosing the grain of atomicity explicitly and warns that coarser atomic steps can hide intermediate behaviors that exist in finer-grained executions. This directly supports modeling the widening/invalidation race at the right transition granularity. cite: turn0search25.
NIST SP 800-193 separates protection, detection and recovery roots and treats update/recovery as security-critical functions; it also recognizes trust relationships when one device supplies security functionality to another. cite: turn0search24, turn0search2.

CORE RESULT
The minimum safe solution is not a timestamp, message order, cache update, or worker pre-check.
It is one authoritative ordering domain covering every transition that can change whether the live effect may use the newly discovered path.
Candidate name: LIVE_EFFECT_SAFETY_ORDER.

KEY SEPARATIONS
DISCOVERY_ORDER != INVALIDATION_ORDER != SCOPE_WIDENING_ORDER != ASSURANCE_COMMIT_ORDER != EFFECT_ORDER.
OBSERVATION_ORDER != SAFETY_ORDER.
CACHE_ORDER != SAFETY_ORDER.
WALL_CLOCK_ORDER != SAFETY_ORDER.

THE MINIMUM ATOMIC RELATION
For live effect E, old context C0, new dependency D and invalidation generation G:
ADMIT/CONTINUE(E,C0,G) must be conditionally committed against the current invalidation/scope generation.
Scope widening to C1 must not become usable until its own protected commit.
Invalidation/quarantine must be ordered against both old-context continuation and new-context activation.

CANDIDATE PROTECTED TRANSITION
CONTINUE_IF(
  effect_id current AND
  attempt_id current AND
  context_id == C0 AND
  invalidation_generation == G AND
  scope_generation == S0 AND
  required boundaries current AND
  required fences current
) -> CONTINUE_COMMIT(E,C0,G,S0).

NEW PATH ACTIVATION
WIDEN_IF(
  current effect context valid AND
  new dependency closure complete AND
  new TCB/foundation valid AND
  new boundary/fence set verified AND
  assumptions compatible AND
  assurance current AND
  invalidation generation current
) -> SCOPE_WIDEN_COMMIT(E,C1,G+?,S1).

INVALIDATION
INVALIDATE_IF(current generation == G) -> INVALIDATION_COMMIT(G+1, affected closure).

IMPORTANT
These are abstract contracts, not implementation syntax. The actual mechanism may be a transaction, CAS-equivalent protected state machine, consensus-backed commit, resource-side fence, or another mechanism that demonstrably provides the required ordering.

RACE CASE A - INVALIDATION FIRST
I(G+1) linearizes before continuation/widening.
Old continuation under G is rejected.
New widening must bind to G+1 or a newer compatible context.
Old authority cannot cross the new cutoff.

RACE CASE B - CONTINUE FIRST
Continuation under G linearizes before invalidation.
It becomes historical in-flight work under C0.
Invalidation then applies to future continuation and must classify/reconcile the already admitted effect.
It does not retroactively erase the historical admission.

RACE CASE C - WIDEN FIRST
If C1 widening linearizes before invalidation, C1 becomes a current protected context only if all widening obligations were satisfied.
Subsequent invalidation must invalidate C1 where impacted.

RACE CASE D - INVALIDATION AND WIDENING ORDER UNKNOWN
Do not guess.
Either establish order through authoritative state or use a boundary that makes stale continuation ineffective.
Otherwise HOLD/REVALIDATE/QUARANTINE.

THE DANGEROUS GAP
BAD SEQUENCE:
1 old effect is admitted;
2 provider D discovered;
3 worker adds D locally;
4 invalidation arrives;
5 worker already sends through D;
6 assurance bundle is committed afterward.
This allows EFFECT_EXECUTION to precede the authoritative widening/invalidation decision.
Forbidden invariant:
UNCOMMITTED_SCOPE_WIDENING != EXECUTABLE_AUTHORITY.

ASSURANCE COMMIT CANNOT BE THE FIRST SAFETY BOUNDARY
An assurance bundle can describe that C1 was verified, but the effect boundary must not begin accepting C1 before the relevant protected authorization/scope transition exists.
Therefore:
ASSURANCE_VERIFIED != EFFECT_AUTHORIZED.
ASSURANCE_COMMIT must be downstream of the required context/authority conditions or atomically coupled with the publication boundary where the claim requires it.

LIVE EFFECT CONTINUATION CONTRACT
Candidate object ContinuationAuthorization:
- effect_id;
- attempt_id;
- current_context_id;
- scope_generation;
- invalidation_generation;
- authority_epoch;
- boundary_generation;
- resource_incarnation set;
- trust-foundation set;
- interaction closure;
- uncertainty set;
- assurance bundle/context;
- continuation class;
- linearization reference;
- expiry/invalidation triggers.

CONTINUATION CLASSES
C0 CONTINUE_UNDER_FROZEN_CONTEXT
C1 CONTINUE_AFTER_REVALIDATION
C2 CONTINUE_UNDER_NEW_CONTEXT
C3 FENCE_AND_RECONCILE
C4 HOLD/QUARANTINE
C5 TERMINATE_WHERE_EXTERNAL_PROTOCOL_SUPPORTS_SAFE_TERMINATION.
Termination is not assumed merely because requested.

FENCE REQUIREMENT
If the old effect can continue through a path not covered by the new invalidation/scope mechanism, the authority-store ordering alone is insufficient.
The old path must cross an enforcement boundary that rejects the stale context or makes the protected effect impossible.
This is the same separation established earlier:
AUTHORITY_ORDER != ENFORCEMENT_ORDER != WORLD_ORDER.

CRASH WINDOW
Hard case:
widening prepared -> invalidation commits -> process crashes -> restart sees prepared widening.
Prepared widening is historical/prepared state, not current authority.
Recovery must reconstruct current invalidation/scope generations and revalidate before activation.

ANOTHER HARD CASE
invalidation prepared -> widening prepared -> crash before either commit.
Neither prepared object may be treated as current.
Recovery re-enters from authoritative committed state, not from whichever worker checkpoint was last persisted.

CRASH AFTER WIDENING COMMIT
If C1 commit is durable/current but enforcement activation is incomplete, C1 must not be advertised as externally enforced.
State should distinguish:
SCOPE_COMMITTED
FENCE_PENDING
FENCE_ENFORCED
ENFORCEMENT_VERIFIED.

CRASH AFTER FENCE ACTIVATION
Fence may be current even if local assurance publication was not recorded.
Recovery must verify fence continuity and recompute assurance.
Fence state does not itself prove the external effect outcome.

RECOVERY ORDER
RESTORE_HISTORICAL_BASELINE
-> DISCOVER_CURRENT_AUTHORITY
-> DISCOVER_CURRENT_INVALIDATION_GENERATION
-> DISCOVER_CURRENT_SCOPE/TCB CLOSURE
-> DISCOVER_CURRENT_FENCE/BOUNDARY
-> IDENTIFY_IN_FLIGHT_EFFECT
-> RECONCILE_EXTERNAL_WORLD
-> CLASSIFY_EVIDENCE
-> REVALIDATE CONTINUATION
-> REBUILD ASSURANCE BUNDLE
-> EXPLICIT RELEASE.

NO CHECKPOINT AUTHORITY
A checkpoint containing C1 cannot restore C1 as current simply because its contents are authentic.
Checkpoint != current context.
Checkpoint != current authority.
Checkpoint != current fence.

ORDERING DOMAIN MINIMALITY
We do not need a universal global lock.
We need one authoritative safety order per interacting claim.
If live effect E, invalidation D and widening W can all change the truth of the same claim, they must be serialized or jointly constrained in the same SafetyOrderingDomain, or be connected by an equivalent cross-domain fencing protocol.

IF THEY ARE DISJOINT
Independent ordering is acceptable only when complete closure proves the operations cannot affect each other's claim-relevant property.
Unknown interaction is not disjointness.

MISSION INVARIANT
For a mission claim M, widening can introduce new resource/provider interactions.
Therefore the widening transition must re-evaluate mission invariant closure before activating the new path.
Local provider compatibility does not prove mission compatibility.

ASSURANCE BUNDLE
The bundle must bind to the exact widening generation and invalidation generation used by the protected commit.
Component freshness alone is insufficient.
Mixed-generation bundle publication is forbidden.

NEW OBJECT: LiveEffectSafetyOrder
Candidate fields:
- order_domain_id;
- claim_id;
- effect scope;
- interacting invalidations;
- scope/widening transitions;
- assurance commits;
- current generation vector;
- linearization mechanism;
- fence/boundary set;
- continuity anchor;
- crash semantics;
- recovery protocol;
- cross-domain dependencies;
- verification method.

NEW OBJECT: ScopeWideningCommit
Candidate fields:
- widening_id;
- effect_id;
- old_context;
- new_context;
- closure delta;
- TCB delta;
- boundary/fence delta;
- authority delta;
- assurance delta;
- invalidation generation;
- protected linearization;
- enforcement verification;
- rollback/invalidation semantics.

NEW OBJECT: ContinuationBarrier
Candidate states:
OPEN_UNDER_C0
BLOCKED_PENDING_REVALIDATION
OPEN_UNDER_C1
FENCED
QUARANTINED
UNKNOWN.
The barrier is not merely telemetry; it is part of the protected admission condition if it controls whether the effect can continue.

CANDIDATE INVARIANTS INV-LER-01..40
01 discovery does not authorize execution.
02 uncommitted widening cannot create executable authority.
03 uncommitted invalidation cannot be treated as current cutoff.
04 authoritative invalidation order is distinct from observation order.
05 widening and invalidation affecting one claim share one safety order or equivalent fencing protocol.
06 old-context continuation is rejected after a current invalidation cutoff.
07 invalidation does not retroactively erase already linearized history.
08 new context is not usable before protected widening commit.
09 assurance publication does not create authority.
10 assurance commit binds to current widening/invalidation generations.
11 prepared state is not current authority.
12 checkpoint state is not current authority.
13 crash recovery starts from authoritative committed state.
14 fence activation is distinct from scope commit.
15 enforcement verification is distinct from fence activation.
16 external effect is distinct from internal scope commit.
17 unknown ordering blocks strong continuation unless a stale path is independently fenced.
18 unknown interaction is not disjointness.
19 dynamic provider paths are included in effect-path closure.
20 mission invariant closure is recomputed for relevant widening.
21 resource incarnation changes invalidate incompatible continuation.
22 trust-foundation changes invalidate incompatible assurance.
23 policy/invariant changes invalidate incompatible continuation.
24 recovery does not restore historical currentness.
25 old authority cannot activate a new path.
26 new authority cannot retroactively authorize old actions.
27 fence generation is bound to continuation context.
28 assurance context is bound to scope generation.
29 invalidation generation is authoritative.
30 cache/watch state is not authority.
31 wall-clock timestamps are not safety ordering.
32 late messages are evaluated against current context.
33 stale provider retries remain in effect-path closure.
34 crash between widening and enforcement yields no strong enforcement claim.
35 crash between invalidation and admission cannot create a phantom current admission.
36 crash between admission and invalidation preserves the historical admission for reconciliation.
37 safe non-action is valid under unresolved ordering.
38 selective coordination requires complete disjointness proof.
39 formal refinement is required before implementation assurance.
40 formal/runtime/deployment correctness remains unproven.

CANDIDATE THEOREM
Not formally proven: If all claim-relevant continuation, invalidation and scope-widening transitions are governed by one authoritative safety order, or by an equivalent cross-domain fencing protocol, and stale contexts cannot bypass the enforcement boundary, then no live effect can gain a newly discovered path under stale authority while that path is still unverified.
If ordering, closure or enforcement is unknown, the affected continuation cannot support the strong claim and must be blocked, fenced, revalidated or quarantined.

ARCHITECTURE CONSEQUENCE
The previous 'TrustExpansionTransition' now needs a direct relationship with Admission/Invalidation/Assurance Commit.
Candidate canonical path:
DISCOVERY -> IMPACT -> AUTHORITATIVE CUTOFF/ORDER -> SCOPE FREEZE -> CLOSURE -> PREPARE WIDENING -> ASSURANCE VALIDATION -> PROTECTED WIDENING COMMIT -> FENCE ACTIVATION -> ENFORCEMENT VERIFICATION -> EFFECT CONTINUATION.
Invalidation racing with this path is ordered in the same safety domain.

DEEP RULE
NO LIVE EFFECT MAY CROSS A NEW EFFECT-PATH BOUNDARY UNTIL THE NEW CONTEXT IS AUTHORITATIVELY COMMITTED AND ITS REQUIRED ENFORCEMENT IS VERIFIED.

Important limitation: this is an architectural candidate, not a proof. Actual linearizability, refinement and runtime enforcement remain open.

NEXT ATTACK
SAFETY ORDER FAILURE / CROSS-DOMAIN ATOMICITY / INDEPENDENT RESOURCE FENCE / PROVIDER CONTINUATION / CRASH AFTER EXTERNAL ATTEMPT. Question: if the authoritative safety order commits but the external provider continues old work during the transition, what minimum resource-side enforcement is necessary to preserve the claim?
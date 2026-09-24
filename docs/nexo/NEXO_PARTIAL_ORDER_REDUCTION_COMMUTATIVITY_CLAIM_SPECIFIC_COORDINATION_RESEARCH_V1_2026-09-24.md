# NEXO — PARTIAL-ORDER REDUCTION / COMMUTATIVITY / CLAIM-SPECIFIC COORDINATION — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

How far can Nexo reduce coordination by proving that effects commute for a specific claim, without hiding shared physical, temporal, recovery, compensation or provider interactions?

## External cross-check

TLA+ models concurrent systems as state machines with a next-state relation and supports checking properties over all behaviors represented by the model. citeturn0search2turn0search17 TLC also supports symmetry reduction, but Lamport explicitly notes that the modeler is responsible for establishing that the assumed symmetry is actually valid. citeturn0search18turn0search21 This is directly relevant: a coordination reduction is safe only when its reduction assumptions are themselves justified.

## Core result

Coordination can be reduced, but only through a claim-specific proof of independence/commutativity.

Key distinction:

NO_INTERACTION_PROVEN != NO_INTERACTION_OBSERVED

and:

COMMUTATIVE_FOR_ONE_CLAIM != COMMUTATIVE_FOR_ALL_CLAIMS.

Therefore a reduction must be represented as an explicit, context-bound claim rather than as a global property of the effect types.

## 1. Independence is property-relative

E1 and E2 may be independent for storage capacity but dependent for physical power, mission ordering, recovery, evidence, provider quota or a shared trust root.

Therefore INDEPENDENT(E1,E2,C) must include claim C.

## 2. Commutativity is semantic

Two operations can look different in code but commute semantically. Two operations can look identical but fail to commute because their targets, incarnations or contexts differ.

Candidate relation:

Commute(E1,E2,M,C)

means that every allowed execution order/interleaving produces equivalent safety-relevant outcomes for invariant M under context C.

It does not require identical world histories.

## 3. Safety-equivalence can be weaker than state-equivalence

For a given claim, E1→E2 and E2→E1 may produce different detailed states while both remain within the same safe region.

Candidate relation:

SafetyEquivalent(trace1,trace2,M)

rather than complete state equality.

This can enlarge safe concurrency without erasing distinctions needed by other claims.

## 4. Claim-specific boundaries

A pair can be safety-equivalent for M but not for audit history, exact accounting, causal reconstruction, provider billing, compensation or future recovery.

Reduction for one claim cannot erase distinctions required by another.

## 5. New object: CommutativityClaim

Candidate fields:
claim_id
effect_pair_or_set
invariant_scope
abstract_state_projection
context_identity
resource_incarnation_set
dependency_closure
interaction_closure
allowed_interleavings
excluded_interactions
safety_equivalence_relation
assumptions
evidence
verification_method
invalidation_triggers
owner.

Commutativity becomes an auditable safety claim.

## 6. State projection

Candidate Projection_M(S) contains only state relevant to claim M.

If E1 and E2 commute over this projection, unrelated state need not participate in their coordination.

But projection completeness is itself a proof obligation.

MISSING_RELEVANT_STATE must not silently become irrelevant state.

## 7. Projection completeness

Candidate:

ProjectionComplete(P,M,C)

means every state component capable of changing truth of M or validity of the commutativity proof is included.

If projection completeness is UNKNOWN, the commutativity claim remains UNKNOWN.

## 8. Interaction graph

Candidate edge types:
READ_WRITE
WRITE_WRITE
MUTUAL_EXCLUSION
ORDER_DEPENDENCY
FENCE_DEPENDENCY
SHARED_PHYSICAL_RESOURCE
SHARED_QUEUE
SHARED_PROVIDER
SHARED_AUTHORITY
SHARED_RECOVERY
SHARED_CONTINUITY
SHARED_EVIDENCE
SHARED_INVARIANT
SHARED_UNKNOWN.

Any relevant edge must be analyzed.

An absent observed edge is not automatically a proven absent edge.

## 9. Unknown interaction

UNKNOWN_INTERACTION != DISJOINT.

Possible responses:
discover;
bound;
establish an enforcement boundary;
weaken the claim;
coordinate conservatively;
HOLD/QUARANTINE.

## 10. Conditional commutativity

Some effects commute only if conditions hold.

Candidate:

Commute(E1,E2 | ConditionSet).

Conditions must be checked at protected admission and invalidated when they change.

## 11. Dynamic commutativity

A pair may start independent and become dependent after topology change, resource replacement, provider update, new delegation, queue creation, scope widening or policy change.

Therefore:

COMMUTATIVE_NOW != COMMUTATIVE_FOREVER.

## 12. Scope reduction

If a set S is proven non-interacting for claim M, its effects need not share the same CCD.

Candidate:

CCD_M(S) = only domains participating in TemporalInteractionClosure(M).

This is a candidate optimization, not a theorem.

## 13. Minimum coordination domain

The target is not the smallest possible domain. It is:

MINIMAL SAFE COORDINATION DOMAIN.

A smaller domain risks undercoordination; a larger domain preserves safety but reduces liveness/concurrency.

## 14. Pairwise independence may not compose

Critical result:

E1 may commute with E2.
E2 may commute with E3.
E1 may commute with E3.

Yet {E1,E2,E3} can still violate a higher-order invariant through aggregate quantity, nonlinear resource interaction or a shared mission constraint.

Therefore:

PAIRWISE_COMMUTATIVITY != SET_COMMUTATIVITY.

## 15. Higher-order interaction

Candidate InteractionArity:
unary
pairwise
group
mission-wide.

Closure must search beyond pairwise edges when the invariant permits higher-order interactions.

## 16. Aggregate commutativity

Candidate:

CommuteSet(S,M,C)

requires every relevant permutation/interleaving of S to preserve the claim, subject to the allowed transition model.

This is stronger than pairwise commutativity.

## 17. Intermediate-state safety

E1 and E2 can have safe endpoints but unsafe intermediate interleavings.

Therefore commutativity must include temporal/intermediate-state semantics.

## 18. Recovery interaction

Two effects may commute during normal execution but not during recovery because of UNKNOWN outcomes, shared history reconciliation, compensation paths or stale reservations.

Therefore:

NORMAL_COMMUTATIVITY != RECOVERY_COMMUTATIVITY.

Recovery belongs in the interaction closure.

## 19. Compensation interaction

E1 and E2 may commute normally. If E1 becomes UNKNOWN and recovery may compensate E1, E2 can become part of the compensation footprint.

Therefore possible recovery-generated effects must be included.

## 20. Provider interaction

Apparently independent Nexo effects may share provider quota, rate limiter, account, connection pool, queue, autonomous workflow or trust root.

Provider boundaries therefore belong in closure.

## 21. Physical interaction

Digital disjointness does not imply physical disjointness.

Separate logical resources can share power, thermal, mechanical, network or other physical constraints.

Physical footprint belongs in the commutativity proof when relevant.

## 22. Evidence interaction

Effects can be physically independent while sharing evidence history, compaction or invalidation.

Therefore:

EFFECT_INDEPENDENCE != EVIDENCE_INDEPENDENCE.

## 23. Continuity interaction

Shared continuity roots can invalidate prior commutativity after rollback/update.

Continuity dependencies can therefore force coordination.

## 24. Failure-domain interaction

Separate coordinators may share identity root, KMS, policy, storage, network, clock or recovery plane.

Separate CCDs do not automatically imply independent assurance.

## 25. New object: ReductionCertificate

Candidate fields:
reduction_id
claim_id
effect_set
reduced_coordination_domain
full_interaction_closure
omitted_domains
commutativity_proof_or_contract
projection_completeness
aggregate_constraints
temporal_constraints
recovery_compensation_paths
provider_environment_assumptions
failure_domain_assumptions
current_context_version
invalidation_triggers
verification_status.

ReductionCertificate is evidence/decision support, not authority by itself.

## 26. Candidate admission sequence

DISCOVER
→ COMPUTE CLOSURE
→ BUILD INTERACTION GRAPH
→ CHECK HIGHER-ORDER INTERACTIONS
→ PROJECT CLAIM STATE
→ PROVE/VALIDATE COMMUTATIVITY
→ CHECK AGGREGATE + TEMPORAL CONSTRAINTS
→ FREEZE REDUCTION CONTEXT
→ PROTECTED ADMISSION.

If any required closure/projection condition is UNKNOWN, the reduction cannot silently proceed for a strong claim.

## 27. Reduction invalidation

Invalidate on:
new dependency;
scope widening;
topology change;
resource replacement;
provider update;
policy/invariant change;
fence generation change;
recovery;
STOP;
new compensation path;
new retry/redrive path;
continuity context change;
failure-domain change;
evidence/proof-context change.

## 28. Safe reduction under uncertainty

A reduction can still be allowed if uncertainty is proven harmless:

SAFE_UNDER_INTERACTION_UNCERTAINTY(reduced_execution,U,M).

Otherwise coordination must expand or admission must hold.

## 29. Formal direction

Candidate REDUCIBLE(S,M,C) iff:
1. projection complete for M;
2. relevant interaction closure complete;
3. all allowed interleavings preserve M;
4. aggregate budgets remain valid;
5. temporal constraints remain valid;
6. recovery/compensation paths are included;
7. provider/environment assumptions are satisfied;
8. no required dependency is UNKNOWN;
9. reduction context is current.

Candidate safety property:

REDUCIBLE(S,M,C) => CCD_reduced(S,M) contains every interaction domain capable of invalidating M.

This requires formal proof.

## 30. Relation to model-checking reduction

TLA+/TLC can reduce model exploration using symmetry when symmetry is actually valid, but the tool does not establish the modeler's symmetry assumption automatically. citeturn0search18turn0search21

Architecturally:

REDUCTION_ASSUMPTION → EXPLICIT_CONTRACT → VALIDATE → USE

not:

REDUCTION_ASSUMPTION → TRUST.

The reduction itself becomes a proof obligation.

## 31. New invariant family INV-POR-01..34

01 Coordination reduction is claim-specific.
02 No reduction without closure completeness.
03 Unknown interaction is not disjointness.
04 Commutativity is semantic.
05 Commutativity is invariant-specific.
06 Safety equivalence may be sufficient without state equivalence.
07 Projection completeness is mandatory.
08 Missing relevant state invalidates reduction.
09 Conditional commutativity requires current conditions.
10 Dynamic changes invalidate reduction when relevant.
11 Pairwise commutativity does not imply set commutativity.
12 Higher-order interactions must be modeled when relevant.
13 Intermediate-state safety is part of commutativity.
14 Recovery can invalidate normal-execution commutativity.
15 Compensation can create new interactions.
16 Retries/redrives belong to interaction closure.
17 Provider shared state belongs to closure.
18 Physical shared state belongs to closure.
19 Evidence shared state can force coordination.
20 Continuity dependencies can force coordination.
21 Separate CCDs do not imply independent trust.
22 Aggregate budgets remain binding after reduction.
23 Temporal constraints remain binding after reduction.
24 Reduction certificate is not authority.
25 Reduction context must be current.
26 STOP invalidates incompatible reductions.
27 Recovery invalidates incompatible reductions.
28 Resource incarnation changes can invalidate reductions.
29 Scope changes can invalidate reductions.
30 Failure-domain changes can invalidate independence claims.
31 Safe-under-uncertainty may permit reduction only when proven.
32 Strong reduction claims require explicit assumptions.
33 Formal reduction requires model/refinement evidence.
34 Implementation reduction requires runtime enforcement evidence.

## 32. Major architectural result

CCD can now be derived conceptually from:

EFFECT/INVARIANT INTERACTION CLOSURE
+
AUTHORITATIVE COORDINATION REQUIREMENTS.

The goal is not to coordinate everything.

The goal is to coordinate every transition whose behavior can change the truth of this safety claim, and no fewer.

This is the strongest candidate definition of minimal safe coordination found so far.

## Remaining gaps

G-POR-01 formal commutativity theorem.
G-POR-02 higher-order interaction detection.
G-POR-03 projection completeness proof.
G-POR-04 temporal/intermediate-state reduction.
G-POR-05 recovery-aware reduction.
G-POR-06 compensation-aware reduction.
G-POR-07 provider/environment closure.
G-POR-08 physical interaction closure.
G-POR-09 evidence/continuity interaction.
G-POR-10 partial-order reduction algorithm.
G-POR-11 formal refinement from reduction certificate to implementation.
G-POR-12 actual SANY/TLC.
G-POR-13 fault-injection validation.
G-POR-14 long-duration invalidation/reduction rollover tests.

## Conclusion

The research does not support a generic "these effects are independent" flag.

It supports CLAIM-SPECIFIC REDUCTION where independence/commutativity is scoped, quantified, context-bound, closure-bound, invalidatable, recovery-aware, provider-aware, physical-aware and formally testable.

Strongest current principle:

REDUCE COORDINATION ONLY AFTER PROVING THAT THE OMITTED INTERACTIONS CANNOT CHANGE THE TRUTH OF THE CLAIM.

This is a design principle, not a verified theorem.

## Next attack

HIGHER-ORDER INTERACTIONS + NONLINEAR INVARIANTS + COMPOSITIONALITY.

Question: can Nexo compute a safe coordination domain when no pairwise conflict exists but a three-or-more-effect combination violates the mission invariant? This attacks hypergraph closure, compositional proofs and the limits of pairwise dependency analysis.

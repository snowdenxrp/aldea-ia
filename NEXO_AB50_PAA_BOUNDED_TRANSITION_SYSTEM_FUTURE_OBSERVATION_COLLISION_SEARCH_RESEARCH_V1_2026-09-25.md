# NEXO AB50 — PAA BOUNDED TRANSITION SYSTEM / FUTURE-OBSERVATION COLLISION SEARCH — 2026-09-25

Status: RESEARCH ONLY. No implementation and no formal verification.

## Purpose

AB50 operationalizes the AB49 research frontier as a bounded semantic search target. The objective is to determine whether the fixed non-oracular HistorySupport language is sufficient to reconstruct all P_AA-relevant future behavior, or whether a semantic residual remains.

This artifact is deliberately a research specification. A bounded clean result is evidence only; it is NOT a proof of minimality, sufficiency, refinement, or implementation correctness.

## Claim and boundary

First claim:

P_AA = authorization-to-admission safety.

For every admitted operation/attempt, the authorization context actually used by that admission must satisfy the claim-relative authorization, binding, policy, delegation, incarnation, protocol, freshness/order, replay, and boundary requirements.

Boundary:

Z1 -> Z3 admission authorization.

Z4 external effect/success remains outside this claim.

Therefore:
- admission authorization != external effect
- internal admission != provider success
- later revocation does not rewrite historical admission linkage
- absence of observed external effect does not prove no external effect

## Bounded domains

Use the smallest domain that can express cross-entity substitutions and joint transitions:

- Subjects: 2
- Operations: 2
- Attempts: 2
- Resources: 2
- Resource incarnations: 2
- Authority epochs: 2
- Policy contexts: 2
- Delegation contexts: 2
- Lease/bridge instances: 2
- Capabilities/scopes: 2
- Protocols: ATOMIC, LEASE, RECHECK
- Boundary contexts: fixed B0 for the first search
- Event instances: bounded sequence/partial-order length, increased until state-space growth becomes material

The temporal representation is an event relation/partial order, not a fixed three-slot timestamp model.

## Concrete event alphabet

AUTH_ISSUE
AUTH_REVOKE
EPOCH_ADVANCE
POLICY_CHANGE
DELEGATION_CHANGE
RESOURCE_REINCARNATE
LEASE_ISSUE
LEASE_EXPIRE
LEASE_RENEW
LEASE_CONSUME
ATTEMPT_CREATE
RETRY
DECIDE
ADMIT
ABORT
STUTTER

Every event instance has explicit identity and claim-relevant bindings.

## Non-oracular HistorySupport language

Allowed support primitives are exactly those established in AB49:

1. event identity/type
2. actual authority/bridge/recheck linkage
3. claim-relevant precedence/order
4. invalidation edges
5. atomic linearization facts
6. lease interval/expiry/renewal/consumption/replay facts
7. exact recheck fact-set and recheck-to-admission order
8. bounded auxiliary-history references
9. boundary/scope facts required by P_AA

Forbidden:

- FutureObs_PAA as stored data
- quotient equivalence as stored data
- an oracle returning eventual P_AA assessment
- implicit authority transitions
- hidden protocol semantics
- a field whose meaning is defined only as “whatever is necessary to preserve future behavior”

## Candidate semantic projection

For a concrete history H and admission a, define a candidate projection:

Q_AA(H,a) = <
  AuthorityContextAtAdmission,
  ResourceIncarnation,
  PolicyContext,
  DelegationContext,
  ActualAdmissionLink,
  AdmissionBindingClass,
  ProtocolSemantics,
  OrderAndLinearizationFacts,
  InvalidationFacts,
  ReplayAndConsumptionFacts,
  BoundaryFacts,
  RetainedSupport
>

The projection is claim-relative. It must not infer Z4 effect.

RetainedSupport is not allowed to be an oracle. It is generated only from the fixed support language above.

## Future observations

Obs_AA(H) is admission-indexed:

admission_id -> { TRUE_JUSTIFIED, FALSE, UNKNOWN }

UNKNOWN is a legitimate epistemic assessment. It is not FALSE and it is not a claim-strength value.

FutureObs_AA(H) is the set/trace of P_AA observations produced by all allowed continuations under the fixed threat model, including UNKNOWN outcomes.

The search compares future observations, not merely current observations.

## Collision criterion

A semantic collision exists if histories H1 and H2 satisfy all of:

1. same claim, boundary, assumptions and threat model
2. same Q_AA projection under the tested representation
3. both are legal concrete histories
4. both admit the compared continuation family
5. there exists an allowed continuation where P_AA observations differ
6. the difference is not merely an implementation-detail stutter

If all six hold, the projection is incomplete for P_AA.

A collision does NOT need to produce different current observations; future divergence is sufficient.

## Stuttering rule

A concrete step may be abstractly hidden only if hiding it preserves:

- current claim-relevant semantic context
- actual admission linkage
- protocol semantics
- order/linearization support
- invalidation/replay support
- boundary
- all future P_AA observations

If any of these become unresolved, the abstraction must return UNKNOWN/PENDING rather than silently stutter.

This follows the refinement/stuttering discipline: auxiliary variables may help construct a refinement mapping, and genuine stuttering leaves relevant abstract variables unchanged. Lamport's TLA+ material explicitly treats auxiliary variables as aids to refinement mappings and stuttering variables as steps that leave the relevant variables unchanged. See the external cross-check recorded for this round.

## Pairwise separator search

Re-test all AB49 separators:

ATOMIC:
- linearization point
- relevant-interleaving exclusion
- invalidation ordering
- immutable historical linkage
- boundary

LEASE:
- issuance-to-admission linkage
- expiry/interval
- renewal semantics
- replay/consumption
- policy/delegation/epoch/incarnation/boundary invalidation
- bridge-to-admission linkage
- renewal authority

RECHECK:
- exact fact-set
- recheck-to-admission order
- mutation detection
- actual result linkage
- attempt identity
- boundary

A separator is retained only when its removal permits a P_AA-relevant future observation difference.

## Higher-order joint attacks

Pairwise closure is not assumed complete. Enumerate at least these ternary/higher-order structures:

H1:
POLICY_CHANGE + DELEGATION_CHANGE + LEASE_RENEW

Question: can policy and delegation changes jointly make a renewal invalid in a way not represented by their pairwise projections?

H2:
AUTH_REVOKE + RETRY + LEASE_CONSUME/REUSE

Question: can revocation, attempt identity and bridge consumption jointly distinguish valid retry from invalid bridge reuse?

H3:
RESOURCE_REINCARNATE + LEASE_RENEW + ADMIT

Question: can renewal preserve scalar resource identity while jointly invalidating the required incarnation at admission?

H4:
RECHECK + POLICY/DELEGATION_MUTATION + ADMIT

Question: can a recheck result remain individually valid while the joint mutation-before-admission relation changes P_AA?

H5:
BOUNDARY_CHANGE/BOUNDARY_CONTEXT + LEASE_RENEW + RETRY

Question: can renewal and retry jointly cross a boundary even though each binary relation appears admissible?

H6:
POLICY_CHANGE + DELEGATION_CHANGE + RESOURCE_REINCARNATE + LEASE_RENEW

Question: does a four-way invalidation relation contain information that cannot be reconstructed from binary invalidation edges plus protocol facts?

H7:
RECHECK + MUTATION + RETRY + ADMIT

Question: can attempt reuse plus mutation plus recheck timing create a higher-order distinction not captured by pairwise order alone?

## Hyperedge criterion

A higher-order relation is semantically necessary only if:

1. the histories agree on all retained unary and allowed binary relations;
2. they agree on all protocol-specific primitives already retained;
3. they agree on all allowed pairwise order/invalidation/linkage facts;
4. they differ on a genuine k-ary relation needed by P_AA;
5. a legal future continuation exposes that difference as TRUE_JUSTIFIED vs FALSE or TRUE_JUSTIFIED vs UNKNOWN, or otherwise changes the P_AA observation;
6. the k-ary relation cannot be reconstructed deterministically from the retained primitives.

If condition 6 fails, the hyperedge is representationally redundant.

This is the key AB50 distinction:

PAIRWISE COMPLETENESS != JOINT RELATIONAL COMPLETENESS.

A hyperedge is not automatically a new runtime variable. It may be a relation in the EventDAG/closure representation.

## Typed hyperedge candidates

Use only when justified by the collision test:

- JOINT_INVALIDATES
- JOINT_BINDS
- JOINT_RENEWS
- JOINT_RECHECKS
- JOINT_REPLAY_DEP
- JOINT_BOUNDARY
- JOINT_PROTOCOL_CONSTRAINT

Do not introduce a generic JOINT_DEPENDS oracle.

Each hyperedge must identify its members, relation type, claim scope, boundary, validity/order context, and provenance/support.

## Hyperedge absorption test

For every discovered k-ary relation J, attempt reconstruction:

J = f(Linkage, Order, Invalidation, ProtocolSpecificFacts, AuxiliaryHistory)

Accept absorption only if f is:

- total, or safely returns UNKNOWN
- deterministic modulo P_AA-equivalence
- linkage-preserving
- transition-preserving
- future-observation-preserving
- non-amplifying with respect to authority
- boundary-preserving

If not, J is a genuine semantic residual candidate.

## LeaseBridge / AdmissionBindingClass attack

Do not merge these merely because both contain binding information.

AdmissionBindingClass answers:
“Which relational admission tuple is this?”

LeaseBridge answers:
“How are authorization facts carried safely from issuance/decision to admission?”

A collision that preserves both current classes but changes future renewal, expiry, replay, invalidation, or admission linkage defeats an attempted merge.

## HistorySupport reconstruction test

Candidate:

ReconstructHS(
  Linkage,
  Order,
  Invalidation,
  ProtocolSpecificFacts,
  AuxiliaryHistory
)

Required:

HS is exactly reconstructible when the function returns the unique claim-equivalent support needed to assess P_AA and preserve future transition behavior.

If multiple materially different reconstructions remain possible and their future observations differ, return UNKNOWN/PENDING rather than selecting one.

## Minimality dimensions

Do not confuse:

- field minimality
- relation minimality
- hyperedge minimality
- state minimality
- history minimality
- domain minimality
- representational packing

A relation may be semantically required while not requiring a separate runtime variable.

## Finite-search procedure

For bounded length n:

1. Enumerate legal event instances.
2. Enumerate legal bindings.
3. Enumerate protocol-specific event semantics.
4. Construct legal histories/partial orders.
5. Compute actual admission linkage.
6. Compute the fixed non-oracular support projection.
7. Group histories by projection equality.
8. For each group, enumerate legal future continuations up to depth k.
9. Compute P_AA observations.
10. Report any projection class containing distinct future observations.
11. For each collision, compute the smallest distinguishing relation/hyperedge.
12. Test whether that distinguisher is reconstructible from retained primitives.
13. Repeat with larger n/k until bounded-resource limits are reached.
14. Record the shortest separator for every surviving collision.

The result must include a counterexample trace for every claimed insufficiency.

## Search result classification

For each tested abstraction:

- NO_COLLISION_FOUND_BOUNDED
- COLLISION_FOUND
- UNKNOWN_DUE_TO_BOUNDS
- UNKNOWN_DUE_TO_MISSING_SEMANTICS

Never promote NO_COLLISION_FOUND_BOUNDED to PROVEN.

## Refinement obligation after bounded search

If no collision remains in the tested bound, formulate but do not yet claim a proof of:

R_AA(Hc,Ha)

such that:

1. initial concrete states map to valid abstract states
2. every concrete non-stuttering step has a corresponding abstract step
3. concrete stuttering preserves all abstract claim-relevant state
4. actual admission linkage is preserved
5. protocol semantics are preserved
6. order/invalidation support is preserved
7. authority is never amplified by abstraction
8. boundary/threat assumptions are preserved
9. unresolved distinctions become UNKNOWN/PENDING
10. observations are preserved in the required direction

Exact bisimulation is not assumed. A one-way safety refinement is sufficient only if the claim and direction are explicitly fixed.

## External cross-check

Lamport's TLA+ material states that auxiliary variables can be added to enable refinement mappings and that stuttering variables add steps which leave the relevant abstract variables unchanged. His TLA+ material also describes refinement as an implementation relationship checked through a suitable mapping; these ideas support the AB50 separation between semantic state, auxiliary history, and stuttering. citeturn0search24turn0search0turn0search3

## Status

- AB49 support language: established research constraint.
- AB50 bounded transition-search design: RESEARCH SPECIFICATION.
- Pairwise separator exhaustion: bounded evidence only.
- Higher-order joint closure: OPEN.
- Hyperedge necessity: OPEN.
- HistorySupport eliminability: OPEN.
- LeaseBridge/AdmissionBindingClass completeness: OPEN.
- Exact quotient congruence: OPEN.
- TLA+ verification: NOT PERFORMED.
- TLC: NOT PERFORMED.
- TLAPS: NOT PERFORMED.
- Implementation: NOT PERFORMED.
- Semantic freeze: NOT DECLARED.

## Next frontier — AB51

1. Enumerate minimal ternary joint separators.
2. Determine whether each ternary relation is reconstructible from pairwise/order/invalidation/protocol primitives.
3. Search four-event joint attacks where ternary closure passes.
4. Attempt explicit EventDAG hyperedge abstraction.
5. Attack congruence of the resulting projection under future transitions.
6. Only if the residual is closed enough, derive the next exact TLA+ model and refinement mapping.

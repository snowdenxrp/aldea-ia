# NEXO - HETEROGENEOUS EFFECT CONTRACTS / MISSION COMPOSITION RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question
When one mission invariant depends on multiple effects whose external providers have different contracts, can Nexo compose their assurance without either over-blocking the mission or falsely multiplying local guarantees into a global guarantee?

## External cross-check
Distributed Saga guidance confirms that local transactions can be composed into a larger workflow, but there is no built-in cross-service isolation; concurrent sagas can create anomalies and require explicit coordination/countermeasures. citeturn0search0turn0search12 AWS guidance likewise describes Saga as a sequence of local transactions with continuation or compensation rather than one atomic distributed transaction. citeturn0search1turn0search3 AWS also notes that exactly-once behavior across distributed systems is harder than at-most-once or at-least-once behavior, and idempotency tokens only help when the service honors their semantics. citeturn0search5

## Core result
Heterogeneous provider contracts must NOT be composed by averaging, voting, or taking the weakest contract globally.

The correct unit is the **mission invariant closure** plus the **interaction graph**.

For mission invariant M:
`Relevant(M) = effects + resources + temporal interactions + queues + retries + compensation + recovery + provider dependencies + shared physical/authority boundaries`.

Each relevant effect receives a claim-specific assurance vector rather than a scalar score.

## 1. Assurance vector
Candidate `EffectAssuranceProfile`:
- effect identity strength;
- attempt identity strength;
- resource/incarnation binding;
- idempotency semantics;
- fencing strength;
- cancellation semantics;
- observation/reconciliation strength;
- history retention/proof boundary;
- autonomous continuation closure;
- causal-order knowledge;
- temporal precision;
- dependency closure;
- continuity/currentness;
- external contract identity;
- uncertainty set;
- supported claim levels.

No numeric score. Each dimension is typed `PROVEN / BOUNDED / UNKNOWN / INAPPLICABLE` for the specific claim.

## 2. Why scalar weakest-link composition is wrong
Suppose E1 is strongly reconcilable, E2 is delayed but idempotent, E3 is non-reconcilable.
It is wrong to conclude either:
- "the whole mission is as weak as E3"; or
- "E1 and E2 compensate for E3".

The correct question is whether E3 can influence M, directly or through shared footprint, ordering, aggregate accounting, or future continuation.

If E3 is irrelevant to M under a complete closure proof, it need not participate in the strong claim.
If E3 can violate M, its weaker contract is a mandatory part of the mission admission proof.

## 3. Claim-specific composition
Candidate predicate:
`COMPOSE_SAFE(M,Eset,C)` iff the interaction/mission closure is complete and every allowed joint world and permitted interleaving preserves M under the current contracts.

This is stronger than:
`SAFE(E1) AND SAFE(E2) AND SAFE(E3)`.

Local safety does not automatically compose.

## 4. Joint uncertainty
Each effect has an uncertainty set:
`U1, U2, U3`.
The mission cannot simply use `U1 x U2 x U3` because correlations may exist.

Candidate:
`JOIN(U1,U2,...,SharedContext,InteractionContract)`.

The joined uncertainty must preserve correlations created by:
- shared resource;
- shared provider;
- shared queue;
- shared fence;
- shared authority;
- shared physical effect;
- shared timing;
- shared trust root;
- shared recovery;
- shared continuity;
- common external failure.

Unknown correlation must not be silently treated as independence.

## 5. Three provider contracts, one mission
Example:
E1 = strongly reconcilable;
E2 = idempotent but delayed;
E3 = non-reconcilable.

Case A: E3 disjoint from M.
If complete closure proves E3 cannot affect M, it may be excluded from the mission claim.

Case B: E3 affects M but its possible effect is bounded inside the safety region.
It can participate through `SAFE_UNDER_UNCERTAINTY` without resolving its exact outcome.

Case C: E3 affects M and UNKNOWN can violate M.
E3 becomes a mandatory member of the mission coordination/admission domain. If its contract cannot discharge the needed obligation, the mission operation is blocked or reduced to a weaker claim.

Case D: E3 shares a physical/resource boundary with E1/E2.
Local contract strength cannot isolate it automatically. The combined resource interaction becomes part of the closure.

## 6. Mission closure before provider composition
Sequence:
`DISCOVER MISSION INVARIANT`
`-> COMPUTE INVARIANT CLOSURE`
`-> BUILD EFFECT/RESOURCE INTERACTION GRAPH`
`-> CLASSIFY CONTRACTS`
`-> BUILD JOINT UNCERTAINTY`
`-> CHECK TEMPORAL/AGGREGATE CONSTRAINTS`
`-> COMPUTE SAFE COORDINATION DOMAIN`
`-> ADMIT or BLOCK`.

This prevents provider contract quality from being evaluated independently of the invariant.

## 7. Contract heterogeneity is a graph problem
Nodes:
- effects;
- providers;
- resources;
- queues;
- recovery paths;
- mission invariants.

Edges:
- shared footprint;
- order dependency;
- budget/conservation dependency;
- mutual exclusion;
- fence dependency;
- causal dependency;
- compensation dependency;
- shared trust/continuity;
- evidence dependency.

The relevant composition domain is the graph closure around M, not every provider in the system.

## 8. No global weakest-link rule
A non-reconcilable E3 does not poison unrelated claims.
But if E3 can change M, then its uncertainty cannot be ignored merely because another effect has a stronger contract.

Therefore:
`LOCAL_CONTRACT_STRENGTH != MISSION_CONTRACT_STRENGTH`.

Mission strength is derived from the joint closure and proof obligations, not from an arithmetic combination of provider scores.

## 9. Delayed idempotent provider
E2 may eventually provide a stable outcome but remain UNKNOWN during a window.
During that window, Nexo must evaluate whether E2's uncertainty can violate M when combined with E1/E3 and their concurrent effects.

A delayed observation is not automatically a failed contract; it is a temporal assurance state.

## 10. Non-reconcilable provider
E3 can still be admitted in narrow cases if:
- its effect is bounded;
- every possible outcome preserves M;
- its effect boundary is enforceable enough to prevent unbounded continuation;
- its interaction closure is complete;
- no required historical claim depends on knowing the exact outcome.

Otherwise it must be blocked for any mission claim it can violate.

## 11. Commutativity as a composition escape hatch
If E1 and E2 are proven commutative for M and their aggregate constraints are preserved, they may not need a shared fine-grained coordination domain.

But:
`COMMUTATIVE_FOR_M != COMMUTATIVE_FOR_ALL_CLAIMS`.

And pairwise commutativity is insufficient if E1+E2+E3 has a higher-order interaction.

## 12. Higher-order interaction
Three effects can be individually pairwise compatible yet jointly violate a mission invariant.

Therefore mission composition requires:
`PAIRWISE_INTERACTION_ANALYSIS + HIGHER_ORDER_INTERACTION_CHECK`.

Candidate `InteractionArity`:
unary, pairwise, group, mission-wide.

A group-level interaction may arise from aggregate capacity, conservation, temporal occupancy, or a nonlinear invariant.

## 13. Assurance composition is not authority composition
Even if all evidence/assurance requirements are satisfied, authority must still be independently established for each protected transition.

`PROOF/ASSURANCE != AUTHORITY`.

Likewise:
`MISSION_SAFE != WORLD_KNOWN`.

## 14. Heterogeneous recovery
Recovery policies must be effect-class-specific.
For E1, reconcile may resolve UNKNOWN.
For E2, wait/query/revalidate may be appropriate.
For E3, safe containment or permanent degraded state may be the only safe response.

A generic recovery engine cannot choose one retry/compensation rule for all three.

## 15. Heterogeneous compensation
If compensation for E1 is safe but E3 is non-reconcilable, compensation of E1 must still be evaluated against E3's unresolved possible worlds if they share M.

Therefore a strong local compensation contract does not automatically justify global compensation.

## 16. Mission budget composition
For budget invariant M, unresolved consumption from any relevant effect must remain represented.

Example:
Budget 10.
E1 known consumption 2.
E2 unknown consumption in [0,3].
E3 unknown consumption in [0,4].

Known 2 is not enough to claim remaining capacity 8.
The safe mission state must reason over the joint allowed range and any correlations.

If worst-case exceeds the safety boundary and no stronger correlation proof exists, admission is blocked or constrained.

## 17. Temporal composition
For temporal invariant M, the mission model must preserve:
- start/end bounds;
- overlap;
- delayed effects;
- provider continuation;
- retry/redrive windows;
- compensation windows;
- STOP/fence activation windows.

A provider with excellent historical reconciliation can still be unsafe if its autonomous continuation can overlap another effect in a forbidden interval.

## 18. Contract drift composition
If E2's provider contract changes, only claims whose closure depends on that contract need to be invalidated—provided selective invalidation closure is complete.

If dependency impact is UNKNOWN, affected mission claims become UNKNOWN rather than remaining CURRENT.

This connects the mission composition plane to the Invalidation/Impact Plane.

## 19. Minimal coordination domain
Candidate rule:
`CCD(M) = closure of all transitions capable of changing the truth of M, reduced only by claim-specific proven independence/commutativity/absorption.`

A weak E3 outside this closure does not force mission coordination.
A weak E3 inside it cannot be hidden behind stronger E1/E2 contracts.

## 20. Candidate composition theorem
Not formally proven:
If the mission invariant closure is complete; the joint uncertainty preserves all relevant correlations; all permitted interleavings and higher-order interactions are covered; each effect's contract discharges its claim-specific obligations; and the resulting coordination/boundary domain is current and enforced, then heterogeneous effect contracts can be composed for M without requiring every unrelated effect to satisfy the strongest global contract.

If any premise is UNKNOWN, the composed mission claim cannot be promoted beyond the affected assurance level.

## 21. Candidate invariants INV-HET-01..34
01 Heterogeneous contracts are composed per mission claim.
02 No scalar provider score substitutes for semantic contract analysis.
03 Local safety does not imply mission safety.
04 Stronger provider assurance cannot erase relevant weaker-provider uncertainty.
05 Weaker provider assurance does not affect unrelated claims if disjointness is proven.
06 Joint uncertainty preserves shared correlations.
07 Unknown correlation is not independence.
08 Mission closure precedes contract composition.
09 Contract sufficiency is claim-specific.
10 Delayed observation is distinct from failure.
11 Non-reconcilable effects may be admissible only when all allowed outcomes preserve M or an absorbing boundary is proven.
12 Non-reconcilable effects that can violate M must be blocked.
13 Shared physical footprints defeat purely local contract composition.
14 Shared queues/continuations belong to mission closure when M-relevant.
15 Shared fences belong to mission closure when M-relevant.
16 Shared recovery paths belong to mission closure when M-relevant.
17 Pairwise commutativity does not imply set commutativity.
18 Higher-order interactions must be represented when relevant.
19 Aggregate invariants require group-level analysis.
20 Temporal invariants require temporal closure.
21 Compensation is evaluated against joint uncertainty.
22 Recovery policy is effect-class-specific.
23 Assurance composition does not grant authority.
24 Mission safety does not prove world knowledge.
25 Contract drift invalidates dependent mission assurance.
26 Selective invalidation requires complete impact closure.
27 Unknown impact prevents unjustified currentness.
28 CCD is derived from invariant interaction closure.
29 Overapproximation may reduce liveness but is preferable to unsafe underapproximation for strong safety claims.
30 Underapproximation of a relevant weak provider is safety-dangerous.
31 Degraded mission claims must be explicit.
32 A provider can satisfy one mission claim and fail another.
33 Mission composition cannot assume global exactly-once semantics.
34 Generic recovery must not invent semantics absent from an effect contract.

## Architectural result
Nexo should not have a single global "provider reliability" score or a single weakest-link rule.

Instead:
`MISSION INVARIANT -> CLOSURE -> INTERACTION GRAPH -> EFFECT CONTRACT PROFILES -> JOINT UNCERTAINTY -> COMPOSITION -> CCD -> ADMISSION`.

This lets a strong provider remain useful without allowing its assurance to mask a weak provider that can still affect the same invariant.

## Open gaps
G-HET-01 formal heterogeneous-contract composition theorem.
G-HET-02 automated mission closure.
G-HET-03 correlated uncertainty representation.
G-HET-04 higher-order interaction detection.
G-HET-05 compositional refinement to provider implementations.
G-HET-06 mission-level temporal model checking.
G-HET-07 selective invalidation integration.
G-HET-08 heterogeneous recovery policy formalization.
G-HET-09 actual SANY/TLC/TLAPS.
G-HET-10 implementation/fault-injection evidence.

## Next attack
MISSION INVARIANT + JOINT UNCERTAINTY + HIGHER-ORDER EFFECT INTERACTION + DYNAMIC SCOPE CHANGES.
Question: if the set of effects relevant to a mission invariant changes while an admission decision is being prepared—because a provider discovers a child effect, a queue expands, a resource is replaced, or topology changes—can the composition remain safe without freezing the entire mission?
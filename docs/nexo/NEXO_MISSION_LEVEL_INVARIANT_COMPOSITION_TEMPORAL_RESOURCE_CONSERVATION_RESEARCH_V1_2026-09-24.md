# NEXO — MISSION-LEVEL INVARIANT COMPOSITION / TEMPORAL RESOURCE CONSERVATION — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question
Can individually valid reservations/effects collectively violate a mission invariant through temporal overlap, delayed release, compensation, recovery, or UNKNOWN external consumption?

## External cross-check
AWS treats quotas and physical/service constraints as explicit architecture concerns and recommends capacity margins for failover. AWS also recommends throttling and limiting retries because retries consume limited resources and can create retry storms. Kubernetes ResourceQuota provides an aggregate resource-limit analogue. citeturn0search10turn0search6turn0search1turn0search12

## Core result
Yes. A mission invariant cannot generally be reduced to the sum of independently valid local reservations.
Relevant dimensions include simultaneous occupancy, temporal overlap, delayed release, UNKNOWN external consumption, compensation, recovery, resource incarnation, transfers, causal order and shared physical constraints.
Therefore LOCAL_VALIDITY != MISSION_INVARIANT_VALIDITY.

## 1. Resource conservation is temporal
Abstractly: Q_available(t) = Q_total - Q_committed(t) - Q_unknown(t).
UNKNOWN consumption cannot automatically be treated as zero when unresolved external effects may have consumed the conserved quantity.
UNKNOWN_CONSUMPTION != ZERO_CONSUMPTION.

## 2. Reservations are not world effects
Candidate lifecycle: UNRESERVED → RESERVED → CONSUMPTION_ATTEMPTED → CONSUMED_CONFIRMED / CONSUMPTION_UNKNOWN → RELEASED / RECONCILIATION_REQUIRED.
A reservation protects capacity in the control domain; it does not prove external consumption or release.

## 3. Delayed release
An effect can look finished locally while an external resource remains occupied or capable of producing the effect.
LOCAL_TERMINATION != RESOURCE_RELEASE unless the external contract proves equivalence.
If release is UNKNOWN, capacity should not be reclaimed for a strong conservation claim.

## 4. Temporal overlap
E1 may be locally valid during interval [t1,t4] and E2 during [t3,t5]. Their overlap can violate a shared invariant even if each local claim is valid.
Therefore temporal occupancy and overlap can be safety-relevant state.

## 5. Transfer is potentially composite
If quantity moves from resource A to B, an unknown external release at A plus confirmed acquisition at B can mean conservation, duplication, loss or partial transfer.
When the mission invariant depends on conservation, transfer needs a composite contract rather than two unrelated local effects.

## 6. Compensation under UNKNOWN
If E1 may or may not have consumed Q, a compensation that releases Q can be safe in one possible world and unsafe in another.
Therefore compensation requires SAFE_UNDER_JOINT_UNCERTAINTY(action, U), or remains blocked.

## 7. Recovery cannot restore historical accounting
After crash, recovery may find historical reservations, current resources, UNKNOWN consumption, new resource incarnations and delayed provider work.
Conceptual sequence: restore historical accounting → create current recovery context → identify UNKNOWN consumption → reconcile resources → recompute current budget → revalidate mission invariant → explicit release.

## 8. Local versus mission invariant
Two effects can each satisfy a local limit while violating a global invariant. Example: A <= 10 and B <= 10 locally, while the mission invariant is A + B <= 10.
Thus local safety does not imply mission safety.

## 9. New object: MissionInvariant
Candidate fields: invariant_id, scope, resources, effect classes, quantity semantics, time semantics, allowed/forbidden states, conservation relation, ordering requirements, uncertainty treatment, compensation/recovery semantics, resource incarnation dependencies, required evidence, assumptions, verification method and invalidation triggers.

## 10. New object: MissionResourceState
Candidate fields: resource identity/incarnation, available quantity, reserved quantity, confirmed consumption, UNKNOWN consumption, confirmed release, UNKNOWN release, transfers in/out, fence generation, context identity, verification boundary and claim status.
When this state participates in a safety invariant, its authoritative subset becomes protected state.

## 11. New object: TemporalOccupancy
Candidate fields: occupancy identity, effect identity, resource/incarnation, start/end boundaries, reservation state, external-effect state, uncertainty, fence generation and context.
This prevents temporal overlap from being inferred only from delayed observations.

## 12. Mission-level claim
MISSION_SAFE(C,M,t) means that mission invariant M holds at the relevant protected boundary under current context C and the specified uncertainty/assumption set.
It is stronger than independent RESOURCE_SAFE claims.

## 13. Mission claim requirements
A strong mission claim requires: complete relevant effects; shared-footprint interactions; temporal overlap semantics; aggregate budgets; unresolved external consumption accounting; compensation/recovery paths; current incarnations; current fences; adequate evidence; and assumptions strong enough for the invariant.
If required information is UNKNOWN, the claim becomes HOLD/DEGRADED unless the invariant is proven insensitive to that uncertainty.

## 14. Bounded uncertainty
Exact knowledge is not always necessary. If the possible quantity range remains entirely within the safe region, a bounded uncertainty claim may remain valid.
Example: if all worlds consistent with evidence satisfy max(Q) <= limit, the invariant can survive UNKNOWN.
If the uncertainty interval crosses the safety boundary, the strong claim cannot be promoted.

## 15. Future safety versus historical truth
STOP + FENCE + NO_NEW_ADMISSIONS may guarantee no additional covered effects, but does not prove historical consumption.
FUTURE_SAFETY != HISTORICAL_ACCOUNTING.
This preserves the previous absorbing-state result.

## 16. Observation-point safety versus interval safety
Two observations can both appear safe while the interval between them violated the invariant.
Therefore SAFE_AT_OBSERVATION_POINTS does not imply SAFE_OVER_INTERVAL unless the effect/transition contract proves it.

## 17. Rate, quantity and duration
Mission invariants may depend simultaneously on instantaneous rate, cumulative quantity, exposure duration and maximum overlap.
Quantity-only budgets are insufficient when duration or rate matters.

## 18. Autonomous continuation
If a provider can continue after Nexo considers an effect complete, that continuation belongs to the mission invariant closure.
NEXO_DONE != WORLD_RELEASED unless the external protocol proves equivalence.

## 19. Recovery and compensation consume budget
Recovery work, retries and compensation may themselves consume the same resources protected by the mission invariant.
Therefore recovery and compensation belong to aggregate closure whenever they can affect the invariant.
COMPENSATION != FREE_UNDO.

## 20. New concept: InvariantClosure
InvariantClosure(M) is the complete set of effects, resources, temporal intervals, transfers, queues, retries, compensations, recovery paths, providers, dependencies, fences, budgets and continuity state whose behavior can change the truth of M.
A mission claim is inadmissible when required invariant closure is incomplete.

## 21. New concept: SafetyRegion
For invariant M, SAFE_REGION(M) is the set of allowed states.
An action is admissible only if every relevant successor state under the allowed uncertainty remains in the safe region, or if an explicitly verified transition contract permits the intermediate states.

## 22. Intermediate-state safety
SAFE(pre) and SAFE(post) do not imply SAFE(all intermediate states).
For physical or mission invariants, the transition itself may need a TransitionEnvelope describing permitted intermediate states, temporal/rate constraints, uncertainty and enforcement.

## 23. Mission atomicity grain
Possible grains: command, resource effect, bounded effect group, protected transaction, mission invariant.
The correct grain depends on the invariant. EFFECT_ATOMICITY != MISSION_ATOMICITY.

## 24. New invariant family INV-MI-01..32
01 Local safety does not imply mission safety.
02 UNKNOWN consumption is not zero consumption.
03 Local termination does not prove external release.
04 Released reservation is not external release unless the contract proves equivalence.
05 Temporal overlap is safety-relevant when simultaneous occupancy matters.
06 Future reservation requires protected validity semantics.
07 Transfers may require composite conservation contracts.
08 Compensation under UNKNOWN requires joint-uncertainty safety.
09 Recovery cannot restore historical accounting as current truth.
10 Resource incarnation changes invalidate incompatible accounting evidence.
11 Mission invariants have their own closure.
12 Mission claims cannot exceed invariant closure.
13 Bounded conservation is valid only when the claim permits it.
14 UNKNOWN is tolerable only when every allowed world remains safe.
15 Observation-point safety does not prove interval safety.
16 Rate, quantity and duration may all be safety-relevant.
17 Autonomous continuation belongs to invariant closure.
18 Recovery work belongs to aggregate closure when relevant.
19 Compensation is a new resource-consuming effect.
20 Intermediate states may require safety verification.
21 Safe pre/post states do not imply a safe transition.
22 Mission atomicity grain is invariant-specific.
23 Local reservations cannot independently violate a protected mission budget.
24 Concurrent reservations require authoritative coordination.
25 Delayed release cannot be assumed immediate.
26 UNKNOWN release cannot be reclaimed for strong claims without adequate evidence.
27 STOP constrains future effects but does not classify historical consumption.
28 Fencing future paths does not erase prior accounting uncertainty.
29 Mission recovery establishes current context before releasing budget.
30 Mission claims depend on current fences, incarnations and continuity.
31 Safety-critical capacity exhaustion can be a mission assurance event.
32 Strong mission claims require explicit temporal and uncertainty semantics.

## 25. Formal direction
Candidate mission states: SAFE, SAFE_WITH_BOUNDED_UNCERTAINTY, UNKNOWN, VIOLATED, QUARANTINED.
Candidate predicate: MISSION_SAFE(S,M,C,U) requires every relevant world in U and every permitted transition under C to satisfy M, subject to the invariant's stated temporal semantics.
Candidate accounting: AvailableBound = Total - Reserved - ConfirmedConsumption - UpperBound(UnknownConsumption), with the exact expression defined per effect class/invariant rather than assumed universally.

## 26. Architectural consequence
The clean architecture now has multiple distinct closure layers: EFFECT CLOSURE, DEPENDENCY CLOSURE, CONTRACT CLOSURE, AGGREGATE CLOSURE and INVARIANT CLOSURE.
They are related but not interchangeable. Each claim must identify which closure is sufficient for the property being asserted.

## Remaining gaps
G-MI-01 formal temporal invariant semantics.
G-MI-02 formal bounded-uncertainty arithmetic.
G-MI-03 transfer conservation contract.
G-MI-04 delayed-release semantics.
G-MI-05 intermediate-state safety.
G-MI-06 temporal occupancy linearization.
G-MI-07 multi-resource mission coordination.
G-MI-08 recovery/compensation budget composition.
G-MI-09 physical-resource model.
G-MI-10 mission-level scope computation.
G-MI-11 formal refinement.
G-MI-12 actual TLC/SANY.
G-MI-13 implementation refinement.
G-MI-14 fault injection with temporal overlap and delayed release.
G-MI-15 long-duration rollover/resource-accounting tests.

## Conclusion
The mission-level boundary is now clear: INDIVIDUAL EFFECT SAFETY does not imply MISSION INVARIANT SAFETY.
Nexo must reason about state + time + uncertainty + interaction + resource conservation.
Research principle: a mission claim is valid only if every relevant world consistent with current evidence remains inside the invariant's safe region under the allowed transitions. This is a design principle, not a proven theorem yet.

## Next attack
MISSION INVARIANT + TEMPORAL ORDER + CONCURRENT TRANSITIONS + UNKNOWN_ORDER.
The next question is whether two transitions that are individually safe and collectively budget-safe can still violate a mission invariant because their causal order is unknown or their intermediate states interact.
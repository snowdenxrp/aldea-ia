# NEXO — MULTI-RESOURCE QUARANTINE / CROSS-DOMAIN FENCING RESEARCH V1

Date: 2026-09-24
Status: RESEARCH ONLY. No V21. No implementation.

## 1. Research question
Can a single quarantine claim safely cover multiple resources, domains, queues and downstream effects when fencing/continuity is not atomic across them?

## 2. Core result
A global quarantine claim is valid only if its protected effect scope is closed and every path capable of producing a prohibited effect is either:
- under one protected enforcement boundary;
- covered by coordinated current fences with explicit cross-domain semantics; or
- proven unable to produce the prohibited effect.

Therefore:
PARTIAL QUARANTINE != GLOBAL CONTAINMENT.

A, B and C can each be individually fenced while a hidden D path still permits the protected effect.

## 3. Fencing cross-check
Fencing is effective only where the protected resource actively checks the fencing context and rejects stale operations. This means issuing a token or updating a coordinator is insufficient if another resource/path does not enforce the same boundary. citeturn0search0

For multi-service workflows, saga-style coordination does not inherently provide cross-service isolation; semantic locks, commutative operations, version checks or stronger transaction mechanisms may be required depending on the invariant. citeturn0search13

## 4. Containment grain
Candidate containment grains:
G0 command
G1 effect
G2 resource
G3 bounded effect group
G4 protected transaction
G5 mission/business invariant

A containment claim must declare its grain.

Example:
RESOURCE_A_FENCED does not imply TRANSACTION_T_FENCED if T also affects B and B remains reachable.

Likewise:
EFFECT_E1_BLOCKED does not imply MISSION_SAFE if E2 can violate the same mission invariant.

## 5. Cross-domain partial fence
Sequence:
E1 UNKNOWN
→ quarantine requested for A+B+C
→ fence A succeeds
→ fence B succeeds
→ C fence times out
→ local coordinator crashes.

Safe interpretation:
A and B may have verified containment claims.
The group/mission containment claim is UNKNOWN or HOLD unless C is proven irrelevant/unreachable for the protected invariant.

Forbidden promotion:
2/3 fences succeeded → GLOBAL_QUARANTINE_VERIFIED.

## 6. Shared queue attack
Suppose A and B are fenced, but both receive work through queue Q.
An old message M can still produce an effect through an un-fenced consumer C.

Then the queue/consumer path belongs to the protected effect footprint.

Candidate rule:
If a queued descendant can independently produce the protected effect, it is part of the containment footprint even if the parent operation is quarantined.

## 7. Child-effect attack
Parent E0 is quarantined.
Before quarantine, E0 created child E1.
E1 has its own execution path.

Parent containment does not automatically fence E1.
The effect graph must include descendants that can still cross the protected effect boundary.

Candidate closure:
EFFECT_FOOTPRINT(E0) = direct effects + reachable protected descendants + retry paths + queued work + provider-side continuation where relevant.

## 8. Mixed fence generations
A has fence 51.
B has fence 44.
C has fence UNKNOWN.

The numbers cannot be compared globally unless they belong to one defined ordering domain.

Therefore:
NUMERIC FENCE VALUE != GLOBAL SAFETY ORDER.

Cross-resource safety requires either:
- a common ordering/epoch with defined semantics; or
- a protected coordination protocol that establishes the required cross-domain relation.

Otherwise each resource has only a local fence claim.

## 9. Independent fences are not automatically atomic
Even if A and B both support resource-side fencing, this sequence is possible:
A fence advances
→ crash
→ B fence not advanced.

Therefore independent fences do not automatically constitute an atomic multi-resource quarantine.

Candidate protocol states:
GROUP_QUARANTINE_REQUESTED
→ PARTICIPANT_FENCES_PREPARING
→ PARTICIPANT_FENCES_VERIFIED
→ GROUP_CONTAINMENT_VERIFIED

If any mandatory participant is unresolved:
GROUP_CONTAINMENT = UNKNOWN/HOLD.

## 10. When partial quarantine can still be sufficient
Partial containment can satisfy a claim if the claim's prohibited effects are proven to have no path through the uncontained participants.

Example:
Mission M uses resources A+B, while C is observational only and cannot actuate or enqueue protected work.
A+B fenced may be sufficient for the mission safety claim.

But that conclusion requires dependency/effect-footprint closure, not intuition.

## 11. Cross-domain hidden dependency
A may appear isolated while sharing:
- queue;
- credential;
- control plane;
- provider account;
- resource;
- downstream worker;
- recovery service;
- update mechanism;
- shared physical actuator.

A common dependency can make separate fences insufficient for an independence claim.

## 12. Decommission interaction
If A is decommissioned while B remains active, B may still recreate or trigger the effect formerly produced by A.

Therefore decommission is not containment unless the effect graph proves the retired participant was the final reachable producer.

Candidate requirement:
DECOMMISSIONED participant must be removed from the active effect graph, or every remaining path must be explicitly classified as safe/blocked.

## 13. Resource replacement interaction
A replaced resource gets a new incarnation.
The quarantine boundary must be re-established for the new incarnation before protected operations are admitted.

Old fence state cannot simply be assumed to apply to the replacement.

Therefore:
REPLACEMENT = NEW_ENFORCEMENT_CONTEXT.

Historical uncertainty attached to the old incarnation remains separate.

## 14. Mission-level false positive
A dangerous false conclusion is:
ALL_NAMED_RESOURCES = FENCED
therefore
MISSION = SAFE.

Correct predicate is closer to:

SAFE_MISSION_CONTAINMENT =
ALL_REACHABLE_PROTECTED_EFFECT_PATHS
ARE_CURRENTLY_BLOCKED OR PROVEN_HARMLESS.

This makes effect-path closure a prerequisite to mission-level containment.

## 15. Candidate containment proof object
Research candidate:
`ContainmentClaim`

Fields:
- claim_id
- scope
- prohibited_effect_class
- effect_graph_version
- participant_set
- resource_incarnations
- required_fences
- fence_contexts
- queue/child paths
- dependency closure
- exclusions with proof of irrelevance
- continuity anchor
- evidence set
- verification status
- freshness/context version
- invalidation triggers
- release/decommission semantics

This is a research object, not canonical yet.

## 16. Candidate verification rule
A containment claim is VERIFIED only if:
1. effect footprint is closed for the claim;
2. every mandatory path is fenced or proven harmless;
3. fence enforcement is current and verified;
4. resource incarnations are current;
5. queue/child/provider continuations are bounded;
6. required dependencies are known and within acceptable trust state;
7. continuity has not regressed;
8. evidence is bound to the current context;
9. no mandatory participant remains UNKNOWN.

If any required condition is UNKNOWN:
HOLD / QUARANTINE / DOWNGRADE CLAIM.

## 17. Safety versus atomicity
A global quarantine does not necessarily require a single distributed atomic transaction if the safety claim can be decomposed into independent barriers.

But decomposition itself becomes a proof obligation.

Candidate decomposition rule:
A group claim may be decomposed only when no unresolved participant can alter the safety invariant, cross-resource order, compensation semantics, shared footprint, or protected downstream effect.

This extends the previous multi-resource uncertainty research.

## 18. Formal safety invariant candidate
For containment claim C and every protected effect e in its closed footprint:

If C is VERIFIED and e is prohibited under C, then no transition may linearize e unless the transition carries a current release context satisfying C's scope and fence requirements.

The claim is intentionally abstract and NOT TLC-verified.

TLC can check invariants over reachable states and produce a counterexample trace when an invariant is violated; actual execution has not been performed for Nexo. citeturn0search11turn0search9

## 19. New distinction
We now need:
LOCAL_CONTAINMENT
vs
GROUP_CONTAINMENT
vs
MISSION_CONTAINMENT.

And:
LOCAL_FENCE_CURRENT
vs
CROSS_DOMAIN_CONTAINMENT_VERIFIED.

A local positive result must not be promoted automatically to a broader claim.

## 20. Candidate invariants
INV-MQF-01 Partial quarantine never implies global containment without effect/dependency closure.
INV-MQF-02 Every protected descendant capable of producing the prohibited effect belongs to the containment footprint.
INV-MQF-03 Shared queues and downstream consumers are included when they can produce protected effects.
INV-MQF-04 Local fence generations cannot be compared globally without an ordering contract.
INV-MQF-05 Independent participant fences do not imply atomic group quarantine.
INV-MQF-06 Unknown mandatory participant blocks group containment verification.
INV-MQF-07 Partial containment is admissible only for a claim whose excluded participants are proven irrelevant/harmless.
INV-MQF-08 Resource replacement creates a new enforcement context.
INV-MQF-09 Decommission does not remove an effect path unless closure proves it.
INV-MQF-10 Mission containment requires closure over reachable protected effect paths.
INV-MQF-11 Local containment evidence cannot be promoted to group/mission evidence without explicit refinement.
INV-MQF-12 Group containment remains invalid if continuity of a mandatory enforcement boundary is unknown.

## 21. Architecture consequence
The clean architecture should not expose a single universal `safe=true` result.

Claims must be scoped:
- resource claim;
- effect claim;
- bounded transaction/group claim;
- mission invariant claim.

The verification layer must know exactly which scope was proven and must prevent accidental promotion.

## 22. Research conclusion
The multi-resource attack closes an important semantic gap:

`ALL_RESOURCES_FENCED` is not equivalent to `GLOBAL_CONTAINMENT`.

Containment is a property of a closed effect graph, current enforcement, resource incarnations, dependency closure and continuity—not a count of successful fence operations.

The next major problem is now clear:
**WHAT HAPPENS WHEN TWO OR MORE CONTAINMENT DOMAINS SHARE AN EFFECT, QUEUE, PROVIDER OR PHYSICAL RESOURCE?**

That is the cross-domain shared-footprint problem. It may determine whether the architecture needs hierarchical containment, a shared fencing root, or an explicit non-atomic containment protocol.

DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED.

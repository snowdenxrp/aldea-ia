# NEXO — SHARED FOOTPRINT / MULTI-DOMAIN CONTAINMENT RESEARCH V1

Date: 2026-09-24
Status: RESEARCH ONLY. No V21. No implementation.

## 1. Question
What happens when two containment domains share a queue, provider, effect, credential, physical resource, or downstream execution path?

## 2. Core result
Independent containment domains cannot safely compose by conjunction alone when they share a protected effect footprint.

`CONTAINED(A) ∧ CONTAINED(B) != CONTAINED(A∪B)` unless a composition/refinement contract proves that no shared path can violate the combined claim.

This is consistent with distributed workflow research: saga coordination does not inherently provide transaction isolation, and concurrent work can observe stale state; stronger semantic locking or another isolation mechanism may be needed for the invariant. citeturn0search0turn0search5

## 3. Shared footprint
Candidate shared-footprint elements:
- shared physical actuator/resource;
- shared queue/topic/event bus;
- shared worker/executor;
- shared provider account/API;
- shared credential/key/trust root;
- shared downstream child effect;
- shared compensation path;
- shared recovery/decommission path;
- shared ordering/fence domain.

If two domains can influence the same prohibited effect through any of these, they are not independent for that claim.

## 4. Example
Domain A owns effect E1.
Domain B owns effect E2.
Both enqueue to Q.
Q feeds worker W.
W can produce physical effect P.

A quarantine of E1 and B quarantine of E2 do not prove P is contained unless Q/W/P are included in the containment closure.

## 5. Composition rule
Candidate:

`COMPOSE(CA, CB)` is valid only if:
1. effect scopes are disjoint OR interaction contract is proven;
2. shared resources have an explicit common enforcement rule;
3. no shared queue can carry stale work across a containment boundary;
4. shared credentials cannot bypass the fence;
5. shared provider semantics are understood;
6. shared recovery/release ownership is serialized or explicitly coordinated;
7. cross-domain causal order required by the claim is established;
8. each domain's claim remains valid under the other's allowed actions.

Otherwise composition status = UNKNOWN/HOLD.

## 6. Shared queue attack
A quarantine is established in A.
Old message M from A remains in shared queue Q.
B's consumer W is still active.
W executes M after A is quarantined.

Therefore queue admission, message validity and consumer fencing belong to the effect footprint.

A producer-side fence is insufficient if a consumer-side path can still create the protected effect.

## 7. Shared provider attack
A and B use the same external provider P.
A is quarantined.
B remains authorized.
Provider cannot distinguish which domain originated a request, or both domains share a capability.

A local domain fence cannot prove global provider containment.

The provider must support a domain/effect identity and current authorization/fence semantics, or the global claim must exclude that provider path.

## 8. Shared physical resource
Two controllers A and B can actuate resource R.
A is quarantined.
B is still active.

A's quarantine does not establish R-level containment.

For a claim “R cannot receive protected effect E,” containment must exist at R or at every controller/path capable of producing E.

This is stronger than process isolation and consistent with the principle that logical isolation must be enforced at the relevant runtime boundary rather than inferred from resource separation alone. citeturn0search7

## 9. Shared credential / trust root
A and B have different processes but share a credential, key, identity provider or trust root.

They may be operationally separate but not independent for a claim involving compromise of that dependency.

Therefore:
`PROCESS_SEPARATION != TRUST-DOMAIN SEPARATION`.

This extends the previous common-mode research.

## 10. Shared recovery domain
A is quarantined.
B is the recovery owner.
B can also release A's shared provider capability.

This creates hidden authority coupling.

Recovery ownership must be scope-bound and cannot silently acquire authority over another containment domain merely because a shared dependency exists.

If cross-domain recovery is required, it needs an explicit protected coordination protocol.

## 11. Shared compensation path
A UNKNOWN effect may require compensation.
B can independently produce an effect on the same resource.

A's compensation cannot be evaluated without considering B's possible concurrent effects.

Therefore the uncertainty set becomes joint:
`W = WA × WB × interaction_history`

The admissibility predicate becomes:
`SAFE_UNDER_JOINT_UNCERTAINTY(action)`.

This extends the previous uncertainty-set and compensation-race research.

## 12. Shared ordering domain
A and B each have local epochs.
A epoch 20 and B epoch 7 cannot be interpreted as globally ordered merely by numeric comparison.

If the claim requires causal order between A and B, the architecture needs:
- common ordering authority; or
- explicit cross-domain relation/fence; or
- a claim that does not depend on that order.

Otherwise `UNKNOWN_ORDER` remains a first-class state.

## 13. Containment composition theorem candidate
Research candidate:

If CA and CB are independently verified containment claims, their conjunction can be promoted to a combined claim C only if a refinement mapping demonstrates that every behavior allowed by CA and CB, including shared-resource interactions, satisfies C's invariant.

This is directly aligned with the TLA+ notion of implementation/refinement: a lower-level specification must imply the higher-level specification under a refinement mapping; merely sharing names or independently checking local invariants is insufficient. citeturn0search24

Not formally proven for Nexo.

## 14. Minimal shared-footprint contract
Candidate `EffectInteractionContract` should be expanded with:
- shared scope;
- participants;
- resource identity/incarnation;
- interaction type;
- ordering requirement;
- commutativity;
- mutual exclusion;
- allowed concurrency;
- fence authority;
- queue semantics;
- provider semantics;
- compensation semantics;
- failure behavior;
- recovery ownership;
- decommission behavior;
- claim impact.

## 15. Composition classes
Research classification:

C0 DISJOINT
No shared protected footprint.

C1 SHARED-BUT-HARMLESS
Shared dependency exists but is proven irrelevant to the claim.

C2 COORDINATED
Shared footprint requires explicit common coordination/fencing.

C3 INTERLOCKED
Claims cannot be independently released; combined protocol required.

C4 UNKNOWN
Shared interaction semantics insufficiently known.

C0/C1 may permit composition.
C2 requires a composition protocol.
C3 requires a combined safety domain.
C4 blocks strong combined containment.

These labels are research candidates, not final canonical names.

## 16. False independence patterns
The following must not be accepted as proof of independence:
- different processes;
- different hosts;
- different containers;
- different models;
- different queues if they converge downstream;
- different credentials if they share a trust root;
- different providers if they share physical/control infrastructure;
- different recovery owners if one can release the other's shared effect path;
- separate local fences with no cross-domain ordering.

## 17. Split-brain composition
A believes combined containment is established.
B believes only local containment is established.

The strongest safe common claim is the intersection of what both authoritative domains can establish, not the union of optimistic beliefs.

If no common authoritative decision exists, combined release must remain blocked.

## 18. Decommission interaction
If A is decommissioned while B remains active on a shared footprint, the combined claim must be recomputed.

Decommission can remove one actor but can also change the effect graph, routing, failover path or ownership.

Therefore decommission is an invalidation trigger for shared containment claims.

## 19. Queue draining is not automatically historical proof
A queue can be empty at observation time without proving an earlier message never executed.

Thus:
`QUEUE_EMPTY != HISTORICAL_NO_EFFECT`.

Drain/quiescence can contribute to a current containment claim while historical effect truth remains UNKNOWN.

## 20. Candidate invariants
INV-SFC-01 Independent local containment does not imply combined containment over shared footprints.
INV-SFC-02 Every shared protected effect path belongs to the combined containment closure.
INV-SFC-03 Producer-side fencing cannot alone prove safety if an un-fenced consumer can create the protected effect.
INV-SFC-04 Shared provider capability requires provider-level effect/domain binding or exclusion from the claim.
INV-SFC-05 Shared physical resources require resource-level containment or complete controller-path closure.
INV-SFC-06 Shared trust dependencies prevent automatic independence claims.
INV-SFC-07 Cross-domain recovery cannot silently acquire release authority.
INV-SFC-08 Compensation under shared-footprint UNKNOWN is evaluated against joint uncertainty.
INV-SFC-09 Local epochs are not globally ordered without an explicit contract.
INV-SFC-10 Combined claims require refinement/composition evidence, not conjunction of local PASS results.
INV-SFC-11 Decommission invalidates shared-footprint containment claims requiring recomputation.
INV-SFC-12 Queue drain does not prove historical no-effect.
INV-SFC-13 Unknown shared interaction blocks strong combined containment.

## 21. Architecture consequence
A clean Nexo architecture likely needs a first-class notion of `ContainmentDomain` and `SharedFootprint` or an equivalent graph relation, even if the final object names differ.

The verification layer must know:
- what domain a claim covers;
- what it shares;
- what interactions are permitted;
- where the enforcement boundary actually resides;
- whether the combined claim has a refinement proof.

This prevents local safety claims from being accidentally composed into a global safety claim.

## 22. Research conclusion
The major result is:

`SAFE(A) ∧ SAFE(B)` is not enough when A and B share an effect footprint.

The correct abstraction is composition over behaviors and shared dependencies, not Boolean aggregation of local statuses.

This pushes the architecture toward a graph-based containment model with explicit composition/refinement semantics.

## 23. Next attack
NEXT: **CONTAINMENT HIERARCHY + OWNERSHIP / RELEASE ACROSS NESTED DOMAINS**.

Questions:
- Can a child containment domain release while its parent remains quarantined?
- Can a parent quarantine safely override all children?
- What happens when child and parent have different epochs/policies?
- Can one child be decommissioned without invalidating the parent claim?
- How are nested shared footprints represented?
- What is the single release linearization point for a hierarchy?
- Can a child escape through a sibling's shared path?
- How does recovery ownership transfer through nested containment?

DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED.

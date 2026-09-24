# NEXO — MULTI-ANCESTOR CONTAINMENT COORDINATION RESEARCH V1

Date: 2026-09-24
Status: RESEARCH ONLY. No V21. No implementation.

## 1. Question
Can a protected effect with multiple ancestors have a single effective safety order when ancestors concurrently quarantine/release, topology changes, resource incarnations change, and recovery begins?

## 2. External cross-check
Kubernetes uses optimistic concurrency on shared Lease objects so concurrent acquisition attempts do not both succeed; the accepted update is selected by versioned concurrency control. This is an example of serializing a coordination decision, not proof of external-world effect serialization. citeturn0search0turn0search1

etcd transactions similarly atomically evaluate multiple comparisons and apply a success/failure branch, while linearizable operations provide current-state ordering through consensus. This is useful as a coordination analogy, not as proof that a Nexo external effect becomes atomic. citeturn0search2turn0search6

TLA+ treats concurrent behavior as state transitions and supports refinement between specifications; this gives a suitable formal framing for a multi-ancestor admission protocol. citeturn0search36turn0search4

## 3. Core result
A child with multiple ancestors should not independently choose among ancestor constraints.

For protected effect E:
`ApplicableConstraints(E) = authoritative closure of all relevant ancestors + shared-footprint constraints`.

If the constraints are compatible, a protected admission can bind them together.
If they conflict and no explicit precedence/coordination contract exists, admission is HOLD/QUARANTINE.

## 4. No numeric global ordering
P1 epoch=100 and P2 epoch=7 cannot be compared merely by numeric value.

A single effective order requires an explicit coordination relation.

Candidate relations:
- common coordination sequence;
- shared containment transaction;
- explicit precedence graph;
- common fencing authority;
- or a claim that does not require cross-ancestor order.

Otherwise `UNKNOWN_ORDER` remains valid.

## 5. Race: P1 quarantine vs P2 release
C is under P1 and P2.
P1 issues quarantine.
P2 issues release.

If the effect is inside both scopes, neither child-local operation can decide alone.

Candidate rule:
`RELEASE(E)` must validate the complete current ancestor closure at its protected admission point.

If P1 quarantine linearizes first, P2 release cannot bypass it unless an explicit precedence relation says the effect is outside P1's constraint.

## 6. Race: simultaneous quarantine
P1 and P2 both quarantine C.

This can be safe if each transition is monotonic and their constraints are compatible.

However, publishing two independent claims can create inconsistent views:
- P1 believes containment complete;
- P2 believes containment complete;
- C/resource fence only partially active.

Therefore local completion does not imply combined containment.

## 7. Race: conflicting constraints
P1 says effect class X prohibited.
P2 says X allowed.

The child must not select the weaker rule merely because it is newer locally.

Candidate resolution:
1. explicit scope precedence;
2. explicit effect-class precedence;
3. common authoritative coordination;
4. otherwise HOLD.

No implicit “latest timestamp wins” rule.

## 8. Race: child moves between ancestors
Initial:
P1 → C
P2 → D

During containment transition C is moved under P2.

The topology change changes `EffectiveSafetyScope(C)`.

Any in-flight decision bound to the old topology becomes stale if its claim depends on ancestry.

Candidate behavior:
`TOPOLOGY_CHANGE → INVALIDATE DEPENDENT DECISION → RECOMPUTE CLOSURE → REVALIDATE`.

## 9. Race: shared resource incarnation changes
C uses resource R incarnation I7.
During transition R is replaced by I8.

A fence/evidence bound to I7 cannot automatically establish enforcement on I8.

Candidate:
`RESOURCE_REPLACEMENT → INVALIDATE RESOURCE-BOUND CLAIMS → ESTABLISH I8 FENCE → REVERIFY`.

This extends the existing resource-incarnation and continuity research.

## 10. Race: stale release after both quarantines
P1 and P2 quarantine.
An old release request arrives afterward.

Arrival order is irrelevant.
The request must carry and be checked against current context/fence/ancestor closure.

Stale request → DENY.

A valid new release must be a new protected transition satisfying both ancestors.

## 11. Race: one fence succeeds, another rolls back
P1 fence advances.
P2 fence activation fails or rolls back.

If P2 is required for the claim, combined containment remains UNKNOWN/HOLD.

The successful P1 fence remains useful as a defensive local barrier, but cannot be promoted into the combined claim.

## 12. Recovery starts before claim publication
Sequence:
quarantine transition → required fences active → crash before claim publication → recovery.

Recovery must reconstruct the current transition state and independently verify whether the required fences are still active/current.

It cannot infer verification solely from the existence of a durable intent or prior progress record.

Candidate states:
`INTENT_DURABLE → PARTIALLY_ENFORCED → ENFORCEMENT_RECONCILIATION → VERIFIED or HOLD`.

## 13. Does a single containment coordination domain become necessary?
Not universally.

A single coordination domain is strongly indicated when:
- effects share a protected resource;
- ancestor constraints can conflict;
- release requires simultaneous validation;
- ordering between ancestors is safety-relevant;
- one actor can bypass another's fence;
- topology changes must be serialized with release;
- a combined claim requires a single linearization point.

Independent domains remain possible when their scopes are proven disjoint or their interaction contract provides equivalent coordination.

## 14. Candidate concept: Effective Constraint Closure
For effect E:
`ECC(E) = ancestors(E) ∪ shared-footprint constraints(E) ∪ resource/fence constraints(E) ∪ claim-specific dependencies(E)`.

Admission requires evaluation of the current ECC.

The closure itself is versioned/context-bound because topology and dependencies can change.

## 15. Candidate concept: Containment Coordination Domain
Research candidate, not final object.

A CCD is the smallest authoritative coordination scope that must serialize or jointly validate safety-relevant containment/release transitions for a claim.

It need not equal an organizational domain, process, host, or deployment unit.

It is determined by safety interaction, not software topology.

## 16. CCD minimality
A CCD should not automatically absorb the whole system.

Candidate rule:
Include the smallest set of domains/resources whose concurrent behavior can change the truth of the protected claim.

Too small → unsafe underapproximation.
Too large → unnecessary liveness/availability loss.

This mirrors the earlier dependency-closure tradeoff.

## 17. Precedence graph alternative
A full shared coordinator may be unnecessary if constraints can be represented by an authoritative precedence graph.

Example:
`P1 > P2` for effect class X.

But precedence itself becomes safety-critical state and needs:
- currentness;
- authority;
- versioning;
- continuity;
- change invalidation;
- conflict resolution;
- protected publication.

So this does not remove the coordination problem; it changes its representation.

## 18. Multi-ancestor release candidate
`RELEASE_ELIGIBLE(E)` only if:
1. current identity/authority valid;
2. current topology/EffectiveSafetyScope valid;
3. all applicable ancestor constraints permit E;
4. shared-footprint constraints permit E;
5. required fences current;
6. required STOP/recovery constraints permit E;
7. dependencies known/acceptable;
8. required evidence/reconciliation valid;
9. protected release linearization succeeds.

Any required condition UNKNOWN → HOLD/REVALIDATE unless the claim contract explicitly permits that uncertainty.

## 19. Conflict is not just policy conflict
Two ancestors can disagree because their state is from different generations, not because policy semantics actually conflict.

Therefore first classify:
- same current context, semantic conflict;
- stale context, invalidation;
- topology mismatch, recompute;
- dependency mismatch, revalidate;
- genuinely conflicting authoritative constraints, explicit conflict protocol.

This avoids treating stale data as a policy disagreement.

## 20. Common-mode issue
Two ancestor coordinators may appear independent but share:
- storage;
- trust root;
- identity provider;
- time source;
- update source;
- network/control plane;
- recovery mechanism.

Therefore two CCDs are not automatically independent evidence or independent safety roots.

This extends the existing common-mode research.

## 21. Candidate invariants
INV-MAC-01 A protected effect cannot bypass any applicable authoritative ancestor constraint.
INV-MAC-02 Numeric epochs from distinct domains do not imply global order.
INV-MAC-03 Conflicting applicable constraints block admission absent explicit precedence/coordination.
INV-MAC-04 Topology changes invalidate dependent in-flight containment/release decisions.
INV-MAC-05 Resource incarnation changes invalidate resource-bound fencing/evidence.
INV-MAC-06 Successful local quarantine does not imply combined containment.
INV-MAC-07 Stale release requests cannot linearize after a newer protected quarantine boundary.
INV-MAC-08 Recovery cannot promote durable intent/progress into current enforcement without verification.
INV-MAC-09 A coordination domain is defined by safety interaction, not deployment topology.
INV-MAC-10 Coordination scope must include every participant capable of changing the protected claim.
INV-MAC-11 Overbroad coordination may reduce liveness but underbroad coordination may violate safety; the scope tradeoff is explicit.
INV-MAC-12 Precedence rules are themselves safety-critical state.
INV-MAC-13 Common-mode dependencies prevent automatic independence claims between coordination domains.
INV-MAC-14 Release eligibility is derived from the current effective constraint closure, not a cached boolean.

## 22. Formal model candidate
The next formal kernel can use:
- Domains = {P1,P2,...};
- Effects = {E1,...};
- Parent relation;
- Shared-footprint relation;
- Constraint state;
- Fence generation per resource/domain;
- Resource incarnation;
- Topology generation;
- Containment transition;
- Release transition;
- Recovery transition;
- durable intent;
- enforcement verification.

Safety properties should include:
1. no admitted effect violates an applicable current constraint;
2. no stale release crosses a newer quarantine boundary;
3. topology changes invalidate stale decisions;
4. resource incarnation changes invalidate old fence/evidence;
5. combined claim is never VERIFIED with an unresolved required participant.

TLC should first explore small finite domains and adversarial interleavings. Any result would remain model-level evidence, not implementation correctness.

## 23. Research conclusion
A single global containment coordinator is not automatically required.

What is required is a **single authoritative safety ordering wherever concurrent actions can change the truth of the same claim**.

That ordering can be implemented by:
- shared coordination;
- protected transaction/compare-and-swap domain;
- explicit precedence graph;
- or another mechanism proven equivalent by refinement.

The key is not “one coordinator.”
The key is:
`ONE AUTHORITATIVE SAFETY ORDER PER INTERACTING CLAIM`.

## 24. Next attack
NEXT: **MINIMAL COORDINATION DOMAIN / SCOPE COMPUTATION**.

Determine whether the coordination scope itself can be computed safely from effect/dependency/shared-footprint closure, how dynamic footprints affect it, whether scope computation can race with topology changes, and whether a stale or under-approximated scope can create a safety hole.

DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED.

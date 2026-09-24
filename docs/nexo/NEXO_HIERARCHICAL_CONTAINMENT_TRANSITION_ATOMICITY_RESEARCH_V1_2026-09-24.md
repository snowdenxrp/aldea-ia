# NEXO — HIERARCHICAL CONTAINMENT TRANSITION ATOMICITY RESEARCH V1

Date: 2026-09-24
Status: RESEARCH ONLY. No V21. No implementation.

## 1. Question
What is the minimum protected atomicity required when parent quarantine, child fences, shared-footprint constraints and release decisions change concurrently?

## 2. External cross-check
TLA+ treats concurrent systems as state-transition systems and distinguishes safety invariants from liveness. Refinement is used to show that a lower-level implementation implements a higher-level specification; this is relevant because a hierarchical containment implementation must preserve the abstract containment invariant across concrete transition interleavings. citeturn0search2turn0search24

Fencing requires enforcement at the protected resource: a stale actor must be rejected after a newer fencing context is active. This means a coordinator-side transition alone cannot establish the external boundary. citeturn0search0

## 3. Core result
There is no single universal "atomicity" for hierarchical containment.

We must distinguish:
- decision atomicity;
- authority-state atomicity;
- fence activation atomicity;
- admission atomicity;
- observation atomicity;
- external effect atomicity.

A parent quarantine can be internally linearized while a child/resource fence is still not externally enforced.

Therefore:
`PARENT_QUARANTINE_LINEARIZED != GLOBAL_CONTAINMENT_VERIFIED`.

## 4. Race A — parent quarantine vs child release
Initial:
P active, C active.

Concurrent operations:
R1 parent quarantine
R2 child release

If R2 can linearize after P's protected quarantine boundary, it must be rejected. If R2 linearizes before the parent boundary, the resulting effect must be included in the quarantine transition's external-history analysis.

Candidate rule:
Every child admission decision must bind the current applicable parent constraint at its own protected admission/linearization point.

A stale cached parent state is insufficient.

## 5. Race B — parent fence advances before child fence
Sequence:
P fence = 20
C fence = 20
→ P advances to 21
→ C remains 20
→ crash

If the parent claim says the child is contained, but C still accepts operations under 20, the parent claim cannot be externally verified merely because P's fence is 21.

Candidate distinction:
`PARENT_FENCE_CURRENT != DESCENDANT_ENFORCEMENT_CURRENT`.

## 6. Race C — child executes during propagation
Sequence:
P quarantine requested
→ P state changed
→ propagation to C delayed
→ C executes old capability
→ C resource accepts effect
→ C receives quarantine

This execution is not automatically a bug or automatically safe. Its classification depends on the exact protected transition boundary and the claim.

Therefore the architecture must define whether the parent quarantine boundary is:
1. admission-only;
2. authority-state linearization;
3. resource-fence activation;
4. global effect prohibition.

These are different claims.

## 7. Candidate quarantine transition contract
A protected quarantine transition should identify:
- quarantine_id;
- claim scope;
- effect classes prohibited;
- parent/ancestor constraints;
- affected child domains;
- shared-footprint closure;
- required fence set;
- required fence activation evidence;
- required resource incarnations;
- linearization point;
- crash semantics;
- retry/idempotency semantics;
- late-message semantics;
- release invalidation;
- reconciliation requirements;
- verification claim.

## 8. Two-phase containment candidate
Research candidate:

PHASE 1 — PREPARE CONTAINMENT
- compute closure;
- freeze admission for new protected effects;
- identify participants;
- issue/prepare current fences;
- bind versions/incarnations;
- establish durable intent.

PHASE 2 — COMMIT CONTAINMENT
- activate required fences;
- establish protected quarantine linearization;
- verify mandatory resource-side enforcement;
- publish containment claim.

This resembles a transaction protocol conceptually, but is NOT a claim that distributed 2PC is required or sufficient. The architecture must evaluate crash windows and external resource semantics separately.

## 9. Why PREPARE != CONTAINED
A prepared fence can still be:
- not activated;
- activated in only some participants;
- lost on restart;
- rejected by a resource;
- stale relative to another domain;
- disconnected from a shared queue/child path.

Therefore:
`PREPARED != ENFORCED != VERIFIED`.

## 10. Partial activation
Suppose required participants are A, B, C.
A and B fence successfully.
C times out.

Correct global state:
`GROUP_CONTAINMENT = UNKNOWN/HOLD`.

The system may retain A/B local fencing as a defensive measure, but cannot promote to global verification unless C is proven irrelevant or safely blocked by another boundary.

## 11. Release race
A child release request arrives while parent quarantine is being established.

Release must bind the same protected context used by the quarantine transition.

Candidate ordering:

if quarantine linearizes first:
`release → DENY/INVALIDATE`.

if release linearizes first:
`effect outcome → becomes part of quarantine history/reconciliation`.

No message arrival order can replace the protected ordering relation.

## 12. Late message
A child sends an old release/execute request after parent quarantine commits.

The request must be evaluated using current fence/context, not timestamp or network arrival order.

A stale request must be rejected at the protected admission/resource boundary.

## 13. Hierarchy change during transition
Hard case:
P contains C.
Containment transition starts.
While it is running, C is moved under Q.

The old transition's topology is now stale.

Candidate rule:
Topology/hierarchy changes are safety-relevant context changes and invalidate any in-flight containment/release decision whose scope depends on the old topology.

The decision must restart/revalidate against the new effective safety scope.

## 14. Conflicting ancestors
A child C has ancestors P and Q with different constraints.

Candidate effective constraint:
`APPLICABLE_CONSTRAINTS(C) = closure of all authoritative ancestor constraints relevant to the effect class`.

If constraints conflict, the child cannot choose the weaker one.

Conflict must resolve through an explicit authoritative policy or fail closed.

Candidate rule:
`CONFLICTING_PROTECTED_CONSTRAINTS → HOLD/QUARANTINE` unless an explicitly verified precedence relation exists.

## 15. Parent quarantine as admission guard
A scalable model may avoid copying quarantine state into every child.

Instead:
`ADMIT(child_effect) = current_child_authority ∧ current_parent_constraints ∧ current_fence_set ∧ dependency_valid ∧ claim_valid`.

But this only works if the admission boundary actually consults these predicates atomically/equivalently with the protected transition.

A cached or eventually updated guard cannot support a strong atomic containment claim by itself.

## 16. Minimum atomicity grain
Candidate hierarchy:
G0 intent record
G1 authoritative admission state
G2 coordination/fence state
G3 resource-side enforcement
G4 containment claim verification
G5 external effect/world state

No single mechanism is assumed to atomically cover G0–G5.

Therefore the clean architecture should explicitly state which guarantee exists at each grain and use reconciliation between grains.

This extends the earlier rule:
`CONTROL_ATOMICITY != COORDINATION_ATOMICITY != EFFECT_ATOMICITY != OBSERVATION_ATOMICITY`.

## 17. Linearization candidate
For a hierarchical containment claim H, candidate abstract linearization is:

`H_CONTAINMENT_LINEARIZED`

only when the protected authority state has committed the rule that covered effects are no longer admissible without a new release context.

However, this does NOT by itself prove that every external resource has already enforced the rule.

Thus after linearization:
`EXTERNAL_ENFORCEMENT = PENDING/VERIFIED`.

The claim cannot be upgraded to `CONTAINMENT_VERIFIED` until required enforcement evidence is obtained.

## 18. Critical consequence
This gives us two distinct moments:

1. `AUTHORITY_CUTOFF_LINEARIZATION`
   The system's authoritative state says the old path is no longer admissible.

2. `ENFORCEMENT_VERIFICATION`
   Required protected resources have demonstrated rejection/enforcement of the new boundary.

A safety architecture can use the first to prevent new authorization and the second to support the stronger external containment claim.

## 19. Crash windows
Relevant windows include:
W1 before prepare
W2 after intent durable, before fence activation
W3 some fences active, some inactive
W4 authority cutoff committed, enforcement pending
W5 enforcement active, verification not recorded
W6 verification recorded, before claim publication
W7 claim published, before downstream observers update
W8 crash after partial recovery

Each window needs explicit restart semantics.

## 20. Safe default
If a critical boundary is uncertain:
- block new protected effects;
- preserve the quarantine/revocation intent durably;
- re-establish current fences;
- reconcile external effects;
- invalidate stale release decisions;
- do not claim global containment until mandatory enforcement is verified.

## 21. Candidate invariants
INV-HCTA-01 Parent quarantine and child release cannot both authorize the same protected effect across a single protected ordering boundary.
INV-HCTA-02 Parent authority cutoff does not imply external enforcement verification.
INV-HCTA-03 Child admission must use current applicable parent constraints.
INV-HCTA-04 Partial fence activation cannot be promoted to global containment without closure/proof.
INV-HCTA-05 PREPARED != ENFORCED != VERIFIED.
INV-HCTA-06 Late messages are judged by current protected context, not arrival time.
INV-HCTA-07 Safety-relevant hierarchy changes invalidate dependent in-flight decisions.
INV-HCTA-08 Conflicting ancestor constraints fail closed absent explicit precedence.
INV-HCTA-09 Recovery after any crash window cannot restore superseded release authority.
INV-HCTA-10 Containment claim publication requires the exact scope and evidence actually verified.
INV-HCTA-11 Authority cutoff and enforcement verification are separate claims.
INV-HCTA-12 Unknown critical enforcement blocks strong containment verification.
INV-HCTA-13 Release eligibility requires all applicable ancestor constraints.
INV-HCTA-14 No single atomicity mechanism is assumed to cover control, coordination, external effect and observation simultaneously.

## 22. Architecture consequence
The clean architecture likely needs a first-class transition protocol for safety-boundary changes, not merely a state mutation.

Candidate abstract protocol:
`REQUEST → CLOSURE → PREPARE → AUTHORITY_CUTOFF → FENCE_ACTIVATION → ENFORCEMENT_VERIFICATION → CLAIM_PUBLICATION → RECONCILIATION`.

Release is symmetric but not identical:
`REQUEST → CURRENT_SCOPE → CONSTRAINT_VALIDATION → FENCE/STOP VALIDATION → PROTECTED_RELEASE_LINEARIZATION → EFFECT_ADMISSION → OBSERVATION/RECONCILIATION`.

## 23. Formalization consequence
This is a strong candidate for the first formal model of the clean architecture because it is small enough to model but exercises:
- hierarchy;
- fencing;
- concurrency;
- stale actors;
- crashes;
- delayed messages;
- release races;
- shared footprint;
- refinement between authority and external enforcement.

TLC is explicitly designed to check executable TLA+ specifications for safety/liveness, while SANY parses and checks syntax/semantic errors; Nexo has not run either on this new model yet. citeturn0search6

## 24. Research conclusion
The minimum safe semantics are not “quarantine=true.”

They are a transition protocol that separates:

`AUTHORITY_CUTOFF`
`FENCE_ACTIVATION`
`ENFORCEMENT_VERIFICATION`
`CONTAINMENT_CLAIM`

This preserves the crucial distinction:
`INTERNAL LINEARIZATION != EXTERNAL CONTAINMENT`.

The research now has a candidate formal kernel: a small hierarchical containment state machine with explicit crash windows and refinement from abstract authority cutoff to concrete fence enforcement.

## 25. Next attack
NEXT: **CONCURRENT QUARANTINE / RELEASE / TOPOLOGY CHANGE WITH MULTIPLE ANCESTORS**.

Construct adversarial schedules where:
- two ancestors quarantine simultaneously;
- one ancestor releases while another quarantines;
- child moves between parents during the race;
- a shared resource changes incarnation;
- a stale release arrives after both transitions;
- one fence succeeds and another rolls back;
- recovery starts before the final containment claim is published.

Goal: determine whether a single effective safety order can be defined, or whether the architecture requires a dedicated containment consensus/serialization domain.

DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED.

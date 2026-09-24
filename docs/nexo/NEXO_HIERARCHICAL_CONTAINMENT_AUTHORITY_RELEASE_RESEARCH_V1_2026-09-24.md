# NEXO — HIERARCHICAL CONTAINMENT / AUTHORITY / RELEASE RESEARCH V1

Date: 2026-09-24
Status: RESEARCH ONLY. No V21. No implementation.

## 1. Question
How should nested containment domains compose authority, fencing and release when parents, children and siblings have different scopes, generations and shared footprints?

## 2. Core result
Hierarchy must not be interpreted as simple boolean inheritance.

`PARENT_QUARANTINED` does not by itself prove every child is externally contained, and `CHILD_RELEASED` does not by itself override a parent safety barrier.

The clean model needs separate concepts for:
- scope;
- authority;
- containment;
- ownership;
- fence generation;
- release eligibility;
- shared-footprint relations.

## 3. Candidate hierarchy rule
For a child effect E under parent domain P:

If P's containment claim prohibits E, then E cannot linearize unless a current release context explicitly satisfies the parent's applicable constraint as well as the child's.

Therefore child release is subordinate to all applicable higher-scope constraints, unless the architecture explicitly defines the child as outside the parent's protected scope.

## 4. Parent quarantine
Candidate behavior:
PARENT_QUARANTINED
→ all child release paths become non-eligible for effects covered by P.

This is a derived consequence, not necessarily a mutation of every child state.

A child may retain historical progress while becoming unable to execute.

Important:
`CHILD_STATE != CHILD_RELEASE_ELIGIBILITY`.

## 5. Child quarantine
A child can be quarantined while the parent remains active.

This does not necessarily require parent quarantine if:
- child scope is correctly bounded;
- child has no shared protected path that can affect parent invariants;
- sibling/parent paths cannot recreate the prohibited effect;
- release of the child cannot bypass parent controls.

Otherwise the child's containment propagates upward as an invalidation of the parent/group claim.

## 6. Downward and upward propagation are asymmetric
Parent safety constraints can restrict descendants without changing their historical state.

Child uncertainty may invalidate an ancestor claim if the child can affect the ancestor's protected invariant.

Candidate relation:

`PARENT_CONSTRAINT → CHILD_ADMISSION_RESTRICTION`

and:

`CHILD_UNRESOLVED_SHARED_EFFECT → ANCESTOR_CLAIM_INVALIDATION`

This is more precise than recursively setting `safe=false`.

## 7. Sibling escape attack
A1 is quarantined.
A2 remains active.
A1 and A2 share resource R.
A2 can produce the same protected effect.

A1 containment cannot remain a mission-level claim if A2 can bypass the same boundary.

Therefore sibling shared-footprint relations must be explicit.

## 8. Parent release while child unresolved
Parent P has a child C with UNKNOWN external effect.
P attempts release.

If C can affect a protected invariant of P, parent release must be blocked unless:
- C is contained by an independently valid boundary;
- C's uncertainty is explicitly tolerated by the parent's claim; or
- the parent claim excludes C with proof.

`CHILD_UNKNOWN` is not automatically global failure, but it cannot be silently ignored.

## 9. Child release while parent quarantined
Child C has current authority and its own fence.
Parent P is quarantined.

If C's effect lies inside P's quarantined scope:
`C_RELEASE_AUTHORITY != PARENT_OVERRIDE`.

The child must remain blocked.

Only a current release context satisfying both scopes can permit the effect.

## 10. Nested epochs
Parent epoch P=12.
Child epoch C=31.

The numeric values have no global ordering unless explicitly defined.

A child having a newer local epoch cannot override an older parent safety boundary.

Candidate release context must bind all applicable authority/fence epochs by scope.

## 11. Hierarchical release linearization
A release decision may require one protected linearization event for the combined scope.

Candidate sequence:

CURRENT_OWNER_VALIDATED
→ CURRENT_CONTEXT_VALIDATED
→ PARENT_CONSTRAINTS_VALIDATED
→ CHILD_CONSTRAINTS_VALIDATED
→ SHARED_FOOTPRINT_VALIDATED
→ REQUIRED_RECONCILIATION/EVIDENCE VALIDATED
→ RELEASE_LINEARIZED
→ EFFECT_ADMISSION_ENABLED

If any applicable parent/child condition is UNKNOWN, release is not eligible unless the claim contract explicitly tolerates it.

## 12. Authority versus containment hierarchy
A parent may have broader containment scope without having unrestricted authority over every child operation.

Conversely, a child may have execution authority inside its scope without having authority to release parent quarantine.

Therefore:
`SCOPE_INCLUSION != AUTHORITY_INCLUSION`.

This prevents hierarchy from becoming an accidental privilege escalation mechanism.

## 13. Recovery ownership
Recovery ownership must also be scope-bound.

A parent recovery owner may coordinate child recovery only when explicitly authorized for that scope.

A child recovery owner cannot self-promote to parent release authority merely because it repaired its local state.

Cross-scope recovery requires an explicit protected coordination protocol.

## 14. Recovery during parent quarantine
Child C is recovering while P is quarantined.

Recovery can perform reconciliation/containment work while execution remains blocked.

This preserves the earlier distinction:
`RECOVERY_PROGRESS != EXECUTION_AUTHORITY`.

Recovery completion does not clear the parent's quarantine automatically.

## 15. Decommission of child
Child C is decommissioned.

Parent claim must be recomputed because decommission can change:
- routing;
- failover;
- shared queues;
- provider paths;
- ownership;
- replacement behavior;
- effect graph.

If the child was the only producer of a prohibited effect, decommission may strengthen containment. But this must be proven by effect/dependency closure.

## 16. Decommission of parent
Parent P is decommissioned while children remain.

Removing the parent control domain cannot automatically release children.

Each child must have a current containment/authority context after the topology change.

`PARENT_REMOVED != CHILD_RELEASED`.

## 17. Nested shared footprint
P contains A and B.
A shares queue Q with B.
B shares provider R with an external domain D.

The containment graph crosses the hierarchy.

Therefore containment cannot be represented as a tree alone. It needs a graph of domains plus shared-footprint edges.

Candidate model:

Hierarchy graph:
`PARENT → CHILD`

Interaction graph:
`DOMAIN ↔ SHARED_FOOTPRINT ↔ DOMAIN`

The effective safety domain is determined by the union of both relations for the claim being evaluated.

## 18. Claim-specific hierarchy
A child may be safely released for one effect class while remaining blocked for another.

Example:
- read-only observation permitted;
- actuation prohibited;
- compensation prohibited;
- administrative mutation prohibited.

Thus hierarchy must bind effect class, not just actor/domain identity.

## 19. Parent constraint as an admission predicate
Candidate:

`ADMIT(E) = CurrentChildAuthority ∧ CurrentParentConstraints ∧ CurrentFenceSet ∧ CurrentDependencies ∧ ClaimSatisfied`

This is preferable to copying parent state into every child.

It reduces stale duplicated safety state, but requires the admission boundary to actually consult/enforce the parent constraints.

## 20. Fail-closed behavior
If the current parent constraint cannot be established:

`PARENT_CONTEXT = UNKNOWN`
→ protected child admission = HOLD/QUARANTINE.

A child must not infer “parent probably allows this” from an old cached context.

## 21. Candidate invariants
INV-HCR-01 Parent quarantine blocks covered child release.
INV-HCR-02 Child release cannot override an applicable parent safety constraint.
INV-HCR-03 Child local state does not equal child release eligibility.
INV-HCR-04 Child unresolved shared effects can invalidate ancestor claims.
INV-HCR-05 Sibling shared footprints prevent automatic independent containment.
INV-HCR-06 Parent release requires all applicable child conditions or an explicit tolerated-uncertainty contract.
INV-HCR-07 Local child epochs do not override parent constraints without an ordering contract.
INV-HCR-08 Scope inclusion does not imply authority inclusion.
INV-HCR-09 Child recovery ownership cannot self-promote to parent release authority.
INV-HCR-10 Recovery under parent quarantine does not grant execution authority.
INV-HCR-11 Child decommission invalidates affected ancestor claims until recomputed.
INV-HCR-12 Parent decommission does not release children.
INV-HCR-13 Hierarchy alone is insufficient; shared-footprint graph must be considered.
INV-HCR-14 Admission must evaluate current applicable parent constraints.
INV-HCR-15 Unknown parent context blocks protected child admission.
INV-HCR-16 Claims remain effect-class and scope specific.

## 22. Architecture consequence
The clean architecture likely needs two connected graphs:

1. `CONTAINMENT_HIERARCHY_GRAPH`
   parent/child scope and constraint inheritance.

2. `SHARED_FOOTPRINT_INTERACTION_GRAPH`
   resources, queues, providers, effects, credentials and cross-domain interactions.

A release decision is valid only against the closure of both graphs for the claim scope.

This is stronger than a tree and stronger than a flat list of quarantined domains.

## 23. New derived concept
Candidate `EffectiveSafetyScope`:

`EffectiveSafetyScope(claim) = hierarchical ancestors applicable to claim + reachable shared-footprint domains/resources required by claim`.

This is a research abstraction, not a canonical object yet.

## 24. Research conclusion
Hierarchy gives us a powerful containment mechanism, but it cannot be treated as simple boolean inheritance.

The correct semantics are:
- parent constraints restrict descendant admission;
- child uncertainty can invalidate ancestor claims when shared/protected;
- authority remains scope-bound;
- recovery remains scope-bound;
- release is a protected cross-scope decision;
- shared-footprint edges can cross the hierarchy;
- unknown current parent context fails closed.

Therefore a clean Nexo model likely requires **hierarchical constraints + graph-based shared footprint + claim-specific release**, not a single recursive `quarantined` flag.

## 25. Next attack
NEXT: **CONTAINMENT TRANSITIONS THEMSELVES — ATOMICITY OF QUARANTINE/RELEASE ACROSS HIERARCHIES**.

Questions:
- Can parent quarantine and child release race in the same linearization window?
- Can a child execute between parent fence issuance and propagation?
- What is the minimum protected atomicity needed for hierarchical admission?
- Can a parent fence advance while child fence remains old?
- Can release of one child expose a sibling path?
- How are late messages judged during hierarchical transition?
- Can two ancestors impose conflicting constraints?
- What happens if the hierarchy changes during the transition?

DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED.

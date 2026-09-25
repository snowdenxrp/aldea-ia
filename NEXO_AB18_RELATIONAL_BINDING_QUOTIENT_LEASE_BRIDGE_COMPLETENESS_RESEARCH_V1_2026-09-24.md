# NEXO AB18 — RELATIONAL BINDING QUOTIENT, LEASE BRIDGE COMPLETENESS, FINAL P_AA STATE CANDIDATE RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No theorem claimed proven.

## External cross-check

Methodology was cross-checked against Lamport's refinement/history-variable material and Cousot's abstraction/reduced-product material. The sources support preserving property-relevant relations through abstraction and using auxiliary history where necessary. They do not establish Nexo correctness.

## 1. Exact relational binding predicate

Candidate concrete predicate:

Binding_PAA(b,a,t) iff all required relations hold simultaneously:

subject(b) = subject(a)
operation(b) = operation(a)
attempt(b) = attempt(a)
resource(b) = resource(a)
incarnation(b) = currentRequiredIncarnation(a,t)
capability(b) matches capability(a)
scope(b) contains the admitted action/resource
authority_epoch(b) is valid for the admission
policy(b) is compatible at the admission point
delegation(b) is valid at the admission point
fence(b) is valid and bound to the same tuple when the protocol is non-atomic
boundary(b) permits the admission

The important point is that this is one joint predicate, not independent booleans.

## 2. Candidate BindingRelationContext elimination

We tested whether BindingRelationContext needs to be a separate abstract component.

It can be eliminated as a named component if AdmissionBindingClass is defined as the quotient of the COMPLETE binding tuple under P_AA behavioral equivalence.

In that construction:

AdmissionBindingClass itself contains the relational semantics.

Therefore:

BindingRelationContext may be representationally redundant.

But this is NOT equivalent to saying the relations are unnecessary.

The relations move into the definition of the equivalence class.

## 3. New quotient attack

CM-AA48 — relation-erasure alias:
Two concrete bindings have identical scalar fields but different relational edges. If AdmissionBindingClass is computed from scalars only, they collapse incorrectly.

Therefore the quotient function must be relation-aware.

## 4. New quotient attack

CM-AA49 — relation-changing policy transition:
Two bindings are equivalent at t0, but a later policy transition affects one relation and not the other.

Therefore equivalence must be stable under allowed future transitions, not merely equal at creation.

## 5. New quotient attack

CM-AA50 — delegation relation substitution:
All scalar delegation metadata is equal, but the authorized subject→operation→resource relation differs.

The relation must remain recoverable or distinguishable.

## 6. New quotient attack

CM-AA51 — boundary relation mismatch:
All internal authorization fields match, but one binding crosses a boundary not permitted for the claim.

Boundary is therefore part of the relational semantics.

## 7. Lease bridge completeness

Candidate complete bridge:

LeaseBridge =
  SubjectBinding
  OperationBinding
  AttemptBinding
  ResourceBinding
  ResourceIncarnationBinding
  AuthorityContextBinding
  PolicyCompatibilityBinding
  DelegationValidityBinding
  CapabilityScopeBinding
  BoundaryBinding
  FreshnessValidity
  ReplayBinding
  TemporalValidity

A bridge is complete for P_AA only if omission of any component cannot produce a concrete pair with different P_AA results while the bridge remains equal.

This gives an adversarial definition of completeness.

## 8. PendingDecision result

Under the complete LeaseBridge candidate:

PendingDecision is semantically derivable.

Therefore the current preferred abstract state is:

AAState_final_candidate =
  CurrentAuthorityContext
  CurrentResourceIncarnation
  CurrentPolicyContext
  CurrentDelegationContext
  CurrentFenceLeaseContext
  AdmissionBindingClass

PendingDecision is removed from the abstract state.

Important caveat:
This is a candidate architectural reduction, not a proof. It must survive the complete countermodel basis and eventual formal model.

## 9. Authority vs bridge distinction

The lease bridge does not become authority itself.

Instead:

AuthorityContext determines whether authorization consequences exist.

LeaseBridge determines whether a previously established authorization consequence remains validly bound through the decision→admission interval.

This preserves:

AUTHORITY != FRESHNESS
AUTHORITY != BRIDGE
BRIDGE != EXTERNAL EFFECT

## 10. New lease countermodels

CM-AA52 — authority substitution:
Bridge remains valid but points to a different authority context.

CM-AA53 — bridge after epoch advance:
Bridge remains syntactically valid but authority epoch is stale.

CM-AA54 — bridge after policy incompatibility:
Bridge remains fresh but policy compatibility is no longer valid.

CM-AA55 — bridge after delegation revocation:
Bridge remains fresh but delegation is invalid.

CM-AA56 — bridge after resource reincarnation:
Bridge remains fresh but incarnation changed.

CM-AA57 — bridge after boundary change:
Bridge remains fresh but current boundary no longer permits the admission.

## 11. Revised P_AA formulation

Candidate claim:

P_AA:
For every admitted attempt e at time t,
there exists an authorization context a and a complete valid admission bridge b such that:

AuthorityValid(a,t)
AND
Binding_PAA(b,a,t)
AND
Admit(e,t) is authorized by that bound context.

This is still deliberately restricted to the Z1→Z3 authorization boundary.

It does NOT state:
ExternalEffectOccurred(e)
ExternalSuccess(e)
NoExternalEffect(e) after Abort
ProviderTruth(e)

## 12. Final candidate semantic state

Current strongest candidate:

AAState* =
  AuthorityContext
  ResourceIncarnation
  PolicyContext
  DelegationContext
  FenceLeaseContext
  AdmissionBindingClass

The exact representation may later compress some of these through a reduced product.

## 13. Component necessity audit

AuthorityContext:
required by stale/revocation/epoch/capability cases.

ResourceIncarnation:
required by reincarnation cases.

PolicyContext:
required by policy-change cases.

DelegationContext:
required by delegation-revocation cases.

FenceLeaseContext:
required whenever decision/admission are not atomic and freshness/replay is modeled.

AdmissionBindingClass:
required because the claim concerns the actual admission binding and relational tuple.

No current component has a safe deletion proof.

## 14. Final finite coverage candidate

For direct cross-binding coverage:

Subjects=2
Operations=2
Attempts=2
Resources=2
Incarnations=2
Epochs=2
Policies=2
Delegations=2
Fences/Leases=2
Capabilities/Scopes=2
TemporalPositions>=3

Potential symmetry reductions may reduce equivalent cases, but only after relational binding symmetry is explicitly justified.

## 15. Countermodel basis status

CM-AA1..57 now covers:

authority/currentness
revocation
epoch
resource incarnation
capability
scope
policy
delegation
fence/lease
operation/attempt
subject/resource/operation substitution
joint tuple validity
history/temporal ordering
boundary
reduction aliasing
lease completeness

This is a strong adversarial basis, but still not a mathematical completeness proof.

## 16. Candidate invariants

AD18-01 BINDING_IS_A_JOINT_PREDICATE
AD18-02 RELATIONAL_SEMANTICS_MAY_BE_ENCODED_IN_THE_QUOTIENT
AD18-03 SCALAR_EQUALITY_DOES_NOT_ESTABLISH_RELATIONAL_EQUIVALENCE
AD18-04 QUOTIENT_MUST_BE_RELATION_AWARE
AD18-05 QUOTIENT_STABILITY_IS_FUTURE_BEHAVIORAL
AD18-06 BOUNDARY_IS_PART_OF_BINDING_SEMANTICS
AD18-07 LEASE_BRIDGE_COMPLETENESS_IS_ADVERSARIAL
AD18-08 LEASE_BRIDGE_IS_NOT_AUTHORITY
AD18-09 LEASE_BRIDGE_IS_NOT_EXTERNAL_EFFECT
AD18-10 PENDING_DECISION_IS_DERIVABLE_ONLY_FROM_A_COMPLETE_BRIDGE
AD18-11 AUTHORITY_AND_BRIDGE_HAVE_DISTINCT_SEMANTICS
AD18-12 NO_COMPONENT_DELETION_WITHOUT_COUNTERMODEL_COVERAGE
AD18-13 FINITE_DOMAIN_COVERAGE_IS_NOT_COMPLETENESS_PROOF

## 17. AB18 status

G1 advanced — exact relational binding predicate.
G2 advanced — BindingRelationContext can be semantically absorbed into the quotient candidate.
G3 advanced — quotient attacked with CM-AA48..51.
G4 advanced — complete lease bridge candidate.
G5 advanced — PendingDecision candidate elimination.
G6 advanced — CM-AA52..57.
G7 advanced — final state candidate.
G8 open — formal completeness/minimality.
G9 open — TLA+.

## 18. AB19 frontier

1. Attack whether any of the six final components can be reduced further.
2. Derive a canonical normalized representation for AdmissionBindingClass.
3. Establish a full transition-closure matrix for the final state.
4. Attempt a finite countermodel search conceptually before formalization.
5. Define the exact finite domains and symmetry assumptions.
6. Freeze the narrow claim and draft TLA+ only after semantic closure.

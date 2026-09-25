# NEXO AB19 — SIX-COMPONENT STATE ATTACK, NORMALIZATION, TRANSITION CLOSURE AND P_AA FREEZE CANDIDATE RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No theorem claimed proven.

## External methodology cross-check

Lamport's refinement/history-variable material supports separating observable state from auxiliary history and requiring a mapping from concrete behavior to abstract behavior. Cousot's abstraction/reduced-product material supports combining domains and reducing them through cross-component constraints, but does not imply that a particular Nexo decomposition is minimal.

## 1. Attack target

Six-component candidate:

AAState* =
  AuthorityContext
  ResourceIncarnation
  PolicyContext
  DelegationContext
  FenceLeaseContext
  AdmissionBindingClass

Question:
Can any component be deleted or fully derived from another without changing P_AA-relevant behavior?

## 2. AuthorityContext attack

Try deriving AuthorityContext from:
policy + delegation + fence + admission binding.

Countermodel CM-AA58:
Two contexts have identical policy, delegation, fence and admission class shape, but different current authority epoch/revocation state.

P_AA differs.

Result:
AuthorityContext cannot be eliminated unless current authority consequences are reified as a stronger composite component. The semantic distinction remains required.

## 3. ResourceIncarnation attack

CM-AA59:
Same resource identity, capability, policy, delegation, authority and fence, but different resource incarnation.

P_AA differs.

Result:
Incarnation distinction remains necessary unless folded into a binding/authority composite that is injective over incarnations.

## 4. PolicyContext attack

CM-AA60:
Same authority, delegation, resource incarnation and fence, but policy compatibility differs.

P_AA differs.

Result:
Policy context remains semantically necessary.

## 5. DelegationContext attack

CM-AA61:
Same capability, authority epoch, policy, resource and fence, but delegation validity differs.

P_AA differs.

Result:
Delegation remains semantically necessary unless authority context is redefined to include delegation consequences.

## 6. FenceLeaseContext attack

CM-AA62:
Same current authority/policy/delegation/resource/incarnation, but one admission occurs within a valid decision→admission lease and the other after lease expiry.

If protocol is non-atomic, P_AA differs.

Result:
Fence/lease semantics are necessary for the non-atomic protocol.

For an atomic protocol, FenceLeaseContext may disappear. This is a protocol choice, not an abstraction theorem.

## 7. AdmissionBindingClass attack

CM-AA63:
Two current contexts are identical, but admitted bindings differ in subject/operation/attempt/resource relational tuple.

P_AA differs.

Result:
AdmissionBindingClass remains necessary.

## 8. Composite reduction finding

All six components can theoretically be packed into one canonical record:

AACompositeContext =
  normalize(
    Authority,
    Incarnation,
    Policy,
    Delegation,
    FenceLease,
    AdmissionBinding
  )

This reduces field count only syntactically.

It does NOT reduce semantic dimensionality.

Therefore:
STRUCTURAL_PACKING != SEMANTIC_MINIMIZATION.

## 9. Canonical normalization candidate

Define normalized context:

N_AA(h,t) =
  (
    current authority consequences,
    resource incarnation,
    policy compatibility consequences,
    delegation validity consequences,
    lease/fence validity and bindings,
    admission binding equivalence class
  )

Normalization must be deterministic for equivalent concrete contexts.

If two contexts normalize identically, they are candidates for the same P_AA class.

But equal normalization is not automatically proven equivalent until transition closure is established.

## 10. Transition closure matrix

For every transition T, the normalized context must update all affected dimensions:

IssueAuthority -> authority
RevokeAuthority -> authority/currentness
AdvanceEpoch -> authority/currentness
ChangeDelegation -> delegation
ChangePolicy -> policy
ReincarnateResource -> incarnation + relevant binding/lease validity
IssueFence -> fence/lease
ExpireFence -> fence/lease
Decide -> bridge/fence + pending semantics if retained
Admit -> admission binding
Retry -> attempt + admission binding
Abort -> no external-success inference

Cross-effects are important:
- policy change may invalidate a lease;
- delegation change may invalidate a lease;
- incarnation change may invalidate a lease;
- epoch change may invalidate a lease;
- boundary change may invalidate a lease.

Therefore transition semantics cannot update components independently.

## 11. New cross-effect countermodels

CM-AA64 — policy change invalidates lease but lease context remains valid.

CM-AA65 — delegation revocation invalidates lease but delegation context is updated without lease invalidation.

CM-AA66 — resource reincarnation leaves lease syntactically fresh.

CM-AA67 — epoch advance leaves bridge usable despite stale authority.

CM-AA68 — boundary change leaves previously issued bridge valid.

These show that LeaseBridge is a reduced product with Authority/Policy/Delegation/Incarnation/Boundary, not an independent freshness field.

## 12. Consequence

FenceLeaseContext cannot be treated as:

lease_valid = TRUE/FALSE.

It must be a relationally reduced context whose validity depends on the components whose authorization consequences it carries.

Candidate:

FenceLeaseContext =
  freshness
  + replay status
  + bound authority context
  + bound subject
  + bound operation/attempt
  + bound resource/incarnation
  + bound policy/delegation/boundary context

This is semantically richer but may allow PendingDecision to remain eliminated.

## 13. Boundary treatment

Boundary is currently not a seventh independent state component.

It is a parameter of the claim/context and a required relation in the binding.

If boundary can change dynamically during the decision→admission interval, it becomes P_AA-relevant transition state and must be represented in FenceLeaseContext or another retained component.

If boundary is fixed by model scope, it remains an environmental assumption.

This distinction must be explicit before formalization.

## 14. Final candidate normalization

Current best semantic candidate:

AA_Norm =
  AuthorityConsequences
  ResourceIncarnation
  PolicyConsequences
  DelegationConsequences
  ReducedFenceLeaseContext
  AdmissionBindingClass

where each component is claim-relative and cross-constrained.

PendingDecision:
removed provisionally.

## 15. Freeze candidate for P_AA

The first claim can now be frozen semantically as:

P_AA:
Every admitted attempt at the Z1→Z3 boundary is admitted only when there exists a currently valid authority context and a complete, claim-scoped bridge whose joint binding matches the admitted subject, operation, attempt, resource/incarnation, capability/scope, policy, delegation and boundary, with required freshness/replay validity.

This statement still excludes external provider success/effect.

## 16. What is NOT frozen

Not frozen:
- exact concrete data structures;
- exact field encoding;
- exact TLA+ variables;
- exact domain cardinalities;
- exact symmetry reductions;
- formal proof;
- TLC result;
- implementation mapping.

## 17. Minimal finite model candidate

For direct binding coverage:

Subjects 2
Operations 2
Attempts 2
Resources 2
Incarnations 2
Epochs 2
Policies 2
Delegations 2
Fences/leases 2
Capabilities/scopes 2
Temporal positions 3+

Potential boundary modes:
2 if dynamic boundary attacks are included.

Boundary can otherwise remain fixed as an assumption in the first model.

## 18. Countermodel basis

CM-AA1..68 now covers:
authority
revocation
epoch
resource incarnation
capability
scope
policy
delegation
fence
lease
operation
attempt
subject/resource/operation substitution
joint binding
temporal order
history loss
boundary
quotient aliasing
bridge completeness
cross-component invalidation

This is an adversarial basis, not a formal completeness proof.

## 19. Candidate invariants

AD19-01 SIX_COMPONENT_DELETION_REQUIRES_DISTINCTION_PRESERVATION
AD19-02 STRUCTURAL_PACKING_IS_NOT_SEMANTIC_MINIMIZATION
AD19-03 NORMALIZATION_IS_CLAIM_SCOPED
AD19-04 EQUAL_NORMALIZATION_REQUIRES_TRANSITION_CLOSURE
AD19-05 LEASE_VALIDITY_IS_CROSS_COMPONENT
AD19-06 POLICY_CHANGE_CAN_INVALIDATE_LEASE
AD19-07 DELEGATION_CHANGE_CAN_INVALIDATE_LEASE
AD19-08 INCARNATION_CHANGE_CAN_INVALIDATE_LEASE
AD19-09 EPOCH_CHANGE_CAN_INVALIDATE_LEASE
AD19-10 BOUNDARY_CHANGE_CAN_INVALIDATE_LEASE
AD19-11 FENCE_IS_NOT_A_STANDALONE_BOOLEAN_AUTHORITY
AD19-12 PENDING_DECISION_IS_PROVISIONALLY_DERIVED
AD19-13 BOUNDARY_IS_ENVIRONMENTAL_ONLY_WHEN_FIXED
AD19-14 PAA_FREEZE_EXCLUDES_EXTERNAL_EFFECT_SEMANTICS
AD19-15 FINITE_DOMAIN_CARDINALITY_REMAINS_A_MODEL_HYPOTHESIS

## 20. AB19 status

G1 advanced — six-component deletion attacks.
G2 advanced — canonical normalization.
G3 advanced — transition closure matrix.
G4 advanced — cross-effect lease attacks.
G5 advanced — PendingDecision provisional elimination.
G6 advanced — P_AA semantic freeze candidate.
G7 open — formal quotient completeness.
G8 open — exact finite-domain/symmetry choice.
G9 open — TLA+.

## 21. AB20 frontier

1. Build the complete P_AA transition relation over AA_Norm.
2. Generate adversarial transition traces for CM-AA1..68.
3. Identify whether any missing transition can invalidate the normalization.
4. Decide dynamic vs fixed boundary model.
5. Freeze exact finite domains.
6. Define refinement mapping from implementation state + history to AA_Norm.
7. Draft the first narrow TLA+ specification, still without claiming execution/proof.

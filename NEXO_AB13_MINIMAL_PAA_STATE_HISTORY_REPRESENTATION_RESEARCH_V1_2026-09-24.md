# NEXO AB13 — MINIMAL P_AA STATE, HISTORY SUPPORT, REPRESENTATION AND COUNTERMODEL COVERAGE RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No theorem claimed proven.

## Scope
AB13 derives a candidate minimal semantic state for P_AA and separates it from auxiliary/history support. The claim remains bounded at Z1 -> Z3 admission; Z4 external effect remains outside scope.

## External cross-check
Lamport states that refinement mappings may require auxiliary variables and that history variables record past behavior without changing actual behavior. Refinement maps implementation behavior to a higher-level specification. These are methodological references, not Nexo proofs. citeturn0search24turn0search26

Cousot's formalization work supports choosing abstraction/concretization in the context of the property being abstracted. Reduced products combine domains by exchanging information, but correctness depends on concrete/abstract correspondence. citeturn0search25turn0search6

## 1. First-claim candidate
P_AA at admission: every admitted effect has a currently valid Z1 authority matching subject, resource/incarnation, capability/scope, policy compatibility, delegation validity, fence binding/freshness, and claim boundary. It does not assert external execution or success.

## 2. Candidate semantic state
AAState =
  currentAuthorityContext
  currentResourceIncarnation
  currentPolicyContext
  currentDelegationContext
  currentFenceContext
  pendingDecisionContext
  admittedBindingContext

These are semantic components, not necessarily implementation fields.

## 3. Component derivation
Authority context: stale/revoked/epoch attacks.
Resource incarnation: wrong-incarnation attack.
Policy context: policy-transition attack.
Delegation context: delegation-revocation attack.
Fence context: fence replay and decision/admission bridging.
Pending decision: needed if decision and admission are separate semantic events.
Admitted binding: preserves the authority context that justified actual admission rather than only current authority after admission.

## 4. Auxiliary/history support
Candidate history:
  AdmissionHistory
  DecisionHistory
  AuthorityHistory
  PolicyHistory
  FenceHistory
  ResourceHistory

Not all are necessarily needed in the final model. History may be auxiliary when it is required only for refinement, but any information that can change P_AA while the abstract state remains unchanged is not safely auxiliary for this claim. Lamport's history-variable methodology supports this distinction. citeturn0search24

## 5. Representation
Candidate Rep_AA(c,a) means concrete history/context c represents abstract state a for P_AA.

Required distinctions include admission identity, subject, operation/attempt binding, resource/incarnation, authority epoch/currentness, policy compatibility, delegation validity, fence binding/freshness, temporal position, and boundary.

Candidate mapping:
  M_AA(ImplementationState, AuxiliaryHistory) -> AAState

It is claim-indexed; no universal mapping is assumed.

## 6. Countermodel coverage
CM-AA1 stale epoch -> authority/currentness.
CM-AA2 revoked authority -> revocation/currentness.
CM-AA3 wrong incarnation -> resource incarnation.
CM-AA4 scope mismatch -> capability/scope.
CM-AA5 capability mismatch -> capability.
CM-AA6 fence reuse -> fence context.
CM-AA7 policy mismatch -> policy context.
CM-AA8 operation/attempt confusion -> binding.
CM-AA9 historical/current confusion -> admission history.
CM-AA10 external success -> outside claim boundary.
CM-AA11 deleted snapshot -> history support/UNKNOWN.
CM-AA12 final-state aliasing -> historical distinction.
CM-AA13 unsound reduction -> temporal/history support.
CM-AA14 decision/admission gap -> pending decision/fence/recheck.
CM-AA15 epoch advance without replacement authority -> current authority.
CM-AA16 delegation revocation with unchanged capability -> delegation context.

Coverage is not a completeness proof.

## 7. Hidden dependency attack
A single boolean authorized flag is insufficient. It can erase epoch, revocation, delegation, subject, resource, capability, scope and currentness reason.

Candidate AuthorityStatus:
  VALID
  STALE_EPOCH
  REVOKED
  DELEGATION_INVALID
  INCARNATION_MISMATCH
  POLICY_INCOMPATIBLE
  BOUNDARY_DENIED
  UNKNOWN

UNKNOWN is an assessment, not world truth, and cannot silently become VALID.

## 8. Admission binding
Candidate:
  operation_id
  attempt_id
  subject
  resource_id
  resource_incarnation
  capability
  scope
  authority_epoch
  policy_context
  delegation_context
  fence_context
  admission_position

BindingScope remains:
  OPERATION
  ATTEMPT
  OPERATION_AND_ATTEMPT

Retry cannot silently inherit authorization.

## 9. Transition closure
Candidate abstract transitions:
  IssueAuthority
  RevokeAuthority
  AdvanceEpoch
  ChangeDelegation
  ChangePolicy
  ReincarnateResource
  IssueFence
  ExpireFence
  Decide
  Admit
  Retry
  Abort

Every concrete transition capable of changing P_AA-relevant meaning needs corresponding abstract semantics.

## 10. State/history minimization
M_state = smallest AAState preserving P_AA.
M_history = smallest auxiliary history preserving Rep_AA and required reconstruction/refinement.

A smaller state can require more history. Therefore minimal state and minimal history are distinct optimization problems.

## 11. New countermodels
CM-AA17 — opaque authorization: identical visible authorization state hides stale versus current epoch, then a later transition distinguishes them.
CM-AA18 — hidden delegation: identical capability/scope/epoch/incarnation, but one delegation is revoked.
CM-AA19 — hidden policy: identical authority and fence, but policy compatibility differs.
CM-AA20 — history-free binding: identical final current state, but one historical admission used a different authority epoch.

## 12. Provisional candidate
AAState =
  AuthorityContext
  ResourceIncarnation
  PolicyContext
  DelegationContext
  FenceContext
  PendingDecision
  AdmissionBindings

AuxHistory =
  AuthorityEvents
  DelegationEvents
  PolicyEvents
  ResourceIncarnationEvents
  FenceEvents
  DecisionEvents
  AdmissionEvents

This is intentionally broader than the final minimum.

## 13. Status
G1 advanced — S_admission defined.
G2 advanced — semantic state derived from countermodels.
G3 advanced — state/history separation.
G4 advanced — representation candidate.
G5 open — transition adversarial coverage.
G6 advanced — reduction obligations.
G7 open — finite-domain sufficiency.
G8 open — TLA+ deferred.

## 14. AB14 frontier
G1 minimize AAState component-by-component.
G2 minimize AuxHistory.
G3 derive P_AA-equivalence classes.
G4 attack CM-AA1..20 against minimized state.
G5 derive exact transition preconditions/postconditions.
G6 decide whether PendingDecision is necessary or reducible to lease/fence semantics.
G7 decide whether AdmissionBindings can be represented by an equivalence-class identifier plus auxiliary history.
G8 derive smallest finite domains.
G9 only then draft the first narrow TLA+ model.

Verification boundary: no implementation, no TLA+ execution, no TLC execution, no theorem claimed proven.

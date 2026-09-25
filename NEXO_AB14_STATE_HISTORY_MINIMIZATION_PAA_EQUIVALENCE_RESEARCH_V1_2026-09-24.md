# NEXO AB14 — STATE/HISTORY MINIMIZATION, P_AA EQUIVALENCE AND TRANSITION PRECONDITIONS RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No theorem claimed proven.

## Scope

AB14 attacks and minimizes the provisional AAState from AB13 against CM-AA1..20. The claim remains P_AA at the Z1 -> Z3 admission boundary.

## External methodology cross-check

Lamport's auxiliary-variable and refinement work supports separating abstract state from history/support variables when the latter are required for refinement. Cousot's abstraction framework supports claim-relative concrete/abstract correspondence and warns that abstraction precision is property dependent. These sources support methodology only, not Nexo correctness.

## 1. Component minimization result

Provisional components were:
AuthorityContext
ResourceIncarnation
PolicyContext
DelegationContext
FenceContext
PendingDecision
AdmissionBindings

### AuthorityContext

Cannot collapse to a boolean. It must preserve at least the P_AA-relevant authority consequences:
subject, resource, capability/scope, epoch/currentness, and boundary.

Revocation and delegation may be represented separately only if the resulting relation preserves the same authorization consequences.

### ResourceIncarnation

Cannot be removed because CM-AA3 and CM-AA20 distinguish identical resource_id values with different incarnations.

### PolicyContext

Cannot be removed because CM-AA7 and CM-AA19 allow identical authority/fence with different policy compatibility.

### DelegationContext

Cannot be removed unless delegation validity is proven derivable from another retained component. CM-AA16/18 currently prevent that reduction.

### FenceContext

Cannot be removed while the model permits decision/admission separation or fence replay. If the final protocol chooses atomic decision+admission and has no independent fence semantics, this component may disappear later.

### PendingDecision

This is the first component that may be eliminable.

Two alternatives:
D-A: retain PendingDecision as explicit state.
D-B: represent the decision-to-admission bridge entirely as a bound lease/fence context.

D-B is semantically cleaner if and only if the lease/fence contains every P_AA-relevant binding and has an explicit validity interval.

Therefore PendingDecision is NOT yet declared essential.

### AdmissionBindings

Cannot be eliminated entirely because P_AA concerns the actual admission binding, not merely current authority.

However, it may be compressible into:
  AdmissionBindingClass
plus
  auxiliary history.

This is now the main minimization target.

## 2. Candidate reduced semantic state

Current best candidate:

AAState* =
  AuthorityContext
  ResourceIncarnation
  PolicyContext
  DelegationContext
  FenceContext
  AdmissionBindingClass

PendingDecision remains conditional.

## 3. P_AA-equivalence

Candidate equivalence:

x ≡AA y iff for every P_AA-relevant future continuation and every admitted effect in claim scope, x and y produce the same P_AA-relevant authorization result.

This is behavioral equivalence, not field equality.

It implies that raw snapshots can be different while belonging to the same semantic class.

## 4. AdmissionBindingClass

Candidate class dimensions:

operation/attempt binding
subject
resource/incarnation
capability/scope
authority epoch
policy context
delegation context
fence context
admission position

The class is claim-relative.

It does not assert that every field must be independently stored. It asserts that the resulting equivalence class must distinguish any concrete cases that P_AA can distinguish.

## 5. Transition preconditions

### IssueAuthority
Pre:
  issuer and delegation semantics valid.
Post:
  authority context changes.

### RevokeAuthority
Pre:
  target authority exists.
Post:
  currentness changes; prior historical admission is not erased.

### AdvanceEpoch
Pre:
  valid epoch transition.
Post:
  old authority may become stale; no automatic authority grant.

### ChangeDelegation
Post:
  delegation validity changes independently of capability.

### ChangePolicy
Post:
  policy compatibility may change independently of authority.

### ReincarnateResource
Post:
  incarnation changes; old incarnation bindings do not automatically transfer.

### IssueFence
Pre:
  valid authority context.
Post:
  freshness/order context created; no semantic permission created.

### ExpireFence
Post:
  fence validity changes; authority need not change.

### Decide
Pre:
  current authority/policy/delegation/fence requirements according to protocol.
Post:
  creates a decision/lease relation.

### Admit
Pre:
  exact admission binding valid under P_AA.
Post:
  admission binding recorded.

### Retry
Pre:
  explicit operation/attempt binding rule.
Post:
  new attempt; no implicit authority inheritance.

### Abort
Post:
  internal path stops. It does not prove external non-effect; Z4 is outside P_AA.

## 6. New attack — fence as hidden authority

CM-AA21:
A protocol accidentally treats a valid fence as sufficient to admit without checking current authority.

If FenceContext is modeled as an authorization token rather than freshness/binding, the abstraction can amplify authority.

Therefore:
  FENCE_MUST_NOT_AMPLIFY_AUTHORITY.

## 7. New attack — lease without policy binding

CM-AA22:
Lease is valid, authority is valid, but policy changes to an incompatible policy before admission.

If the lease does not bind policy compatibility, the decision-to-admission bridge is incomplete.

Therefore:
  LEASE_VALIDITY_MUST_INCLUDE_REQUIRED_POLICY_CONTEXT.

## 8. New attack — incarnation-free lease

CM-AA23:
Lease is valid for resource R@I1; resource reincarnates to I2; lease remains syntactically valid.

Admission under I2 must not inherit I1 authorization unless an explicit compatibility rule exists.

Therefore:
  LEASE_MUST_BIND_REQUIRED_RESOURCE_INCARNATION.

## 9. New attack — operation-only retry

CM-AA24:
Operation O is authorized for attempt A1.
A1 fails.
Retry creates A2.
A2 differs in a P_AA-relevant way.

Operation-only abstraction can incorrectly transfer A1 authorization to A2.

Therefore:
  RETRY_BINDING_MUST_BE_EXPLICIT.

## 10. New attack — admission class without temporal position

CM-AA25:
Two admissions have identical visible authority/resource/policy/fence fields but occur at different temporal positions relative to revocation.

If temporal position is not represented or reconstructible, the abstraction can merge a valid admission and invalid admission.

Therefore:
  ADMISSION_EQUIVALENCE_MUST_PRESERVE_REQUIRED_TEMPORAL_RELATIONS.

## 11. State/history split after attacks

Semantic state:
  AuthorityContext
  ResourceIncarnation
  PolicyContext
  DelegationContext
  FenceContext
  AdmissionBindingClass

Possible auxiliary support:
  temporal event ordering
  authority transition history
  delegation transition history
  policy transition history
  fence issuance/expiry history
  incarnation transitions

This means AdmissionBindingClass may be a semantic equivalence class while raw temporal history remains auxiliary.

## 12. Candidate refinement obligation

For each concrete history h:

M_AA(h) = abstract state a

must satisfy:

Rep_AA(h,a)

and every P_AA-relevant concrete distinction that can affect future admissibility must either:
1. appear in a; or
2. remain recoverable through declared auxiliary history.

No third hidden channel is permitted.

## 13. Minimality result

Current conclusion:

Definitely required:
- AuthorityContext
- ResourceIncarnation
- PolicyContext
- DelegationContext

Conditionally required:
- FenceContext
- PendingDecision

Required semantic result but potentially compressible:
- AdmissionBindingClass

PendingDecision can potentially disappear if a correctly specified lease/fence relation completely represents the decision-to-admission interval.

FenceContext can potentially disappear only if the first protocol model chooses atomic decision+admission and has no separate freshness mechanism.

## 14. Candidate invariants

AD14-01 AUTHORITY_CONTEXT_CANNOT_COLLAPSE_TO_BOOLEAN
AD14-02 RESOURCE_INCARNATION_IS_P_AA_RELEVANT
AD14-03 POLICY_CONTEXT_IS_P_AA_RELEVANT
AD14-04 DELEGATION_CONTEXT_IS_P_AA_RELEVANT_UNLESS_DERIVED
AD14-05 FENCE_CONTEXT_IS_REQUIRED_WHEN_FRESHNESS_IS_SEPARATE
AD14-06 PENDING_DECISION_IS_CONDITIONAL_ON_PROTOCOL
AD14-07 ADMISSION_BINDING_CANNOT_BE_ELIMINATED
AD14-08 SNAPSHOT_MINIMIZATION_IS_BEHAVIORAL
AD14-09 FENCE_MUST_NOT_AMPLIFY_AUTHORITY
AD14-10 LEASE_MUST_BIND_REQUIRED_POLICY_CONTEXT
AD14-11 LEASE_MUST_BIND_REQUIRED_RESOURCE_INCARNATION
AD14-12 RETRY_BINDING_MUST_BE_EXPLICIT
AD14-13 ADMISSION_EQUIVALENCE_PRESERVES_REQUIRED_TEMPORAL_RELATIONS
AD14-14 EVERY_P_AA_RELEVANT_DISTINCTION_IS_STATE_OR_DECLARED_HISTORY
AD14-15 NO_HIDDEN_THIRD_INFORMATION_CHANNEL

## 15. AB14 status

G1 advanced — component minimization attacked.
G2 advanced — history minimization boundary clarified.
G3 advanced — behavioral equivalence candidate.
G4 advanced — CM-AA1..20 plus CM-AA21..25.
G5 advanced — transition preconditions/postconditions candidate.
G6 advanced — PendingDecision conditional.
G7 open — AdmissionBindingClass minimal quotient not yet derived.
G8 open — smallest finite domains not yet justified.
G9 open — TLA+ deferred.

## 16. AB15 frontier

AB15-G1 formally characterize AdmissionBindingClass equivalence.
AB15-G2 attack quotient stability under every transition.
AB15-G3 determine exact fence/lease fields.
AB15-G4 determine whether PendingDecision can be eliminated.
AB15-G5 construct complete CM-AA basis against the quotient.
AB15-G6 derive minimal finite domains from countermodels.
AB15-G7 define exact Rep_AA relation.
AB15-G8 only then draft TLA+.

Verification boundary:
No implementation.
No TLA+ execution.
No TLC execution.
No theorem claimed proven.

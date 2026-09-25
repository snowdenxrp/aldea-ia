# NEXO AB20 — P_AA TRANSITION CLOSURE, TRACE BASIS, BOUNDARY MODE AND REFINEMENT-MAPPING CONTRACT RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No formal proof claimed.

## 1. External cross-check
Lamport's current TLA+ material describes specifications as state machines with Init and a next-state relation, and refinement as implementation under a refinement mapping. His auxiliary-variable paper explicitly allows history variables to support such mappings without becoming implementation state. TLC checks finite-state models supplied to it; therefore model-domain coverage remains a separate obligation.

## 2. P_AA normalized transition relation
State:
AA_Norm = AuthorityConsequences + ResourceIncarnation + PolicyConsequences + DelegationConsequences + ReducedFenceLeaseContext + AdmissionBindingClass

Every transition is legal only if it updates every component whose P_AA meaning changes.

Authority transitions: IssueAuthority establishes authority consequences but cannot directly admit; RevokeAuthority invalidates current authority as specified but does not erase historical validity; AdvanceEpoch changes currentness and does not create authority.
Delegation: ChangeDelegation changes delegation consequences and invalidates any bridge whose required delegation context no longer matches.
Policy: ChangePolicy changes policy consequences and invalidates a bridge if required compatibility no longer holds.
Resource: ReincarnateResource changes incarnation and invalidates bindings or bridges tied to the previous incarnation.
Fence/lease: IssueLease requires a valid authority basis and creates freshness/binding state but does not create authority; ExpireLease invalidates the bridge but does not necessarily revoke authority.
Decision/admission: Decide creates or updates a complete bridge; Admit requires valid current authority plus a valid complete bridge whose joint binding matches the admission; Retry creates a new attempt and authorization inheritance must be explicit; Abort removes the internal pending path and makes no assertion about external effect.

## 3. Cross-transition invalidation rule
Candidate BridgeValid(b,t) = Fresh AND AuthorityCompatible AND PolicyCompatible AND DelegationCompatible AND IncarnationCompatible AND BoundaryCompatible AND BindingMatches.
This is a joint predicate. No individual lease_valid bit is authoritative.

## 4. Boundary decision
B0 fixed boundary: Z1->Z3 is a model constant. This is the candidate for the first narrow model. Dynamic boundary B1 is a mandatory extension and must not be inferred from B0 results.

## 5. Trace basis
T1 authorize -> admit; T2 authorize -> revoke -> admit; T3 authorize -> epoch advance -> admit; T4 authorize -> delegation revoke -> admit; T5 authorize -> policy incompatible -> admit; T6 authorize -> reincarnate -> admit; T7 decide -> lease expire -> admit; T8 decide -> policy change -> admit; T9 decide -> delegation revoke -> admit; T10 decide -> incarnation change -> admit; T11 authorize A1 -> retry A2 -> admit A2; T12 authorize S1 -> present bridge as S2; T13 authorize R1 -> present bridge for R2; T14 authorize O1 -> present bridge for O2; T15 authorize tuple X -> substitute one relational edge -> admit; T16 authorize -> abort; T17 authorize -> unrelated transition -> admit; T18 repeated issue/revoke/advance cycles -> admit; T19 same final scalar state, different admission history; T20 bridge replay after each invalidation type.

## 6. New trace countermodels
CM-AA69 revoke/admit race: revocation and admission occur in different orderings that produce different results; authorization linearization must be explicit.
CM-AA70 policy/admit race.
CM-AA71 incarnation/admit race.
CM-AA72 delegation/admit race.
CM-AA73 epoch/admit race.
CM-AA74 lease expiry/admit race.
These reveal a missing semantic parameter if the model has no explicit admission authorization point.

## 7. Admission linearization point
Candidate options: L1 authorization checked atomically with Admit; L2 lease/fence determines a validity interval and Admit must occur inside it; L3 Admit performs an explicit recheck of all required authority/policy/delegation/incarnation conditions.
Without choosing one, Decision and Admit are underspecified. This is claim semantics, not merely implementation detail.

## 8. Refinement mapping contract
Candidate M_AA(ImplementationState, AuxiliaryHistory) = AA_Norm.
Requirements: every concrete state maps to exactly one abstract state under the chosen claim/boundary scope; every P_AA-relevant concrete transition maps to a valid abstract transition or an explicit permitted stutter/UNKNOWN; no concrete transition may map to an abstract transition that grants more authority; required historical distinctions remain recoverable; Z4 outcomes are not imported; relational bindings, currentness, incarnation, policy/delegation compatibility, bridge validity and replay semantics are preserved.

## 9. Stuttering
Concrete internal steps may map to abstract stuttering when they do not change AA_Norm. A concrete step that changes a P_AA-relevant distinction cannot be hidden as stuttering merely because a visible implementation field did not change.

## 10. Domain freeze candidate
Subjects=2; Operations=2; Attempts=2; Resources=2; Incarnations=2; Epochs=2; Policies=2; Delegations=2; Fences/leases=2; Capabilities/scopes=2; Temporal positions=3; Boundary modes=1 fixed B0.
This is coherent but not claimed complete.

## 11. Coverage interpretation
A satisfying result for this finite B0 model would apply only to the specified finite model, assumptions, transitions and boundary. It would not establish arbitrary domain cardinalities, dynamic boundary, unmodeled provider behavior, implementation correctness, or real-world external effect.

## 12. Freeze status
Candidate semantic freeze: Z1->Z3 boundary; P_AA meaning; six-component AA_Norm; complete lease bridge; B0 fixed boundary; two-element relational identity domains; three temporal positions; T1-T20 trace basis; CM-AA1..74.
Still open: exact quotient completeness; proof of transition closure; exact concrete-to-abstract representation relation; formal TLA+ syntax; TLC result; implementation refinement.

## 13. Candidate invariants
AD20-01 EVERY_PAA_RELEVANT_TRANSITION_HAS_EXPLICIT_ABSTRACT_SEMANTICS
AD20-02 BRIDGE_VALIDITY_IS_JOINT
AD20-03 AUTHORIZATION_LINEARIZATION_POINT_IS_EXPLICIT
AD20-04 REVOCATION_ORDER_MUST_NOT_BE_IMPLICIT
AD20-05 POLICY_ORDER_MUST_NOT_BE_IMPLICIT
AD20-06 INCARNATION_ORDER_MUST_NOT_BE_IMPLICIT
AD20-07 DELEGATION_ORDER_MUST_NOT_BE_IMPLICIT
AD20-08 EPOCH_ORDER_MUST_NOT_BE_IMPLICIT
AD20-09 LEASE_EXPIRY_ORDER_MUST_NOT_BE_IMPLICIT
AD20-10 FIXED_BOUNDARY_RESULTS_ARE_NOT_DYNAMIC_BOUNDARY_RESULTS
AD20-11 STUTTERING_CANNOT_HIDE_PAA_RELEVANT_CHANGE
AD20-12 REFINEMENT_MAPPING_MUST_NOT_AMPLIFY_AUTHORITY
AD20-13 REFINEMENT_MAPPING_PRESERVES_RELATIONAL_BINDINGS
AD20-14 REFINEMENT_MAPPING_PRESERVES_CURRENTNESS
AD20-15 FINITE_MODEL_RESULT_IS_SCOPE_BOUNDED

## 14. AB20 status
G1 advanced — normalized transition relation candidate.
G2 advanced — trace basis.
G3 advanced — dynamic invalidation.
G4 advanced — boundary mode decision.
G5 advanced — admission linearization point identified.
G6 advanced — refinement-mapping contract.
G7 advanced — coherent finite-domain candidate.
G8 open — formal quotient/transition completeness.
G9 open — TLA+ drafting.

## 15. AB21 frontier
1. Freeze exact P_AA contract and assumptions.
2. Derive the abstract Next relation in mathematical form.
3. Define the concrete history vocabulary needed by M_AA.
4. Construct the first TLA+ module without running TLC.
5. Construct a separate finite configuration.
6. Before execution, audit the model for semantic omissions against CM-AA1..74.
7. Only then run syntax/model checking and record results separately from research.
# NEXO AB31 — P_AA COMPLETE PAIR MATRIX, THREE-EVENT COUNTERMODELS, UNKNOWN TYPING, AND RESIDUAL-ORDER FACTORIZATION V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No formal proof claimed.

## 1. External cross-check
Official Lamport material distinguishes history variables, refinement mappings, and stuttering variables. It also describes the Reduction Theorem as reasoning about a fine-grained specification using a coarser-grained one. A mechanically checked refinement example first checks safety refinements with TLC before attempting proofs. These establish methodology only; none proves Nexo's model.

## 2. Complete pair dependency matrix
Let event classes be A=AUTHORITY/REVOCATION/EPOCH, D=DELEGATION, P=POLICY, R=RESOURCE-INCARNATION, L=LEASE/BRIDGE, T=ATTEMPT/RETRY, Q=DECISION, M=ADMIT.
Candidate direct dependencies toward M:
A-M: required when the same authority/epoch is used.
D-M: required when the same delegation chain is used.
P-M: required when the same policy context is used.
R-M: required when the same resource incarnation is used.
L-M: required for lease-based protocol or bridge validity.
T-M: required when attempt identity is part of binding.
Q-M: required when decision is part of the admission protocol.
ABORT-M: conditional on whether abort can destroy the actual linkage.

Cross-invalidator pairs A-D, A-P, A-R, D-P, D-R, P-R, A-L, D-L, P-L, R-L, T-L, Q-A, Q-D, Q-P, Q-R are not universally order-relevant. They become relevant only when they share the actual admission/bridge dependency closure or can alter a future P_AA-relevant continuation.

## 3. Three-event minimal countermodel family
Each countermodel has an admission M and two preceding or competing events X,Y. The purpose is to show why pairwise removal can fail.
CM-AA231: P-change + D-change + M — final policy/delegation state same across permutations, but bridge validity at M differs.
CM-AA232: D-change + R-reincarnate + M — each invalidation is independently visible, but their interaction changes lease binding.
CM-AA233: L-expire + retry + M — retry may create a new attempt that cannot inherit the expired bridge.
CM-AA234: Q-decision + A-revoke + M — decision history alone cannot bypass current admission authority rules.
CM-AA235: P-change + L-issue + M — lease issuance before/after policy change can change protocol validity.
CM-AA236: D-change + L-issue + M — same issue with delegation.
CM-AA237: R-reincarnate + L-issue + M — same issue with incarnation.
CM-AA238: A-epoch + L-issue + M — stale epoch can be hidden by a structurally valid lease.
CM-AA239: retry + lease-renew + M — same current lease fields, different attempt/renewal history.
CM-AA240: two irrelevant events + M — forcing total order creates false distinctions.

## 4. Edge minimality
An edge is independently necessary only if removing it while retaining all other represented relations permits two valid histories with different P_AA observations.
If its relation is derivable from a preserved path, it is not independently necessary to store.
If its relevance cannot be established, it remains UNKNOWN and cannot be safely deleted.

## 5. UNKNOWN typing
Do not model UNKNOWN as an ordinary Boolean or as an ordering value.
Candidate type:
Assessment_AA = TRUE_JUSTIFIED | FALSE | UNKNOWN(reason)
Reasons are epistemic/coverage states, not truth values.
UNKNOWN may later become TRUE_JUSTIFIED or FALSE after more evidence is retained or concretized.
Therefore assessment is not monotone with respect to information loss.

## 6. Safety-claim interpretation
For the universal safety claim P_AA, a concrete violation is evidence of FALSE. A missing distinction is not itself a violation. A sound abstraction may instead return UNKNOWN if its representation cannot establish the universal condition.

## 7. Factorization result
Tested candidate:
Ord_AA = Order(AdmissionBindingClass) + Order(LeaseBridge) + ResidualOrder.

Current finding: ResidualOrder cannot yet be proven empty.
Potential irreducible residuals:
- admission linearization position;
- replay/consumption order;
- invalidation-before-admission relation when not encoded in bridge;
- retry-to-admission order;
- historical linkage reconstruction order.

However, these residuals may still be representable as fields or relations inside LeaseBridge or AdmissionBindingClass. Therefore 'residual order' is a semantic category, not yet a required top-level variable.

## 8. Important correction
Do not equate 'ResidualOrder exists semantically' with 'ResidualOrder must be stored as a separate variable'.
The final abstraction may pack the relation into another structure without losing semantics.

## 9. Minimal-domain candidates
Identity domains need at least two values for substitution attacks: Subjects=2, Resources=2, Operations=2, Attempts=2.
Incarnations=2, Epochs=2, Policies=2, Delegations=2, Bridges/Leases=2, Capabilities/Scopes=2.
ProtocolClass={ATOMIC, LEASE, RECHECK}.
Assessment={TRUE_JUSTIFIED, FALSE, UNKNOWN}.
Temporal representation should be bounded event instances plus partial order, not three integer slots.

These are candidate finite domains only. Their sufficiency has not been model-checked.

## 10. First abstract vocabulary candidate
Current candidate semantic vocabulary:
AuthorityContext
ResourceIncarnation
PolicyContext
DelegationContext
LeaseBridge
AdmissionBindingClass
AdmissionOrderSupport
Assessment_AA
AuxiliaryHistory

AdmissionOrderSupport is provisional and must not be frozen as a top-level variable until factorization is attacked further.

## 11. Refinement obligation
Forward relation R_AA must map every concrete P_AA-relevant behavior to an abstract behavior preserving the admission observation. Concrete steps may stutter only when all relevant abstract observations and future support are unchanged. Exact quotient remains a stronger future task.

Official Lamport material states that stuttering steps leave relevant variables unchanged and that auxiliary variables can be introduced to construct refinement mappings. This supports the distinction between semantic history support and actual implementation state.

## 12. Result
AB31 closes the first complete pair-dependency classification at the semantic level and adds minimal three-event countermodels.
UNKNOWN is now typed and cannot be silently collapsed into truth or falsity.
ResidualOrder remains semantically possible but is not yet justified as a separate state variable.
The candidate finite domain is now explicit but remains unverified.

## 13. AB32 frontier
1. Attack whether AdmissionOrderSupport can be eliminated entirely by enriching LeaseBridge and AdmissionBindingClass.
2. Attack whether Assessment_AA needs provenance as semantic state or only auxiliary evidence.
3. Build the first bounded abstract transition system on paper, without TLA+ syntax yet.
4. Derive exact initial and next-state obligations.
5. Check whether protocol classes can share one abstract transition kernel without hidden semantic divergence.
6. Only after these survive, draft the first TLA+ module.
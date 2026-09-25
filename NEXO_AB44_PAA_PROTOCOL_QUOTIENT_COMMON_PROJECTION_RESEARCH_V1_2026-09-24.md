# NEXO AB44 — PAA PROTOCOL QUOTIENTS AND COMMON PROJECTION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Baseline
AB43 was reread directly before this round. The target is to define protocol-specific semantic quotients for ATOMIC, LEASE, and RECHECK, then identify their common projection without collapsing distinct protocol behavior.

## 2. Protocol quotient definition
For protocol p, define `Q_p(H,a)` as the equivalence class of the admission-centered history under the claim-relative relation that preserves actual admission linkage, current P_AA-relevant authorization consequences, complete binding, protocol validity, P_AA-relevant order/invalidation, replay/attempt behavior where applicable, boundary/threat contract, and all allowed future P_AA observations or UNKNOWN where correspondence cannot be established. This is a semantic quotient, not a runtime object.

## 3. Common projection
Define `π_common(Q_p)` as the portion preserving only protocol-independent claim semantics:
`<ActualAdmissionLink, AuthorityValidityAtAdmission, CompleteBinding, PolicyCompatibility, DelegationValidity, IncarnationCompatibility, BoundaryPermission>`.
A projection is safe only if forgetting protocol-specific information cannot change the truth/UNKNOWN assessment of the common claim under the contract.

## 4. ATOMIC quotient
`Q_ATOMIC` must preserve a linearization/non-interleaving relation sufficient to establish that no relevant invalidation occurs between authorization establishment and admission. The exact internal implementation of atomicity is abstracted away; the semantic guarantee is retained.

## 5. LEASE quotient
`Q_LEASE` must preserve bridge issuance/admission linkage, validity interval, expiry/renewal semantics, replay/consumption, and invalidation relations relevant to admission. A current `valid` bit is insufficient whenever future behavior depends on those relations.

## 6. RECHECK quotient
`Q_RECHECK` must preserve the actual recheck fact-set, admission linkage, and order/temporal relation proving that the required facts were re-established at the admission point. `rechecked=true` is insufficient unless its contract uniquely determines that set and order.

## 7. Common projection test
For each protocol, forgetting protocol-specific semantics is safe only if all histories that collapse to the same `π_common` have the same P_AA assessment and the same relevant future observation behavior under the restricted contract. This is stronger than equal current assessment.

## 8. Cross-protocol collisions
ATOMIC and LEASE can share the same common projection and current TRUE_JUSTIFIED result while differing through expiry/renewal successors. ATOMIC and RECHECK can share it while differing through recheck fact-set/order. LEASE and RECHECK can share it while differing through lease expiry versus recheck behavior. Therefore the common projection is not by itself an exact protocol quotient.

## 9. Generic ProtocolBridgeSemantics candidate
A single generic relation can represent all protocols if it has semantics sufficient to distinguish the relevant obligations:
`ProtocolBridgeSemantics = <Link, ValidityMode, Order/Linearization, Invalidation, Replay, Revalidation, ContinuationRules>`.
This is a semantic interface, not a required seven-field runtime object.

## 10. Generic relation attack
The generic relation fails if `ValidityMode` is only a label. It must determine transition and admission rules. `Revalidation` must encode exact recheck facts, and `ContinuationRules` must be derivable rather than assumed.

## 11. Common-kernel conclusion
`K_common` is protocol-independent; `ProtocolSemantics` is protocol-dependent but potentially represented through one semantic interface.

## 12. Protocol parameter
A single abstract specification can use `p ∈ {ATOMIC, LEASE, RECHECK}` if action contracts and semantic obligations are parameterized correctly. Separate modules are not yet necessary conceptually.

## 13. Abstract Next candidate
`Next_AA(A,A',p)` is defined by the protocol-specific concrete transition relation projected through `Q_p`, subject to common-kernel preservation, protocol-semantic preservation, actual-linkage preservation, no authority amplification, boundary preservation, observation preservation, and UNKNOWN for unresolved correspondence.

## 14. Safety observation
`Obs_AA` remains protocol-independent: `TRUE_JUSTIFIED`, `FALSE`, `UNKNOWN`. Protocol determines how the observation can be established, not what TRUE_JUSTIFIED means.

## 15. Minimality warning
The seven fields of `ProtocolBridgeSemantics` are not individually proven irreducible. The lower bound remains behavioral: any representation must preserve every distinction that can change P_AA under allowed continuations.

## 16. Strong result
The architecture can now be expressed as:
`ClaimKernel + ProtocolSemanticInterface`.
This avoids maintaining three unrelated claims or prematurely forcing a physical representation.

## 17. AB45 frontier
1. Attack the generic ProtocolBridgeSemantics interface for hidden protocol distinctions.
2. Derive exact Pre/Post/Frame/Invalidation/HistorySupport/AdmissionLink contracts parameterized by p.
3. Check whether one generic action schema remains sound across all protocols.
4. Derive the smallest protocol-independent safety observation and protocol-dependent transition obligations.
5. If stable, prepare a semantic freeze document before any new TLA+ implementation.

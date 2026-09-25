# NEXO AB45 — PAA GENERIC PROTOCOL BRIDGE INTERFACE ATTACK RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Baseline
AB44 was reread directly before this round. External cross-check used official Lamport material on refinement mappings, auxiliary variables, and stuttering. These sources support using auxiliary history for a refinement mapping and requiring genuine semantic stutter; they do not prove this Nexo model. 

## 2. Generic interface under attack
Candidate:
`PB = <Link, ValidityMode, OrderLinearization, Invalidation, Replay, Revalidation, ContinuationRules>`.
The attack asks whether these relations can express every P_AA-relevant distinction for ATOMIC, LEASE, and RECHECK without hidden protocol-specific state.

## 3. Attack G1 — ValidityMode alias
If `ValidityMode=LEASE` merely labels a state but does not determine interval/expiry/renewal semantics, the abstraction is incomplete. Therefore mode must be interpreted through action guards and successor rules, not treated as a scalar.

## 4. Attack G2 — Atomic hidden interleaving
Two histories can both say ATOMIC while only one actually has a valid non-interleaving linearization point. PB must encode the semantic guarantee, not the implementation label.

## 5. Attack G3 — Lease renewal authority
Two leases may both be valid now while one permits renewal after a policy/delegation transition and the other does not. Renewal conditions must be represented or derivable.

## 6. Attack G4 — Recheck fact-set alias
Two admissions can have `Revalidation=true` while different facts were re-established. PB must preserve the exact claim-required fact set or make the unresolved case UNKNOWN.

## 7. Attack G5 — Protocol cross-collision
ATOMIC, LEASE, and RECHECK can all yield TRUE_JUSTIFIED at t0 but have different legal future actions. Therefore PB equality must imply continuation equivalence, not merely current observation equality.

## 8. Attack G6 — Hidden linkage
If PB forgets which authority/bridge was actually used, two valid candidate contexts can collide. Actual admission linkage is therefore part of the semantic interface or must be reconstructible from auxiliary history.

## 9. Attack G7 — Invalidation composition
A single invalidation flag is insufficient when future behavior depends on which event caused invalidation, its order relative to renewal/recheck, or whether it affects the actual bridge. PB must preserve claim-relevant invalidation relations.

## 10. Attack G8 — Replay/attempt composition
A generic replay boolean is insufficient when retry semantics differ by attempt, consumption, bridge, or protocol. PB must preserve the relation needed to determine whether the actual retry is authorized.

## 11. Attack G9 — Boundary transition
Under fixed B0, boundary semantics can be part of the contract. Under dynamic boundaries, future boundary changes can separate equal PB states unless their effect is represented or UNKNOWN is returned. Thus boundary may be contract-fixed or part of continuation semantics.

## 12. Attack G10 — ContinuationRules circularity
`ContinuationRules = all future behavior` would make PB tautological and useless. Therefore ContinuationRules must be generated from finite semantic primitives/action contracts, not defined as an oracle equal to the quotient itself.

## 13. Important consequence
A generic interface is sound only if its semantics are defined independently enough to generate Pre/Post/Frame/Invalidation/HistorySupport/AdmissionLink and future successors. Otherwise it merely renames Qres.

## 14. Proposed generic semantic algebra
For protocol p, define:
`PB_p(H,a) = <Link_p, Mode_p, Ord_p, Inv_p, Replay_p, Reval_p>`.
`ContinuationRules_p` should be derived as the transition closure of these relations under the protocol action contract, rather than stored as an additional primitive.
This is a major reduction candidate, but transition closure must be demonstrated.

## 15. Protocol mappings
ATOMIC: Mode=linearization; Ord captures the admission linearization and prohibited relevant interleavings; Inv captures invalidation exclusion; Replay/Reval are protocol-dependent only if the protocol exposes them.
LEASE: Mode=interval; Ord captures issuance/admission/expiry/renewal order; Inv captures invalidation/expiry; Replay captures consumption/reuse; Reval may describe renewal/revalidation if present.
RECHECK: Mode=reestablishment; Ord captures recheck-before-admission; Reval captures exact rechecked fact set; Inv captures changes between relevant checks and admission.

## 16. What remains common
`Link`, claim-level validity, complete binding, policy/delegation/incarnation/boundary compatibility, and observation semantics remain outside protocol-specific mechanism semantics.

## 17. Candidate action contract
For every protocol p:
`Action_p = <Pre_p, Post_p, Frame_p, Invalidation_p, HistorySupport_p, AdmissionLink_p>`.
The generic PB is acceptable only if these contracts are functions of `K_common + PB_p` plus declared auxiliary history, without hidden protocol assumptions.

## 18. Refinement implication
Lamport's material explicitly treats auxiliary variables as potentially necessary for constructing a refinement mapping and distinguishes history/stuttering variables. Therefore an eventual TLA+ model may use auxiliary history to reconstruct PB semantics while keeping implementation variables compact. citeturn0search17turn0search18

## 19. Stuttering implication
A step can be hidden only if it leaves all relevant abstract semantics unchanged. A protocol event that changes expiry, renewal rights, recheck facts, linkage, invalidation order, or future P_AA observations is not genuine stutter merely because current claim output remains TRUE_JUSTIFIED. citeturn0search12

## 20. Result
The generic interface survives provisionally, but only as a semantic algebra whose transition behavior is derived from its relations. The dangerous formulation `ProtocolBridgeSemantics = label + oracle for all future behavior` is rejected as circular.

## 21. Current architecture
`P_AA = ClaimKernel(K_common) + ProtocolSemanticAlgebra(PB_p)`.
`Qres` is not a permanent variable. Residual information survives only when it cannot be derived from K_common, PB_p, and declared auxiliary history without changing P_AA or future observations.

## 22. AB46 frontier
1. Derive concrete Pre/Post/Frame/Invalidation/HistorySupport/AdmissionLink from PB_p for each protocol.
2. Prove or refute bounded transition closure from PB primitives to continuation behavior.
3. Search for the smallest common observation and protocol-specific transition guards.
4. Attack auxiliary-history sufficiency and hidden circularity.
5. If stable, write the semantic freeze candidate; otherwise record the exact residual.

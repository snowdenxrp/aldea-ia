# NEXO AB41 — PAA BRIDGEBINDING ABSTRACTION, CONGRUENCE, AND FUTURESUPPORT RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Baseline
AB40 was reread directly before this round. The candidate is a semantic `BridgeBinding*` relation intended to absorb Qres. This round defines it explicitly and attacks whether FutureSupport can be derived from it.

## 2. Explicit abstraction
For each admission `a` in concrete history H define:
`BB_AA(H,a) = <L_a, A_a, B_a, P_a, O_a, I_a, R_a>`
where:
- `L_a`: actual admission/authority/bridge linkage;
- `A_a`: claim-relevant authority consequences at admission;
- `B_a`: complete relational binding tuple;
- `P_a`: protocol semantics sufficient to validate the admission;
- `O_a`: P_AA-relevant order/linearization facts;
- `I_a`: invalidation and validity relations;
- `R_a`: replay/attempt/consumption semantics where applicable.
This is a mathematical abstraction, not a runtime data structure.

## 3. FutureSupport derivability test
Define `FutureSupportDerived(BB,H,a)` iff the set of P_AA-relevant future observations and legal abstract successors is uniquely determined by `BB_AA(H,a)` under the fixed claim/boundary/threat/environment contract.
If two histories H1,H2 satisfy `BB_AA(H1,a)=BB_AA(H2,a)` but have different relevant future observation sets, FutureSupport is NOT derivable and an additional residual is required or UNKNOWN must be exposed.

## 4. Candidate quotient
`H1 ≈BB H2` iff their BB representations are equal modulo semantic equivalence and their allowed P_AA-relevant future observations correspond. The desired absorption theorem would be:
`BB(H1)=BB(H2) => H1≈AAH2`.
This remains a candidate obligation, not a theorem.

## 5. Minimal permutation separators
The shortest current separators are:
- P1: POLICY_CHANGE ↔ DELEGATION_CHANGE when renewal/invalidation depends on both;
- P2: LEASE_EXPIRE ↔ RETRY when attempt reuse depends on lease state;
- P3: AUTH_REVOKE between DECIDE and ADMIT versus no such interleaving;
- P4: REINCARNATE before/after bridge use;
- P5: DELEGATION_CHANGE between RECHECK and ADMIT;
- P6: POLICY_CHANGE before/after RENEW;
- P7: CONSUME before/after RETRY;
- P8: INCARNATION_CHANGE before/after admission.
A separator is decisive only if the candidate BB representation collides while P_AA observation or future behavior differs.

## 6. Joint congruence attack
Suppose `BB(H1)=BB(H2)`. For every concrete P_AA-relevant transition from H1, the abstraction must admit a corresponding transition from H2 (possibly a finite sequence) preserving BB-equivalence and observations, or conservatively reach UNKNOWN. Otherwise BB is not a stable quotient representation.
The converse is not required for one-way forward refinement, but is required for exact behavioral equivalence.

## 7. Stutter restriction
A concrete transition may stutter only if it preserves BB semantics AND does not alter future P_AA observations. Therefore an apparently hidden lease-expiry or policy transition cannot stutter merely because current admission fields are unchanged.

## 8. FutureSupport result
FutureSupport can be derived in a restricted contract if all future P_AA-relevant transition guards and successor semantics are functions of BB. This is stronger than current observation equality.
For mixed protocols, it is plausible but not established. In particular, protocol continuation may depend on historical facts not represented by a current validity bit.

## 9. Three critical residual candidates
Even a rich BB may still lose:
R1 exact atomic linearization/non-interleaving semantics;
R2 exact recheck fact-set and the temporal point at which those facts were re-established;
R3 future continuation differences caused by hidden history.
These are not automatically independent; a protocol relation may encode them jointly.

## 10. Absorption conditions
Qres can be removed as a separate semantic component only if BB satisfies:
C1 actual-linkage completeness;
C2 protocol semantic completeness;
C3 order/invalidation completeness;
C4 replay/attempt completeness;
C5 boundary preservation;
C6 no authority amplification;
C7 transition congruence;
C8 future observation preservation;
C9 UNKNOWN on unresolved correspondence.

## 11. Candidate stable kernel
If C1–C9 hold, the candidate stable semantic kernel becomes:
`AAKernel* = <AuthorityContext, ResourceIncarnation, PolicyContext, DelegationContext, BridgeBinding*>`.
This is not yet frozen because C7/C8 remain unproven.

## 12. Important distinction
`BB_AA` is not necessarily physical state. It may be reconstructed from implementation state plus auxiliary history. Therefore:
`semantic necessity != runtime variable necessity`.
A mathematical quotient can be essential to prove/refine the claim while being absent as a stored object.

## 13. No universal minimality claim
A protocol-specific implementation may encode all of BB in a single capability/lease object. Another may require several structures. Field count is not the semantic lower bound. The lower bound is preservation of the P_AA behavioral quotient and actual linkage.

## 14. Candidate abstract Next
`Next_AA(A,A')` should be generated from concrete transitions by the abstraction, subject to:
- same claim/boundary/threat contract;
- no authority amplification;
- actual admission linkage preservation;
- protocol/order/invalidation preservation;
- replay/attempt preservation;
- BB successor representability;
- observation preservation;
- UNKNOWN when successor correspondence cannot be established.

## 15. Current conclusion
AB41 reduces the open question to a precise one: whether `BB_AA` is a congruence-complete abstraction for P_AA. Qres is no longer treated as an automatically permanent component. It is now a residual only if BB collisions can still be separated by P_AA or its future transition space.

## 16. AB42 frontier
1. Attack C7/C8 with explicit collision pairs after representation equality.
2. Separate current-state equivalence from continuation-space equivalence.
3. Determine whether protocol-specific BB definitions can make FutureSupport derived.
4. Derive the abstract transition relation from the concrete action contract.
5. Only if the quotient stabilizes, freeze the semantic kernel and proceed to the next TLA+ draft.

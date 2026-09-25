# NEXO AB42 — PAA BRIDGEBINDING COLLISION CONGRUENCE RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Baseline
AB41 was reread directly before this round. The candidate semantic abstraction is `BB_AA = <Link, Auth, Binding, Protocol, Order, Invalidation, Replay>`. The open gate is whether equal BB representations remain congruent under future P_AA-relevant transitions.

## 2. External cross-check
Lamport's official material states that refinement mappings relate implementation state to a higher-level specification and that auxiliary variables can be used when needed to construct such a mapping. It also defines stuttering steps as steps leaving all relevant variables unchanged; TLA formulas are invariant under stuttering. These points support our distinction between genuine semantic stutter and hidden claim-relevant change, but do not verify Nexo. citeturn0search12turn0search7

## 3. Collision criterion
For histories H1,H2 and admission a, a BB collision is:
`BB_AA(H1,a) = BB_AA(H2,a)`.
A congruence-safe collision requires that every P_AA-relevant continuation from H1 has a corresponding continuation from H2 preserving BB equivalence and observations, or that unresolved correspondence produces UNKNOWN. If one collision admits a decisive separator, BB is incomplete.

## 4. Collision C1 — hidden lease expiry
H1 and H2 have equal current BB fields and both admit now. H1 has an enabled future `LEASE_EXPIRE` tied to the used bridge; H2 does not. If expiry can change a future retry/admission assessment, current BB equality is insufficient unless expiry semantics are derivable from BB.

## 5. Collision C2 — hidden renewal right
Same current admission assessment. H1's bridge permits renewal under a known contract; H2's does not. If future renewal changes authorization or bridge validity, BB must encode renewal capability/conditions or conservatively distinguish the histories.

## 6. Collision C3 — hidden recheck fact-set
Both current assessments are equal. H1's last recheck established policy+delegation+incarnation; H2 established policy only. If a later admission relies on delegation/incarnation, the representations must differ or return UNKNOWN.

## 7. Collision C4 — hidden retry binding
Both current admissions are valid, but H1 binds retry to the same attempt while H2 requires a new attempt. A retry transition can separate them. Therefore attempt/replay semantics must be recoverable.

## 8. Collision C5 — hidden incarnation successor
Both currently reference incarnation I1, but H1 has a legal successor transition that invalidates the bridge and H2 does not. If future admission differs, current fields alone are not a congruence.

## 9. Collision C6 — hidden policy/delegation joint transition
Both current scalar compatibility checks are true. A joint future policy+delegation change invalidates the bridge in H1 but not H2 because the histories differ in how the bridge was established. This is a joint hyperrelation, not a scalar fact.

## 10. Collision C7 — hidden actual bridge linkage
Two valid bridges exist. Current summarized validity is equal, but the admission record points to different bridges. If their future expiry/revocation differs, `valid=true` is not enough. Actual UsedBridge linkage is irreducible for the claim.

## 11. Collision C8 — hidden boundary successor
Two histories are equivalent under current boundary facts but one permits a future boundary change that invalidates the bridge. If the boundary is dynamically modeled, future boundary semantics must be encoded or become UNKNOWN. If B0 is fixed forever, this dimension can be removed by contract rather than by inference.

## 12. Key result: current-state equality is not enough
These collisions show the exact gap between:
`CurrentEquivalent(BB1,BB2)`
and
`ContinuationEquivalent(BB1,BB2)`.
The latter is the relevant criterion for quotient stability.

## 13. Restricted-contract collapse
If the contract freezes:
- boundary B0;
- protocol class semantics;
- expiry/renewal/replay rules;
- incarnation transitions;
- policy/delegation transition semantics;
and all of those are deterministic functions of BB, then FutureSupport is derivable. This is a valid protocol-specific possibility, not a general theorem.

## 14. One-way refinement versus exact quotient
For a forward safety refinement, it is sufficient that each concrete step be simulated by an abstract step or genuine stutter while preserving the safety observation. Exact quotient equivalence requires stronger two-way correspondence. We therefore should not require bisimulation before the first safety refinement, but we must not call a one-way simulation an exact quotient.

## 15. Stutter correction
A concrete step is abstract stutter only when every P_AA-relevant abstract component and future behavior remains unchanged. This agrees with Lamport's notion that stuttering changes no relevant variables. A hidden expiration that changes future admissions is therefore not stutter merely because the current visible admission remains unchanged. citeturn0search7

## 16. Candidate congruence contract
`Congruent_AA(H1,H2)` iff:
1. same claim/boundary/threat/environment contract;
2. same BB semantics;
3. same actual linkage;
4. corresponding current observation;
5. for every relevant H1 successor, matching H2 successor or UNKNOWN;
6. corresponding successors remain congruent;
7. no authority amplification;
8. boundary preserved.
Exact equivalence additionally requires the reverse successor condition.

## 17. Result on Qres
Qres is not proven necessary as a separate component. However, a generic BB containing only current validity fields is refuted as a congruence-complete representation. The residual must either be encoded into protocol/order/invalidation/replay relations of BB or remain as auxiliary/semantic quotient support.

## 18. Refinement mapping consequence
The future quotient may be represented through auxiliary history even when it is not stored in implementation state. Lamport's material explicitly discusses auxiliary variables as a way to construct refinement mappings. Therefore a future formal model may legitimately use history support to define `M_AA`, while the implementation may store only a compact bridge/binding representation if the reconstruction contract is established. citeturn0search12

## 19. Semantic kernel status
Candidate:
`AAKernel* = <AuthorityContext, ResourceIncarnation, PolicyContext, DelegationContext, BridgeBinding*>`.
Status: CONDITIONAL, not frozen.
Condition: BB must encode or derive all claim-relevant continuation distinctions under the chosen protocol contract.

## 20. AB43 frontier
1. Formalize `Congruent_AA` recursively over bounded continuation depth.
2. Enumerate protocol-specific BB candidates for ATOMIC, LEASE, RECHECK.
3. Determine which residual relations are required in each protocol.
4. Compare the intersection kernel shared by all protocols against protocol-specific extensions.
5. Derive a stable abstract Next and only then prepare the next TLA+ draft.

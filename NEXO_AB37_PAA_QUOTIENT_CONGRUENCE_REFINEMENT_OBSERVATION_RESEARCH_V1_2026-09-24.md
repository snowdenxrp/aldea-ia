# NEXO AB37 — PAA QUOTIENT CONGRUENCE, OBSERVATION, AND REFINEMENT RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Baseline
AB36Z was reread directly before this round. The current candidate is a claim-relative residual quotient over AdmissionLink, ProtocolValidity, Order/Linearization, Invalidation/Continuation, and FutureSupport. These are semantic obligations, not necessarily independent variables.

## 2. External cross-check
Lamport's refinement material distinguishes implementation behavior from the abstract specification via a refinement mapping and permits auxiliary history variables when needed to define that mapping. This supports defining the quotient as an abstract semantic relation while leaving its concrete support auxiliary. citeturn0search1

## 3. Observation function
Define an admission-indexed observation:
Obs_AA(h) = { admission_id -> Assessment_AA }
where each assessment is TRUE_JUSTIFIED, FALSE, or UNKNOWN and is computed from the actual linked admission context, not from an arbitrary valid witness.
The observation may also carry non-authoritative provenance needed to check refinement obligations; provenance must not silently become authorization.

## 4. Concrete-to-abstract mapping
Candidate:
M_AA(H) = <AuthorityContext, ResourceIncarnation, PolicyContext, DelegationContext, LeaseBridge, AdmissionBindingClass, Qres(H)>
where Qres(H) is the residual quotient class induced by the concrete EventDAG/history H.
M_AA is not yet a proved refinement mapping.

## 5. Quotient relation
For histories H1,H2 under identical claim, boundary, threat, and environment assumptions:
H1 ≈Q H2 iff:
1. actual admission linkage corresponds;
2. current P_AA semantic context corresponds;
3. protocol validity corresponds;
4. P_AA-relevant order/linearization and invalidation relations correspond;
5. all allowed future continuations have matching P_AA observations, or both expose UNKNOWN at the same unresolved point;
6. no-authority-amplification and refinement obligations correspond.

## 6. Why current observation equality is insufficient
Two histories can both currently observe TRUE_JUSTIFIED while having different legal successors. Example: a valid ATOMIC authorization and a valid LEASE can both admit now, but only the LEASE may legally EXPIRE or RENEW. Therefore Obs_AA equality is weaker than quotient equivalence.

## 7. Congruence obligation
The quotient is useful only if it is stable under P_AA-relevant transitions. Candidate requirement:
If H1 ≈Q H2 and H1 -> H1' is a legal relevant transition, then there exists a corresponding legal transition sequence from H2 to H2' such that H1' ≈Q H2', or the abstract observation must conservatively become UNKNOWN where correspondence cannot be established.
For exact behavioral equivalence, the converse direction is additionally required. We do not call this bisimulation unless both directions and the observation semantics are formally fixed.

## 8. Stuttering criterion
A concrete transition may be abstractly stuttering only if it leaves unchanged:
- abstract semantic context;
- actual admission linkage;
- protocol validity semantics;
- P_AA-relevant order/invalidation support;
- future continuation space;
- claim observation.
Changing hidden protocol history while preserving current visible fields is not stuttering if it changes future P_AA behavior.

## 9. Minimal congruence attacks
CM-AA487: same current Obs, different lease expiry successor.
CM-AA488: same current Obs, different renewal successor.
CM-AA489: same current Obs, different recheck obligation.
CM-AA490: same current Obs, different retry binding.
CM-AA491: same current Obs, different incarnation successor.
CM-AA492: same current Obs, different policy/delegation invalidation successor.
CM-AA493: same current Obs, different actual UsedBridge linkage.
CM-AA494: same current Obs, different boundary-constrained successor.
CM-AA495: two individually equivalent histories become distinguishable after a joint policy+delegation transition.
CM-AA496: one history has a legal protocol transition absent in the other despite identical current fields.

## 10. Transitivity attack
Pairwise observational equality is not enough. The quotient relation must be defined directly by the full contract, not inferred from pairwise current-state equality. Otherwise H1~H2 and H2~H3 can hold under different hidden assumptions while H1~H3 fails.
Therefore claim, boundary, threat model, environment assumptions, and observation contract are parameters of the equivalence relation.

## 11. Bridge + Binding joint completeness
Neither Bridge nor Binding alone is expected to reconstruct all residual obligations:
- Binding can identify what admission tuple is used but not necessarily protocol transition semantics.
- Bridge can encode authorization transport but may not identify all admission-specific semantic obligations.
The correct question is whether the pair plus residual history has a total reconstruction function.

## 12. Candidate reconstruction contract
Reconstruct_Q(LeaseBridge, AdmissionBindingClass, H_aux) must be:
- total over modeled concrete histories;
- deterministic modulo ≈Q;
- actual-linkage preserving;
- protocol-validity preserving;
- transition/congruence preserving;
- future-observation preserving;
- no-authority-amplifying;
- boundary preserving.
Failure => UNKNOWN/PENDING rather than decisive safety.

## 13. New distinction: observation vs quotient
Obs_AA answers what the claim assessment currently says.
≈Q answers whether replacing one representative by another is behaviorally safe for the claim.
Therefore:
Obs equality does not imply ≈Q.
≈Q should imply equivalent observations under the same contract.

## 14. Refinement direction
For the first safety refinement, target a one-way forward relation:
R_AA(concrete, abstract)
with concrete steps simulated by abstract steps or stuttering while preserving observations and no-authority-amplification.
Exact quotient equivalence is stronger and can remain a later target.

## 15. Stable semantic-state candidate
A candidate abstract state can now be expressed as:
AAKernel = <AuthorityContext, ResourceIncarnation, PolicyContext, DelegationContext, LeaseBridge, AdmissionBindingClass, Qres>
where Qres is not an event log but the residual claim-relative congruence support.

## 16. Minimality status
No proof that Qres is nonempty in every protocol. No proof that Bridge+Binding are jointly complete. No proof of quotient congruence. No formal verification.
What is established is a necessary obligation: any claimed compression must be congruence-stable under P_AA-relevant transitions or conservatively return UNKNOWN.

## 17. AB38 frontier
1. Define Qres from EventDAG using an explicit abstraction function.
2. Determine whether Qres can be represented solely by relations already present in LeaseBridge/AdmissionBindingClass.
3. Enumerate minimal transition separators for each protocol class.
4. Attack joint-transition congruence systematically.
5. Derive a candidate stable abstract Next relation.
6. Only then produce the next TLA+ draft.

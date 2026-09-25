# NEXO AB47 — PAA SIX-CONTRACT COLLISION ATTACK RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC/TLAPS run, or proof claim.

## 1. Objective
Attack the AB46 hypothesis that Pre/Post/Frame/Invalidation/HistorySupport/AdmissionLink jointly determine all future P_AA-relevant behavior. A collision exists when two histories have the same six-contract projection but different future P_AA observations.

## 2. Important semantic correction
The six items are not all transition guards. Pre/Post/Frame/Invalidation describe transition semantics; HistorySupport and AdmissionLink can be refinement/observation obligations. Treating all six as a flat conjunction risks mixing implementation transition semantics with the representation relation.

## 3. ATOMIC attacks
A1 hidden linearization order: two histories have identical current admission result and linkage but differ in whether a relevant revocation/policy change is ordered before or after the atomic point. If the order is not represented by HistorySupport/Invalidation, future reconstruction differs. Therefore those relations must encode the required order, not merely a validity bit.

A2 hidden prohibited interleaving: two histories both appear atomic but only one actually excludes a relevant interleaving. A generic `Mode=ATOMIC` label is insufficient.

A3 future authority transition: identical current authority and admission contracts, but one history retains an authority transition path that the other does not. If this can alter P_AA, future transition availability belongs to the protocol action semantics, not current observation.

Result: no refutation if HistorySupport explicitly includes the claim-relevant linearization/order facts and Next_ATOMIC is derived from them. A generic boolean atomic-valid field is refuted as insufficient.

## 4. LEASE attacks
L1 hidden expiry: same current valid bridge, different expiry successor. If expiry is not represented, future observations differ. Therefore validity interval/expiry semantics must be recoverable from PB/HistorySupport.

L2 hidden renewal: same current bridge, different renewal authority/conditions. A future renewal can diverge. Renewal rights are therefore part of lease transition semantics.

L3 hidden invalidation composition: same current lease, but policy/delegation/incarnation changes have different effects in two histories. Invalidation must be relational and tied to the actual bridge, not a generic invalid bit.

L4 replay/consumption: same current bridge and admission result, but one has consumed the bridge and the other has not. A later retry can differ. Replay/consumption semantics must be reconstructible.

L5 bridge linkage: two histories contain a valid bridge with identical fields but only one is actually linked to the admission. If AdmissionLink is omitted or inferred from validity, the abstraction admits an unrelated-witness error.

Result: generic current-validity is refuted. A sufficiently expressive LeaseBridge + linkage + invalidation/order semantics can absorb these distinctions; separate runtime variables are not yet required.

## 5. RECHECK attacks
R1 hidden fact-set: both rechecks are currently TRUE, but one checked policy/delegation/incarnation and the other did not. Future mutation can distinguish them. Therefore Reval must identify the exact claim-required fact set.

R2 hidden order: a required mutation occurs between recheck and admission in one history but not the other. If order is not represented, future assessment differs.

R3 stale result reuse: two admissions have the same current result, but one uses an old recheck result and the other uses a result linked to the current attempt. AdmissionLink must identify the actual recheck evidence.

Result: a boolean `recheckValid` is insufficient. Exact fact-set, order, and actual-use linkage are required or must conservatively produce UNKNOWN.

## 6. Joint protocol collisions
J1 ATOMIC vs LEASE: both currently justified, but one has future expiry while the other has a linearization guarantee. Current observation equality does not imply future equivalence.

J2 LEASE vs RECHECK: both currently justified, but lease renewal and recheck-after-mutation create different successor spaces.

J3 ATOMIC vs RECHECK: both may justify the same admission now while differing on what happens after an intervening mutation. A current TRUE_JUSTIFIED observation cannot be the quotient criterion.

## 7. Six-contract sufficiency test
The six-contract projection is sufficient only if, for fixed claim/boundary/threat/environment contract, equal projections imply equivalent allowed future observations or an explicitly unresolved UNKNOWN result.

Candidate condition:
`SixEq(H1,H2) => FutureObs_PAA(H1)=FutureObs_PAA(H2)`
for exact quotient. For one-way safety refinement, the obligation is weaker and must be stated directionally.

## 8. HistorySupport reduction test
HistorySupport can be reduced to explicit relations only if a reconstruction function exists:
`ReconstructSupport(PB, AdmissionBindingClass, OrderFacts, InvalidationFacts, AuxHistory)`
that is total, deterministic modulo P_AA equivalence, linkage-preserving, transition-preserving, future-observation-preserving, non-amplifying, and boundary-preserving.

If complete support is reconstructible from LeaseBridge + AdmissionBindingClass + explicit order/invalidation/linkage relations, HistorySupport need not remain a permanent semantic variable.

## 9. New distinction
`HistorySupport` is best treated as a **support obligation**, not automatically as state. The concrete implementation may retain history, while the abstract specification only requires the claim-relative support needed by the refinement mapping.

## 10. Current result
No six-contract collision has yet refuted a sufficiently rich relational formulation. However, several weaker formulations are refuted:
- atomic-validity boolean;
- lease-current-valid boolean;
- recheck-valid boolean;
- current TRUE/FALSE observation as quotient;
- actual linkage inferred from existence of a valid witness;
- invalidation represented only as a current boolean.

Therefore AB46's generic shape survives, but only as a relational semantic contract. Minimality is still unproven.

## 11. AB48 frontier
1. Define explicit relational schemas for Pre/Post/Frame/Invalidation/HistorySupport/AdmissionLink.
2. Construct a bounded collision matrix using the same six-contract projection.
3. Search for a genuine collision that survives all six relations.
4. Attack whether OrderFacts + InvalidationFacts + AdmissionLink completely reconstruct HistorySupport.
5. Derive the smallest protocol-specific semantic algebra before another TLA+ draft.

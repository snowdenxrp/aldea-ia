# NEXO AB36Z — RESIDUAL QUOTIENT MINIMALITY AND RECONSTRUCTION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Re-read baseline
AB36Y was reread directly before this round. Its central proposal was to replace a raw ResidualProtocolHistory with a claim-relative relational quotient RProto and test whether RProto can be absorbed into LeaseBridge + AdmissionBindingClass.

## 2. External cross-check
Lamport's Auxiliary Variables material states that implementation in TLA+ is expressed as implication under a refinement mapping and that auxiliary variables can make a refinement mapping definable when it cannot be expressed from ordinary implementation variables. It distinguishes history variables, prophecy variables, and stuttering variables. This supports retaining protocol history only as needed for the mapping rather than automatically promoting it to physical state. citeturn0search1

## 3. Exact residual decomposition
Use five semantic obligations rather than five mandatory variables:
R1 AdmissionLink
R2 ProtocolValidity
R3 Order/Linearization
R4 Invalidation/Continuation
R5 FutureSupport
These are obligations. A representation may pack several obligations into one structure.

## 4. R1 — AdmissionLink
AdmissionLink is not removable for P_AA. The actual used authority and actual bridge must be recoverable for the actual admission. A generic valid witness is insufficient.
Counterexample: two valid bridges exist, but the admission record is linked to B1 while the abstraction chooses B2. Any representation that cannot recover the actual link must return UNKNOWN rather than TRUE_JUSTIFIED.

## 5. R2 — ProtocolValidity
ProtocolValidity can be derived from Bridge/Binding only if the retained data uniquely determines the protocol semantics at admission. A generic `valid=true` field is insufficient because ATOMIC, LEASE, and RECHECK can have different obligations despite equal current validity.

## 6. R3 — Order/Linearization
R3 is potentially packable into:
- an atomic linearization relation;
- lease validity interval/order;
- recheck-to-admission order;
- invalidation relations already attached to bridge/binding.
It cannot be discarded if two histories with identical retained fields have different legal interleavings or different admission results.

## 7. R4 — Invalidation/Continuation
A current validity bit does not encode future invalidation capability. For example, an expirable lease and an atomic authorization can both be currently valid but have different future transition spaces. R4 therefore contains semantic transition availability, not merely current state.

## 8. R5 — FutureSupport
FutureSupport is not a stored list of futures. It is the requirement that the retained representation determine, or conservatively approximate with UNKNOWN, the P_AA-relevant future continuation space. If two representatives admit different claim-relevant successors, they cannot be identified by the quotient.

## 9. Absorption tests
For each obligation Ri, define Absorb_i(X) iff there exists a total function F_i from retained representation X to Ri such that F_i is:
(a) linkage-preserving;
(b) protocol-validity preserving;
(c) transition-preserving;
(d) future-observation preserving;
(e) non-amplifying;
(f) boundary preserving.
Failure of any condition blocks absorption.

## 10. Minimal collision traces
C1: DECIDE → REVOKE → ADMIT versus atomic DECIDE+ADMIT. Separates R3.
C2: LEASE_ISSUE(B1) → ADMIT(B2) versus ADMIT(B1). Separates R1.
C3: LEASE_VALID → EXPIRE → ADMIT versus ADMIT → EXPIRE. Separates R4/R3.
C4: POLICY_CHANGE → RECHECK(partial) → ADMIT versus full recheck. Separates R2.
C5: AUTH_CHANGE → RENEW → ADMIT versus RENEW → AUTH_CHANGE → ADMIT when renewal revalidates authority. Separates R4/R3.
C6: CONSUME(B) → RETRY(A) versus RETRY(A) before consumption when replay matters. Separates R4.
C7: REINCARNATE(R) → ADMIT(old bridge) versus ADMIT(old bridge) → REINCARNATE(R). Separates R2/R3 and incarnation semantics.
C8: same current assessment, different future expiry/renewal/recheck availability. Separates R5.

## 11. Important result: obligations are not independent variables
The attacks show that R1-R5 overlap semantically. For example, lease expiry is both an invalidation fact and a future continuation constraint. Therefore treating each as an independent state variable would overcount the semantic lower bound.

## 12. Stronger quotient
Define H1 ≈AA-res H2 iff, under the same claim/boundary/assumption contract:
1. actual admission linkage is equivalent;
2. protocol validity is equivalent;
3. all P_AA-relevant order/linearization relations are equivalent;
4. invalidation and continuation behavior is equivalent;
5. every allowed continuation has an equivalent P_AA observation, or both become UNKNOWN under the same unresolved condition;
6. refinement/no-amplification obligations are equivalent.

## 13. Consequence
If H1 ≈AA-res H2, they may be represented by one quotient class even when their raw event histories differ. Conversely, equality of all current visible fields is insufficient for quotient membership.

## 14. Preliminary minimality result
The current research supports a distinction between:
- semantic lower bound: the five obligations above;
- representational lower bound: not yet known;
- physical-state lower bound: not established.
This prevents the common mistake of turning every semantic dependency into a separate TLA+ variable.

## 15. Strongest current reduced-product candidate
SEM_AA* = AuthorityContext + ResourceIncarnation + PolicyContext + DelegationContext + LeaseBridge + AdmissionBindingClass + residual quotient support,
where residual quotient support is permitted to be empty for a protocol/history fragment only when the five obligations are reconstructible from the retained product.

## 16. What is actually established
Established by adversarial countermodels:
- actual linkage cannot be replaced by arbitrary valid witnesses;
- protocol semantics cannot be replaced by a generic validity bit;
- historical/order semantics cannot be inferred from current state alone;
- future transition differences matter to quotient equivalence;
- semantic obligations can be packed, so a fixed count of state variables is not a valid minimality claim.

Not established:
- universal minimality;
- existence of a total reconstruction function from R1;
- exact quotient theorem;
- transition-system equivalence;
- TLA+ model correctness.

## 17. AB37 frontier
1. Define a formal claim-relative quotient relation with explicit observation function.
2. Define the concrete-to-abstract map from EventDAG to the quotient class.
3. Test whether Bridge + Binding are jointly complete for each residual obligation.
4. Attack quotient transitivity/congruence under protocol-changing transitions.
5. Derive the first stable semantic state, not merely a list of fields.
6. Then construct the next TLA+ draft from that stable semantic state.

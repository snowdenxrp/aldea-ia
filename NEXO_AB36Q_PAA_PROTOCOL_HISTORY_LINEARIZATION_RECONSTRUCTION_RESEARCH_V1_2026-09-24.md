# NEXO AB36Q — PROTOCOL HISTORY, LINEARIZATION AND RECONSTRUCTION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Cross-check
Lamport's official auxiliary-variable work distinguishes history variables, which record past behavior, from stuttering variables and explains that auxiliary variables may be required to construct refinement mappings. This supports modeling protocol history separately from the implementation's physical state, but does not prove the Nexo reconstruction obligations. citeturn0search1

## 2. Objective
Determine whether ProtocolClass (ATOMIC, LEASE, RECHECK) can be reconstructed from LeaseBridge + AdmissionBindingClass + claim-relevant history without loss of P_AA behavior.

## 3. Complete protocol-history requirement
A protocol history must preserve, when claim-relevant: admission identity, used authority, used bridge, decision/admission relation, protocol class or reconstructible protocol semantics, issuance/recheck events, invalidation events, lease expiry/renewal/consumption, retry/attempt binding, resource incarnation, policy/delegation/epoch context, and relevant ordering/linearization.

## 4. ATOMIC history
Candidate trace:
AUTH_VALID -> DECIDE+ADMIT_ATOMIC.
The model must guarantee no P_AA-relevant transition can occur between the semantic decision/admission point. A two-action implementation sequence is not sufficient unless the refinement contract establishes atomic linearization.

## 5. LEASE history
Candidate trace:
AUTH_VALID -> LEASE_ISSUE -> [policy/delegation/epoch/incarnation changes] -> LEASE_RENEW/USE -> ADMIT.
The lease remains valid only if all semantic invalidation and replay rules permit it. Freshness/expiry cannot substitute for authority compatibility.

## 6. RECHECK history
Candidate trace:
ATTEMPT -> RECHECK_AUTHORITY/POLICY/DELEGATION/INCARNATION/SCOPE -> ADMIT.
The recheck must be bound to the actual admission and must identify which facts were re-established. A generic recheck flag is not sufficient.

## 7. CM-AA437 — atomic pseudo-sequence
DECIDE; hidden REVOCATION; ADMIT. If the representation labels DECIDE+ADMIT as ATOMIC but permits the hidden revocation, it is semantically unsound. Atomicity must be a protocol constraint, not a label.

## 8. CM-AA438 — lease expiry race
LEASE_ISSUE; LEASE_EXPIRE; ADMIT versus LEASE_ISSUE; ADMIT; LEASE_EXPIRE. Same final state, different admission validity. Linearization/order must be retained or reconstructible.

## 9. CM-AA439 — lease renewal after revocation
LEASE_ISSUE; REVOKE; LEASE_RENEW; ADMIT. If renewal does not revalidate the authorization context, a fresh bridge can carry stale authority.

## 10. CM-AA440 — recheck omission
RECHECK records subject/resource but omits policy/delegation/incarnation. A future or current change can distinguish valid and invalid histories.

## 11. CM-AA441 — recheck witness substitution
Admission is historically bound to Auth A, but recheck finds currently valid Auth B. Without an explicit UsedAuth relation, the model can incorrectly certify the admission.

## 12. CM-AA442 — retry protocol split
Attempt A uses a lease; retry Attempt B is rechecked atomically. If operation-level identity is used instead of attempt-level identity, the representations can falsely appear equivalent.

## 13. CM-AA443 — protocol convergence after current state
ATOMIC and LEASE can reach identical current fields and identical current assessment while their future responses to renewal, expiry, or revocation differ. Current-state equivalence therefore does not establish protocol equivalence.

## 14. CM-AA444 — hidden protocol history
Two states have identical LeaseBridge and AdmissionBindingClass. One has a prior lease consumption event; the other does not. If retry semantics depend on consumption, ProtocolClass/History remains behaviorally relevant.

## 15. CM-AA445 — incarnation transition
LEASE bound to incarnation i0; resource reincarnates to i1; admission follows. A representation preserving only resource_id cannot distinguish the valid and invalid histories.

## 16. CM-AA446 — policy/delegation joint invalidation
A lease remains syntactically fresh while policy and delegation jointly make its authorization invalid. Pairwise field validity does not establish protocol validity.

## 17. Reconstruction criterion
Define ReconstructProtocol_AA(K,H) = protocol semantics if exactly one P_AA-relevant protocol interpretation remains; otherwise UNKNOWN.
ProtocolClass can be removed from top-level abstract state only if reconstruction is:
1. total on all allowed concrete histories;
2. deterministic modulo P_AA-equivalence;
3. transition-preserving;
4. future-observation-preserving;
5. no-authority-amplifying;
6. boundary-preserving.

## 18. Lower-bound result
ProtocolClass is not yet proven physically necessary, but protocol semantics are semantically necessary. The lower bound is therefore on protocol behavior, not necessarily on a variable named ProtocolClass.

## 19. Candidate factorization
K_AA = AuthorityContext + ResourceIncarnation + PolicyContext + DelegationContext + LeaseBridge + AdmissionBindingClass + ProtocolHistorySupport.
A separate ProtocolClass variable is optional only if ProtocolHistorySupport reconstructs the protocol semantics exactly/conservatively.

## 20. Linearization conclusion
`INTEGER_TIMESTAMP` is not required. What is required is enough ordering/linearization information to distinguish all P_AA-relevant protocol histories. A partial order or explicit linearization point may be sufficient.

## 21. Refinement implication
R_AA must preserve the protocol observation relevant to admission. A concrete step may stutter only when protocol semantics, linkage, history support, and future P_AA observations remain unchanged. Lamport's framework supports this conceptual use of auxiliary/history variables; actual R_AA remains a candidate. citeturn0search1

## 22. Result
No countermodel yet proves that a dedicated ProtocolClass variable is irreducible. Multiple countermodels do prove that protocol semantics cannot simply disappear. The correct target is therefore reconstruction, not premature state-variable retention.

## 23. AB36R frontier
1. Define protocol-specific CH_P for complete traces.
2. Define linearization-point semantics for ATOMIC.
3. Define lease validity interval and renewal semantics.
4. Define exact recheck witness semantics.
5. Test whether all three can be reconstructed from common kernel + history.
6. Attack ProtocolHistorySupport compression and derive its semantic lower bound.
7. Then return to reduced-product/minimal-state analysis and TLA+.

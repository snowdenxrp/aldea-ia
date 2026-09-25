# NEXO AB36P — ATOMIC / LEASE / RECHECK PROTOCOL EQUIVALENCE RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. External cross-check
Lamport's official material states that refinement mappings relate lower-level representations to higher-level specifications and that history variables can record past behavior needed by a refinement mapping. This supports keeping protocol-specific historical support explicit until equivalence is demonstrated; it does not prove Nexo's protocol unification. citeturn0search12turn0search2

## 2. Protocol-independent claim target
P_AA remains authorization-to-admission safety at the Z1→Z3 boundary. ATOMIC, LEASE, and RECHECK are candidate concrete protocol classes that may refine the same semantic predicate:
AuthAtAdmission(e,t) := actual linked authority is valid at admission, binding is complete, policy/delegation/incarnation/boundary constraints hold, and the protocol establishes the required admission-time authorization semantics.

## 3. ATOMIC
Candidate semantics: decision and admission authorization are one semantic linearization point. There is no authorization-to-admission interval that can be invalidated between two distinct protocol points.
Necessary assumptions must make atomicity explicit; merely labeling an action ATOMIC is insufficient.

## 4. LEASE
Candidate semantics: authorization is carried from issuance/decision to admission through a bridge whose validity is interval-based and bound to subject, operation, attempt, resource/incarnation, authority context, policy/delegation context, boundary, freshness/expiry, replay/consumption and protocol rules.
A lease is not authority itself and is not external effect.

## 5. RECHECK
Candidate semantics: required authorization facts are re-established at admission. The recheck must identify the exact authority context and fields actually re-established. A boolean `recheck=true` is insufficient.

## 6. False equivalence CM-AA421
ATOMIC and LEASE both expose `authorized_at_admission=true`, but the LEASE history omits expiry. A future or current expiry event can distinguish them. Therefore visible outcome equality is insufficient.

## 7. False equivalence CM-AA422
RECHECK and ATOMIC both show valid authority, but RECHECK omits which epoch and policy were rechecked. The representations are not claim-complete.

## 8. False equivalence CM-AA423
LEASE bridge and AdmissionBindingClass are identical in current fields, but lease replay/consumption history differs. Future retry behavior diverges. They cannot be merged without a future-behavior proof.

## 9. False equivalence CM-AA424
A LEASE is renewed after authority revocation. If renewal semantics do not explicitly revalidate the authority context, the bridge can appear fresh while no longer carrying valid authorization.

## 10. False equivalence CM-AA425
A RECHECK occurs after resource reincarnation but the recheck identifies only resource_id, not incarnation. It can falsely validate a stale resource context.

## 11. False equivalence CM-AA426
An ATOMIC protocol is modeled as a sequence of DECIDE then ADMIT with no intervening transitions. This is not automatically equivalent to true atomic semantics unless the model proves no relevant environment step can occur between the points.

## 12. False equivalence CM-AA427
A LEASE expiry and an admission are concurrent. Different legal linearizations produce different P_AA results. The model must specify the ordering/linearization rule rather than relying on timestamps alone.

## 13. False equivalence CM-AA428
RECHECK verifies current authority but not historical linkage to the operation/attempt. A different authority can satisfy the recheck while the actual admission remains bound to an invalid earlier context. `current valid witness != actual used context`.

## 14. Protocol equivalence candidate
Two protocol representations K1,K2 may be equivalent for P_AA only if:
1. their complete-history concretizations are equivalent under P_AA;
2. actual admission linkage is equivalent;
3. every allowed future continuation preserves equivalent P_AA observations;
4. invalidation, replay and incarnation semantics are preserved;
5. boundary and assumptions match;
6. no authority amplification occurs.

## 15. ProtocolClass as semantic dimension
ProtocolClass is not yet proven irreducible. It can be removed as an explicit top-level variable only if a reconstruction function from remaining representation plus auxiliary history recovers all P_AA-relevant protocol semantics and satisfies transition/future-equivalence obligations.

## 16. Candidate reconstruction
ReconstructProtocol_AA(K,H) -> ProtocolSemantics or UNKNOWN.
If ATOMIC/LEASE/RECHECK behavior can be reconstructed uniquely for P_AA, ProtocolClass may be representational. If two protocol interpretations remain possible and produce different future P_AA observations, assessment must become UNKNOWN.

## 17. Cross-protocol composition
A closure combining facts from different protocol classes requires joint realizability under one concrete history. It must not splice an ATOMIC authority witness with a LEASE bridge from another history.

## 18. Refinement obligation
For each concrete protocol step, R_AA must map it to an abstract semantic step or legitimate stutter while preserving actual linkage, protocol validity, invalidation, order, boundary, and assessment.
Lamport's refinement-mapping framework supports this direction conceptually; the actual Nexo mapping remains unproved. citeturn0search12turn0search5

## 19. New countermodels CM-AA429–436
429 lease renewal without authority revalidation;
430 atomic pseudo-sequence with hidden interleaving;
431 lease expiry/admission race;
432 recheck with incomplete authority fields;
433 recheck with stale incarnation;
434 protocol witness splicing;
435 same current assessment but different retry semantics;
436 protocol class erased while future behavior differs.

## 20. Result
The three protocol classes can share one semantic P_AA kernel, but their concrete refinement obligations differ. ProtocolClass can only be erased after a demonstrated reconstruction/future-equivalence result. Until then it remains a semantic dimension in the lower bound, even if it need not become a physical implementation variable.

## 21. AB36Q frontier
1. Define complete protocol histories for ATOMIC/LEASE/RECHECK.
2. Define protocol-specific ConsistentHistories and Observation_AA.
3. Attack linearization, expiry, retry and invalidation races exhaustively.
4. Determine whether ProtocolClass is recoverable from LeaseBridge + AdmissionBindingClass + history.
5. If recoverable, derive the exact reconstruction theorem obligations.
6. Only then revisit reduced-product minimality and TLA+.

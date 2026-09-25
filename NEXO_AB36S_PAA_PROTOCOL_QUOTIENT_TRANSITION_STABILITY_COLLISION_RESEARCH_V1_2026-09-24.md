# NEXO AB36S — PROTOCOL QUOTIENT, TRANSITION STABILITY AND COLLISION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Objective
Attack the candidate protocol behavioral quotient H1 ≈prot H2. Determine whether histories that look equivalent under current P_AA semantics can diverge under allowed future transitions.

## 2. Quotient candidate
H1 ≈prot H2 iff, under the same claim/boundary/assumption contract:
1. actual admission linkage is equivalent;
2. authorization semantics are equivalent;
3. protocol validity at admission is equivalent;
4. relevant expiry/renewal/replay/invalidation semantics are equivalent;
5. every allowed future continuation yields equivalent P_AA observations;
6. unresolved correspondence conservatively yields UNKNOWN.

## 3. Transition stability
A quotient is stable only if equivalent histories have corresponding successor histories that remain equivalent after every P_AA-relevant concrete transition, or both conservatively become UNKNOWN. Current-state equality alone is insufficient.

## 4. Collision CM-AA456 — revoke
Two histories have the same current valid authority and admission fields, but one retains a prior revocation event that affects a lease/bridge and the other does not. A future retry distinguishes them. Historical revocation support is necessary when retry semantics depend on it.

## 5. Collision CM-AA457 — renew
Two histories have identical current lease fields. One lease was renewed after an authority change, the other before. A future admission or renewal check can distinguish them. Renewal provenance/order is necessary unless encoded in the bridge semantics.

## 6. Collision CM-AA458 — retry
Two histories have identical operation-level fields but different attempt history. A retry may inherit authorization in one protocol and require a fresh authorization in the other. Attempt binding is therefore necessary where retry semantics are attempt-scoped.

## 7. Collision CM-AA459 — policy change
Two histories have the same current policy and lease validity. One previously crossed an incompatible policy interval; the other did not. If policy validity is admission-time only, this may be irrelevant; if protocol semantics retain historical invalidation, it is relevant. The claim contract must specify which semantics apply.

## 8. Collision CM-AA460 — delegation change
Two histories converge to the same current delegation chain, but one lease was issued under a delegation that was later revoked and restored. If restoration does not erase historical invalidation for the protocol, future behavior can differ. Compensation does not automatically restore history.

## 9. Collision CM-AA461 — incarnation
Two histories have same resource_id and current incarnation label but different incarnation lineage. If bridge binding or replay semantics depend on generation lineage, the quotient is unsound without lineage or equivalent summary.

## 10. Collision CM-AA462 — recheck
Two histories both expose `recheck=true`; one re-established policy/delegation/incarnation and the other checked only authority. Future policy or resource transitions split their P_AA behavior. Recheck semantics must be reconstructible, not Boolean.

## 11. Collision CM-AA463 — atomicity
Two histories both expose DECIDE+ADMIT. One has a genuine atomic linearization; the other is a two-step sequence that permits hidden interleaving. A future or intervening revocation distinguishes them. Atomicity must be represented semantically.

## 12. Collision CM-AA464 — bridge identity
Two histories have structurally identical bridge fields but different bridge identity/consumption state. If replay protection is identity-sensitive, a retry distinguishes them. Bridge IDs can be omitted only if equivalent consumption semantics are preserved.

## 13. Collision CM-AA465 — future-only split
Two histories produce the same current P_AA assessment and same visible semantic state. A future policy/delegation change causes different observations. Therefore current observational equivalence is weaker than behavioral equivalence.

## 14. Collision CM-AA466 — UNKNOWN escape
Two histories are collapsed while a missing distinction is currently irrelevant. Later information reveals that the distinction mattered. A sound abstraction must either retain the support needed for future reconstruction or have exposed UNKNOWN before decisive use.

## 15. Necessary condition for quotienting
A distinction d may be quotiented only if deleting d preserves the entire P_AA future observation tree, not merely the current observation.
Candidate:
FutureObs_P(h) = all P_AA observations over all allowed future continuations from h.
Then h1 ≈prot h2 requires equivalent FutureObs_P plus linkage/refinement obligations.

## 16. Prefix versus complete-history issue
If CH_P is defined over complete histories, future behavior is represented directly. If CH_P is prefix-based, FutureObs_P must be included separately. Mixing the two definitions can create false equivalences.

## 17. ProtocolHistorySupport lower bound
After attacks, surviving semantic dimensions are:
- actual admission linkage;
- authorization context/currentness at the relevant point;
- protocol linearization/validity semantics;
- invalidation order where relevant;
- lease expiry/renewal/replay semantics where relevant;
- attempt identity/binding where retries matter;
- resource incarnation/generation;
- policy/delegation semantics;
- boundary;
- enough retained support for all future P_AA observations.

## 18. ProtocolClass result
No collision proves that a literal ProtocolClass variable is necessary. Several collisions prove that its semantic behavior must be represented somewhere. Therefore the target remains semantic reconstruction/quotienting rather than physical retention of a protocol label.

## 19. Cross-protocol quotient attack
An ATOMIC history and a LEASE history may share current admission semantics, but if a future `LEASE_EXPIRE` or `LEASE_RENEW` event is legal only for the lease history, the two histories have different future transition spaces. Thus quotienting must compare both observations and allowed future transitions.

## 20. UNKNOWN policy
If two histories cannot be distinguished with retained support but may differ in future P_AA behavior, the abstraction must not assert equivalence. It should retain the distinction or expose UNKNOWN when the distinction becomes claim-decisive.

## 21. Result
The protocol quotient is a behavioral quotient over future observation/transition structure, not a current-state equality relation. This materially strengthens the lower bound and prevents premature protocol compression.

## 22. AB36T frontier
1. Formalize FutureObs_P and allowed continuation space.
2. Define transition-space equivalence across ATOMIC/LEASE/RECHECK.
3. Attack quotient composition with closure concretization.
4. Determine minimal sufficient protocol-history summary.
5. Derive conditions under which ProtocolClass can be reconstructed and removed.
6. Then revisit reduced-product minimality and TLA+ abstraction.

# NEXO AB38 — PAA QRES ABSTRACTION FUNCTION AND TRANSITION SEPARATORS RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Baseline
AB37 was reread directly before this round. The stable candidate is `AAKernel = AuthorityContext + ResourceIncarnation + PolicyContext + DelegationContext + LeaseBridge + AdmissionBindingClass + Qres`, where Qres is residual claim-relative congruence support rather than a raw history log.

## 2. Objective
Construct an explicit abstraction function from the concrete EventDAG/history into Qres, then attack whether Qres can be absorbed by LeaseBridge + AdmissionBindingClass without changing P_AA behavior.

## 3. Concrete semantic input
For an admission `a`, define its relevant concrete support closure:
`Close_AA(a,H) = AdmissionRecord(a) + UsedAuth(a) + UsedBridge(a) + all authority/policy/delegation/incarnation/protocol events and relations that can affect P_AA(a) or any allowed future continuation of a`.
This is claim-relative and may be a partial order; total timestamps are not required.

## 4. Candidate abstraction function
`Qres_AA(H,a) = QuotientClass( Normalize( Close_AA(a,H) ) )`.
Normalization retains semantic relations rather than raw records:
- actual admission linkage;
- protocol validity semantics;
- order/linearization facts not recoverable from retained Bridge/Binding;
- invalidation/continuation semantics not recoverable elsewhere;
- future-observation support.
Raw event IDs, timestamps, and physically distinct representations may disappear if they are P_AA-equivalent.

## 5. Absorption test
Define `Absorb_Q(H,a)` iff there exists `F_Q(LeaseBridge, AdmissionBindingClass)` that reconstructs Qres for every modeled history in the contract.
Required properties:
1. totality;
2. deterministic modulo quotient equivalence;
3. actual-linkage preservation;
4. protocol-validity preservation;
5. transition congruence;
6. future-observation preservation;
7. no-authority amplification;
8. boundary preservation.
If any property fails, Qres cannot be eliminated by that representation; unresolved cases must not become TRUE_JUSTIFIED.

## 6. Minimal separator family
S1 ATOMIC: genuine atomic linearization vs DECIDE→REVOKE→ADMIT hidden interleaving.
S2 LEASE: issued bridge B1 actually used vs another valid bridge B2.
S3 LEASE: EXPIRE before ADMIT vs ADMIT before EXPIRE.
S4 LEASE: RENEW before authority change vs authority change before RENEW.
S5 LEASE: CONSUME before RETRY vs RETRY before CONSUME.
S6 RECHECK: complete required fact-set vs partial fact-set.
S7 RETRY: same operation with attempt A vs attempt B under attempt-scoped authorization.
S8 INCARNATION: old bridge used after reincarnation vs admission before reincarnation.
S9 JOINT: policy+delegation changes jointly before admission versus alternative ordering.
S10 FUTURE: same current observation but different legal future protocol transitions.

## 7. Separator interpretation
A separator means the proposed compression is unsound under the modeled contract if both histories map to the same retained representation but produce different P_AA observations or refinement obligations.
No separator at bounded depth does not prove equivalence; it establishes only bounded non-distinguishability.

## 8. Can Qres be empty?
For a restricted protocol fragment, yes in principle. Qres can be empty if every required protocol/order/invalidation/future distinction is already encoded in LeaseBridge + AdmissionBindingClass and those structures satisfy the full reconstruction contract.
For the general mixed ATOMIC/LEASE/RECHECK model, this has not been demonstrated.

## 9. Important packing result
LeaseBridge is the natural carrier for protocol transport semantics: issuance, validity interval, expiry, renewal, replay/consumption, and invalidation binding where those are bridge-scoped.
AdmissionBindingClass is the natural carrier for the actual relational tuple: subject, operation, attempt, resource, incarnation, authority reference, capability/scope and boundary where applicable.
Neither carrier automatically contains atomic linearization or exact recheck fact-set semantics. Those remain residual candidates unless reconstructed by explicit relations.

## 10. EventDAG-to-Qres mapping
The EventDAG should not be minimized by deleting nodes greedily. Instead:
1. compute claim-relative support closure;
2. derive semantic relations;
3. quotient histories with identical P_AA behavior;
4. retain only a representative sufficient for reconstruction;
5. expose UNKNOWN when the quotient cannot distinguish a decisive pair.
This avoids confusing physical log minimization with semantic minimization.

## 11. Transition separator matrix
Dimension | Shortest candidate separator | Absorbable condition
Atomic linearization | REVOKE between decision/admission | only if atomicity is encoded/proven elsewhere
Bridge issuance linkage | B1 issued, B2 used | only if binding/bridge jointly identify actual bridge
Expiry | EXPIRE↔ADMIT inversion | only if validity interval fully encoded
Renewal | AUTH_CHANGE↔RENEW inversion | only if renewal semantics fully encoded
Replay | CONSUME↔RETRY inversion | only if replay state fully encoded
Recheck facts | partial vs complete recheck | only if exact fact-set is encoded
Attempt | A↔B retry substitution | only if attempt scope is irrelevant by contract
Incarnation | reincarnation↔admission inversion | only if incarnation binding is encoded
Joint invalidation | policy+delegation combination | only if joint relation is encoded
Future protocol | same current state, different legal successor | only if continuation space is encoded

## 12. Qres as a relation, not a field bag
A future implementation should not be forced to store `qres.atomic`, `qres.expiry`, `qres.retry`, etc. The semantic object can instead be a relation over stable identities and event/binding nodes. Physical layout is deferred until the semantic quotient stabilizes.

## 13. Candidate stable abstract Next
For abstract state `A`, a concrete step `c -> c'` must satisfy one of:
- corresponding abstract transition `A -> A'` with refinement relation preserved;
- legitimate abstract stutter where all Qres obligations and future behavior remain unchanged;
- conservative UNKNOWN/PENDING if the abstraction loses a decisive distinction.
A concrete transition that changes Qres while leaving visible fields unchanged is not a valid stutter.

## 14. Joint congruence attack
Individually absorbable dimensions may become non-absorbable jointly. Example: Bridge contains renewal validity and Binding contains delegation validity, but a joint policy+delegation transition changes whether renewal is legal. Therefore absorption must be tested on the product, not one dimension at a time.

## 15. Current result
Qres has been reduced from a generic history bucket to a precise semantic target: the quotient support required for actual linkage, protocol validity, unrecoverable order/invalidation, and future P_AA congruence.
The strongest candidate is still:
`AAKernel = AuthorityContext + ResourceIncarnation + PolicyContext + DelegationContext + LeaseBridge + AdmissionBindingClass + Qres`.
Qres may be empty only after the full absorption contract is satisfied.

## 16. What remains unproven
- exact quotient construction;
- totality of `F_Q`;
- joint Bridge+Binding completeness;
- universal congruence;
- minimality;
- refinement correctness;
- any TLC/TLAPS result.

## 17. AB39 frontier
1. Define the observation-preserving quotient formally over complete histories/prefixes.
2. Derive an explicit `F_Q` candidate from Bridge+Binding.
3. Attack joint completeness with 3-event traces.
4. Determine whether Qres collapses to a small relation or remains irreducible.
5. Freeze the semantic kernel only after this attack.
6. Then draft the next TLA+ module with the stable state/action vocabulary.

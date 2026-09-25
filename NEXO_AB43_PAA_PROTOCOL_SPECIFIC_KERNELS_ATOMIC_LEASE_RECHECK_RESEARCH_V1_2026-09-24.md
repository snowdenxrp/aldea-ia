# NEXO AB43 — PAA PROTOCOL-SPECIFIC KERNELS: ATOMIC, LEASE, RECHECK RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Baseline
AB42 was reread directly before this round. The goal is to separate the protocol-independent semantic kernel from protocol-specific realization semantics.

## 2. Protocol-independent claim
The claim remains admission safety at the Z1→Z3 boundary. The protocol mechanism must not change the meaning of the claim. Candidate semantic form:
`P_AA := every admitted attempt is linked to an authorization context that is valid for that admission, completely bound to the admission, compatible with policy/delegation/incarnation/boundary, and admitted through a valid protocol bridge.`
No inference about Z4 external success is included.

## 3. Common kernel candidate
All three protocols require, at minimum at the semantic level:
`K_common = <ActualAdmissionLink, AuthorityValidityAtAdmission, CompleteBinding, PolicyCompatibility, DelegationValidity, IncarnationCompatibility, BoundaryPermission>`.
These are not necessarily independent stored variables.

## 4. ATOMIC-specific obligations
ATOMIC requires a genuine semantic linearization point or an equivalent guarantee that no P_AA-relevant invalidating transition can interleave between authorization establishment and admission.
Necessary relation: `AtomicPoint(admission)` or an equivalent non-interleaving proof obligation.
A Boolean `atomic=true` is insufficient unless its meaning is tied to the transition semantics.

## 5. LEASE-specific obligations
LEASE requires a bridge carrying authorization across an interval. Relevant semantics include issuance/admission linkage, validity interval, expiry, renewal if permitted, replay/consumption, invalidation by authority/policy/delegation/incarnation changes, and boundary/scope. A lease is not authority and is not external effect.

## 6. RECHECK-specific obligations
RECHECK requires that the actual admission re-establish the claim-required facts at the admission point. The semantic requirement is the exact fact-set needed by P_AA, not an arbitrary `rechecked` flag. Candidate: `RecheckFactSet(admission)` + `RecheckPoint < Admission`. If the required facts cannot be reconstructed, assessment must not become TRUE_JUSTIFIED.

## 7. Pairwise protocol comparison
ATOMIC vs LEASE: both can yield the same current admission observation, but LEASE may have expiry/renewal successors while ATOMIC may have no persistent bridge interval. Current observation equality does not imply protocol equivalence.

ATOMIC vs RECHECK: ATOMIC may avoid an intermediate state by linearization; RECHECK permits a sequence but must establish the exact required facts at admission. The same current result can arise through different transition structures.

LEASE vs RECHECK: LEASE transports authorization through time; RECHECK re-establishes facts at admission; their future transitions and invalidation mechanisms differ.

## 8. Shared quotient criterion
A protocol-specific representation `R_p` may be collapsed into a common representation only if protocol histories with equal common representation have corresponding P_AA-relevant continuations and observations under the same contract. Protocol labels may disappear if their semantics are reconstructible. Protocol semantics may not disappear merely because current observation is equal.

## 9. Candidate protocol extensions
`K_ATOMIC = K_common + AtomicLinearization`
`K_LEASE = K_common + LeaseBridgeSemantics`
`K_RECHECK = K_common + RecheckFactSetAndOrder`
These are semantic candidates, not frozen state schemas.

## 10. Cross-protocol collision attacks
A1: ATOMIC and LEASE both admit now; lease can expire later.
A2: ATOMIC and RECHECK both admit now; recheck can have a future fact-set distinction.
A3: LEASE and RECHECK both admit now; lease expiry differs from future recheck.
A4: all three produce TRUE_JUSTIFIED now but have different successor spaces.
A5: protocol labels equalized but protocol semantics differ.
A6: protocol semantics equalized but actual UsedBridge linkage differs.
A7: protocol semantics and linkage equalized but boundary successor differs under dynamic boundary.

## 11. What can be common
The following can be protocol-independent if defined at the claim level: actual admission linkage; authority validity at admission; complete binding; policy/delegation/incarnation/boundary compatibility; no-authority-amplification; UNKNOWN on unresolved distinctions; observation semantics.

## 12. What should remain protocol-specific
Until a quotient proof shows otherwise, keep the mechanism-specific realization semantic: atomic linearization/non-interleaving; lease interval/expiry/renewal/replay; recheck fact-set/order. These may be packed into a generic `ProtocolBridgeSemantics` relation, but cannot be erased without reconstruction evidence.

## 13. Bounded congruence definition
For protocol p and depth k:
`Congruent_p^k(H1,H2)` iff current common kernel equal; protocol semantic obligations equal; actual linkage equal; observations equal; every legal P_AA-relevant continuation up to depth k has a corresponding continuation with the same observation or UNKNOWN; and no authority amplification occurs. This is bounded research, not a theorem about all executions.

## 14. Kernel intersection
The protocol-independent kernel is the semantic intersection of requirements necessary for all three protocol classes. It must not be computed as a naive field intersection. A field may be absent from one representation yet semantically derivable there.

## 15. Important result
There is strong evidence for a common claim kernel plus protocol-specific semantic extensions. There is not yet evidence sufficient to erase all protocol extensions into one scalar representation. Likely architecture:
`AAKernel = K_common + ProtocolSemantics`
where `ProtocolSemantics` is itself quotientable and may be represented by BridgeBinding relations.

## 16. Abstract Next consequence
`Next_AA(A,A',p)` should be protocol-parameterized at the semantic level, with p ∈ {ATOMIC, LEASE, RECHECK}, while claim observation remains protocol-independent. A concrete protocol transition can stutter only when the common kernel and protocol semantic continuation space remain unchanged.

## 17. Minimality status
No universal theorem says AtomicLinearization, LeaseBridgeSemantics, or RecheckFactSetAndOrder must be separate variables. They remain separate semantic obligations because no absorption proof has been established.

## 18. AB44 frontier
1. Define protocol-specific semantic quotient functions Q_ATOMIC, Q_LEASE, Q_RECHECK.
2. Compare their common projection against K_common.
3. Attack whether ProtocolSemantics can be represented by one generic relation without losing meaning.
4. Derive protocol-parameterized abstract Next and safety observation.
5. Only after this, decide whether the next TLA+ model should use one protocol parameter or separate modules.

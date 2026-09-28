# GLOBAL-AUDIT-042 — QUORUM CERTIFICATE REPLAY, CROSS-EPOCH COMPOSITION AND EVIDENCE RECLAMATION — 2026-09-28

## Objective
Attack whether quorum certificates can be replayed, combined across membership epochs, or safely discarded without destroying claim-relevant historical semantics.

## 1. Replay
A certificate must be bound to claim scope, membership epoch, participant incarnation, evidence generation and the exact state/operation context it certifies. Signature validity alone does not prevent semantic replay.

A certificate valid for claim C1 must not be reused for C2 merely because the payload overlaps, unless the certificate contract explicitly declares cross-claim reuse sound.

## 2. Cross-epoch composition
Combining votes from M1 and M2 is not automatically meaningful. The composition is valid only if a declared reconfiguration relation establishes how evidence from both epochs jointly supports the target claim and preserves required quorum intersection/failure assumptions.

Otherwise:
`VALID(Q1) + VALID(Q2) != VALID(Q1 ∪ Q2)`.

## 3. Historical versus current claims
Old certificates may remain authoritative evidence for a historical claim while being invalid for current-state claims. Therefore evidence validity must be claim-relative and time/generation-relative.

## 4. Revocation and certificate validity
Revoking a participant or changing membership does not necessarily erase historical facts. A historical certificate can remain evidence that a participant signed under an earlier valid epoch. Revocation affects future authority according to the membership/authority contract.

## 5. Evidence reclamation
Deleting old certificates is safe only if every future claim that could depend on them has an alternative authoritative reconstruction path, and the deletion itself cannot change the compatible-history set for an in-scope claim.

`DELETION != SEMANTICALLY_IRRELEVANT`.

A retention policy therefore needs claim scope, reconstruction guarantees, dependency closure, legal future claims, and an explicit UNKNOWN behavior when reconstruction is no longer possible.

## 6. Garbage collection attack
If Q1 is garbage-collected and a later dispute requires historical quorum membership, reconstructing only the aggregate digest may be insufficient if participant incarnation, epoch transition or dependency provenance were claim-relevant.

## 7. Certificate nesting
A certificate that attests another certificate's validity does not automatically inherit all semantic properties of the underlying evidence. The dependency graph must retain the transitive provenance required by the target claim.

## 8. Replay defense
Candidate replay key:
`ClaimScope + Operation/Effect Identity + MembershipEpoch + ParticipantIncarnations + EvidenceGeneration + CertificateType + Policy/ProtocolGeneration`.

This is a semantic binding candidate, not a frozen implementation format.

## 9. Conclusion
Quorum certificates are typed historical evidence, not generic reusable tokens. Cross-epoch composition and reclamation require explicit semantic contracts. Safe reclamation is a claim-relative reconstruction problem; absent reconstruction, the system must preserve UNKNOWN rather than manufacture completeness.

No formal proof/TLC/TLAPS/runtime fault injection.

Next: GLOBAL-AUDIT-043 — attack evidence retention horizons, legal future claims and whether finite retention can preserve FutureObs semantics.

Status: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; evidence reducer completeness UNKNOWN; independence proof UNKNOWN; quorum semantics completeness UNKNOWN; retention/reconstruction soundness UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.

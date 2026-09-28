# GLOBAL-AUDIT-041 CONTINUITY

Audit commit: 00b3a557b6f206f9dc379fc43d4e95ae8233bbd8
Previous continuity: 9b75f9feaba986f7b86784c04d93380c28e442a2

Completed dynamic quorum membership/reconfiguration/epoch attack.

Quorum certificates are bound to membership generation. Candidate binding: QuorumCert=<Claim, MembershipEpoch, ParticipantIncarnations, EvidenceGenerations, Threshold, IntersectionAssumption, AggregateDigest>.

Attacks: reuse certificate after membership change, participant replacement, concurrent membership epochs/split brain, threshold changes with cached votes, authority epoch changes, revoked participant votes retained.

Valid signatures do not make old quorum evidence current. Historical quorum may support a historical claim only when scoped to its original epoch; it cannot silently become evidence for a later epoch.

Membership epoch and authority epoch are distinct. Participant stable IDs may require incarnation binding. Cached quorum evidence requires membership epoch, participant incarnation, evidence generation and freshness.

Reconfiguration requires explicit transition semantics for old certificate validity and quorum intersection. Without them, conflicting certificates remain UNKNOWN.

No formal proof/TLC/TLAPS/runtime fault injection. No implementation/V21.
Next: GLOBAL-AUDIT-042 — quorum certificate replay/composition across epochs and evidence reclamation.
Carryover unchanged: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; evidence reducer completeness UNKNOWN; independence proof UNKNOWN; quorum semantics completeness UNKNOWN; formal verification NOT PERFORMED.

# GLOBAL-AUDIT-041 — DYNAMIC QUORUM MEMBERSHIP, RECONFIGURATION AND EPOCHS — 2026-09-28

## Objective
Attack quorum evidence across membership changes, authority epochs, participant incarnations and stale quorum certificates.

## 1. Membership is versioned state
A quorum certificate is meaningful only relative to the exact participant membership generation/epoch. Reusing a certificate after membership changes can silently apply an old failure model to a new participant set.

Candidate binding:
`QuorumCert = <Claim, MembershipEpoch, ParticipantIncarnations, EvidenceGenerations, Threshold, IntersectionAssumption, AggregateDigest>`.

## 2. Reconfiguration attacks
A. Certificate Q1 valid under membership M1, then reconfiguration to M2, then Q1 reused.
B. Participant P leaves M1 and reincarnates as P2; old identity reused without incarnation binding.
C. Two concurrent membership epochs each form local quorum.
D. Threshold changes while old votes remain cached.
E. Authority epoch advances but old quorum evidence is presented as current.
F. Revoked participant's previously valid vote remains in a new aggregate.

## 3. Findings
Old quorum evidence cannot be assumed current merely because signatures remain valid. Membership epoch, participant incarnation and evidence generation are claim-critical when they affect quorum semantics.

A valid historical quorum can remain useful for a historical claim, but it must not be silently promoted to evidence about a later membership epoch.

## 4. Split-brain
If M1 and M2 overlap inconsistently, both can satisfy a local threshold without establishing a single globally authoritative quorum. A resolver needs an authoritative epoch/transition relation, not merely two valid certificates.

## 5. Reconfiguration safety
Safe reconfiguration requires a defined transition relation between membership epochs, including which old certificates remain valid, for which claims, and how intersection is preserved. Without that relation, conflicting certificates produce UNKNOWN rather than a chosen winner.

## 6. Incarnation rule
Stable participant IDs are insufficient if participants can be replaced. Votes/evidence must bind participant incarnation or an equivalent authoritative membership generation.

## 7. Cache rule
Cached quorum evidence requires membership epoch + participant incarnation + evidence generation + freshness. Otherwise cache hit becomes stale evidence, not current support.

## 8. Authority epoch interaction
Authority epoch and membership epoch are distinct dimensions. Advancing one cannot be assumed to invalidate or validate the other unless the claim contract explicitly defines the relation.

## 9. Conclusion
Quorum evidence is historical, scoped and generation-bound. Dynamic membership makes "k-of-n" a stateful claim rather than a static count. Reconfiguration must preserve explicit semantics for certificate validity and intersection; otherwise the safe result is UNKNOWN.

No formal proof/TLC/TLAPS/runtime fault injection.

Next: GLOBAL-AUDIT-042 — attack quorum certificate replay, certificate composition across epochs and evidence reclamation.

Status: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; evidence reducer completeness UNKNOWN; independence proof UNKNOWN; quorum semantics completeness UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.

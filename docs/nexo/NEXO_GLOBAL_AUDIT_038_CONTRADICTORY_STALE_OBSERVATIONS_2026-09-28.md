# GLOBAL-AUDIT-038 — CONTRADICTORY, STALE AND ORDERED OBSERVATIONS — 2026-09-28

## Objective
Attack reconciliation when authenticated observations disagree, arrive out of order, or are valid but stale.

## 1. Authentication is not freshness
An authenticated provider response establishes source/authenticity properties only. It does not by itself prove currentness, finality, incarnation or precedence over another authenticated response.

## 2. Observation identity
Candidate observation identity:
`ObservationID, ProviderIdentity, ProviderIncarnation, EffectID, ResourceIncarnation, ProviderRevision/Sequence, ObservationTime, AuthoritativeOrder, QueryContext, FreshnessContract`.

Local receipt time is metadata, not authoritative ordering.

## 3. Contradiction classes
A. Same EffectID/incarnation, same provider revision, conflicting payloads: provider/data integrity violation or unresolved inconsistency; do not choose latest local arrival.
B. Same EffectID/incarnation, ordered revisions with conflicting payloads: higher authoritative revision may supersede lower if provider contract explicitly defines that semantics.
C. Different provider incarnations: observations may belong to different provider histories; cannot be merged without an incarnation relation.
D. Same effect ID but different resource incarnations: historical observations remain separate.
E. Accepted then rejected without ordering: UNKNOWN.
F. Rejected then accepted without ordering: UNKNOWN.
G. Accepted at t1, rejected at t2 with authoritative monotonic status semantics: resolve only according to that provider's documented state machine.

## 4. No latest-write-wins by default
`max(local_arrival_time)` is not a semantic reducer. A reducer is valid only when the provider exposes ordering/finality semantics that justify it for the exact effect/resource identity.

## 5. Stale but authentic evidence
An old response may be perfectly authentic and still unusable for a protected decision. Freshness must be evaluated against the claim and provider contract, not merely signature validity.

## 6. Cross-provider observations
Two providers can disagree without either being malicious: different replicas, snapshots, consistency modes or resource incarnations can explain the difference. Cross-provider composition requires an explicit consistency/authority relationship. Observer count does not increase confidence when common-mode dependencies remain unresolved.

## 7. Evidence reducer
Candidate reducer:
1. authenticate source;
2. bind exact EffectID/resource incarnation;
3. validate provider incarnation;
4. validate revision/sequence/order semantics;
5. classify freshness;
6. detect contradictions;
7. construct compatible observation histories;
8. return RESOLVED only if claim-relevant alternatives are excluded;
9. otherwise UNKNOWN/QUARANTINE.

## 8. FALSE versus UNKNOWN
A contradictory response does not automatically prove P_AA FALSE. FALSE requires a claim-relevant, authenticated and context-bound observation demonstrating an actual violation. If observations merely conflict without authoritative ordering, result is UNKNOWN.

## 9. Research conclusion
The safe reducer is relational and provider-contract dependent. A generic `latest response wins`, boolean OR/AND, majority vote, or signature-validity check is unsound for protected reconciliation without additional semantics.

No formal proof/TLC/TLAPS execution or runtime fault injection.

Next: GLOBAL-AUDIT-039 — attack cross-provider evidence composition, majority/consensus assumptions and common-mode failure domains.

Status: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; evidence reducer completeness UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.

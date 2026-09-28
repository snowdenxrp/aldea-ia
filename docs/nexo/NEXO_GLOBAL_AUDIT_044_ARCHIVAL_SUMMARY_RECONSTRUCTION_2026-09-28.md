# GLOBAL-AUDIT-044 — ARCHIVAL SUMMARY AND HISTORY RECONSTRUCTION ATTACK — 2026-09-28

## Objective
Attack whether compacted/archived summaries can safely reconstruct claim-relevant history without losing actual linkage, order, incarnation or dependency closure.

## 1. Summary is not reconstruction by default
A summary S is safe only if there exists a claim-scoped reconstruction function R(S) that recovers every semantic fact required by the target observation, or conservatively returns UNKNOWN when it cannot.

`SUMMARY_PRESENT != RECONSTRUCTION_COMPLETE`.

## 2. Linkage-loss attack
Two histories may share the same aggregate counts/digests while using different UsedAdmissionContext or different AdmissionID-to-EffectID linkage. A summary preserving only counts cannot distinguish them.

## 3. Order-loss attack
A multiset of events can preserve membership but lose ordering. If revoke-before-admit and admit-before-revoke produce the same multiset, an order-free summary cannot answer a historical validity claim.

## 4. Incarnation-loss attack
Replacing resource R1 with R2 while retaining the same logical resource ID can be invisible to a summary that omits incarnation/generation. Historical evidence can then be incorrectly rebound to R2.

## 5. Dependency-loss attack
A derived claim summary can omit a dependency that later becomes invalid. Without dependency identity/generation, the summary cannot determine whether the derived result remains admissible.

## 6. Negative-space attack
A summary of observed events does not prove absence of an event. If the claim depends on whether an invalidation/revocation happened, absence from a compacted log is insufficient unless the archival contract guarantees completeness over the relevant scope/time.

## 7. Repeated compaction
Even individually sound summaries can become unsound if each compaction discards distinctions needed by a later reconstruction. Soundness must compose across the entire compaction chain, not only one step.

## 8. Safe archival contract
Candidate archival summary requires:
- claim scope;
- source history/version/incarnation;
- actual admission/effect linkage where relevant;
- authoritative order/linearization summary;
- resource/authority/policy/delegation generations;
- dependency/provenance closure or authoritative reconstruction pointer;
- completeness boundary;
- invalidation/reclamation semantics;
- reconstruction version/derivation identity.

## 9. UNKNOWN behavior
If reconstruction cannot establish completeness or distinguish relevant histories, it must return UNKNOWN. The summary must never manufacture a witness by selecting an arbitrary compatible history.

## 10. Conclusion
Archival compaction is a semantic abstraction problem. A summary is sound only relative to a claim and a reconstruction contract. Counts, hashes, latest-state snapshots and event multisets are not universally sufficient.

No formal proof/TLC/TLAPS/runtime fault injection.

Next: GLOBAL-AUDIT-045 — attack composition of repeated archival summaries and reconstruction-version migration.

Status: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; retention/reconstruction soundness UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.

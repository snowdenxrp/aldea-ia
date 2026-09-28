# GLOBAL-AUDIT-043 CONTINUITY

Audit commit: c82cdf5d85ee4f5a836d3a4d723a9413e01fa749
Previous continuity: 9596ec5852310ea08503a1a84e8109c268f9ca98

Completed retention-horizon/FutureObs attack.

Finite retention is not automatically safe. A late dispute, delayed invalidation, or delayed external effect can require distinctions that were deleted after a fixed horizon. Deletion can therefore change FutureObs support and force UNKNOWN.

Finite retention is sound only with explicit semantic bounds on dispute, invalidation and external reconciliation horizons, or an authoritative reconstruction checkpoint, or an explicit claim universe excluding later historical queries.

Compaction is safe only when the retained summary preserves all future claim-relevant semantics: actual UsedAdmissionContext, order, incarnation, dependencies and provenance where required. Aggregate digest alone may be insufficient.

At the retention boundary, evidence must be classified as reconstructible, outside claim scope, or UNKNOWN when discarded distinctions are required. It must not silently become 'nonexistent'.

FutureObs_PAA remains unproven unless the future claim/continuation universe is bounded or a congruent abstraction theorem exists.

No formal proof/TLC/TLAPS/runtime fault injection. No implementation/V21.
Next: GLOBAL-AUDIT-044 — archival/reconstruction summary attacks.
Carryover: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; retention soundness UNKNOWN; reconstruction completeness UNKNOWN; formal verification NOT PERFORMED.

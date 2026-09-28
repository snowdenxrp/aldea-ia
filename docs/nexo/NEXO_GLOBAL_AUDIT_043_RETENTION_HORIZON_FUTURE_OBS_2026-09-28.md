# GLOBAL-AUDIT-043 — RETENTION HORIZONS AND FUTURE OBSERVATION SEMANTICS — 2026-09-28

## Objective
Attack whether finite evidence retention can preserve FutureObs_PAA semantics for all legally relevant future claims.

## 1. Retention is claim-relative
A retention horizon cannot be declared safe solely from age or storage cost. Safety depends on the future claim universe, reconstruction function, event dependencies and whether removed evidence can distinguish future observations.

## 2. Counterexample: late dispute
Admission A is valid today. Evidence E supporting its historical UsedAdmissionContext is deleted after a fixed horizon. A later dispute requires reconstructing A under a policy/incarnation history that is no longer retained. Current state may be identical across two histories while the historical claim differs.

Result: deletion changes FutureObs support and can force UNKNOWN.

## 3. Counterexample: delayed invalidation
Evidence is retained for H time units, but a revocation/invalidation event can arrive after H. If the old evidence is deleted before the invalidation relation can be reconstructed, the system may incorrectly preserve a conclusion that should become UNKNOWN or FALSE.

## 4. Counterexample: delayed external effect
An external provider may expose final status after the local retention horizon. If EffectID, incarnation and attempt lineage were deleted, reconciliation may no longer distinguish the old effect from a later operation.

## 5. Safe finite retention condition
Finite retention can be sound only under an explicit bound on all claim-relevant future dependence, such as:
- maximum legal dispute horizon;
- maximum invalidation/late-evidence horizon;
- maximum external reconciliation horizon;
- durable reconstruction checkpoint sufficient to recover discarded history;
- explicit claim universe excluding later historical queries.

These are semantic assumptions, not implementation conveniences.

## 6. Compaction
Compaction is safe only if it preserves a sufficient semantic summary for every in-scope future observation. An aggregate digest is insufficient when future claims require member identities, order, incarnation, dependency provenance or actual UsedAdmissionContext.

## 7. Retention boundary
At the retention boundary, the system must explicitly transition historical evidence to one of:
- reconstructible from an authoritative retained summary;
- permanently outside claim scope;
- UNKNOWN for claims requiring discarded distinctions.

Silently treating expired evidence as nonexistent is unsafe.

## 8. FutureObs implication
FutureObs_PAA cannot be proven from finite retention unless the legal continuation/claim universe is itself bounded or a theorem establishes that the retained summary is a congruent abstraction for every allowed future observation.

Therefore a finite retention horizon is a candidate assumption, not evidence of quotient sufficiency.

## Conclusion
Retention is part of semantic correctness. Evidence GC, compaction and archival policies can change the set of distinguishable future histories. Safe deletion requires claim-relative reconstruction guarantees or an explicit UNKNOWN boundary.

No formal proof/TLC/TLAPS/runtime fault injection.

Next: GLOBAL-AUDIT-044 — attack archival/reconstruction summaries and whether compacted history can preserve actual linkage, order, incarnation and dependency closure.

Status: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; retention soundness UNKNOWN; reconstruction completeness UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.

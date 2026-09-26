# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.221

## Persisted
- Research: docs/nexo/NEXO_AB104_221_EVIDENCE_DEPENDENCY_COMMON_MODE_ATTACKS_V1_2026-09-26.md
- Commit: 11c23498db7ca370ba419de0bf296d6045bd3b43

## Core result
- Multiple signed claims can share one compromised root, issuer, clock, snapshot, database, trust anchor or failure domain.
- Signature count/quorum count does not automatically establish evidence independence.
- A Verifier-derived claim may add appraisal authority without adding an independent observation.
- Authenticity and freshness remain separate; an authentic claim can be stale/rollbacked.
- Shared snapshot or restored storage can make apparently separate records one common-mode history.
- Common-mode failure must invalidate/degrade dependent claims together; they must not remain as independent votes.
- Conflicting internally valid evidence branches require explicit authority/policy; no timestamp/arrival/count winner.

## External anchors
- RFC 9334: Evidence/Appraisal/Attestation Result/Relying Party separation, trust anchors and freshness.
- SCITT architecture: receipt proves inclusion; non-equivocation is a separate consistency property.
- TUF: rollback/freeze demonstrate authentic old metadata can remain dangerous without freshness.

## Residuals
AB50→AB58 ternary/event/reconstruction/semantic/formal gaps unchanged.

## Next exact mission
AB104.222: invalidation propagation after root revocation/corruption/staleness; recalculate dependent claims, historical decisions and pending permissions without rewriting history.

## DO-NOT-REPEAT
- signature count != independence
- quorum count != independent failure domains
- authenticated != fresh
- derived verifier claim != independent observation
- shared snapshot != independent history
- invalidating a root must not rewrite historical evidence
- no V21, no architecture implementation, no unsupported verification claims
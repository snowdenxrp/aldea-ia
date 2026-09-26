# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.235

## Persisted
Research file: docs/nexo/NEXO_AB104_235_EVIDENCE_DEPENDENCY_COMMON_MODE_GRAPH_ATTACKS_V1_2026-09-26.md
Research commit: 3e6b9b017c356b07fb7a4e56be81654c80e08b17

## Core result
Evidence independence is a dependency-graph property, not a count of signatures, records, devices or services.

Common-mode dependencies:
shared root; cloned device state; shared backup/snapshot; shared freshness source; shared verifier; shared target; shared transparency service; derived claims; circular claims.

Candidate rule:
If two claims share a material dependency whose failure can make both false, they cannot count as independent for that failure mode.

## Repository inspection
Direct main inspection found local executionJournal, local idempotencyKey, journal retention of 200, runtime key missionId:stepId, and local nexoEffectRevision/stateVersion.

No protected authority root, authority epoch, target incarnation, signer-set/quorum mechanism or evidence dependency graph was observed in the inspected effect/recovery path.

The handler-exception path still returns EFFECT_OUTCOME_UNKNOWN without persist(), while prior test expectations recorded in research expect a persisted UNKNOWN journal result. This remains unresolved. No test-pass claim.

## External evidence
SCITT separates signed statements from transparency receipts and describes receipts as registration/inclusion evidence. 
TUF explicitly binds role trust to configured keys and signature thresholds.

## Residuals
AB50->AB58 unchanged:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

AB55 remains minimal boolean 64 states x 6 total orders = 384 per attack x 8 attacks.

## Constraints
Research/study only. No V21. No architecture implementation. Preserve UNKNOWN/PENDING and contradictions.

## Exact next mission
AB104.236: dynamic dependency invalidation after root rotation, signer revocation, target-incarnation change, archive restore and freshness rollback.
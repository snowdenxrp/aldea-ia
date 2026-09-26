# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.236

## Persisted
Research file:
docs/nexo/NEXO_AB104_236_DYNAMIC_EVIDENCE_INVALIDATION_REAPPRAISAL_V1_2026-09-26.md
Commit:
24bbbfd51476255bbe46607156a8c99e0d8716e0

## Core result
Invalidation changes current admissibility without rewriting historical fact.

Candidate propagation:
dependency change -> identify affected claims -> append invalidation event -> mark dependent claims stale/revoked/conflict/unknown -> invalidate dependent pending decisions -> fresh appraisal -> fence pending effects -> preserve historical records.

Key distinctions:
- invalidated claim != deleted claim;
- revocation != historical erasure;
- stale != false;
- archive restore != current authority;
- local invalidation != target fencing;
- historical authorization != current permission.

## External evidence
RFC 9943 separates signed statements from relying-party validation decisions and allows later statements to supersede earlier ones. citeturn0search0
RFC 9334 separates Evidence, Verifier appraisal, Attestation Results and Relying-Party authorization, and treats freshness as policy-dependent. citeturn0search1
A 2026 RATS application-layer draft likewise keeps authority references separate from trustworthiness claims and authorization decisions. citeturn0search4

## Current prototype
No dependency graph/invalidation engine connecting root/configuration changes to claims and pending effects was demonstrated in the inspected path. No implementation added.

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
AB104.237: attack invalidation ordering and durable propagation — crashes during invalidation, queued decisions, concurrent root rotation/revocation, stale caches, multi-device propagation, and invalidation arriving after an effect crosses the boundary.
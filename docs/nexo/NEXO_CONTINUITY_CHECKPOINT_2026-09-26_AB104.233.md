# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.233

## Persisted
Research:
docs/nexo/NEXO_AB104_233_AUTHORITY_ARBITRATION_QUORUM_CLONE_PARTITION_V1_2026-09-26.md
Commit: 291f4cb326d0ee8cf7c5f59cc2be61731b9692bf

## Core result
Canonical-history arbitration is a security boundary.
Quorum evidence is meaningful only with protected authority membership, configuration, trust root and independence assumptions.

Key findings:
- distinct signatures != independent authorities;
- cloned voters can fake apparent quorum;
- shared snapshots/roots/backups can create common-mode dependence;
- offline-valid branches may remain historical without becoming current;
- root rotation during partition requires authenticated transition;
- compromised recovery authority cannot bootstrap its own legitimacy;
- deterministic tie-breaks provide reproducibility, not authority.

Candidate authority evidence:
trusted root + authenticated transition/configuration + signer eligibility + threshold proof + common statement digest + predecessor binding + epoch/freshness + incarnation + revocation/conflict checks + anti-rollback continuity.

## Current prototype
No canonical authority/quorum/fork-arbitration mechanism demonstrated. No implementation added.

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
AB104.234: quorum evidence attack — threshold counting, signer eligibility, duplicate/clone identities, configuration rollback, split-brain quorums, root/key rotation and evidence dependency graphs.

## DO-NOT-REPEAT
Distinct signatures != independence; quorum of copies != quorum of authority; deterministic tie-break != authority; higher epoch != authority without transition; no V21.
# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.234

## Persisted
Research:
docs/nexo/NEXO_AB104_234_QUORUM_PROOF_SEMANTICS_COMMON_MODE_ATTACKS_V1_2026-09-26.md
Commit: 72ffd42aa1a3873499997146e9fcb43dc001e02a

## Core result
Threshold count is not independence.
Distinct signatures are not automatically independent failure domains.
A quorum proves only the statement/configuration/epoch semantics it actually binds.

## Important findings
- quorum does not automatically prove truth;
- quorum does not prove external effect commit;
- valid old quorum does not equal current authority;
- conflicting threshold-valid statements are CONFLICTING_AUTHORITY, not a voting contest;
- configuration rollback can weaken threshold rules;
- cloned identities/common roots/backups can create common-mode quorum;
- derived signed claims can multiply signatures without multiplying observations;
- deterministic tie-breaks do not create authority.

TUF provides a reference model where Root metadata specifies trusted keys and signature thresholds as part of authenticated role configuration. citeturn0search13
SCITT separates signed statements from registration receipts and requires consistency/non-equivocation for the transparency service. citeturn0search12turn0search26
Raft joint consensus is a reference for safe authority reconfiguration, not a Nexo architecture choice. citeturn0search10

## Current prototype
No quorum-proof or canonical authority implementation demonstrated. No architecture implementation added.

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
AB104.235: quorum equivocation detection and proof of non-equivocation — double-sign evidence, witnesses/auditors, signed checkpoints, conflicting receipts, fork accountability, recovery after detected equivocation, and separation of detection from current authority.

## DO-NOT-REPEAT
Threshold count != independence; quorum != truth; quorum != external commit; old quorum != current authority; conflicting quorum != winner; no V21.
# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.219

## Persisted
- Research: docs/nexo/NEXO_AB104_219_CLAIM_DECISION_EFFECT_ARCHIVE_BOUNDARY_V1_2026-09-26.md
- Commit: 06e2fadd789a2c23083addb626ca22679423e0d3

## Core result
- Claim Contract states what evidence asserts; Decision Contract states what conclusion is admissible; Effect Contract defines what may cross the external-effect boundary.
- Archive certificate belongs primarily to evidence/claim. It must not automatically become a decision or execution permission.
- ARCHIVE_CONTAINS(X) != TARGET_COMMITTED(X).
- ARCHIVE_ABSENCE != TARGET_NOT_COMMITTED.
- Historical signature validity != current authority/freshness.
- A decision describing EXTERNALLY_COMMITTED is historical fact classification, not permission to create another effect.
- Same operation identity with different payload fingerprints is collision/conflict.
- Negative claims must be boundary-specific and issuer-authoritative.

## Prototype note
- Current effect-adapter provides partial separation through prepared/reconciliation, but idempotencyKey lacks explicit target incarnation, authority epoch/root and payload fingerprint. This is prototype evidence only.

## Residuals
AB50→AB58 ternary/event/reconstruction/semantic/formal gaps remain unchanged.

## Next exact mission
AB104.220: evidence dependency graph, independent claims, common-mode failures, circular evidence, conflicting claims and decision admissibility.

## DO-NOT-REPEAT
- Receipt/certificate != external commit proof.
- Archive absence != negative target evidence.
- Historical validity != current authority.
- Decision != permission to repeat.
- No V21, no architecture implementation, no unsupported verification claims.
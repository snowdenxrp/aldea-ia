# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.218

## Persisted
- Research: docs/nexo/NEXO_AB104_218_UNKNOWN_PARTIAL_ARCHIVE_CERTIFICATE_SEMANTICS_V1_2026-09-26.md
- Commit: 307cc7981ae67da951160827901966eb330f94a9

## Core result
- Certificate UNKNOWN commits an unresolved claim, not proof of non-execution.
- UNKNOWN must preserve boundary, last evidence, issuer/context, scope/incarnation, authority, missing reconciliation evidence and horizon.
- PARTIAL requires sub-effect identity/status/evidence; a parent boolean can hide committed children.
- Same operation identity + different payload fingerprint is collision/quarantine.
- Expired reconciliation horizon may yield UNKNOWN_PERMANENT, never NOT_COMMITTED by expiration alone.
- Historical UNKNOWN identity remains known after compaction and must continue blocking blind replay.
- Old valid certificate can be stale; current authority/freshness must still be checked.

## Code evidence
- effect-adapter uses prepared/reconciliation and idempotencyKey.
- journal is capped at 200 entries.
- exception path returns EFFECT_OUTCOME_UNKNOWN without persist(); test expects persisted result. No test-pass claim.

## Residuals preserved
AB50→AB58 ternary/event/reconstruction/semantic/formal gaps remain unchanged.

## Next exact mission
AB104.219: connect archive certificate claims to Claim Contract and Decision Contract; determine which claims may resolve UNKNOWN/PARTIAL and which can never grant effect permission.

## DO-NOT-REPEAT
- UNKNOWN certificate != proof of non-execution.
- PARTIAL aggregate != child-level proof.
- Expiry != NOT_COMMITTED.
- Historical validity != current authority.
- No V21, no architecture implementation, no unsupported verification claims.
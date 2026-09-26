# NEXO CONTINUITY CHECKPOINT — AB104.295

Date: 2026-09-26
Canonical repo: snowdenxrp/aldea-ia
Branch: main

## Completed
- AB104.295 researched: idempotency-key namespace, expiry, collisions, fingerprints, and target incarnation.
- Research commit: 2db4711181c4de6894f748fd757ea3f88ed626c4

## Carry-forward
- Idempotency keys are scoped to a protocol namespace; scope is part of correctness.
- Same key + different payload should be CONFLICT, not a new execution.
- Expiry destroys dedupe evidence; it does not prove NOT_COMMITTED.
- Bare keys are insufficient across restore/incarnation boundaries.
- Historical pre-restore dedupe evidence must not silently become current execution authorization.
- Candidate composite identity: target identity + target incarnation + logical operation ID + payload fingerprint; authority/fence may additionally bind execution. Exact schema remains UNSELECTED.

## Constraints
Research only. No architecture implementation, formal verification, semantic freeze, V21 patching, overwrite/delete, or silent migration. Preserve AB50→AB58 unresolved findings.

## Next exact action
AB104.296 — study canonical payload fingerprinting, semantic equivalence vs byte equality, and stability across serialization/schema migration and restore.

## DO-NOT-REPEAT
- Same key + different fingerprint != retry; it is conflict.
- Dedupe expiry != NOT_COMMITTED.
- Old-incarnation dedupe != current authorization.
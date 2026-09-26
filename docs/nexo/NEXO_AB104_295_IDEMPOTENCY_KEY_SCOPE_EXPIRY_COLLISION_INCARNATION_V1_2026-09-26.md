# NEXO AB104.295 — Idempotency-key scope, expiry, collisions, incarnation

Date: 2026-09-26
Status: RESEARCH ONLY.

## Sources studied
The HTTPAPI Idempotency-Key draft requires uniqueness for a logical request and says a key must not be reused for a different payload; it permits resource-defined expiry and supports an idempotency fingerprint. citeturn0search7turn0search8
Stripe documents that keys are pruned after at least 24 hours, after which reuse can create a new request; it compares parameters to prevent accidental key reuse. citeturn0search1
AWS EC2 documents client-token idempotency and says retries use the same token and same parameters; a token should not be reused for another request. citeturn0search6
AWS Lambda Powertools documents configurable expiration and explicitly notes that after expiry the same payload is no longer considered idempotent. citeturn0search15

## Findings
1. An idempotency key is meaningful only inside a defined namespace. Scope can include principal, resource/API, tenant/project, operation class, or another protocol-defined domain.
2. Same key + different payload should be a conflict, not a new execution. Fingerprinting is the practical mechanism observed in multiple protocol designs.
3. Expiry is semantic loss of deduplication state. After expiry, reuse may legally represent a new operation in the underlying protocol; expiry therefore cannot prove the original operation never happened.
4. For Nexo, a bare key is insufficient across restore/incarnation boundaries. Candidate identity must bind at least target identity + target incarnation + logical operation ID + payload fingerprint; authority generation/fence may also be required at the execution boundary.
5. Namespace matters: the same byte string can safely identify different operations in independent namespaces, while accidental cross-namespace reuse can be dangerous if the target's semantics are broader than expected.
6. Collision has two distinct meanings: cryptographic/random key collision and semantic reuse of an existing key for a different operation. The latter must be treated as CONFLICT even when the key itself is unique-looking.
7. A dedupe record that expires or is compacted creates a new uncertainty interval. Safe recovery must retain enough evidence or move the historical operation to an archive/certificate state if later reconciliation remains possible.
8. A target incarnation change should prevent a pre-restore idempotency record from silently serving as current execution authority. Historical dedupe evidence may remain valid as history but must be interpreted in the old incarnation.
9. Therefore the research candidate is a composite operation identity rather than a single opaque key. Exact field set and canonical serialization remain UNSELECTED.

## Candidate invariant
`SAME_KEY + DIFFERENT_FINGERPRINT => CONFLICT`

`DEDUPE_EXPIRED != NOT_COMMITTED`

`PRE_RESTORE_DEDUPE_RECORD != CURRENT_EXECUTION_AUTHORIZATION`

## Explicit non-claims
No architecture selected; no implementation; no formal verification; no semantic freeze.

## Next exact step
AB104.296 — investigate canonical payload fingerprinting, semantic equivalence versus byte equality, and whether fingerprints remain stable across serialization/schema migration and restore.
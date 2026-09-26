# NEXO AB104.296 — Canonical payload fingerprints and semantic equivalence

Date: 2026-09-26
Status: RESEARCH ONLY.

## Evidence
RFC 8785 defines deterministic JSON canonicalization for cryptographic operations: canonical serialization makes equivalent representations hash/sign consistently, with deterministic property ordering and UTF-8 output. It also records a verified erratum concerning negative zero, showing that canonicalization rules themselves need precise semantic handling. citeturn0search0turn0search1

## Findings
1. Byte equality is stronger than semantic equality: two payloads can represent the same application meaning while differing in serialization, field order, insignificant formatting, or schema representation.
2. Canonicalization can make representation-level fingerprints stable, but it does not decide application-level semantic equivalence. That requires an explicit schema/normalization contract.
3. A fingerprint must identify what was actually authorized. Over-normalizing can collapse materially different requests; under-normalizing can classify semantically identical retries as conflicts.
4. Schema migration creates a special boundary: the same logical operation may have old and new representations. A migrated fingerprint should not silently become the original fingerprint unless the migration contract proves semantic preservation.
5. Therefore candidate fingerprint layers should be distinguished: raw/representation digest, canonical payload digest, and—only if explicitly defined—semantic-operation digest.
6. The operation identity used for idempotency should bind the fingerprinting scheme/version. Otherwise a future canonicalization change can reinterpret an old operation under a new digest rule.
7. Restore must preserve the fingerprint algorithm/version with the historical record; recomputing under a changed canonicalizer is not automatically evidence of equality.
8. RFC 8785 is useful for deterministic JSON representation, but it is not a generic Nexo semantic-equivalence specification and is informational rather than an architecture requirement. citeturn0search0

## Candidate invariants
`SAME_OPERATION_ID + DIFFERENT_CANONICAL_FINGERPRINT => CONFLICT`, unless an authenticated migration/semantic-equivalence rule explicitly relates the representations.

`FINGERPRINT_MATCH => REPRESENTATION_MATCH_UNDER_VERSION`, not automatically semantic equivalence.

`SCHEMA_MIGRATION != FINGERPRINT_EQUIVALENCE` without an explicit authenticated compatibility contract.

## Explicit non-claims
No canonicalization scheme selected for Nexo. No architecture implementation, formal verification, semantic freeze, or migration executor.

## Next exact step
AB104.297 — investigate semantic-equivalence contracts for schema migration and whether a migrated payload may safely retain the original operation identity/fingerprint without creating replay or collision ambiguity.
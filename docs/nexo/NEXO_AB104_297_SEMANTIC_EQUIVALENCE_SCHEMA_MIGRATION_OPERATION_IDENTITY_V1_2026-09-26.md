# NEXO AB104.297 — Semantic-equivalence contracts for schema migration and operation identity
Date: 2026-09-26
Status: RESEARCH-ONLY

## Question
When a payload is migrated from schema S_old to S_new, can the original operation identity/fingerprint safely be retained?

## Evidence studied
Schema-evolution systems distinguish compatibility from migration. Confluent documents backward/forward/full/transitive compatibility and explicit migration rules for incompatible changes; migration transforms data between contract versions. See sources cited in the research context.

## Findings
1. Schema compatibility is not semantic equivalence. A migration may produce data readable by the new schema while changing meaning, defaults, units, normalization, omitted-vs-null distinctions, enum interpretation, or validation constraints.
2. Migration identity must be explicit. A transformed payload should not inherit the old canonical/semantic fingerprint merely because a deterministic transformation exists.
3. Safe identity retention requires a proof/contract binding source schema/version, target schema/version, migration rule/version and digest, canonicalization versions, relevant invariants, and a declared semantic-preservation relation. The relation must be authenticated and versioned.
4. Representation identity and operation identity must remain separate. A representation digest may legitimately change after migration even if the logical operation remains the same.
5. Breaking migrations need explicit lineage. Incompatible schema changes can be handled with compatibility groups and migration rules rather than silently treating the target payload as the original payload.
6. Unknown semantic preservation => UNKNOWN/NOT_PROVEN, not reuse. If the migration contract cannot establish preservation for operation-determining fields, the old operation fingerprint must not be reused as proof of semantic identity.
7. Candidate model: representation_digest; canonical_payload_digest; semantic_operation_digest; migration_lineage; semantic_equivalence_status = PROVEN | NOT_PROVEN | CONFLICT.
8. Candidate operation-identity retention rule: retain the logical operation ID across migration only when identity fields are explicitly schema-independent or a signed/versioned semantic-preservation contract proves preservation. Otherwise create new representation lineage and require re-admission/reconciliation; do not silently reuse the old semantic fingerprint.

## Security consequence
Deterministic canonicalization alone cannot prevent semantic collision across schema versions. A migration can map distinct old operations into one target representation or alter an identity-bearing field while remaining syntactically valid. The admission boundary must therefore validate migration lineage and semantic-equivalence status before treating a migrated record as the same operation.

## Non-claims
No formal proof or implementation was performed in AB104.297. This is a research conclusion/candidate contract, not a verified Nexo design.

## Sources
Confluent Schema Registry data contracts, migration rules, and schema compatibility documentation.

## Next exact step
AB104.298 — study semantic-operation identity boundaries: determine which fields must be identity-bearing versus effect-bearing, and how an authenticated operation contract can prevent migration-induced aliasing/collision.

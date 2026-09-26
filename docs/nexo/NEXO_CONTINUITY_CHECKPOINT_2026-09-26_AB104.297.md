# NEXO CONTINUITY CHECKPOINT — AB104.297
Date: 2026-09-26

## Canonical state
Research-only. No architecture implementation. No V21. No silent overwrite/delete.

## Completed
AB104.297 studied semantic-equivalence contracts for schema migration and operation identity.

## Key result
Schema compatibility/readability does not establish semantic equivalence. Migration must carry authenticated/versioned lineage and an explicit semantic-preservation contract before an old semantic operation fingerprint may be retained. Otherwise status remains NOT_PROVEN/UNKNOWN and re-admission or reconciliation is required.

## Candidate identity layers
representation_digest → canonical_payload_digest → semantic_operation_digest, with migration_lineage and semantic_equivalence_status = PROVEN | NOT_PROVEN | CONFLICT.

## Preserved unresolved research
AB50–AB58 residuals remain visible: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.

## Do-not-repeat
Do not claim schema compatibility, deterministic canonicalization, or migration success as proof of semantic equivalence. Do not reuse an old semantic fingerprint without an explicit authenticated preservation contract.

## Next exact action
AB104.298 — study semantic-operation identity boundaries: identity-bearing vs effect-bearing fields and authenticated contracts preventing migration-induced aliasing/collision.

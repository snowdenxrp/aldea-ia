# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.240

Research file: docs/nexo/NEXO_AB104_240_SCHEMA_EVOLUTION_SEMANTIC_COMPATIBILITY_RECOVERY_V1_2026-09-26.md
Research commit: 0737608ff573490d5dd0a222caaf77be3a341344

Core result: serialization/schema compatibility is not sufficient for security-sensitive recovery. Recovery must preserve semantic meaning, authority context and effect contract.

Layers established: format -> schema -> semantics -> authority -> effect compatibility.

Critical attacks: missing security field with permissive default; enum reinterpretation; unit/type reinterpretation; removal of authority binding; payload canonicalization changes; policy reinterpretation; old interpreter downgrade.

Migration records must bind old schema/semantics, migration identity, new schema, transformation digest, authority context and predecessor. Migration proves transformation, not current execution permission.

Transitive compatibility matters across multi-version recovery; adjacent compatibility does not automatically imply compatibility across the whole history. External schema-registry documentation distinguishes BACKWARD/FORWARD/FULL and their TRANSITIVE variants. citeturn0search2turn0search7

TUF provides analogous rollback protection for metadata versions and coherent state. citeturn0search0turn0search1

Current prototype: no schema-migration or authority-bound semantic-recovery engine demonstrated in inspected Nexo path. No implementation added.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; no architecture implementation; preserve UNKNOWN/PENDING and contradictions.

Exact next mission: AB104.241 — migration-record attacks and semantic transformation safety.
# NEXO AB104.240 — SCHEMA EVOLUTION AND SEMANTIC COMPATIBILITY DURING RECOVERY V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
Backward-readable data is not automatically semantically compatible with a security-sensitive decision. Recovery must distinguish serialization compatibility from semantic compatibility and authority compatibility.

## Compatibility layers
1. BYTE/FORMAT compatibility: record can be parsed.
2. SCHEMA compatibility: fields/types can be decoded under an allowed evolution rule.
3. SEMANTIC compatibility: decoded values retain the same meaning and security-relevant interpretation.
4. AUTHORITY compatibility: decision remains valid under the authority/configuration generation that created it.
5. EFFECT compatibility: reconstructed decision still maps to the same external-effect contract, target incarnation and boundary.

Passing layer 1 does not imply layer 5.

Confluent's schema-evolution documentation provides a useful external distinction: BACKWARD, FORWARD, FULL and TRANSITIVE compatibility have different guarantees, and a change can be readable without being compatible with every historical version. citeturn0search2turn0search7

## Security-relevant downgrade attacks
### A. Field deletion + default
Old record lacks a newly required security field. A decoder supplies a default. If the default means ALLOW, CURRENT, TRUSTED or UNFENCED, an old decision can be silently strengthened.
Candidate rule: security-sensitive missing fields must default to DENY/UNKNOWN or require an explicit migration proof; never infer authority from a convenience default.

### B. Enum reinterpretation
Old `status=2` means VERIFIED in v1; v2 changes enum ordering/meaning. Numeric decoding succeeds but semantics change.
Candidate rule: security-critical enums require stable symbolic identity or explicit semantic mapping/versioned interpretation.

### C. Unit/type reinterpretation
Milliseconds vs seconds, revision vs epoch, local version vs authority generation. Values remain syntactically valid but can alter safety.
Candidate rule: units and semantic domains must be explicit and version-bound.

### D. Authority-field removal
v1 binds decision to root/epoch; v2 removes that field because the new system assumes a global current root. Replaying v1 under v2 can erase the original authority constraint.
Candidate rule: a migration must preserve or explicitly invalidate the old authority binding; absence is not permission.

### E. Payload canonicalization
Old payload fingerprint was computed under one canonicalization grammar; new parser normalizes differently. Same logical-looking object may produce a different or colliding identity.
Candidate rule: payload identity/canonicalization version must be bound to the original effect identity.

### F. Policy reinterpretation
Old `approved=true` was conditional on policy P7. New policy P8 interprets the same field as unconditional approval.
Candidate rule: policy/decision semantics are versioned and historical decisions must not silently inherit new semantics.

## Migration record
An explicit migration can transform historical data, but the migration itself needs identity, predecessor/version binding, authorization, deterministic semantics and evidence of completion.
Candidate:
OLD_SCHEMA + OLD_SEMANTICS + MIGRATION_ID + NEW_SCHEMA + TRANSFORMATION_DIGEST + AUTHORITY_CONTEXT + predecessor -> NEW_RECORD
A migration is evidence of transformation, not proof that the resulting decision is currently executable.

## Transitive compatibility
Checking only adjacent schema versions can miss a non-transitive incompatibility. External schema-registry practice distinguishes BACKWARD from BACKWARD_TRANSITIVE and FULL from FULL_TRANSITIVE. citeturn0search2turn0search7
For Nexo research this means a recovery path spanning v1 -> v3 cannot assume safety merely because v1->v2 and v2->v3 were each locally accepted.

## Version downgrade / rollback
An old schema interpreter can be as dangerous as old data. If v3 data is interpreted using v1 rules, a security field may disappear or acquire a permissive default.
TUF provides an analogous rollback defense through metadata versioning and rejection of older metadata than previously accepted. citeturn0search0turn0search1
Candidate Nexo rule: interpreter/schema version used for security decisions must itself be authority-bound and rollback-protected.

## Recovery invariant
HistoricalRecord may be decoded under an older schema only if:
format valid AND schema mapping verified AND semantic mapping verified AND authority context preserved AND target/effect contract preserved.
Otherwise classify SCHEMA_INCOMPATIBLE, SEMANTIC_INCOMPATIBLE, AUTHORITY_INCOMPATIBLE or UNKNOWN; never silently promote to executable.

## Prototype status
No schema-migration or authority-bound semantic-recovery engine was demonstrated in the inspected Nexo effect/recovery path. No implementation added.

## AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.
AB55 remains minimal boolean 64 states x 6 total orders = 384 per attack x 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
parseable != semantically compatible; backward-readable != currently authorized; default value != permission; schema version != authority version; migration != current authorization; adjacent compatibility != transitive compatibility; old interpreter != safe interpreter; no V21; no architecture implementation; no unsupported formal/CI/fault-injection claims.

## Exact next mission
AB104.241: attack migration records and semantic transformations — malicious/incorrect migration, rollback of migration state, double migration, partial migration, concurrent migration, and proof that migration cannot create authority that did not exist in the source record.
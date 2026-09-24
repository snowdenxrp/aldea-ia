# PG-009 — Semantic / Data Migration Integrity
Date: 2026-09-23
Status: OPEN — research phase consolidated, implementation architecture pending.

## Question
Can a new Nexo version interpret historical data differently even when no bits are corrupted?

Yes. Structural/schema compatibility is weaker than semantic compatibility. A reader can successfully parse old bytes while changing the meaning of fields, units, defaults, enum values, timestamps, epistemic states, policy references, or success semantics.

## Research cross-check
Apache Avro distinguishes whether a reader schema can resolve a writer schema; compatibility can be full, partial, or incompatible. This supports treating syntactic/readability compatibility as separate from semantic correctness. citeturn0search6turn0search11

Microsoft's event-sourcing guidance describes tolerant deserialization, explicit event versioning and upcasting as strategies for evolving stored events while preserving immutable history. citeturn0search17

Research on event-sourced systems identifies versioned events, weak schema, upcasting, in-place transformation and copy-and-transform as established schema-evolution tactics, while identifying event evolution and projection rebuilding as recurring challenges. citeturn0search12

OpenStack's migration guidance separates expand, migrate and contract phases and keeps data movement separate from schema changes. Recent 2026 migration guidance independently reinforces compatibility windows during rollout and delaying destructive changes until old readers/writers are gone. citeturn0search10turn0search0turn0search5

## Critical distinction
1. BYTE INTEGRITY — bytes were not corrupted.
2. STRUCTURAL COMPATIBILITY — the new runtime can parse/read the old representation.
3. BEHAVIORAL COMPATIBILITY — the new runtime behaves consistently for relevant operations.
4. SEMANTIC COMPATIBILITY — the represented proposition/state retains the same intended meaning.
5. EPISTEMIC COMPATIBILITY — VERIFIED/OBSERVED/BELIEF/UNKNOWN/etc. retain equivalent meaning and evidence requirements.
6. POLICY COMPATIBILITY — policy identifiers/version references retain intended normative meaning.
7. AUTHORITY COMPATIBILITY — authority/capability meanings are not broadened by migration.
8. TEMPORAL COMPATIBILITY — timestamps, validity intervals, ordering and freshness retain meaning.
9. WORLD-MODEL COMPATIBILITY — entity/state/relation interpretation remains valid.
10. DECISION COMPATIBILITY — historical decisions can still be reconstructed without silently changing their authorization/evidence basis.

A migration is not safe merely because structural compatibility passes.

## Semantic Migration Contract
Every material migration must declare:
- migration_id
- source_version and target_version
- source/target schema hashes
- source/target semantic versions
- field/enum/unit mappings
- default-value rules
- null/unknown handling
- temporal interpretation
- epistemic-state mapping
- provenance preservation
- policy-reference mapping
- authority/capability mapping
- world-model mapping
- mission/checkpoint compatibility
- irreversible transformations
- information-loss declaration
- assumptions
- invariants to preserve
- golden fixtures
- differential tests
- round-trip tests where meaningful
- metamorphic/property tests
- adversarial cases
- rollback/recovery plan
- approval/authority epoch
- expiry/review
- migration status.

## Semantic preservation obligation
For source object x and migration M, require Meaning(M(x)) approximately equals Meaning(x), where the equivalence relation is defined per data class.

For security/authority/evidence-critical data, acceptable equivalence must preserve identity, scope, provenance, epistemic state, authority constraints, temporal validity, contradictions, uncertainty, policy references, and mission/resource bindings.

If equivalence cannot be established, result = MIGRATION_UNCERTAIN and it cannot silently become trusted critical state.

## Information-loss rule
Lossy migration must be explicit. Examples include milliseconds to seconds, exact coordinates to rounded coordinates, rich enum to coarse enum, multiple epistemic states to one generic state, historical policy versions to current policy, or evidence lineage to source text only.

Loss may be acceptable for bounded noncritical representation, but it must never be silently presented as lossless. For critical state: UNDECLARED_INFORMATION_LOSS → BLOCK.

## Unknown/default rule
A missing field must not automatically become a positive fact. A default must be explicitly classified as semantic default, absence/unknown, derived value, or migration assumption. UNKNOWN must remain UNKNOWN unless evidence supports promotion.

## Enum safety
Enum values are semantic identifiers, not merely integers. Numeric/ordinal reuse can silently redefine meaning. Unknown future enum values must not silently map to an existing trusted state.

## Unit and scale safety
Numeric fields require an explicit unit contract. Unit migration requires conversion, boundary and overflow tests. A numerically valid value with the wrong unit is semantic corruption even when bytes are intact.

## Temporal semantics
Migration must preserve observed_at, received_at, valid_from, valid_until, scheduled_at and causal/logical order as distinct concepts. Timezone conversion, precision reduction, clock interpretation and ordering changes can alter truth/freshness decisions.

## Epistemic migration
Nexo must never migrate UNKNOWN to VERIFIED or BELIEF to FACT merely because the target schema lacks the old state. A verified fact may become STALE under a new freshness policy without changing historical evidence.

## Policy and authority migration
Historical decisions remain tied to the policy/version that governed them. Current decisions require current policy/authority validation. An old capability such as write cannot become admin through schema/enum reuse.

## Event history
Immutable event history should normally remain immutable. Explicit version handling/upcasting can translate an older event for a current reader while preserving the original event. citeturn0search17

Semantic correction is not historical falsification. A corrective fact should be represented as a new governed event rather than silently rewriting the old event.

## Database migration protocol
Default live-store architecture:
ANALYZE → EXPAND → BACKFILL/MIGRATE → DUAL-COMPATIBILITY → VERIFY → READ SWITCH → OBSERVE → CONTRACT

Contract is blocked until no active old readers/writers remain, data completeness is proven, semantic equivalence is tested, differential comparison passes, and rollback/recovery conditions are known. This is a sequencing principle; actual implementation depends on storage technology. citeturn0search10turn0search0

## Checkpoint and memory migration
A checkpoint must bind schema version, state-machine version, policy version, authority epoch, capability version, software/runtime identity, model version, history position/root, world-model version and verification evidence.

Memory migration must preserve provenance, epistemic state, purpose, mission binding, sensitivity, freshness, contradiction links, source references and retention/deletion state.

## Differential migration testing
For representative historical fixtures:
OLD_RUNTIME(x) → old_result
NEW_RUNTIME(M(x)) → new_result
Compare results under a declared equivalence relation.

Include normal, boundary, null/unknown, malformed legacy, contradictory evidence, stale data, revoked authority, expired capability, old policy, timezone/precision, unit conversion, enum evolution, overflow, missing provenance and partially migrated cases.

## Round-trip testing
Where mathematically meaningful, test x → M(x) → inverse(M)(...) against the declared recoverable information. Non-invertible migrations must explicitly declare information loss and prove that the lost information is not required for the target assurance class.

Round-trip success alone does not prove semantic correctness.

## Metamorphic testing
Test relations that must remain true, for example:
- meters → centimeters → meters preserves value within declared tolerance;
- serialization order does not change semantic object;
- optional-field addition does not change meaning of existing fields;
- migrating UNKNOWN never produces VERIFIED;
- representation-version changes do not expand authority;
- historical policy references remain historical;
- equivalent event representations replay to equivalent state.

## Adversarial migration attacks
Test enum-value reassignment, unit confusion, default-value privilege escalation, dropped provenance, timestamp shifts, timezone manipulation, precision truncation, policy-version substitution, authority-field widening, stale-state promotion, UNKNOWN coercion, duplicate/omitted events, event reordering, malicious upcasters, migration-script supply-chain compromise, partial/mixed-version state, checkpoint rollback and semantic downgrade hidden by schema compatibility.

## New semantic migration states
CANDIDATE → MAPPING_DEFINED → SOURCE_PROFILED → TARGET_PROFILED → SEMANTIC_REVIEW → TESTED → DIFFERENTIALLY_VERIFIED → APPROVED → STAGED → MIGRATING → POST_MIGRATION_VERIFICATION → ADMITTED

Branches: BLOCKED, SEMANTIC_CONFLICT, INFORMATION_LOSS, UNKNOWN, ROLLBACK_PENDING, RECONCILING, QUARANTINED.

## New invariants
Continue canonical numbering from the existing registry.

INV-195 — byte integrity alone cannot establish semantic integrity.
INV-196 — structural schema compatibility cannot establish semantic compatibility.
INV-197 — migration must declare source and target semantic versions.
INV-198 — critical migrations preserve provenance, epistemic state, authority scope, temporal semantics and policy references.
INV-199 — undeclared information loss blocks critical admission.
INV-200 — UNKNOWN/uncertain epistemic states cannot be promoted by migration alone.
INV-201 — enum mappings must be explicit and stable; ordinal reuse cannot silently redefine trusted meaning.
INV-202 — unit/scale changes require explicit conversion contracts and boundary tests.
INV-203 — historical policy/authority references cannot be silently rebound to current semantics.
INV-204 — immutable history cannot be rewritten to hide semantic corrections.
INV-205 — mixed-version critical execution requires an explicitly validated compatibility contract.
INV-206 — checkpoint restoration requires semantic-version compatibility, not only checksum validity.
INV-207 — memory migration must preserve provenance, purpose, epistemic state, freshness and contradiction lineage.
INV-208 — critical migration admission requires differential/golden evidence appropriate to the data class.
INV-209 — a migration tool/script is itself a governed artifact with provenance and admission status.
INV-210 — migration failure or ambiguity cannot increase authority or trust.
INV-211 — lossy transformation cannot be represented as lossless.
INV-212 — post-migration verification must evaluate reconstructed meaning, not only parse success.
INV-213 — a failed migration cannot silently become the new canonical state.
INV-214 — rollback must not resurrect revoked policy, authority, capability, artifact or historical state.
INV-215 — migration semantics remain bound to the authority/policy epoch under which the migration was admitted.

## Architectural result
PG-009 is NOT CLOSED.

Nexo needs a dedicated Semantic Migration layer rather than treating migration as a subcase of schema compatibility or deployment.

Provisional architecture:
HISTORICAL DATA → SOURCE SEMANTIC PROFILE → MIGRATION CONTRACT → EXPLICIT MAPPING → TRANSFORMATION → DIFFERENTIAL/PROPERTY VERIFICATION → TARGET SEMANTIC PROFILE → POST-MIGRATION WORLD/STATE VERIFICATION → ADMISSION

Critical migration follows:
IDENTITY → AUTHORITY → CAPABILITY → GOAL → POLICY → DATA/STATE VERSION → MIGRATION CONTRACT → GLOBAL INVARIANTS → EXECUTION → VERIFICATION → COMMIT

## Remaining research
1. Formal semantic equivalence definitions for each Nexo data class.
2. Event-sourced semantic versioning and deterministic upcaster chains.
3. Database migration orchestration and crash recovery.
4. Memory/checkpoint migration with provenance-preserving transformations.
5. Policy/authority semantic compatibility.
6. Automated semantic-diff tooling.
7. Golden fixture registry.
8. Differential replay architecture.
9. Migration-specific clean recovery and rollback.
10. Formal model/property tests for INV-195..215.

## Evidence limitation
The sources establish useful migration patterns and compatibility mechanisms, but they do not prove that a generic semantic-preservation algorithm exists. Semantic equivalence is domain-specific and must be specified per data class. PG-009 remains OPEN.

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

## Research continuation — semantic equivalence as refinement
New cross-check: TLA+ treats data refinement as a formal relationship between a lower-level representation and a higher-level specification. A concrete specification can refine an abstract one when its behaviors, under an appropriate refinement mapping, satisfy the higher-level specification. Lamport explicitly distinguishes step refinement from data refinement and describes refinement mappings for implementation proofs. citeturn1search24turn1search25

### New architectural conclusion
For Nexo, semantic migration should not be defined only as a transformation from old data to new data.
It should be defined by a Semantic Refinement Relation: R(source_state, target_state, semantic_version).
The migration is acceptable only if the target state is related to the source state by the declared relation and preserves all required observable properties.
For critical data: R(S_old, M(S_old)) must hold, and the migration must preserve claim-specific observable behavior.

### Commuting-square principle
Test whether migrating the result of replaying old history is semantically equivalent to replaying the migrated history. If the two paths disagree, state = SEMANTIC_CONFLICT.
For immutable event stores, prefer immutable history plus versioned readers/upcasters over rewriting historical events. Event-upcasting material supports transforming old payloads on read while preserving historical records. citeturn0search16

### Migration algebra
Each migration declares whether it is LOSSLESS, LOSSY_BOUNDED, NON_INVERTIBLE, INFORMATION_ENRICHING, POLICY_REINTERPRETING, AUTHORITY_SENSITIVE or TEMPORALLY_SENSITIVE.
For sequential migrations M1: V1→V2 and M2: V2→V3, composition M2∘M1 is not automatically safe merely because both components are individually admitted. Composition semantics must be checked.

### Migration commutativity
If two migrations affect independent semantic domains they may be reorderable. If they overlap, order may matter.
Automatic reordering requires evidence that A∘B is semantically equivalent to B∘A for the declared relation and fixtures. Otherwise order is fixed by the migration graph.

### Semantic version is not schema version
schema_version ≠ semantic_version ≠ policy_version ≠ authority_epoch.
A schema can change without changing meaning; meaning can change without changing bytes; policy can change while representation remains identical. Critical checkpoints and migration contracts must bind these dimensions separately.

### Mixed-version state is first-class
Expand/contract research reinforces that old and new application versions can coexist and that schema compatibility alone does not guarantee data consistency. citeturn0search3turn0search9
Add states: MIXED_VERSION_SAFE, MIXED_VERSION_RESTRICTED, MIXED_VERSION_UNSAFE, MIXED_VERSION_UNKNOWN.
Critical effects are blocked in UNSAFE or UNKNOWN. Compatibility must cover every active reader/writer, including workers, projections, exports and relevant external consumers.

### Backfill is an execution process, not a script
A backfill can fail halfway, race with writes, or create stale target data.
Govern each backfill with migration_id, batch_id, source/target ranges, versions, operation_id, idempotency/retry contract, progress checkpoint, error ledger, verification policy, pause/resume and recovery action.
A completed backfill does not prove semantic completeness. Post-backfill drift must be detected or reconciled before cutover. Compatibility testing literature demonstrates that a completed backfill can become stale again. citeturn0search9

### Authority-switch principle
Changing which representation is authoritative is itself a protected transition:
OLD_AUTHORITY → DUAL_COMPATIBILITY → EVIDENCE → NEW_AUTHORITY
Required evidence includes semantic parity, active-consumer inventory, write-path compatibility, freshness, migration completeness, rollback boundary and an authority epoch transition.
Migration reaching 100 percent does not by itself authorize the cutover.

### Upcaster trust boundary
An upcaster is executable transformation logic and therefore belongs to the governed software supply chain.
It requires artifact identity/provenance, version, tests, capability scope, dependency closure, admission and rollback target.
A malicious or defective upcaster can transform trusted historical data without changing the original bytes. Therefore an upcaster is a governed transformation component, not a passive parser.

### Formalization candidate
Define Semantics_v(x) as the abstract meaning of x under semantic version v.
Migration validity: Semantics_v2(M(x)) ≈ Semantics_v1(x).
Executable behavior: Observe_v2(M(x), op_v2) ≈ Observe_v1(x, op_v1).
History: Replay_v2(Migrate(history_v1)) ≈ Migrate(Replay_v1(history_v1)).
Authority-sensitive data: Authority_v2(M(x)) must not exceed the intended authority represented by x unless an explicit authorized amendment is part of the migration contract.
For lossy migration, the contract must enumerate unrecoverable information.

### New invariants
INV-216 — semantic migration must define a source/target semantic relation for each critical data class.
INV-217 — critical migration must preserve required observable behavior under the declared equivalence relation.
INV-218 — history migration and state migration must satisfy the declared replay/commutation property where replay is applicable.
INV-219 — individually valid migrations cannot be composed automatically without checking composition semantics.
INV-220 — migrations affecting the same semantic domain cannot be reordered unless commutativity is established.
INV-221 — schema version, semantic version, policy version and authority epoch are distinct trust/version dimensions.
INV-222 — mixed-version compatibility must cover all active readers and writers, not only the primary application.
INV-223 — backfill progress does not establish semantic completeness or authority to cut over.
INV-224 — post-backfill changes must be detected or reconciled before the migrated representation becomes authoritative.
INV-225 — authority switching between representations requires an explicit protected transition.
INV-226 — upcasters/migration transformers are governed executable artifacts and require provenance/admission.
INV-227 — migration cannot silently broaden authority semantics.
INV-228 — semantic equivalence failure places migration in SEMANTIC_CONFLICT/UNKNOWN and blocks critical admission.
INV-229 — migration order is part of the semantic contract when transformations do not commute.
INV-230 — a semantic migration proof/test must identify the equivalence relation used; undefined equivalence cannot be treated as proof.

## PG-009 status after this round
PG-009 remains OPEN.
The architecture has advanced from safe schema migration to: semantic refinement + observable-behavior preservation + governed transformation + explicit mixed-version compatibility + protected authority switch.
Remaining research:
1. Define non-vacuous equivalence relations for each Nexo data class.
2. Automate semantic-diff generation without allowing the migration tool to define its own acceptance criteria.
3. Model concurrent writes during backfill.
4. Prove crash-safe resume without duplicate or skipped transformations.
5. Formally model checkpoint/memory migration in TLA+.
6. Test policy/authority migration against historical decisions.
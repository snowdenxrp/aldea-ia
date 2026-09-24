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

## Research continuation — concurrent writes, dual-read/dual-write and cutover safety

### Cross-check
Parallel Change / expand-contract is a well-established pattern: expand compatibility, migrate consumers/data, then contract only after the old path is no longer needed. Fowler also describes reversible intermediate steps and canary/parallel deployment as applications of the pattern. citeturn0search0turn0search1turn0search3

Debezium documentation provides a concrete warning relevant to Nexo: schema evolution can validate or alter structure without proving semantic compatibility, and CDC/schema-history mechanisms must preserve the schema that applied at each historical position. citeturn0search6turn0search16

### New problem: the moving-source problem
A backfill reads source state at time T0, but live writes continue at T1, T2, and later. Therefore:
BACKFILL_COMPLETE does not imply TARGET_CURRENT.
A migration must establish a convergence boundary, not merely a completion percentage.

### Migration synchronization modes
Nexo now distinguishes:
- QUIESCED_SOURCE — source writes fenced/paused.
- SNAPSHOT_BOUND — migration is bound to a consistent source snapshot/version.
- CDC_CATCHUP — changes after snapshot are captured and applied.
- DUAL_WRITE — new writes are deliberately represented in both versions.
- DUAL_READ_COMPARE — reads compare old/new semantic results without changing authority.
- SHADOW_READ — new representation is observed but not authoritative.
- CUTOVER_READY — convergence and compatibility gates satisfied.
- CUTOVER_COMMITTED — authority epoch switched.
- DRAINING_OLD — old consumers being retired.
- CONTRACTED — old representation/path removed after final verification.

No single mode is universally safest. The migration contract must choose one based on the storage consistency model and failure modes.

### Dual-write is not automatically safe
Writing both representations can introduce divergence if one write succeeds and the other fails, if transformations differ, or if writes are applied in different orders. Therefore dual-write requires:
- one canonical operation_id;
- deterministic transformation where possible;
- per-version write evidence;
- idempotency/retry contract;
- reconciliation of missing/divergent writes;
- bounded divergence state;
- no authority switch while unresolved divergence exists.

### Dual-read comparison
When both versions can answer the same query, Nexo should compare normalized semantic result, not raw serialization.
READ_OLD → normalize_old; READ_NEW → normalize_new; then normalize_old approximately equals normalize_new under the declared relation.
Mismatch classes: REPRESENTATION_DIFFERENCE, SEMANTIC_DIFFERENCE, FRESHNESS_DIFFERENCE, PROVENANCE_DIFFERENCE, UNKNOWN.
Only semantic equivalence matters for cutover, but freshness/provenance differences can make an apparent match unsafe.

### Cutover is an authority transition
The new representation must not become authoritative merely because migration coverage reaches 100%.
Required: source-consistency boundary; backfill complete; post-backfill changes caught up/reconciled; differential/shadow reads within policy; all critical consumers compatible; unresolved divergence zero for required domain; freshness bound satisfied; rollback/recovery boundary defined; authority epoch transition authorized; post-cutover verification active.

### Crash-safe migration controller
Migration state must be durable and resumable:
DISCOVERED → SNAPSHOT_BOUND → BACKFILLING → CATCHING_UP → VERIFYING → CUTOVER_PREPARED → CUTOVER → DRAINING → CONTRACTING → VERIFIED

At every state store migration_id, source/target semantic versions, source/target positions, last completed batch, operation IDs, transformation version/hash, error ledger, divergence ledger, authority epoch, policy version, verification evidence and recovery checkpoint.

After crash:
RECOVER JOURNAL → VERIFY SOURCE POSITION → VERIFY TARGET POSITION → RECONCILE IN-FLIGHT BATCHES → RESUME OR ROLLBACK/REPLAN
Never infer completed work from a process exit code alone.

### Idempotent batch rule
Each transformation batch gets a stable operation identity. Replaying a batch must either produce the same target result safely or be detected as already applied and reconciled. If neither is possible, the migration cannot claim crash-safe resumability.

### Old-path retirement
Contracting is itself a governed transition. Before deleting old fields/events/readers/upcasters: prove no active consumer depends on them; preserve historical interpretation path where required; preserve audit/recovery ability; establish a rollback floor; verify no revoked authority is resurrected by old artifacts.

Historical readability and operational support are separate: an old representation may cease to be active while remaining available to interpret immutable history.

### New invariants
INV-231 — backfill completion percentage cannot establish migration convergence.
INV-232 — active source writes require a declared synchronization strategy during migration.
INV-233 — dual-write divergence blocks critical cutover until reconciled.
INV-234 — dual-read comparison must compare normalized semantic results, not raw representation alone.
INV-235 — migration cutover is an authority transition requiring explicit authorization and epoch change.
INV-236 — crash recovery must use durable migration journal/positions rather than process-local progress.
INV-237 — replayed migration batches require idempotency or deterministic duplicate detection.
INV-238 — unresolved source/target divergence blocks critical admission.
INV-239 — old-path contraction requires consumer/dependency closure and preserved historical interpretation where required.
INV-240 — migration recovery cannot infer successful external/data effects solely from local process termination.

## Result of this research round
PG-009 remains OPEN, but the migration controller is now substantially more concrete:
PROFILE → BIND SOURCE VERSION → EXPAND COMPATIBILITY → SNAPSHOT/QUIESCE → BACKFILL → CATCH UP/DUAL WRITE → SHADOW/DUAL READ → DIFFERENTIAL VERIFY → AUTHORITY CUTOVER → DRAIN → CONTRACT → POST-CUTOVER VERIFY

The exact synchronization mechanism remains data-store-specific; Nexo's architecture must therefore model the storage consistency contract instead of assuming one universal migration technique.


## Research continuation — non-vacuous semantic equivalence and concurrency model

### Key refinement
A migration test is meaningless if its equivalence relation is allowed to be defined so loosely that every result passes. TLA+ refinement is useful here because refinement is explicitly semantic: a concrete implementation must correspond to behavior permitted by the abstract specification, rather than merely matching syntax or representation. Sources: TLA+ refinement documentation and data-refinement tutorial. 

### Semantic equivalence must be data-class specific
Nexo should not use one universal equality rule for migrated data. Each critical class gets a declared observation function and equivalence relation.

Examples:
- Identity: exact identity continuity, with no authority widening.
- Timestamp: equivalence under declared clock/precision tolerance; never silently discard causal order.
- Measurement: canonical unit conversion plus bounded numerical error and range checks.
- Claim: same proposition/scope, or explicit semantic transformation with provenance.
- Evidence: same evidentiary lineage and epistemic status; authentication alone is insufficient.
- Memory: same content meaning plus purpose, provenance, retention and sensitivity constraints.
- Mission state: same abstract mission position and obligations, even if internal representation differs.
- Policy: not ordinary data equivalence; requires policy-semantic compatibility and explicit version binding.
- Authority: non-expansion is mandatory; equivalence cannot permit a broader capability or scope.

### Non-vacuity rule
Every critical equivalence relation must define:
1. observable properties;
2. allowed normalization;
3. tolerated differences;
4. forbidden differences;
5. boundary/unknown behavior;
6. counterexamples;
7. independent acceptance criteria.

The migration implementation must not be the sole author of these criteria. Acceptance policy is owned by the migration contract / higher-level specification and verified independently.

### Three-level migration proof
For critical classes, Nexo should require all applicable levels:
A. Representation: target data is structurally valid.
B. Semantic: target abstract state refines the source abstract state under the declared relation.
C. Operational: relevant observations and decisions remain within the declared behavioral equivalence.

Passing A does not imply B; passing B does not automatically imply C.

### Concurrent-write model
During backfill, source changes create interleavings. The migration model therefore needs explicit actions for:
- source write before backfill reads an item;
- source write after backfill reads it;
- source write while transformation is in flight;
- retry after crash;
- write arriving during catch-up;
- conflicting update to a previously migrated item;
- cutover racing with a late source event.

The safe model must establish an ordering/visibility rule for every case. If an interleaving cannot be classified, it becomes UNKNOWN and blocks critical cutover.

### Linearization / snapshot boundary
For stores supporting a consistent snapshot or equivalent version boundary, the migration should bind the initial semantic state to that boundary. Subsequent writes are then handled by the declared synchronization mechanism. This converts an unbounded moving target into a bounded snapshot plus delta from snapshot to cutover.

Without such a boundary, the migration needs another explicit consistency protocol; eventual copy completion is not a semantic proof.

### Migration acceptance oracle must be external to the transformer
New architecture:
SOURCE SPECIFICATION → ACCEPTANCE RELATION → MIGRATION IMPLEMENTATION → TARGET → INDEPENDENT VERIFICATION

Not:
MIGRATION IMPLEMENTATION → its own comparison → PASS

The acceptance relation may be implemented by a separate verifier, generated from a higher-level specification, or checked through independent fixtures/models. For critical migrations, the verifier should have a different failure mode from the transformer where practical.

### New invariants
INV-241 — every critical semantic equivalence relation must be explicitly defined and non-vacuous.
INV-242 — migration code cannot be the sole authority defining its own acceptance relation.
INV-243 — structural compatibility cannot establish semantic compatibility.
INV-244 — semantic equivalence cannot be assumed to preserve operational behavior; required observations must be tested separately.
INV-245 — authority-bearing data requires non-expansion proof, not ordinary equality.
INV-246 — concurrent source writes must have an explicit visibility/order treatment during migration.
INV-247 — a migration without a defined consistency boundary cannot claim semantic convergence merely from eventual copy completion.
INV-248 — unclassified concurrent interleavings are UNKNOWN and block critical cutover.
INV-249 — critical migration acceptance requires an independent or higher-level verification relation.
INV-250 — equivalence criteria must include forbidden differences and counterexamples, not only allowed differences.

## Updated PG-009 status
PG-009 remains OPEN. The major architectural gap is now narrowed to constructing and testing the actual semantic equivalence specifications, especially for mission state, memory, policy and authority, and then expressing the concurrency protocol in a small formal model suitable for model checking. TLA+ refinement mappings are a suitable formalization direction because they relate concrete implementation behavior to an abstract semantic specification.


## Research continuation — first formal concurrency model

A first bounded TLA+ sketch was added at `docs/nexo/formal/PG-009_MIGRATION_CONCURRENCY_SKETCH_2026-09-23.tla`. It models source versions, target versions, backfill, concurrent source writes, divergence, catch-up, authority cutover and an epoch change.

Important status: this is a MODEL SKETCH, not yet a verified theorem. It has not been run through TLC in this environment. TLC is designed to explore finite-state TLA+ models and find counterexamples to invariants; refinement mappings can relate a concrete specification to a higher-level specification. citeturn0search1turn0search17turn0search18

### Formal target
The first invariant is deliberately simple:
`authority = New => migrated = Records /\\ divergence = {}`
Meaning: the new representation cannot become authoritative while required migration work or unresolved divergence remains.

The next model revision must add crash/recovery, duplicate batch replay, late writes racing with cutover, snapshot/version binding, and an explicit semantic equivalence relation. It must also make the phase progression complete; the current sketch intentionally exposes the architecture before claiming verification.

### Why the model matters
TLA+ is appropriate here because the dangerous behavior is about interleavings, not just individual functions. TLC can explore different action orderings and report counterexample traces when an invariant fails. That gives Nexo a concrete way to turn a discovered migration bug into a regression model rather than leaving it as prose.

### New invariants
INV-251 — the first formal model must distinguish model sketch from verified model.
INV-252 — a formal migration invariant is not evidence that the implementation satisfies it until the model is checked and the implementation is separately validated.
INV-253 — authority cutover must be represented as an explicit state transition in the formal model.
INV-254 — concurrent writes and catch-up must be represented as separate actions so their interleavings are model-checkable.
INV-255 — formal verification scope must state the finite bounds/model assumptions under which results hold.


## Research continuation — crash-safe resume and durable migration journal

The formal sketch was extended with an explicit `journal` and `inflight` state. The purpose is to distinguish work that was durably committed from work that was merely started before a crash.

### Recovery rule
A migration operation can be in three materially different states:
- NOT_STARTED — no durable evidence of application.
- IN_FLIGHT/UNKNOWN — execution may have begun, but durable completion is not established.
- COMMITTED — durable journal proves the migration step was recorded as completed.

Recovery must not equate IN_FLIGHT with either success or failure. It must reconcile target state and journal evidence before deciding whether to resume.

### Idempotency boundary
The durable operation identity must be established before an irreversible transformation is allowed to become externally observable. A retry with the same operation identity must resolve to the existing result or perform a demonstrably idempotent transformation.

This yields the recovery pattern:
`LOAD JOURNAL → CLASSIFY OPERATION → RECONCILE TARGET → RESUME / MARK COMMITTED / REPLAN`

### Important formal-model limitation
The current sketch is still not a verified TLA+ model. It is a design instrument. In particular, the model must still be checked for complete variable priming, action enablement, state coverage, and whether its invariants actually hold under all modeled interleavings. We must not call the invariant proven merely because it appears as a THEOREM statement.

### Next formal work
1. Remove accidental model shortcuts and make all transitions explicit.
2. Add a finite crash action that can occur at every migration substep.
3. Model duplicate/replayed operation IDs explicitly.
4. Add a target-side version and journal consistency invariant.
5. Add cutover-race actions: late write, catch-up, authority switch.
6. Add a semantic abstraction function so the target state can be compared to the source specification rather than to raw fields.
7. Run TLC and preserve every counterexample as a regression scenario.

### New invariants
INV-256 — durable completion and in-flight execution are distinct states.
INV-257 — recovery cannot infer successful migration solely from local execution termination.
INV-258 — every retry of a critical migration operation must have a stable operation identity.
INV-259 — an UNKNOWN/in-flight migration effect requires reconciliation before critical continuation.
INV-260 — formal theorem declarations are not verification evidence until the model is actually checked.


## Research continuation — cutover race found in the formal model

The concurrency model exposed a concrete architectural hazard: even if `divergence = {}` when the system enters `CUTOVER_PREPARED`, a new source write can occur before the authority switch. Because `SourceWrite` is independently enabled, the state can become:
`CUTOVER_PREPARED + migrated = Records + divergence = {r}`
followed by an unsafe `CommitCutover` that changes authority to `New` without re-checking the divergence set.

This is exactly the kind of result we wanted from formalization: the prose rule “no unresolved divergence at cutover” is insufficient unless the final transition revalidates the world/state immediately before committing authority.

### Architectural correction
Cutover must have a final serialization/fencing boundary. Conceptually:
`PREPARE → FENCE NEW SOURCE WRITES / ESTABLISH CUTOVER VERSION → REVALIDATE → COMMIT AUTHORITY`

The final commit must bind at least:
- source version / snapshot position;
- target version;
- divergence state;
- migration completeness;
- authority epoch;
- cutover token/fence;
- freshness bound.

If a late write arrives after preparation but before the commit boundary, it must either be captured by the fence/catch-up mechanism or invalidate the prepared cutover and force revalidation. It cannot silently coexist with the authority switch.

### Important consequence
This is not merely a migration concern. It is a general Nexo pattern:
**A precondition checked earlier is not enough when the protected state can change before the irreversible transition.**
The final PEP/commit boundary must revalidate the state it is about to authorize.

### Formalization status
The model is still a design sketch and has not been TLC-verified. The discovered race is a reasoning/model result, not a claim that TLC produced a counterexample. The next model revision will encode an explicit cutover fence and test whether the invariant becomes structurally enforced.

### New invariants
INV-261 — entering CUTOVER_PREPARED does not reserve the right to commit authority if protected state can change.
INV-262 — the final authority transition must revalidate migration completeness and unresolved divergence.
INV-263 — late writes between preparation and authority commit must be fenced, incorporated, or invalidate cutover.
INV-264 — cutover authorization must bind a source/target version or equivalent consistency token.
INV-265 — an earlier successful precondition check cannot substitute for final-state validation before an irreversible authority transition.


## Fence-policy analysis — late writes during cutover

Three policies were modeled explicitly:
1. **BLOCKED:** source writes are refused/frozen while the fence is active.
2. **INVALIDATE:** a late write changes the source state and invalidates `CUTOVER_FENCED`, returning the migration to a state requiring catch-up/revalidation.
3. **CATCH-UP:** the late write is admitted into the fenced path and propagated before authority commit.

The important architectural result is that these are not equivalent implementation details. The policy must be explicit and enforceable. A fourth implicit policy — accepting the write but ignoring it — is forbidden because it can make the new authoritative state semantically stale while all integrity checks still appear clean.

The safest generic contract is therefore not “always block writes,” but:
**every source mutation crossing the fence must be deterministically classified as BLOCKED, CAPTURED/CATCHED-UP, or INVALIDATING; no mutation may disappear from the consistency model.**

### New invariants
INV-266 — source mutation during a cutover fence must have an explicit disposition.
INV-267 — a mutation cannot be both accepted by the source and invisible to migration state.
INV-268 — authority cannot advance while a fence-invalidating mutation remains unresolved.
INV-269 — a blocked mutation must have an externally visible failure/retry outcome; silent loss is forbidden.
INV-270 — catch-up during the fence must preserve operation identity, provenance, ordering/causal constraints, and verification evidence.


## Cutover fence policy analysis

The formal sketch now makes the late-write policy explicit rather than leaving it implicit. Three policy families are modeled:
1. BLOCK_WRITES — source writes are rejected/frozen at the consistency boundary.
2. INVALIDATE — a late write breaks the prepared cutover and forces revalidation/catch-up.
3. CATCH_UP — the late write is incorporated into the target before authority commit.

Architecturally, the forbidden behavior is silently accepting a late source write while proceeding with an authority switch based on stale validation. The implementation must declare which fence semantics it provides and prove the corresponding invariant.

Important: the current TLA+ artifact remains a sketch and is not yet TLC-verified. The next step is to normalize the model so exactly one policy is selected, make all state variables/actions complete, and run model checking. Any counterexample becomes a regression artifact rather than being discarded.

INV-266 — cutover fence semantics are explicit, not implicit.
INV-267 — a late authoritative write cannot be silently ignored during the consistency boundary.
INV-268 — the chosen fence policy must determine the allowed state transition before authority commit.


## Research continuation — stable operation identity and retry semantics

The next subproblem is operation identity. A correct cutover fence is insufficient if a catch-up or recovery step can execute twice and create two logical effects.

### Architectural rule

Every critical migration effect receives a stable `operation_id` before execution becomes externally observable. The identity follows the operation across:
- normal execution;
- journal commit;
- retry;
- crash recovery;
- catch-up;
- fence catch-up;
- reconciliation.

A retry must not manufacture a new identity merely because the previous process instance disappeared.

### Three retry outcomes

1. **Same operation_id + same semantic payload**
   - treat as the same logical operation;
   - return/reconcile the existing result;
   - do not create a second logical effect.

2. **Same operation_id + different semantic payload**
   - this is an **IDENTITY_CONFLICT**;
   - do not guess which payload is authoritative;
   - quarantine/block the operation and prevent critical cutover until resolved.

3. **Different operation_id + apparently same semantic effect**
   - idempotency alone is insufficient;
   - the system must detect or reconcile duplicate logical effects when the effect is critical.
   - This is a semantic duplicate problem, not merely an operation-ID problem.

### Durable operation ledger

The migration journal must retain enough information to bind an operation identity to its semantic payload/result. At minimum:
- operation_id;
- migration_id;
- operation class;
- source/target identity;
- semantic version;
- payload/effect digest;
- authority epoch;
- transformation version/hash;
- execution status;
- verification evidence;
- reconciliation status.

The ledger is not merely a log of process activity. It is part of the safety boundary for replay.

### Recovery rule refinement

Recovery remains:

`LOAD JOURNAL → CLASSIFY OPERATION → RECONCILE TARGET → RESUME / MARK COMMITTED / REPLAN`

But **REPLAN** cannot silently reuse the old identity for a materially different operation, and **RETRY** cannot silently create a new identity for an uncertain critical effect. A new operation identity requires explicit evidence that the prior effect is absent or has been reconciled.

### Formal model extension

The TLA+ sketch now introduces:
- `opLedger` binding operation identity to payload;
- `appliedOps` for applied identities;
- `identityConflicts` for same-ID/different-payload attempts;
- `ReplaySame` for safe duplicate delivery;
- `ReplayConflict` for identity collision;
- explicit invariants for unique operation identity and authority blocking on unresolved identity conflicts.

Important status: **MODEL SKETCH — NOT TLC-VERIFIED.** The new actions and invariants are design material awaiting syntax/model-check validation.

### Important limitation

A unique operation ID does not prove semantic correctness. It proves only that the system can consistently identify a logical operation. The target effect still requires:
`IDEMPOTENCY → EFFECT RECONCILIATION → SEMANTIC VERIFICATION`

### New invariants

INV-271 — critical migration effects receive a stable operation identity before external observability.
INV-272 — retry/recovery of the same logical operation preserves its operation identity.
INV-273 — same operation_id with the same semantic payload must be idempotent/reconcilable, not duplicated.
INV-274 — same operation_id with a different semantic payload is an identity conflict and cannot silently overwrite prior meaning.
INV-275 — unresolved identity conflict blocks critical authority/cutover.
INV-276 — operation identity does not establish semantic correctness or truth of the resulting effect.
INV-277 — recovery cannot create a new identity for an uncertain prior critical effect without reconciliation evidence.
INV-278 — different operation IDs producing the same critical semantic effect require duplicate-effect detection/reconciliation.
INV-279 — the durable operation ledger must bind identity to sufficient semantic payload/effect metadata.
INV-280 — operation identity, journal completion and world/effect verification are distinct facts.

## Updated PG-009 status

PG-009 remains OPEN. The architecture now has an explicit operation-identity/idempotency boundary, but the formal model is still unverified and duplicate semantic effects across different operation IDs remain a research target.

## Next research point

Continue with **semantic duplicate-effect detection across different operation IDs**, then connect that result to external-effect reconciliation and the existing exactly-once/idempotency architecture.


## Research continuation — semantic duplicate-effect detection across different operation IDs

The operation-ID layer closes only the **same logical operation replay** problem. It does not close the case where two distinct operation IDs encode the same critical semantic effect.

### External cross-check

Current distributed-systems guidance supports this separation. AWS documents idempotency tokens as a way to make repeated requests with the same token safe, while also noting that retries can occur after the original mutation has already happened. citeturn0search0turn0search11 Durable-execution guidance likewise distinguishes retry/replay semantics from true end-to-end exactly-once behavior and recommends stable idempotency keys for side-effecting operations. citeturn0search9 Transactional-outbox guidance shows why downstream consumers still need duplicate handling: a relay can publish the same message more than once after a crash. citeturn0search4

These sources do **not** establish a universal semantic-duplicate detector. They reinforce the narrower conclusion: operation identity is necessary for replay safety, but semantic uniqueness of an effect is a separate contract.

### New distinction

Nexo must distinguish:

- **Operation identity** — which logical request is this?
- **Effect identity** — which semantic change to the world is intended?
- **Effect instance** — what concrete externally observable mutation occurred?
- **Effect equivalence** — when do two effects count as semantically the same?
- **Effect authorization** — was this effect permitted?
- **Effect verification** — did the intended effect actually occur?

Two operation IDs may legitimately refer to two independent effects. Therefore Nexo must not globally deduplicate merely because two requests look similar.

### Semantic Effect Key

For data classes where duplicate critical effects are forbidden, define a governed canonical key:

`effect_key = Canonicalize(domain, target, operation_class, semantic_intent, relevant_constraints)`

The canonicalization function itself is governed and versioned. It must not erase distinctions that matter to the effect.

Examples:

- creating the same unique resource twice → potentially duplicate;
- transferring the same exact amount to the same destination for the same mission obligation → potentially duplicate;
- setting a resource to an absolute desired state → often naturally idempotent;
- incrementing a counter → two identical-looking increments may be two legitimate effects and must **not** be collapsed automatically.

Therefore duplicate detection is **operation-class-specific**, not a universal hash comparison.

### Effect ledger

Critical effects should maintain a durable ledger containing at least:

- effect_key;
- operation_id(s);
- mission_id;
- target/resource identity;
- operation class;
- semantic payload digest;
- policy/authority epoch;
- capability identity/version;
- execution attempt;
- world-effect receipt;
- verification status;
- reconciliation status;
- conflict/duplicate classification.

A second operation with the same effect_key is not automatically rejected. It enters a classification step:

`NEW_EFFECT → UNIQUE`

or

`EFFECT_KEY_MATCH → RECONCILE → DUPLICATE / LEGITIMATE_REPEAT / CONFLICT / UNKNOWN`

### Unknown is blocking for critical effects

If the system cannot determine whether the first effect occurred, a second irreversible operation must not be issued blindly. The state is UNKNOWN until the world/effect ledger/reconciliation path resolves it.

This extends the existing Nexo rule:

**UNKNOWN critical effect ≠ permission to retry.**

### Semantic duplicate detector must be independent of the executor

The executor must not be allowed to define its own duplicate criteria after seeing the result. The acceptance relation is part of the governed operation contract.

Preferred chain:

`OPERATION REQUEST → EFFECT CLASSIFICATION → EFFECT KEY → POLICY/AUTHORITY CHECK → EXECUTE → WORLD OBSERVATION → RECONCILE → COMMIT EFFECT FACT`

For critical operations, the classifier and verifier should be independently reviewable and, where practical, failure-domain independent.

### New adversarial cases

The next test set must include:

1. same operation ID, same payload, replay;
2. same operation ID, changed payload;
3. different IDs, same canonical effect;
4. different IDs, semantically equivalent but differently serialized effects;
5. different IDs, same target but legitimately distinct effects;
6. effect-key collision caused by over-aggressive normalization;
7. effect-key mismatch caused by under-normalization;
8. crash after external mutation but before ledger commit;
9. ledger commit before world verification;
10. stale world observation followed by retry;
11. concurrent operations racing on the same target;
12. different authority epochs attempting apparently identical effects;
13. compensation that resembles the original effect but has different semantic intent.

### Architectural result

PG-009 now needs an **Effect Identity / Semantic Deduplication Contract** in addition to the existing Operation Identity Contract.

This contract must specify:
- which operation classes require semantic duplicate detection;
- canonicalization rules;
- fields that are semantically relevant;
- normalization tolerance;
- forbidden information loss;
- legitimate-repeat rules;
- collision handling;
- UNKNOWN handling;
- reconciliation procedure;
- world-verification requirement;
- authority/policy epoch binding;
- retention period for effect identity;
- rollback/compensation semantics.

### New invariants

INV-281 — operation identity and effect identity are distinct concepts.
INV-282 — critical operation classes requiring semantic uniqueness must define a governed effect-equivalence relation.
INV-283 — two different operation IDs cannot be treated as duplicates solely because their serialized payloads match.
INV-284 — two different operation IDs cannot be assumed independent solely because their IDs differ.
INV-285 — effect-key canonicalization must preserve every semantic distinction required by the operation class.
INV-286 — a semantic effect collision enters classification/reconciliation before critical execution is accepted as new.
INV-287 — UNKNOWN effect occurrence blocks blind retry of irreversible critical effects.
INV-288 — effect deduplication criteria cannot be silently redefined by the executor.
INV-289 — effect identity must bind to the relevant mission, target, policy/authority epoch and operation class.
INV-290 — semantic duplicate detection must distinguish legitimate repeated effects from forbidden duplicate effects.
INV-291 — effect-ledger integrity does not prove that the external world actually changed; world verification remains separate.
INV-292 — semantic deduplication is operation-class-specific and cannot be applied as a universal equality rule.

## Updated PG-009 status

PG-009 remains OPEN. We now have two distinct safety boundaries:
1. **Operation Identity / Retry Safety** — protects against replay ambiguity for the same logical operation.
2. **Effect Identity / Semantic Deduplication** — addresses different operations that may produce the same critical world effect.

The second boundary is now the next architectural layer connecting migration semantics to Nexo's existing external-effect reconciliation model.


## Research continuation — external effect uncertainty and the "effect happened, ledger did not" crash

A critical boundary now connects PG-009 with Nexo's existing External Effect Contract:

**The ledger is not the world.**

Failure window:
1. Nexo authorizes operation O.
2. External system applies the effect.
3. Nexo crashes before recording the effect as committed/verified.
4. Recovery sees no local committed result.
5. A naive recovery retries O.
6. The external system may apply O again.

Therefore absence of a local commit record is not evidence that the external effect did not occur.

### Required state distinction

For critical external operations, local state must distinguish at least:
- NOT_STARTED
- PREPARED
- SENT
- REMOTE_UNKNOWN
- REMOTE_CONFIRMED
- VERIFICATION_PENDING
- VERIFIED
- RECONCILIATION_REQUIRED
- COMPENSATION_REQUIRED
- FAILED_NO_EFFECT_EVIDENCE

REMOTE_UNKNOWN is materially different from FAILED_NO_EFFECT_EVIDENCE.

### Recovery rule

Correct recovery sequence:

LOAD DURABLE INTENT → CLASSIFY ATTEMPT → QUERY/RECONCILE EXTERNAL WORLD → CLASSIFY EFFECT → RETRY ONLY IF SAFE → VERIFY → COMMIT LOCAL FACT

Not:

NO LOCAL COMMIT → RETRY

### Four evidence planes

1. Intent evidence — what Nexo intended.
2. Execution evidence — what the gateway/runtime says it attempted.
3. External receipt — what the external system acknowledges.
4. World verification — what an independent observation says actually exists.

A receipt can be valid while still not constituting independent proof of final world state.

### Reconciliation matrix

| Local state | External observation | Allowed critical transition |
|---|---|---|
| no durable intent | no effect | new operation may be admitted |
| durable intent, no attempt | no effect | execute/retry if still authorized |
| attempt recorded | unknown | reconcile; no blind irreversible retry |
| attempt recorded | effect present | bind effect to operation and verify |
| attempt recorded | effect absent | retry only after freshness/authority/precondition checks |
| effect receipt | world differs | WORLD_MISMATCH; block final verification |
| effect present | local ledger absent | reconstruct/reconcile ledger; do not blindly repeat |
| effect ambiguous | effect ambiguous | remain UNKNOWN; escalate/replan/contain |

### External-system capability classes

Classify external targets by reconciliation strength:

- R0 — deterministic readback: external state can be queried reliably enough to identify the effect.
- R1 — idempotency-aware: target accepts a stable idempotency key and can return prior result.
- R2 — transaction/query correlation: target exposes a durable transaction identifier or equivalent.
- R3 — independently observable: effect can be verified through an independent observation path.
- R4 — weak/irreversible/no reliable readback: outcome may remain permanently UNKNOWN.

Higher reconciliation strength reduces uncertainty but does not automatically establish truth. For R4, Nexo must use stricter admission, bounded retries, compensation where possible, or human-mediated resolution rather than pretending exactly-once is available.

### Important architectural conclusion

**Exactly-once is not a universal execution primitive.**

Nexo should guarantee the strongest property supported by the target:
- exactly-once logical processing where the target provides suitable idempotency/transaction semantics;
- at-most-once when duplicate effects are unacceptable and reconciliation is impossible;
- at-least-once only when the effect is safely idempotent/repeatable;
- otherwise UNKNOWN + RECONCILIATION, not fabricated certainty.

Current distributed-systems guidance supports this bounded interpretation: AWS notes the difficulty of exactly-once behavior in distributed systems and recommends idempotency tokens for safe repeated requests; AWS Durable Execution documentation distinguishes retry semantics from an end-to-end exactly-once guarantee.

### New invariants

INV-293 — absence of a local commit record does not prove absence of an external effect.
INV-294 — REMOTE_UNKNOWN must not be collapsed into failure/no-effect.
INV-295 — critical recovery must reconcile external state before an irreversible retry when prior outcome is uncertain.
INV-296 — intent, execution evidence, external receipt and world verification are distinct evidence classes.
INV-297 — external receipt alone does not establish independently verified world truth.
INV-298 — every critical external operation declares its reconciliation capability class.
INV-299 — retry semantics must be compatible with the target's actual idempotency/reconciliation guarantees.
INV-300 — when external outcome cannot be resolved, Nexo must preserve UNKNOWN rather than fabricate success or failure.
INV-301 — exactly-once guarantees are scope-bound to the target, protocol, identity, region/domain and observation model; they are not universal.
INV-302 — operation/effect identity must survive crashes across the local/external uncertainty boundary.

## Updated PG-009 status

PG-009 remains OPEN. The migration model is now connected to the existing external-effect architecture. The key new boundary is that local durable history and external world state can diverge during a crash; recovery must reconcile rather than infer.

## Next research point

Formalize the external-effect reconciliation state machine and test crash points around:
- before send;
- after send/before receipt;
- after receipt/before local commit;
- after local commit/before world verification;
- during retry;
- during concurrent duplicate operation;
- during authority revocation;
- during external system recovery.

The next formal model must preserve the distinction between local certainty, external receipt, and world verification.

## Materiality and canonicalization boundary — 2026-09-23

Research cross-check:
- AWS IAM evaluates a request using a request context including principal, action, resources/resource data, and conditions; authorization therefore depends on the actual request context, not merely an earlier abstract approval. AWS explicitly describes action/resource/condition matching at authorization time.
- RFC 8785 shows why cryptographic hashing/signing needs an invariant canonical representation and defines deterministic JSON canonicalization. It also requires validation before acting on received canonicalized/signed data. This is useful infrastructure, but it is NOT a semantic-equivalence oracle.
- NIST SP 800-57 requires association protection: the correct keying material must be associated with the correct usage/application and related entities. For Nexo this supports binding protection, not semantic truth.

### Materiality rule
A change is MATERIAL if it can change any fact that affects authorization, risk, effect identity, target, world preconditions, safety constraints, provenance, policy interpretation, or externally observable semantics. Materiality MUST be determined by a governed contract external to the executor being constrained.

Canonicalization is split into three layers:
1. Representation canonicalization — deterministic encoding of equivalent representations.
2. Domain semantic normalization — governed transformations such as units or explicit aliases where equivalence is proven for the domain.
3. Authorization/effect canonicalization — exact fields defining security-relevant operation/effect identity. These are versioned and cannot be broadened by the executor.

A digest over a representation proves only that representation; a digest over a canonical semantic form proves agreement with that canonicalizer, not truth of the underlying claim/effect.

### Security boundary
The executor MUST NOT define or relax its own equivalence relation. A separate, versioned Canonicalization/Materiality Contract defines:
- included/excluded fields;
- normalization rules;
- units and precision;
- aliases and enum mappings;
- default/null/unknown behavior;
- target identity rules;
- effect-class rules;
- forbidden normalizations;
- semantic version;
- acceptance tests and counterexamples;
- owner/authority and review/expiry.

Unknown or ambiguous normalization is not equivalence. For critical effects, UNKNOWN equivalence blocks execution until independently resolved.

### Layered identity
Nexo should maintain separate identities where useful:
raw_payload_digest -> representation_digest -> semantic_payload_digest -> effect_key
with explicit versioning for each transformation. This prevents one overloaded hash from hiding a semantic transformation.

### Required adversarial tests
- reordered fields accepted as same representation where allowed;
- whitespace/serialization changes accepted only when canonicalization says equivalent;
- 1000 g vs 1 kg equivalent only under the declared unit contract;
- target A vs target B never equivalent merely because schemas match;
- omitted field vs explicit default must not be equivalent unless the contract proves it;
- UNKNOWN/null/absent must not silently become a positive value;
- enum remapping must be explicit and versioned;
- rounding/precision changes tested for effect-critical thresholds;
- Unicode normalization and identifier rules tested;
- over-normalization counterexamples that would merge two distinct effects;
- under-normalization cases that would falsely split one effect;
- canonicalizer version change requires re-admission for affected critical effects.

### New invariants
INV-359: materiality is defined by a governed contract, not by the executor.
INV-360: critical effect identity is computed from a versioned canonical semantic representation.
INV-361: representation normalization cannot silently change semantic/effect identity.
INV-362: unknown/ambiguous normalization is not equivalence for critical admission.
INV-363: canonicalization rules are versioned and bound to admission/execution where security-relevant.
INV-364: canonicalizer changes affecting material semantics invalidate affected critical bindings/admissions.
INV-365: canonicalization/integrity evidence does not establish truth of the underlying effect or claim.
INV-366: materiality tests include both over-normalization and under-normalization counterexamples.

Status: architecture refined; formal model still NOT TLC-VERIFIED.

## Concurrent admissions and complete conflict domains — 2026-09-23

Research cross-check:
- AWS documents optimistic locking via version + conditional writes and pessimistic locking/transactions for concurrent updates; DynamoDB transactions can provide serializable isolation within their defined scope, while other operations and cross-region replication have weaker boundaries. This demonstrates that concurrency guarantees are scope-bound to the protected state, not automatically global. 
- NIST AC-3/AC-4/AC-5 establishes access enforcement, information-flow enforcement, and separation of duties as distinct controls. For Nexo this supports treating authorization, conflict enforcement, and execution as separate enforcement responsibilities.

### Problem
Two admissions can each be locally valid while their combination violates a global invariant:
O1: reserve resource R for mission A
O2: reserve resource R for mission B
Both may have valid capability, risk, binding, and target checks. Pairwise local validity does not imply joint safety.

### Conflict-domain contract
Every critical effect declares a governed conflict footprint:
- ReadSet
- WriteSet
- EffectSet / effect keys
- ResourceSet
- InvariantSet
- ExternalSystemSet
- AuthorityDomainSet
- causal predecessors where relevant

Each dependency is classified DECLARED, OBSERVED, INFERRED, or UNKNOWN. UNKNOWN dependency is not independence.

A conflict relation is versioned and classifies pairs/sets as:
INDEPENDENT, COMMUTATIVE, ORDER_SENSITIVE, READ_WRITE, WRITE_WRITE, EFFECT_COLLISION, GLOBAL_INVARIANT_INTERACTION, COMMON_MODE, UNKNOWN.

### Admission rule
A critical concurrent admission is allowed only when at least one applicable safety mechanism is established for the complete conflict domain:
1. proven independence/commutativity;
2. target-enforced atomic transaction/conditional conflict validation covering the invariant;
3. atomic reservation/fencing over the full conflict domain;
4. durable scheduler serialization over the full conflict domain;
5. explicit human/governance decision where required.

Checking only the apparent target is insufficient if the invariant spans hidden/shared resources or common-mode dependencies.

### Pairwise is insufficient
If A conflicts with B and B conflicts with C, a scheduler that only checks a local pair can still admit a globally unsafe set. Aggregate admission therefore evaluates the active mission window, shared resources, dependency overlap, common-mode domains, cumulative exposure, and global invariants.

### Unknown dependency
If a required dependency is UNKNOWN, Nexo must not infer independence merely because the operations touch different object IDs. The result is RESTRICTED/REVALIDATION/BLOCKED according to risk class and effect guarantees.

### Conflict-control ownership
Separate authority domains:
- INVARIANT_AUTHORITY defines the invariant and its scope.
- DEPENDENCY_AUTHORITY defines/approves dependency topology.
- SCHEDULER_AUTHORITY chooses ordering only within granted authority.
- EXECUTOR_AUTHORITY performs admitted work.
- VERIFIER_AUTHORITY verifies the resulting state.

No executor may weaken an invariant or declare its own hidden dependency irrelevant.

### Concurrency and world versions
A world version/read observation is evidence of state, not automatically a write fence. For a critical effect, the target must either enforce the precondition atomically or Nexo must hold an equivalent coordination mechanism. Otherwise the world may change between admission and effect.

### Failure semantics
Conflict detection failure is not proof of independence. If conflict-domain completeness cannot be established, preserve UNKNOWN and reduce autonomy. Never convert missing dependency information into LOW risk.

### New invariants
INV-367: locally valid admissions do not imply jointly safe execution.
INV-368: critical effect admissions require a complete conflict-domain contract or an explicit bounded alternative.
INV-369: UNKNOWN dependency is not independence.
INV-370: conflict relations and dependency graphs are versioned security inputs.
INV-371: critical concurrent execution requires proven independence/commutativity, target-enforced atomic conflict control, full-domain reservation/fencing, durable serialization, or governed escalation.
INV-372: pairwise checks cannot substitute for aggregate/global invariant analysis where interactions are transitive or common-mode.
INV-373: world-version observation is not itself an execution fence.
INV-374: executor cannot weaken invariant/dependency authority.
INV-375: failure to establish conflict completeness cannot increase autonomy.
INV-376: material dependency/conflict-topology changes invalidate affected critical admissions/bindings.

Status: architecture refined; formal model NOT TLC-VERIFIED.

## Dependency-graph integrity and completeness — 2026-09-23

Research cross-check:
- NIST defines an SBOM as a formal record of components and supply-chain relationships, useful as inventory but not by itself proof of semantic completeness.
- SLSA 1.2 Dependency Provenance records how each dependency entered an ingestion environment and can link transitive dependencies through resolvedFrom. SLSA also explicitly notes that provenance verification and dependency guarantees are scoped; older SLSA material distinguishes completeness as a separate property. Therefore a signed/provenance-backed graph is not automatically a complete graph.
- SLSA provenance describes verifiable production relationships and its specifications distinguish integrity/authenticity from completeness. This directly supports Nexo's separation of graph integrity from graph completeness.

### New principle
Dependency graph integrity and dependency graph completeness are separate claims:
- INTEGRITY: the graph/edges we have recorded have not been altered and their provenance is valid.
- COMPLETENESS: all security-relevant dependencies/edges that can affect the decision are represented within the declared scope.

A graph can be perfectly authentic and still omit a hidden dependency.

### Dependency Graph Contract
Every security-relevant graph snapshot binds:
- graph_id and graph_version;
- scope/boundary declaration;
- node identities and versions;
- edge identities and relation types;
- source/provenance for each edge;
- discovery method;
- completeness claim and completeness class;
- unknown/unresolved dependency set;
- excluded/deferred dependency set with rationale;
- invariant/authority domains covered;
- tool/runtime/environment version;
- observation timestamp/freshness;
- graph hash/Merkle root and signer;
- independent verification evidence;
- expiry/revalidation conditions.

### Completeness classes
CG0 UNKNOWN — no meaningful completeness claim.
CG1 DECLARED — based on declared dependencies/configuration only.
CG2 OBSERVED — runtime/build observation captured dependencies within an observed scope.
CG3 ENFORCED — controlled boundary prevents relevant dependencies from bypassing the discovery chokepoint.
CG4 PROVEN-BOUNDED — completeness is justified for a precisely defined domain by a trusted mechanism/proof and independently verified.

These classes do not mean the graph is semantically correct; they describe completeness assurance only.

### Hidden dependency detection
Nexo should compare multiple dependency planes where applicable:
1. Declared graph
2. Resolved graph
3. Build/runtime observation graph
4. External/system-resource graph
5. Authority/invariant graph

Disagreement produces GRAPH_DIVERGENCE, not silent merge. Examples:
- declared A→B, runtime A→C;
- two components share an unmodeled external service;
- common configuration/secret/queue/database;
- environment variable, filesystem, network, clock, identity provider, policy service, or model endpoint creates a hidden dependency;
- plugin/tool dynamically loads an undeclared component.

Dynamic discovery is evidence, not automatically authoritative; the observation mechanism itself needs trust and scope.

### Decision rule
For critical concurrent admission, required conflict-domain completeness must be met for the relevant risk/effect class. If the graph is below required assurance, Nexo must use RESTRICTED, REVALIDATE, SERIALIZE, HUMAN_REQUIRED, or BLOCKED. It must never convert missing graph coverage into independence or LOW risk.

### Graph changes
A node/edge/topology change can invalidate:
- conflict analysis;
- risk profile;
- effect admission;
- execution binding;
- scheduler reservations;
- verification assumptions.

Material graph change therefore increments graph_version/epoch and triggers affected-admission revalidation.

### Independence of graph verification
The component that builds or updates the graph must not be the sole authority that declares the graph complete for a critical decision. Independent verification may use a different observation plane, build provenance, runtime telemetry, target-side metadata, or controlled replay. Independence must be assessed by failure-domain, not merely by software process identity.

### New invariants
INV-377: dependency-graph integrity does not imply dependency-graph completeness.
INV-378: completeness claims are scoped, typed, versioned, and evidence-backed.
INV-379: UNKNOWN/unresolved dependencies cannot be treated as independence.
INV-380: critical conflict admission requires the minimum graph-completeness class mandated by the effect/risk profile.
INV-381: declared, resolved, observed, and externally observed dependency graphs may diverge; divergence is a security state, not a merge instruction.
INV-382: the graph producer cannot be the sole critical authority for its own completeness claim.
INV-383: material graph topology changes invalidate affected conflict/risk/admission/binding state.
INV-384: dynamic observation is evidence whose own scope, integrity, freshness, and failure modes must be verified.
INV-385: graph integrity/completeness does not establish semantic truth of the represented dependencies.
INV-386: failure to establish required graph completeness cannot increase autonomy.

Status: architecture refined; formal model NOT TLC-VERIFIED.

## Invariant coverage and dependency-to-invariant mapping — 2026-09-23

Research cross-check:
- NIST SP 800-53 AC-4 treats information-flow control as enforcement based on information characteristics and paths, with policy enforcement at defined boundaries. This supports mapping flows/dependencies to policy-relevant constraints rather than relying only on object-level authorization. NIST also requires trustworthy enforcement mechanisms for critical filtering/inspection and describes explicit attribute binding and metadata validation. cite source: NIST SP 800-53 Rev. 5.1 AC-4
- SLSA Dependency Provenance provides evidence about dependency ingestion/provenance, but provenance is not itself a proof that every security-relevant invariant affected by a dependency has been identified. cite source: SLSA 1.2 Dependency Provenance

### Invariant Coverage Contract
For each critical invariant I, Nexo maintains a versioned coverage record:
- invariant_id/version and formal statement;
- protected state/domain;
- authoritative state owner;
- required dependency closure;
- dependency-to-invariant edges;
- assumptions/preconditions;
- enforcement points;
- observation/verification points;
- coverage assurance class;
- uncovered/unknown dependency set;
- known blind spots and failure modes;
- evidence/provenance;
- freshness/expiry;
- independent review/verification;
- affected admissions/bindings.

A dependency graph is insufficient unless Nexo can answer:
1. Which invariants can this node/edge affect?
2. Which state/resources jointly determine the invariant?
3. Where is the invariant enforced?
4. Where is it independently observed/verified?
5. What dependencies are outside the current closure?
6. What evidence justifies the closure?

### Closure
Define an invariant closure as the least governed dependency/resource/authority set required to evaluate and enforce the invariant under the declared model. The closure is not merely graph reachability: semantic rules, shared resources, common-mode services, authority domains, and hidden/global state can add edges.

### Coverage classes
IC0 UNKNOWN
IC1 DECLARED — mapping based on documented design
IC2 EVIDENCE-BACKED — supported by resolved/runtime/build evidence
IC3 ENFORCED — enforcement points cover the declared closure
IC4 INDEPENDENTLY VERIFIED — closure and enforcement verified using an independent failure domain for the declared scope

IC4 is scoped; it does not prove universal completeness.

### Coverage gap behavior
If an invariant is required for an effect and its coverage is below the required class:
- do not infer safety;
- classify UNKNOWN/UNCOVERED;
- reduce concurrency/autonomy;
- serialize/revalidate;
- escalate or block according to risk.
A dependency outside the closure that could affect the invariant is a coverage gap.

### Cross-invariant interaction
Invariants themselves can interact. For example, enforcing resource quota may affect availability, while preserving availability may conflict with isolation. Therefore coverage must include an invariant interaction graph:
- invariant nodes;
- shared state/resource edges;
- precedence/dependency edges;
- conflict edges;
- common-mode edges;
- authority ownership.

A local proof of I1 does not imply I1+I2 are jointly preserved.

### Enforcement/verification separation
For critical invariants, the component enforcing an invariant should not be the sole verifier of its preservation. Verification can use a different observation plane, state replica, target-side readback, audit evidence, or formal/runtime monitor as appropriate. This is assurance separation, not a claim that every verifier must be fully independent in all cases.

### Hidden-state challenge
The closure must explicitly account for state that is not represented as a normal resource object: global counters, budgets, leases, time, policy epochs, identity state, key/revocation state, queues, rate limits, model/tool versions, environment configuration, and shared external services.

### New invariants
INV-387: dependency coverage is insufficient unless mapped to the invariants it can affect.
INV-388: each critical invariant has a versioned coverage contract with scope and assumptions.
INV-389: invariant closure includes governed semantic/shared/global dependencies, not only graph reachability.
INV-390: required invariant coverage below threshold yields UNKNOWN/UNCOVERED and cannot authorize increased autonomy.
INV-391: invariant enforcement and verification are distinct assurance roles for critical invariants.
INV-392: invariant interactions/common-mode dependencies are included in aggregate safety analysis.
INV-393: hidden/global state is included when it can affect invariant preservation.
INV-394: material changes to invariant definition, closure, enforcement point, or verification method invalidate affected admissions/bindings.
INV-395: coverage evidence is scoped and time-bounded; stale evidence cannot silently establish current coverage.
INV-396: no single component may silently redefine an invariant's protected state or closure to make coverage appear complete.

Status: architecture refined; formal model NOT TLC-VERIFIED.


## Latest PG-009 research — invariant specification integrity

### Problem discovered

Invariant coverage is not sufficient by itself.

Nexo could have:
- a complete dependency graph;
- a declared invariant;
- a formal proof that the invariant holds;
- enforcement points;
- independent verification;

and still be proving the **wrong invariant**.

Example:

`balance >= 0`

may be perfectly proved while the real safety obligation is:

`available_balance + committed_reservations + pending_effects >= 0`

under every permitted interleaving.

Therefore:

**INVARIANT VALIDITY ≠ INVARIANT ADEQUACY.**

A proof establishes that a proposition follows from the model and assumptions. It does not, by itself, establish that the proposition faithfully captures the mission/goal or the real safety obligation.

Lamport's TLA+ material explicitly distinguishes syntactic correctness from whether a specification captures the author's intention and describes invariant checking as a practical way to expose specification errors. NASA requirements guidance independently distinguishes requirements management from requirements validation and recommends bidirectional traceability from higher-level needs through implementation and verification. NIST SP 800-53A likewise emphasizes traceability between controls and assessment procedures, while NIST AI RMF calls for objective, repeatable TEVV, documentation of limitations, and independent review where appropriate.

Sources:
- https://lamport.azurewebsites.net/tla/xmxx99-07-16.pdf
- https://www.nasa.gov/reference/6-2-requirements-management/
- https://swehb.nasa.gov/spaces/7150/pages/16449673/SWE-055%2B-%2BRequirements%2BValidation
- https://csrc.nist.gov/pubs/sp/800/53/a/r5/final
- https://airc.nist.gov/airmf-resources/airmf/5-sec-core/

### New distinction: validity vs adequacy

For an invariant `I):

1. **Syntactic integrity** — the invariant is well-formed and versioned.
2. **Model validity** — the model satisfies `I` under declared assumptions.
3. **Implementation enforcement** — the running system actually enforces the condition.
4. **Independent verification** — an independent observation/check confirms enforcement.
5. **Adequacy** — `I` actually represents the required safety/security obligation.
6. **Coverage adequacy** — the set of invariants collectively covers the relevant mission goals, hazards, failure modes and protected domains.
7. **World adequacy** — the model's abstractions and assumptions remain representative of the real operating environment.

Only the first four are properties of the proof/enforcement chain. Adequacy requires a separate validation path.

### Invariant Specification Contract

Every critical invariant must have a governed contract containing at least:

- invariant_id;
- invariant_version;
- exact formal proposition;
- natural-language interpretation;
- protected goal/objective;
- source requirement/expectation/constitution/policy;
- scope;
- population/domain;
- quantifiers;
- temporal scope;
- state variables and semantic definitions;
- protected state/resource set;
- relevant dependency/conflict closure;
- environment model;
- assumptions;
- exclusions/forbidden simplifications;
- threat/failure classes addressed;
- enforcement points;
- verification points;
- acceptance/verification relation;
- expected counterexamples;
- known non-covered cases;
- owner/authority;
- independent reviewer/validator;
- validity evidence;
- adequacy evidence;
- version/expiry/review boundary;
- affected admissions/bindings.

### Goal-to-invariant traceability

Introduce a bidirectional graph:

`MISSION/CONSTITUTION → GOAL → SAFETY OBJECTIVE → INVARIANT → PROTECTED STATE/DEPENDENCY CLOSURE → ENFORCEMENT → VERIFICATION → EVIDENCE`

and the reverse trace:

`EVIDENCE → VERIFICATION → INVARIANT → SAFETY OBJECTIVE → GOAL`

Required properties:

- every critical goal has the necessary safety invariants;
- every critical invariant traces to a legitimate higher-level obligation or an explicitly approved derived requirement;
- no critical goal is left without safety coverage;
- no orphan critical invariant exists without justification;
- trace links are versioned and reviewable;
- material changes to goals, policy, threat model or environment trigger adequacy review of affected invariants.

This follows the useful engineering principle of bidirectional requirements traceability, but Nexo extends it to safety invariants and world-state verification.

### Completeness is not proof

An invariant set can be internally consistent yet incomplete.

Therefore distinguish:

- **Invariant-set consistency** — invariants do not contradict each other under the declared model.
- **Invariant-set validity** — the model satisfies them.
- **Invariant-set coverage** — relevant goals/hazards/domains are represented.
- **Invariant-set adequacy** — the set captures the intended protection.
- **Invariant-set assurance** — coverage/adequacy evidence has independent review.

A formal proof must never be reported as "the system is safe" without specifying which invariant, model, assumptions, scope and evidence were actually established.

### Assumption firewall

Assumptions are part of the proof boundary.

For every assumption, Nexo must record:

- exact proposition;
- who/what controls it;
- whether it is enforced, observed, or merely believed;
- evidence source;
- freshness;
- failure mode if false;
- affected invariants;
- whether the model remains safe when the assumption is removed.

Critical assumptions cannot be silently supplied by the executor, model, verifier, or migration transformer.

If an assumption cannot be independently justified or enforced, the relevant assurance level is downgraded and critical autonomy may need to be restricted or blocked.

### Vacuity / trivial-proof defense

A proof can pass for an uninteresting reason.

Examples:

- the antecedent needed to reach the dangerous state is impossible only because the model accidentally excluded it;
- the protected transition is unreachable in the model;
- an assumption already asserts the invariant in disguised form;
- a quantifier/domain is empty;
- an environment action that causes the real failure is absent.

Therefore critical invariant validation must include:

1. reachability analysis for relevant states/transitions;
2. assumption audit;
3. negative-property tests;
4. known-bad-state fixtures;
5. mutation of the invariant and assumptions;
6. counterexample expectations;
7. model/environment completeness review.

A proof that succeeds only because a bad state was excluded by an unjustified assumption is not adequate evidence.

### Specification mutation testing

For each critical invariant `I), generate controlled mutations such as:

- remove a conjunct;
- weaken a bound;
- broaden/narrow a quantifier;
- remove a protected resource;
- remove a temporal condition;
- weaken an authority constraint;
- remove a dependency;
- replace a precise state with UNKNOWN/ANY;
- alter an assumption;
- remove a failure/interleaving from the environment model.

Expected behavior:

- a weakening that admits a known unsafe counterexample should be detected;
- if no known unsafe behavior becomes reachable, either the removed clause may be redundant or the test/model is incomplete;
- mutation results become regression evidence for specification adequacy.

This is stronger than merely proving the original invariant because it tests whether the specification is sensitive to the safety distinctions it claims to protect.

### Counterexample obligations

Critical invariant contracts should maintain a counterexample registry:

- `counterexample_id`;
- invariant/version;
- scenario;
- preconditions;
- expected unsafe state/effect;
- whether the model can reach it;
- expected control response;
- test/formal artifact;
- regression status.

Known real incidents, discovered attacks and prior model counterexamples become permanent specification regression cases rather than being deleted after the fix.

### Invariant adequacy states

Introduce:

`DRAFT → STRUCTURALLY_VALID → TRACEABLE → SEMANTICALLY_REVIEWED → MODEL_VALIDATED → ENFORCED → INDEPENDENTLY_VERIFIED → ADEQUACY_ASSURED`

Branches:

`BLOCKED, ASSUMPTION_CONFLICT, COVERAGE_GAP, SPECIFICATION_CONFLICT, VACUOUS, UNKNOWN, STALE`

Important: `MODEL_VALIDATED` does not imply `ADEQUACY_ASSURED`.

### New invariants

INV-397 — formal proof of an invariant does not establish that the invariant is adequate for the intended goal.

INV-398 — every critical invariant must have bidirectional traceability to the higher-level goal/requirement and to enforcement/verification evidence.

INV-399 — critical goals cannot be considered adequately covered when required safety invariants are missing or UNKNOWN.

INV-400 — critical invariants cannot become trusted merely because they are syntactically valid or formally provable.

INV-401 — invariant scope, population, quantification and temporal semantics are part of the invariant's security meaning.

INV-402 — assumptions used to prove critical invariants must be explicit, versioned, attributable and independently justified or enforced.

INV-403 — unjustified environment exclusions cannot be used to make a critical invariant trivially provable.

INV-404 — critical invariant validation must include negative/bad-state cases and relevant failure/interleaving scenarios.

INV-405 — critical invariant specifications require adequacy evidence distinct from model-validity evidence.

INV-406 — mutation/weakening of a critical invariant or its assumptions must be treated as a specification regression test.

INV-407 — known counterexamples and real failure modes remain durable regression artifacts.

INV-408 — material goal, threat-model, policy, environment or dependency changes trigger invariant adequacy re-review.

INV-409 — invariant-set coverage is distinct from dependency-graph coverage and must be evaluated against goals/hazards/protected domains.

INV-410 — no critical invariant may be its own sole authority for deciding that its specification is adequate.

### Architectural correction

The critical chain is now:

`MISSION/CONSTITUTION → GOAL → SAFETY OBJECTIVE → INVARIANT SPECIFICATION → INVARIANT ADEQUACY → INVARIANT COVERAGE → ENFORCEMENT → INDEPENDENT VERIFICATION → WORLD EVIDENCE → ADMISSION`

This closes a previously missing semantic layer.

The existing Goal Integrity Firewall remains necessary, but it is not sufficient: a goal can be legitimate while the invariant chosen to protect it is incomplete or mis-specified.

### Formalization impact

The existing TLA+ concurrency model can continue to prove operational invariants, but that proof must now be classified as **model validity evidence**, not adequacy evidence.

The formal program should eventually add a separate specification-validation layer containing:
- explicit goal/invariant bindings;
- assumptions;
- reachable bad-state fixtures;
- mutation cases;
- coverage/adequacy metadata;
- negative tests.

The operational TLA+ artifacts remain **NOT TLC-VERIFIED**. No TLC result is claimed.

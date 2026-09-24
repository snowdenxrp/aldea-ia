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

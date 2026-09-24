# NEXO — CANONICAL CONTINUITY INDEX

## Purpose
This index is the primary recovery entry point for the entire Nexo architecture, research, infrastructure design, decisions, invariants, threat analysis, assurance model, and future work.
It exists specifically to prevent loss of accumulated Nexo work across conversations, sessions, model changes, or context loss.

## Recovery rule
When asked to "retoma Nexo", "continúa Nexo", or equivalent:
1. Locate this index first.
2. Read the current canonical architecture.
3. Read the research/continuity log.
4. Identify the current open Property Gap.
5. Preserve all established distinctions, invariants, decisions and unresolved questions.
6. Continue from the recorded next research point.
7. Never rebuild from approximate conversational memory when the canonical artifacts are available.
8. If new evidence contradicts existing architecture, create a governed revision rather than silently overwriting history.
9. Save important architectural changes back into this repository.

## Canonical artifacts
1. Master architecture: docs/nexo/NEXO_MASTER_ARCHITECTURE_2026-09-23.md
2. Research continuity log: docs/nexo/NEXO_RESEARCH_CONTINUITY_LOG_2026-09-23.md
3. Preservation addendum: docs/nexo/NEXO_MASTER_PRESERVATION_ADDENDUM_2026-09-23.md
4. PG-009 research dossier: docs/nexo/PG-009_SEMANTIC_DATA_MIGRATION_INTEGRITY_2026-09-23.md

## Current state
- PG-001 Complete Mediation: architecturally closed.
- PG-002 Request/State Binding / TOCTOU: architecturally closed.
- PG-003 Sink Integrity / Effect Authenticity: architecturally closed; implementation/integration verification remains.
- PG-004 Independent Verification: architecturally closed; implementation/failure-domain testing remains.
- PG-005 Meta-verification: architecturally closed.
- PG-006 Bootstrap / First Trust: architecturally closed.
- PG-007 Continuity Across Change: architecturally closed.
- PG-008 Partial Update / Atomicity: architecturally closed.
- PG-009 Semantic/Data Migration Integrity: OPEN.

## Canonical workflow
INVESTIGATE → ANALYZE → CONTRAST → RESTRUCTURE/BUILD → VERIFY → SAVE

## Preservation principle
The objective is not merely to preserve summaries. Preserve the accumulated INFRASTRUCTURE MODEL:
- architectural layers; contracts; state machines; trust boundaries; authority model; capability model; delegation rules;
- evidence/provenance model; memory model; world model; verification model; governance model; transaction model;
- resource arbitration; distributed recovery; root of trust; bootstrap; continuity; update/rollback model;
- monitoring; adversarial monitoring; threat graph; assurance cases; property gaps; formal invariants;
- test obligations; unresolved assumptions; failure modes; recovery procedures; research conclusions;
- source/evidence dependencies; implementation status.
A future summary must never replace the detailed architecture.

## Research preservation rule
Research findings are not disposable conversation text. For each important research round, preserve:
- question investigated
- sources/evidence considered
- relevant findings
- contradictions/limitations
- architectural interpretation
- changes made
- invariants added/modified
- tests required
- unresolved uncertainty
- next research point.

## Implementation distinction
Architecturally designed does not mean implemented. Implemented does not mean verified.
Track explicit status such as CONCEPTUAL, DESIGNED, IMPLEMENTED, UNIT_TESTED, PROPERTY_TESTED, ADVERSARIAL_TESTED, FAULT_INJECTED, RECOVERY_TESTED, WORLD_VERIFIED, ADMITTED.

## History rule
Never erase an old architectural decision merely to make the current document look clean. Preserve revision history through Git commits and explicit version/date information.

## Recovery invariant
Loss of conversational context must not imply loss of Nexo's accumulated architecture.

## Current PG-009 research result
Schema compatibility is not semantic compatibility. Nexo now requires a Semantic Migration Contract, explicit semantic mappings, preservation of epistemic/provenance/authority/temporal meaning, differential and property testing, explicit information-loss handling, and post-migration verification. PG-009 remains OPEN. It now includes semantic refinement, observable-behavior preservation, migration algebra, mixed-version states, governed upcasters, protected authority switching, and invariants INV-195..230.

## Next action
Continue PG-009 research with formal semantic equivalence, deterministic upcaster chains, migration crash recovery, checkpoint/memory migration, policy/authority compatibility, automated semantic diffing, golden fixtures, differential replay, and migration-specific clean recovery. Save every material advance.

## Latest PG-009 consolidation
Concurrent-write migration is now modeled explicitly: snapshot/quiesce, catch-up/dual-write, shadow/dual-read, differential verification, protected authority cutover, durable migration journal, idempotent batches, divergence ledger, and governed old-path contraction. New invariants INV-231..240. PG-009 remains OPEN.

## Latest PG-009 research — semantic equivalence
PG-009 now requires non-vacuous, data-class-specific equivalence relations; independent acceptance criteria; representation/semantic/operational proof levels; explicit concurrent-write interleavings; consistency boundaries; and an acceptance oracle external to the migration transformer. New invariants INV-241..250. PG-009 remains OPEN.

## Latest PG-009 formalization
First TLA+ concurrency model sketch added at `docs/nexo/formal/PG-009_MIGRATION_CONCURRENCY_SKETCH_2026-09-23.tla`. It models backfill, concurrent writes, divergence, catch-up and authority cutover. It is explicitly NOT YET VERIFIED by TLC. New invariants INV-251..255. Next: make the model complete, add crash/recovery and semantic refinement, then model-check it.

## Latest PG-009 formal recovery work
The TLA+ sketch now includes durable journal/in-flight distinction and recovery actions. PG-009 adds INV-256..260. The model remains explicitly unverified until TLC/model review is actually run.

## Latest PG-009 finding — cutover race
Formal reasoning exposed a concrete race: after CUTOVER_PREPARED, a late source write can create divergence before authority commit. The architecture now requires a final cutover fence plus revalidation. Added INV-261..265. Formal model remains unverified; next step is to make the fence a complete state transition and model the allowed late-write behavior.

## PG-009 current subproblem: fence disposition
Three explicit late-write policies are now modeled: BLOCKED, INVALIDATE, and CATCH-UP. Silent acceptance/ignore is prohibited. Every mutation crossing the fence must be classified and remain visible to the consistency model. PG-009 remains open.

## PG-009 formal verification runbook
Added `docs/nexo/formal/PG-009_TLC_RUNBOOK.md` with the bounded TLC configuration, commands, evidence rules, and verification matrix. Current status is explicitly NOT RUN: Java 21 is available in the working environment, but tla2tools.jar is absent and outbound download is unavailable. No TLC result is claimed.


## Latest PG-009 — operation identity and retry safety
The formal model now includes stable operation identities across backfill/catch-up/recovery, an operation ledger, replay handling, and same-ID/different-payload identity conflicts. New invariants INV-271..280. This is still a MODEL SKETCH and is NOT TLC-verified. Operation identity prevents one class of duplicate/retry ambiguity but does not prove semantic correctness; different operation IDs can still produce the same critical effect.

## Next PG-009 action
Research semantic duplicate-effect detection across different operation IDs, then connect it to external-effect reconciliation and the existing exactly-once/idempotency architecture.


## Latest PG-009 — semantic duplicate effects
Operation identity is now explicitly separated from effect identity. A different operation ID can still represent the same critical semantic effect, while identical-looking effects can also be legitimate repeated operations. Added the Effect Identity / Semantic Deduplication Contract and invariants INV-281..292. Research cross-check uses current distributed-systems idempotency/retry guidance. The model remains NOT TLC-verified.

## Next PG-009 action
Formalize effect identity and reconciliation, including legitimate repeats, semantic collisions, UNKNOWN external effects, and binding to the existing external-world verification layer. Do not claim universal exactly-once semantics.


## Latest PG-009 — external-effect uncertainty
PG-009 now connects operation/effect identity to the External Effect Contract. A local missing commit cannot prove that an external effect did not occur. Added REMOTE_UNKNOWN, reconciliation capability classes R0-R4, evidence-plane separation, bounded exactly-once semantics, and invariants INV-293..302. The formal model remains NOT TLC-verified.

## Next PG-009 action
Formalize external-effect reconciliation and crash interleavings: before send, after send/before receipt, after receipt/before local commit, after local commit/before world verification, retry, duplicate operation, revocation, and external recovery.

## Latest PG-009 formal artifact
Added docs/nexo/formal/PG-009_EXTERNAL_EFFECT_RECONCILIATION_SKETCH_2026-09-23.tla (commit ac0b3a8c729106d67e74918099282093c0f33290).
It models the local/external uncertainty boundary, including crash-before-ledger, REMOTE_UNKNOWN, reconciliation, receipt vs world observation, and revocation. NOT TLC-VERIFIED.

## Next PG-009 refinement
Extend the model to multiple operations/effects sharing targets or effect keys, legitimate repeated effects, semantic collisions, stale observations, and an explicit forbidden blind-retry transition.

## Latest PG-009 concurrency artifact
Added `docs/nexo/formal/PG-009_EFFECT_IDENTITY_CONCURRENCY_SKETCH_2026-09-23.tla` (latest syntax-normalization commit `362adec22b85eb7550d32c4eabf639509ad427cd`). It models multiple operations and effect-key collisions. **NOT TLC-VERIFIED.**

## Next refinement
Strengthen concurrent uniqueness/fencing and separate the independent acceptance relation from executor state. Same effect key across different operation IDs remains a collision candidate requiring classification, not automatic deduplication.

## Latest PG-009 refinement
Atomic reservation + authority epoch was added to PG-009_EFFECT_IDENTITY_CONCURRENCY_SKETCH_2026-09-23.tla (commit 2a24cdfcad3d5ddbe6e13d796bf15cb0d9ec1fe3). The reservation boundary must be atomic; executor-side check-then-set is insufficient. Reservations are epoch-bound and invalidated by revocation/epoch change. External unknown outcomes remain reconciliation state. **NOT TLC-VERIFIED.**

## Latest PG-009 refinement
Execution Reservation and Reconciliation Lease are now explicitly distinct in the formal sketch (commit 1c8014aff3e10cdcdba65a1d42f839649ceaf46e). Reconciliation ownership is atomic and fenced; expiry transfers coordination only after a fresh reconciliation boundary and does not imply effect absence. **NOT TLC-VERIFIED.**

## Latest PG-009 refinement
Added world-version / execution-fence semantics to the formal sketch (commit dd722aafc9dfeadc4e7395721949d413f0124162). A target-local version is evidence, not automatically a hard fence; critical execution requires a target-enforced conditional/CAS transition where supported. Version mismatch causes STALE_PRECONDITION and revalidation/replanning. **NOT TLC-VERIFIED.**

## Latest PG-009: stale-precondition and retry/replan refinement
A stale world version now invalidates the execution assumption while preserving mission lineage. The architecture distinguishes same-operation retry, same-mission replan, and genuinely new operation. A new operation ID cannot be used to evade effect-deduplication. Target consistency guarantees are recorded as operation-specific capability classes C0-C4; a read/version token is not itself an execution fence. Formal commit: 7144e2b56424ebed3b639e89a0958b05d6be289c. **NOT TLC-VERIFIED.**

## Latest PG-009: global conflict / serialization
Added global conflict classes and the rule that pairwise-valid concurrent operations do not automatically form a globally valid execution. Critical operations require proven independence/commutativity, target-side transaction guarantees that cover the invariant, atomic reservation of the complete conflict domain, or durable serialization. Database serializability does not automatically prove external-world/application invariants. Formal commit: 10b98bd451678c787d7cf78d46b45c941d589114. **NOT TLC-VERIFIED.**

## Latest PG-009: dependency completeness / hidden conflicts
The formal model now treats dependency completeness as an assurance property. Dependencies are DECLARED, OBSERVED, INFERRED, or UNKNOWN; critical operations carry read/write/effect/resource/invariant/external-system/authority/causal footprints. Missing edges cannot be treated as proof of independence. Common-mode dependencies can connect operations with different resource IDs. Versioned dependency graphs and invariant ownership are required; incomplete graphs lead to UNKNOWN/quarantine or conservative serialization. Formal commit: 40219c636903c46565a486dd784c65ec4fd056cf. **NOT TLC-VERIFIED.**

## Latest PG-009: invariant/authority separation
Invariant, dependency, scheduler, executor, and verifier authority are now explicitly separated. Critical invariant definitions are governed/versioned outside the executor; material changes trigger re-admission of affected operations. Scheduler priority never increases authority, and verification cannot retroactively authorize an effect. Formal commit: 46e221e4acb2759801724bc0b14b4d1696e12487. **NOT TLC-VERIFIED.**

## Latest PG-009: policy/invariant version transition
A material policy/invariant change is now a governed boundary for in-flight work. New admissions use the new rule; prepared/in-flight effects are classified for revalidation, draining, cancellation where genuinely supported, reconciliation, or quarantine. Irreversible effects are not assumed cancellable or rollback-safe. Transition fencing binds policy/invariant version, authority epoch, operation/effect identity, and world/precondition boundary. Formal commit: b55f40fc9000dfcee979ce9608ce4a4061f83a9b. **NOT TLC-VERIFIED.**

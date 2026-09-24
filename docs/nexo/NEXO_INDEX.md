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

## Latest PG-009: policy change during remote uncertainty
Formalized the case where an old-policy operation becomes REMOTE_UNKNOWN while policy/authority changes. Historical authorization remains immutable; only current authority governs new recovery actions. No blind retry, old-authority continuation, retroactive authorization, or identity substitution. If the old effect is prohibited now, reconciliation/containment can still be required because policy does not erase world state. Autonomy cannot increase during this uncertainty. Formal commit: 862cf0bebe412bc5318f77fe75c58de99d5f6546. **NOT TLC-VERIFIED.**

## Latest PG-009: continuous-epoch reconciliation / ABA
Reconciliation is now treated as critical authorized work that can itself become stale. Recovery commits require current fencing/ownership, authority and policy versions, dependency graph, world/precondition version, and sufficient fresh evidence. Lease expiry transfers coordination, not knowledge. A→B→A state cycles are not treated as no change; versions/epochs/causal positions are required. Repeated transitions may yield RECONCILIATION_UNSTABLE/BLOCKED with bounded retries and escalation. Formal commit: 8296d83cd7e384c588d2329789653f17637107f1. **NOT TLC-VERIFIED.**

## Latest PG-009: atomic reconciliation commit / stale-owner race
Critical reconciliation commits now require an atomic authoritative conditional transition covering fence/ownership, authority epoch, policy applicability, effect identity, world preconditions, and evidence sufficiency. Lease expiry alone is insufficient; stale owners must fail the conditional commit. Ownership transfer preserves history, and ABA requires generation/fencing tokens. Coordination-store atomicity does not imply external-world atomicity. Invariants INV-303..309. Formal commit: 250e2c643295cfb307dedd829ab0ebea9159e308. **NOT TLC-VERIFIED.**

## Latest PG-009: external world-version / conditional-effect boundary
World versions are now explicitly classified by what the external target enforces. C0=no reliable fence, C1=observable evidence only, C2=atomic conditional/CAS, C3=transactional conflict validation/serializable, C4=stronger external ordering. Nexo cannot manufacture a remote fence from a local observation. Critical operations must match their guarantee to the target class; stale-precondition rejection triggers revalidation/replan. Successful conditional mutation remains distinct from broader world verification. Invariants INV-310..314. Formal commit: dcaf4fbf15ef586c787e3b0b8f9ede68d65cc968. **NOT TLC-VERIFIED.**

## Latest PG-009: guarantee budget / C0-C4 target capability
Nexo now bounds every guarantee claim by the external target's actual protocol and scope. C0/C1 cannot gain C2-style safety from local orchestration. C2 supplies target-local conditional semantics; C3 transactional conflict validation within its transaction boundary; C4 remains scope-bound rather than universal exactly-once. Idempotency + reconciliation + compensation cannot manufacture atomicity. Compensation is a new effect requiring fresh authority and its own verification/reconciliation. Invariants INV-315..319. Formal commit: 17f2302858cac750f107e288eedda3f3d1591bbb. **NOT TLC-VERIFIED.**

## Latest PG-009: risk-aware effect admission
Effect admission now depends on a governed effect profile: risk/consequence, likelihood, reversibility, observability, target consistency C0-C4, duplicate hazard, blast radius, authority criticality, and compensation quality. Admission states: ADMIT, RESTRICTED, HUMAN_REQUIRED, BLOCKED. Increased uncertainty/risk/blast radius/loss of reversibility cannot silently increase autonomy. Authorization remains mandatory regardless of risk. Retry budgets are bounded and owned by one retry layer with backoff/jitter. Model confidence never substitutes for authorization, target enforcement, or world verification. Invariants INV-320..327. Formal commit: 2b91f28bb0112004e2ff495d3097addb8ba7c983. **NOT TLC-VERIFIED.**

## Latest PG-009: risk classification integrity
Risk classification is now a governed security input. RiskProfile binds effect identity/scope, consequence/likelihood, reversibility, observability, target class, blast radius, authority criticality, provenance, classifier/policy versions, and expiry. Untrusted or ambiguous inputs cannot silently lower risk; unknown dependencies do not count as independence. Material effect/scope/dependency/policy changes trigger reclassification. High/critical classification is independently reviewable from execution, and components without risk authority cannot reduce required guarantees. Invariants INV-328..335. Formal commit: 5b57e3aeae9a15049edcf40cfbd1f464edf2176e. **NOT TLC-VERIFIED.**

## Latest PG-009: compositional/cumulative risk
Risk is now evaluated over interacting operations, not only isolated labels. Mission-window aggregate state tracks cumulative exposure, shared resources/authority, dependency overlap, common-mode domains, global invariants, retry load, unknowns and temporal window. Interaction classes distinguish independent/commutative/order-sensitive/contention/collision/global/common-mode/unknown. Unknown dependencies cannot be assumed independent; decomposition cannot bypass a parent guarantee envelope. Aggregate budgets may freeze new admissions and trigger reclassification. Retry traffic contributes to exposure. Invariants INV-336..343. Formal commit: 8fc845ee3c2936a2dbcc7d083d93bb64a5a7263b. **NOT TLC-VERIFIED.**

## Latest PG-009: dynamic risk drift
Admissions are now bounded by explicit admission epochs and revalidation deadlines. Material world/policy/authority/dependency/target/risk/evidence drift invalidates future critical execution until revalidated. Historical authorization remains immutable history but does not grant future authority. In-flight irreversible external effects are not assumed cancellable. Admission renewal is a new decision, and repeated instability can become REVALIDATION_UNSTABLE/BLOCKED. Invariants INV-344..350. Formal commit: d35f78faf8c52188d1103c8db766f7393f26afa8. **NOT TLC-VERIFIED.**

## Latest PG-009: admission-to-execution binding
Critical effects now require an explicit Execution Binding that ties admission to the exact execution context: operation/effect/payload/target/capability/policy/authority/risk/dependency/world precondition plus admission epoch and relevant tool/environment identity. The enforcement gateway recomputes/verifies this binding; material mismatches fail closed. Integrity/signature does not prove semantic truth. TOCTOU revalidation must converge on the exact binding consumed. Invariants INV-351..358. Formal commit: 6fe29c5f30b45e0644e8d7c935e1209752ad41db. **NOT TLC-VERIFIED.**

## Latest PG-009: materiality and canonicalization boundary
Materiality is now governed externally to the executor. Canonicalization is split into representation normalization, domain semantic normalization, and security-relevant authorization/effect canonicalization. Critical equivalence cannot be broadened by the executor; unknown/ambiguous normalization blocks. Layered identity: raw payload -> representation digest -> semantic payload digest -> effect key, with versioning. New invariants INV-359..366. Architecture commit: 074b1eb9ac7572b6653c075dc08db158ad2778e. **NOT TLC-VERIFIED.**

## Latest PG-009: concurrent admissions and complete conflict domains
Locally valid admissions may be jointly unsafe. Critical effects now require a governed conflict footprint and versioned dependency/conflict relation. UNKNOWN dependencies are not treated as independence. Safe concurrency requires proven independence/commutativity, target-enforced atomic conflict control, full-domain reservation/fencing, durable serialization, or governed escalation. Pairwise checks are insufficient for transitive/common-mode interactions. New invariants INV-367..376. Architecture commit: 6c9121c2f92749b975ba151d23e332e6b12f2df6. **NOT TLC-VERIFIED.**

## Latest PG-009: dependency-graph integrity and completeness
Graph integrity and graph completeness are now separate claims. Nexo defines scoped completeness classes CG0 UNKNOWN through CG4 PROVEN-BOUNDED, with required class depending on effect/risk. It compares declared, resolved, runtime/build, external/system-resource, and authority/invariant dependency planes. Divergence is GRAPH_DIVERGENCE, not silently merged. Material topology changes invalidate affected conflict/risk/admission/binding state, and the graph producer cannot be sole critical authority for completeness. New invariants INV-377..386. Architecture commit: 03ab3447dadda4f8444a1b4ff47683d81c38f1. **NOT TLC-VERIFIED.**

## Latest PG-009: invariant coverage
Dependency graphs now require explicit mapping to the invariants they can affect. Each critical invariant gets a versioned Invariant Coverage Contract with protected state, closure, enforcement/verification points, assumptions, evidence, freshness, and blind spots. Coverage classes IC0 UNKNOWN through IC4 INDEPENDENTLY VERIFIED. Closure is semantic/governed rather than mere graph reachability; hidden/global state and invariant interactions are included. New invariants INV-387..396. Architecture commit: ca475c7d24ea989111bafa678f882c09ae1dac52. **NOT TLC-VERIFIED.**


## Latest PG-009 — invariant specification integrity

Current OPEN subproblem: prevent Nexo from formally proving an invariant that is valid in its model but does not adequately represent the real goal/safety obligation.

New separation:
- invariant validity;
- invariant enforcement;
- invariant verification;
- invariant adequacy;
- invariant-set coverage/adequacy.

New contract: **Invariant Specification Contract**.
New traceability chain:
`MISSION/CONSTITUTION → GOAL → SAFETY OBJECTIVE → INVARIANT → PROTECTED STATE/CLOSURE → ENFORCEMENT → VERIFICATION → EVIDENCE`

New controls:
- assumption firewall;
- vacuity/trivial-proof defense;
- bad-state/counterexample registry;
- specification mutation testing;
- bidirectional goal/invariant/evidence traceability;
- independent adequacy review.

New invariants: INV-397..410.

PG-009 remains OPEN. Existing TLA+ artifacts remain **NOT TLC-VERIFIED**.
Next: investigate invariant completeness/adequacy under evolving goals and threat models, including hazard derivation, assumption invalidation and independent specification review.


## Latest PG-009 — invariant completeness under evolving hazards

Nexo now distinguishes invariant validity, adequacy, set completeness, consistency and assurance. New Hazard-to-Invariant Derivation: MISSION/GOAL → HAZARD/FAILURE MODE → SAFETY OBJECTIVE → REQUIRED PROPERTY → INVARIANT → ENFORCEMENT → VERIFICATION. Completeness is cross-checked across independent planes: mission/constitution, threat/failure models, dependencies/conflicts, incidents/counterexamples, environment assumptions, world observations, policy/authority, runtime behavior and adversarial scenarios.

Coverage states: COVERED, PARTIALLY_COVERED, MITIGATED_BY_EXTERNAL_CONTROL, ACCEPTED_RESIDUAL_RISK, UNKNOWN, BLOCKED. New assurance classes HC0..HC5. New invariants INV-411..422.

PG-009 remains OPEN. TLA+ remains NOT TLC-VERIFIED. Next: assumption validity and environment-model completeness.

## Latest PG-009 — assumption validity and environment-model completeness

Critical assumptions are now governed objects rather than invisible model text. New Assumption Contract binds scope, provenance, evidence, observation/enforcement, freshness, invalidation and response. New Environment Model Contract explicitly represents boundaries, external actors, trust boundaries, failure modes, timing, concurrency, recovery and unobservable state.

Assurance classes A0 UNKNOWN through A5 CONTINUOUSLY_MONITORED. New defenses: assumption-to-control binding, boundary completeness, assumption drift, circular-assurance detection, environment-model mutation testing and evidence freshness.

New invariants INV-423..435.

PG-009 remains OPEN. TLA+ remains NOT TLC-VERIFIED.
Next: observability completeness and epistemic boundary integrity.

## Latest PG-009 — epistemic state transitions and uncertainty propagation

Uncertainty is now modeled as a durable state rather than a confidence number. New Epistemic State Contract preserves proposition, scope, provenance, freshness, assumptions, conflicts, verification method and dependencies.

Core rule: no increase in epistemic assurance without an admissible evidence transition. UNKNOWN, CONFLICTING, STALE and PARTIAL critical inputs must propagate conservatively or trigger block/escalation.

New contradiction handling, uncertainty budgets, epistemic dependency lineage and recovery semantics.

New invariants INV-449..464.

PG-009 remains OPEN. TLA+ remains NOT TLC-VERIFIED.
Next: epistemic closure and decision-theoretic action under uncertainty.

## Latest PG-009 — epistemic closure and decision-making under uncertainty

Nexo now distinguishes certainty from decision sufficiency. A decision need not know everything; it must establish the material knowledge closure required for that specific effect and risk envelope.

New Decision Sufficiency Contract, bounded residual uncertainty, robustness checks, value-of-information reasoning, governed information gathering, D0-D4 decision classes, anti-paralysis and anti-recklessness controls.

New invariants INV-465..480.

PG-009 remains OPEN. TLA+ remains NOT TLC-VERIFIED.
Next: epistemic memory and provenance under compression, summarization, caching and retrieval.

## Latest PG-009 — epistemic memory and provenance under compression

Memory compression is now treated as a semantic transformation. Critical memory must preserve epistemic state, provenance, scope, freshness and reverse traceability. Authoritative records are separated from derived memory, caches, summaries and embeddings.

New Epistemic Memory Contract, provenance DAG, transformation classes M0-M4, cache safety, conflict preservation and governed deletion.

New invariants INV-481..498.

PG-009 remains OPEN. TLA+ remains NOT TLC-VERIFIED.
Next: epistemic memory garbage collection, retention and safe forgetting.

## Latest PG-009 — safe forgetting and epistemic garbage collection

Nexo now distinguishes working, episodic, semantic, evidentiary, obligation and constitutional/historical memory classes. Forgetting is explicit: eviction, archive, summary, redaction, tombstone, crypto-erasure and destruction.

New Obligation Firewall, dependency-aware garbage collection, protected GC roots and durable disposition events. Loss of critical evidence is an assurance downgrade, not proof of non-occurrence.

New invariants INV-499..516.

PG-009 remains OPEN. TLA+ remains NOT TLC-VERIFIED.
Next: identity/continuity across forgetting, restore, snapshot/branch/fork and model replacement.


## Latest PG-009 — identity and continuity

Continuity is now explicitly separated into identity, history, memory, software/model, policy, authority, trust and world dimensions. Restore/fork/merge/model replacement cannot silently inherit authority.

New Continuity Contract, classes C0-C4 and invariants INV-517..538.

PG-009 remains OPEN. TLA+ remains NOT TLC-VERIFIED.
Next: succession and human relationship continuity.


## Latest PG-009 — succession and human relationship continuity

Nexo now separates human identity, operational authority, recovery authority, succession authority, emergency authority and technical possession. Recovery does not imply succession; device possession does not prove ownership; successor authority is bounded by explicitly transferable authority and current policy.

New Human Relationship Contract and invariants INV-539..556.
PG-009 remains OPEN. TLA+ remains NOT TLC-VERIFIED.
Next: delegated human intent and consent continuity.


## Latest PG-009 — delegated human intent and consent continuity

Nexo now separates direct instruction, preference, standing authorization, temporary delegation, conditional authorization, consent, inferred intent and ambiguity. Authentication does not equal authorization; inferred intent cannot create authority; critical ambiguity blocks; delegations are scoped/expiring/revocable; material context drift triggers revalidation.

New Intent Contract and invariants INV-557..576.
PG-009 remains OPEN. TLA+ remains NOT TLC-VERIFIED.
Next: human override/interruption/revocation during active execution.


## Latest PG-009: human override, interruption and revocation
Human STOP/revocation is now a first-class authority boundary. Nexo separates revoking future authority, local interruption, queued cancellation, remote cancellation request, remote cancellation confirmation, world reconciliation and verified termination. STOP does not erase in-flight effects; UNKNOWN after STOP blocks blind retry; compensation is a fresh governed effect. Emergency stop must be independently governed from the executor it can stop. New invariants INV-577..592. Architecture remains NOT TLC-VERIFIED.
Next: independent emergency-stop architecture and fail-safe/fail-operational boundaries.


## Latest PG-009 — independent emergency-stop architecture

Nexo now separates the Emergency Safety Plane from ordinary execution, authority/revocation, actuation, and observation/reconciliation. The emergency-stop architecture defines E0-E4 enforcement classes, explicit fail-safe/fail-operational/UNKNOWN semantics, an EmergencyStopContract, common-mode dependency analysis, sticky critical release, anti-bypass rules, and fault-injection obligations.

New formal artifact: `docs/nexo/formal/PG-009_EMERGENCY_STOP_SKETCH_2026-09-23.tla`. It remains **NOT TLC-VERIFIED**.

New invariants INV-593..610.

## Latest PG-009 — emergency-stop observability and proof of enforcement

Research cross-check with NIST AI RMF and 2026 deployed-AI monitoring work, NIST SP 800-53 monitoring/independent-assessment controls, NASA IV&V objective evidence, and ISO 13850 as a machinery-only design analogy. NIST emphasizes monitoring and human intervention for AI safety; NIST and NASA distinguish ongoing/independent assessment and objective evidence from mere component self-report. These sources support the architecture but do not constitute proof of Nexo safety. citeturn0search48turn0search12turn1search48turn1search1turn0search0

New artifact: `docs/nexo/PG-009_EMERGENCY_STOP_OBSERVABILITY_2026-09-23.md`.

New evidence ladder:
`STOP_REQUESTED → STOP_DELIVERED → STOP_ACCEPTED → STOP_ENFORCED → ENFORCEMENT_VERIFIED → WORLD_RECONCILIATION`.

Critical distinction: executor ACK, process exit, missing heartbeat, absent logs, or timeout do not by themselves prove enforcement at the protected boundary.

New Proof-of-Enforcement Contract binds stop_id, scope, gate identity/epoch, observer, dependency/common-mode domain, freshness, verification method, provenance, applicable authority/policy/configuration and declared control boundary.

New invariants INV-611..628.

Formal sketch was refined to remove the unsafe failed-gate release transition, separate emergency authority from ordinary execution authority, distinguish revocation from actual enforcement, and model independent gate observation plus enforcement verification. It remains **NOT TLC-VERIFIED**.

PG-009 remains OPEN. Next: recovery/restart fencing after emergency stop, then safety-plane update/rollback and bootstrap trust, common-mode/correlated-failure analysis, and actual TLC verification.


## Latest PG-009 — recovery/restart fencing
Restart is not release. Emergency STOP now creates a durable recovery fence. Stale processes, capabilities, leases, checkpoints and queued work cannot regain critical authority merely by restarting. Recovery ownership is separately fenced and current authority/epochs/world conditions are revalidated before explicit release. New invariants INV-629..648.

Artifacts: docs/nexo/PG-009_RECOVERY_RESTART_FENCING_2026-09-24.md; docs/nexo/formal/PG-009_RECOVERY_RESTART_FENCING_SKETCH_2026-09-24.tla; docs/nexo/NEXO_CONTINUITY_DELTA_2026-09-24_RECOVERY_FENCING.md.
Status: DESIGNED; formal sketch NOT TLC-VERIFIED.

## Latest PG-009 — safety-plane update / rollback / bootstrap trust
Safety-plane update is now treated as a security transition rather than ordinary deployment. UPDATE AUTHENTICITY != UPDATE AUTHORIZATION; PROVENANCE != SAFETY; SIGNATURE VALIDITY != SEMANTIC COMPATIBILITY; ROLLBACK != TIME TRAVEL. Critical updates require digest binding, provenance/attestation verification, dependency closure, semantic/policy compatibility, independent admission, staged activation, control-plane verification, world/reconciliation checks and protected recovery. New invariants INV-649..668.

Research cross-check: NIST SP 800-193, SLSA 1.2, GitHub Artifact Attestations and Sigstore Policy Controller. These support the architectural pattern but do not prove Nexo safety.

Artifacts: docs/nexo/PG-009_SAFETY_PLANE_UPDATE_ROLLBACK_BOOTSTRAP_2026-09-24.md; docs/nexo/NEXO_CONTINUITY_DELTA_2026-09-24_SAFETY_PLANE.md.
Status: DESIGNED / RESEARCH-CROSS-CHECKED; implementation and TLC verification not claimed.

## Current PG-009 next action
Common-mode/correlated-failure analysis across safety, recovery, update, identity, storage, network, policy, verifier and executor domains; then correct/expand formal models and run TLC when tooling is available. Reconcile canonical documentation without erasing history.

## Latest PG-009 — common-mode / correlated-failure analysis
Process/service separation is not independence. Critical safety claims now require dependency closure, failure-domain analysis, common-mode analysis, diversity/independence evidence and an explicit assurance level. UNKNOWN dependency is not NO dependency. Evidence from shared sources is not automatically independent. New invariants INV-669..690.

Artifact: docs/nexo/PG-009_COMMON_MODE_CORRELATED_FAILURE_2026-09-24.md
Continuity checkpoint: docs/nexo/NEXO_CONTINUITY_DELTA_2026-09-24_COMMON_MODE.md
Status: DESIGNED / RESEARCH-CROSS-CHECKED; implementation, fault injection and TLC verification not claimed.

Current PG-009 next action: correct/expand recovery TLA+, add dependency/failure-domain state, model update/rollback transitions, define executable safety-claim/dependency-closure schema, implement fault injection, run TLC, then final semantic reconciliation.

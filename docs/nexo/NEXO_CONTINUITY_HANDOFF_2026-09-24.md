# NEXO — CONTINUITY HANDOFF / PERSISTENT CONTEXT

Date: 2026-09-24
Status: RESEARCH + CLEAN ARCHITECTURE DESIGN ONLY
Implementation: BLOCKED. No V21. No runtime construction until research, distillation, gap audit and evidence/observability closure gates are complete.

## 1. Non-negotiable sequence
V1–V20 lessons/evidence → research remaining gaps → adversarial review → evidence/observability closure → distillation → clean architecture from zero → formal model → technology selection → implementation → verification/fault injection.
Never patch V20 into the final architecture. Never silently discard historical research or convert an open gap into a guarantee.

## 2. Continuity rule
Work is cumulative: research → analyze → contrast → restructure → verify → save.
Every important result preserves evidence/source, conclusion, limitation, architecture consequence, contract, invariant, threat/failure mode, tests/evidence needed, uncertainty/open status, and closure rationale.
GitHub repository snowdenxrp/aldea-ia is the canonical external backup. Discrepancies between memory/context and GitHub must be investigated and recorded.

## 3. Canonical architecture lineage
A01-A04: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A01_A04_CONTEXT_AUTHORITY_OBJECTS_TRANSITIONS_V1_2026-09-24.md — cae1b010c5c95653308e14450f7158831de60824
A05-A06: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A05_A06_AUTHORITATIVE_STATE_LINEARIZATION_V1_2026-09-24.md — 8b53d4ddaaea7524cbed8db98cd59d8139437ff2
A07-A10: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A07_A10_STOP_RECOVERY_EVIDENCE_DEPENDENCIES_TCB_V1_2026-09-24.md — 3dfbe6d36e04b0906f8d8296bff4894c2b075d56
A11: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A11_FAILURE_INTERLEAVING_ADVERSARIAL_AUDIT_V1_2026-09-24.md — 7ca57559374b02aa5581b4dcefae7f602b1b929e
A12: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A12_FORMAL_BOUNDARY_CANONICAL_MODEL_V1_2026-09-24.md — 13edafd8b5cff5db9e211a02c44a5c029123f402
A13: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A13_TECHNOLOGY_INDEPENDENT_DEPLOYMENT_MAPPING_V1_2026-09-24.md — 875dd9adf29a6ff6a416d7d94f6dfd150fd5c07b
A14: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A14_COMPLETENESS_SELF_AUDIT_V1_2026-09-24.md — 03004d550cee16a0e3bc44a750fb834313a70d05
Boundary/topology: docs/nexo/NEXO_CLEAN_ARCHITECTURE_SYSTEM_BOUNDARY_SEMANTIC_TOPOLOGY_V1_2026-09-24.md — 99a26f57278654ea21ff38ed60fbd168197abf8b

## 4. Clean architecture baseline
Zones: Z0 Trusted Foundation; Z1 Authoritative Safety Core; Z2 Control/Semantic Plane; Z3 Effect/Observation Plane; Z4 External World.
Z2 proposes. Z1 authorizes/adjudicates protected transitions. Z3 executes/observes. Z4 determines external reality.
INFORMATION != CAPABILITY != AUTHORITY != EFFECT != EVIDENCE.

Canonical objects: IdentityContext, AuthorityContext, Operation, EffectBinding, ControlLease/Fence, StopState, RecoveryFence, VersionSet, PolicyBaseline, InvariantBaseline, ExternalEffectIdentity, ExternalEffectState, EvidenceRecord, VerificationClaim, ReconciliationRecord, DecommissionRecord, DurableHistory.
Candidate objects remain OPEN: PrepareCertificate, TransactionContext, ExternalEffectHistory, ResourceIncarnation, ControlCommit/EffectCommit distinction, EffectClass atomicity model, RetryClass, RecoveryProgress, ContinuityAnchor, RecoveryOwnership.

Protected transition contract: TRANSITION_ID, OWNER, AUTHORITY_BASIS, REQUIRED_SCOPE, INPUT_STATE, PRECONDITIONS, READ_SET, WRITE_SET, AFFECTED_OBJECTS, LINEARIZATION_POINT_OR_EQUIVALENT, POSTCONDITIONS, FORBIDDEN_CONCURRENT_TRANSITIONS, DURABILITY_REQUIREMENT, CRASH_SEMANTICS, PARTITION_SEMANTICS, TIMEOUT_SEMANTICS, RETRY/IDEMPOTENCY_SEMANTICS, EVIDENCE_REQUIREMENTS, INVALIDATION_TRIGGERS, RECOVERY_PATH, VERIFICATION_METHOD, TRACEABILITY.

## 5. Authoritative topology
SMALL HYBRID PROTECTED AUTHORITATIVE CORE.
Only safety-relevant authority/fencing/stop/recovery/activation/closure state and exact external-effect identity/state belongs inside unless later proven otherwise.
Planning, model inference, mission decomposition, ordinary memory, embeddings/indexes, analytics, UI, telemetry aggregation, caches, non-authoritative replicas, optimization metrics, ordinary scheduling/simulation remain outside unless proven authority-critical.
P0 safety-critical durable; P1 operationally durable; P2 reconstructable.
Authority-relevant UNKNOWN → HOLD/RESTRICT, REVALIDATE or QUARANTINE.

## 6. Linearization/effect semantics
No universal mechanism assumed.
Abstract stack: protected authoritative ordering → conditional guards → fencing/epochs → durable exact intent → exact effect identity/idempotency → external reconciliation.
NEW ATTEMPT != NEW EFFECT.
Internal linearization does not prove external-world outcome.
Effect states: REQUESTED, ADMITTED, BOUND, PREPARED, FINAL_GATE, LINEARIZED, EXTERNAL_ATTEMPTED, CONFIRMED/REJECTED/UNKNOWN.

## 7. STOP/recovery
STOP: STOP_REQUESTED → STOP_ENFORCING → EXECUTION_BLOCKED/ACTUATION_INTERRUPTED → STOP_VERIFIED → RECONCILIATION_REQUIRED → RECOVERABLE/QUARANTINED.
Local STOP != remote cancellation/reversal.
Recovery starts quarantined and requires current identity, artifact/config integrity, authority, STOP state, recovery fence, reconciliation and explicit release.
Recovery cannot grant itself normal authority; recovery-of-recovery is modeled.

## 8. Evidence/dependencies/TCB
Evidence != truth.
Promotion: UNKNOWN → OBSERVED → AUTHENTICATED → CONTEXT_BOUND → VALIDATED_FOR_PROPERTY → VERIFIED_FOR_CLAIM.
Absence of telemetry != evidence of absence.
Different processes/services/models are not automatically independent; common-mode domains are claim-specific.
TCB is claim-specific and includes relevant trust/identity, authority, protected transition/linearization, STOP, effect identity, evidence validity, version/config integrity, recovery release, and continuity/anti-rollback when required.

## 9. Status and gates
A11 found 0 semantic failures under defined rules; NOT a correctness proof.
A12 formal boundary designed; SANY/TLC not executed.
A13 technology-independent deployment mapping; technology selection blocked.
A14 self-audit complete; no silent gap closure.
G-A14-01..15 remain explicit: protected-store failure semantics; trusted time; migration/schema coexistence; resource exhaustion; provider reconciliation; scalable evidence invalidation; independent observation; TCB compromise response; dispute/override governance; privacy evidence rules; automated traceability; SANY/TLC; implementation refinement; fault injection; long-duration rollover/resource testing.

Status: SUBSTANTIALLY DEFINED / DESIGN BASELINE ESTABLISHED / CORRECTNESS NOT PROVEN / FORMAL CORRECTNESS NOT PROVEN / IMPLEMENTATION CORRECTNESS NOT PROVEN / RUNTIME CORRECTNESS NOT PROVEN / DEPLOYMENT CORRECTNESS NOT PROVEN.

## 10. Research conclusions preserved
CHANGE != LOCAL MUTATION. Safety changes propagate transitively through authority/fence/version → operations/queues/caches/workers → external effect → evidence → claims → release. Incomplete propagation defaults to HOLD/RESTRICT/QUARANTINE/REVALIDATE.
CONTROL ORDER != PROPAGATION ORDER != WORLD ORDER. Revocation semantics must survive crash. Replay must be idempotent, monotonic and generation-aware. Lost external response leaves effect UNKNOWN until reconciliation.
EVENT_TIME, OBSERVATION_TIME and AUTHORITATIVE_ORDER are distinct. Wall-clock is evidence context, not serialization.
HISTORY != AUTHORITY; RESTORATION != REAUTHORIZATION; AUTHENTIC SNAPSHOT != CURRENT SNAPSHOT; NUMERIC MONOTONICITY != SEMANTIC CONTINUITY; SIGNED != FRESH.
Token issuance != token enforcement. Resource must reject stale actors. Resource incarnation/continuity matters.
External commit can precede local recording. Restored local history must not override newer external evidence. Mixed-generation state is not coherent current context.
A second crash during recovery is first-class. RecoveryProgress != RecoveryAuthority. Resource replacement creates a new incarnation. Safe non-convergence (HOLD/QUARANTINE) is preferable to unsafe convergence based on stale/mixed-generation evidence.

Cross-resource atomicity: CONTROL_ATOMICITY != COORDINATION_ATOMICITY != EFFECT_ATOMICITY != OBSERVATION_ATOMICITY. PREPARED != COMMITTED != EXTERNAL_ATTEMPTED != EXTERNAL_CONFIRMED. Partial commit is explicit reconciliation/compensation state. Compensation is a new protected effect. Idempotency does not create cross-resource atomicity. Unknown participant outcome remains UNKNOWN. Footprint cannot silently expand. Replacement requires new resource incarnation. Partition != STOP. Provider acknowledgement is evidence, not automatic world truth. Cross-domain ordering may be UNKNOWN_ORDER.

Protocol families OPEN: A strong distributed atomicity; B saga/compensation; C hybrid local atomicity + fencing + stable effect identity + reconciliation; D resource-specific protocol. No selection.

## 11. Persistent resume point
Earlier recovery/effect research remains preserved. Do not implement. Do not construct V21. Maintain DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED != DEPLOYED VERIFIED.

## 12. AB104.186 — VersionSet concrete candidates
AB104.185 established: global stateRevision is strongest/simple but coarse; subsystem versions improve concurrency but require dependency closure; explicit ReadSet + WriteSet + DependencySet versions/incarnations are the minimum semantically precise candidate if the dependency graph is complete.

Concrete research candidates:
- drink: W={agent hydration/need, water/resource}; D={water quality/availability, ecosystem pressure}; V={agent + water/resource + dependency versions}.
- eat_plant: W={agent hunger, plant/resource}; D={ecosystem pressure/biodiversity}; V={agent + plant/resource + ecosystem dependencies}.
- catch_fish: W={agent inventory/energy, fish}; D={ecosystem/fish availability}; V={agent + fish + ecosystem dependencies}.
- gather_wood: W={agent inventory/energy/tool, wood}; D={ecosystem/resource pressure}; V={agent + wood + ecosystem dependencies}.
- gather_stone: W={agent inventory/energy/tool, stone where mutated}; D={ecosystem stone-pressure calculation if consulted}; V={agent + stone/ecosystem dependencies}.
- farm: W={agent inventory/energy/farm assignment, farm/land}; D={soil/fertility/ecosystem pressure, settlement/technology conditions}; V={agent + farm/land + relevant dependencies}.
- harvest: W={farm food, agent inventory/needs}; D={farm state and specialization/technology inputs if consulted}; V={farm + agent + relevant dependencies}.
- trade: W={buyer/seller inventories, balances, relationships, economy history}; D={institution/governance thresholds and price state}; V={both agents + economy + relationship/institution dependencies}.
- commons contribution/withdrawal: W={agent inventory/hunger/activity, commons/institution histories}; D={institution/governance state}; V={agent + institution/commons + governance dependencies}.
- repairs: field-specific W; D must include every semantic writer capable of invalidating the repaired invariant before commit. Generic repair cannot safely claim a narrow VersionSet without field-specific contracts.

Key result: direct write-set can be local while dependency closure is wider. VersionSet must be declared before execution, captured from authoritative state, validated at final commit, and rejected if a protected version/incarnation changed. Global stateRevision remains a possible coarse fallback only.

AB104.186 is research only. No implementation/V21/formal verification/CI PASS claim.

## EXACT NEXT ACTION
AB104.187: adversarially test these VersionSets for write-skew and hidden semantic dependencies, especially trade↔institution, farm↔ecosystem, repair↔society, and research/technology/governance feedback loops. Determine whether DependencySet can be static or must be dynamically recorded from authoritative reads.

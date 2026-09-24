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

Recent research:
- Invalidation propagation graph
- Invalidation durability/crash/replay
- Trace/correspondence/observability contract
- Distillation ledger / contradictions / TCB traceability
- PG-009 formal unification, recovery/restart/fencing, common-mode/correlated failure
- G-A14-01 lineage through minimum kernel, effect-path closure, dynamic footprint, atomicity, shared-footprint and multi-domain expansion
- Continuity/anti-rollback
- External resource fencing
- docs/nexo/NEXO_CROSS_RESOURCE_ATOMICITY_RESEARCH_V1_2026-09-24.md — c7ce38245762d23abe4565baefef599b0f9ddfa5
- docs/nexo/NEXO_POST_COMMIT_PRE_OBSERVATION_FAILURE_RESEARCH_V1_2026-09-24.md — fbbb6e65979bb566ee8d448749c543783f787e81
- docs/nexo/NEXO_DOUBLE_FAILURE_EXTERNAL_ROLLBACK_RECOVERY_RESEARCH_V1_2026-09-24.md — ccd8f7e411a3f711995a3e0cca99f45934f891cb
- docs/nexo/NEXO_DOUBLE_RECOVERY_SPLIT_OWNERSHIP_RESEARCH_V1_2026-09-24.md — 78d506be4bb367165f2edf4d215638f3be994d5c
- docs/nexo/NEXO_RECOVERY_STOP_EXTERNAL_EFFECT_RACE_RESEARCH_V1_2026-09-24.md — afbac5cc21233ee9446cc83acae63fe295a3f567

## 4. Clean architecture baseline
Zones:
Z0 Trusted Foundation
Z1 Authoritative Safety Core
Z2 Control/Semantic Plane
Z3 Effect/Observation Plane
Z4 External World

Z2 proposes. Z1 authorizes/adjudicates protected transitions. Z3 executes/observes. Z4 determines external reality.
INFORMATION != CAPABILITY != AUTHORITY != EFFECT != EVIDENCE.

Consistency:
C1 Authority consistency: may this actor perform this exact protected effect now?
C2 Coordination consistency: who owns the protected transition/fence?
C3 World-truth consistency: what actually happened outside Nexo?
C1/C2 never imply C3.

Canonical objects currently include:
IdentityContext, AuthorityContext, Operation, EffectBinding, ControlLease/Fence, StopState, RecoveryFence, VersionSet, PolicyBaseline, InvariantBaseline, ExternalEffectIdentity, ExternalEffectState, EvidenceRecord, VerificationClaim, ReconciliationRecord, DecommissionRecord, DurableHistory.
Candidate objects from current research remain OPEN: PrepareCertificate, TransactionContext, ExternalEffectHistory, ResourceIncarnation, ControlCommit/EffectCommit distinction, EffectClass atomicity model, RetryClass, RecoveryProgress, ContinuityAnchor, RecoveryOwnership.

Protected transition contract:
TRANSITION_ID, OWNER, AUTHORITY_BASIS, REQUIRED_SCOPE, INPUT_STATE, PRECONDITIONS, READ_SET, WRITE_SET, AFFECTED_OBJECTS, LINEARIZATION_POINT_OR_EQUIVALENT, POSTCONDITIONS, FORBIDDEN_CONCURRENT_TRANSITIONS, DURABILITY_REQUIREMENT, CRASH_SEMANTICS, PARTITION_SEMANTICS, TIMEOUT_SEMANTICS, RETRY/IDEMPOTENCY_SEMANTICS, EVIDENCE_REQUIREMENTS, INVALIDATION_TRIGGERS, RECOVERY_PATH, VERIFICATION_METHOD, TRACEABILITY.

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
Effect states must preserve REQUESTED, ADMITTED, BOUND, PREPARED, FINAL_GATE, LINEARIZED, EXTERNAL_ATTEMPTED, CONFIRMED/REJECTED/UNKNOWN as distinct semantics where applicable.

## 7. STOP/recovery
STOP is independent safety plane:
STOP_REQUESTED → STOP_ENFORCING → EXECUTION_BLOCKED/ACTUATION_INTERRUPTED → STOP_VERIFIED → RECONCILIATION_REQUIRED → RECOVERABLE/QUARANTINED.
Local STOP != remote cancellation/reversal.
Recovery starts quarantined and requires current identity, artifact/config integrity, authority, STOP state, recovery fence, reconciliation and explicit release.
Recovery cannot grant itself normal authority; recovery-of-recovery is modeled.

## 8. Evidence/dependencies/TCB
Evidence != truth.
Promotion: UNKNOWN → OBSERVED → AUTHENTICATED → CONTEXT_BOUND → VALIDATED_FOR_PROPERTY → VERIFIED_FOR_CLAIM.
Absence of telemetry != evidence of absence.
Different processes/services/models are not automatically independent; common-mode domains are claim-specific.
TCB is claim-specific and includes relevant trust/identity, authority, protected transition/linearization, STOP, effect identity, evidence validity, version/config integrity, recovery release, and continuity/anti-rollback when required.

## 9. A11-A14 status and open gates
A11 found 0 semantic failures under defined rules; NOT a correctness proof.
A12 formal boundary designed; SANY/TLC not executed.
A13 technology-independent deployment mapping; technology selection blocked.
A14 self-audit complete; no silent gap closure.
G-A14-01..15 remain explicit: protected-store failure semantics; trusted time; migration/schema coexistence; resource exhaustion; provider reconciliation; scalable evidence invalidation; independent observation; TCB compromise response; dispute/override governance; privacy evidence rules; automated traceability; SANY/TLC; implementation refinement; fault injection; long-duration rollover/resource testing.

Status:
SUBSTANTIALLY DEFINED
DESIGN BASELINE ESTABLISHED
CORRECTNESS NOT PROVEN
FORMAL CORRECTNESS NOT PROVEN
IMPLEMENTATION CORRECTNESS NOT PROVEN
RUNTIME CORRECTNESS NOT PROVEN
DEPLOYMENT CORRECTNESS NOT PROVEN

## 10. Research conclusions preserved
### Invalidation
CHANGE != LOCAL MUTATION. Safety changes propagate transitively through authority/fence/version → operations/queues/caches/workers → external effect → evidence → claims → release. Incomplete propagation defaults to HOLD/RESTRICT/QUARANTINE/REVALIDATE.

### Invalidation durability/replay
CONTROL ORDER != PROPAGATION ORDER != WORLD ORDER. Revocation semantics must survive crash. Replay must be idempotent, monotonic and generation-aware. Lost external response leaves effect UNKNOWN until reconciliation.

### Trace
EVENT_TIME, OBSERVATION_TIME and AUTHORITATIVE_ORDER are distinct. Wall-clock is evidence context, not serialization. Trace is evidence unless included in a protected atomicity bundle.

### Continuity
HISTORY != AUTHORITY; RESTORATION != REAUTHORIZATION; AUTHENTIC SNAPSHOT != CURRENT SNAPSHOT; NUMERIC MONOTONICITY != SEMANTIC CONTINUITY; SIGNED != FRESH. Content rollback may be a new logical context/generation; continuity assurance is claim-specific.

### Resource fencing
Token issuance != token enforcement. Resource must reject stale actors. Resource incarnation/continuity matters. Fence ACK is evidence of a transition point, not perpetual currentness. Multi-resource claims require complete external fencing footprint where required.

### Post-commit/pre-observation
External commit can precede local recording. Restored local history must not override newer external evidence. Missing/compacted external history is not evidence of absence. Mixed-generation state is not coherent current context. Reconciliation must be idempotent, generation-aware and monotonic.

### Double-failure / rollback / recovery
A second crash during recovery is a first-class safety case. RecoveryProgress != RecoveryAuthority. Resource rollback can erase current visibility of a historical effect without proving it never happened. Resource replacement creates a new incarnation. Authentic stale evidence is still stale. Repeated reconciliation must not regress authoritative evidence/context. Recovery checkpoints are not authority. STOP/decommission/recovery barriers must not regress through snapshot restore. Continuity cannot be proven solely from the rollback-vulnerable state it protects. Safe non-convergence (HOLD/QUARANTINE) is preferable to unsafe convergence based on stale/mixed-generation evidence.

Candidate invariants: INV-PCO-01..12 and INV-DF-01..15.

### Cross-resource atomicity
A multi-resource effect must declare its atomicity model.
CONTROL_ATOMICITY != COORDINATION_ATOMICITY != EFFECT_ATOMICITY != OBSERVATION_ATOMICITY.
PREPARED != COMMITTED != EXTERNAL_ATTEMPTED != EXTERNAL_CONFIRMED.
Partial commit is explicit reconciliation/compensation state, not simple failure.
Compensation is a new protected effect, not time reversal.
Idempotency prevents duplicate semantics but does not create cross-resource atomicity.
Internal commit does not prove world success.
Unknown participant outcome remains UNKNOWN.
Footprint cannot silently expand after the relevant commitment boundary.
Replacement requires new resource incarnation.
Partition != STOP.
Provider acknowledgement is evidence, not automatic world truth.
Cross-domain ordering may be UNKNOWN_ORDER.

Latest candidate invariants: INV-XA-01..10, INV-EVIDENCE-24, INV-DECOM-07.

Protocol families remain OPEN:
A strong distributed atomicity (prepare/commit)
B saga/compensation
C hybrid local atomicity + fencing + stable effect identity + reconciliation
D resource-specific protocol
No selection.

## 11. Persistent resume point
The exact next research attack is:
DOUBLE-RECOVERY / SPLIT RECOVERY OWNERSHIP.

Two recovery actors start from different checkpoints/contexts; both believe they can reconcile/release; one is stale; external effects change concurrently.

Analyze recovery fencing, ownership transfer, lease expiry, stale recovery messages, concurrent reconciliation, release linearization, recovery actor replacement/restart, and conflicting recovery decisions.

Next attack after this round: EFFECT OUTCOME AMBIGUITY + COMPENSATION SELECTION.

Then continue adversarially through remaining G-A14 gaps.

RSE round preserved: STOP_REQUESTED != STOP_ENFORCED != EXTERNAL_QUIESCENCE != HISTORICAL_NO_EFFECT; compensation is a new protected effect; release must jointly validate current owner/STOP/recovery/resource-fence/effect/evidence context.
Do not implement.
Do not construct V21.
Maintain:
DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED != DEPLOYED VERIFIED.

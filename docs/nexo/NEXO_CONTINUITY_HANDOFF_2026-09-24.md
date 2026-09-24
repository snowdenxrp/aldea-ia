# NEXO — CONTINUITY HANDOFF / PERSISTENT CONTEXT

Date: 2026-09-24
Status: RESEARCH + CLEAN ARCHITECTURE DESIGN ONLY
Implementation of the clean architecture: BLOCKED BY USER DECISION UNTIL RESEARCH, DISTILLATION, GAP AUDIT AND EVIDENCE/OBSERVABILITY CLOSURE ARE COMPLETE.

## 1. Non-negotiable project rule

Do NOT patch V20 into the final Nexo architecture.
Do NOT begin implementation merely because A01-A14 documents exist.
The intended sequence is:

V1–V20 lessons/evidence → research remaining gaps → adversarial review → evidence/observability closure → distillation → clean architecture from zero → formal model → technology selection → implementation → verification/fault injection.

The clean architecture is intended to preserve what was learned from V1–V20 while deliberately avoiding their accumulated patch history.

## 2. Continuity principle

The work is cumulative:
research → analyze → contrast → restructure → verify → save.

Every important result must preserve:
- evidence/source;
- conclusion;
- contradiction or limitation;
- architecture consequence;
- contract;
- invariant;
- threat/failure mode;
- tests/evidence needed;
- uncertainty/open status;
- reason for closing or keeping an item open.

GitHub repository snowdenxrp/aldea-ia is the canonical external backup for this architecture work.

## 3. Current architecture documents

A01-A04:
docs/nexo/NEXO_CLEAN_ARCHITECTURE_A01_A04_CONTEXT_AUTHORITY_OBJECTS_TRANSITIONS_V1_2026-09-24.md
Commit: cae1b010c5c95653308e14450f7158831de60824

A05-A06:
docs/nexo/NEXO_CLEAN_ARCHITECTURE_A05_A06_AUTHORITATIVE_STATE_LINEARIZATION_V1_2026-09-24.md
Commit: 8b53d4ddaaea7524cbed8db98cd59d8139437ff2

A07-A10:
docs/nexo/NEXO_CLEAN_ARCHITECTURE_A07_A10_STOP_RECOVERY_EVIDENCE_DEPENDENCIES_TCB_V1_2026-09-24.md
Commit: 3dfbe6d36e04b0906f8d8296bff4894c2b075d56

A11:
docs/nexo/NEXO_CLEAN_ARCHITECTURE_A11_FAILURE_INTERLEAVING_ADVERSARIAL_AUDIT_V1_2026-09-24.md
Commit: 7ca57559374b02aa5581b4dcefae7f602b1b929e

A12:
docs/nexo/NEXO_CLEAN_ARCHITECTURE_A12_FORMAL_BOUNDARY_CANONICAL_MODEL_V1_2026-09-24.md
Current repository SHA: 13edafd8b5cff5db9e211a02c44a5c029123f402
Status: formal boundary designed; SANY/TLC not executed.

A13:
docs/nexo/NEXO_CLEAN_ARCHITECTURE_A13_TECHNOLOGY_INDEPENDENT_DEPLOYMENT_MAPPING_V1_2026-09-24.md
Current repository SHA: 875dd9adf29a6ff6a416d7d94f6dfd150fd5c07b
Status: deployment mapping designed; technology selection not started.

A14:
docs/nexo/NEXO_CLEAN_ARCHITECTURE_A14_COMPLETENESS_SELF_AUDIT_V1_2026-09-24.md
Commit: 03004d550cee16a0e3bc44a750fb834313a70d05
Status: architecture self-audit completed; semantic completeness baseline established; correctness not proven.

Prior boundary/topology artifact:
docs/nexo/NEXO_CLEAN_ARCHITECTURE_SYSTEM_BOUNDARY_SEMANTIC_TOPOLOGY_V1_2026-09-24.md
Commit: 99a26f57278654ea21ff38ed60fbd168197abf8b

## 4. Current clean architecture baseline

### System zones
Z0 Trusted Foundation
Z1 Authoritative Safety Core
Z2 Control/Semantic Plane
Z3 Effect/Observation Plane
Z4 External World

Core semantic rule:
Z2 proposes.
Z1 authorizes/adjudicates protected transitions.
Z3 executes/observes.
Z4 determines external reality.

### Fundamental semantic separations
INFORMATION != CAPABILITY != AUTHORITY != EFFECT != EVIDENCE.

Planner/model/memory/UI/analytics are not authority merely because they influence proposals.

### Three consistency domains
C1 Authority consistency: may this actor perform this exact protected effect now?
C2 Coordination consistency: who owns the protected transition/fence?
C3 World-truth consistency: what actually happened outside Nexo?
C1/C2 never imply C3.

## 5. Canonical objects

IdentityContext
AuthorityContext
Operation
EffectBinding
ControlLease/Fence
StopState
RecoveryFence
VersionSet
PolicyBaseline
InvariantBaseline
ExternalEffectIdentity
ExternalEffectState
EvidenceRecord
VerificationClaim
ReconciliationRecord
DecommissionRecord
DurableHistory

State ownership does not imply authority over all other state.

## 6. Protected transition contract

Every protected transition must specify:
TRANSITION_ID
OWNER
AUTHORITY_BASIS
REQUIRED_SCOPE
INPUT_STATE
PRECONDITIONS
READ_SET
WRITE_SET
AFFECTED_OBJECTS
LINEARIZATION_POINT_OR_EQUIVALENT
POSTCONDITIONS
FORBIDDEN_CONCURRENT_TRANSITIONS
DURABILITY_REQUIREMENT
CRASH_SEMANTICS
PARTITION_SEMANTICS
TIMEOUT_SEMANTICS
RETRY/IDEMPOTENCY_SEMANTICS
EVIDENCE_REQUIREMENTS
INVALIDATION_TRIGGERS
RECOVERY_PATH
VERIFICATION_METHOD
TRACEABILITY

## 7. Authoritative topology decision

The clean architecture uses a SMALL HYBRID PROTECTED AUTHORITATIVE CORE.

Inside it only the state necessary to grant/revoke/fence/stop/recover/activate/close safety-relevant authority and to preserve exact external-effect identity/state.

Outside it:
planning, model inference, mission decomposition, ordinary memory, embeddings/indexes, analytics, UI state, telemetry aggregation, caches, non-authoritative replicas, optimization metrics, ordinary scheduling and simulation unless later proven authority-critical.

Persistence classes:
P0 safety-critical durable
P1 operationally durable
P2 reconstructable

Authority-relevant uncertainty is fail-closed: HOLD/RESTRICT, REVALIDATE or QUARANTINE as appropriate.

## 8. Linearization decision

No universal mechanism is assumed.

Abstract protocol stack:
protected authoritative ordering
→ conditional guards
→ fencing/epochs
→ durable exact intent
→ exact effect identity/idempotency
→ external reconciliation.

For each L3 transition there must be an abstract pre-state, implementation read set, guard, exact linearization event, write set, abstract post-state, crash/retry behavior, concurrent-transition exclusions, refinement mapping and trace evidence.

NEW ATTEMPT != NEW EFFECT.

Internal linearization does not prove external-world outcome.

## 9. STOP and recovery

STOP is an independent safety plane.

STOP lifecycle:
STOP_REQUESTED → STOP_ENFORCING → EXECUTION_BLOCKED/ACTUATION_INTERRUPTED → STOP_VERIFIED → RECONCILIATION_REQUIRED → RECOVERABLE/QUARANTINED.

Local STOP is not proof of remote cancellation/reversal.

Recovery begins quarantined and requires current identity, artifact/config integrity, current authority, STOP state, recovery fence, reconciliation and explicit release.

Recovery cannot grant itself normal authority.
Recovery-of-recovery is explicitly modeled.

## 10. Evidence and claims

Evidence is not truth.

Promotion:
UNKNOWN → OBSERVED → AUTHENTICATED → CONTEXT_BOUND → VALIDATED_FOR_PROPERTY → VERIFIED_FOR_CLAIM.

Claims are exact, context-bound, dependency-bound and may expire or be invalidated.

Absence of telemetry != evidence of absence.

## 11. Dependencies/common-mode/TCB

Different processes/services/models are not automatically independent.

Common failure domains must be explicitly recorded.

TCB is claim-specific:
T1 Trust/identity
T2 Authority
T3 Protected transition/linearization
T4 STOP
T5 Effect identity
T6 Evidence validity
T7 Version/configuration integrity
T8 Recovery release

A TCB change is a safety-relevant architecture change and can invalidate affected assurance until re-evaluated.

## 12. A11 adversarial audit

A11 conceptually attacked authorization/revocation, policy changes, reservations, execution/STOP, execution/recovery, execution/decommission, evidence invalidation, version changes, UNKNOWN/recovery, retry, timeout, restart, update, rollback, decommission/restart, delegation, migration, storage rollback, network partitions, clock manipulation, compromised observers, reconciliation conflicts, audit/state commit, proof caches, formal-model changes, human approvals, STOP/external cancellation, resource exhaustion and recovery-of-recovery.

Semantic failures found: 0 under the defined rules.

This is NOT a proof of correctness. Concrete mechanisms, formal model checking, implementation refinement and fault injection remain open.

## 13. A12-A14 closure

A12:
Formal semantic boundary designed.
Canonical abstract state defined.
Safety invariants defined.
Liveness separated from safety.
Refinement chain defined.
SANY/TLC not executed.

A13:
Deployment zones and trust boundaries defined.
Failure-domain mapping defined.
Deployment topology remains technology-independent.
Technology selection blocked pending feasibility audit.

A14:
Architecture self-audit completed.
No silent semantic gap was declared closed.
G-A14-01 through G-A14-15 remain explicit:
protected-store failure semantics; trusted time; migration/schema coexistence; resource exhaustion; provider reconciliation; scalable evidence invalidation; independent observation; TCB compromise response; dispute/override governance; privacy evidence rules; automated traceability; SANY/TLC; implementation refinement; fault injection; long-duration rollover/resource testing.

Architecture status:
SUBSTANTIALLY DEFINED
DESIGN BASELINE ESTABLISHED
CORRECTNESS NOT PROVEN
FORMAL CORRECTNESS NOT PROVEN
IMPLEMENTATION CORRECTNESS NOT PROVEN
RUNTIME CORRECTNESS NOT PROVEN
DEPLOYMENT CORRECTNESS NOT PROVEN

## 14. Persistent continuity requirement from user

The user explicitly requested that all of this be retained for the next chat so the next chat can understand the full sequence and details.

The continuity mechanism is:
1. this versioned handoff in GitHub;
2. all A01-A14 artifacts and their commit/SHA history;
3. prior V1-V20 research/distillation artifacts;
4. the conversation's persistent personal context when available.

Next chat must load this handoff plus A01-A14 rather than asking the user to repeat the architecture.

Discrepancies between memory/context and GitHub are to be investigated and recorded, not silently discarded.

## 15. Resume point

Do not start implementation.

Next work:
1. protocol feasibility research for G-A14-01..15;
2. concrete formal model preparation;
3. actual SANY/TLC execution when the model is ready;
4. V1-V20 evidence-to-architecture trace audit;
5. only after those gates, implementation preparation.

Maintain the invariant:
DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED != DEPLOYED VERIFIED.

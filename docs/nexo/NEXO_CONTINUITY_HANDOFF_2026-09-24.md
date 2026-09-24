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

GitHub repository `snowdenxrp/aldea-ia` is the canonical external backup for this architecture work.

## 3. Current architecture documents

A01-A04:
`docs/nexo/NEXO_CLEAN_ARCHITECTURE_A01_A04_CONTEXT_AUTHORITY_OBJECTS_TRANSITIONS_V1_2026-09-24.md`
Commit: `cae1b010c5c95653308e14450f7158831de60824`

A05-A06:
`docs/nexo/NEXO_CLEAN_ARCHITECTURE_A05_A06_AUTHORITATIVE_STATE_LINEARIZATION_V1_2026-09-24.md`
Commit: `8b53d4ddaaea7524cbed8db98cd59d8139437ff2`

A07-A10:
`docs/nexo/NEXO_CLEAN_ARCHITECTURE_A07_A10_STOP_RECOVERY_EVIDENCE_DEPENDENCIES_TCB_V1_2026-09-24.md`
Commit: `3dfbe6d36e04b0906f8d8296bff4894c2b075d56`

A11:
`docs/nexo/NEXO_CLEAN_ARCHITECTURE_A11_FAILURE_INTERLEAVING_ADVERSARIAL_AUDIT_V1_2026-09-24.md`
Commit: `7ca57559374b02aa5581b4dcefae7f602b1b929e`

Prior boundary/topology artifact:
`docs/nexo/NEXO_CLEAN_ARCHITECTURE_SYSTEM_BOUNDARY_SEMANTIC_TOPOLOGY_V1_2026-09-24.md`
Commit previously recorded: `99a26f57278654ea21ff38ed60fbd168197abf8b`

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

Critical transitions include authorization, revocation, reservation/fencing, final execution admission, external intent/outcome, STOP, recovery admission/release, VersionSet activation and decommission closure.

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

`NEW ATTEMPT != NEW EFFECT`.

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

Context changes that can invalidate evidence include policy/invariant/version/trust-root/dependency/observer/target/schema/freshness changes and relevant safety-state changes.

Absence of telemetry != evidence of absence.

## 11. Dependencies/common-mode/TCB

Different processes/services/models are not automatically independent.

Common failure domains must be explicitly recorded.

TCB is claim-specific, with candidate domains:
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

A11 conceptually attacked the architecture across authorization/revocation, policy changes, competing reservations, execution/STOP, execution/recovery, execution/decommission, evidence invalidation, version changes, UNKNOWN/recovery, retry, timeout, restart, update, rollback, decommission/restart, delegation, migration, storage rollback, network partitions, clock manipulation, compromised observers, reconciliation conflicts, audit/state commit, proof caches, formal-model changes, human approvals, STOP/external cancellation, resource exhaustion and recovery-of-recovery.

Semantic failures found: 0 under the defined rules.

This is NOT a proof of correctness. Concrete mechanisms, formal model checking, implementation refinement and fault injection remain open.

New invariants include:
- stale authority cannot create a new protected effect;
- stale coordination owners cannot pass protected fences;
- restart cannot clear STOP;
- recovery cannot grant itself normal authority;
- UNKNOWN cannot be erased by timeout/retry/rollback/new operation identity;
- invalidated evidence cannot satisfy a current release;
- historical commit does not imply current authority;
- local STOP does not imply external cancellation;
- external observation does not imply verified world truth;
- diversity does not imply independence;
- decommissioned identity cannot be resurrected from stale state;
- checkpoint restore cannot restore authority;
- TCB changes invalidate affected assurance until re-evaluated;
- human approval is exact-effect/context-bound;
- failed protected transitions cannot be interpreted as successful merely from an incomplete response.

## 13. Current sequence

A01 Context/boundary — DESIGNED
A02 Authority/ownership — DESIGNED
A03 Canonical objects — DESIGNED
A04 Protected transitions — DESIGNED
A05 Authoritative state topology — DESIGNED
A06 Linearization protocol — DESIGNED
A07 STOP/recovery — DESIGNED
A08 Evidence/claims — DESIGNED
A09 Dependencies/common-mode — DESIGNED
A10 TCB — DESIGNED
A11 Failure/interleaving adversarial audit — PASSED WITH OPEN IMPLEMENTATION MECHANISMS

Next intended sequence:
A12 formal boundary + canonical model variables
→ A13 technology-independent deployment mapping
→ A14 full architecture completeness/self-audit
→ then return to the broader research/destillation gate and audit all V1–V20 evidence against the clean architecture.

Do not implement before the user explicitly reaches the architecture-build phase after research/distillation/audit completion.

## 14. Important prior Nexo work context

Earlier Nexo research already established the need for explicit contracts, state, events, traceability, reversibility, independent auditing, TEST→SANDBOX→PRODUCTION progression, protected decisions, fail-safe behavior, and a protected constitution. A prior rebuild foundation existed, but the current clean-architecture effort is intentionally not a continuation of patching that implementation.

A previous gap record also left PG-009 open and NOT TLC-verified, involving operation/effect identity, atomic reservation, authority epochs, external UNKNOWN, separate reconciliation lease, fencing tokens, fresh observations and no retry without reconciliation. This must remain visible during later audits rather than being silently considered solved.

## 15. How the next chat should resume

Start by loading this continuity document and the A01-A11 documents from GitHub. Do not restart the research from zero and do not ask the user to repeat these decisions. First verify the continuity state, then continue with the next planned research/architecture stage. Maintain the same rule: research first, close gaps, distill, adversarially audit, then design/build cleanly from zero. Preserve sequence and open issues.

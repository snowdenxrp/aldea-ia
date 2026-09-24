# NEXO CANONICAL OWNERSHIP AND STATE-TRANSITION INVENTORY V1
Date: 2026-09-24
Status: RESEARCH/CONSOLIDATION — ARCHITECTURE BLOCKED

## External cross-check
NASA requires requirements to be allocated through the system hierarchy and verified with bidirectional traceability; its software guidance also calls for traceability from requirements through design and code. NIST SP 800-160 calls for bidirectional traceability between security requirements, architecture/design and verification evidence. These references reinforce the need to define ownership, transition conditions and verification boundaries before implementation.

## 1. Ownership classes
Ownership is a responsibility for maintaining authoritative state. It is NOT blanket authority over related state.

| State/domain | Candidate authoritative owner | May mutate | Must not imply |
|---|---|---|---|
| Trust-root state | Trust authority | controlled trust-root process | execution authority |
| Identity/session state | Identity authority | identity subsystem | mission authority |
| AuthorityContext | Authority service/authority holder | authorized authority transition | execution success |
| Policy/invariant baseline | Policy/safety authority | governed change process | world truth |
| Coordination lease/fence | Coordination authority | linearizable coordination protocol | external-world truth |
| Operation lifecycle | Mission/control plane | operation transition protocol | external effect completion |
| EffectBinding | Operation admission boundary | creation before execution only | ability to rewrite target later |
| External-effect state | Reconciliation authority | verified reconciliation protocol | authority to initiate arbitrary effects |
| EvidenceRecord | Evidence/provenance subsystem | append/transition under provenance rules | truth of world by itself |
| Safety gate state | Safety authority/gate | protected transition | mission planning |
| Emergency-stop state | Independent stop authority | stop enforcement protocol | automatic resume |
| Recovery fence | Recovery authority | recovery protocol | execution release |
| Update transaction | Change/update authority | update state machine | safety equivalence by signature |
| Version-set baseline | Configuration authority | controlled configuration transaction | world-state truth |
| Proof/evidence status | Verification pipeline | derived from current obligations/context | self-declared validity |
| Decommission state | Decommission authority | lifecycle closure protocol | reactivation authority |

## 2. Critical ownership separations
The following pairs must remain distinct unless a future analysis proves a safe explicit exception:

- normal execution owner vs recovery owner;
- execution owner vs reconciliation owner;
- emergency-stop authority vs execution authority;
- policy-change authority vs evidence verifier;
- trust-root authority vs model/planner;
- update authority vs runtime executor;
- operation owner vs external-world truth authority;
- evidence producer vs independent verifier;
- configuration owner vs arbitrary process;
- decommission authority vs restart authority.

## 3. Canonical state machines

### 3.1 Critical operation lifecycle
PROPOSED → NORMALIZED → FINGERPRINTED → ADMITTED → AUTHORIZED → RESERVED → PREPARED → EXECUTING

Possible post-execution branches:
EXECUTING → EXTERNAL_UNKNOWN
EXECUTING → PARTIALLY_APPLIED
EXECUTING → APPLIED

Then:
EXTERNAL_UNKNOWN/PARTIALLY_APPLIED/APPLIED → OBSERVED → RECONCILED → VERIFIED → COMMITTED

Forbidden shortcuts:
- EXECUTING → COMMITTED without required evidence/reconciliation;
- timeout → ABSENT;
- process exit → NOT_APPLIED;
- restart → AUTHORIZED;
- new operation ID → resolution of prior UNKNOWN;
- metric success → VERIFIED world effect.

### 3.2 Emergency stop
NORMAL → STOP_REQUESTED → STOP_ENFORCING → EXECUTION_BLOCKED / ACTUATION_INTERRUPTED → STOP_VERIFIED → RECONCILIATION_REQUIRED

Possible branches:
RECONCILIATION_REQUIRED → RECOVERABLE
RECONCILIATION_REQUIRED → QUARANTINED

Forbidden:
- executor clearing STOP;
- reboot clearing STOP;
- lease expiry clearing STOP;
- missing telemetry becoming STOP_VERIFIED;
- executor ACK becoming external cancellation proof.

### 3.3 Recovery
RESTARTED → QUARANTINED → IDENTITY_ATTESTED → ARTIFACT_CONFIG_VERIFIED → CURRENT_FENCE_OBSERVED → CURRENT_AUTHORITY_VALIDATED → RECOVERY_OWNER_ACQUIRED → RECOVERY_RECONCILED → RELEASE_ELIGIBLE → EXPLICIT_RELEASE → EXECUTION_ENABLED

Forbidden:
- checkpoint → execution;
- restart → new authority;
- recovery owner → unrestricted execution authority;
- stale recovery token → release;
- unresolved critical UNKNOWN → automatic release.

### 3.4 Update/bootstrap
Bootstrap:
PLATFORM/ROOT → BOOT_INTEGRITY → RECOVERY_SAFETY_VERIFIER → TRUST_ROOT_LOAD → ARTIFACT_CONFIG_ATTESTATION → POLICY_INVARIANT_LOAD → SAFETY_GATE → RECOVERY_FENCE → CURRENT_EPOCHS → CONTROL_PLANE → MODEL_PLANNER → CAPABILITY_ADMISSION

Update:
PROPOSE → IDENTIFY → HASH_BIND → PROVENANCE_VERIFY → SIGNATURE_ATTESTATION_VERIFY → SOURCE_BUILDER_POLICY_VERIFY → DEPENDENCY_CLOSURE → SEMANTIC_POLICY_COMPATIBILITY → SAFETY_PROPERTY_DELTA → THREAT_COMMON_MODE_REVIEW → INDEPENDENT_ADMISSION → STAGE → ATTEST_STAGE → FENCE_OLD → ACTIVATE → VERIFY_CONTROL_PLANE → WORLD_RECONCILE → COMMIT

Forbidden:
- signature → authorization;
- rollback image → safe rollback;
- recovery image → trusted recovery;
- update journal → restored authority;
- component validity → valid system version set.

## 4. Transition contract
Every critical transition must have:
transition_id, preconditions, postconditions, prohibitions, state_owner, authority_basis, required_scope, authority_epoch, coordination_fence, policy/invariant_version, configuration/version_set, required_evidence, evidence_freshness, dependency_closure, failure_domains, linearization_requirement, timeout_semantics, restart_semantics, rollback/recovery_semantics, audit_record.

A transition is not considered defined merely because its source and destination state names exist.

## 5. State invariants
STATE-01: Critical state has one authoritative owner or explicit serialization.
STATE-02: Ownership does not imply unrestricted authority.
STATE-03: Critical transitions have explicit preconditions and postconditions.
STATE-04: Every critical transition has explicit forbidden shortcuts.
STATE-05: Timeout/partition/crash semantics are explicit.
STATE-06: Restart cannot create authority.
STATE-07: Lease expiry cannot prove external effect absence.
STATE-08: Evidence expiry invalidates claims that require freshness.
STATE-09: Material policy/config/dependency changes trigger claim re-evaluation.
STATE-10: Safety-relevant UNKNOWN persists until explicit reconciliation.
STATE-11: Derived release eligibility is not independently mutable state.
STATE-12: A new operation identity cannot erase unresolved prior effect identity.
STATE-13: Decommissioning must close authority, effects, delegation, secrets, recovery and residual state.
STATE-14: No metric/proxy/local completion transition can by itself create VERIFIED external-world success.

## 6. Ownership conflict tests
O-01 execution owner attempts recovery transition → denied.
O-02 recovery owner attempts execution release without explicit release authority → denied.
O-03 reconciliation owner attempts arbitrary new effect → denied.
O-04 evidence producer attempts to mark evidence independently verified → denied.
O-05 planner attempts authority expansion → denied.
O-06 update process attempts to bypass safety admission → denied.
O-07 executor attempts STOP clearance → denied.
O-08 stale lease holder attempts protected commit → denied.
O-09 stale authority epoch attempts protected effect → denied.
O-10 decommissioned identity attempts restart → denied.
O-11 changed policy version attempts use of stale release decision → denied/revalidated.
O-12 stale evidence attempts release → denied/revalidated.

## 7. Traceability inventory
Every critical transition will eventually map:
Requirement → Invariant → Transition → Implementation element → Test → Evidence → Claim

Reverse path:
Failure → Evidence → Claim → Transition → Implementation → Invariant → Requirement → Corrective action → Re-test

This is consistent with NASA and NIST guidance on bidirectional traceability and recorded verification evidence.

## 8. Newly exposed open questions
1. Exact serialization/linearization point for each protected transition.
2. Which state store is authoritative for each object.
3. How cross-store atomicity is achieved or replaced by a protocol with equivalent guarantees.
4. How authority epochs are scoped without creating unnecessary global invalidation.
5. How evidence invalidation propagates to derived release eligibility.
6. How external reconciliation obtains trustworthy world observations.
7. How update/configuration changes trigger affected-claim discovery.
8. How decommissioning proves absence of active workers, leases, delegated work and pending effects.
9. How ownership survives multi-agent operation without shared authority ambiguity.
10. Which TCB components must be independently implemented or independently verified.
11. Which states must be durable across restart.
12. Which liveness claims are actually required and what fairness assumptions justify them.

## 9. Architecture gate
This inventory does NOT authorize implementation.

Before clean architecture drafting:
- ownership matrix must be reconciled with the object model;
- every critical transition must have a defined owner and authority basis;
- all forbidden shortcuts must be encoded as explicit invariants;
- linearization requirements must be mapped to implementation mechanisms;
- unresolved questions remain OPEN.

DESIGNED != IMPLEMENTED != TESTED != VERIFIED.

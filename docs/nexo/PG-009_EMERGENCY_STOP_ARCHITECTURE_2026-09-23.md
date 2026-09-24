# PG-009 — Independent Emergency-Stop Architecture and Fail-Safe Boundaries
Date: 2026-09-23
Status: OPEN — research/architecture phase.

## Research question

Can Nexo's human STOP/revocation guarantee remain effective if the primary executor, planner, model runtime, policy engine, network path, or control process is itself failed, compromised, hung, or unavailable?

No. A STOP implemented only inside the component that must be stopped is not an independent safety boundary.

The architecture therefore separates:
- ordinary execution control;
- authority/revocation control;
- emergency-stop control;
- external-world actuation;
- observation/reconciliation;
- recovery/restart authorization.

## Research cross-check

NIST AI RMF identifies shutdown, modification, monitoring and human intervention as practical safety mechanisms for AI systems that deviate from intended behavior. It also emphasizes that safety mechanisms should be appropriate to the severity and context of risk. This supports treating shutdown as an explicit safety function rather than merely a UI command. citeturn0search12turn0search49

ISO 13850:2015 defines functional requirements and design principles for emergency-stop functions and treats the emergency-stop function as a distinct safety function. Its scope is machinery, so Nexo uses it as a design analogy rather than claiming direct applicability to software agents. citeturn0search0

IEC 61508 provides a lifecycle framework for safety-related systems and explicitly addresses avoidance/control of faults and failures, safety functions, validation and systematic failures. IEC material also identifies common-cause failures as a distinct assurance concern. citeturn1search3turn1search0turn1search28

NIST examples of robotic safety systems have used an auxiliary safety computer that is independent of the primary controls and can override/stop them. This is useful evidence for the architectural pattern, not proof that a software-only Nexo implementation is safe. citeturn1search32

NIST SP 800-53 also contains an emergency-shutoff control for critical systems/facilities, requiring capability, accessibility to authorized personnel and protection against unauthorized activation. citeturn0search48

## Core architectural conclusion

The Emergency Stop Plane must not depend for its minimum stop path on:
- the planner that initiated the effect;
- the model/runtime making the decision;
- the executor being stopped;
- the same policy engine whose failure may require the stop;
- the same mutable memory/state that may be corrupted;
- a single network path when an independent path is required;
- a software acknowledgement from the component being stopped.

The minimum architecture is:

HUMAN/INDEPENDENT SAFETY INPUT
        ↓
EMERGENCY-STOP PLANE
        ↓
INDEPENDENT ENFORCEMENT GATE
        ↓
EXECUTOR / ACTUATOR
        ↓
WORLD

with a separate observation path:

WORLD → INDEPENDENT OBSERVATION → STOP/RECOVERY VERIFICATION

The emergency plane may share infrastructure for telemetry or convenience, but the critical stop decision and enforcement path must be analyzed for common-mode dependencies.

## Emergency-stop classes

E0 — Advisory stop
- records STOP;
- requests normal executor halt;
- insufficient for critical effects.

E1 — Cooperative stop
- sends a stop request through the normal executor;
- executor acknowledges;
- useful only where the executor is trusted and responsive.

E2 — Independent execution gate
- an independent gate prevents admission/dispatch of new critical effects;
- executor cannot override the gate through ordinary authority.

E3 — Actuation-interrupting stop
- independent mechanism interrupts the relevant actuation/control path;
- used when stopping the software process is insufficient.

E4 — External-world emergency containment
- the external target has an independent emergency-control mechanism;
- Nexo records the command, confirmation and world verification separately.

Nexo must never claim E2/E3/E4 merely because it issued a STOP message.

## Fail-safe versus fail-operational

Emergency behavior must be declared per effect class.

FAIL_SAFE:
- loss of required safety evidence, safety heartbeat, gate integrity, authority state, or critical communication causes transition to a bounded safe state.

FAIL_OPERATIONAL:
- temporary loss of a component is tolerated because continuing operation is demonstrably within the declared safety envelope.

UNKNOWN:
- the system cannot establish which mode is safe.

UNKNOWN must not silently become FAIL_OPERATIONAL.

For irreversible/high-consequence effects, uncertainty about the emergency-control boundary is itself a reason to restrict or block execution.

## Independence contract

An EmergencyStopContract binds:
- stop_id;
- initiator identity/authentication;
- authorization basis;
- target/effect scope;
- emergency class E0-E4;
- safety function;
- independent enforcement path;
- dependencies and common-mode domains;
- required response bound;
- expected post-stop state;
- verification method;
- fallback state;
- authority epoch;
- policy version;
- configuration/artifact versions;
- test evidence;
- expiry/review;
- recovery/restart conditions.

Independence is not a boolean. It is a dependency claim that must be evidenced.

## Common-mode failure rule

Two components are not independent merely because they are separate processes.

Shared:
- host;
- kernel;
- hypervisor;
- identity provider;
- credential;
- policy service;
- network;
- power source;
- storage;
- model/runtime;
- administrator channel;
- update artifact;
- clock;
- configuration;

can create a common failure domain.

For each E2+ stop path, Nexo must identify the minimum common-mode dependency set. If the claimed independence collapses under a single failure mode, the claimed stop class is downgraded.

## Stop state machine

NORMAL
→ STOP_REQUESTED
→ STOP_ENFORCING
→ EXECUTION_BLOCKED / ACTUATION_INTERRUPTED
→ STOP_VERIFIED
→ RECONCILIATION_REQUIRED
→ RECOVERABLE or QUARANTINED

Important branches:

STOP_REQUESTED → STOP_TIMEOUT
STOP_ENFORCING → ENFORCEMENT_UNKNOWN
STOP_VERIFIED → WORLD_EFFECT_UNKNOWN

A STOP event never deletes the operation/effect history.

## Emergency stop and in-flight effects

STOP has at least four distinct effects:

1. revoke future authority;
2. prevent new execution where the gate can enforce it;
3. attempt interruption/cancellation of an in-flight operation;
4. reconcile effects that may already have reached the external world.

Only (1) and some forms of (2) are guaranteed by a local authority change.

A remote cancellation request is not a cancellation confirmation.
A cancellation confirmation is not automatically proof of final world state.
A local process termination is not proof that an external effect did not occur.

Therefore UNKNOWN after STOP enters the existing reconciliation machinery.

## Restart / release rule

Emergency stop is sticky with respect to critical execution.

A restart requires a new governed transition:
STOPPED → RECOVERY_ASSESSMENT → RELEASE_AUTHORIZED → EXECUTION_ENABLED

Release must not be implicit in:
- process restart;
- machine reboot;
- lease expiry;
- timeout;
- loss of the STOP signal;
- restoration of network connectivity;
- model reload.

The release decision must bind current authority, policy, world state, safety evidence and stop reason.

## Fail-safe defaults

The following must not authorize critical execution by themselves:
- missing STOP state;
- missing heartbeat;
- stale safety observation;
- unknown gate state;
- unknown external effect;
- executor restart;
- successful local shutdown;
- loss of the emergency-control connection;
- malformed or unavailable safety metadata.

Where the architecture cannot establish the safe state, it enters BLOCKED/UNKNOWN and requires governed recovery.

## Anti-bypass property

No ordinary executor capability may:
- clear an emergency stop;
- alter its own safety classification;
- replace the emergency gate;
- grant itself restart authority;
- modify the independent stop policy;
- delete stop evidence;
- reinterpret STOP as advisory;
- substitute a new operation identity to evade the stop.

A recovery component may perform these actions only under a separate, explicitly governed authority.

## Verification obligations

Every E2+ implementation requires:

1. fault injection of executor hang/crash;
2. planner/model failure;
3. policy-service failure;
4. network partition;
5. stale heartbeat;
6. corrupted/missing safety state;
7. emergency-channel loss;
8. shared-host failure;
9. simultaneous executor and observer failure;
10. stop during each critical execution phase;
11. stop immediately before dispatch;
12. stop immediately after dispatch;
13. stop after remote effect but before receipt;
14. restart while STOP remains active;
15. stale recovery owner attempting release;
16. unauthorized component attempting bypass;
17. common-mode dependency failure;
18. recovery followed by world reconciliation.

Evidence must distinguish:
STOP_ACCEPTED, STOP_ENFORCED, STOP_VERIFIED, WORLD_RECONCILED and RELEASE_AUTHORIZED.

## Formalization target

The first TLA+ sketch for this subproblem is intentionally a model sketch, not a verified result. It should model:
- executor state;
- emergency-stop state;
- independent gate state;
- authority/revocation;
- external world effect;
- stop request loss;
- executor failure;
- gate failure;
- observation uncertainty;
- stale recovery owner;
- release/restart fencing.

Safety properties should include:

1. Once a critical stop is enforced, no new critical dispatch occurs until governed release.
2. Executor-local acknowledgement cannot prove independent enforcement.
3. STOP does not imply external effect absence.
4. Gate failure cannot silently become authorization.
5. Release requires current authority + current safety evidence + current world/reconciliation state.
6. Stale recovery owners cannot release the system.
7. A compromised executor cannot clear an independent gate through ordinary execution authority.
8. Common-mode failure invalidates unsupported independence claims.

The model remains NOT TLC-VERIFIED until an actual TLC run and review produce evidence.

## New invariants

INV-593 — a critical emergency stop cannot depend solely on the component being stopped.
INV-594 — emergency-stop authority is distinct from ordinary execution authority.
INV-595 — stop request, stop enforcement, stop verification and world reconciliation are distinct states.
INV-596 — executor acknowledgement does not prove independent emergency enforcement.
INV-597 — claimed independence must identify dependencies and common-mode failure domains.
INV-598 — separate processes do not by themselves establish safety independence.
INV-599 — failure of required emergency-stop evidence cannot silently increase execution authority.
INV-600 — UNKNOWN emergency-control state cannot be treated as safe-to-continue without an explicit bounded policy.
INV-601 — critical stop release requires a fresh governed authorization.
INV-602 — process restart, reboot, lease expiry or timeout cannot implicitly release a critical stop.
INV-603 — STOP revokes future authority but does not erase in-flight effect history.
INV-604 — remote cancellation request is not cancellation confirmation.
INV-605 — cancellation confirmation is not automatically final world-state verification.
INV-606 — executor restart cannot prove absence of an external effect.
INV-607 — an executor cannot modify or bypass its own critical emergency-stop enforcement path.
INV-608 — stale recovery owners cannot authorize stop release.
INV-609 — emergency-stop verification must cover the relevant effect/actuation boundary, not only the software process.
INV-610 — an emergency-stop guarantee is bounded by the independently enforced control boundary and must not be generalized beyond it.

## Architectural result

The human override/revocation architecture from the previous step is strengthened into a separate Emergency Safety Plane.

The key separation is:

AUTHORITY PLANE
  decides whether an effect may be authorized.

EXECUTION PLANE
  performs the effect.

EMERGENCY SAFETY PLANE
  can independently prevent/interdict critical execution within its declared boundary.

OBSERVATION/RECONCILIATION PLANE
  determines what actually happened in the world.

No plane may claim a stronger guarantee merely because another plane reported success.

## Next research

1. Independent emergency-stop architecture and fail-safe/fail-operational boundaries — THIS STEP.
2. Emergency-stop observability and proof of enforcement.
3. Recovery/restart fencing after emergency stop.
4. Safety-plane update/rollback and bootstrap trust.
5. Common-mode and correlated-failure analysis.
6. Formal TLA+ model and actual TLC execution.

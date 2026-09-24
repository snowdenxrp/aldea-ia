# NEXO CLEAN ARCHITECTURE — A01-A04 CONTEXT, AUTHORITY, OBJECTS, TRANSITIONS V1 — 2026-09-24

Status: ARCHITECTURE DESIGN / TECHNOLOGY-INDEPENDENT
Precondition: Requirements completeness gate passed
Implementation: NOT STARTED
Formal verification: NOT STARTED

## A01 — System context and boundary

Nexo is a system-of-systems boundary, not a single process.

### Context actors

| Actor | Can provide | Cannot obtain by default |
|---|---|---|
| Human requester | intent, request, approval where authorized | unrestricted authority |
| Mission/control plane | goals, plans, proposals | protected execution authority |
| Model/planner | proposals/inferences | authority, trust-root mutation, direct execution |
| Normal executor | execute admitted effect | admission, STOP release, recovery release |
| Evidence producer | observations/evidence candidates | claim acceptance |
| Reconciliation authority | external-world observations/reconciliation | arbitrary authority |
| Verifier | bounded claim evaluation | changing criteria it verifies |
| Recovery authority | recovery operations/release proposal | self-authorization |
| STOP authority | safety fence | normal execution authority |
| Change authority | update/configuration proposal and governance | bypassing safety admission |
| Decommission authority | lifecycle closure | resurrection |
| External provider | external response/effect | Nexo authority |
| External world | actual effects/state | internal state mutation by assumption |

Every boundary crossing must identify source, destination, flow type, identity, scope, version context, freshness where relevant, and failure semantics.

## A02 — Authority and ownership matrix

| State | Authoritative owner | Other roles |
|---|---|---|
| TrustRoot | Trust authority | verifier may inspect |
| IdentityContext | Identity authority | services consume |
| AuthorityContext | Authority authority | core validates |
| PolicyBaseline | Safety/policy authority | core admits |
| InvariantBaseline | Safety authority | verifier checks |
| Operation | Mission/control authority under protected transition | executor observes |
| EffectBinding | Admission boundary | executor consumes |
| ControlLease/Fence | Coordination authority | core enforces |
| StopState | Independent STOP authority | executor cannot clear |
| RecoveryFence | Recovery authority | normal executor cannot release |
| VersionSet | Change/config authority | safety core admits |
| ExternalEffectState | Reconciliation authority | executor reports |
| EvidenceRecord | Evidence subsystem | verifier consumes |
| VerificationClaim | Verification subsystem | core consumes bounded result |
| DecommissionState | Decommission authority | recovery must respect |
| DurableHistory | Protected history owner | no authority implied by history |

Ownership of state is not authority over all state.

Authority must be scoped, versioned, revocable, identity-bound and evaluated against current policy, invariants and VersionSet. Protected authority is bound to the exact effect where applicable.

## A03 — Canonical object model

### IdentityContext
Who/what is acting: identity_id, identity_epoch, authentication/attestation state, trust-root version.

### AuthorityContext
Permission for a scoped action: context ID, subject, scope, issuer/basis, authority epoch, policy/invariant versions, VersionSet context, expiry/revocation.

### Operation
Logical requested work: operation_id, immutable request fingerprint, mission/goal relation, parent/delegation relation, lifecycle.

### EffectBinding
Immutable operation-to-effect binding:
effect_id/effect_key, operation_id, target fingerprint, normalized parameter fingerprint, preconditions, expected effect, idempotency/replay, reversibility/compensation.

### ControlLease/Fence
Coordination ownership only: lease_id, owner, generation, fence token, expiry, state.

### StopState
Safety enforcement state: stop_id, scope, stop_epoch, state, initiator authority, enforcement proof, verification state.

### RecoveryFence
Fenced recovery authority: fence ID, stop/authority epoch bindings, gate/version context, recovery epoch, recovery owner, reconciliation and release state.

### VersionSet
Complete safety-relevant compatibility context: runtime, safety gate, verifier, policy, invariants, configuration, schema/state-machine semantics, trust roots, dependency graph and recovery protocol as applicable.

### ExternalEffectState
Nexo's knowledge of an external effect:
NOT_ATTEMPTED, EXECUTING, UNKNOWN, PARTIALLY_APPLIED, APPLIED, REVERSED, RECONCILED.

### EvidenceRecord
Exact observation context: evidence ID, claim/effect/target identity, observer, observation time, freshness deadline, provenance, dependency closure, trust-root/policy/invariant/version context, validity/invalidation.

### VerificationClaim
Bounded proposition: claim ID, property kind, exact scope, required evidence, assumptions, context fingerprint, validity, assurance and expiry/review.

### ReconciliationRecord
Accepted external-effect observation bound to effect identity, source, provenance, freshness, reconciliation authority/generation and evidence context.

### DecommissionRecord
Terminal lifecycle closure: authority, lifecycle epoch, active worker/lease/delegation state, pending effects, secret/recovery/update closure and final verification.

## A04 — Protected transition contract

Every protected transition declares:
TRANSITION_ID, OWNER, AUTHORITY_BASIS, REQUIRED_SCOPE, INPUT_STATE, PRECONDITIONS, READ_SET, WRITE_SET, AFFECTED_OBJECTS, LINEARIZATION_POINT_OR_EQUIVALENT, POSTCONDITIONS, FORBIDDEN_CONCURRENT_TRANSITIONS, DURABILITY_REQUIREMENT, CRASH_SEMANTICS, PARTITION_SEMANTICS, TIMEOUT_SEMANTICS, RETRY/IDEMPOTENCY_SEMANTICS, EVIDENCE_REQUIREMENTS, INVALIDATION_TRIGGERS, RECOVERY_PATH, VERIFICATION_METHOD, TRACEABILITY.

### Critical transitions

T-AUTH-01 Authorization admission:
AUTHORIZED only after exact effect binding, current authority, current safety context, no blocking STOP/recovery fence, compatible VersionSet and required coordination state.

T-AUTH-02 Revocation:
new protected work using revoked context is rejected; ordering against authorization and final execution is explicit. Historical effects are not erased.

T-RES-01 Reservation/fencing:
bind operation, EffectBinding, current authorization and coordination generation/fence. Stale fence rejects. Reservation cannot create authority.

T-EXEC-01 Final execution admission:
recheck identity, authority, effect identity, fence, STOP, recovery, VersionSet, policy/invariants and required assurance before crossing into the external-effect path.

T-EFF-01 External intent:
durably establish exact effect identity and retry/idempotency semantics before external attempt.

T-EFF-02 External outcome:
APPLIED, NOT_APPLIED, UNKNOWN or PARTIALLY_APPLIED. Timeout/lost response never implies NOT_APPLIED. New operation identity cannot resolve old UNKNOWN.

T-STOP-01 STOP enforcement:
STOP becomes effective at a defined protected transition. Executor acknowledgement is evidence, not authority to declare STOP verified.

T-RECOV-01 Recovery admission:
requires current recovery fence, authority, STOP state, artifact/config integrity, VersionSet, external-effect state and required evidence. Checkpoint restoration alone is insufficient.

T-RECOV-02 Recovery release:
only explicit release returns quarantined state to normal execution; release is derived from current conditions, not checkpoint state.

T-UPD-01 VersionSet activation:
integrity, provenance, dependency closure, semantic compatibility, safety delta review, independent admission, staging, old-version fencing, activation, verification and reconciliation where applicable.

T-DECOM-01 Decommission closure:
authority/delegation revocation, worker termination, lease closure, pending-effect reconciliation, secret handling, recovery/update closure and final verification. Restart cannot reverse decommissioning.

## Cross-transition conflicts

Authorization ↔ Revocation
Authorization ↔ Policy/Invariant Change
Execution ↔ STOP
Execution ↔ Recovery
Execution ↔ Decommission
Evidence ↔ Invalidation
Verification ↔ Policy/Version Change
Recovery ↔ UNKNOWN
Update ↔ Execution
Decommission ↔ Recovery

No pair may depend on timing luck.

## Required linearization correspondence

For L3 transitions:
ABSTRACT PRESTATE → implementation/protocol read set → guard → linearization event → write set → ABSTRACT POSTSTATE.

For L4:
INTERNAL INTENT → external attempt → outcome/UNKNOWN → observation → reconciliation → bounded claim.

Internal linearization never proves external-world outcome by itself.

## Gate after A01-A04

PASSED:
- system context and boundaries;
- actor/stakeholder boundaries;
- state ownership;
- authority separation;
- canonical object identity;
- protected-transition contract shape;
- conflict inventory.

OPEN:
- authoritative store topology;
- exact linearization protocol;
- cross-store atomicity;
- provider-specific reconciliation;
- trusted-time semantics;
- implementation refinement.

NEXT:
A05 authoritative-state topology → A06 linearization protocol selection → re-audit A01-A04 against selected topology before technology choice.

Architecture implementation remains prohibited until that gate.

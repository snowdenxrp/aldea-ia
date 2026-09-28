# GLOBAL-AUDIT-026 — CLAIM-SCOPED TRANSITION SCHEMA — 2026-09-28

## Purpose
Resolve the highest-risk omissions found by GLOBAL-AUDIT-025 without prematurely freezing a physical finite model.

## Classification rule
A candidate is promoted to a semantic transition only when its occurrence can alter:
1. current P_AA observation;
2. legal future continuation space;
3. actual admission linkage;
4. invalidation/revocation semantics; or
5. whether the result must be UNKNOWN.

Otherwise it may be represented as a parameter, derived relation, auxiliary history fact, or excluded by the claim contract.

## Schema

### T0 Authority lifecycle
AUTH_ISSUE(authority, epoch, scope, policy, delegation, fence)
AUTH_REVOKE(authority, generation)
EPOCH_ADVANCE(authority, epoch)
DELEGATION_CHANGE(delegation, generation, direction)
CAPABILITY_CHANGE(capability, scope, generation)
FENCE_ADVANCE(fence, generation)

Status: SEMANTICALLY RELEVANT. These cannot safely collapse to subject identity or a generic validity bit. Exact physical decomposition remains OPEN.

### T1 Policy / governance lifecycle
POLICY_CHANGE(policy, generation)
GOVERNANCE_CHANGE(delegation/policy domain, generation)

Status: SEMANTICALLY RELEVANT when the changed policy/delegation participates in the admission claim. Otherwise claim-excluded only by explicit scope.

### T2 Resource lifecycle
RESOURCE_REINCARNATE(resource, old_incarnation, new_incarnation)
RESOURCE_FENCE_ADVANCE(resource, fence_generation)
RESOURCE_RESTORE(resource, incarnation, generation)

Status: incarnation change is mandatory semantic distinction when resource identity can remain equal while authorization validity changes. Restore is conditional and cannot imply reauthorization.

### T3 Admission / bridge lifecycle
ADMISSION_CREATE(admission)
ADMISSION_BIND(admission, authority, bridge, resource_incarnation, operation, attempt)
ADMISSION_REVOKE(admission, generation)
ADMISSION_EXPIRE(admission, generation)
ADMISSION_CONSUME(admission, generation)

Status: actual binding is core P_AA semantic information. Revoke/expire/consume are distinct if they change future legal continuations. Physical representation may pack them into a relation/state machine.

### T4 Lease / protocol lifecycle
LEASE_ISSUE(lease, admission, expiry, generation)
LEASE_RENEW(lease, generation, new_expiry)
LEASE_EXPIRE(lease, generation)
LEASE_CONSUME(lease, generation)
PROTOCOL_SELECT(admission, protocol, generation)
ATOMIC_LINEARIZE(admission, linearization_event)
RECHECK_FACT_CAPTURE(admission, factset_id, dependency_generation)
RECHECK_FACT_INVALIDATE(admission, factset_id, reason)

Status: protocol labels are not automatically semantic, but these events are retained when they change legal continuations or historical validity. ATOMIC_LINEARIZE must not be erased if ordering affects claim semantics.

### T5 Operation / attempt lifecycle
OPERATION_CREATE(operation)
ATTEMPT_CREATE(attempt, operation)
ATTEMPT_BIND(attempt, admission)
ATTEMPT_REBIND(attempt, admission)
ATTEMPT_ABORT(attempt, reason)
RETRY(attempt, new_attempt_or_same_attempt)

Status: RETRY requires explicit parameterization. “same attempt” and “new attempt” cannot be assumed equivalent.

### T6 Dependency / evidence lifecycle
DEPENDENCY_VERSION_ADVANCE(dependency, generation)
PROVENANCE_CAPTURE(admission, dependency_digest, completeness)
PROVENANCE_INVALIDATE(admission, dependency_generation)
EVIDENCE_INVALIDATE(evidence, reason)

Status: semantic only where the dependency/evidence is claim-relevant. Loss of required provenance must permit UNKNOWN, never favorable reconstruction.

### T7 Recovery / STOP
STOP_REQUEST(operation)
STOP_ENFORCE(operation)
RECOVERY_FENCE_ESTABLISH(operation, fence)
RECONCILIATION_REQUIRED(operation)
RECONCILIATION_COMPLETE(operation, outcome)
RECOVERY_RELEASE(operation)

Status: CONDITIONAL on P_AA scope. If recovery is inside the claim universe, these must be modeled; if outside, the exclusion must be explicit.

## Current canonical transition universe
For the next bounded research model, use the following semantic classes, not raw implementation events:

A AUTHORITY
B POLICY_DELEGATION
C RESOURCE
D ADMISSION_BINDING
E LEASE_PROTOCOL
F ATTEMPT_RETRY
G RECHECK_DEPENDENCY
H STOP_RECOVERY (conditional)

Each class is parameterized by stable identities, generations/incarnations, and event ordering. This prevents accidental multiplication of physically separate events while preserving semantic distinctions.

## Required parameter set
At minimum:
AuthId, SubjectId, AuthorityEpoch, CapabilityScope, DelegationGeneration, PolicyGeneration, FenceGeneration, ResourceId, ResourceIncarnation, OperationId, AttemptId, AdmissionId, BridgeId/LeaseId, ProtocolId/Generation, EventId, LinearizationId/Order, RecheckFactSetId, DependencyGeneration, ProvenanceCompleteness.

## Explicit exclusions
No transition may be omitted merely because current state fields appear equal. Exclusion requires a claim-scope argument showing that the transition cannot affect current/future P_AA observations and cannot change UNKNOWN eligibility.

## Gate result
The previous 17-label alphabet is replaced as a research abstraction by the eight semantic transition classes above. This is NOT yet a frozen formal model and is NOT an implementation design.

Next: GLOBAL-AUDIT-027 — adversarial parameter sufficiency and bounded-domain construction, testing whether the proposed parameter set itself loses claim-relevant distinctions.

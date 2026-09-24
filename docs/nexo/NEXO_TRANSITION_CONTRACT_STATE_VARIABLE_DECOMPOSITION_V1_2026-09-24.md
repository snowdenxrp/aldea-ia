# NEXO TRANSITION CONTRACT AND STATE VARIABLE DECOMPOSITION V1
Date: 2026-09-24
Status: RESEARCH/CONSOLIDATION — ARCHITECTURE STILL BLOCKED

## External basis
NIST SP 800-160 Rev. 1 treats system states and transitions as first-class security objects and distinguishes secure, insecure, and indeterminate states; it also requires protective failure and trusted recovery. NIST further states that policy defines allowed behavior while mechanisms realize policy. This supports decomposing each transition into explicit state, authority, conditions, and enforcement rather than relying on informal service behavior.

## 1. Purpose
The canonical graph is now decomposed into authoritative state variables and transition contracts. This remains semantic research; no implementation topology is selected.

## 2. State-variable domains

### Identity domain
- identity_id
- identity_epoch
- authentication/attestation status
- credential/trust-root version

### Authority domain
- authority_context_id
- authority_epoch
- scope
- basis
- issuer
- issued_at / expires_at
- revocation state
- policy_version
- invariant_version

### Operation domain
- operation_id
- immutable request fingerprint
- lifecycle state
- parent/delegation reference
- mission/goal context

### Effect domain
- effect_id
- effect_key
- operation_id
- target identity/fingerprint
- normalized parameter fingerprint
- preconditions
- expected effect
- idempotency/replay policy
- reversibility/compensation semantics

### Coordination domain
- lease_id
- owner identity
- generation
- fence token
- lease state
- expiry
- coordination epoch

### Safety/STOP domain
- stop_id
- target scope
- stop epoch
- stop state
- initiator/authority
- enforcement proof
- verification status

### Recovery domain
- recovery_fence_id
- stop epoch binding
- authority epoch binding
- gate epoch
- recovery epoch
- recovery owner
- recovery token
- reconciliation status
- release state

### Configuration domain
- version_set_id
- artifact versions
- runtime version
- safety gate version
- verifier version
- policy/config/schema versions
- trust-root version
- dependency graph fingerprint

### Evidence domain
- evidence_id
- claim_id
- operation/effect/target binding
- observer identity
- observation timestamp
- freshness deadline
- provenance
- dependency closure
- trust-root/policy/invariant/version context
- evidence lifecycle state

### Verification domain
- claim_id
- property kind
- required evidence set
- verification context fingerprint
- derived verification result
- assurance status
- invalidation causes

### External-world domain
- effect state: NOT_ATTEMPTED / EXECUTING / UNKNOWN / PARTIALLY_APPLIED / APPLIED / REVERSED / RECONCILED
- external observation references
- reconciliation generation
- last independently accepted world state

### Lifecycle/decommission domain
- lifecycle epoch
- decommission state
- active worker/delegation/lease counts
- pending effect count
- secret/recovery closure status

## 3. Transition contract template

Every protected transition must define:

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

## 4. Critical transition contracts

### T-AUTH-01: Fingerprinted → Admitted
Reads:
- operation fingerprint
- current policy/invariant
- structural requirements

Writes:
- admission decision/context reference

Must not create:
- execution authority
- lease
- external effect

Failure:
- ambiguity → HOLD/REJECT, never implicit admission.

### T-AUTH-02: Admitted → Authorized
Reads:
- exact operation/effect identity
- current AuthorityContext
- policy/invariant baseline
- stop/recovery fences

Writes:
- bound authorization context

Linearization requirement:
the authoritative acceptance of current authority for this exact effect.

Forbidden:
- stale cached authority;
- model confidence;
- prior approval for a different target/scope.

### T-RES-01: Authorized → Reserved
Reads:
- current authority
- effect binding
- coordination state

Writes:
- lease/fence generation

Linearization requirement:
exclusive or appropriately scoped reservation becomes authoritative.

Forbidden:
- two active owners for the same protected resource without an explicit multi-owner policy.

### T-EXEC-01: Prepared → Executing
Reads:
- current authority
- current fence
- stop state
- current VersionSet
- effect binding

Writes:
- execution admission state

Linearization requirement:
final protected admission immediately before actuation or its equivalent fencing point.

### T-EFF-01: Executing → External Outcome
Reads:
- effect identity
- external response/observation

Writes:
- external-effect state

Semantics:
response loss/crash/timeout may yield UNKNOWN.

Forbidden:
- local commit proving external effect.

### T-REC-01: External Outcome → Reconciled
Reads:
- exact effect identity
- external observation
- provenance
- freshness
- reconciliation authority

Writes:
- reconciliation record/state

Requirement:
observation must be sufficient to distinguish this effect from competing effects.

### T-VER-01: Reconciled → Verified
Reads:
- reconciliation evidence
- current policy/invariant
- current authority where required
- dependency closure
- evidence validity

Writes:
- derived verification result

Requirement:
verification status is derived, not manually promoted.

### T-COM-01: Verified → Committed
Reads:
- current verified claim
- operation/effect identity
- applicable authority/configuration context

Writes:
- durable mission history

Requirement:
commit records the verified historical outcome; later revocation does not rewrite history.

### T-STOP-01: Stop Requested → Stop Enforcing
Reads:
- stop authority
- target scope
- current safety context

Writes:
- stop enforcement state/epoch

Requirement:
independent enforcement path.

### T-STOP-02: Stop Enforcing → Stop Verified
Reads:
- independent enforcement evidence
- actuation state
- external cancellation evidence where relevant

Writes:
- verified stop state

Requirement:
executor acknowledgement alone is insufficient.

### T-RECOV-01: Restarted → Quarantined
Reads:
- restart identity
- current recovery fence

Writes:
- quarantine state

Requirement:
restart never creates authority.

### T-RECOV-02: Recovery Reconciled → Release Eligible
Reads:
- current fence
- current authority
- reconciliation
- stop state
- VersionSet
- dependency closure

Writes:
- derived release eligibility

Requirement:
no unresolved critical effect and no blocking safety condition.

### T-UPD-01: Proposed → Independently Admitted
Reads:
- artifact identity/provenance
- signatures/attestation
- dependency closure
- semantic compatibility
- safety delta
- common-mode analysis

Writes:
- update admission

Requirement:
signature/provenance alone cannot authorize safety activation.

### T-DECOM-01: Decommission → Closed
Reads:
- active workers
- delegations
- leases
- pending effects
- recovery/update paths
- secrets

Writes:
- final decommission state

Requirement:
closure requires evidence that authority and residual effect paths are fenced.

## 5. State-variable ownership rule

Each authoritative variable has exactly one authoritative owner or an explicitly specified serialization protocol.

But:
OWNER_OF_STATE != AUTHORITY_TO_CHANGE_ALL_STATE.

A transition may require cooperation from several owners without transferring ownership.

## 6. Read/write-set rule

A protected transition must declare its read set and write set.

Reason:
hidden reads are a major source of race conditions. If a transition depends on a policy version, stop epoch, authority epoch or configuration version, that dependency must be explicit.

A transition cannot be considered isolated merely because it writes one database record.

## 7. Derived-state rule

The following are derived:
- release eligibility;
- current assurance status;
- proof status;
- affected claim set;
- whether evidence is stale/invalidated;
- whether a VersionSet is admissible.

Persisted caches may exist for performance, but cannot become the authoritative source of truth.

## 8. New invariants

VAR-01: Every safety-relevant authoritative state variable has one owner or explicit serialization semantics.
VAR-02: Every protected transition declares read and write sets.
VAR-03: Hidden safety-relevant reads are prohibited.
VAR-04: Authority, coordination, evidence, verification and external truth remain distinct state domains.
VAR-05: Derived status cannot become authoritative merely because it is persisted.
VAR-06: Transition contracts include crash, partition, timeout and retry semantics.
VAR-07: External outcome state is not inferred from local transaction success.
VAR-08: Critical state changes bind to exact relevant versions/epochs.
VAR-09: Ownership transfer does not automatically transfer unrelated authority.
VAR-10: A transition is incomplete until its verification and recovery semantics are specified.

## 9. New research gates

Before architecture construction:
1. validate state-variable completeness against all known objects;
2. derive conflict/read-write pairs automatically;
3. map every protected transition to race inventory;
4. map every transition to formal state variables;
5. determine minimum atomicity for each read/write set;
6. define durable storage requirements;
7. define exact TCB boundary from these variables/transitions;
8. identify any variable whose semantics cannot be enforced in the intended deployment environment.

Architecture remains BLOCKED.

DESIGNED != IMPLEMENTED != TESTED != VERIFIED.

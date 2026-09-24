# NEXO CANONICAL STATE-TRANSITION GRAPH V1
Date: 2026-09-24
Status: RESEARCH/CONSOLIDATION — ARCHITECTURE STILL BLOCKED

## External basis
NIST SP 800-160 Rev. 1 explicitly treats secure, insecure, and indeterminate states and requires secure transitions, including trusted recovery. NASA systems engineering guidance treats state analysis, timing analysis, requirements traceability, configuration baselines, and verification/validation as explicit engineering work products. Therefore the canonical graph below is a semantic model and verification baseline, not an implementation design.

## 1. Graph principles

1. Every safety-relevant state has explicit entry and exit conditions.
2. Every transition has an owner, authority basis, preconditions, postconditions, prohibitions, evidence requirements and failure semantics.
3. No reboot, timeout, process exit, lease expiry, missing telemetry or new operation identifier creates authority or resolves UNKNOWN.
4. Derived states are recomputed from authoritative inputs; they are not arbitrary writable flags.
5. External-world states remain distinct from local control-plane states.
6. Recovery is a transition system, not a shortcut from restart to execution.
7. Stop is an independent safety plane.
8. Version/configuration context is part of the semantics of safety-relevant decisions.

## 2. Top-level lifecycle graph

REQUESTED
→ NORMALIZED
→ FINGERPRINTED
→ ADMITTED
→ AUTHORIZED
→ RESERVED
→ PREPARED
→ EXECUTING
→ {EXTERNAL_UNKNOWN | PARTIALLY_APPLIED | APPLIED}
→ OBSERVED
→ RECONCILED
→ VERIFIED
→ COMMITTED

Alternative controlled exits:
- REQUESTED/NORMALIZED/FINGERPRINTED → REJECTED
- ADMITTED → HOLD
- AUTHORIZED/RESERVED/PREPARED → REVOKED or BLOCKED
- any executable state → STOP_ENFORCING / EXECUTION_BLOCKED where stop applies
- critical uncertainty → UNKNOWN/HOLD/QUARANTINED

No direct:
EXECUTING → COMMITTED
EXECUTING → VERIFIED
TIMEOUT → NOT_APPLIED
RESTART → AUTHORIZED
NEW_OPERATION_ID → RESOLVED_OLD_EFFECT

## 3. Operation state semantics

### REQUESTED
Input exists but has not yet acquired canonical identity.

### NORMALIZED
Canonical representation exists.

### FINGERPRINTED
Immutable request/effect-relevant identity is established.

### ADMITTED
Request satisfies structural/policy admission conditions but is not yet execution authority.

### AUTHORIZED
A current AuthorityContext authorizes this exact operation/effect scope.

### RESERVED
Required coordination/fencing protection has been acquired.

### PREPARED
Execution prerequisites are satisfied and attested, but actuation has not yet occurred.

### EXECUTING
The system has crossed the final protected gate and may cause the intended effect.

### EXTERNAL_UNKNOWN
Outcome cannot currently be determined.

### PARTIALLY_APPLIED
Evidence indicates some but not all expected effect semantics occurred.

### APPLIED
External observation indicates the intended effect occurred, but verification may remain pending.

### OBSERVED
Relevant external state has been observed with provenance/freshness metadata.

### RECONCILED
The observed external state has been matched to the exact effect identity and operation semantics.

### VERIFIED
Current policy/invariant/context plus valid evidence support the claim.

### COMMITTED
Verified outcome is durably accepted into mission history under the applicable authority and configuration context.

## 4. Stop plane

NORMAL
→ STOP_REQUESTED
→ STOP_ENFORCING
→ {EXECUTION_BLOCKED | ACTUATION_INTERRUPTED}
→ STOP_VERIFIED
→ RECONCILIATION_REQUIRED
→ {RECOVERABLE | QUARANTINED}

Forbidden:
- executor clears STOP;
- reboot clears STOP;
- lease expiry clears STOP;
- executor ACK alone proves external cancellation;
- STOP is treated as advisory.

## 5. Recovery plane

RESTARTED
→ QUARANTINED
→ IDENTITY_ATTESTED
→ ARTIFACT_CONFIG_VERIFIED
→ CURRENT_FENCE_OBSERVED
→ CURRENT_AUTHORITY_VALIDATED
→ RECOVERY_OWNER_ACQUIRED
→ RECOVERY_RECONCILED
→ RELEASE_ELIGIBLE
→ EXPLICIT_RELEASE
→ EXECUTION_ENABLED

Recovery can restore control state, but cannot:
- manufacture authority;
- erase unresolved external UNKNOWN;
- bypass STOP;
- convert a checkpoint into current authorization;
- reuse stale recovery tokens.

## 6. Update/configuration plane

PROPOSED
→ IDENTIFIED
→ HASH_BOUND
→ PROVENANCE_VERIFIED
→ SIGNATURE_ATTESTATION_VERIFIED
→ SOURCE_BUILDER_POLICY_VERIFIED
→ DEPENDENCY_CLOSED
→ SEMANTIC_POLICY_COMPATIBLE
→ SAFETY_DELTA_REVIEWED
→ THREAT_COMMON_MODE_REVIEWED
→ INDEPENDENTLY_ADMITTED
→ STAGED
→ ATTESTED_STAGED
→ OLD_FENCED
→ ACTIVATED
→ CONTROL_PLANE_VERIFIED
→ WORLD_RECONCILED
→ COMMITTED

A component can be individually valid while the complete VersionSet is invalid.

## 7. Evidence lifecycle

OBSERVED
→ VALID
→ {STALE | INVALIDATED}

A new context change can invalidate previously valid evidence:
- authority epoch;
- policy/invariant version;
- dependency/trust-root change;
- artifact/version change;
- observer trust change;
- target/effect identity mismatch;
- freshness expiry.

Evidence status must be derived from its binding context, not permanently trusted because it once passed.

## 8. Delegation lifecycle

PROPOSED
→ ISSUED
→ ACTIVE
→ {EXPIRED | REVOKED | CONSUMED | DECOMMISSIONED}

Delegation scope is bounded by parent authority. Parent revocation can invalidate dependent delegation.

## 9. Decommission lifecycle

DECOMMISSION_REQUESTED
→ EFFECTS_FENCED
→ AUTHORITY_REVOKED
→ DELEGATIONS_REVOKED
→ WORKERS_CONFIRMED_TERMINATED
→ LEASES_CONFIRMED_CLOSED
→ PENDING_EFFECTS_RECONCILED
→ SECRETS_HANDLED
→ RECOVERY/UPDATE_PATHS_CLOSED
→ FINAL_STATE_RECORDED
→ DECOMMISSIONED

Restart of a decommissioned identity is forbidden without a separately governed re-provisioning process that creates a new identity/context.

## 10. Forbidden transition catalogue

F-01 RESTART → AUTHORIZED
F-02 CHECKPOINT → AUTHORIZED
F-03 LEASE_HELD → AUTHORIZED
F-04 EVIDENCE_VALID → AUTHORIZED
F-05 PROOF_PASS → AUTHORIZED
F-06 METRIC_SUCCESS → VERIFIED
F-07 TIMEOUT → NOT_APPLIED
F-08 PROCESS_EXIT → NOT_APPLIED
F-09 NEW_OPERATION_ID → RESOLVE_UNKNOWN
F-10 EXECUTOR_ACK → STOP_VERIFIED
F-11 RECOVERY_OWNER → EXECUTION_AUTHORITY
F-12 UPDATE_SIGNATURE → SAFETY_ADMISSION
F-13 ROLLBACK_IMAGE → SAFE_ROLLBACK
F-14 REBOOT → STOP_CLEARED
F-15 LEASE_EXPIRY → EXTERNAL_EFFECT_ABSENT
F-16 HISTORICAL_PASS → CURRENT_ASSURANCE
F-17 OLD_EVIDENCE → CURRENT_CLAIM_AFTER_CONTEXT_CHANGE
F-18 DECOMMISSIONED → ACTIVE_BY_RESTART
F-19 PROCESS_OWNERSHIP → POLICY_AUTHORITY
F-20 AUDIT_RECORD → STATE_TRANSITION_AUTHORITY

## 11. Cross-plane constraints

### Operation × Stop
STOP may prevent execution and force reconciliation, but does not rewrite historical operation identity.

### Operation × Recovery
Recovery may restore operation state, but unresolved external effect state survives.

### Operation × Update
A VersionSet change can invalidate execution/release decisions and requires impact analysis.

### Evidence × Update
Evidence tied to old semantics cannot silently support new semantics.

### Authority × Recovery
Recovery ownership is not execution authority.

### Decommission × Recovery
Decommission must close recovery paths; recovery cannot resurrect decommissioned authority.

### Reconciliation × Evidence
Reconciliation produces evidence but is itself subject to trust, provenance and common-mode analysis.

## 12. Graph completeness criteria

The graph is not complete until every node/edge has:
- stable identifier;
- state owner;
- authority basis;
- required scope;
- preconditions;
- postconditions;
- affected state;
- forbidden concurrent transitions;
- linearization point/equivalent protocol;
- durability requirement;
- timeout semantics;
- crash semantics;
- partition semantics;
- retry/idempotency semantics;
- evidence requirements;
- invalidation conditions;
- recovery path;
- verification method;
- traceability to requirement/invariant.

## 13. New invariants

GRAPH-01: Every protected state transition is represented explicitly.
GRAPH-02: Every transition has explicit pre/postconditions.
GRAPH-03: Every protected transition has explicit concurrency semantics.
GRAPH-04: No forbidden shortcut is omitted merely because it is operationally unlikely.
GRAPH-05: External-effect uncertainty is represented as a first-class state.
GRAPH-06: Recovery and STOP are independent planes with explicit interactions.
GRAPH-07: Configuration/version context is part of safety-relevant state.
GRAPH-08: Derived statuses cannot become authority through persistence.
GRAPH-09: Decommissioning is a state machine with closure evidence.
GRAPH-10: Graph completeness is a prerequisite for implementation and formalization claims.

## 14. Remaining gaps

The graph now gives a canonical semantic backbone, but these remain open:
1. exact state-variable decomposition;
2. exact ownership and authoritative store per state;
3. linearization mechanism for each protected edge;
4. atomicity across state domains;
5. formal TLA+ unification;
6. actual SANY/TLC execution;
7. implementation correspondence/refinement;
8. runtime enforcement;
9. fault-injection and adversarial concurrency testing;
10. external reconciliation implementation;
11. migration/data semantic preservation;
12. liveness/fairness scope.

Status: ARCHITECTURE BLOCKED. The graph is a research/design baseline, not an implementation.

DESIGNED != IMPLEMENTED != TESTED != VERIFIED.

# AB105.096R — durable continuity, recovery and migration semantics

Date: 2026-09-30
Chain: AB105.095R -> AB105.096R

## Objective
Audit the remaining Nexo-core continuity/recovery requirement against primary evidence, without reopening the already-closed provider evidence campaign.

## Fresh evidence
NIST SP 800-53 CP-10 requires recovery and reconstitution to a known state after disruption, compromise or failure, and includes reauthorization and renewed monitoring as part of reconstitution. CP-9 treats backups as system state as well as user data and calls for integrity protection and restoration testing. citeturn0search24turn0search25
RFC 8995 separates bootstrapping from ordinary booting: trust/configuration established during bootstrap is expected to persist across restarts, while ownership/trust transfer is a distinct process. It also uses explicit identity and authorization during bootstrap. citeturn0search0turn0search27

## Semantic decomposition
Durable continuity is not one operation. Nexo must distinguish:
- CHECKPOINT_CREATED: a state artifact was persisted.
- CHECKPOINT_INTEGRITY_VERIFIED: the artifact is authentic/integrity-protected.
- CHECKPOINT_COVERAGE: which state, epoch, authority, pending operations and evidence dependencies it represents.
- RECOVERY_SELECTED: a particular checkpoint/recovery path was chosen.
- RECOVERY_RECONSTRUCTED: state was rebuilt from the selected evidence.
- RECOVERY_REAUTHORIZED: authority was re-established for the recovered runtime.
- RECOVERY_RECONCILED: in-flight/pending external effects were reconciled.
- RECOVERY_RELEASED: the recovered runtime is permitted to perform consequential effects.

## Critical anti-collapse findings
CHECKPOINT_EXISTS != CURRENT_TRUTH.
CHECKPOINT_INTEGRITY != SEMANTIC_CORRECTNESS.
CHECKPOINT_VALID != CURRENT_AUTHORITY.
CHECKPOINT_NEWER != CAUSALLY_COMPLETE.
RECOVERY_RECONSTRUCTED != RECOVERY_REAUTHORIZED.
RECOVERY_REAUTHORIZED != EXTERNAL_EFFECTS_RECONCILED.
RECOVERY_COMPLETE != ZERO_PRIOR_EFFECT.
MIGRATION_COMPLETE != SAME_RUNTIME_CONTINUITY.
STATE_COPY != AUTHORITY_TRANSFER.
RESTORE_SUCCESS != MISSION_STATE_PROVEN.

## Recovery boundary
A recovered Nexo instance must not resume consequential behavior merely because its local state is internally consistent. It needs a current authority decision, an epoch/fence check, and reconciliation of effects that may have occurred before failure or while the instance was unavailable.
This follows directly from the already-closed authorization, evidence freshness, and effect/reconciliation semantics: recovery is a new observation/decision boundary, not a continuation by assumption.

## Migration boundary
Migration must be treated as a state/authority transition with explicit identity and ownership semantics. A copied state artifact can establish continuity evidence, but it cannot by itself establish that the receiving runtime is authorized to act as the predecessor.
RFC 8995 provides a useful external analogue: device identity, ownership authorization, and trust-anchor establishment are separate bootstrap concerns rather than one implicit 'restore' event. citeturn0search0

## Minimal Nexo recovery contract
RECOVERY_ID
PREDECESSOR_RUNTIME_ID
RECOVERING_RUNTIME_ID
CHECKPOINT_ID
CHECKPOINT_EPOCH
CHECKPOINT_COVERAGE
CHECKPOINT_INTEGRITY_RESULT
CURRENT_AUTHORITY_DECISION
CURRENT_AUTHORITY_EPOCH
FENCE_STATE
PENDING_OPERATION_SET
OBSERVED_EFFECT_SET
UNOBSERVABLE_EFFECT_SET
RECONCILIATION_RESULT
RECOVERY_POLICY_VERSION
RELEASE_DECISION
FAIL_STATE

## Required states
RECOVERY_UNSTARTED
RECOVERY_LOADING
RECOVERY_INTEGRITY_UNKNOWN
RECOVERY_RECONSTRUCTION_PARTIAL
RECOVERY_AUTHORITY_UNKNOWN
RECOVERY_RECONCILIATION_REQUIRED
RECOVERY_RECONCILING
RECOVERY_BLOCKED
RECOVERY_RELEASED
RECOVERY_FAILED

RELEASED must require all policy-defined prerequisites, not merely successful state loading.

## Migration semantic boundary
Migration has at least four independently auditable transitions:
1. STATE_TRANSFERRED
2. IDENTITY_BOUND
3. AUTHORITY_TRANSFERRED_OR_REESTABLISHED
4. EFFECT_OWNERSHIP_RECONCILED

No single migration-success flag should collapse these transitions.

## Result
The research confirms a real Nexo-core requirement: durable continuity must include recovery reauthorization and external-effect reconciliation, not only persistent memory/checkpoints.
The generic semantic boundary is now sufficiently defined to stop researching recovery at the conceptual level.
Remaining work is formalization and implementation testing: crash during checkpoint, crash after external request, stale authority after restore, concurrent predecessor/recovery instance, partial checkpoint, corrupted checkpoint, migration replay, and second failure during recovery.

## Status
DURABLE_CONTINUITY = SEMANTICALLY DEFINED
RECOVERY_REAUTHORIZATION = REQUIRED
RECOVERY_EFFECT_RECONCILIATION = REQUIRED
MIGRATION_AUTHORITY_BOUNDARY = SEMANTICALLY DEFINED
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.097R — adversarial recovery/migration pass: test the contract against crash, split-brain, stale epoch, partial checkpoint, replay, predecessor still active, and failure during recovery. Do not implement.
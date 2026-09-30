# AB105.097R — adversarial recovery and migration audit

Date: 2026-09-30
Chain: AB105.096R -> AB105.097R

## Objective
Attack the durable-continuity contract with adversarial recovery/migration scenarios. No implementation.

## Fresh evidence
NIST SP 800-53 CP-10 requires recovery/reconstitution to a known state and explicitly includes assessment of restored capability, continuous monitoring, and system reauthorization where required. citeturn0search24
RFC 9000 demonstrates a useful protocol-level pattern: migration is not identity-free state copying; connection identity remains explicit, identifiers have lifecycle/retirement rules, and path migration is validated. RFC 9000 also warns that 0-RTT application data has no replay protection, reinforcing that resumed state/action must not be equated automatically with a fresh authorized operation. citeturn0search0turn0search27

## Adversarial cases
### A — crash after checkpoint, before external effect
Recovered checkpoint must not invent the effect. Pending operation remains unresolved until effect evidence/reconciliation establishes its state.
Result: PASS.

### B — crash after external request, before local acknowledgement
Checkpoint can legitimately say UNKNOWN while provider may have executed the effect. Recovery must reconcile rather than retry blindly.
Result: PASS.

### C — stale authority after restore
A valid checkpoint can contain authority that was valid at T0 but revoked or superseded at T1.
Result: PASS. Recovery requires fresh authority evaluation/epoch check.

### D — predecessor remains active
New runtime cannot assume exclusive authority merely because it restored the latest checkpoint. Concurrent predecessor and recovering runtime create a split-brain risk.
Result: PASS. Release requires ownership/fence proof; otherwise UNKNOWN/STOP.

### E — partial/corrupt checkpoint
Integrity failure or incomplete coverage prevents treating the checkpoint as a complete state. Recovery may be bounded/partial but cannot silently fill missing state.
Result: PASS.

### F — replayed recovery request
Recovery identity must distinguish a new recovery operation from a replay. Idempotency/recovery_id prevents duplicate recovery transitions from becoming new authority grants.
Result: PASS.

### G — migration to a new runtime identity
Copied state does not prove that the destination is the authorized successor. Identity binding and authority transfer/re-establishment must be explicit.
Result: PASS.

### H — migration while an external effect is in flight
State transfer cannot close the effect ledger. The destination must inherit or reconcile pending operations before consequential release.
Result: PASS.

### I — failure during recovery
Recovery itself can fail after partial reconstruction or after authority is re-established. The runtime must not collapse RECOVERY_FAILED into either clean predecessor state or clean successor state.
Result: PASS.

### J — second failure during reconciliation
Reconciliation must be resumable/idempotent and preserve unresolved effects. A second crash cannot turn UNKNOWN into NO_EFFECT.
Result: PASS.

## New invariants
CHECKPOINT_COVERAGE != COMPLETE_RUNTIME_STATE.
RESTORED_AUTHORITY != CURRENT_AUTHORITY.
DESTINATION_IDENTITY != AUTHORIZED_SUCCESSOR.
FENCE_ISSUED != FENCE_ENFORCED.
RECOVERY_RETRY != NEW_AUTHORITY.
EXTERNAL_REQUEST_UNACKNOWLEDGED != EFFECT_ABSENT.
RECOVERY_FAILURE != CLEAN_PREDECESSOR_STATE.
RECOVERY_FAILURE != CLEAN_SUCCESSOR_STATE.
RECONCILIATION_RETRY != NEW_EXTERNAL_EFFECT.
MIGRATION != EFFECT_COMPLETION.

## New semantic finding
The critical missing piece is not another recovery state. It is **successor exclusivity**: Nexo needs a formally defined condition under which a recovered/migrated runtime is the only runtime authorized to produce consequential effects for a given authority epoch.
This condition depends on the existing epoch/fencing semantics and their enforcement boundary. Therefore it is not a new evidence taxonomy.

## Minimal successor-release predicate
SUCCESSOR_RELEASE =
  CHECKPOINT_INTEGRITY_OK
  AND CHECKPOINT_COVERAGE_SUFFICIENT
  AND CURRENT_AUTHORITY_VALID
  AND CURRENT_EPOCH_ACCEPTED
  AND PREDECESSOR_EXCLUSION_PROVEN_OR_POLICY_ACCEPTS_BOUNDED_UNKNOWN
  AND PENDING_EFFECTS_RECONCILED_OR_EXPLICITLY_BLOCKED
  AND RECOVERY_POLICY_PERMITS_RELEASE

If any mandatory predicate is UNKNOWN, policy selects UNKNOWN/STOP rather than silently releasing.

## Result
Recovery/migration adversarial coverage found no missing generic recovery primitive.
The remaining semantic gap is successor exclusivity/enforcement, which is already adjacent to the existing authority epoch + fencing model.
Do not reopen provider-specific research for this gap unless a concrete provider adapter requires it.

## Status
DURABLE_CONTINUITY_ADVERSARIAL_AUDIT = PASSED
SUCCESSOR_EXCLUSIVITY = OPEN_SEMANTIC_DEPENDENCY
AUTHORITY_EPOCH = EXISTING_DEPENDENCY
FENCING_ENFORCEMENT = UNKNOWN_UNTIL_IMPLEMENTED
RECOVERY_EFFECT_RECONCILIATION = SEMANTICALLY_DEFINED
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.098R — isolate and define the generic successor-exclusivity/authority-transfer contract, including predecessor overlap, fencing, epoch transition, and release conditions. No provider-specific implementation.
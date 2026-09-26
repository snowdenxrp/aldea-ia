# NEXO — ADMISSION / EFFECT LIFECYCLE SPLIT RESEARCH V1
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Scope
Exact boundary between a short protected admission transaction and a long-running/external effect lifecycle. Goal: determine what must be frozen before leaving the protected transaction, what may be recorded afterward, and how operation identity/reconciliation prevents a second effect.

## External reference evidence
SQLite documents atomic transaction commit/recovery and crash testing, but its transaction is local to the database boundary. It serializes writes; WAL also introduces checkpoint/recovery considerations. Therefore SQLite semantics can model a local durable boundary but do not themselves provide Nexo authority or external-world effect guarantees.
etcd documents atomic transactions guarded by comparisons, useful as a reference for protected compare-and-swap admission. This is also only a control-store primitive, not external-effect proof.

## Split model

### A. Protected admission transaction — must finish before long-running work
Freeze/commit at this boundary:
1. operation_id (stable identity for the logical operation)
2. effect_identity / idempotency identity (stable identity for the attempted effect; retry generation distinct when required)
3. mission_id + step_id
4. owner_identity + owner_generation
5. recovery_incarnation
6. authority_epoch
7. STOP context/stop_epoch and the execution permission observed at the final guard
8. resource_id + resource_incarnation
9. capability_class + fence_scope
10. policy_version + invariant_version
11. participant set / resource footprint
12. preconditions and relevant read-set
13. intended write-set / effect class
14. retry_generation
15. prepared-intent digest or equivalent immutable binding
16. admission revision/linearization evidence
17. durable state CONTROL_ADMITTED
18. enough durable history to recover the admission after crash.

The admission record must be immutable or append-only with conditional transitions. A later retry must not silently mutate the old admission into a new authority context.

### B. Long-running/external effect lifecycle — outside the admission transaction
May occur after admission:
- queueing/dispatch
- network/model/provider execution
- waiting for completion
- external acknowledgement
- timeout observation
- intermediary status
- participant outcome observations
- reconciliation attempts
- final outcome evidence
- compensation planning (but compensation is a NEW protected effect).

The lifecycle must not assume that admission remains valid forever. It carries the frozen binding and must be rejected/fenced when the provider supports enforcement, or reconciled/quarantined when it does not.

## Critical distinction
Admission proves: this exact operation/effect was admitted under this exact protected context at the linearization point.

Admission does NOT prove:
- effect was dispatched
- effect executed
- external world changed
- exactly-once external execution
- cancellation after STOP
- current ownership at a later time.

CONTROL_ADMITTED therefore remains distinct from EFFECT_FENCED, EFFECT_ATTEMPTED, OUTCOME_CONFIRMED, OUTCOME_REJECTED, and OUTCOME_UNKNOWN.

## Operation identity rule
operation_id identifies the logical operation across its lifecycle.
effect_identity identifies the concrete effect identity used for provider deduplication/reconciliation.
retry_generation identifies a new protected attempt.

A retry after UNKNOWN must NOT generate a second concrete effect blindly. First reconcile the existing effect_identity. If reconciliation cannot establish absence/completion and the provider lacks fencing/idempotency guarantees, the state remains UNKNOWN/HOLD/QUARANTINE according to effect class.

A compensation is a new operation/effect identity and must undergo its own admission.

## Timeout/crash attack matrix

### T1 timeout before dispatch
If authoritative durable state proves no dispatch and the provider boundary guarantees that proof, transition may be OUTCOME_REJECTED/NOT_ATTEMPTED. Otherwise preserve UNKNOWN.

### T2 timeout after possible dispatch
Never infer ABSENT. Keep original effect_identity. Reconcile before retry.

### T3 crash after admission before dispatch
Recovery sees CONTROL_ADMITTED. It must acquire a new recovery_incarnation/current authority before deciding whether to continue. Old admission is historical context, not self-restoring authority.

### T4 crash after dispatch before response
Outcome is UNKNOWN unless provider evidence resolves it. Retry must reconcile the same effect_identity first.

### T5 STOP after admission, before dispatch
STOP invalidates any later retry/dispatch authorization unless the provider-side fence explicitly rejects the stale admission. A fresh post-STOP admission is required for a new effect.

### T6 STOP after dispatch
STOP cannot retroactively prove non-execution. It may prevent further local retries, while external state remains UNKNOWN until reconciliation.

### T7 ownership transfer
Old owner_generation cannot authorize continuation. New owner/recovery context must reconcile the existing operation/effect identity before any new attempt.

### T8 resource replacement
resource_incarnation mismatch invalidates old authorization. Continuity must be explicitly proven; otherwise quarantine/reconcile. Never bind identity only to resource_id.

### T9 intermediary crash
If intermediary accepted admission but dispatch status is unknown, preserve UNKNOWN. Recovery must use durable operation/effect identity and provider reconciliation where available.

### T10 concurrent retry
Two workers must not create two effects from one logical operation. Protected operation/effect identity plus conditional transition (ADMITTED -> ATTEMPTED once for a given effect identity) is required locally. Provider-side idempotency/fencing is additionally required for external duplicate prevention.

### T11 partial multi-resource outcome
Participant outcomes remain separate. A confirmed participant does not resolve another UNKNOWN. Aggregate completion is claimable only when the transaction/effect contract covers all relevant participants.

## What can be safely recorded after the transaction
Post-admission records may append:
- dispatch_started / dispatch_accepted
- intermediary/provider response
- timestamps/observations
- participant outcomes
- reconciliation evidence
- final outcome classification
- failure/timeout observations.

But these records must be bound to the immutable operation_id/effect_identity/resource_incarnation and must never rewrite the original admission context as if it had been different.

## Minimum lifecycle state machine
PREPARED
  -> ADMISSION_REJECTED
  -> CONTROL_ADMITTED
  -> EFFECT_FENCED (only where provider/intermediary actually enforces the binding)
  -> EFFECT_ATTEMPTED
  -> OUTCOME_CONFIRMED | OUTCOME_REJECTED | OUTCOME_UNKNOWN

Reconciliation may promote UNKNOWN only when evidence satisfies the claim contract. It does not erase prior UNKNOWN history.

## Architectural consequence for Lúmina
For bounded local Lúmina, the protected transaction may potentially include:
OwnerFence + STOP + ResourceBinding + EffectBinding + PreparedIntent + deterministic local mutation + durable outcome/history.
For long-running/external work, the transaction must end before waiting. The effect lifecycle then uses the frozen binding and explicit reconciliation.

This means the next clean architecture should not create one giant transaction around handler(). Instead:
1. prepare;
2. protected admission/commit;
3. perform only deterministic local work that is explicitly inside that commit boundary;
4. append lifecycle observations afterward;
5. reconcile ambiguity using operation/effect identity.

## Current-code consequence
Current createLuminaEffectAdapter handlers mutate simulation state before persistState, so they cannot yet satisfy this split. persistPreparedIntent remains a hook, not the admission transaction. runtime.js mission-memory commit is separate from simulation mutation. No implementation is authorized by this research.

## Remaining UNKNOWN / OPEN
- Exact durable schema and transaction mechanism remain OPEN.
- Exact external provider fencing/idempotency contracts remain OPEN.
- Durability profile under OS crash/power loss remains OPEN.
- Formal proof of no duplicate effect remains OPEN.
- Multi-resource atomicity beyond a single protected local store remains OPEN.
- Migration/schema-version coexistence remains OPEN.
- Trusted time semantics remain OPEN.
- Fault-injection verification has NOT been performed.

## DO-NOT-REPEAT
- Do not keep the protected transaction open across network/model/provider waits.
- Do not treat CONTROL_ADMITTED as EFFECT_ATTEMPTED or OUTCOME_CONFIRMED.
- Do not create a new effect identity merely because a prior attempt is UNKNOWN.
- Do not infer absence from timeout or crash.
- Do not use operation_id alone as external fencing; provider capability matters.
- Do not let STOP/owner transfer/recovery restart inherit old authority silently.
- Do not equate resource_id with resource_incarnation.
- Do not implement V21 from this research.
- Do not claim CI/test PASS without fresh evidence.

## References
SQLite atomic commit: https://www.sqlite.org/atomiccommit.html
SQLite transactions: https://www.sqlite.org/lang_transaction.html
SQLite isolation: https://www.sqlite.org/isolation.html
SQLite WAL: https://www.sqlite.org/wal.html
etcd transaction API: https://etcd.io/docs/v3.4/learning/api/
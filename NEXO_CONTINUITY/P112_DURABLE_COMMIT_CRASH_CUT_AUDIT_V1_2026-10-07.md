# P112 DURABLE COMMIT / CRASH-CUT AUDIT V1 — 2026-10-07

Research-only. This block reconciles the current boundary question with already-established primary AB104 evidence; no new runtime execution is claimed.

## Known durable path evidence
Prior primary AB104 evidence already established:
- `stateRevision` + filesystem lock/temp/rename provide persistence conflict coordination, but are not an authority fence for in-memory effects.
- AB104.142: deterministic write/rename failure tests preserved prior durable state and cleaned temporary files.
- AB104.143: prepared intent does not prove the external effect did not happen; recovery must distinguish durable completion, prepared/effect outcome UNKNOWN, reconciliation and safe fresh execution.
- AB104.145: blocked reconciliation must not overwrite the prepared ambiguity.
- AB104.146: handler exception is not automatically terminal failure; crash after physical mutation before durable persistence remains unresolved.
- AB104.147–149: durable effect journal / prepared-intent persistence seam was introduced, but the callback was not wired to a demonstrated real durable checkpoint owner.
- AB104.150–151: no current repository caller was demonstrated to execute the Nexo step with a real `persistPreparedIntent` owner; the missing link is the execution-owner boundary itself.

## Crash-cut classification
The correct classification is:
1. Before prepared checkpoint is durably committed: protected effect must not run if the contract requires prepare-before-effect; otherwise admission is NOT_COMMITTED/blocked.
2. Durable prepared checkpoint, before handler: PREPARED / NOT_EFFECT_ATTEMPTED can be proven only if the checkpoint and handler-entry boundary are observable and ordered by the contract.
3. During handler mutation before durable outcome: EFFECT_OUTCOME UNKNOWN unless the mutation itself has an atomic durable transaction boundary.
4. Handler returns, durable outcome not yet committed: physical execution may have happened but durable history may be missing → UNKNOWN, not FAILURE.
5. Durable committed outcome: COMMITTED.
6. Crash during persistence with uncertain atomicity: UNKNOWN until storage-level evidence/reconciliation proves committed or absent.

## Critical consequence
A catch/exception path cannot infer whether the effect occurred. Retry is safe only when the prior effect outcome is known absent or the operation has an idempotent/reconciliation contract that can establish the prior result. Otherwise the correct state is HOLD/QUARANTINE/RECONCILE, not blind retry.

## Common-boundary implication
The future protected-transition executor must bind together enough authority/dependency context and durable journal state to make these crash cuts classifiable. It does NOT automatically make external effects exactly-once: external provider transaction/fencing/idempotency capability remains a separate boundary.

This is consistent with serializable transaction systems conceptually: when a serialization conflict invalidates a transaction, the failed transaction's result is not accepted and the complete decision logic is retried from the beginning. PostgreSQL explicitly documents complete-transaction retry for serialization failures. citeturn0search0

## Status
GREEN: crash-cut classes and prior primary AB evidence are consistent.
BLUE: exact durable atomic boundary and external-effect reconciliation capability remain OPEN.

## Exact next
Trace the smallest local transaction candidate: protected authority/dependency context + prepared journal + deterministic local mutation + durable state/history. Identify the precise crash cuts it can actually close, and keep external effects as a separate capability boundary.

## DO-NOT-REPEAT
No implementation; no TLC rerun; no global stateRevision promotion; no AB104.185 primary; no AB105.117R; no claim of exactly-once external effects.

# P112 EFFECT JOURNAL LIFECYCLE CRASH-CUT AUDIT V1 — 2026-10-07

Research-only; no implementation.

## Exact lifecycle

Current `src/nexo/effect-adapter.js` establishes:

1. `executeFresh()` checks in-memory `executed` and existing journal result.
2. Existing `prepared` causes reconciliation before any fresh handler execution.
3. Otherwise `recordIntent()` appends `status:"prepared"` and caps the journal at 200.
4. If `persistPreparedIntent` exists, it is called with the prepared entry.
5. Only after that hook returns does the handler execute.
6. Successful handler result is postcondition-checked.
7. `persist()` writes terminal result/status into the journal in memory.
8. Runtime separately records mission execution/outcome.

## Crash-cut classification

A. Before `recordIntent()`: no prepared evidence exists; no handler has been entered by this path.

B. After `recordIntent()`, before the persistence hook returns: PREPARED exists in RAM only. If the process dies here, recovery cannot infer PREPARED from durable state unless the caller actually persisted the hook checkpoint.

C. Persistence hook fails: result is BLOCKED with `EFFECT_INTENT_PERSISTENCE_FAILED`; the adapter does not call the handler. The prepared entry remains in the supplied in-memory journal, but that alone is not durable.

D. Prepared checkpoint returns successfully, then handler begins: the ordering contract is explicit in code. However, durability depends on what the caller's hook actually guarantees. Current production path has no demonstrated caller supplying this hook, so this is a seam, not an integrated durable protocol.

E. Handler mutates and returns successfully, then `persist()` records terminal result: handler mutation precedes terminal journal update. If the process crashes between those operations, journal may remain PREPARED while local mutation may already have occurred. Therefore PREPARED must not be interpreted as NOT_ATTEMPTED.

F. Handler throws: adapter returns `EFFECT_OUTCOME_UNKNOWN` without calling `persist()`. This deliberately preserves ambiguity. If the prepared checkpoint was durable, recovery sees PREPARED and must reconcile. If it was only RAM, the durable record may be absent and the operation can become untraceable through this journal.

G. Handler returns an invalid/non-terminal result: adapter persists a FAILED result; however if the handler already mutated state before returning an invalid result, the code only has a local state-version heuristic (`PARTIAL_EFFECT_DETECTED`) and does not prove rollback.

H. Handler returns completed but postcondition fails: adapter persists FAILED. The effect may already have occurred; FAILED is therefore not equivalent to ABSENT.

I. `persist()` updates the journal in RAM. It does not itself call `persistState()`. Thus terminal journal mutation is not automatically durable.

## Strong conclusions

🟢 The adapter deliberately distinguishes PREPARED from terminal results and preserves UNKNOWN on exceptions.

🟢 A durable prepared checkpoint, if actually connected, must precede handler entry.

🔴 Current repository evidence does not demonstrate an integrated production caller that makes the prepared checkpoint durable before handler execution.

🔴 Terminal journal mutation is separated from world-state persistence; there is no demonstrated atomic point joining handler mutation + journal terminal record + persisted simulation state.

🔴 A terminal FAILED/BLOCKED record is not automatically proof that no physical effect occurred.

🔵 The exact recovery semantics therefore remain dependent on durable PREPARED availability and reconciliation authority.

## External cross-check

Node documents that `FileHandle.sync()` requests flushing file data to the storage device, while rename provides pathname replacement semantics; these are storage-layer concerns and do not by themselves join an in-memory effect with a durable Nexo journal. citeturn0search0turn0search1

## Exact next

Trace the actual callers of `persistPreparedIntent` and determine whether any execution path currently supplies a durable checkpoint. Then trace terminal `persist()` into `persistState()` and identify the precise missing atomic/recovery boundary.

## DO-NOT-REPEAT

No implementation; no retention patch; no fsync implementation; no TLC rerun; no global stateRevision promotion; no AB104.185 primary; no AB105.117R.

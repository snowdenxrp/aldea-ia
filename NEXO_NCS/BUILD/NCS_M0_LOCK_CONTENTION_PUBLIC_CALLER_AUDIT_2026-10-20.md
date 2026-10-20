# NCS M0 — revisión de contención de lock y callers públicos (2026-10-20)

**Estado:** revisión documental; no cambia runtime ni pruebas.  
**Rama:** `ncs-clean-architecture`.  
**Misión:** M0.  
**Conclusión:** la espera sin límite es real y llega a APIs públicas que no aceptan deadline/cancelación. Los callers principales fallan cerrados si la adquisición termina con error, pero no pueden responder mientras la adquisición siga esperando. No hay base contractual para inventar ahora un timeout, `BUSY`, abort, lease o recuperación automática.

## 1. Fuentes de código y blobs observados

- Continuity store: `src/nexo/core/continuity-store.mjs`, blob `ecf982a028dcd4e9208eb236e27538eb5b508863`.
- Chronicle store: `src/nexo/core/chronicle-store.mjs`, blob `f441dc538313dd85935b5679547dd69ad242d2a3`.
- Continuity owner: `src/nexo/core/continuity-owner.mjs`, blob `81db34308e3881e3fa900653751a325952eeceb9`.
- Continuity service: `src/nexo/core/continuity-service.mjs`, blob `9f19377f67103bf0d22f68cab9266c2accacc768`.
- Chronicle application boundary: `src/nexo/application/chronicle-append.mjs`, blob `e5ff6c385f3160dfb78982a36c73a15d2d51887d`.
- Chronicle effect adapter: `src/nexo/adapters/chronicle-effect.mjs`, blob `b29c26d84c19afa34769f06cedd7d0131e873075`.
- Effect adapter: `src/nexo/effect-adapter.js`, blob `efe00f7f0bd3586266209fb17e2eb725a6522463`.
- Existing design review: `NEXO_NCS/BUILD/NCS_M0_LOCK_CONTENTION_CONTRACT_DESIGN_REVIEW_2026-10-19.md`.
- Exact code/test SHA whose five workflows are SUCCESS: `b133c8c392739a0912f7b0466650a25962ead267`. This caller audit makes no code/test change and does not claim new test execution.

## 2. Store behavior

Both stores use a `mkdir(filePath + ".lock")` lock, a 10 ms retry delay after detecting a valid non-stale lock, and a 60-second age threshold before classifying a lock as stale. A stale lock is not removed automatically; acquisition returns an explicit recovery-required error. If the owner PID remains alive and the lock persists, the loop has no deadline and can wait indefinitely.

Neither public store factory accepts a timeout, deadline, cancellation signal, or caller-supplied lock-wait policy. The 60-second stale threshold is **not** a wait timeout: a live PID can continue to prevent the stale classification indefinitely.

## 3. Public error and caller matrix

| Surface | Acquisition behavior | Caller handling | Progress guarantee |
|---|---|---|---|
| Continuity `initialize()` | Returns structured `failed`; path errors are normalized; internal store errors are preserved; other errors map to `NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED` | `openNexoContinuityOwner()` turns non-committed/non-conflict into a coded throw; application boundary catches it | No bound while waiting on a live lock |
| Continuity `commitIfCurrent()` | Normalizes `ENOENT/ENOTDIR`; throws other acquisition errors, including stale/unknown/permission errors | Owner methods do not all catch locally; canonical runtime boundaries catch the critical PREPARED, lineage, observation, and terminal-outcome paths and classify uncertain results fail-closed. Mission admission uses `recordNexoMissionSafely()` | No bound while waiting; once an error is thrown, key runtime boundaries do not dispatch on an unconfirmed PREPARED receipt |
| Chronicle `initialize()` | Returns structured `blocked`; normalizes missing/non-directory parent, but other error codes can be returned in `code` | `runNexoChronicleAppend()` checks status and blocks before continuing | No bound while waiting |
| Chronicle `append()` | Normalizes missing/non-directory parent; throws other acquisition errors | `createNexoChronicleEffectContracts().handler()` awaits `store.append()`; the effect adapter catches handler exceptions and retains the prepared obligation as unresolved rather than retrying blindly | No bound while waiting; handler error does not itself authorize redispatch |

### Interpretation

1. Fail-closed behavior after an acquisition error is present on the inspected canonical paths, but it does not provide a bounded response time.
2. Error surfaces are intentionally/as-yet non-uniform between initialize and mutate APIs, and between Continuity and Chronicle. This is an API-contract question; normalizing all of them in one pass would be a behavior change, not a safe cleanup-only refactor.
3. The adapter's in-memory execution journal is not the Nexo canonical authority and does not make the filesystem wait cancellable. Canonical PREPARED/reconciliation remains the source for recovery semantics.
4. No examined caller provides an outer deadline or cancellation mechanism to the store. An arbitrary timer inserted only in one store would therefore create inconsistent behavior and could turn a legitimately slow commit into an ambiguous result without an agreed caller contract.

## 4. Existing test evidence and its limit

The existing continuity-store tests cover concurrent same-revision commits (one committed, one conflict), cross-process waiting while a lock exists, explicit progress after lock removal, stale/unknown lock fail-closed behavior, and no canonical write when lock acquisition fails. They do not prove infinite waiting literally, nor do they establish a maximum latency. Existing Chronicle tests exercise related lock and restart boundaries, but this audit did not run new tests.

The exact-SHA validation that preceded this review is recorded in STATUS and the error-normalization audit:
- M0 integrated: [39372728077](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728077)
- Mission admission/restart: [39372728055](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728055)
- Deterministic persistence: [39372728046](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728046)
- STEP 4: [39372728141](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728141)
- STEP 5: [39372728127](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728127)

All five were SUCCESS on `b133c8c392739a0912f7b0466650a25962ead267`. Those are prior code/test validation runs, not tests added by this design review.

## 5. Decision recommendation — do not patch yet

**Do not add a timeout, `BUSY`, cancellation, lease, heartbeat, or stale-lock reclamation in this pass.** The repository has not yet defined:
- whether the first supported deployment is only one trusted local filesystem with cooperative writers;
- whether every store call must have a finite response deadline;
- how deadline expiry is distinguished from stale lock, filesystem failure, and unknown persistence outcome;
- whether a caller may safely retry after deadline expiry and how canonical state is reconciled first;
- how the same policy is shared by Continuity and Chronicle.

The next valid architecture step is to make that requirement explicit and then design one shared caller-visible contract across both stores, with tests for concurrent commits, lock holder alive beyond the deadline, lock owner exiting, timeout at every stage, no redispatch after PREPARED, and persistence/lock-release ambiguity. If the first version accepts unbounded waiting on a trusted cooperative local filesystem, record that as a deliberate deployment limitation instead of pretending it is bounded. If not, specify the full result and caller protocol before implementation.

## 6. State and limits

- No runtime/test modifications in this review.
- No evidence of legitimate owner authority, device-independent root, physical power-loss durability, or resistance to hostile local filesystem actors.
- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Protected effects: `STOP`.
- Legitimate root: `PENDING/UNKNOWN`.

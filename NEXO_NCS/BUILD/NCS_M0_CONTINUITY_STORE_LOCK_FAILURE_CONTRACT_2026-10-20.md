# NCS M0 — continuity-store lock acquisition result contract (2026-10-20)

Branch: `ncs-clean-architecture`.

## Finding

The directed lock-deadline review identified an actual public-contract asymmetry in `src/nexo/core/continuity-store.mjs`:

- `initialize()` catches non-path OS errors from lock acquisition and returns a structured `{ status: "failed", code: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED" }` result (or preserves a recognized Nexo store code).
- `commitIfCurrent()` returned the same structured result for timeout and parent-path failures, but rethrew other lock-acquisition errors such as `EACCES`.
- This inconsistency was already exercised by `tests/nexo/continuity-store.test.mjs`, where the test explicitly expected raw `EACCES` from `commitIfCurrent()`. It was not a demonstrated protected-effect bypass; it was an inconsistent store API failure contract.

## Change

Runtime commit: `9b018d36699a4c75b0251610f77fc310d79b6c26`.

`commitIfCurrent()` now normalizes a non-path lock-acquisition exception into a structured failure. Recognized `NEXO_CONTINUITY_STORE_*` codes are preserved; other codes are mapped to `NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED`. The result includes `phase: "lock_acquisition"` and `writeStarted: false`. The catch applies only to lock acquisition, before the store transaction's write path; it does not convert later commit/write uncertainty into a definite failure.

Regression test commit: `0f072bd54c5a58f8bef918303acca8372a083438`. The EACCES test now asserts the structured failure and `writeStarted: false`. A comment-only follow-up commit `4e1037dc8d172440e237d479af3982fcaa01277b` clarifies that both public operations share the structured result contract.

## Scope and non-claims

- No lock algorithm, deadline budget, persistence format, retry policy, stale-lock policy, or protected execution path was changed.
- No evidence here demonstrates a root-authority bypass or authorizes protected effects.
- This fixes an observed API-contract inconsistency. It does not prove all filesystem operations are bounded; the monotonic deadline only bounds cooperative lock-acquisition waiting, not an individual filesystem call that never returns.

## Validation status

The change must be judged by CI for the exact resulting SHA. A run on an earlier SHA does not validate this change. Record the exact run and conclusion in STATUS once completed.

## M0 remains

`INCOMPLETO`; `authorization: NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.

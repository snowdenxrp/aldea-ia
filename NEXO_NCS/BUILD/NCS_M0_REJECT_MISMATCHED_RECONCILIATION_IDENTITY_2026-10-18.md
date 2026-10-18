# M0 — Reject mismatched identity during prepared-effect reconciliation

Date: 2026-10-18

## Defect
The adapter located a prepared operation by `idempotencyKey`, then invoked its reconciliation callback even if the current request supplied a different mission, step, action, or target. The journal key selects the original operation; it must not silently bind a different caller intent to it.

## Change
Before invoking reconciliation, `createEffectAdapter` now compares request mission/step/action/target against the persisted prepared entry. Target comparison is structural. A mismatch returns `EFFECT_IDENTITY_MISMATCH`, does not call the reconciliation callback, and leaves the original entry `prepared`.

## Regression
A request reuses the original key but changes the action while supplying a callback that claims a verified completed result. The adapter rejects it before calling the callback and preserves the unresolved prepared record.

## Limits
This is identity-binding hardening only. It does not authenticate a reconciler, establish PG-009 owner/fence/authority epochs or provenance, implement restart recovery, or prove protected execution. A callback's `verified:true` remains non-authoritative in this architecture; protected effects stay STOP and STEP 7 remains OPEN / STOP / UNKNOWN.

## Follow-up finding and fix

The first CI run after adding the regression failed at the terminal mismatch assertion. This was a valid catch: the outer `execute()` wrapper returned a persisted terminal result before reaching the identity check in `executeFresh()`. The wrapper now validates the persisted operation identity before either cached-result return or in-flight reuse. The original journal record remains unchanged on mismatch.

## Verification
Exact source/test head: `378bf2036e3229f023bff3ca915fa09f95546ccf`.
- [Mission admission / runtime / effect adapter / restart continuity — PASS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39089278683).
- Includes the prepared mismatch callback-not-invoked regression and the terminal cached-result alias regression.

This is identity-binding hardening only. It does not authenticate a reconciler or establish PG-009 owner/fence/authority/provenance. STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.

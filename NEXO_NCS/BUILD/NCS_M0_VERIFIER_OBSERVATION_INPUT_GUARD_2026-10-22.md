# NCS M0 — verifier observations validated before field access

Date: 2026-10-22
Status: IMPLEMENTED; 5/5 relevant CI workflows SUCCESS on exact code/test SHA

## Finding

The owner correctly preflighted caller-supplied operation records before field access, but the return value from the configured per-action reconciliation verifier was inspected directly. A verifier could return an accessor-backed observation object, causing its getter to execute during validation. This is a data-contract defect at the verifier boundary; it is not evidence of authority bypass or external-effect execution.

## Correction

In `src/nexo/core/continuity-owner.mjs`, `reconcilePrepared()` now passes the verifier observation through the existing `validateCallerRecord()` boundary before reading `status`, identity, revision, source, or evidence fields. Invalid observations fail closed with `NEXO_EFFECT_RECONCILIATION_EVIDENCE_INVALID`; the prepared obligation remains unsettled and the canonical revision does not advance.

Regression added to `tests/nexo/continuity-contract.test.mjs`:
- Uses an owner with a fixed test verifier returning an observation with a getter on `status`.
- Requires that the getter is not invoked.
- Requires a blocked result, the expected evidence-invalid code, `journalSettled:false`, and unchanged canonical revision.

## Exact commits

- Runtime guard: `6937d230b7fff32e04416a47c6a612180ef7c1c7`
- Regression test: `988a3facfab2b6291f9f8d636d32fac7b9c372e0`
- Corrected test operation binding after the first CI failure: `e48e2f9b5f63b63176c7e198bea0a4753e85893d`

The intermediate test SHA `988a3fac...` failed because the regression passed the earlier test's operation to `recordPrepared()`, so the fixture was blocked before the verifier boundary. That failure was inspected in CI logs, corrected in `e48e2f9...`, and not hidden.

## CI on exact SHA e48e2f9b5f63b63176c7e198bea0a4753e85893d

All five triggered workflows completed SUCCESS:
- Deterministic persistence tests: https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091120
- STEP 5 outcome classification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091141
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091130
- Integrated acceptance regression: https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091149
- Bounded mission admission and restart continuity: https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091015

This is 5/5 workflows actually triggered for the SHA, not a claim that every repository workflow ran.

## Scope and non-claims

The existing in-process data guard is reused. This does not neutralize arbitrary Proxy traps or hostile code already running in the same process. It does not authenticate the verifier's source/evidence, establish a legitimate authority root, enable dispatch, or settle protected effects other than the existing narrow Chronicle contract. No authority or commissioning state was changed.

## Canonical state

M0 `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.

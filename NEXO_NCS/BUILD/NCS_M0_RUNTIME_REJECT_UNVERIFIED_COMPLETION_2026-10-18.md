# NCS M0 — Reject unverified adapter completion at runtime boundary

Date: 2026-10-18
Status: IMPLEMENTED IN SOURCE + REGRESSION TEST; EXACT-HEAD CI PASS

## Goal

Keep M0's mission outcome, execution record, and evidence aligned. An adapter's `status: "completed"` label must not by itself cause the runtime to persist a successful execution when the adapter omits verification signals.

## Finding

`src/nexo/runtime.js` previously mapped any `adapterResult.status === "completed"` directly to mission outcome `completed`. The runtime synthesized fallback evidence only when evidence was absent, but that fallback did not prevent a successful mission outcome. This made the runtime boundary weaker than the effect adapter's own postcondition contract.

## Change

- Runtime now accepts a completion result only when both `adapterResult.verified === true` and `adapterResult.evidence.verified === true`.
- If either signal is absent/false, it normalizes the result to `blocked / UNVERIFIED_COMPLETION_RESULT`, sets `verified: false`, and marks uncertainty as `completion_claim_not_verified`.
- Because the normalized result is passed to the existing commit path, mission state, attempt record, and execution result all retain the blocked outcome rather than recording a positive completion.

## Regression

`tests/nexo/runtime.test.mjs` supplies an adapter that returns `status: "completed"` with both verification signals false. Assertions require:
- returned runtime status is blocked;
- normalized adapter result is blocked with `UNVERIFIED_COMPLETION_RESULT`;
- mission step is blocked;
- durable attempt is blocked;
- recorded execution result is blocked.

## Evidence and verification

- Runtime source commit: `97e9deb8410af9bd9f9afb5dc876102741c202c5`
- Regression test commit / current source+test head: `c37b91c703b308c9ee888c9f9f1147489e345d80`
- Exact source+test head `c37b91c703b308c9ee888c9f9f1147489e345d80` has three successful workflow runs:\n  - [Mission admission/restart continuity — 39096581372](https://github.com/snowdenxrp/aldea-ia/actions/runs/39096581372), including `runtime.test.mjs`, `effect-adapter.test.mjs`, `orchestrator.test.mjs`, and `restart-reconstruction.test.mjs`.\n  - [STEP 4 semantic validation — 39096581378](https://github.com/snowdenxrp/aldea-ia/actions/runs/39096581378).\n  - [STEP 5 outcome classification — 39096581373](https://github.com/snowdenxrp/aldea-ia/actions/runs/39096581373).\n  All three completed successfully at the exact source+test head.
- Source: [runtime change](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/runtime.js)
- Test: [runtime regression](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/runtime.test.mjs)

## Limits

This is a fail-closed consistency guard, not an independent verifier. A caller-controlled adapter can still fabricate both `verified: true` signals. The codebase still lacks a demonstrated independent verifier/current fence/provenance source composed with the PG-009 recovery flow. Do not infer authority or external-effect truth from this change.

Prepared effects remain UNKNOWN and must not be redispatched without a real reconciliation authority. M0 is not complete. STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.

## Next

1. Obtain exact-head CI evidence for `c37b91c703b308c9ee888c9f9f1147489e345d80`; fix any test failures before further functional changes.
2. Continue the M0 integrated loop by tracing the existing Operation Contract into runtime admission, execution, evidence validation, durable state, and restart reconstruction.
3. Find a real, existing independent verifier/fence/provenance source for PG-009. If absent, preserve UNKNOWN/STOP and record the missing architectural dependency; do not invent a trust root, epoch, or token.

# NCS M0.63 — Preflight Core port options and validate commit result errorCode
Date: 2026-10-17
Branch: `ncs-clean-architecture`
Implementation commit: `ea41ea9c156826a02a78319bce701bd679569023`

## Finding A — Core port options were destructured before validation

`createCorePorts()` previously destructured its argument in the parameter list. Accessor properties could execute before any input-contract check. It now accepts the original record as `input`, calls `assertContractInput(input, "corePorts options")`, and only then reads its fields.

Regression test: a getter on `authorityGate` must throw a contract-shape error and its getter call count must remain zero.

## Finding B — malformed conditional-commit errorCode could be misclassified

The transition validated `commit.status` but did not require the complete `createCommitResult()` shape. A result like `{ status: "CONDITIONAL_CONFLICT" }` could be treated as a real conflict via the fallback reason. The transition now requires an own `errorCode` property whose value is `null` or a nonblank string. Malformed commit results map to `RECONCILE_REQUIRED`.

Regression test: a conflict result missing `errorCode` yields `RECONCILE_REQUIRED` with reason `conditional commit returned a malformed errorCode`.

## Focused CI evidence

All four workflows completed successfully on implementation commit `ea41ea9c156826a02a78319bce701bd679569023`:

- [M0 non-authority core contracts — run 39076466188](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076466188)
- [STEP 4 semantic validation — run 39076466214](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076466214)
- [STEP 5 outcome classification — run 39076466274](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076466274)
- [STEP 3A/3B/3C verification — run 39076466189](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076466189)

This is focused CI evidence only, not a full repository test claim.

## Limits preserved

This increment validates input/result shapes. It does not authenticate the supplied authority gate, establish trusted production port composition, prove runtime-to-protected-effect reachability, or close bypasses. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected activation remains blocked.

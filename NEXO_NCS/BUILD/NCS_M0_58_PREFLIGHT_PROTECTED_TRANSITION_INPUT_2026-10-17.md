# NCS M0.58 — Preflight protected-transition input before destructuring

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

M0.57 closed getter execution in the Core contract constructors, but the runtime entry `executeProtectedTransition()` destructured its request in the function parameter list. A caller-controlled getter on the request (for example, `ports`) could execute before the transition performed any validation. This was a separate entry boundary outside the constructors hardened in M0.57.

## Change

- Exported the shared `assertContractInput()` preflight from `src/nexo/core/contracts.mjs` so the transition entry uses the same structural rule instead of introducing a duplicate validator.
- Changed `executeProtectedTransition(input = {})` to preflight the request record before reading `ports`, `proposal`, `state`, or `expectedRevision`.
- Added a regression test with an enumerable `ports` getter. The request is rejected and the getter call counter remains zero.

## Evidence

- Shared validator export: `0022f17cfd69501f9282132cadabafe8b1a36efa`
- Transition entry change: `5a47d9698c650e80dfc250d2ef4a940b540e875a`
- Regression test commit: `01d32296cc85075b9842e4587d5ffe8c9e18bc4d`
- M0 Core contracts CI: [run 39044459878](https://github.com/snowdenxrp/aldea-ia/actions/runs/39044459878) — success
- STEP 4 semantic validation CI: [run 39044459855](https://github.com/snowdenxrp/aldea-ia/actions/runs/39044459855) — success
- STEP 5 outcome classification CI: [run 39044459893](https://github.com/snowdenxrp/aldea-ia/actions/runs/39044459893) — success
- STEP 3A/3B/3C CI: [run 39044459955](https://github.com/snowdenxrp/aldea-ia/actions/runs/39044459955) — success

## Scope and limits

This ensures the transition request and its traversed data graph are preflighted before parameter access. It does not establish that the supplied ports are legitimate or compositionally trusted, nor that production startup reaches this function exclusively, nor that all protected-effect bypasses are closed. No full-repository or device test is claimed. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.

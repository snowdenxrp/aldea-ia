# NCS M0 — Partial-effect fail-closed regression checkpoint

Date: 2026-10-18
Branch: `ncs-clean-architecture`
Scope: effect adapter only; runtime cutover remains blocked.

## Defect found

Inspection of `src/nexo/effect-adapter.js` showed two paths that converted ambiguous outcomes into cached terminal failures:
1. a handler changed the observed state but returned a non-completed/invalid result (`PARTIAL_EFFECT_DETECTED`);
2. a handler returned completed but the required postcondition did not evaluate to literal `true` (`POSTCONDITION_FAILED`).

Persisting these outcomes as terminal meant a later call could replay the cached failure rather than preserve an unresolved operation obligation. In particular, a partially applied effect must not be treated as proof that the operation is safe to repeat.

## Implementation

Commit `699b14d57918cbd02c6d6440120f88c91bc84672`:
- On a detected state change plus invalid/non-completed handler result, returns `blocked / PARTIAL_EFFECT_DETECTED`, adds uncertainty, and does not persist a terminal journal result.
- On failed postcondition, returns `blocked / POSTCONDITION_FAILED`, adds uncertainty, and leaves the journal `prepared`.
- The existing PREPARED recovery path therefore blocks subsequent dispatch pending reconciliation.

Test commits:
- `af412f23a4898fa279e995e4bc67e0e53b01410c`: shared execution journal and assertions for unresolved partial/postcondition failures.
- `8183fa6ce39c1fd968eeafdcd3833d648d05f549`: assert partial handler is not redispatched.
- `630dc8a51b91047ce5d33cbe08901e8db9a0fc0c`: fix postcondition regression expectation.
- `d3ebb7738ba29a3e1ffdbd93f29e35e0c692093a`: add same-key retry test for failed postcondition, asserting handler call count and state version do not advance.

## Exact-head CI evidence

At commit `630dc8a51b91047ce5d33cbe08901e8db9a0fc0c`, all three workflows passed:
- Mission/restart continuity: [39105114315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105114315)
- Semantic validation: [39105114297](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105114297)
- Outcome classification: [39105114288](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105114288)

Commit `d3ebb7738ba29a3e1ffdbd93f29e35e0c692093a` adds another regression test; its exact-head CI must be checked before marking that final test validated.

## Safety scope / remaining work

- This closes a local adapter behavior where observed partial change or failed postcondition was cached as terminal. It does not supply an independent operation-specific verifier.
- A returned state version is only the adapter's observed version; it does not prove that every external effect is represented by that version.
- Handler-returned `failed` with no observed version change is still treated as terminal by the generic adapter; the concrete operation integration must establish that such failures are definitive no-effect outcomes before relying on them for safe retry.
- Runtime remains on legacy memory functions. No Nexo owner terminal-settlement API exists. No real-device migration is claimed.
- M0 remains incomplete; unresolved PREPARED = UNKNOWN; protected effects = STOP; STEP 7 = OPEN / STOP / UNKNOWN.
- Next: wait for exact-head CI at `d3ebb77...`, then examine concrete simulation action semantics to distinguish definitive no-effect failures from uncertain outcomes. Do not wire runtime dispatch to the standalone owner until the verifier and terminal-settlement boundary is real.

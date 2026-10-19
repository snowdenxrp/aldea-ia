# NCS — M0 Application Result Contract
Date: 2026-10-19
Validated code/test SHA: 7148263da84eb37e80fc0fcfdb5957e299674a10

## Scope

This contract describes the public result shape for the owner-backed runtime used by the one enabled mutating application use case, `chronicle_append`. It does not authorize additional actions, make the legacy runtime canonical, or prove OS-level/power-loss durability.

## Status meanings

- `completed`: the Chronicle append invariant and terminal outcome are confirmed. `terminalOutcomeRecorded=true`, `journalSettled=true`, `redispatchAuthorized=false`. `dispatchAttempted` can be false on recovery/replay.
- `blocked`: a known input, capability, invariant, or contract gate prevented the requested next step. Read the `code`; do not assume that a prior dispatch never happened if `dispatchAttempted=true`.
- `conflict`: a known compare-and-swap/revision conflict occurred. It is not a write-unknown result. No automatic retry is performed; the caller must reload canonical state and decide explicitly.
- `unknown`: the effect or persistence result may have occurred but cannot be confirmed. Do not redispatch. Re-read canonical continuity and perform only the action-specific recovery path.
- `observed`: an observation was returned but the terminal settlement/outcome contract is not confirmed. It is non-terminal and does not authorize redispatch.
- `invalid`: the owner-backed runtime call context itself is invalid.

## Required result fields

| Field | Type | Meaning |
|---|---|---|
| `status` | string | One of the statuses above |
| `code` | string when supplied | Stable machine-readable reason |
| `dispatchAttempted` | boolean | Whether this invocation attempted adapter dispatch |
| `preparedCommitted` | boolean or `UNKNOWN` | Whether PREPARED commit is confirmed; UNKNOWN means the commit may have persisted before response loss |
| `lineageCommitted` | boolean or `UNKNOWN` | Whether execution lineage is confirmed |
| `journalSettled` | boolean or `UNKNOWN` | Whether the journal settlement is confirmed |
| `terminalOutcomeRecorded` | boolean or `UNKNOWN` | Whether the terminal outcome is confirmed |
| `redispatchAuthorized` | boolean | Currently always false in this vertical |

Missing boolean state fields are normalized to false only where no write was attempted and the state is known not to have been committed. If a commit response may have been lost after persistence, the corresponding field MUST remain `UNKNOWN`; it must not be flattened to false.

## Safety invariants

1. PREPARED must be explicitly confirmed before dispatch.
2. PREPARED conflict or UNKNOWN must not dispatch.
3. Adapter exceptions are UNKNOWN because the effect may have occurred before the exception.
4. A known lineage CAS conflict leaves the operation unresolved; the result remains UNKNOWN at the operation level, with `lineageCommitted=false`.
5. Reconciliation response loss preserves `journalSettled=UNKNOWN`; it never authorizes redispatch.
6. A known terminal-outcome CAS conflict after Chronicle settlement returns `conflict`, `journalSettled=true`, and `terminalOutcomeRecorded=false`. A later replay records the outcome only, without another Chronicle append.
7. A terminal-outcome commit exception/response loss returns `terminalOutcomeRecorded=UNKNOWN`; a later replay inspects the canonical journal and outcome without dispatching the append again.
8. Raw adapter exception messages are not exposed in application results. CLI output is allowlisted and never prints Chronicle content.
9. The caller owns retry policy. No automatic retry loop, queue, or retry authorization is implied by `conflict`, `blocked`, or `unknown`.

## Proof references

- PREPARED conflict, unknown PREPARED commit, adapter exception, lineage conflict, reconciliation response loss, outcome conflict and outcome response loss are exercised in `tests/nexo/chronicle-runtime.test.mjs`.
- Process restart/replay, private-content non-disclosure, mission reconstruction and PREPARED preservation are exercised in `tests/nexo/entrypoint.test.mjs`.
- CI SUCCESS on SHA `7148263da84eb37e80fc0fcfdb5957e299674a10`:
  - [Chronicle/entrypoint — 39181627883](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181627883)
  - [Continuity/restart — 39181627998](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181627998)
  - [Semantic validation — 39181627889](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181627889)
  - [Outcome/restart — 39181627894](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181627894)

## Non-goals / current stop

- No generic effect settlement.
- No second mutating action.
- No default runtime cutover.
- No authority or ownership inferred from a continuity store.
- No claim of fsync/power-loss durability or cross-store transaction atomicity.
- Nexo remains independent of Lúmina; protected effects remain STOP.
- M0 remains INCOMPLETE.


## Public application API surface — validated update (2026-10-19)

- Import from `src/nexo/application/index.mjs`; the stable exports are exactly `runNexoChronicleAppend`, `loadNexoContinuityStatus`, and `loadNexoMissionStatus`.
- The CLI wrappers and export-list regression consume this surface. CI SUCCESS on SHA `71a01beb06d9a9d01e1cd459fe123588e1dd553b`: [39181785728](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181785728), [39181785739](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181785739), [39181785834](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181785834).

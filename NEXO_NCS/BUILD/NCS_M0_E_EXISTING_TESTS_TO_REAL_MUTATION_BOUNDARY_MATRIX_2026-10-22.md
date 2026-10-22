# NCS M0-E — matriz de reutilización de tests y límite que realmente observan
Fecha: 2026-10-22
Rama: `ncs-clean-architecture`
Tipo: análisis documental de tests existentes; sin cambios de runtime ni ejecución de CI.

## HEAD y fuentes comprobadas

- HEAD actual consultado directamente en `refs/heads/ncs-clean-architecture`: `5193894043aebd58a7a1a72307686a259f9dca04`.
- `tests/nexo/protected-transition.test.mjs`, blob `65353fe9e20898fb13f225ee004240b6c54687f1`.
- `tests/nexo/conditional-commit-persist-state.test.mjs`, blob `203743cdd051f7fecf02076f1562619441473214`.
- `tests/nexo/root-bootstrap-protocol.test.mjs`, blob `996c031224ba4544d8982ca4fd1762e9d4f44dc0`.
- `tests/nexo/chronicle-runtime.test.mjs`, blob `82f3f1a4ff4bb29285ff3579f506cd773819bedb`.
- `tests/nexo/effect-adapter.test.mjs`, blob `602a220cafc31888892a04d31a06d256bf49b455`.
- `src/nexo/core/owner-backed-runtime.mjs`, blob `8c697ea2944e19cce90bf7833f4ba392fee83818`.
- Scope proposal `NCS_M0_E_INITIAL_SCOPE_OPTIONS_FOR_OWNER_2026-10-21.md`, blob `aac1c17b2ab828fb4152677a87ecf74bd2e67fe3`; remains explicitly unaccepted.

## Matrix: what current tests prove, and where evidence stops

| Test suite | Proven property in the inspected test code | What it does not prove | Reuse |
|---|---|---|---|
| `protected-transition.test.mjs` | Rejects malformed inputs/authority results; fail-closed for STOP/UNKNOWN; avoids execution/commit on specified early rejects; validates snapshot isolation and semantic gate. Several positive-path fixtures inject `AUTHORITY.AUTHORIZED`. | No legitimate authority provenance, no exact owner-approved Constitution, no real root→Policy binding, and no demonstrated external effect sink. | Reuse negative and core-contract cases; do not duplicate shape/STOP cases. Add only tests at the selected real mutation boundary. |
| `conditional-commit-persist-state.test.mjs` | Exercises real `persistState` adapter path, revision increment, stale revision conflict, unsafe revision rejection before persistence, and UNKNOWN on storage errors. | Does not show that `persistState` is an external protected effect or that authority controls every mutation path. Its positive fixture injects AUTHORIZED. | Reuse as state-persistence contract coverage; don't rename this sink to external effect. |
| `root-bootstrap-protocol.test.mjs` | P-256/ECDSA/SHA-256 known-answer vector, altered challenge/signature/key/truncation failures. Test comments explicitly say key/signature are fixtures, not Nexo's root. | Does not provision, recognize or revoke a legitimate root; no hardware/deployment binding. | Reuse cryptographic primitive vector only; no second copy and no root PASS. |
| `chronicle-runtime.test.mjs` | Public result sanitization, continuity/Chronicle lifecycle, dispatch/prepared/reconciliation cases; preserves `authorization: NOT_EVALUATED` for early/unknown results. | Does not establish Constitution Authority Context or grant protected effects; local Chronicle persistence is not proof of external authority. | Reuse lifecycle/reconciliation and zero-dispatch assertions already present. |
| `effect-adapter.test.mjs` | Precondition blocks before handler; successful handler/postcondition; idempotency; partial/ambiguous results remain unresolved and are not redispatched; state-version race blocks. | A generic adapter fixture and a handler callback do not prove that a constitutional authority gate controls all production callers. The handler itself is the mutation point in this suite. | Reuse effect lifecycle/reconciliation cases. If this class enters scope, add gate-before-handler at the actual supported entry path and assert handler counter is zero on every negative. |
| Owner-backed runtime implementation + its existing tests | Canonical route's allowlist and owner/Chronicle lifecycle; source inspection shows only `chronicle_append` allowed in this execution slice and other actions blocked before dispatch. | Does not prove legacy/simulation routes are universally unreachable or that Chronicle append itself is an authorized protected effect. | Reuse allowlist and dispatch-zero cases; avoid a second abstract dispatcher. |

## Decision dependency — scope remains OPEN

The existing proposal gives three choices:
- A: initial build permits planning/read/diagnostics and internal Chronicle persistence only; repair, simulation actions, external and irreversible effects stay blocked.
- B: one explicitly selected local effect.
- C: simulation/Lúmina actions included.

No choice is recorded as accepted by the owner. A is a sensible technical fail-closed posture, but it cannot be written as an owner decision without explicit selection. The implementation already blocks non-`chronicle_append` actions on the owner-backed route, but that alone does not prove every entry point conforms to A.

## Minimum next implementation unit, after scope decision

Do not build a generic root/authority subsystem now. For the chosen scope, define one small route contract:

1. Enumerate supported entry points for the included capability.
2. Name the last function capable of mutating state/effect for each route.
3. Identify the guard that must run before that call and the authenticated data it consumes.
4. For each negative state (root/provenance absent, caller-forged AUTHORIZED, wrong Constitution, stale/revoked state, missing verifier), assert both fail-closed outcome and zero calls to the mutation function.
5. Keep the positive path absent until real root provenance and exact Constitution approval exist; never use injected `AUTHORIZED` as acceptance evidence.
6. Link CI run/job/log to the exact tested SHA.

If scope A is selected, the first bounded implementation should be enforcement of "no protected effect" across the supported entry points—not a positive authority path. Keep local Chronicle writes explicitly classified as continuity persistence, not owner authorization. Any legacy entry point not proved unreachable must be disabled/rejected at its public boundary, rather than assumed absent.

## State

No runtime/tests changed; no CI run started by this review.
M0 `INCOMPLETO`; authorization `NOT_EVALUATED`; root `PENDING/UNKNOWN`; protected effects `STOP`.

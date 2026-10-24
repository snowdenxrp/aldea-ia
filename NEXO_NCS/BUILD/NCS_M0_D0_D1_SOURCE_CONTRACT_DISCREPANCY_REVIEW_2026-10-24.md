# NCS M0 — D0/D1 source contract discrepancy review — 2026-10-24

Branch: `ncs-clean-architecture`
State: DOCUMENTARY REVIEW ONLY — NO IMPLEMENTATION — NO TEST/CI
D0 policy: accepted by owner; technical/evidence gate remains OPEN.
D1-DESIGN: OPEN.

## Why this review exists

The accepted D0-C1..C4 policy describes the intended first-version instance contract. The current source and workflow files must not be described as already implementing that policy. This note records the concrete divergence observed in the exact branch files below; it does not authorize changes.

## Exact source evidence

| Path | Blob SHA | Relevant observed behavior |
|---|---|---|
| `scripts/nexo.mjs` | `e471eb478a09aa8a9a8323795583e198cdf0a127` | CLI commands `status`, `mission-status`, `mission-plan`, previews accept `--continuity <path>`; Chronicle dispatch forwards child arguments. No `--root` option in the reviewed parser. |
| `scripts/nexo-chronicle-session.mjs` | `30a53de2f108aa255a1dfd61ce78c19788de160b` | Child parser accepts `--continuity`, `--chronicle`, mission/step IDs, and `--initialize-continuity` / `--initialize-chronicle`; no `--root` option in the reviewed parser. The file has its own direct-execution guard. |
| `src/nexo/application/chronicle-append.mjs` | `5a20044bcddbaee79d0117934eefaea5f3b2c3bc` | Mutating use case accepts path-oriented options and initialization controls; it constructs/open stores and an owner. This is below the public CLI boundary. |
| `src/nexo/application/continuity-queries.mjs` | `e1915e94e53e71d37a37952fead37ba62bdae79a` | Read operations call `createNexoContinuityStore({ filePath: continuityPath }).loadCurrent()`; no root admission is evidenced at this API boundary. |
| `src/nexo/core/continuity-service.mjs` | `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c` | Owner/store construction accepts a file path and initialization/import-related options. |
| `src/nexo/core/continuity-store.mjs` | `9ffd28930abdbe29f5b041711cc29b74dc99fbae` | Store factory works from a file path and uses per-store lock paths. |
| `src/nexo/core/chronicle-store.mjs` | `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a` | Chronicle store factory works from a file path and uses per-store lock paths. |
| `tests/nexo/entrypoint.test.mjs` | `ff1bd2e9d292e21e00049b354249aee684837bbc` | Existing integration fixture deliberately passes separate Continuity/Chronicle paths and explicit initialization flags; this is evidence of current behavior, not evidence of the accepted new root contract. |
| `.github/workflows/nexo-m0-chronicle.yml` | `65b2bc04a015f5bd1fe010e3f3eec6e0481514e7` | Path filters include `scripts/nexo.mjs`, `scripts/nexo-chronicle-session.mjs`, query/index and selected core files. Its run steps execute only Chronicle store, Chronicle runtime, and entrypoint tests. |
| `.github/workflows/nexo-mission-admission-continuity.yml` | `03f2a0cb8268e442ce4db434383b0f4854073d82` | Filters include continuity/Chronicle stores and several core files, but the workflow runs a selected list of tests; it does not run the full `npm test` chain. |

## Contract discrepancy ledger

| Accepted design contract | Current source evidence | Status |
|---|---|---|
| D0-C1: one explicit `--root <directory>` per operation | CLI uses separate `--continuity` and `--chronicle` paths; no root parser was found in either reviewed command entrypoint | DESIGN/IMPLEMENTATION GAP — OPEN |
| No environment override or legacy path fallback in first version | Not sufficient to conclude from these two parsers alone; transitive configuration/environment consumers still need a bounded search | UNKNOWN/BLOCKED |
| D0-C2: normal operation requires existing valid root; bootstrap is separate | Child exposes initialization flags; current integration test exercises those flags | DESIGN/IMPLEMENTATION GAP — OPEN; do not infer that normal-operation behavior satisfies accepted contract |
| D0-C3: canonicalize root before deriving store/lock paths | Store locks derive from each supplied file path; root canonicalization is not evidenced at the public entrypoint | OPEN |
| D0-C4: no automatic migration/dual-write/heuristic merge in M0 | Continuity service comments and options retain legacy import/empty-initialization paths; their allowed invocation boundary must be reconciled with the accepted exclusion | OPEN; no claim that migration is currently reachable or unreachable in every runtime path |
| D1: all read/write APIs pass a single instance-admission boundary | Query API directly creates a path-based store; mutating API creates store/owner paths; no shared root admission context is evidenced in the reviewed files | OPEN |
| Child cannot bypass root admission or deadlock through double acquisition | Child is independently executable and accepts direct store paths; no root-admission coordination contract is evidenced | OPEN |
| Workflows prove implementation on relevant source changes | Workflow path filters and executed test lists are not equivalent to coverage; root-admission contract is not currently tested by the reviewed entrypoint test | OPEN |

## Design consequence

D0-C1..C4 are accepted as the intended contract, but current runtime and tests still describe the earlier path-oriented interface. That is not a reason to silently reinterpret the accepted policy or patch the code without authorization. The correct state is a recorded implementation gap, with D1-DESIGN still open and implementation authorization still `NOT_EVALUATED`.

Before D1-DESIGN can be called closed, the design must explicitly define:
1. the root-to-store path mapping and whether callers may ever provide store paths directly;
2. the boundary for normal operation versus explicit bootstrap;
3. how read-only queries and previews enter the same root admission contract;
4. how the independently executable Chronicle child receives/validates root context and coordinates locking without duplicate acquisition;
5. how workflow path filters and test commands will cover every changed runtime/API/store file after implementation is separately authorized.

## Non-claims and current state

- This is a source inspection, not an executed test.
- No runtime, test, or workflow file was modified.
- No tests or CI were run.
- It does not establish whether any uninspected dynamic or external consumer exists.
- D0 technical/evidence gate: OPEN.
- D1-DESIGN: OPEN; D1-IMPLEMENTATION: not authorized.
- D2/D3: OPEN.
- M0: `INCOMPLETO`.
- Implementation authorization: `NOT_EVALUATED`.
- Legitimate root: `PENDING/UNKNOWN`.
- Protected effects: `STOP`.

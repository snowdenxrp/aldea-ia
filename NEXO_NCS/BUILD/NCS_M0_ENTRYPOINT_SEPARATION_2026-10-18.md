# NCS — M0 Nexo-only entrypoint and runtime separation
Date: 2026-10-18
Validated code SHA: 9174921f587b504f40524ae5e89f47da68e40ae2

## Decision and implementation

- `scripts/nexo.mjs` is the independent command entrypoint, exposed as `npm run nexo -- ...`.
- Its only mutating command is `chronicle-append`. The `status --continuity PATH` command is read-only and reports aggregate counts from the canonical store; it never initializes a missing store. Unknown effect commands return `NEXO_COMMAND_UNSUPPORTED` and do not dispatch. This is a narrow router, not a generic effect dispatcher.
- A transitive coupling was found: the Chronicle session imported `src/nexo/runtime.js`, which statically imports the Lumina adapter and the assistant memory layer. The adapter-agnostic owner-backed execution slice was extracted to `src/nexo/core/owner-backed-runtime.mjs`. The Chronicle session imports that module directly; `src/nexo/runtime.js` re-exports the function for compatibility.
- The new owner-backed module has no static imports from Lumina, simulation, or assistants. The CLI entrypoint does not load `world.js`, `simulation.js`, `simulate.mjs`, or Lumina assistant memory.
- `index.html` remains the existing Lumina web entrypoint and was not changed. This work creates a Nexo-only CLI seam, not a browser UI or a general runtime cutover.

## Test coverage

`tests/nexo/entrypoint.test.mjs` covers:
1. Missing and unsupported commands fail closed.
2. The real CLI routes `chronicle-append` to the already-validated Chronicle vertical.
3. Chronicle content is passed through stdin and is absent from stdout/stderr.
4. Persisted Chronicle and continuity journal show the append settlement.
5. The CLI imports the isolated owner-backed runtime rather than `src/nexo/runtime.js`, and that module has no static Lumina/assistant dependencies.
6. `status` reports only revision and counts, not mission content/targets; missing stores fail without initialization and a valid status call leaves file bytes unchanged.

## CI evidence

- [39179321550 — Chronicle store, owner-backed runtime/restart, independent Nexo entrypoint](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179321550): SUCCESS on `9174921f587b504f40524ae5e89f47da68e40ae2`.
- [39179301946 — Chronicle vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179301946): SUCCESS after the CLI import was redirected to the isolated module.
- [39179301988 — bounded mission admission/restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179301988): SUCCESS on the same extraction change.

Example, using a trusted local directory and sending content through stdin:

```sh
npm run nexo -- chronicle-append \
  --continuity ./private/nexo-continuity.json \
  --chronicle ./private/nexo-chronicle.json \
  --mission mission-1 --step step-1 \
  --initialize-continuity --initialize-chronicle --content-stdin
```

The initialization flags are opt-in and should only be used when creating genuinely new stores. Existing/corrupt stores must not be silently replaced. Store paths are trusted local configuration, not a sandbox.

## Limits and next gate

- Only `chronicle_append` is enabled as a mutating action by this entrypoint; `status` is read-only.
- No protected effects, generic action expansion, runtime-default cutover, or Lúmina initialization is permitted.
- The next gate is the canonical owner-backed Nexo runtime transition for explicitly supported actions: select a persisted mission/step, commit PREPARED by CAS, dispatch only after confirmed commit, persist lineage, verify durable external state using a trusted operation-specific verifier, then settle and record outcome. Any action lacking its verifier/settlement contract must block before dispatch.
- M0 remains INCOMPLETE. This CLI seam is not the Nexo browser application and does not complete M0.


## Read-only mission reconstruction — validation update (2026-10-19)

- Added `mission-status --continuity PATH --mission ID` to the independent entrypoint. It calls the canonical owner reconstruction and emits only mission-level status plus step ID/action/status/dependency count and an optional block code; it omits target/context/payload.
- Missing mission returns `NEXO_MISSION_NOT_FOUND`; absent/corrupt store blocks without initialization. Process test verifies no payload leakage and byte-identical store contents before/after.
- Found and fixed a reconstruction mismatch: Chronicle's `settled_observed` journal entry was incorrectly treated as repair-only observed settlement. The operation-specific Chronicle settlement plus terminal outcome now preserves `step.status=completed`; other actions remain conservative.
- CI SUCCESS on SHA `ccb1fb7218fbb0b13615a95c403b002b025faa35`: [39180275512](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180275512), [39180275517](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180275517), [39180275561](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180275561).


- Additional regression in SHA `c7ad605f1257904cb3c4ff8eae261243068cfa95`: a real store containing `prepared` reconstructs as blocked via the process CLI, with `NEXO_EFFECT_RECONCILIATION_REQUIRED`; payload sentinel is absent from output and store bytes remain unchanged. CI SUCCESS: [39180351432](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180351432), [39180351413](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180351413), [39180351418](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180351418).


## Process restart replay — validated (2026-10-19)

- A process-level regression runs `chronicle-append`, then launches a fresh Node process with the same operation identity and payload. The replay returns `completed` with `dispatchAttempted=false`; Chronicle and continuity files remain byte-identical, and the private sentinel is not logged.
- CI SUCCESS on SHA `3ed7860a189b6b00d0a5444eb466a4393c4a2c4c`: [39180401874](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180401874), [39180401875](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180401875), [39180401886](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180401886).
- Scope is process restart and idempotent replay for the Chronicle vertical only; no fsync/power-loss durability, authority, generic actions, or runtime-default cutover is claimed.


## Transitive import-graph guard — validated (2026-10-19)

- `tests/nexo/entrypoint.test.mjs` recursively walks static local imports from both Nexo entrypoints and fails if a reachable module imports the legacy assistant memory, simulation adapter, `world.js`, `simulation.js`, `simulate.mjs`, or `src/nexo/runtime.js`.
- CI SUCCESS on SHA `c9f62e3611a598f0ab29fa1b55d2ac849a67c6c3`: [39180518798](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180518798), [39180518686](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180518686), [39180518787](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180518787).
- This guards static import separation for the CLI entrypoints only. It does not claim OS/process sandboxing, web-app integration, or general runtime cutover.


## Application-layer extraction — validated (2026-10-19)

- `src/nexo/application/chronicle-append.mjs` now owns the Chronicle use case; `src/nexo/application/continuity-queries.mjs` owns read-only status and mission reconstruction. The CLI scripts are parsers/process wrappers.
- `src/nexo/core/continuity-service.mjs` owns opening the canonical Nexo continuity store/owner. `scripts/nexo-continuity.mjs` remains a compatibility re-export.
- Initial refactor CI caught `ReferenceError: blocked is not defined` after moving the use case; the structured-blocked helper was restored at both application and CLI boundaries. Latest validation is SUCCESS: [39180686782](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180686782), [39180686817](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180686817) on SHA `8d05417d0a47b5f38fb63833c338a0f04d1499e7`.
- This is a reusable Nexo application seam, not an Android/web UI or runtime-default cutover. Chronicle remains the only mutating use case.


## Application API concurrency/replay — validated (2026-10-19)

- The Chronicle use-case test imports `runNexoChronicleAppend` directly from `src/nexo/application/chronicle-append.mjs`; CLI process tests independently exercise the wrapper.
- Two concurrent same-operation callers cannot dispatch twice or create duplicate Chronicle entries. An explicit subsequent retry returns the persisted completed result without dispatch and without changing either store.
- CI SUCCESS on SHA `140769ea651ed5cd198fd57f05530679e79f8c5d`: [39180811315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811315), [39180811308](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811308), [39180811234](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811234), [39180811257](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811257).
- The API permits an explicit conflict/retry path; it does not introduce automatic retry loops, queues, generic effect enablement or runtime-default cutover.


## Concurrent first-time bootstrap — validated (2026-10-19)

- Two concurrent calls against absent continuity/Chronicle stores with explicit initialization opt-in may leave one caller blocked, but they cannot dispatch the append twice. An explicit retry converges to one Chronicle entry, and the next replay does not change either file.
- CI SUCCESS on SHA `7f4c69ef8003515c53d761677185f4668c05d5a0`: [39180909793](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909793), [39180909802](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909802), [39180909892](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909892), [39180909760](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909760).
- This does not claim atomic initialization across the two stores. No automatic retry, queue, or second dispatch is introduced.


## Application input contract — validated (2026-10-19)

- Direct application-service tests reject a blank required store path and a non-boolean initialization flag before any store access, returning `blocked / NEXO_CHRONICLE_SESSION_INPUT_INVALID` with no dispatch.
- CI SUCCESS on SHA `e8abe56f791e8460be6ae71abe723a3907bd13aa`: [39180992024](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180992024), [39180991951](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180991951), [39180991860](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180991860), [39180991827](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180991827).


## CAS conflict result semantics — validated (2026-10-19)

- PREPARED commit conflict is returned as `conflict` with `dispatchAttempted=false`, not flattened into generic `blocked`.
- Terminal-outcome CAS conflict after Chronicle settlement is returned as `conflict` while preserving `journalSettled=true` and `terminalOutcomeRecorded=false`; a subsequent replay writes only the outcome and never redispatches the append.
- Unknown remains reserved for uncertain exceptions/commit outcomes. CI SUCCESS on SHA `8e0d226c1df5e8c52ab802fe138d86da1a7a08d8`: [39181169917](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181169917), [39181169919](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181169919), [39181169938](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181169938), [39181169900](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181169900).
- No automatic retry or new action was introduced.


## Tri-state application result contract — validated (2026-10-19)

- Public result flags are normalized; commit uncertainty preserves `"UNKNOWN"` instead of a misleading `false` for PREPARED, lineage, settlement, and terminal outcome when a commit may have persisted before its response was lost.
- Covered cases include PREPARED unknown, adapter throw, lineage exception, reconciliation exception, outcome response lost, and known CAS conflicts. Raw adapter exception messages are not exposed through the application result.
- CI SUCCESS on SHA `7f4f80f44912ac93f59b65977f728b95dc6fab2e`: [39181497303](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181497303), [39181497305](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181497305), [39181497592](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181497592), [39181497309](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181497309).


## Stable result contract

See [NCS_M0_APPLICATION_RESULT_CONTRACT_2026-10-19.md](NCS_M0_APPLICATION_RESULT_CONTRACT_2026-10-19.md) for the status meanings, tri-state persistence fields, retry constraints and proof links.


## Stable public application API — validated (2026-10-19)

- `src/nexo/application/index.mjs` is the single public application import surface and exports exactly `runNexoChronicleAppend`, `loadNexoContinuityStatus`, and `loadNexoMissionStatus`.
- CLI wrappers and the direct application test use this module. The export-list regression prevents an implicit generic dispatcher from being added.
- CI SUCCESS on SHA `71a01beb06d9a9d01e1cd459fe123588e1dd553b`: [39181785728](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181785728), [39181785739](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181785739), [39181785834](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181785834).
- This is an integration seam, not a browser/Android app or runtime-default cutover.


## Public API import-graph guard — re-exports included (validated 2026-10-18 local)

- The static Nexo/Lúmina separation test now traverses both `import ... from` and `export ... from`. This closes a blind spot where the public application index's re-exports could hide its implementation modules from the recursive audit.
- The test explicitly proves that `src/nexo/application/chronicle-append.mjs` and `continuity-queries.mjs` are reached from the CLI entrypoints through the public index, while `src/nexo/runtime.js` remains unreachable.
- Code/test SHA: `0872c646db77af2e3e0bbd9e711d7f81c6cc1caa`. CI SUCCESS: [Chronicle 39187372728](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187372728), [STEP 4 39187372719](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187372719), [STEP 5 39187372729](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187372729).
- This is a static import-graph guard, not OS isolation or UI integration. M0 remains INCOMPLETO; protected effects STOP; Nexo/Lúmina separate.

## Current verified pointer — import-graph guard

- Latest code/test SHA with focal CI SUCCESS: `0872c646db77af2e3e0bbd9e711d7f81c6cc1caa`.
- The only code change since the preceding validated checkpoint is the test's import-graph traversal and its assertions; no runtime or application behavior changed.
- Next: audit public API boundaries and recovery semantics only. Do not add a second mutating use case, connect `index.html` or the legacy runtime, or infer authority from continuity state.

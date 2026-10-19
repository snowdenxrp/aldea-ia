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

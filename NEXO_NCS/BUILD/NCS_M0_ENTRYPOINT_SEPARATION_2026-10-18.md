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

- Only `chronicle_append` is enabled by this entrypoint.
- No protected effects, generic action expansion, runtime-default cutover, or Lúmina initialization is permitted.
- The next gate is the canonical owner-backed Nexo runtime transition for explicitly supported actions: select a persisted mission/step, commit PREPARED by CAS, dispatch only after confirmed commit, persist lineage, verify durable external state using a trusted operation-specific verifier, then settle and record outcome. Any action lacking its verifier/settlement contract must block before dispatch.
- M0 remains INCOMPLETE. This CLI seam is not the Nexo browser application and does not complete M0.

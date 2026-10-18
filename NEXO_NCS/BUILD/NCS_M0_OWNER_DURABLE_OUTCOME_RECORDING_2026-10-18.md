# NCS M0 — Owner-backed durable outcome recording

Date: 2026-10-18
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED; FOCUSED CI PASS; RUNTIME CUTOVER NOT DONE

## Why this increment exists

The independent continuity store already supported mission admission, durable PREPARED, and execution lineage, but the owner did not expose a durable operation for recording a mission-step outcome. Runtime cutover needs an owner-backed write path; using the legacy in-memory `recordNexoOutcome()` alone would not persist an outcome into Nexo's canonical store.

## Change

Added `recordOutcome({ expectedRevision, outcome })` to `src/nexo/core/continuity-owner.mjs`.

The operation:
- requires a valid expected `storeRevision` and mission/step/action/status context;
- confirms the stored mission step's action and target match;
- rejects malformed completion evidence through the existing `recordNexoOutcomeInSnapshot()` contract;
- preserves the first attempt for a mission/step and rejects conflicting identity;
- commits through `store.commitIfCurrent()`;
- reports `journalSettled: false` and `authorization: "NOT_EVALUATED"` rather than implying effect settlement or authority;
- refuses to record `completed` when the same step still has a `prepared` or `settled_observed` effect-journal entry. Observed state is not causal completion evidence.
- allows a blocked outcome to be recorded while the prepared obligation remains unresolved; reconstruction continues to let PREPARED dominate and keeps the mission blocked.

No existing runtime call path was switched to this method. No legacy path was removed. No effect-journal entry is settled by this API.

## Regression coverage

Extended `tests/nexo/continuity-migration.test.mjs` to check:
- completed outcome with missing evidence source is rejected without revision advance;
- valid labeled completion outcome is durably committed and reconstructs after reload;
- a late replay cannot overwrite the first attempt;
- a completed outcome is blocked while a PREPARED or observed-settlement journal entry remains unresolved;
- a blocked outcome can be recorded without settling PREPARED;
- restart reconstruction remains blocked on the unresolved effect.

The focused M0 workflow now runs both:
- `tests/nexo/repair-settlement-crash-cuts.test.mjs`
- `tests/nexo/continuity-migration.test.mjs`

## Exact evidence

- Owner API change: [cd559da754ca407da25095f689e434e314597e42](https://github.com/snowdenxrp/aldea-ia/commit/cd559da754ca407da25095f689e434e314597e42)
- Guard preventing completion while effect remains unresolved: [d6eed85aadcb106eeed7cfb44c0e47d215c4b5af](https://github.com/snowdenxrp/aldea-ia/commit/d6eed85aadcb106eeed7cfb44c0e47d215c4b5af)
- Source + regression test head: [c7a8852b791dec8a2bee64cda6126aa1658af198](https://github.com/snowdenxrp/aldea-ia/commit/c7a8852b791dec8a2bee64cda6126aa1658af198)
- Focused workflow wiring: [c8a7396fb945574f3176cd75c5adffb15169ad9a](https://github.com/snowdenxrp/aldea-ia/commit/c8a7396fb945574f3176cd75c5adffb15169ad9a)
- Exact workflow run: [39140292963](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140292963) — job `repair-crash-cuts` completed SUCCESS; both crash-cut and continuity-migration test steps completed SUCCESS.
- Additional source/test checks on `c7a8852...`: mission/restart [39140282526](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282526), STEP 4 [39140282510](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282510), STEP 5 [39140282488](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282488) — all SUCCESS.

## Limits and next gate

This increment adds a necessary persistence primitive; it does not prove runtime integration or complete M0.

Still open:
- runtime still imports legacy memory functions from `src/assistants/memory.js`;
- no end-to-end startup/runtime path is yet using the Nexo owner as canonical continuity;
- `recordOutcome()` is not an independent evidence verifier;
- no atomic commit spans the Nexo continuity file and Lúmina's world-state file;
- protected effects remain STOP and unresolved effects remain UNKNOWN/PREPARED;
- no claim of authority, exactly-once execution, power-loss durability, or causal attribution.

Next: use this API only as part of a test-first, coherent runtime integration contract. First preserve one canonical source and define prepare/execute/record/restart behavior for the bounded local path. Do not route effect dispatch through the new API until PREPARED-before-dispatch, unresolved-effect recovery, and final persistence semantics are all covered by integrated tests. Reuse the existing P112 and PG-009 research; do not repeat it.

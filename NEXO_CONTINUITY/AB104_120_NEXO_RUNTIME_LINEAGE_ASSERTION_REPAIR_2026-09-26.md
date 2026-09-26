# AB104.120 — Nexo runtime lineage assertion repair — 2026-09-26

Previous: AB104.119.

Fresh validation frontier:
- Run 2215 / 36204805620 executed on checkpoint 96642eebfde564542c5f3626c2b13d866ec417e9.
- The workflow reached `npm test`; the full preceding assistant, visual, spatial, behavioral, and Nexo audits reported PASS.
- Runtime regression then failed at tests/nexo/runtime.test.mjs:140.
- Exact error: `TypeError: recovered.memory.nexo.at is not a function`.
- Root cause: the test accessed `recovered.memory.nexo.at(-1)`, but the canonical Nexo outcome journal is `recovered.memory.nexo.attempts`, an array created and populated by recordNexoOutcome().
- This is a test assertion-path defect, not a simulation/evidence failure.

Repair:
- Changed only the two lineage assertions in tests/nexo/runtime.test.mjs to read `recovered.memory.nexo.attempts.at(-1)`.
- Repair commit: b621fcb2f66bbe21a6e4bffdae1722db95453b98.
- Content SHA after repair: d6d66bd2658953afaab23b819fd617372c52e1a2.

Epistemic status:
- AB104.117 remains OPEN pending clean validation.
- Run 2215 FAILED and is preserved as historical evidence.
- AB104.120 repair is PERSISTED.
- Fresh CI for b621fcb2f66bbe21a6e4bffdae1722db95453b98 must be observed before closing the frontier.

Next exact action:
1. Inspect the fresh Lúmina simulation workflow for b621fcb.
2. If it fails, recover the exact failing assertion/log before changing anything.
3. If it passes, verify the complete workflow, then close AB104.117 with a clean-validation checkpoint.
4. Only after clean validation resume the recovery/restart-boundary audit.

DO-NOT-REPEAT:
- Do not weaken canonical rest evidence.
- Do not accept NaN physical state.
- Do not replace canonical attempts journal with a different memory structure merely to satisfy the test.
- Do not delete Run 2215 failure evidence.
- Do not claim b621fcb CI passed without fresh workflow evidence.
- Do not advance past AB104.117 while validation is open.

CONTINUITY:
Resume from b621fcb2f66bbe21a6e4bffdae1722db95453b98 and this checkpoint.
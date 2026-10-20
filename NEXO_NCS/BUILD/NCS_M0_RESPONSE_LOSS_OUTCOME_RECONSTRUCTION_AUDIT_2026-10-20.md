# NCS M0 — response-loss, outcome replay, and reconstruction audit (2026-10-20)

## Scope

Follow-on audit from `NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_OUTCOME_RECONSTRUCTION.md`. No code was modified. The purpose was to reuse existing proof and identify a concrete uncovered invariant, not to manufacture a patch.

## Files inspected

- `src/nexo/core/continuity-store.mjs` — blob SHA `ee19bb3a4fad2323289ccf58f96b8ec7d8f0a1d5`
- `tests/nexo/continuity-store.test.mjs` — blob SHA `bbba981bc7fae34c7192e6b8b268f933727360d5`
- `src/nexo/core/continuity-owner.mjs` — blob SHA `10d4dae7c601023ffc00587f704434be67a8092b`
- `src/nexo/core/continuity-operations.mjs` — blob SHA `f0ff97bd6dcb8543ce5bb97f85d482a1e1c4e6aa`
- `tests/nexo/continuity-migration.test.mjs` — blob SHA `0bef1b93c6268042f14830c97e084d0a543e05f4`
- `src/nexo/core/owner-backed-runtime.mjs` — blob SHA `e5b956ea5394387708535106c2dcee8de70bf2fe`
- `src/nexo/runtime.js` — blob SHA `f9dfcd461705471546a1676b738c0547ad118f7e`
- `tests/nexo/chronicle-runtime.test.mjs` — blob SHA `873d38bf7fd19b8c90ec5e48c9fbfec87ffe0777`
- `tests/nexo/repair-settlement-crash-cuts.test.mjs` — blob SHA `60e2486698cee7a029902aa9ee09df90707fe0eb`

These are file blob SHAs, not claims about the current branch HEAD. No new CI was launched in this audit.

## Existing evidence reused — no duplicate tests added

1. **Conditional commit loses its rename response.** The store test injects an error after the canonical rename and expects `committed` only when the reread envelope matches the exact candidate and successor revision.
2. **Canonical state cannot be read after a write error.** The store returns `unknown / NEXO_CONTINUITY_STORE_COMMIT_OUTCOME_UNKNOWN`; it does not infer success.
3. **Confirmed pre-replacement write failure.** When the old canonical revision remains readable, the store returns `failed / NEXO_CONTINUITY_STORE_WRITE_FAILED`.
4. **Repair-settlement response loss.** The crash-cut regression simulates a persisted conditional commit whose response is replaced with UNKNOWN. A replay using the original expected continuity revision recovers the already-persisted observation rather than treating it as a new write.
5. **Outcome replay.** The owner checks current store revision before accepting a write; with a current revision it recognizes a matching existing outcome as `already_recorded`, and rejects contradictory late replay as `NEXO_OUTCOME_RESULT_MISMATCH`. A stale expected revision returns CAS conflict first; caller recovery must reload canonical state and reconstruct rather than assume the retry committed.
6. **Owner-backed Chronicle restart path.** Before dispatch, the runtime checks for an existing journal entry for the operation. A unique valid persisted settlement is routed to terminal-outcome recording/observation; ambiguous duplicate entries remain UNKNOWN. Repair actions remain blocked from this generic runtime until their dedicated settlement contract is wired.

## Audit result

**No new reproducible defect was established. No source or test changes are justified by this pass.** The investigated response-loss and reconstruction cases already have explicit regression coverage. Do not add a new idempotency mechanism or move the outcome lookup ahead of CAS solely to make stale-revision calls appear successful: that would change the current compare-and-swap contract without a demonstrated caller requirement.

## Remaining M0 boundary

- `src/nexo/runtime.js` still imports mission/outcome/execution/reconstruction operations from `src/assistants/memory.js`.
- `executeNexoStepWithContinuityOwner` is separately exported from `src/nexo/core/owner-backed-runtime.mjs`; that does not prove full runtime migration or production routing through the canonical owner.
- The owner-backed runtime currently permits only the demonstrated Chronicle path; repair actions are explicitly blocked pending their operation-specific settlement contract.
- The store documents that it does not claim fsync/power-loss durability, distributed-filesystem semantics, or resistance to untrusted path/symlink mutation.

## Next action

Continue with a narrow static call-site and public-result audit of the canonical owner-backed runtime boundary. Establish which entrypoints are actually used and whether any current caller can dispatch through the legacy path while treating its in-memory result as canonical continuity. Reuse existing import-graph and runtime tests. Do not perform runtime cutover, add a generic transaction wrapper, enable repair effects, or infer authorization from successful tests. If no concrete caller-level discrepancy is reproducible, record that and continue to the next unresolved M0 dependency.

## Constitutional state (unchanged)

- M0: **INCOMPLETO**
- `authorization`: **NOT_EVALUATED**
- Protected effects: **STOP**
- Legitimate root / constitutional owner proof: **PENDING / UNKNOWN**
- STEP 7: **OPEN / STOP / UNKNOWN**, not the active workstream.

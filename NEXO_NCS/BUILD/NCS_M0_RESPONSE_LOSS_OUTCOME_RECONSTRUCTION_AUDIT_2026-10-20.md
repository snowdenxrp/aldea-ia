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

**The first store/outcome replay pass found no new defect; the follow-on public application-boundary audit found and corrected one result-contract gap.** Do not add a new idempotency mechanism or move the outcome lookup ahead of CAS solely to make stale-revision calls appear successful: that would change the current compare-and-swap contract without a demonstrated caller requirement.

## Follow-on finding — confirmed mission admission hidden by unsafe lock handoff

The store deliberately returns `status: failed` with `persistenceStatus: committed` when the canonical envelope was written but lock release fails. `recordNexoMissionSafely()` previously returned that object unchanged, and `runNexoChronicleAppend()` then reduced it to a generic blocked result, discarding the confirmed admission fact. This was a public-result transparency gap, not an unsafe dispatch path: dispatch was already stopped.

**Correction:** `src/nexo/application/chronicle-append.mjs` now normalizes `persistenceStatus: committed` to a blocked public result with `missionAdmissionCommitted: true`, preserving safe `storeRevision` and code; `persistenceStatus: unknown` remains `status: unknown` with `missionAdmissionCommitted: UNKNOWN`. The caller returns the allowlisted public result and never dispatches after unsafe lock handoff. Regression coverage was added to `tests/nexo/chronicle-runtime.test.mjs` for committed-but-unsafe handoff and unknown persistence.

- Code commit: `8e8a9aeca94a9261f3e20ee5571e8f5963a13893`.
- Final code + test SHA: `52eb4f9bdb959c577c6532ab30f1294f542ef4db`.
- Exact-SHA CI SUCCESS: [M0 integrated acceptance 39368731996](https://github.com/snowdenxrp/aldea-ia/actions/runs/39368731996); [Chronicle native vertical 39368732138](https://github.com/snowdenxrp/aldea-ia/actions/runs/39368732138); [deterministic persistence 39368732251](https://github.com/snowdenxrp/aldea-ia/actions/runs/39368732251); [mission admission/restart continuity 39368731963](https://github.com/snowdenxrp/aldea-ia/actions/runs/39368731963); [STEP 4 39368731975](https://github.com/snowdenxrp/aldea-ia/actions/runs/39368731975); [STEP 5 39368732135](https://github.com/snowdenxrp/aldea-ia/actions/runs/39368732135). All six jobs completed SUCCESS on the same final SHA.

## Remaining M0 boundary

- `src/nexo/runtime.js` still imports mission/outcome/execution/reconstruction operations from `src/assistants/memory.js`.
- `executeNexoStepWithContinuityOwner` is separately exported from `src/nexo/core/owner-backed-runtime.mjs`; that does not prove full runtime migration or production routing through the canonical owner.
- The owner-backed runtime currently permits only the demonstrated Chronicle path; repair actions are explicitly blocked pending their operation-specific settlement contract.
- The store documents that it does not claim fsync/power-loss durability, distributed-filesystem semantics, or resistance to untrusted path/symlink mutation.

## Next action

The public result-receipt gaps found in this audit are corrected and tested. The call-site audit confirms `src/nexo/application/chronicle-append.mjs` uses the owner-backed runtime; the generic legacy APIs remain separately present in `src/nexo/runtime.js`, with no production caller established by this pass. Continue from the next unresolved M0 item in STATUS, not by reopening these closed receipt contracts. Do not perform runtime cutover, add a generic transaction wrapper, enable repair effects, or infer authorization from successful tests.

## Constitutional state (unchanged)

- M0: **INCOMPLETO**
- `authorization`: **NOT_EVALUATED**
- Protected effects: **STOP**
- Legitimate root / constitutional owner proof: **PENDING / UNKNOWN**
- STEP 7: **OPEN / STOP / UNKNOWN**, not the active workstream.


## Verification pointers

- Current application blob SHA: `e5ff6c385f3160dfb78982a36c73a15d2d51887d`.
- Current regression-test blob SHA: `c39bf1142447321d9d6968bfa30a7d9772f35a81`.
- Final code/test branch HEAD at the time of CI verification: `52eb4f9bdb959c577c6532ab30f1294f542ef4db`.


## Follow-on finding — persistence receipts across PREPARED, lineage, observation, and outcome

The same contract mismatch appeared in the owner-backed execution stages: a lock-release failure may be returned as `status: failed, persistenceStatus: committed`, while an exception during the observation commit leaves persistence unknown. Some consumers were flattening those cases into `false`, even though the durable state could be committed or unknown.

**Coherent correction:**
- `continuity-owner.mjs`: PREPARED reports `preparedCommitted: UNKNOWN` when the commit result is unknown; observation-write exceptions now report `observationCommitted: UNKNOWN` and `journalSettled: UNKNOWN`. A confirmed committed observation preserves `observationCommitted: true` and marks Chronicle journal settlement only for the canonical Chronicle-applied case.
- `owner-backed-runtime.mjs`: does not dispatch after unsafe PREPARED handoff; preserves confirmed PREPARED/lineage/terminal-outcome receipts while keeping the overall response blocked or UNKNOWN as appropriate; it does not proceed from an unsafe lineage receipt into reconciliation; and it preserves a known Chronicle journal settlement without falsely claiming the terminal outcome was recorded.
- `chronicle-append.mjs`: preserves confirmed mission admission through unsafe lock handoff as `blocked + missionAdmissionCommitted: true`; unknown persistence remains `UNKNOWN`.
- Regressions: `tests/nexo/chronicle-runtime.test.mjs` and `tests/nexo/repair-settlement-crash-cuts.test.mjs`.

### Red/green record

- Intermediate runtime SHA `3aed78b9788c9ffe25bc0077b02793a1ca6f75c0` and following test SHA `0bf505d483cd56345fe7a7c9240545c86616bc2d` failed the repair crash-cut assertion because the old test expected `observationCommitted: false` after a thrown commit response. That expectation contradicted the explicit unknown-outcome contract and was changed to `UNKNOWN`; the failed runs are retained as red history, not erased.
- Final code/test SHA `5aef07d4fb933d8c0be4ee4cbc325e7e8c4f85a7`: all six focal workflows SUCCESS on this exact SHA:
  - [M0 integrated acceptance 39369199068](https://github.com/snowdenxrp/aldea-ia/actions/runs/39369199068)
  - [repair settlement crash cuts 39369199071](https://github.com/snowdenxrp/aldea-ia/actions/runs/39369199071)
  - [effect and settlement contracts 39369199064](https://github.com/snowdenxrp/aldea-ia/actions/runs/39369199064)
  - [deterministic persistence 39369199083](https://github.com/snowdenxrp/aldea-ia/actions/runs/39369199083)
  - [STEP 4 semantic validation 39369199069](https://github.com/snowdenxrp/aldea-ia/actions/runs/39369199069)
  - [STEP 5 outcome classification 39369199073](https://github.com/snowdenxrp/aldea-ia/actions/runs/39369199073)

This corrects persistence-result reporting and maintains fail-closed dispatch. It does not prove owner authority, general repair settlement, power-loss durability, or full runtime migration.


## Final source/test blob pointers at code/test SHA `5aef07d4fb933d8c0be4ee4cbc325e7e8c4f85a7`

- `continuity-owner.mjs`: `81db34308e3881e3fa900653751a325952eeceb9`
- `owner-backed-runtime.mjs`: `8397fc41c533a7c5d1ca424ad90c4bd95f8dffa6`
- `chronicle-append.mjs`: `e5ff6c385f3160dfb78982a36c73a15d2d51887d`
- `chronicle-runtime.test.mjs`: `8532700c63414ebc7a163ff6853958d85f8b93e4`
- `repair-settlement-crash-cuts.test.mjs`: `dc65d462cdbd3a3dc1bf370c60af0b92eb7dbb55`

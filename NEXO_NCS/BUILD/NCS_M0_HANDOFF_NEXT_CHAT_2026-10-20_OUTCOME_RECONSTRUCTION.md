# NCS — M0 handoff for next chat (2026-10-20)

## Mandatory opening instruction

Start the next chat with the exact keyword `NCS`. The mission is **M0**. Continue from this handoff and `NEXO_NCS/STATUS.md`; do not restart prior research, re-run closed audits without a concrete new discrepancy, switch to M1, or make STEP 7 the active workstream.

Repository: `github.com/snowdenxrp/aldea-ia`  
Branch: `ncs-clean-architecture`  
Current project entry point: [NEXO_NCS/STATUS.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/STATUS.md)

## Non-negotiable state

- M0: **INCOMPLETO**.
- `authorization: NOT_EVALUATED`.
- Protected effects: **STOP**.
- Legitimate root / constitutional owner proof: **PENDING / UNKNOWN**.
- STEP 7 remains OPEN / STOP / UNKNOWN, not this workstream.
- Nexo and Lúmina are separate.
- Do not equate structural consistency, caller-provided `verified`, CI success, or a reconstructed status with authenticated provenance, causal attribution, legitimate authority, or permission to execute protected effects.
- No invented goal verifier, root credential, queue, retries, transaction wrappers, state labels, or authorization semantics. If a structural change is needed, expose the root cause and stop to redesign instead of quietly layering patches.
- Keep STATUS and handoff as continuity records. Record red/green history honestly; do not erase failed test-first runs.

## Work completed before this checkpoint

### Persisted mission dependency graph
The persisted snapshot validator in `src/nexo/core/continuity-contract.mjs` now validates mission `steps` and dependency graph rather than relying only on admission-time validation. It rejects invalid/duplicate step identities, missing/blank actions, malformed or sparse `dependsOn`, duplicate/dangling/self references, and cycles; malformed persisted plans fail closed as `NEXO_MEMORY_SCHEMA_UNKNOWN`.

Related code/test SHA: `4dc34fb045ff47457ca6476a07d3b5f3d7550469`.
- Test-first failure run `39366069315`: exposed non-array dependencies not rejected.
- Test-first failure run `39366159595`: exposed cycles not rejected.
- Runs `39366172190` and `39366172230`: old repair-session fixture had dangling dependency and had to be made semantically valid (a real prerequisite still planned).
- Final SUCCESS at code/test SHA `4dc34fb045ff47457ca6476a07d3b5f3d7550469`:
  - Integrated M0 acceptance `39366255751`
  - Repair settlement crash cuts `39366255728`
  - Full `npm test` `39366255710`
  - STEP 4 `39366255732`
  - STEP 5 `39366255760`
- Documentation updates: STATUS blob `09f6bfea1b476f47c10cfa1a6557bc142279144c`; prior handoff update blob `6df226373d2b5951bf70b48d6913b4424e849559`.
- Documentation HEAD at that checkpoint: `af7002d9bd09eaa7b6428d0401adfdd6a07583c4`; `npm test` CI SUCCESS at docs HEAD, run `39366394201`.
- The separate proposed audit report `NCS_M0_PERSISTED_MISSION_GRAPH_VALIDATION_2026-10-20.md` was **not created** (GitHub tool blocked creation); do not claim it exists. STATUS and handoff contain the validation record.

### Current follow-on audit: terminal outcomes and canonical reconstruction
Reviewed current branch files:
- `src/nexo/core/continuity-operations.mjs`
- `src/nexo/core/continuity-owner.mjs`
- `src/nexo/application/continuity-queries.mjs`
- `tests/nexo/continuity-migration.test.mjs)
- `NEXO_NCS/STATUS.md`

The existing tests already cover important cases, so do not duplicate them:
- completed attempt with action/target mismatch is blocked as `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`, and no result is projected;
- unverified completion evidence is blocked as `NEXO_COMPLETION_EVIDENCE_UNVERIFIED`;
- caller-labelled completion for mutating repair action is blocked as `NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED`;
- `local_analysis` is the explicit non-mutating exception; its completion evidence must have `verified`, `kind`, and `source`, but those fields alone do not authenticate the producer;
- Chronicle completion requires canonical persisted settlement and matching outcome evidence;
- unresolved `prepared` / `settled_observed` effects dominate outcome reconstruction;
- contradictory late outcome replay is rejected as `NEXO_OUTCOME_RESULT_MISMATCH`, preserving the original persisted result;
- PREPARED identity/revision and lineage constraints remain separate from outcome settlement.

The latest pass did **not** establish a new reproducible defect, did not change code, and did not run new CI. Do not report a new fix or new test pass from this latest pass. The user-facing summary said the next task is to continue auditing store revision / response-loss / reconstruction consistency.

## Exact next actions

1. Re-read `NEXO_NCS/STATUS.md` and this handoff first. Use repository file fetches to verify the current branch HEAD and latest relevant workflow results before any edits; the SHAs above are the last known checkpoint, not a claim that no later commit exists.
2. Continue M0 by inspecting the persisted-outcome / commit path and reconstruction around `src/nexo/core/continuity-owner.mjs`, `src/nexo/core/continuity-operations.mjs`, and existing tests. Focus narrowly on response lost after commit, same-revision replay, stale revision conflict, ambiguous commit/persistence result, and whether the reconstructed projection can disagree with the durable record. Reuse existing tests before writing anything.
3. Pick one candidate only if it is a concrete invariant not already covered. Write a regression that fails on the exact current code SHA, establish the reason, implement the smallest coherent fix, and rerun targeted tests plus the appropriate CI workflows. Preserve all red/green runs and tie each SUCCESS to the exact code/test SHA.
4. If no new discrepancy is reproducible, record that honestly and move to the next unresolved M0 dependency from STATUS—do not manufacture a patch.
5. Update `NEXO_NCS/STATUS.md` and this handoff with code/test SHA, changed paths, exact CI run IDs/statuses, red/green history, limits, and next action. Verify the resulting documentation commit/HEAD.
6. Do not wire or activate protected runtime effects merely because tests pass. The known global gap remains that `src/nexo/runtime.js` still imports mission/outcome/execution/reconstruction operations from `src/assistants/memory.js`; do not claim full owner-backed runtime migration without end-to-end evidence.
7. Do not reopen the already investigated PREPARED trust boundary, broad root-family research, STEP 7, or M1 unless a concrete new M0 finding makes it necessary.

## Useful source links

- [STATUS / NCS entry point](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/STATUS.md)
- [Previous M0 handoff](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEW_CHAT_2026-10-19.md)
- [Continuity contract](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/core/continuity-contract.mjs)
- [Continuity operations / reconstruction](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/core/continuity-operations.mjs)
- [Continuity owner / persistence](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/core/continuity-owner.mjs)
- [Migration/reconstruction regressions](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/continuity-migration.test.mjs)
- [Repair session regressions](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/repair-session.test.mjs)

## Start-next-chat instruction

Begin by acknowledging the keyword `NCS`, reading STATUS and this handoff, verifying current HEAD/CI, then continuing the narrow M0 audit above. Do not ask the user to repeat already preserved context. The mission remains M0.


## Addendum — response-loss / outcome-reconstruction audit (2026-10-20)

Audit record: [NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md](NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md).

- Existing tests already cover lost conditional-commit response, UNKNOWN when canonical reread is unavailable, confirmed write failure, repair-settlement replay after a lost response, contradictory late outcome replay, and Chronicle's no-redispatch recovery path.
- No new reproducible defect was established; no code/test changes and no new CI run in this pass. Do not duplicate these regressions or treat stale-revision conflict as proof of persistence.
- Next: audit actual call sites and the public result boundary for the canonical owner-backed runtime versus legacy `src/assistants/memory.js`. No runtime cutover or repair-effect enablement without concrete call-site evidence and crash-cut coverage.
- M0 INCOMPLETO; authorization NOT_EVALUATED; protected effects STOP; legitimate root PENDING/UNKNOWN.


## Addendum — mission-admission persistence receipt fix (2026-10-20)

- Follow-on audit found that a lock-release failure after a confirmed store commit returned `status: failed, persistenceStatus: committed`; the Chronicle public boundary dropped the committed-admission fact.
- Fixed in `src/nexo/application/chronicle-append.mjs`: public result now remains blocked, `missionAdmissionCommitted: true`, `dispatchAttempted: false`, and `redispatchAuthorized: false`. Unknown persistence remains UNKNOWN. Regression added to `tests/nexo/chronicle-runtime.test.mjs`.
- Final code/test SHA: `52eb4f9bdb959c577c6532ab30f1294f542ef4db`. Exact-SHA CI SUCCESS: integrated M0 `39368731996`; Chronicle `39368732138`; deterministic persistence `39368732251`; mission admission/restart `39368731963`; STEP 4 `39368731975`; STEP 5 `39368732135`.
- Full audit: [NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md](NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md).
- This is a result-contract correction only. M0 INCOMPLETO; authorization NOT_EVALUATED; protected effects STOP; legitimate root PENDING/UNKNOWN.


## Addendum — cross-stage persistence receipt correction (2026-10-20)

- Corrected persistence-result reporting across mission admission, PREPARED, execution lineage, Chronicle observation/settlement, and terminal outcome. Confirmed `persistenceStatus: committed` is preserved as a factual receipt while unsafe handoff blocks progression; unknown outcomes stay `UNKNOWN`. No dispatch or retry is authorized by these receipts.
- Updated `src/nexo/core/continuity-owner.mjs`, `src/nexo/core/owner-backed-runtime.mjs`, `src/nexo/application/chronicle-append.mjs`; regressions in `tests/nexo/chronicle-runtime.test.mjs` and `tests/nexo/repair-settlement-crash-cuts.test.mjs`.
- Red history retained: `3aed78b9788c9ffe25bc0077b02793a1ca6f75c0` and `0bf505d483cd56345fe7a7c9240545c86616bc2d` failed an outdated assertion that a thrown commit response proves non-persistence. The assertion now expects UNKNOWN.
- Final code/test SHA: `5aef07d4fb933d8c0be4ee4cbc325e7e8c4f85a7`; all six focal workflows SUCCESS: M0 integrated `39369199068`, repair crash cuts `39369199071`, effect/settlement `39369199064`, deterministic persistence `39369199083`, STEP 4 `39369199069`, STEP 5 `39369199073`.
- Full record: [NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md](NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md).
- State remains M0 INCOMPLETO; authorization NOT_EVALUATED; protected effects STOP; legitimate root PENDING/UNKNOWN. Next: resume from the next unresolved M0 item in STATUS without reopening these receipt contracts or cutting over the legacy runtime.

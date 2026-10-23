# NCS — Master handoff for the next chat
Date: 2026-10-23
Branch: `ncs-clean-architecture`
Repository: https://github.com/snowdenxrp/aldea-ia
Purpose: resume from verified current state without repeating closed research or audits.

## 1. Instructions for the next chat

1. Open exactly with the user's continuity keyword `NCS` if starting a new chat; then read this handoff and current `NEXO_NCS/STATUS.md`.
2. Follow the established entry order: `STATUS → MASTER/CORE → BUILD → implementation`. Treat STATUS as the entry door.
3. Do not repeat the already-closed audits listed below unless a concrete code change invalidates their evidence.
4. Do not claim code/test/CI success from documentation, a commit existing, or a workflow that belongs to another SHA. Verify CI on the exact implementation+test commit and then, if practical, verify the STATUS documentation commit separately.
5. Do not treat source-level design, fixture injection, or local persistence as owner authority or proof of protected execution.
6. Keep Option A: bounded local Continuity/Chronicle persistence is an internal capability, not authority. Do not put a blanket deny-first gate on all local persistence.
7. Never implement a positive authority decision, wire protected effects, activate repair, or expose generic execution while root recognition/provenance remains unresolved.
8. If a concrete defect is not demonstrated, do not add speculative guards, registries, queues, IDs, retries, tombstones, transaction wrappers, or parallel state stores. Stop and document the exact blocker instead.
9. Keep Lúmina separate from Nexo. Do not merge simulation, repair, shell, network, or other protected/external effects into the allowed local Chronicle path.

## 2. Canonical state (unchanged)

- M0: `INCOMPLETO`
- Authorization: `NOT_EVALUATED`
- Legitimate root: `PENDING/UNKNOWN`
- Protected effects: `STOP`
- The initial/single-root path is an accepted architectural scope only; it has not been provisioned or proven.
- Device/biometric evidence is not itself authority. The owner must remain recognizable across phone replacement, model changes, and reinstall, but no real root proof is established.
- `executeProtectedTransition` does not call `effectBoundary.prepare`; its fallback remains `NOT_IMPLEMENTED`. An injected `AUTHORIZED` test fixture is not Genesis/root proof.
- `conditionalCommit` is internal persistence, not a demonstrated external effect sink.
- Product repair session is explicitly blocked by the M0 Option A gate; do not rewire it.

## 3. Latest repository evidence inspected for this handoff

Branch: `ncs-clean-architecture`.

Latest verified implementation+test checkpoint:
- SHA: `962d1a327683b412c401f323514d401e7e8ec8f1`
- [Deterministic persistence / `npm test` — run 39980113239 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113239), job `120504886619` SUCCESS.
- [STEP 4 — run 39980113168 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113168).
- [STEP 5 — run 39980113209 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113209).

Current STATUS content/blob observed immediately before this handoff edit:
- Blob SHA: `0c38bc81e43a9d62dcc7b0c8a633aea8255144df`
- https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/STATUS.md

Current Open Loops contract:
- `NEXO_NCS/BUILD/NCS_M0_OPEN_LOOPS_QUERY_CONTRACT_2026-10-23.md`
- Blob SHA: `164dbee6fd1cb2a46db933a3f63e88201c651268`
- https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OPEN_LOOPS_QUERY_CONTRACT_2026-10-23.md

Relevant recent caller matrix:
- `NEXO_NCS/BUILD/NCS_CORE_INPUT_TRUST_BOUNDARY_CALLER_MATRIX_2026-10-23.md`
- Blob: `8cc15e9faeeb45daf034d343d5a6faa5c52e5374`
- https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_CORE_INPUT_TRUST_BOUNDARY_CALLER_MATRIX_2026-10-23.md

## 4. Open Loops: the current implementation checkpoint

The master vision includes Open Loops. The right first slice is a read-only derived projection from canonical continuity, not a new task ledger, queue, scheduler, or independent lifecycle.

Design contract:
- `NEXO_NCS/BUILD/NCS_M0_OPEN_LOOPS_QUERY_CONTRACT_2026-10-23.md`
- Blob: `bbd52206e80903f98ad973e8997c19134776235c`
- https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OPEN_LOOPS_QUERY_CONTRACT_2026-10-23.md

Implementation:
- `src/nexo/application/continuity-queries.mjs`, blob `82429e4ec2b2830029371ee292f4875ff1180a8a`
- `src/nexo/application/index.mjs`, blob `fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3`
- `tests/nexo/open-loops-query.test.mjs`, blob `b294114f9a09136a3468faa4e5c991509e6dcbcd`
- `package.json`, blob `e45dc6d215db53ea2758009cd501f565634e3610`
- Test file: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/open-loops-query.test.mjs
- Query source: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/application/continuity-queries.mjs

`loadNexoOpenLoops(continuityPath)` is implemented and exported from the narrow application API; CLI exposure is deliberately deferred. It:
- Loads one validated canonical snapshot/revision.
- Projects non-completed missions/steps separately from `prepared` and `reconciled_observed` effect-journal entries; excludes `settled_observed`.
- Omits target/context payloads.
- Returns `authorization: NOT_EVALUATED` and `dispatchAttempted: false`.
- Does not create a missing store or mutate source continuity.
- Sorts output deterministically and blocks above 1,000 projected items instead of silently truncating.
- Returns `NEXO_OPEN_LOOPS_JOURNAL_LINKAGE_UNKNOWN` if an unresolved journal row lacks mission/step/action linkage.
- Test coverage includes missing-store non-creation, required path, valid empty snapshot, mission/step projection, journal-status separation, private target omission, unchanged bytes/mtime, deterministic repeated result, unknown linkage, and output cap.

**Exact-SHA CI verification completed after the initial handoff.** The combined implementation+test SHA is `962d1a327683b412c401f323514d401e7e8ec8f1`. All three workflows passed on that exact SHA: [deterministic persistence / npm test run 39980113239](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113239), job `120504886619`; [STEP 4 run 39980113168](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113168); [STEP 5 run 39980113209](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113209).

During the implementation audit, a concrete gap was found: journal rows with syntactically present but orphaned mission/step references, or an action differing from the canonical step, could be projected as obligations. The query now validates each unresolved journal row against the mission and step in the same canonical snapshot and blocks with `NEXO_OPEN_LOOPS_JOURNAL_LINKAGE_UNKNOWN` when the reference is missing or discordant. Regression tests cover missing fields, orphan references, and action mismatch.

This verifies the read-only Open Loops implementation+test SHA; it does not verify owner authority, a protected execution path, or a broader Open Loops engine. Do not repeat the now-closed exact-SHA CI check unless the implementation/tests change.

### Exact next actions — updated after exact-SHA verification

1. Do not repeat the exact-SHA CI check unless implementation/tests change. The combined implementation+test SHA `962d1a327683b412c401f323514d401e7e8ec8f1` passed:
   - deterministic persistence / `npm test`: run `39980113239`, job `120504886619`, SUCCESS;
   - STEP 4: run `39980113168`, SUCCESS;
   - STEP 5: run `39980113209`, SUCCESS.
2. The implementation audit found and fixed two silent-omission hazards:
   - orphan/mismatched unresolved-journal links; each journal mission/step/action must resolve against the same canonical snapshot;
   - an unrecognized journal status could be silently omitted when there were no missions to reconstruct. The query now blocks with `NEXO_OPEN_LOOPS_JOURNAL_STATUS_UNKNOWN` for any journal status other than `prepared`, `reconciled_observed`, or the explicitly excluded terminal `settled_observed`.
   Regression coverage includes missing fields, orphan references, action mismatch, unknown status with zero missions, direct planned and failed mission projection, completed-status discrepancy, corrupt continuity, and resource-limit failure.
3. Keep Open Loops scoped as an application-level read-only projection. Do not add CLI exposure, a new store, queue, scheduler, or task identity without a concrete acceptance case.
4. Next work unit: consult the current MASTER/CORE and existing BUILD/DECISIONS plan to choose one already-supported internal capability and define its smallest concrete acceptance case before implementation. Do not infer the next feature from the broad master vision alone.
5. Preserve exact evidence rules: implementation+test SHA, run/job IDs, and conclusions must match. A documentation commit does not substitute for runtime/test proof.

## 5. Existing audits/constraints that must not be repeated

- AB104.759R is the correct anchor, not .862R; AB104.999R→AB105.000R; AB104.151 boundary; P112 active; AB105.116R protected; TLC frozen; G0 W1/D1 UNKNOWN, not vulnerability; P34 closed; P35 load-failure/fallback/persistState.
- Do not repeat the closed AB104.147–AB104.150 / P112 prepared-checkpoint durability audit or AB104.214 effect-path durability research unless new code invalidates their findings.
- Do not repeat the owner/root/authority design review. Reuse:
  - `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_GATE_PRIOR_CONTRACT_REUSE_AND_NEXT_GATE_2026-10-20.md`
  - `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`
  - `NEXO_NCS/BUILD/NCS_M0_E_CLAIM_RELATIVE_AUTHORITY_BOUNDARY_INVENTORY_2026-10-22.md`
  - `NEXO_NCS/BUILD/NCS_M0_E_OPTION_A_FILESYSTEM_TRUST_BOUNDARY_AUDIT_2026-10-21.md`
  - `NEXO_NCS/BUILD/NCS_M0_E_OPTION_A_OPERATION_EFFECT_ENFORCEMENT_MATRIX_2026-10-21.md`
  - `NEXO_NCS/BUILD/NCS_CHRONICLE_MUTATION_SURFACE_AND_TEST_OWNERSHIP_2026-10-23.md`
  - `NEXO_NCS/BUILD/NCS_CHRONICLE_OPTION_A_POLICY_RECONCILIATION_2026-10-23.md`
- Recent input guards address ordinary accessor/descriptors and malformed shapes; they do not neutralize Proxy traps. Do not add redundant guards without a new reproducible defect and an architecture-level trust decision.

## 6. Vision and project discipline

- The master architecture dated 2026-09-23 is a long-term destination, not a claim that every subsystem exists. Continue classifying items as 🟢 recovered, 🔵 extension, 🔴 conflict.
- Core/Constitution/Identity/World Model/Memory/Knowledge/Learning/Capabilities/Tools/Missions/Autonomy/Execution/Verification/Recovery/Chronicle/Continuity/Portability/Successor are part of the broad vision; build from the current proven frontier.
- Keep Nexo and Lúmina separate.
- Do not repeat explanations as a substitute for progress. Record what changed, what was actually verified, remaining blockers, and the single next action.
- User expects proactive continuation but has not authorized silently changing constitutional scope.

## 7. Current handoff status

- The handoff and STATUS are continuity records; neither alters runtime or constitutional state.
- Open Loops implementation+test SHA `962d1a327683b412c401f323514d401e7e8ec8f1` is verified by deterministic persistence/`npm test`, STEP 4, and STEP 5 workflows; see Section 4 and the Open Loops contract.
- Next chat should begin at `STATUS → MASTER/CORE → BUILD`, then select one next internal capability with a concrete acceptance case. Do not restart trust-boundary research or repeat the closed Open Loops CI check.

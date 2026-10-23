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

Current branch: `ncs-clean-architecture`.
Latest commit returned by repository commit listing at handoff time:
- `f87c010ab4f282a50f2cd4fd8940420ca74ddc0e` — “Actualizar estado de Lúmina”
- https://github.com/snowdenxrp/aldea-ia/commit/f87c010ab4f282a50f2cd4fd8940420ca74ddc0e

Current STATUS content/blob observed:
- Blob SHA: `d3da6f4a022defacc642c881b9720ab1ce87b954`
- https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/STATUS.md

Relevant recent caller matrix:
- `NEXO_NCS/BUILD/NCS_CORE_INPUT_TRUST_BOUNDARY_CALLER_MATRIX_2026-10-23.md`
- Blob: `8cc15e9faeeb45daf034d343d5a6faa5c52e5374`
- https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_CORE_INPUT_TRUST_BOUNDARY_CALLER_MATRIX_2026-10-23.md

### Caller matrix conclusions (do not re-investigate from scratch)

- The narrow CLI route is `scripts/nexo.mjs → src/nexo/application/index.mjs`; its tested export surface is limited to Chronicle append, read-only continuity queries and previews.
- `src/nexo/application/chronicle-append.mjs` is a concrete production caller of `executeNexoStepWithContinuityOwner`, assembling a Chronicle/continuity owner and adapter for `chronicle_append`.
- `src/nexo/core/owner-backed-runtime.mjs` blocks canonical repair actions and actions other than `chronicle_append` before dispatch in that route.
- `src/nexo/adapters/chronicle-effect.mjs` narrows the action but does not authenticate the supplied store capability.
- Ordinary accessor/prototype guards do not neutralize Proxy traps. No universal claim that every internal module is unreachable is established.
- Chronicle append is a bounded local mutation allowed under Option A; result still says `authorization: NOT_EVALUATED`. It is not owner-root proof or general protected execution.
- Do not add another reflective guard just to address Proxy traps. The full generic-runtime caller graph and enforceable input trust model remain unresolved.

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

**CRITICAL VERIFICATION GAP:** the current STATUS and contract explicitly say the Open Loops implementation has not yet had CI verified for the exact final code+test SHA. No local test execution was available in this workflow. Do not call it verified and do not infer PASS from other recent workflows. This is the first task in the next chat.

### Exact next actions

1. Resolve the exact commit SHA that contains the combined `loadNexoOpenLoops` implementation, public export, test file, and package test command. Inspect commit history/diff or compare current branch state; do not guess the SHA from blob IDs.
2. Fetch workflow runs/jobs for that exact SHA. Wait/check until the relevant workflow is `completed/success`; if failed, inspect raw job logs and correct only the concrete failing behavior. Do not mark PASS based on a different SHA.
3. Audit the implementation for contract/test mismatches before adding features:
   - Are all canonical terminal and nonterminal mission statuses handled only according to existing reconstruction semantics?
   - Does the snapshot loader validate all records before projection?
   - Is unresolved journal linkage validation adequate for the existing canonical schema?
   - Does sorting guarantee determinism for duplicate records without inventing identity?
   - Does the output cap count all projected items as documented?
   - Does any status discrepancy or malformed record block rather than silently omit a loop?
   - Are missing/corrupt/resource-limit failures preserved as blocked?
   - Does the query stay read-only and avoid dispatch/reconciliation/adapter calls?
4. If the implementation passes, document the exact code+test SHA, workflow/run/job IDs, raw result, and interpretation in BUILD and STATUS. The STATUS-only commit is documentation, not a substitute for testing the implementation SHA.
5. Then proceed to the next internal capability only after reviewing existing master/build plans. Prefer read-only, canonical-state-derived functionality. Do not expose CLI or add a second store without a demonstrated acceptance case.

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

- The handoff itself is intended to prevent context loss; it does not alter runtime or constitutional state.
- The source and test files for Open Loops are present on the current branch, but exact combined implementation SHA and its CI result still need to be verified.
- Next chat should begin by reading this handoff and STATUS, then verify the Open Loops implementation CI. Do not restart trust-boundary research.

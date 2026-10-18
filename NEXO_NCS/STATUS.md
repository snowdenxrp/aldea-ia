## M0 — Learning memory snapshot isolation (2026-10-18)

- Finding: `learnFromReports()` updated matching pattern counters through shared object references, mutating the prior memory snapshot while constructing the next one.
- Change + regression: clone pattern records before updating `seen` / `lastSeen`; regression added to `tests/nexo/restart-reconstruction.test.mjs`.
- Report: [NCS M0 learning memory snapshot isolation](BUILD/NCS_M0_LEARNING_MEMORY_SNAPSHOT_ISOLATION_2026-10-18.md).
- Focused CI PASS on commit `7723f38e901ccca75323aa92b6ccda2cf5c022ba`: mission admission / restart continuity [39084194889](https://github.com/snowdenxrp/aldea-ia/actions/runs/39084194889) (both mission and restart tests passed); STEP 4 [39084194898](https://github.com/snowdenxrp/aldea-ia/actions/runs/39084194898); STEP 5 [39084194895](https://github.com/snowdenxrp/aldea-ia/actions/runs/39084194895).
- Scope: local learning snapshot correctness only. Proxy-trap boundary remains a design STOP; STEP 7 = OPEN / STOP / UNKNOWN; protected effects STOP.

## Consolidated M0.1 onward continuity dossier (2026-10-17)

- Saved complete M0.1+ continuity, existing increments, source/test/CI evidence, architecture decisions, unresolved boundaries, and exact next-chat instructions in [NCS M0.1 onward consolidated continuity](BUILD/NCS_M0_1_ONWARD_CONSOLIDATED_CONTINUITY_2026-10-17.md).
- **True M0 objective:** minimum coherent functional Nexo Core — observation, interpretation/reasoning, planning, memory/continuity, outcome verification, learning and replanning under honest uncertainty. Not endless hardening patches, not isolated tests, and not a claim of authority or protected activation.
- Next work must start from latest verified branch head, check existing reports before research, and prioritize a real functional Core loop. Do not restart M0.1/M0.2 or repeat M0.63–M0.70 without new evidence.
- Current boundaries unchanged: observation-to-claim identity gap remains documented; Proxy trust-boundary design pending; STEP 7 = OPEN / STOP / UNKNOWN; protected effects STOP.

## M0 functional correction — missing evidence must block the step, not only the mission (2026-10-17)

- `advanceNexoMission()` previously returned a blocked mission when a completion lacked acceptable evidence, but left its target step `executing` with no step-level reason.
- Now the step and mission both become `blocked`, with `MISSING_VERIFIED_EVIDENCE`; the objective becomes `replan_from_constraints`, and execution planning returns no actions.
- Source commit [`ec20889`](https://github.com/snowdenxrp/aldea-ia/commit/ec20889da48e57c895b8273d57d2c68ec5027471); regression commit [`f27147f`](https://github.com/snowdenxrp/aldea-ia/commit/f27147f0a273d28ad8168a9f29e9c0ab06e24713).
- Focused mission continuity [39081098250](https://github.com/snowdenxrp/aldea-ia/actions/runs/39081098250), M0 Core [39081098279](https://github.com/snowdenxrp/aldea-ia/actions/runs/39081098279), STEP 4 [39081098274](https://github.com/snowdenxrp/aldea-ia/actions/runs/39081098274), STEP 5 [39081098277](https://github.com/snowdenxrp/aldea-ia/actions/runs/39081098277) — all success.
- Report: [M0 missing-evidence step state](BUILD/NCS_M0_MISSING_EVIDENCE_STEP_STATE_2026-10-17.md).
- M0 remains the minimum functional Core, not an endless patch series. This does not establish evidence provenance, constitutional authority, or protected-path closure. Proxy boundary unresolved; STEP 7 = OPEN / STOP / UNKNOWN; protected effects STOP.

## M0 mission admission — make the eight-step bound explicit (2026-10-17)

- Mission planning still admits at most eight steps, but now exposes candidate/admitted/omitted counts and a truncation flag; omitted candidates are not treated as failed or resolved.
- An admitted step whose prerequisite fell outside the admission bound is blocked as `DEPENDENCY_NOT_ADMITTED` rather than appearing executable.
- Admission metadata survives durable plan reconstruction.
- Source/test commit: [`10067f1`](https://github.com/snowdenxrp/aldea-ia/commit/10067f1eaa626500c803bb6d3504fc5816eb7239).
- Focused CI: mission admission/continuity [39080272772](https://github.com/snowdenxrp/aldea-ia/actions/runs/39080272772), STEP 4 [39080272763](https://github.com/snowdenxrp/aldea-ia/actions/runs/39080272763), STEP 5 [39080272752](https://github.com/snowdenxrp/aldea-ia/actions/runs/39080272752), M0 Core [39080272843](https://github.com/snowdenxrp/aldea-ia/actions/runs/39080272843) — all success.
- Report: [M0 bounded mission admission](BUILD/NCS_M0_MISSION_ADMISSION_BOUNDARY_2026-10-17.md).
- This remains non-authoritative planning metadata. The Core Proxy-trap boundary remains unresolved; STEP 7 stays OPEN / STOP / UNKNOWN and protected effects remain STOP.

## M0 functional continuity — preserve mission context across restart (2026-10-17)

- Implemented in `src/assistants/memory.js`: durable mission plans retain optional step `priority`, `reason`, `source`, `reversible`, `requiresEvidence`, `requiresVerification`, and detached `context`, plus plan-level uncertainty/evidence counts.
- Regression in `tests/nexo/restart-reconstruction.test.mjs` verifies reconstruction and detachment.
- Source/test commit: [`f7828d1`](https://github.com/snowdenxrp/aldea-ia/commit/f7828d1e0f11f81e03106af9a50f914d99c87b1c); focused workflow commit [`3dfb34b`](https://github.com/snowdenxrp/aldea-ia/commit/3dfb34b7879e1b580f77ec96d1788b28bd55dfe2).
- STEP 5 CI [39079779219](https://github.com/snowdenxrp/aldea-ia/actions/runs/39079779219) passed and explicitly ran `tests/nexo/restart-reconstruction.test.mjs`, `tests/nexo/outcome-classifier.test.mjs`, and `tests/nexo/protected-transition.test.mjs`. Prior STEP 4 CI [39079693260](https://github.com/snowdenxrp/aldea-ia/actions/runs/39079693260) also succeeded.
- This improves continuity only; it does not authenticate authority or authorize effects. STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
- Report: [M0 functional continuity report](BUILD/NCS_M0_FUNCTIONAL_CONTINUITY_PRESERVE_MISSION_CONTEXT_2026-10-17.md).

## Core boundary design STOP — caller-controlled Proxy traps (2026-10-17)

- Finding: reflection-based validators inspect caller-owned objects via `Object.getPrototypeOf`, `Reflect.ownKeys`, and `Object.getOwnPropertyDescriptor`; Proxy traps can execute during those operations.
- This is source-level analysis, not a claimed CI reproduction or deployed exploit.
- Do not add a proxy-detection patch that relies on the same reflective operations. Decide the root trust boundary first: serialized data parsed inside Core, explicitly trusted in-process callers, or another owner-approved design.
- Report: [Core Proxy-trap boundary STOP](BUILD/NCS_CORE_BOUNDARY_PROXY_TRAPS_DESIGN_STOP_2026-10-17.md).
- No code change was made for this finding. M0.70 remains the latest completed focused-CI increment; STEP 7 remains OPEN / STOP / UNKNOWN.

## M0.70 — Avoid caller-controlled array method dispatch in reconciliation

- State: implemented; focused CI verified on corrected test head `d55e87f0d429fecd471b6f04257cca147c587243`.
- Defect: caller-controlled array `.find` could shadow the built-in method and execute arbitrary caller code during evidence selection.
- Correction: reconciliation uses own numeric-index data descriptors, never dispatches through the array's `.find`; malformed/holey/accessor entries fail closed.
- Regression: custom `.find` returns a plausible candidate but its call counter remains zero; valid indexed candidate yields `RESOLVED`.
- Report: [M0.70 — Avoid caller-controlled array method dispatch](BUILD/NCS_M0_70_AVOID_CALLER_CONTROLLED_ARRAY_METHODS_2026-10-17.md).
- Source commit: [`30c5f2d`](https://github.com/snowdenxrp/aldea-ia/commit/30c5f2dbe2d8a6631cf7b9c7632a1b5a785c9ee7); corrected test commit: [`d55e87f`](https://github.com/snowdenxrp/aldea-ia/commit/d55e87f0d429fecd471b6f04257cca147c587243).
- Focused CI success: STEP 4 [39078527864](https://github.com/snowdenxrp/aldea-ia/actions/runs/39078527864); STEP 5 [39078527811](https://github.com/snowdenxrp/aldea-ia/actions/runs/39078527811); STEP 6 [39078527808](https://github.com/snowdenxrp/aldea-ia/actions/runs/39078527808); M0 [39078527855](https://github.com/snowdenxrp/aldea-ia/actions/runs/39078527855).
- Limit: does not authenticate `authoritative: true`, establish provenance/currentness, or prove production protected-path closure. STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.

## M0.69 — Fail closed on malformed reconciliation evidence envelope

- State: implemented; focused CI verified on source/test commit `3ba751da5792f5534c7af6b6c2485f8e4c1ae364`.
- Defect: non-array evidence (including `null` and plain objects) escaped the reconciler as a thrown `TypeError`, unlike malformed nested evidence which returns `UNRESOLVED`.
- Correction: malformed evidence values return frozen `UNRESOLVED` with null outcome and empty evidence; malformed reconciliation cases remain `INVALID`.
- Regression: `null`, object, string, and numeric evidence all return `UNRESOLVED` without throwing.
- Report: [M0.69 — Fail closed on malformed reconciliation evidence](BUILD/NCS_M0_69_FAIL_CLOSED_MALFORMED_RECONCILIATION_EVIDENCE_2026-10-17.md).
- Focused CI success: STEP 6 [39077886855](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077886855); M0 [39077886864](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077886864); STEP 4 [39077886857](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077886857); STEP 5 [39077886871](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077886871).
- Limit: this does not authenticate `authoritative: true`, establish provenance/currentness, or prove protected-path closure. STEP 7 remains OPEN / STOP / UNKNOWN.

## M0.68 — Preflight the outer reconciliation call before destructuring

- State: implemented; focused CI pending at documentation time on source/test commit `2891397fe57f1fd894033b43017c506c9fd7c13a`.
- Defect: `reconcile({ reconciliationCase, evidence = [] } = {})` destructured the caller's input before the function could validate it. Getters on the outer input could execute before M0.67's nested-record checks; passing `null` threw rather than returning a fail-closed status.
- Correction: accept an opaque `input`, validate its full own-property graph before any field read, reject null/non-record inputs as `INVALID`, then destructure only the validated record.
- Regression: outer `evidence` and `reconciliationCase` getters remain uncalled; null input returns `INVALID`.
- Source + regression commit: `2891397fe57f1fd894033b43017c506c9fd7c13a`.
- This does not authenticate `authoritative: true`, establish provenance/currentness, or prove protected-path closure. STEP 7 remains OPEN / STOP / UNKNOWN.

## M0.67 — Reject unsafe reconciliation evidence before reading or cloning

- State: implemented and focused-CI verified on `37d0f12649a9ffe3c93344dc7d77d2156742bd79`.
- Defect: reconciliation read caller-owned fields and cloned evidence before validating original graph; getters could execute and symbol-keyed evidence could be omitted.
- Correction: preflight reconciliation case and evidence using descriptor-based recursive validation before field reads/cloning; reject accessors, symbol keys, and non-enumerable properties.
- Regression: evidence getter and case getter remain uncalled; symbol-keyed evidence returns UNRESOLVED.
- Evidence report: [M0.67 — Reject unsafe reconciliation evidence](BUILD/NCS_M0_67_REJECT_UNSAFE_RECONCILIATION_EVIDENCE_2026-10-17.md).
- Focused CI success: STEP 6 `39077316684`; STEP 4 `39077316662`; M0 `39077316636`; STEP 5 `39077316629`.
- This does not authenticate `authoritative: true` or establish evidence provenance/freshness. STEP 7 remains OPEN / STOP / UNKNOWN.

## M0.66 — Require canonical state record before protected transition

- State: implemented and focused-CI verified on `921f6dfaf269a80effbcdaaf12b64d64dc398355`.
- Defect: transition input did not require `state` itself to be a record; missing/null/array/primitive state could reach adapters.
- Correction: `executeProtectedTransition()` validates canonical state before invoking any port.
- Regression: undefined, null, array, and string states are rejected; zero port calls in every case.
- Evidence report: [M0.66 — Require canonical state record](BUILD/NCS_M0_66_REQUIRE_CANONICAL_STATE_RECORD_2026-10-17.md).
- Focused CI success: M0 `39077156247`; STEP 4 `39077156238`; STEP 5 `39077156250`; STEP 3A/3B/3C `39077156258`.
- This does not prove state authority/currentness or production protected-path closure. STEP 7 remains OPEN / STOP / UNKNOWN.

## M0.65 — Reject snapshot graphs that alias canonical state

- State: implemented and focused-CI verified on `fe110e94dafde031f832bd19efe203b930dee1e7`.
- Defect: a shallow-copy snapshot isolator could return a new root object while retaining references to nested canonical state; candidate execution could mutate canonical state before commit.
- Correction: the protected-transition boundary checks the isolated record and rejects any object identity shared anywhere in the input/isolated state graphs before candidate execution.
- Regression: shallow-copy isolator shares nested object; outcome is UNKNOWN; canonical state remains unchanged; executor and commit are not called.
- Evidence report: [M0.65 — Reject aliased snapshot state graphs](BUILD/NCS_M0_65_REJECT_ALIASED_SNAPSHOT_STATE_GRAPH_2026-10-17.md).
- Focused CI success: M0 `39076971359`; STEP 4 `39076971377`; STEP 5 `39076971375`; STEP 3A/3B/3C `39076971406`.
- This is a bounded non-authoritative Core fix. It does not establish legitimate authority, production protected-effect reachability, or bypass closure. STEP 7 remains OPEN / STOP / UNKNOWN.

## M0.64 — Detach and freeze outcome-classifier results

- State: implemented and focused-CI verified on `60337cdc7cfa0078932b0cce7450e10af1c82f75`.
- `classify()` now rebuilds the validated outcome through `createOutcome()`, so adapter-owned mutable results cannot escape by reference.
- Regression mutates the classifier-owned result after return and verifies the returned outcome and nested evidence remain unchanged and frozen.
- Evidence report: [M0.64 — Detach and freeze outcome-classifier results](BUILD/NCS_M0_64_DETACH_FREEZE_OUTCOME_CLASSIFIER_RESULTS_2026-10-17.md).
- Focused CI success: M0 `39076742989`; STEP 4 `39076742913`; STEP 5 `39076742921`; STEP 3A/3B/3C `39076742904`.
- This does not authenticate classifier/authority ports or prove protected runtime closure. STEP 7 remains OPEN / STOP / UNKNOWN.

## M0.63 — Preflight Core port options and validate commit result errorCode

- State: implemented and focused-CI verified on `8c8f64b5c2f459194856800e1593a52104a8d57c`.
- Corrected `createCorePorts()` to validate its original options record before destructuring, rejecting getters/accessors before they execute.
- Protected-transition boundary now requires `errorCode` to be present and either `null` or a nonblank string before interpreting any conditional-commit result. Malformed results become `RECONCILE_REQUIRED`.
- Regression tests: port-option getter must remain uncalled; conditional conflict without `errorCode` must reconcile.
- Evidence report: [M0.63 — Preflight Core port options and validate commit result errorCode](BUILD/NCS_M0_63_PREFLIGHT_CORE_PORT_OPTIONS_AND_COMMIT_ERRORCODE_2026-10-17.md).
- Focused CI success: M0 `39076550293`; STEP 4 `39076550200`; STEP 5 `39076550208`; STEP 3A/3B/3C `39076550220`.
- This is contract-shape hardening only. It does not establish legitimate authority, trusted port composition, or protected-effect closure. STEP 7 remains OPEN / STOP / UNKNOWN.

# NEXO NCS — STATUS

## Historical entry: M0.63 — Preflight Core port options and validate commit result errorCode

The protected transition now requires the outcome classifier to return a structurally valid record with the expected terminal `kind` and both `reasons` and `evidence` arrays. Regression tests cover missing evidence and non-array reasons.

- Report: [M0.62 — Require complete outcome-classifier results](BUILD/NCS_M0_62_REQUIRE_COMPLETE_OUTCOME_CLASSIFIER_RESULT_2026-10-17.md)
- Source commit: `ecadcd8dfe7afe6f6f9f72d331d622044dda2b64`
- Regression-test commit: `87d89694696d3b723053a9d038cb9df2741306e1`
- Report commit: `7c788a039ed5bc5831ecf2d40f8402961a37050c`
- M0 Core: [run 39076179928](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076179928) — success
- STEP 4: [run 39076179931](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076179931) — success
- STEP 5: [run 39076179919](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076179919) — success
- STEP 3A/3B/3C: [run 39076179968](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076179968) — success

## Activation gate — unchanged

**STEP 7 = OPEN / STOP / UNKNOWN. Protected effects remain STOP.** M0.62 is a bounded Core contract fix, not proof of constitutional authority, production runtime reachability, durable canonical commit, or bypass closure.

---

---

## CURRENT ENTRY POINT — M0.55 (2026-10-17)

**Continue from M0.55; do not repeat investigations M0.1–M0.55. Focused CI passed.**

- Latest report: BUILD/NCS_M0_55_SAFE_REVISION_FENCING_2026-10-17.md
- Full next-chat continuity / project goals / exact instructions: BUILD/NCS_M0_NEXT_CHAT_HANDOFF_LATEST_2026-10-17.md
- Branch: ncs-clean-architecture
- Source commits: 977a5ef64dfbf7999cdeefbf54282c137b83dea0; 7ab078d9bb8742386b74f1030d70b662188d10a4; 116ae15d0e9fc6eea1de1764c0b6efb8de855f21
- Final regression-test commit: f9bab5aac075f81bd28e04bf1a2692c9deb103d6
- Report commit: 1569215e18b5b3eae08a7ae4d05a8026006c254d

### M0.55 focused CI evidence — PASS

- M0 Core contracts: https://github.com/snowdenxrp/aldea-ia/actions/runs/39042995723 — success
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/39042998648 — success
- STEP 5 outcome classification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39042998646 — success
- STEP 3A/3B/3C verification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39042998600 — success

M0.55 rejects revisions that cannot safely support an exact increment, before authority/commit/persistence side effects. CI is focused; no full-repository test or runtime authority proof is claimed.

## Project goal

Build Nexo as a private personal AI with durable identity, memory, principles and continuity across models/providers, OSes, devices and environments under a user-controlled Constitution. Nexo ≠ model ≠ OS ≠ device ≠ Lúmina. Establish constitutional authority and safety before activation. The user is the owner; the daughter is a possible future successor, not a current authority. No device/biometric/file copy may silently become constitutional authority. Avoid GenesisRoot monolith; separate trust anchor, endorser, attester, verifier and relying party.

## Hard gate

**STEP 7 = OPEN / STOP / UNKNOWN. Protected effects remain STOP.** No demonstrated legitimate initial authority, complete authority binding, exhaustive protected-path reachability, or bypass closure. Do not commission the Constitution or activate protected effects. Continue bounded non-authoritative Core work only.

## Next action

Read the full handoff, verify latest repository state, then inspect a distinct Core boundary for a demonstrable contract defect. Add regression tests, run relevant CI and wait for completion, record exact evidence, and update both BUILD report and STATUS/handoff. Do not repeat closed research or use M0/APK work as a side quest. Missing proof = PENDING/UNKNOWN, never PASS.

---
## Current entry point

**Current non-authoritative Core increment: M0.51 — focused CI passed.**

- Latest report: [M0.51 — Reject array-shaped policy-context records](BUILD/NCS_M0_51_REJECT_ARRAY_POLICY_CONTEXT_RECORDS_2026-10-17.md)
- Latest handoff / next-chat instructions: [NCS M0 latest continuation handoff](BUILD/NCS_M0_NEXT_CHAT_HANDOFF_LATEST_2026-10-17.md)
- Branch: `ncs-clean-architecture`
- Source commit: `fbc7ede58e7ed397f39b66d2b94f506ebcfed801`
- Regression-test commit: `349dddb5143f71e3a550be92bd499e7297118c81`

### Focused CI evidence

- M0 Core: [run 38997227742](https://github.com/snowdenxrp/aldea-ia/actions/runs/38997227742) — success
- STEP 7 policy-context contract: [run 38997227754](https://github.com/snowdenxrp/aldea-ia/actions/runs/38997227754) — success
- STEP 4 semantic validation: [run 38997227792](https://github.com/snowdenxrp/aldea-ia/actions/runs/38997227792) — success
- STEP 5 outcome classification: [run 38997227880](https://github.com/snowdenxrp/aldea-ia/actions/runs/38997227880) — success
- STEP 3A/3B/3C: [run 38997227744](https://github.com/snowdenxrp/aldea-ia/actions/runs/38997227744) — success

## M0.51 result

Policy-context record fields `policyRef`, `validity`, and `resolved` now reject arrays, preventing named array properties from passing validation and then disappearing during structured cloning. Structural shape only; no policy-reference authenticity or authority proof.

## Activation gate — unchanged

**STEP 7 = OPEN / STOP / UNKNOWN. Protected effects remain STOP.**

No legitimate initial authority, exhaustive protected-path reachability, or bypass closure has been established. Do not commission the Constitution or activate protected effects. Continue bounded non-authoritative Core work only.

## Continuation rule

Continue from the latest handoff; do not repeat M0.1–M0.56 investigations or closed historical audits. Inspect a distinct Core boundary, fix only a concrete contract-grounded defect, add regression tests, run focused CI, and record raw evidence. A missing evidence link remains PENDING/UNKNOWN; never infer runtime proof from unit tests.

## Recent M0 reports

- [STEP 7 — First-scope ownership boundary reconciliation](BUILD/STEP_7_FIRST_SCOPE_OWNERSHIP_BOUNDARY_RECONCILIATION_2026-10-17.md)
- [M0.50 — Revalidate ObservationEnvelope at MissionCandidate boundary](BUILD/NCS_M0_50_REVALIDATE_OBSERVATION_AT_MISSION_CANDIDATE_BOUNDARY_2026-10-17.md)
- [M0.49 — Reject malformed observation collections](BUILD/NCS_M0_49_REJECT_MALFORMED_OBSERVATION_COLLECTIONS_2026-10-17.md)
- [M0.48 — Detach and freeze reconciliation evidence](BUILD/NCS_M0_48_DETACH_AND_FREEZE_RECONCILIATION_EVIDENCE_2026-10-17.md)
- [M0.47 — Reject indeterminate reconciliation outcomes](BUILD/NCS_M0_47_REJECT_INDETERMINATE_RECONCILIATION_OUTCOMES_2026-10-17.md)
- [M0.46 — Reject mutable exotic policy-context data](BUILD/NCS_M0_46_REJECT_MUTABLE_EXOTIC_POLICY_CONTEXT_DATA_2026-10-17.md)
- [M0.45 — Reject blank Observation source/code](BUILD/NCS_M0_45_REJECT_BLANK_OBSERVATION_SOURCE_CODE_2026-10-17.md)

Older evidence and handoffs remain in `NEXO_NCS/BUILD/`, `RESEARCH/`, `DECISIONS/`, and `PROOF/`. STATUS is an entry point, not a duplicate of the audit archive.

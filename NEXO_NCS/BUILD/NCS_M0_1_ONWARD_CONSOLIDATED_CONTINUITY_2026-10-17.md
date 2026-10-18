# NCS / NEXO — M0.1 onward: consolidated continuity dossier
Date: 2026-10-17
Branch: `ncs-clean-architecture`
Repository: https://github.com/snowdenxrp/aldea-ia

## 1. Purpose: what M0 really is

M0 is the minimum functional Nexo Core: the smallest coherent foundation that can observe inputs, distinguish evidence from interpretation and uncertainty, reason and plan, preserve mission/context across restart, track execution outcomes, verify results, learn from outcomes, and revise plans without pretending that a plan is an action or that an assertion is proof.

M0 is **not**:
- a never-ending list of defensive patches;
- a test-only abstraction disconnected from Nexo's actual functional path;
- a claim that Nexo is fully built, autonomous, authorized, or safe merely because unit/CI tests pass;
- the same thing as STEP 7 / initial-owner authority;
- permission to activate protected effects.

The success criterion is functional and evidentiary: a coherent, testable non-authoritative Core loop with explicit limits, uncertainty and durable continuity. Every change must either add a meaningful capability or fix a demonstrated defect that blocks such capability. Do not generate increments for their own sake.

## 2. Product direction and invariants

- Build Nexo as a persistent personal intelligence, independent of any single model, device, OS or provider.
- Nexo ≠ model; Nexo ≠ OS; Nexo ≠ device; Nexo ≠ Lúmina. Keep Lúmina architecturally separate.
- Separate **build Nexo**, **authorize Nexo**, and **activate protected effects**. Lack of resolved authority must block protected effects, not freeze all safe Core development.
- User is the owner. A future daughter succession concept is long-term, not current authority. Phone/biometrics/device presence can be evidence/channel, never authority by itself.
- Do not invent claim IDs, queues, retries, tombstones, transaction wrappers or compatibility layers to bridge a missing contract. If a root architectural flaw appears, stop at the seam and specify the missing decision rather than hiding it with a patch.
- Keep honest states: missing evidence/links => `PENDING` / `UNKNOWN` / fail-closed as the contract requires, never fabricated PASS.
- Maintain source → test → focused CI → report → STATUS/handoff traceability. Distinguish source inspection from dynamic reachability proof, tests from production proof, and self-reported evidence from authenticated evidence.

## 3. Current repo navigation and operating procedure

Preferred repo structure: `MASTER/ CORE/ BUILD/ RESEARCH/ DECISIONS/ PROOF/ STATUS`. `STATUS.md` is the entry door: STATUS → MASTER/CORE → BUILD → work. Keep the current latest handoff in sync. Avoid re-running closed historical AB/P/TLC audits; consult the existing reports first.

At the start of the next chat:
1. Open this dossier, `NEXO_NCS/STATUS.md`, and `NEXO_NCS/BUILD/NCS_M0_NEXT_CHAT_HANDOFF_LATEST_2026-10-17.md`.
2. Verify current branch head and inspect latest commits/CI before changing anything.
3. Review only the relevant prior reports and tests for a newly identified functional seam; do not repeat M0.1/M0.2 as new research.
4. Pick one concrete functional gap, state its impact on the M0 loop, change source + regression test, run focused workflow(s), inspect actual outcomes, and update report + STATUS + handoff.
5. Do not state CI is successful until the actual run has completed with success.
6. Do not merge into protected runtime or authorize protected effects while authority / trust boundary remains unresolved.

## 4. M0.1–M0.2 observation / candidate line (historical work; do not restart)

### M0.1 observation envelope
- Relevant source/test: `src/nexo/core/observation.mjs`, `tests/nexo/observation.test.mjs`.
- Contract intent: reject blank source/code, detach/freeze accepted observation data, default admission to `UNKNOWN`.
- Earlier isolated Node test was reported; CI evidence was separately tracked. Read the existing reports before asserting what CI covered.
- This creates an observation contract; it does not prove that the production runtime uses it.

### M0.2 caller trace and identity gap
- Existing report: `NEXO_NCS/BUILD/NCS_M0_2_BOUNDED_OBSERVATION_CANDIDATE_CALLER_TRACE_2026-10-16.md`.
- Qualification report: `NEXO_NCS/PROOF/NCS_M0_2_CI_EVIDENCE_QUALIFICATION_2026-10-16.md`.
- Related contract docs: `STEP_7_OBSERVATION_TO_MISSION_CANDIDATE_HANDOFF_2026-10-08.md`, `STEP_7_MINIMUM_OBSERVATION_ENVELOPE_CONTRACT_2026-10-08.md), P112 audit.
- The key gap is not “write an adapter quickly”: no demonstrated legitimate identity mapping from `MissionCandidate` to `ClaimEnvelope`. Legacy step IDs, mission IDs and action+target dedupe do not prove claim identity. `NEGATIVE_RESOURCE` equivalence stays `UNKNOWN` without resource incarnation/version, freshness and causal dependency evidence.
- Bounded current-source inspection found `scripts/assistants.mjs` calls `buildNexoMission()`; `src/nexo/orchestrator.js` does not directly consume `createObservationEnvelope` / `createMissionCandidate`; `src/nexo/runtime.js` has no direct observation API / protected-transition reference in that review; observation-equivalence evaluator callsites found were tests. This was not an exhaustive dynamic reachability proof.
- Decision already documented: do not wire these contracts into legacy orchestrator/runtime as a quick patch. Do not fabricate identity or route unproven claims into effects. Reopen only if new evidence or an explicit identity contract decision changes the seam.
- Preserve the original instruction: no legacy `buildNexoMission()` change as a shortcut, no invented IDs/queues/retries/tombstones/compatibility layer.

## 5. Functional Core continuity and mission planning

### Mission persistence / restart reconstruction
- Source: `src/assistants/memory.js`; tests: `tests/nexo/restart-reconstruction.test.mjs`.
- Commit: [`f7828d1e0f11f81e03106af9a50f914d99c87b1c`](https://github.com/snowdenxrp/aldea-ia/commit/f7828d1e0f11f81e03106af9a50f914d99c87b1c).
- Mission plan now preserves optional step fields `priority`, `reason`, `source`, `reversible`, `requiresEvidence`, `requiresVerification`, detached `context`; plan-level `uncertainty`, `evidenceCount`, `observedAgentCount`; reconstruction regression tests round-trip and detachment.
- Focused CI: [`39079779219`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39079779219), STEP 4 [`39079693260`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39079693260). Historical CI run logs confirmed the named restart test and protected-transition test ran in the focused workflow.
- Limit: this preserves plan context; it does not prove durable storage against all corruption, actual action execution, or authority.

### Bounded mission admission
- Source/test commit: [`10067f1eaa626500c803bb6d3504fc5816eb7239`](https://github.com/snowdenxrp/aldea-ia/commit/10067f1eaa626500c803bb6d3504fc5816eb7239).
- Existing planner cap remains eight steps; mission reports `candidateStepCount`, `admittedStepCount`, `omittedStepCount`, `truncated`. If an admitted step depends on a candidate outside the admitted set, it is blocked as `DEPENDENCY_NOT_ADMITTED`; omitted candidates are not marked failed/resolved and no overflow queue was added. Admission summary survives restart.
- Report: `NEXO_NCS/BUILD/NCS_M0_MISSION_ADMISSION_BOUNDARY_2026-10-17.md`.
- CI success: mission admission/continuity [`39080272772`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39080272772), STEP 4 [`39080272763`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39080272763), STEP 5 [`39080272752`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39080272752), M0 Core [`39080272843`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39080272843).

### Missing-evidence step state consistency — latest code increment
- Source commit: [`ec20889da48e57c895b8273d57d2c68ec5027471`](https://github.com/snowdenxrp/aldea-ia/commit/ec20889da48e57c895b8273d57d2c68ec5027471).
- Regression commit: [`f27147f0a273d28ad8168a9f29e9c0ab06e24713`](https://github.com/snowdenxrp/aldea-ia/commit/f27147f0a273d28ad8168a9f29e9c0ab06e24713).
- Before: `advanceNexoMission()` rejected completion lacking acceptable evidence at mission level but left target step `executing`. Now mission and step become `blocked`, both expose `MISSING_VERIFIED_EVIDENCE`, objective becomes `replan_from_constraints`, and `planNexoExecution()` returns no actions.
- Report: `NEXO_NCS/BUILD/NCS_M0_MISSING_EVIDENCE_STEP_STATE_2026-10-17.md`.
- CI success for exact tested head: mission admission/continuity [`39081098250`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39081098250), M0 Core [`39081098279`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39081098279), STEP 4 [`39081098274`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39081098274), STEP 5 [`39081098277`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39081098277).
- Important caveat: `evidenceAcceptable()` currently treats caller-supplied `verified: true` plus nonblank `kind` as acceptable. That is a structural assertion, not trusted provenance or proof. Do not overstate it.

## 6. M0 core hardening line already completed (do not repeat blindly)

The branch already contains the following bounded increments with tests/reports/CI recorded in STATUS and earlier handoff:
- M0.15: semantic requirement evidence identifies its source. Report `NCS_M0_15_SEMANTIC_REQUIREMENT_SOURCE_LABEL_2026-10-16.md`; CI references `38979977867` / `38979977868`.
- M0.63: `createCorePorts()` preflight.
- M0.64: detach/canonicalize classifier result.
- M0.65: reject aliased snapshots.
- M0.66: protected-transition canonical state preflight.
- M0.67: `assertPlainData` object graph checks.
- M0.68: preflight before destructuring/getter access.
- M0.69: malformed non-array evidence yields `UNRESOLVED`, null outcome and frozen empty evidence.
- M0.70: replace caller-controlled `evidence.find(...)` with numeric iteration and own-property descriptor access; missing indexes/accessor descriptors fail closed as `UNRESOLVED`; hostile own `.find` regression ensures it is not invoked. Report `NCS_M0_70_AVOID_CALLER_CONTROLLED_ARRAY_METHODS_2026-10-17.md`; CI success: STEP 4 `39078527864`, STEP 5 `39078527811`, STEP 6 `39078527808`, M0 Core `39078527855`.
- M0.50 / M0.51 and earlier increments are documented in `STATUS.md` and the handoff; read the records there rather than reconstructing them from memory or re-running the same audit. The handoff has accumulated chronology; prefer current STATUS/top-of-handoff and actual Git history when chronology conflicts.

## 7. Structural trust boundary: unresolved, no superficial fix

- After M0.70, source review identified that reflection in `src/nexo/core/contracts.mjs` (`Object.getPrototypeOf`, `Reflect.ownKeys`, `Object.getOwnPropertyDescriptor`) and in `src/nexo/core/reconciliation.mjs` can trigger caller-controlled JavaScript Proxy traps.
- This is source analysis, **not** a reproduced deployed exploit. Do not misreport it as one.
- Do not add a “detect Proxy” helper using the same reflective operations. The root question is the trust boundary for hostile values:
  1. canonical bounded serialized wire input parsed inside trusted boundary, with encoding/size/duplicate-key/number/error semantics specified; or
  2. explicitly trusted in-process caller boundary acknowledging no hostile Proxy isolation; or
  3. another enforceable, owner-approved design.
- This architectural decision is still pending. Do not build a patch that merely hides the question.

## 8. STEP 7 / authority / effects — current STOP

State remains `OPEN / STOP / UNKNOWN`.
- User is owner; initial legitimate authority has not been established by evidence.
- Device, biometric, app install, file copy, model/provider, OS, and local presence are not authority on their own.
- `src/nexo/core/ownership.mjs` has `effectBoundary.prepare` defaulting to `NOT_IMPLEMENTED`; protected transition has not demonstrated calling that boundary and the previous code path could reach conditional commit after semantic validation.
- Tests injecting `AUTHORIZED` do not establish Genesis/initial-owner authority.
- Reconciliation's `authoritative: true` flag is not itself authenticated authority.
- No proven production startup → constitutional gate → protected effects path; no demonstrated exhaustive bypass closure; no commissioning, authority freeze/signature, keys, or protected effects.
- Build isolated, non-authoritative functionality in parallel. Never infer permission from a passing M0 test. Keep STEP 7 and protected effects stopped until a legitimate evidence-backed design is proven.

## 9. Explicit next-work instructions

Do **not** restart the observation M0.1/M0.2 audit or reconnect its contract to the legacy runtime without resolving claim identity. Do not repeat M0.63–M0.70 hardening without new evidence.

Next:
1. Inspect the current mission lifecycle from plan → begin → outcome → verification → reconstruction, plus tests, to identify a **functional** gap in learning/replanning/continuity that matters to Nexo's useful Core.
2. Prefer a coherent user-visible Core capability over another micro-hardening patch. Possible direction to assess, not assume: a tested loop that takes verified outcomes and updates a successor plan while preserving parent mission, reason for replanning, uncertainty and prior result; do not add retries/queues/IDs without a contract.
3. Before coding, state the exact observed gap and why it blocks M0's functional loop; check prior reports/tests so this is not a duplicate.
4. Implement the smallest coherent behavior + regression test; run the narrow workflow and relevant STEP 4/5/M0 Core workflows; inspect completed results.
5. Update a dated report, prepend the result and links in `NEXO_NCS/STATUS.md`, and update this latest handoff. Verify branch head and file contents after writes.
6. Keep a clear list of what is built, what is merely designed, what is test-proven, and what is unknown.
7. Do not declare M0 complete prematurely. The milestone requires a coherent, tested functional Core loop—not just isolated contracts—and honest proof boundaries.

## 10. Quick restart instruction

In the next chat, user will likely say `NCS` or `Continúa`. Treat it as a request to resume from the latest verified branch head, not to begin a new investigation. Start from this dossier + STATUS + latest handoff; use current GitHub state, preserve prior work, and continue M0's real functional objective. Answer in Spanish, direct and precise; don't ask the user to restate project context already documented.

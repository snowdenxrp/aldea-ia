# NCS — Milestone 0: Non-authoritative Core scope contract

Date: 2026-10-16  
Branch: `ncs-clean-architecture`  
Status: PROPOSED WORKING CONTRACT / NO IMPLEMENTATION / OWNER REVIEW NOT IMPLIED

## 1. Decision this contract makes

Separate useful, testable Nexo-core development from constitutional commissioning and protected real-world effects.

Milestone 0 (M0) may build and test bounded core behavior without claiming that Genesis authority, the Constitution, owner approval, verifier provenance, or protected-effect enforcement has been established.

M0 is not a downgrade of the selected Direction B / L2 security objective. It is a development boundary that prevents unfinished authority work from blocking every safe core task while also preventing core progress from being misrepresented as security completion.

This file records a proposed engineering scope, not an owner constitutional decision, not a Constitution freeze, and not permission to activate protected effects.

## 2. M0 objective

Deliver one small, reproducible, local test slice that demonstrates:
- a Nexo-core request can be represented and processed within a bounded interface;
- outputs and state changes are observable in tests;
- invalid, missing, or unknown inputs produce explicit non-success outcomes;
- no test result, core output, memory record, repository revision, or caller-supplied `PASS`/`AUTHORIZED` value creates constitutional authority;
- M0 does not call external services, control devices, execute real-world actions, commission the Constitution, or authorize protected effects.

The exact existing module and test entry point must be selected by source inspection before implementation. This contract does not preselect `executeAction()`, the Lúmina adapter, `executeNexoStep()`, snapshot persistence, or the protected-transition module as the target.

## 3. In-scope for M0

1. Inspect existing Core modules and tests to find the smallest coherent, already-supported behavior slice.
2. Define its input, output, state ownership, failure semantics, and observable evidence.
3. Add or adjust tests only after selecting that slice and checking existing coverage.
4. Test success, malformed input, missing required data, explicit rejection, and unknown/ambiguous outcome where applicable.
5. Document the exact command, source revision, raw test output, interpretation, and limitations.
6. Preserve the separation between ordinary simulation behavior and Nexo constitutional authority.

## 4. Explicitly out of scope

M0 must not:
- freeze, hash as canonical, sign, or commission the Constitution;
- record or imply owner review/ratification;
- create a Genesis root, key, nonce, verifier, authority object, generic store, service, queue, retry, tombstone, transaction wrapper, or new identifier scheme merely to make the milestone pass;
- claim independent verification, trusted display, Android integrity, freshness, revocation, succession, recovery, or bypass closure;
- permit protected real-world effects;
- patch the runtime-to-effect path before the owner-approved effect scope, final sink, and enforcement owner are defined;
- treat simulation-state mutation or outcome journaling as proof of constitutional authorization;
- change device setup, create/install APKs, generate keys, or perform an activation ceremony.

If a proposed M0 task crosses one of these boundaries, stop and document the dependency instead of silently widening scope.

## 5. Required engineering properties

- **Bounded claim:** every test and status statement names exactly what it establishes.
- **Fail closed within the selected slice:** invalid or unknown inputs cannot be reported as successful completion.
- **No authority by assertion:** caller-supplied `PASS`, `AUTHORIZED`, or equivalent status is not treated as provenance or constitutional legitimacy.
- **No hidden side effects:** identify state mutation and external calls before selecting the slice; tests must make relevant effects observable.
- **No false independence:** a second function, process, app, device, or repository is not called an independent verifier without a threat-relative justification.
- **No inferred coverage:** tests of one entry path do not prove all entry paths or deployed artifacts are covered.
- **Reversible scope:** changes stay small enough to inspect and revert; structural changes require an explicit root-cause rationale.

## 6. Acceptance evidence

M0 is accepted only when its evidence packet contains:
1. exact branch/commit and source files inspected;
2. the selected behavior and why it is the smallest coherent slice;
3. exact test command(s) and raw output;
4. negative tests for the applicable failure/unknown cases;
5. an explicit account of state mutation and external-effect boundaries;
6. a statement of what the evidence does not prove;
7. a check that the work did not alter Constitution status, Genesis trust, owner authority, or protected-effect admission.

A design document alone is not implementation evidence. A passing unit test alone is not proof of runtime reachability, deployment behavior, or full bypass closure.

## 7. Relationship to STEP 7 and existing work

STEP 7 remains **OPEN / STOP / UNKNOWN** for constitutional commissioning and protected effects.

Reuse, rather than duplicate:
- `STEP_7_SCOPE_A_REVIEW_EVIDENCE_MINIMUM_ACCEPTANCE_CONTRACT_2026-10-15.md` for the non-authoritative review-record claim and its trust requirements;
- `STEP_7_RUNTIME_AUTHORITY_TO_EFFECT_PATH_SOURCE_TRACE_2026-10-15.md` for the bounded runtime/effect wiring findings;
- `STEP_7_CONSTITUTIONAL_BOOT_COMPOSITION_SOURCE_REVIEW_2026-10-15.md` for the Genesis-versus-restart distinction;
- `STEP_7_EXTERNAL_TRUSTED_REVIEW_CANDIDATE_SCREEN_2026-10-16.md` for the external display/signing candidate disposition.

M0 does not replace or close any of these obligations.

## 8. Current selected slice: M0.1 observation/candidate contract

Selected source: `src/nexo/core/observation.mjs`. Dedicated test: `tests/nexo/observation.test.mjs`.

The slice validates non-empty observation `source` and `code`, limits admission to `ADMITTED`, `NOT_ADMITTED`, or `UNKNOWN` (default `UNKNOWN`), and detaches/deep-freezes the observation snapshot inside a candidate. It is a data contract only: it does not authenticate source, prove freshness or truth, authorize execution, or establish constitutional authority.

Implementation commits:
- source: `c69dded51be1a8cf934393de96a3707fc0283670`;
- tests: `b53b8d91b3c847f5d7c46f48dd19d8db95b70ccd`.

### CI evidence

GitHub Actions run: https://github.com/snowdenxrp/aldea-ia/actions/runs/38975253568  
Run ID: `38975253568`  
Tested commit: `b705a71ce0527c689f169351468c364828a7e9f1`  
Workflow: `Nexo — STEP 7 observation contract`  
Job: `observation-contract` — `success`  
Exact step: `node tests/nexo/observation.test.mjs` — `success`.

This replaces the earlier qualified temporary-directory result as evidence for this exact test command on the tested repository commit. It does not prove the full `npm test` chain, planner/runtime reachability, authentic observations, constitutional authority, protected-sink enforcement, or bypass closure.

## 9. Bounded caller trace and non-regression constraints

The targeted current-branch trace is recorded in `NEXO_NCS/BUILD/NCS_M0_2_BOUNDED_OBSERVATION_CANDIDATE_CALLER_TRACE_2026-10-16.md` (updated commit `9b56e4e772cadbdea329111428ebbd96ecdba7c5`).

Findings that constrain the next step:
- `buildNexoMission()` in `src/nexo/orchestrator.js` consumes legacy report findings directly; the inspected function does not call the observation/candidate constructors.
- Existing `tests/nexo/orchestrator.test.mjs` protects legacy mission behavior including severity ordering, dependencies, dependency blocking, verified-evidence requirements, replanning, bounded Lúmina action allowlisting, and rejection of an unsupported action.
- `executeNexoStep()` does not invoke `executeProtectedTransition()` or a constitutional gate before the adapter in the inspected path.
- `executeProtectedTransition()` still does not call `effectBoundary.prepare` in the inspected composition.
- The saved P112 checkpoint explicitly says not to begin by patching the old orchestrator into becoming the new Core.

Therefore **do not wire the observation/candidate contract into the legacy orchestrator as a quick integration**. Before any source change, enumerate current-branch callers/imports relevant to this contract and review existing planner tests. Any proposed seam must preserve the legacy simulation behavior and remain non-authoritative. No new adapter, ID scheme, queue, retry, persistence, or authority semantics without concrete evidence of necessity.

## 10. Next action

Perform a bounded current-branch caller/import and test inventory, centered on the observation/candidate contract and its intended producer boundary. Identify existing callers, tests, legacy behavior that must remain stable, and whether an integration seam is actually needed. Do not modify runtime/effect wiring. After that inventory, propose the smallest testable change and its explicit non-claims before implementing it.

## 11. Current result

- M0.1 observation/candidate contract: implemented.
- Dedicated observation contract CI step: **PASS** on commit `b705a71ce0527c689f169351468c364828a7e9f1`.
- Legacy planner behavior: existing focused test identified; no changes made to it in this pass.
- Repository-wide caller/import inventory: **PENDING**.
- Full `npm test` chain: **NOT VERIFIED**.
- Constitution: DRAFT / NOT FROZEN / NOT COMMISSIONED.
- Genesis/owner authority and independent verifier: NOT ESTABLISHED.
- Protected effects: STOP.
- STEP 7: **OPEN / STOP / UNKNOWN**. Direction B / L2 remains the objective.

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

## 8. Next action

Perform one source-and-test inventory limited to identifying the smallest safe M0 behavior slice. Report candidate module(s), existing tests, reachable callers, state mutation, external dependencies, and the reason for selecting or rejecting each candidate. Do not modify source in that inventory. Once a slice is selected and its boundaries are understood, implement only that slice and its acceptance tests.

## 9. Current result

- M0 scope contract: documented as a proposed working boundary.
- M0 source slice: NOT SELECTED.
- M0 implementation/tests: NOT STARTED by this contract.
- Constitution: DRAFT / NOT FROZEN / NOT COMMISSIONED.
- Genesis/owner authority and independent verifier: NOT ESTABLISHED.
- Protected effects: STOP.

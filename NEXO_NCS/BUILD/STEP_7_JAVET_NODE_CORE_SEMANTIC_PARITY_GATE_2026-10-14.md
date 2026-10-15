# STEP 7 — Javet/Node Core semantic parity gate

Date: 2026-10-14  
Branch: `ncs-clean-architecture`  
Status: SOURCE-BASED TEST PLAN / NOT EXECUTED / NO RUNTIME SELECTED

## 1. Purpose

Define the smallest falsifiable experiment for determining whether the existing Nexo Core ESM modules can execute under a pinned Javet Android Node.js runtime without changing their semantics. This is a runtime-compatibility question only. It does not validate the runtime as a security boundary, establish Genesis authority, select a storage owner, or authorize Scope A implementation.

## 2. Existing source baseline inspected

Pinned source:
- `package.json`, blob `a9bc2306543d34808f3b5f6ac1ec2d588f77ca14`: project uses Node.js ESM; `npm test` is a large chained suite ending in `tests/nexo/protected-transition.test.mjs`.
- `src/nexo/core/contracts.mjs`, blob `294eb400e9685788f7dd084a28a838b69d0323c7`: `structuredClone`, `WeakSet`, `Object.values`, `Object.freeze`, async-compatible immutable contract helpers.
- `src/nexo/core/ownership.mjs`, blob `c7f9e2671e5735bd6cf85c86bf283bec58aeea7f`: capability-separated injected ports; missing ports throw `NOT_IMPLEMENTED`.
- `src/nexo/core/protected-transition.mjs`, blob `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`: asynchronous port orchestration, early injected authority result, semantic validation and conditional commit.
- `src/nexo/core/policy-context-resolver.mjs`, blob `024b385d928b6b95edee1a54de867f7193917c91`: status aggregation and detached immutable output.
- `src/nexo/adapters/conditional-commit-persist-state.mjs`, blob `9a707677c99d226f87f9b8b0d9e7673e7a1a100e`: maps persistence outcomes into COMMITTED/CONDITIONAL_CONFLICT/UNKNOWN.

Existing GitHub Actions definitions inspected:
- `.github/workflows/nexo-deterministic-tests.yml`: Node 22 on Ubuntu; `npm install`; `npm test`; triggers on push to `main` and manual dispatch.
- `.github/workflows/nexo-step-7-negative-resource-equivalence.yml`: manual dispatch, Node 22, runs `tests/nexo/step-7-negative-resource-equivalence.test.mjs`.
- `.github/workflows/nexo-step-7-observation-contract.yml`: manual dispatch, Node 22, runs `tests/nexo/observation.test.mjs`.

These workflow definitions are not run evidence for the current branch/commit. No workflow run was triggered or observed in this task.

## 3. Minimum parity matrix

Every test must run first on pinned Node 22 baseline and then on the exact pinned Javet Android Node-mode artifact/runtime. Compare observable behavior, not just process exit code.

| ID | Property | Minimum check | Failure classification |
|---|---|---|---|
| JP-01 | ESM graph | Load the exact production Core modules and their relative imports without source rewriting. | FAIL/UNKNOWN; no host selection. |
| JP-02 | Structured clone | Test nested objects, arrays, undefined, null, cycles where relevant, unsupported values, and detachment/no-alias behavior against Node baseline. | FAIL if semantics differ; no shim accepted without a separately reviewed equivalence proof. |
| JP-03 | Immutability | Compare recursive freeze behavior, repeated references/cycles, and observable mutation failures/behavior. | FAIL/UNKNOWN; do not adapt Core semantics to force green. |
| JP-04 | Async ordering | Verify Promise resolution/rejection ordering for authority, snapshot, candidate, validator and commit ports; compare event traces with Node. | Any ordering difference is FAIL until explained and shown semantically equivalent. |
| JP-05 | Error taxonomy | Verify thrown errors, rejected promises, invalid port results and commit UNKNOWN map to the same terminal outcomes. | FAIL if an error becomes success-shaped or is classified differently. |
| JP-06 | Negative transition paths | Run existing protected-transition tests unchanged, including AUTHORITY.STOP/UNKNOWN, validation FAIL/UNKNOWN, conditional conflict and commit UNKNOWN. | Any test requiring source rewrite or changed expected outcome is FAIL/STOP, not compatibility. |
| JP-07 | Policy context | Run existing resolver tests and compare status, reasons, evidence and immutability for VALID/FAIL/UNKNOWN inputs. | FAIL if unknown/conflict is upgraded or result fields differ materially. |
| JP-08 | Host capability surface | Verify the packaged Core receives no broad Java/Kotlin bridge, filesystem write, network, process, worker, WASI or FFI capability unless explicitly reviewed. | If a permission flag is the only defense against malicious same-process code, security gate remains STOP. |
| JP-09 | Artifact provenance | Record exact source commit, Javet artifact coordinates/version, hashes, Android ABI, build toolchain and raw logs. | Missing pin or reproducibility data = UNKNOWN. |
| JP-10 | Target device | After CI compatibility only, verify arm64 loading, startup, memory, lifecycle, native library/page-size compatibility and restart behavior on a named Android device. | NOT RUN until a justified host and artifact exist. |

## 4. Required execution order

1. Pin a source commit and Node 22 environment; run the focused baseline commands:
   - `node tests/nexo/protected-transition.test.mjs`
   - the existing policy-context resolver test file (identify its exact path from repository contents before invocation)
   - `npm test` as the broader regression baseline when the focused run is understood.
2. Preserve exit codes, stdout/stderr, tool versions and source hashes. Do not infer results from workflow YAML.
3. Build a disposable, CI-only Javet Android Node-mode harness using a pinned documented artifact; do not add the runtime to M1 or ship an APK in this phase.
4. Load the exact existing ESM files unchanged and execute the mapped parity suite. If the runtime cannot load the current module graph, record that failure instead of porting or shimming code.
5. Compare structured traces from both runtimes. Explain every difference; unexplained differences = UNKNOWN/STOP.
6. Only if semantics pass, submit a separate security-host proposal. Compatibility PASS cannot satisfy hostile-Core/compromised-OS isolation, trusted build provenance, canonical state ownership, currentness, final sink or bypass closure.

## 5. Security constraint — no permission-model overclaim

The official Node.js Permission Model documentation explicitly says it is intended to limit resources for trusted code and does not provide security guarantees against malicious code; malicious code may bypass it. See https://nodejs.org/api/permissions.html.

Therefore:
- A Javet Node-mode parity PASS is not a sandbox PASS.
- A Javet Permission Model check is not proof against a malicious/substituted Core.
- No secret, authority key, or protected commit capability may be exposed to the JavaScript runtime merely because it is packaged in the same app.
- If the threat model requires isolation from malicious Core or compromised OS and there is no separate demonstrated boundary, retain STOP or narrow the threat model explicitly. Do not label a same-process design independent.

## 6. Current result

- Source-level compatibility target identified; exact runtime artifact not pinned for an experiment in this task.
- Existing workflow YAML was inspected; no workflow run was triggered or treated as evidence.
- JP-01 through JP-10: NOT RUN.
- No code/tests/workflows changed. No dependency, APK, device, key, Constitution, storage owner, deployment or runtime authority changed.

**Disposition: Javet Node mode remains a semantics-experiment candidate only. Host remains UNSELECTED / UNKNOWN. STEP 7 remains OPEN / STOP / UNKNOWN.**

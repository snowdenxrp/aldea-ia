# STEP 7 — CI result scope audit after baseline runs — 2026-10-14

Branch: `ncs-clean-architecture`
Current documentation head before this record: `e4ab357bc338aeb6d9b64f8a20abe52a6a5fef97`
Status: THREE CI RUNS SUCCESSFUL; SECURITY/CONSTITUTIONAL CLAIMS REMAIN OPEN

## Verified executions

All three GitHub Actions runs completed with `success` against source commit `d147c60192e41fcef009b114c3e3ea01c5efe4f1`:

- Deterministic persistence suite: run [38688762656](https://github.com/snowdenxrp/aldea-ia/actions/runs/38688762656). The `Install` and `Run tests` steps succeeded; `npm test` runs the chained test script in `package.json`, including `tests/nexo/protected-transition.test.mjs`.
- Negative-resource equivalence: run [38688789343](https://github.com/snowdenxrp/aldea-ia/actions/runs/38688789343), executing `tests/nexo/step-7-negative-resource-equivalence.test.mjs`.
- Observation contract: run [38688813707](https://github.com/snowdenxrp/aldea-ia/actions/runs/38688813707), executing `tests/nexo/observation.test.mjs`.

All three runs refer to the same source SHA. The branch later advanced to documentation-only commit `e4ab357bc338aeb6d9b64f8a20abe52a6a5fef97` when this evidence was recorded. No claim is made that these runs tested that later docs commit; no source/test/workflow changes are identified in the recorded documentation update.

## What the inspected tests actually establish

- `observation.test.mjs` checks envelope/candidate field behavior, nested immutability for the tested object, required-field rejection, invalid admission rejection and default UNKNOWN admission.
- `step-7-negative-resource-equivalence.test.mjs` checks that different amounts/resources/sources are non-equivalent and that missing claim-critical dimensions return UNKNOWN.
- `protected-transition.test.mjs`, included in `npm test`, exercises an injected-port transition skeleton: detached snapshot behavior in the fixture, no execution/commit when the injected authority gate returns UNKNOWN or is missing, no commit on semantic FAIL, conflict classification, UNKNOWN on uncertain commit, and rejection of a deliberately corrupted outcome classifier/claim identity. Its fixtures inject an authority gate returning AUTHORIZED; this does not prove legitimate Genesis/Constitution authority or production wiring.

These are useful test results for the exercised code and fixtures. They are not evidence that the tested contracts are connected to a legitimate constitutional state owner or to every real protected sink in a deployed runtime.

## Explicit coverage limits

The three successful workflows do **not** execute the 15 Scope A adversarial acceptance cases as specified in `STEP_7_SCOPE_A_NEGATIVE_ACCEPTANCE_TESTS_AND_PROOF_GATES_2026-10-14.md`. In particular, they do not establish end-to-end evidence for exact candidate presentation binding, hostile/substituted Core or OS, backup/rollback/reinstall, real storage fault injection, concurrent Scope A writers, all exported mutation paths, or complete reference-to-effect noninterference.

No Android/Javet target was built or tested. No production protected activation path, canonical current-Constitution owner, final linearization boundary, independent verifier, or bypass-closed sink was demonstrated by these CI runs.

## Decision and next action

1. Preserve the run IDs and exact tested SHA as successful baseline CI evidence.
2. Do not run or label the 15 Scope A cases as PASS; they remain specification-only / NOT RUN because there is no selected host and implementation.
3. Do not make source changes to “use” the green result. The next architecture decision remains whether a concrete, inspectable trust boundary and actual protected sink can be established without relying on the candidate, app/Core or compromised host to authenticate itself.
4. If the required boundary cannot be evidenced, retain STOP and redesign the root architecture rather than add a superficial gate.

No source code, tests, workflows, dependencies, APK, device, key, Constitution or runtime authority was changed by this audit. No additional tests were run.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**

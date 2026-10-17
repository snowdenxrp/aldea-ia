# NEXO NCS — M0.55: Reject unsafe revision fencing values

Date: 2026-10-17
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED / FOCUSED CI PASS

## Defect demonstrated

The candidate and protected-transition boundaries used `Number.isInteger(expectedRevision)`. JavaScript can report `true` for integers outside the safe-integer range. In particular, when the expected revision reaches `Number.MAX_SAFE_INTEGER`, computing `expectedRevision + 1` no longer yields a safely representable next revision. That breaks the exact monotonic progression required by a revision-based conditional-commit fence.

This is a separate issue from the older fence-exhaustion/epoch research: this increment does not invent a rollover mechanism. It rejects a revision before a commit when exact next-revision arithmetic cannot be guaranteed. A future durable fence/epoch rollover remains a separate architectural decision, not silently implemented here.

## Correction

- `src/nexo/core/contracts.mjs`: `createCandidate()` now requires a non-negative safe integer strictly below `Number.MAX_SAFE_INTEGER`.
- `src/nexo/core/protected-transition.mjs`: the requested revision and candidate-carried revision are checked against the same boundary before semantic validation or commit.
- `src/nexo/adapters/conditional-commit-persist-state.mjs`: the persistence adapter rejects unsafe/exhausted revisions before invoking persistence.
- Regression tests cover `Number.MAX_SAFE_INTEGER`, a value above it, a very large integer, and assert that neither the authority/commit path nor persistence is reached for an exhausted revision.

## Commits

- Core candidate validation: `977a5ef64dfbf7999cdeefbf54282c137b83dea0`
- Protected-transition checks: `7ab078d9bb8742386b74f1030d70b662188d10a4`
- Persistence adapter check: `116ae15d0e9fc6eea1de1764c0b6efb8de855f21`
- Core regression tests: `19aae143fb3093995f2e37d5027919682d395eca`
- Protected-transition regression tests: `5ca9b2b2678cebce9e2c3bf319849b8813d5cacd`
- Persistence-adapter regression tests / final test head: `f9bab5aac075f81bd28e04bf1a2692c9deb103d6`

## Focused CI evidence

All listed runs completed successfully:

- M0 non-authority Core contracts: https://github.com/snowdenxrp/aldea-ia/actions/runs/39042995723 — success on `5ca9b2b2678cebce9e2c3bf319849b8813d5cacd`
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/39042998648 — success on `f9bab5aac075f81bd28e04bf1a2692c9deb103d6`
- STEP 5 outcome classification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39042998646 — success on `f9bab5aac075f81bd28e04bf1a2692c9deb103d6`
- STEP 3A/3B/3C verification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39042998600 — success on `f9bab5aac075f81bd28e04bf1a2692c9deb103d6`

M0 CI ran on a preceding commit containing the final Core source and core-contract tests; the STEP 3A/3B/3C, STEP 4, and STEP 5 workflows ran on the final regression-test commit. This is focused CI only, not a full-repository test run.

## Scope and limitations

This change prevents unsafe numeric revision values from entering this revision-CAS path and prevents an exhausted current revision from being incremented imprecisely. It does not prove durable monotonicity across restore/rollback, authority epochs, fencing across resource incarnations, legitimate constitutional authority, production runtime reachability, or absence of protected-path bypasses.

STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP. No Constitution commissioning or protected activation is authorized by this increment.

## Next step

Continue from M0.55 without repeating M0.1–M0.55. Inspect a distinct contract boundary only after checking existing reports/tests. Any durable rollover or epoch mechanism requires a coherent root-level design, not an ad hoc patch. Missing evidence remains PENDING/UNKNOWN.

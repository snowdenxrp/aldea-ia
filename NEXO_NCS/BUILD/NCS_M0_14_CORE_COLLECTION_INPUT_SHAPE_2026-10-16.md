# NCS M0.14 — Core collection input-shape validation

Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED / FOCUSED CI PASS

## Concrete gap

Core contracts spread several inputs into arrays without first requiring arrays. For example, a string passed as `authoritativeReads`, `reasons`, or `evidence` could be converted into individual characters. This is malformed input silently transformed at the contract boundary.

## Change

- Added a shared local array-shape check in `src/nexo/core/contracts.mjs`.
- `createClaimEnvelope` now validates each collection field: authoritativeReads, dependencies, predicateDependencies, derivedProvenance, causalInputs, and sourceProvenance.
- `createValidationResult`, `createOutcome`, and `createAuthorityResult` now require reasons/evidence arrays.
- Existing policy-context array checks use the same helper.
- Added focused negative tests in `tests/nexo/core-contracts.test.mjs`.
- No authority policy, identity semantics, transition sequencing, commit behavior, runtime wiring, or protected-effect behavior changed.

## Exact evidence

- Source commit: `3b1659f22c5679edbdf944e47f8b61fe295ea11b`
- Test commit / CI head: `e24b0084e4eb8b21c23494c2ccce93843912078d`
- M0 workflow: https://github.com/snowdenxrp/aldea-ia/actions/runs/38979833871 — job `observation-contract` succeeded, all seven configured commands succeeded.
- Semantic validation workflow: https://github.com/snowdenxrp/aldea-ia/actions/runs/38979833890 — succeeded.
- Policy-context workflow: https://github.com/snowdenxrp/aldea-ia/actions/runs/38979833974 — succeeded.
- Outcome classification workflow: https://github.com/snowdenxrp/aldea-ia/actions/runs/38979833881 — succeeded.

## Boundaries / non-claims

This verifies malformed collection-shape rejection in focused tests. It does not prove source authenticity, authority provenance, legitimate claim identity, complete runtime integration, bypass closure, or full `npm test` success. A correctly shaped array is not necessarily truthful or authorized evidence.

STEP 7 remains OPEN / STOP / UNKNOWN. Direction B / L2 remains the objective. Constitution is not frozen or commissioned, and protected effects remain stopped.

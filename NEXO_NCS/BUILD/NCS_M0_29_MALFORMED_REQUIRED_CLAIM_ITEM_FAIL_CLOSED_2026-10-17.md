# NCS M0.29 — Fail closed on malformed required claim items

Date: 2026-10-17
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED / FOCUSED CI PASS

## Finding

The final semantic validator derived `requiredIds` by filtering claim-critical entries to those already containing a string `id`. A required dependency or predicate entry with no valid identifier was silently excluded from validation. If the remaining listed requirements were satisfied, the validator could return PASS despite a malformed declared claim-critical item.

## Change

- `src/nexo/core/final-semantic-validator.mjs`: inspect all entries from `authoritativeReads`, `dependencies`, `predicateDependencies`, and `causalInputs`. Any required item without a non-empty string identifier returns UNKNOWN before the validator can pass. Explicit `required: false` items remain optional.
- `tests/nexo/final-semantic-validator.test.mjs`: regression supplies a required dependency object without an `id` and asserts UNKNOWN with an explicit reason.
- No authority source, authenticity, or policy legitimacy is inferred by this change.

## Evidence

Source commit: `6635b8b2015a00ec749c037b5e5dd92175b627b1`
Test commit / CI head: `5cfcdd06c7f3866c82eaea37ef0789447bac1d0b`

Focused CI on test commit:
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/38988318369 — success.
- STEP 5 outcome classification / protected-transition tests: https://github.com/snowdenxrp/aldea-ia/actions/runs/38988318355 — success.

## Boundaries

Focused tests only; no full-repository suite or production runtime path is claimed. The change closes the identified malformed-entry omission but does not establish runtime composition, legitimate authority, or protected-effect safety. STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.

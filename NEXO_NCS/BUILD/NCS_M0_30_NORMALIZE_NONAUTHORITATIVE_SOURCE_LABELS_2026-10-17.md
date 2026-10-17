# NCS M0.30 — Normalize known non-authoritative source labels

Date: 2026-10-17
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED / FOCUSED CI PASS

## Finding

STEP 4 rejected known non-authoritative source labels only by exact string equality. Variants such as `"Cache"`, `" CACHE "`, or `" DERIVED "` could avoid that explicit rejection despite representing the same known labels.

## Change

- `src/nexo/core/final-semantic-validator.mjs`: normalize the label with `trim().toLowerCase()` before checking the existing known non-authoritative set `cache/helper/derived`.
- `tests/nexo/final-semantic-validator.test.mjs`: test mixed-case and whitespace variants; all must produce UNKNOWN.
- This remains a narrow deny-list consistency fix. It does not authenticate source labels or make `authoritative: true` trustworthy.

## Evidence

Source commit: `0976fcf7a8c825c86a371a1cf7d0259acc263acc`
Test commit / CI head: `ca3e025ee106d4051e20aa9a24f49163fd854be8`

Focused CI on test commit:
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/38988396835 — success.
- STEP 5 outcome classification / protected-transition tests: https://github.com/snowdenxrp/aldea-ia/actions/runs/38988396800 — success.

## Boundaries

Focused tests only. This does not establish real source authenticity, production runtime reachability, legitimate constitutional authority, or protected-effect safety. STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.

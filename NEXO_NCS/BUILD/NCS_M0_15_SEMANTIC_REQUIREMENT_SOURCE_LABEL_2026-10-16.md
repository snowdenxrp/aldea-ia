# NCS M0.15 — Explicit source label required for claim-critical requirements

Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED / FOCUSED CI PASS

## Concrete contract mismatch

The STEP 4 validator's documentation says each requirement must positively identify its authority source. However, for claim-critical requirements, the implementation only checked `authoritative === true` and rejected three source labels (`cache`, `helper`, `derived`). A missing or whitespace-only `source` label could still be accepted as PASS when the status was SATISFIED and the authority marker was true.

## Change

- `src/nexo/core/final-semantic-validator.mjs`: a required requirement is treated as non-authoritative if the marker is not true, the source is missing/non-string/blank, or the source is one of the existing explicitly non-authoritative labels.
- `tests/nexo/final-semantic-validator.test.mjs`: added regression cases for missing and whitespace-only source labels; existing valid fixtures now name a test source.
- This is only structural enforcement of an explicit label. It does not authenticate the source label or prove that the caller's `authoritative: true` assertion is legitimate.

## Exact evidence

- Validator source commit: `56aa2758c8edbac73fc88eed2da094f28daf3605`
- Test commit / CI head: `8371b99d344ba2eafd404ee72421168f3f01860f`
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/38979977867 — success, test command passed.
- STEP 5 regression workflow: https://github.com/snowdenxrp/aldea-ia/actions/runs/38979977868 — success, outcome-classifier and protected-transition tests passed.

## Boundaries / non-claims

A non-empty `source` field is a label, not proof of source identity, authenticity, trust, freshness, or authority. The known caller-trust boundary remains; this change does not close the Genesis/owner authority gap, establish production runtime wiring, prove bypass closure, or prove full `npm test` success.

STEP 7 remains OPEN / STOP / UNKNOWN. Direction B / L2 remains the objective. Constitution is not frozen or commissioned, and protected effects remain stopped.

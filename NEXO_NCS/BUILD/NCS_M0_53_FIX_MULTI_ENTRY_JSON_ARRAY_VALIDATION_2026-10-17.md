# NEXO NCS — M0.53: Correct multi-entry JSON array validation in observation equivalence

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Defect demonstrated

In `src/nexo/core/observation-equivalence.mjs`, the array-index validation regex contained an over-escaped digit class: `/^(0|[1-9]\\\\d*)$/` in the source. As a result, valid JSON arrays whose own keys include multi-entry indices such as `"1"` were rejected as malformed. This caused valid observations with multi-item provenance arrays to return `UNKNOWN` instead of evaluating equivalence.

The JavaScript regex behavior is consistent with MDN's documentation that `\\d` is the digit class and escaping changes interpretation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Cheatsheet

## Correction

- Corrected the regex to use the intended digit class: `/^(0|[1-9]\\d*)$/`.
- Added a regression case with two valid provenance entries on each observation, expecting `EQUIVALENT`.
- Kept malformed arrays fail-closed; no authorization or provenance trust was added.

## Commits

- Source fix: `f0a6cd8608c79dcfcc2a24ddc09210510bd6f431`
- Regression test: `5def9ecaea02a47b7180008b972fd61d4cfe0cf7`

## Focused CI evidence — pending at report creation

- M0 core contracts: https://github.com/snowdenxrp/aldea-ia/actions/runs/39041363190
- STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/39041363167
- STEP 5 outcome classification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39041363186

Do not mark M0.53 CI PASS until all relevant runs complete successfully.

## Scope and limitations

This is a bounded input-validation/availability correction only. It does not establish producer authenticity, truth of provenance, constitutional authority, a production runtime-to-protected-effect path, or bypass closure. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain disabled. No full-repository test run or production-device test is claimed.

## Next step

Verify all three focused CI runs. If successful, update STATUS and this report with final evidence. Then inspect a distinct, not-yet-closed Core boundary, cross-checking prior M0 reports before treating anything as new. Missing proof remains `PENDING` or `UNKNOWN`, never PASS.

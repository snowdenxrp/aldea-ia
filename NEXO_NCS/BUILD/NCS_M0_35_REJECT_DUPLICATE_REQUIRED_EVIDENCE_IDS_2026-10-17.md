# NCS M0.35 — Reject duplicate required evidence identifiers

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Finding

The STEP 4 semantic validator built a map of requirements by `id`, while also iterating the original requirements list. If a claim-critical required ID appeared more than once with otherwise `SATISFIED`, authoritative-looking entries, the validator could return `PASS` despite the identifier not uniquely identifying one evidence item. Conflicting duplicates often failed through other checks, but duplicate identity itself was not explicitly rejected.

## Change

Before resolving required evidence, the validator now detects duplicate IDs among requirements that correspond to claim-critical required IDs. If any are found, it returns `UNKNOWN` with the duplicate IDs as evidence. Unrelated duplicate IDs are not part of this specific guard.

Regression: two `dep-a` entries with different source labels but both marked `SATISFIED` and `authoritative: true` now produce `UNKNOWN`, not `PASS`.

## Evidence

- Source commit: `e891a20a8971fa9df3b6b7d04def5a9c09bd93e3`
- Test commit / CI head: `4a605acd7cc4087261db45d8bab012a7c227c5a4`
- STEP 4 semantic validation CI: [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/38989570129)
- STEP 5 outcome classification CI: [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/38989570134)

These are focused CI runs, not a full-repository test run.

## Limits

This detects ambiguous duplicate evidence identifiers; it does not authenticate the source labels or prove the `authoritative` flag is legitimate. It does not establish runtime reachability or protected-sink/bypass closure. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.

## Next

Continue M0 from the next concrete contract-level boundary. Do not repeat prior M0 increments or reopen the separate STEP 7 research line.

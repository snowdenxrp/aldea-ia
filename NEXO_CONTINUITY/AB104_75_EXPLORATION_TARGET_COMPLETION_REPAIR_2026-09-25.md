# AB104.75 — Exploration target completion repair

Date: 2026-09-25

## Evidence
- AB104.74 diagnostic run 2081 / job 108263186771 executed the new diagnostic.
- Diagnostic showed both agents scheduled excursions, but exploration could be recorded before target arrival.
- Alex ended with no explored area; Bruno had `area-1` while still in region `5:4`; `knownRegions` remained `["5:4"]`.
- Root cause: `performDecision()` handled `explore_area` immediately even when `intent.target` was still present. The target was therefore not a completion condition; discovery occurred at the current position.

## Repair
Commit `f6d5da0f16b5604f9d6f7c2706c48a2703c609d4` changes the `explore_area` branch so an intent with a non-null target remains in `moving` state and returns without recording discovery. Discovery is recorded only after the tick path has cleared the target at arrival.

No assertion was weakened and no target region was pre-marked as known.

## Verification boundary
- Repair is persisted in main.
- GitHub Actions verification is pending for the repair commit.
- AB65 execution remains NOT_VERIFIED and is separate from this runtime repair.

## Next exact action
Inspect the Actions run for `f6d5da0f16b5604f9d6f7c2706c48a2703c609d4`. If behavioral exploration passes, continue through the next npm test failure without weakening assertions; if it fails, use the concrete diagnostic/log state to make the smallest semantic repair and persist the next checkpoint.

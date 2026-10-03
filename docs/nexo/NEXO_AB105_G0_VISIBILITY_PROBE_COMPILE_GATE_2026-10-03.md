# NEXO AB105 G0 — visibility probe compile gate — correction — 2026-10-03

- Branch: `nexo-ab105-g0-visibility-probe`
- AB105.116R: unchanged.
- AB105.117R: not created.
- TLC: not rerun.
- PR #94: unmerged.
- Kafka pin: `99b940733a9f6bc409457dba7108f08421d81e42`.

## Correction
The first compile workflow was found by source inspection to have an invalid import insertion marker and was deleted before relying on its result. No compile result from that workflow is considered evidence.

Corrected workflow commit:
`b7e59b5c4d62f9764c0d92dd52a030e77984144b`

The corrected recorder is placed in `server-common`, which avoids making the core probe depend directly on the metadata module. It captures the existing W1 cache object and the existing AUTH cache object in per-thread state, then flushes only during owner-thread shutdown.

## Status
The corrected workflow has been pushed and is now the only compile-only workflow at that path. A workflow run result has not yet been retrieved, so compilation remains UNKNOWN.

## DO-NOT-REPEAT
Do not claim compilation success/failure until an actual Actions result is available. Do not execute the real-broker visibility experiment yet.

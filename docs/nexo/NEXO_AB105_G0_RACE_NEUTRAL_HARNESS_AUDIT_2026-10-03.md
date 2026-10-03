# NEXO AB105 G0 — Race-Neutral Harness Audit — 2026-10-03

## Finding
Inspected the active `nexo-ab105-g0-ordering-witness-v2.yml` workflow. The workflow dynamically reads `.github/workflows/nexo-ab105-g0-ordering-witness.yml` to extract the Java witness test during the probe-installation step.

A direct fetch of that referenced source file on `main` returned Not Found. Therefore the exact current harness body cannot be independently inspected from that path in this pass.

## Consequence
Do NOT infer that the current witness is race-neutral merely because the workflow is named ordering-witness-v2. The workflow does execute the real broker test and records raw `NEXO_ORDER` events, but the gating/coordination semantics of the extracted test remain unverified until the referenced harness source is recovered from the correct historical/current path.

## Frozen state
- AB105.116R unchanged.
- AB105.117R not created.
- TLC not rerun.
- PR #94 not merged.
- No new experiment launched.
- No W1-gated request may be introduced.

## Next exact action
Recover the actual witness source used by the successful run (commit/run artifact/workflow source or another canonical path), inspect its concurrency gates, and classify it before modifying anything. If the source cannot be recovered, preserve UNKNOWN rather than reconstructing the test from memory.

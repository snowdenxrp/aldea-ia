# NCS M0.34 — Validate claim-builder output before authority gate

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Finding

`executeProtectedTransition()` previously accepted the `claimBuilder.build()` output after checking only that `claimId` was a string, then passed that object to `authorityGate.check()`. This meant malformed look-alike objects could reach the authority decision boundary before the ClaimEnvelope contract was re-applied.

## Change

The transition now rejects non-object/array builder results and rebuilds the returned object through `createClaimEnvelope()` before invoking the authority gate. This validates the envelope's existing structural contract and detaches its data before the gate receives it.

Regression: a builder result with a whitespace-only claim ID is rejected, and the test proves `authorityGate.check()` is never called.

## Evidence

- Source commit: `8a793eabfe4fd2c09ec49fc465ab69612443b0e9`
- Test commit / CI head: `2cdee9f5ec0ab45667b2dcee0fb5ac633091bf42`
- M0 core contracts CI: [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/38989443967)
- STEP 4 semantic validation CI: [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/38989443881)
- STEP 5 outcome classification CI: [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/38989443922)

These are focused GitHub Actions runs, not a full-repository test run.

## Limits

This prevents structurally malformed builder output from reaching the authority gate; it does not establish that claim content is truthful, that authority evidence is authentic, or that the gate itself has legitimate constitutional provenance. It does not prove production runtime reachability or protected-sink/bypass closure. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.

## Next

Continue M0 only with a concrete contract-level finding, avoiding repeated M0.1–M0.34 work and keeping the STEP 7 investigation separate.

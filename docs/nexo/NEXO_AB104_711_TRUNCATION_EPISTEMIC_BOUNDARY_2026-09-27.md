# NEXO AB104.711 — Truncation and invalid-position epistemic boundary
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Frozen finding

A log-start movement or truncation discovered while resolving the verifier's explicit starting position is not evidence that the target effect is absent. It means the requested observation coordinate could not be established with the originally intended semantics.

## Frozen classification

If the consumer cannot establish a valid starting position because of offset-out-of-range/log-truncation conditions:

SETUP_POSITION_INVALID

This is distinct from:
- NOT_OBSERVED — valid observation window completed without exact identity;
- READ_PATH_ERROR — observation path failed after valid setup;
- HARNESS_SETUP_FAILURE — generic setup failure where a more precise state is unavailable.

The precise state is preferred because it preserves epistemic information: the experiment did not actually observe the intended window.

## auto.offset.reset boundary

For the base verifier, `auto.offset.reset=none` is preferred over `earliest` during position establishment. Automatic reset would silently select a new coordinate and could convert a historical-window invalidation into an apparently clean observation.

If `none` causes OffsetOutOfRange/NoOffsetForPartition/LogTruncation during setup, terminate with SETUP_POSITION_INVALID rather than retrying by selecting another offset.

## Why this is safer

The experiment is testing observability of an exact effect identity after producer-side response loss. It is not testing whether the identity exists somewhere in whatever portion of the log happens to remain readable.

Therefore:

INTENDED_START_COORDINATE ≠ CURRENTLY_AVAILABLE_EARLIEST_COORDINATE

must never be silently collapsed.

## Beginning-offset diagnostic

The preliminary beginningOffsets() sample remains diagnostic only. If it differs from the final position or becomes invalid before position establishment, record the discrepancy. It does not justify changing the target start or producing NOT_OBSERVED.

## Status

VERIFIED:
- invalid/truncated position is not absence evidence;
- `auto.offset.reset=none` preserves the invalid-position signal;
- automatic reset to earliest would weaken the experiment's epistemic boundary;
- a dedicated SETUP_POSITION_INVALID state is preferable to generic absence.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.712: inspect Kafka's exact `LogTruncationException` metadata and recovery semantics, then define the minimum evidence fields required to distinguish ordinary out-of-range from actual log truncation without overclaiming causality.
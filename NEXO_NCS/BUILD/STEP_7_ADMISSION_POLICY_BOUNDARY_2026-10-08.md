# NCS STEP 7 — Admission policy boundary — 2026-10-08

## Status
BOUNDARY ANALYSIS — NO NEW ADMISSION POLICY INVENTED

## Finding
The current Core transports an explicit admission state, but the new architecture does not yet have enough evidence to derive ADMITTED or NOT_ADMITTED from an ObservationEnvelope alone.

Observation and equivalence evidence are not themselves admission decisions. An observation may be valid evidence without entering the bounded mission set. Equivalence is claim-specific and may remain UNKNOWN. The existing 8-step admission semantics are already closed.

## Minimum safe boundary
The Core may carry:
- ObservationEnvelope;
- claim proposal;
- explicit admission state;
- admission evidence.

The Core must not infer ADMITTED merely because an observation exists, or infer NOT_ADMITTED merely because equivalence is UNKNOWN. Admission is distinct from authority, validation, commit, execution, resolution, and retry.

## NEGATIVE_RESOURCE
For the current producer, otherwise identical observations remain EQUIVALENCE.UNKNOWN because required causal dimensions are absent. The safe candidate state is therefore admission UNKNOWN unless an independent explicit admission decision exists. This does not mean failed, resolved, or excluded by the 8-step bound.

## Required next contract
Before implementing an admission policy, define the minimum authoritative inputs that decide whether a candidate enters the bounded admitted set. Those inputs must be explicit and must not be fabricated from observation fields.

## STOP
If admission requires fabricating missing provenance or using legacy metadata as observation identity, stop and redesign the root contract.

## Not changed
- legacy buildNexoMission;
- 8-step semantics;
- observation identity;
- external effects;
- authorization or commit.

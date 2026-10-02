# NEXO AB105 G0 Semantic Boundary Analysis — 2026-10-01

## Established by recovered runtime evidence

The corrected Kafka runtime execution completed successfully and produced a recoverable artifact.

Witness:
G0_WITNESS A1=OBSERVED D0=OBSERVED D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1

Artifact:
- run: 36938337030
- artifact: 11199086900
- digest: sha256:d43efa23640881711f188a17e1af2dfa890f801a04d0d5974945bc8cc9c343eb
- artifact not expired

## What the witness establishes

1. A1 was observed by the harness before D0.
2. D0 was observed and held.
3. D1 used an independent real Kafka Producer and was denied after the ACL deletion.
4. D2 was the original producer path and succeeded after release.
5. The target partition's UnifiedLog end offset changed from 0 to 1.
6. Therefore the exact harness sequence A1 → D0 → D1 → D2 → E was executed and independently recoverable from the artifact.

## What it does not establish

- It does not, by itself, establish exploitability against a deployed Nexo system.
- It does not establish impact beyond the modeled Kafka G0 scenario.
- It does not establish a production deployment condition.
- It does not establish that the authorization race generalizes to every Kafka configuration/version.
- It does not justify architectural implementation or a security conclusion outside the tested model.

## Important distinction

EXACT_RACE=OBSERVED_WITNESS is now justified for the frozen G0 harness scope.

EXPLOITABILITY remains UNKNOWN_PENDING_SEPARATE_ANALYSIS.

No status is elevated beyond the evidence actually recovered.

## Integrity

- AB105.116R remains frozen and untouched.
- No Nexo architecture implementation was performed.
- PR #81 remains open/draft/unmerged.
- This record is additive and does not rewrite historical evidence.

# NEXO AB104.706 — Setup authority boundary for offset initialization
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source finding

Current Kafka 4.1.2 exposes beginningOffsets() as a broker offset lookup that does not change consumer position. The current ClassicKafkaConsumer implementation shows position() first checks for an already-valid local fetch position; if none exists, it calls updateFetchPositions() and then polls the client until a valid position is established. citeturn0search0turn0search6

The Kafka protocol source identifies ListOffsets as the protocol used for offset lookup, with current versions carrying isolation level and leader-epoch information. citeturn0search5

## Frozen authority boundary

The verifier setup has two distinct evidence surfaces:

1. BEGINNING_OFFSET_OBSERVATION
   - obtained from beginningOffsets()
   - broker-derived earliest available offset
   - diagnostic/setup evidence only

2. STARTING_POSITION
   - obtained after explicit seekToBeginning()
   - confirmed by position()
   - establishes where the verifier's subsequent fetch begins

Neither is a record-presence claim.

## Important refinement

position() is not merely a local getter in the uninitialized case. It can trigger remote offset initialization through updateFetchPositions(). Therefore its successful return is a setup-time broker interaction and must be recorded as such.

However, this still does not consult committed consumer offsets on the selected manual-assignment path. The evidence path uses explicit earliest positioning rather than group recovery.

## Frozen setup failure rules

If beginningOffsets() fails -> HARNESS_SETUP_FAILURE.

If seekToBeginning() cannot establish a valid position -> HARNESS_SETUP_FAILURE.

If position() times out or returns an unrecoverable error -> HARNESS_SETUP_FAILURE.

No setup failure may become NOT_OBSERVED.

## Timing boundary

The observation deadline begins only after:
- assignment succeeds;
- beginning offset is captured;
- explicit seekToBeginning succeeds;
- position() returns successfully.

This prevents setup latency from consuming the actual observation window or being misclassified as an absence result.

## Frozen record-presence boundary

Only a successful poll containing the exact AB104.691 identity can produce PRESENT.

The ListOffsets/position responses never produce PRESENT by themselves.

## Status

VERIFIED:
- beginningOffsets() is broker-derived and position-neutral;
- position() can perform remote initialization;
- ListOffsets is the offset-lookup protocol;
- setup offset evidence is distinct from record-presence evidence.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.707: inspect seekToBeginning() implementation and determine the exact ListOffsets/position-reset interaction, especially what happens if the log start moves between beginningOffsets() and seekToBeginning().
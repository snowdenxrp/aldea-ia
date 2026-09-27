# NEXO AB104.693 — Log truncation and verifier classification
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact Kafka finding

Kafka's truncation handling uses leader epochs to detect divergence. KIP-320 documents that after an unclean leader election, previously committed data can be lost and consumer offsets can become out of range; with an automatic reset policy the consumer may reset, while without one a truncation-specific exception can be raised. The same work added leader-epoch information to consumer records and offset state. 

Kafka also documents that OffsetForLeaderEpoch can determine whether a fetch offset remains valid: if the returned epoch/end offset indicates the requested position was truncated, the client must not treat the old position as valid.

## Frozen base-test decision

The minimal AB104 experiment intentionally uses a fresh single-broker EmbeddedKafkaCluster and starts the verifier immediately after the producer response-loss event. No leader election or recovery is injected into this base seam.

Therefore:
- A normal successful direct read with exact identity => PRESENT.
- Successful reads through the fixed deadline without exact identity => NOT_OBSERVED.
- Any truncation/offset-invalidity signal, leader-epoch inconsistency, or read failure that prevents reliable observation => READ_PATH_ERROR.
- Never allow automatic offset reset to silently turn an invalidated observation position into clean NOT_OBSERVED.

## Important correction

auto.offset.reset=earliest remains a fallback configuration, but it must not be used as epistemic evidence. If the verifier is forced to reset because its requested position is out of range, the experiment must preserve that event in diagnostics and should classify the observation as READ_PATH_ERROR unless the verifier can establish a clean, complete observation window after the reset without ambiguity.

For the minimal test, explicit seekToBeginning() is performed after assignment. The fixed observation deadline begins only after assignment and seek succeed.

## Why this matters

A missing effect after log truncation is not equivalent to proof that the producer request never reached the broker. Kafka explicitly recognizes that unclean leader changes can remove previously committed data. Therefore:

NOT_OBSERVED != NOT_COMMITTED

and a truncation event makes the observation path non-authoritative for absence.

## Frozen evidence fields

Add:
- verifierInitialLeaderEpoch when available;
- verifierObservedLeaderEpoch when available;
- verifierPosition;
- truncationDetected boolean;
- observationDeadline;
- observationClass.

Do not claim replicated durability from this single-broker experiment.

## Status

VERIFIED:
- Kafka leader epochs participate in truncation detection;
- unclean leader election can remove previously committed data;
- offset reset can occur after out-of-range/truncation;
- automatic reset must not be collapsed into clean absence evidence.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.694: inspect the current Kafka consumer's exact metadata/leader-epoch exposure and freeze the minimum evidence required to detect a verifier-side leader change without turning metadata observation itself into a false durability claim.
# NEXO AB104.692 — Duplicate effect identity and terminal observation
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka finding

A ConsumerRecord carries its partition and offset; the offset identifies the record's position within that partition. Consumer position advances as records are returned by poll(). citeturn0search0turn0search5

## Frozen duplicate policy

A valid exact identity match is terminal for the base experiment.

When the verifier observes the first record satisfying the complete AB104.691 identity conjunction:
topic ∧ partition ∧ key ∧ value ∧ exactly-one identity header ∧ exact header bytes

it immediately freezes:
- ObservationClass=PRESENT
- topic
- partition
- offset
- effectId
- verifier deadline
- verifier configuration digest

No later poll is required to search for duplicates.

## Why first valid match is sufficient

The experiment asks whether the unique frozen effect identity reached the broker-observable log despite producer response loss. The identity contract intentionally makes the effectId the stable logical identity. Once an exact matching record is observed, the ambiguity question is answered for that effect: the broker-side record exists.

A later duplicate with the same effectId would be an additional anomaly, not a reason to retract the already-established PRESENT observation.

## Duplicate classification if encountered before terminal match

If multiple records with the exact effectId are returned in the same poll before the verifier can freeze, preserve all matching offsets in diagnostic evidence and classify the observation as PRESENT_WITH_DUPLICATE rather than silently selecting one.

For the minimal base experiment, the expected outcome is exactly one matching record. A duplicate is therefore a protocol/integration anomaly to report separately, not evidence against PRESENT.

## Offset semantics

Offset is evidence metadata, not the effect identity itself:
- effectId establishes logical identity;
- topic+partition+offset identifies the observed Kafka record location;
- offset ordering must not be used to infer external effect completion;
- seeing a later unrelated record does not prove absence of the target.

## Frozen terminal state rule

OBSERVING
-> PRESENT when first exact identity is found
-> NOT_OBSERVED only when fixed deadline expires after successful reads with no exact identity
-> READ_PATH_ERROR on unrecoverable observation failure

Once terminal, the observation state is immutable. Cleanup cannot rewrite it.

## Status

VERIFIED:
- partition offset identifies record position;
- consumer position advances through polled records;
- first exact identity match is sufficient for PRESENT;
- duplicate identity is diagnostic/anomalous, not a reason to downgrade PRESENT.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.693: inspect current Kafka partition read isolation/leader behavior and determine whether the direct single-broker verifier can legitimately treat one observed record as broker-log observation without adding a second independent read path.

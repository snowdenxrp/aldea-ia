# NEXO AB104.689 — Direct verifier transactional visibility
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka finding

Kafka's current 4.1.2 consumer documentation distinguishes READ_UNCOMMITTED and READ_COMMITTED. READ_COMMITTED returns only successfully committed transactional records; it can stop at the partition's Last Stable Offset and filters aborted transactional records. Non-transactional records remain visible in READ_COMMITTED. citeturn1view0turn1view1

## Frozen base experiment choice

Use:
- isolation.level=read_uncommitted
- enable.auto.commit=false
- manual assign of the single target partition
- explicit seekToBeginning()
- direct cluster bootstrap, bypassing the fault proxy

Reason: the AB104 base experiment sends a deliberately non-transactional ProducerRecord with enable.idempotence=false and no transactional.id. The verifier's question is whether that exact record reached the broker log despite the producer-side response loss. READ_UNCOMMITTED gives the broadest observation surface and does not introduce transactional visibility/LSO as an additional confounder.

READ_COMMITTED is not evidence of stronger physical durability. It is a visibility rule that hides uncommitted/aborted transactional records.

## Important boundary

For this base experiment:
PRESENT = exact effect identity observed by the direct READ_UNCOMMITTED verifier.

NOT_OBSERVED = exact effect identity not observed by the fixed deadline with a successful read path.

Neither state alone proves durable replication. The cluster is RF=1 in the minimal seam test, so this remains broker-log observation, not replicated durability proof.

## Future transactional variant

A later transactional experiment may deliberately use READ_COMMITTED to answer a different question: whether the target transactional record became committed and visible to a committed-only consumer. It must not replace the base non-transactional experiment because it changes the semantic surface.

## Status

VERIFIED:
- current isolation-level semantics;
- READ_COMMITTED transactional visibility and LSO behavior;
- non-transactional records remain visible to READ_COMMITTED;
- base experiment should use READ_UNCOMMITTED to minimize unrelated transactional semantics.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.690: inspect the direct verifier's deserialization/error surface and freeze how malformed/unexpected records, consumer exceptions, and read-path failures are classified without collapsing them into NOT_OBSERVED.

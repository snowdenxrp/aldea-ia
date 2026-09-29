# AB104.942R — cross-region replay and event-identity preservation audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When the same historical event is replayed or replicated in another region/consumer, can changed event IDs or local deduplication scope cause a historical effect to be repeated without creating a new top-level interaction class?

## Fresh evidence
Microsoft documents at-least-once delivery, checkpoint-based replay, and the need for idempotent consumers; a missing checkpoint or lost acknowledgement can cause an already-successful external request to be retried. AWS EventBridge guidance states that event IDs can change across API calls and that cross-region correlation therefore requires an immutable unique identifier; it explicitly recommends idempotent consumers for replication and replay. AWS Event Sourcing also warns that replay can update external systems unexpectedly and recommends controlling external updates.

## Scenario
Region R1 consumes historical event E0 and produces EFFECT-1.
Replication/replay sends the semantic event to R2.
The transport assigns a new message identifier M2, while E0's immutable source identity may or may not be preserved.
R2 has no local record of EFFECT-1.
R2 processes the event and produces EFFECT-2.
Possible outcomes:
- R2 deduplicates using preserved source identity;
- R2 treats M2 as new and executes EFFECT-2;
- provider deduplicates using a shared idempotency identity;
- provider executes a second effect;
- outcome is UNKNOWN.

## Findings
1. A transport/message ID is not automatically the identity of the historical source event.
2. Replication across regions requires an immutable correlation/source identity if duplicate processing is to be recognized.
3. A new transport ID can coexist with the same source-event identity; treating the transport ID as the complete identity can create duplicate effects.
4. Regional consumer deduplication state is not global evidence of historical effect absence.
5. Provider-side deduplication is a separate scope and retention contract; local deduplication cannot establish provider behavior.
6. If R2 produces a confirmed second effect, EFFECT-1 and EFFECT-2 remain separate historical facts unless authoritative provider evidence proves they are the same deduplicated effect.
7. If R2 outcome is UNKNOWN, replay completion, local absence of dedup state, or a fresh checkpoint cannot collapse UNKNOWN to FAILED.
8. Cross-region replay does not itself create a new top-level class. It composes namespace/identity confusion (I18), retry/idempotency horizon (I15/I22), stale/order (I21), provenance (I19), external-effect ambiguity (class 11), reconciliation (class 12), and class 20 when the local checkpoint and external effect are treated as one atomic boundary.
9. If replication changes the semantic operation rather than merely transporting the same event, it must be represented as a new operation with an explicit relation to the source event; it cannot inherit effect identity merely from payload equality.
10. A shared immutable source-event identity is therefore evidence for deduplication/correlation, not proof that the external effect was or was not committed.

## Representation
SOURCE_EVENT E0
R1 CONSUMER -> EFFECT-1
REPLICATE(E0) -> R2 MESSAGE-ID M2
R2 -> EFFECT-2 (CONFIRMED | UNKNOWN)
Correlation requires immutable source identity plus explicit consumer/provider deduplication scope.
If EFFECT-2 is a new effect, preserve both effects and any later compensation as new facts.

## Anti-collapse
MESSAGE_ID != SOURCE_EVENT_ID
SOURCE_EVENT_ID != EFFECT_ID
REGION_LOCAL_DEDUP != GLOBAL_EFFECT_HISTORY
REPLICATION != NEW_OPERATION
SAME_PAYLOAD != SAME_OPERATION
NEW_TRANSPORT_ID != NEW_HISTORICAL_EVENT
CHECKPOINT != EFFECT_PROOF
DEDUP_MISS != EFFECT_ABSENCE
UNKNOWN != FAILED
PROVIDER_DEDUP_SCOPE != CONSUMER_DEDUP_SCOPE

## Classification
Primary: I18, I15/I22, I21, I19, class 11, class 12.
Class 20 applies where local checkpoint and external effect are claimed to be one atomic boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
The cross-region case strengthens the identity hierarchy: source-event identity, transport identity, operation identity, effect identity, and deduplication scope must remain distinct. Regional replay can create a second real effect even when it is replaying the same historical source event. Current evidence still supports existing interaction families rather than a new class.

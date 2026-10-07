# NEXO AB105 — DynamicConfigPublisher callback boundary

Date: 2026-10-06
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

## Purpose
Audit whether BrokerMetadataPublisher's DynamicConfigPublisher callback can provide an indirect synchronization/publication bridge from ACL W1 to the SocketServer Processor before ENQUEUE.

## Pinned source findings
- BrokerMetadataPublisher invokes DynamicConfigPublisher before AclPublisher in the metadata-event callback sequence.
- DynamicConfigPublisher only enters its handler loop when delta.configsDelta() is present.
- It processes configuration resources and invokes ConfigHandler implementations for TOPIC, BROKER, CLIENT_METRICS and GROUP resources.
- An ACL-only metadata delta therefore does not enter the configuration-change handlers merely because DynamicConfigPublisher is called.
- The ACL mutation remains later in the same MetadataLoader callback: AclPublisher.onMetadataUpdate -> authorizer add/remove -> W1.
- No inspected DynamicConfigPublisher path creates a per-ACL-update handoff to SocketServer Processor or RequestChannel ENQUEUE.

## Interpretation
This callback is not a hidden W1 -> Processor publication primitive for the ACL-only witness path. Its position before W1 also means it cannot publish a later W1 action by itself.

The Java memory model requires a concrete synchronization/happens-before edge (for example the same lock, volatile publication, concurrent-collection handoff, executor/Future handoff, etc.); mere callback ordering on the metadata thread is insufficient. Java's documented happens-before rules confirm that visibility requires such an edge, not wall-clock ordering alone.

## Status
🟢 Source boundary closed for this candidate.
🔵 W1 -> ENQUEUE HB remains UNKNOWN; this audit does not establish or disprove the vulnerability.

## DO-NOT-REPEAT
Do not reopen DynamicConfigPublisher generically unless a new source path shows that an ACL delta itself invokes a shared reconfiguration primitive that the SocketServer Processor subsequently acquires.

## Next frontier
Only a concrete shared synchronization/publication object or state touched by AclPublisher W1 and subsequently acquired/read by the Processor before RequestChannel.sendRequest remains worth auditing.

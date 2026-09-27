# NEXO AB104.682 — Producer configuration consistency
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka configuration rules
Current ProducerConfig states:
- delivery.timeout.ms must be >= request.timeout.ms + linger.ms.
- acks=all is the strongest acknowledgement mode.
- current Kafka 4.x defaults enable idempotence, but setting retries=0 causes idempotence to be disabled automatically unless the user explicitly forces idempotence, in which case configuration is rejected.
- transactional.id requires idempotence.

## Frozen base configuration
Use:
- acks=all
- retries=0
- enable.idempotence=false explicitly
- linger.ms=0
- request.timeout.ms=1000
- delivery.timeout.ms=3000
- client.id=<unique producer identity>

Consistency:
3000 >= 1000 + 0, so delivery timeout satisfies the producer constraint.

Explicit enable.idempotence=false removes ambiguity from the current default behavior.

## Why acks=all still matters with RF=1
With one broker and replication factor 1, acks=all establishes the strongest available Kafka acknowledgement requirement for that single broker, but it does NOT turn the experiment into replicated durability proof. The experiment is about response ambiguity after broker-side response generation.

## Future timeout distinction
The Future.get wait timeout remains separate from producer request/delivery timeouts. It must be longer than delivery.timeout.ms so the producer has enough time to surface its own outcome.

Frozen:
- producer delivery timeout: 3000 ms
- Future.get wait: 10 s

## Status
VERIFIED:
- configuration inequality;
- idempotence/retries interaction;
- acks=all semantics.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.683: inspect the exact KafkaProducer Future completion path for a response-loss/disconnect and freeze the producer-side outcome assertion without relying on exception-message text.

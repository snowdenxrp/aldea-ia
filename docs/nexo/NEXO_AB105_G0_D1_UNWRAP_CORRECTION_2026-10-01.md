# NEXO AB105 G0 D1 unwrap correction — 2026-10-01

## Finding
Run 36936028499 reached the real independent Kafka Producer D1 path and Kafka returned:
Topic authorization failed for topics [nexo-g0-runtime].

The JUnit failure was harness assertion-shape only:
Producer.send(...).get() surfaced java.util.concurrent.ExecutionException whose cause was TopicAuthorizationException.

## Correction
D1 now asserts ExecutionException, verifies its cause is TopicAuthorizationException, unwraps that cause, and verifies the unauthorized topic.

No synthetic TARGET.authorize() call was reintroduced.

## Epistemic state
- A1: UNKNOWN
- D0: UNKNOWN
- D1: DENIAL observed in runtime logs; full witness still UNKNOWN
- D2: UNKNOWN
- E: UNKNOWN
- EXACT_RACE: UNKNOWN
- EXPLOITABILITY: UNKNOWN

## Persistence
Correction commit: b61a19e40586acc3b943010fb5eb7e6c9fd1cf9b.
This document records the correction before the next execution.

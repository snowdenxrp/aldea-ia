# NEXO AB104.700 — Consumer shutdown, wakeup and interruption boundary
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka finding

KafkaConsumer.wakeup() is thread-safe and causes the thread blocked in poll to receive WakeupException. Kafka documents the standard clean-shutdown pattern: set a closing flag, call wakeup, catch WakeupException only when shutdown was requested, then close the consumer. Interrupting the thread instead raises InterruptException and Kafka discourages it when wakeup can be used. citeturn0search0turn0search2

KafkaConsumer.close() is a cleanup operation and can itself throw InterruptException or KafkaException; wakeup cannot be used to interrupt close. citeturn0search0

## Frozen verifier classification

WakeupException:
- if verifier shutdown was intentionally requested -> VERIFIER_SHUTDOWN, not READ_PATH_ERROR and not NOT_OBSERVED;
- if no shutdown was requested -> READ_PATH_ERROR because the observation path was unexpectedly interrupted.

InterruptException:
- if the test harness explicitly requested interruption/shutdown -> HARNESS_INTERRUPTED;
- otherwise -> READ_PATH_ERROR.

KafkaException/AuthenticationException/AuthorizationException/other unrecoverable consumer failure during active verification -> READ_PATH_ERROR.

Normal empty poll -> continue according to AB104.699.

## Critical evidence rule

A shutdown signal cannot manufacture NOT_OBSERVED. If verification ends early because the verifier was deliberately stopped, the result is VERIFIER_SHUTDOWN/HARNESS_INTERRUPTED, not absence.

Likewise, consumer.close() is cleanup and must occur only after evidence is frozen. Its success or failure cannot rewrite PRESENT or NOT_OBSERVED.

## Frozen lifecycle

SETUP
→ ASSIGN + SEEK
→ VERIFYING
→ PRESENT | NOT_OBSERVED | READ_PATH_ERROR
→ FREEZE_EVIDENCE
→ CLOSE_CONSUMER

If shutdown/interruption occurs before a terminal observation:
VERIFYING → VERIFIER_SHUTDOWN or HARNESS_INTERRUPTED

No shutdown state may transition to NOT_OBSERVED.

## Base-test constraint

The minimal AB104 test should not use a second thread to wake the verifier during the normal observation window. The fixed monotonic deadline from AB104.699 is the normal termination mechanism. wakeup() exists only for deterministic external cancellation or cleanup.

## Status

VERIFIED:
- current Kafka wakeup semantics;
- WakeupException vs InterruptException distinction;
- close() is cleanup, not observation evidence;
- intentional shutdown must remain distinct from clean absence.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.701: inspect the exact current KafkaConsumer close semantics with auto-commit disabled and freeze whether close can alter verifier evidence or introduce a hidden commit/coordination dependency.
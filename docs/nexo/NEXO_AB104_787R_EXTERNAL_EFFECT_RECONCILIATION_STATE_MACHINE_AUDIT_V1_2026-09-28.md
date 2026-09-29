# NEXO AB104.787R — External-effect reconciliation state machine audit

Date: 2026-09-28
Stage: research only; no Nexo implementation.

## Findings

Temporal documents Activity execution as at-least-once: an Activity can have multiple task executions. Its current hands-on material demonstrates that a network error or worker crash after an external POST can cause the POST to be delivered twice; the documented remedy is a stable idempotency key at the receiver. Scheduling-layer duplicate suppression is distinct from receiver-side effect idempotency. [Web evidence: Temporal docs, 2026-09-28.]

Temporal also documents that an Activity can exceed its StartToClose timeout and still finish its external work, while its completion may no longer be accepted by the service. Therefore an Activity timeout is not proof that the external effect did not happen.

AWS durable-execution guidance likewise states that retries rerun steps and that external side effects should use an idempotency key when supported. A duplicate-request response from an idempotency-enabled service is treated as evidence that the first attempt already succeeded.

AWS asynchronous communication documents a claim-check pattern: the acknowledgement carries an identifier that can later be used to query operation status/result, and the validity period of that claim must be defined.

Stripe documents a concrete idempotency model: the first result for a key is retained and later requests with the same key return that result; parameter mismatches are rejected. Keys can later be pruned, after which reuse can create a new request.

## Reconciliation states

PENDING = durable intent exists; no accepted submission recorded.
SUBMITTED = submission attempt was made; outcome may be unknown.
CONFIRMED = external system durably reports intended operation/result.
FAILED = external system durably reports rejection/failure before intended effect.
UNKNOWN = protocol cannot currently distinguish successful effect from failed/no-effect.

UNKNOWN must not collapse into FAILED.

## Stale workers and authority changes

A durable scheduler may suppress duplicate scheduling, but receiver-side protection is still required. A stale worker needs both scheduling/lease control and resource-side idempotency/fencing.

If authority generation changes while an effect is SUBMITTED or UNKNOWN, reconciliation must not silently turn the old operation into a new authorization. The old operation retains its original authority context; any new mutation must pass current authority validation.

old operation + new authority != automatically re-authorized retry

## Candidate safe transitions

PENDING -> SUBMITTED
PENDING -> FAILED
SUBMITTED -> CONFIRMED
SUBMITTED -> FAILED
SUBMITTED -> UNKNOWN
UNKNOWN -> CONFIRMED
UNKNOWN -> FAILED
UNKNOWN -> UNKNOWN

Potentially unsafe implicit transitions:
UNKNOWN -> PENDING
UNKNOWN -> CONFIRMED without external evidence
FAILED -> CONFIRMED without a new accepted operation/evidence
OLD_AUTHORITY -> NEW_AUTHORITY by retry alone

## Evidence ledger

TEMPORAL_ACTIVITY_AT_LEAST_ONCE: SOURCE CONFIRMED
TEMPORAL_EXTERNAL_POST_CAN_DUPLICATE_AFTER_CRASH: SOURCE/TEST MATERIAL CONFIRMED
TEMPORAL_ACTIVITY_TIMEOUT_DOES_NOT_PROVE_EXTERNAL_EFFECT_ABSENT: SOURCE CONFIRMED
RECEIVER_IDEMPOTENCY_REQUIRED_FOR_SAFE_EXTERNAL_RETRY: SOURCE CONFIRMED
SCHEDULER_DEDUP != RECEIVER_EFFECT_IDEMPOTENCY: SOURCE CONFIRMED
CLAIM_CHECK_STATUS_RECONCILIATION: SOURCE CONFIRMED
CLAIM_CHECK_VALIDITY_WINDOW: SOURCE CONFIRMED
STRIPE_IDEMPOTENCY_RESULT_RETENTION: SOURCE CONFIRMED
UNKNOWN != FAILED: SOURCE-DERIVED
OLD_AUTHORITY_RETRY != NEW_AUTHORITY_AUTHORIZATION: SOURCE-DERIVED
UNIVERSAL_EXACTLY_ONCE_ARBITRARY_EXTERNAL_EFFECT: NOT ESTABLISHED
EXECUTED NEXO EXTERNAL-EFFECT RACE: NO
FORMAL PROOF: NOT ESTABLISHED
NEXO IMPLEMENTATION: NOT PERFORMED

## Exact next action

AB104.788R: investigate stale workers and authority changes during UNKNOWN/SUBMITTED effects: cancellation versus fencing, worker lease expiry, generation checks at the effect receiver, and whether reconciliation can safely close an old operation after a newer authority generation has taken over.

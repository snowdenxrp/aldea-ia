# NEXO AB104.827R — Transactional Outbox / Inbox / Effect Journal Audit

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Research question
Determine exactly what transactional outbox/inbox patterns prove, and identify the remaining failure window between durable intent and the external side effect.

## External evidence
AWS Prescriptive Guidance describes the transactional outbox as a solution to the dual-write problem: business state and the outgoing event are committed in one database transaction; the relay can subsequently publish the event, and duplicate delivery must be handled by an idempotent consumer. citeturn1search0

The established microservices.io pattern likewise states that the message relay may publish more than once if it crashes after publishing but before recording completion; consumers therefore need idempotency. citeturn1search3

Debezium documents an outbox event router that captures changes from the outbox table and routes them to downstream messaging. Its documented duplicate-processing mitigation uses a propagated event UUID and a consumer-side processed-message log. citeturn1search5turn1search8

AWS's idempotent-API guidance makes the semantic point explicit: retries require a stable caller/request identifier so the service can distinguish a retry from a new intent. citeturn1search6turn1search17

## Atomic boundary actually established

The outbox gives a strong atomic boundary only for:

**business state + durable intent to publish**

It does NOT make this sequence atomic:

**database commit → external provider effect → provider acknowledgement → durable completion record**

A crash or partition can still occur after the external effect and before the coordinator records its completion.

Therefore an outbox is not an exactly-once external-effect primitive by itself.

## Failure windows

### F1 — before DB transaction commit
No durable business state and no outbox intent. Safe to retry under the normal transaction contract.

### F2 — after DB/outbox commit, before relay
Intent exists durably. Relay can recover and publish later. This is a major advantage over naive dual-write.

### F3 — relay publishes, then crashes before marking/persisting relay progress
The same event can be published again. Consumer-side idempotency is therefore required.

### F4 — consumer receives event, performs external effect, then crashes before recording effect completion
The event may be retried. The external effect may already exist. This is the critical remaining ambiguity window.

### F5 — external effect succeeds, provider acknowledgement is lost
Coordinator state is UNKNOWN unless the provider exposes a durable query/idempotency contract.

### F6 — authority generation changes while the effect is in flight
The outbox does not by itself prove that the external provider will reject the old generation. A resource-side generation/fence is required if stale-authority safety is part of the guarantee.

## Strong separation

Four distinct properties are now evidenced:

1. **Durable intent** — outbox record commits with business state.
2. **Duplicate suppression** — operation/event identity lets consumers recognize repeats.
3. **Authority fencing** — generation/epoch prevents obsolete actors from continuing where the resource supports such fencing.
4. **Reconciliation** — durable query/state inspection resolves ambiguous outcome where possible.

None of these four should be collapsed into “exactly once.”

## New Nexo invariant candidate

For an external effect E in protected namespace R:

`accepted(E) = true` must imply both:

- a valid current authority generation at the protected acceptance boundary; and
- a durable operation identity that can be reconciled after timeout/restart.

A durable outbox record alone satisfies neither condition for an arbitrary external resource.

## Interaction impact

This research strengthens the existing I10/I11/I13/I15 families and exposes a specific missing distinction:

**durable intent is not durable effect knowledge.**

Candidate interaction:

### I16 — durable-intent × external-effect × acknowledgement-loss

Ordered form:

outbox/intent committed → external effect attempted/accepted → acknowledgement lost → retry/recovery

Required decision:

The system must not infer “effect absent” from missing acknowledgement and must not create a second semantic effect merely because the relay/consumer retries.

I16 is currently **UNTESTED** and must undergo the same redundancy attack before a new witness is accepted.

## Methodological correction

We should NOT create a separate witness merely because F3 and F4 are different failure points. They become a distinct interaction only when the second boundary (effect + acknowledgement ambiguity) changes the protected decision beyond existing I10/I11/I13/I15 semantics.

That equivalence test remains pending.

## Evidence ledger

TRANSACTIONAL_OUTBOX_ATOMIC_STATE_PLUS_INTENT SOURCE CONFIRMED
RELAY_DUPLICATION_POSSIBLE SOURCE CONFIRMED
CONSUMER_IDEMPOTENCY_REQUIRED SOURCE CONFIRMED
REQUEST_ID_STABLE_RETRY_IDENTITY SOURCE CONFIRMED
OUTBOX_ALONE_NOT_EXTERNAL_EFFECT_ATOMICITY DERIVED FROM SOURCES
EFFECT_BEFORE_COMPLETION_RECORD_CAN_BE_AMBIGUOUS DERIVED / REQUIRES RESOURCE CONTRACT FOR RESOLUTION
AUTHORITY_FENCING != OUTBOX DURABILITY CONFIRMED BY CROSS-SYSTEM COMPARISON
RECONCILIATION != DEDUPLICATION CONFIRMED AS DISTINCT PROPERTY
I16 DURABLE_INTENT_X_EFFECT_X_ACK_LOSS UNTESTED
FORMAL_EXACTLY_ONCE_EXTERNAL_EFFECT NOT ESTABLISHED
NEXO_IMPLEMENTATION NOT PERFORMED

## Exact next action

**AB104.828R:** attack I16 against I10/I11/I13/I15 and existing witnesses. Determine whether durable-intent adds a genuinely independent causal predicate or is merely another representation of existing retry/effect ambiguity. Then inspect concrete inbox/effect-journal implementations for the F4/F5 window. Do not freeze I16 or add W17 until that reduction is complete.

No deletion/overwrite. No silent witness mutation.

# NEXO AB104.863R — correction/reversal ordering boundary audit

Date: 2026-09-29
Parent continuity: AB104.862R
Research-only. No Nexo implementation. No V21. No semantic freeze.

## Question
Does I21 (stale observation/order) fully cover correction + freshness + reconciliation, or is there a genuinely independent interaction?

## Fresh external evidence

### 1. Adyen: duplicate, delayed, and ordering-sensitive webhook delivery
Adyen's webhook handling guidance states that webhook messages can be retried and that duplicate deliveries can occur. It explicitly says duplicate events can share eventCode and pspReference while eventDate and other fields may differ, and instructs receivers to use the latest webhook event. Adyen also says payload timestamps should be checked for chronological processing and that some webhooks provide sequenceNumber. Its retry queue can redeliver failed webhook messages for up to 30 days.

This gives concrete provider evidence for:
- duplicate delivery;
- delayed/redelivered events;
- freshness-sensitive processing;
- correction/reversal events being part of the same asynchronous delivery domain.

Adyen's refund documentation gives a concrete correction lifecycle: REFUND success is asynchronous and a refund can later become REFUND_FAILED or REFUNDED_REVERSED. Thus a prior positive observation is not necessarily the final resource state.

Sources:
- Adyen webhook handling: https://docs.adyen.com/development-resources/webhooks/handle-webhook-events
- Adyen webhook troubleshooting/retry queue: https://docs.adyen.com/development-resources/webhooks/troubleshoot
- Adyen refund/reversal lifecycle: https://docs.adyen.com/online-payments/refund

### 2. Adyen: correction is a later state, not deletion of history
Adyen documents REFUNDED_REVERSED as a state where funds previously refunded are returned to Adyen. It also exposes SETTLED_REVERSED for later settlement reversal. This is semantically a correction/reversal after an earlier lifecycle state, not evidence that the original event never existed.

This matches the existing I19 correction/reversal family and does not by itself create a new interaction class.

### 3. Concrete executable/open-source evidence
The public Resonate webhook-handler example implements a durable webhook workflow keyed by event_id. Its runnable demo explicitly exercises duplicate delivery and crash/retry behavior: the same event_id is processed once and a second delivery returns the prior durable result; a simulated processor timeout retries the charge step.

This confirms that duplicate delivery and retry are executable engineering concerns, while also showing that event-id deduplication addresses identity/replay and does not itself establish ordering semantics for distinct correction events.

Source:
https://github.com/resonatehq-examples/example-webhook-handler-ts

### 4. Concrete repository incident evidence
BasedHardware/omi issue #8417 documents a real codebase race involving Stripe webhook ordering and eventual consistency. The issue reports that a subscription-created event could race a checkout-completed event, and that a later stale incomplete_expired event from another attempt could downgrade user state. The proposed regression strategy explicitly calls for replaying out-of-order webhook sequences and reconciliation against Stripe.

This is concrete repository-level evidence that stale event ordering plus reconciliation can corrupt a projection when precedence/freshness is not enforced. It is not evidence of a new correction/reversal class: the failure is fundamentally stale observation/order applied to mutable projection state.

Source:
https://github.com/BasedHardware/omi/issues/8417

### 5. Independent provider corroboration
Razorpay's public webhook testing guidance explicitly states that webhook events may not arrive in the order in which they occurred and gives a payment example where payment.captured can arrive before payment.authorized. It also states that a terminal processed/reversed webhook received after the terminal state should be ignored.

Source:
https://github.com/razorpay/markdown-docs/blob/master/webhooks/validate-test.md

### 6. Event-sourcing semantic boundary
Microsoft's Event Sourcing pattern documentation states that the event store is the permanent source of information: original events are not updated; correction is represented by a new compensating event. It also warns that event delivery is typically at-least-once, so consumers must be idempotent or projections can drift.

This separates:
- immutable historical event identity/history;
- projection freshness/order;
- compensating correction events;
- duplicate delivery.

Source:
https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing

## Analysis

### A. Duplicate correction event
Example:
C0 = REFUNDED_REVERSED
C0(retry) = same logical event delivered again.

Reduction:
- same event identity => duplicate/replay;
- receiver deduplication handles repeated delivery;
- no new interaction class.

Disposition: absorbed by existing duplicate-delivery/idempotency coverage (I3/I22/I23 depending contract), not independent.

### B. Delayed correction event
Example:
REFUNDED at t1
REFUNDED_REVERSED occurs at t2
delivery of the correction is delayed and the projection remains at REFUNDED.

This is not automatically a failure. The projection is temporarily stale until authoritative correction arrives. If reconciliation later applies the correction, the semantic path is already represented by:
- correction/reversal (I19);
- stale observation/order (I21);
- reconciliation consistency (class 12).

No new class is justified merely because correction delivery is delayed.

### C. Out-of-order correction
Example:
A later correction/reversal is delivered before an earlier lifecycle event, or an older pre-correction event is redelivered after the correction.

The required discriminator is event/resource freshness, sequence, causal relation, or authoritative refetch. The provider evidence explicitly requires chronology/freshness handling. The BasedHardware/omi incident shows that stale webhook arrival can overwrite newer state when precedence is missing.

Reduction:
- if event ordering/freshness distinguishes the events => I21;
- if same event identity => duplicate;
- if correction is a valid later lifecycle transition => I19;
- if the system cannot establish whether the events are ordered, retain UNKNOWN/INCOMPARABLE rather than inventing an order.

No independent interaction found.

### D. Stale pre-correction projection racing reconciliation
This is the strongest candidate for independence.

Scenario:
1. Projection P contains pre-correction state.
2. Provider has already advanced to correction/reversal state.
3. Reconciliation R reads provider truth.
4. A stale webhook W or stale local projection write races R.
5. Without an atomic freshness/precedence guard, the stale write can overwrite the reconciled state.

Analysis:
The race combines correction/reversal with stale observation and reconciliation, but its failure mechanism is still stale-write/order against a newer authoritative observation. The correction event supplies the domain transition; it does not create a distinct concurrency primitive.

Therefore the interaction reduces to:
I19 (correction/reversal semantic transition)
+
I21 (stale observation/order)
+
class 12 (reconciliation consistency/retention)
with the protected boundary being the projection/state materialization.

No independent top-level interaction is justified.

## Important epistemic boundary

The external sources establish the semantic possibility and concrete production/codebase evidence for:
- duplicate webhook delivery;
- delayed/retried delivery;
- out-of-order delivery;
- correction/reversal after an earlier state;
- stale projection overwrite during webhook/reconciliation races.

They do NOT establish a vulnerable Nexo implementation, and no Nexo runtime race was executed.

The Resonate example is a runnable implementation demonstrating duplicate/retry handling, but it does not constitute proof of correction-order correctness.

## AB104.863R disposition

RESULT: I21 COVERAGE SUFFICIENT FOR THIS ATTACK, with I19 + reconciliation class 12 as interacting dimensions.

No new interaction class frozen.
No W19/W20 freeze.
No coverage denominator freeze.
No semantic freeze.
No formal verification.
No implementation.

New candidate invariant notes:
- INV-TE-10: a stale observation must not overwrite a newer authoritative correction/reversal state when the contract provides a comparable freshness/sequence relation.
- INV-TE-11: duplicate delivery of a correction event must be observationally idempotent.
- INV-TE-12: when correction ordering cannot be established, projection logic must preserve INCOMPARABLE/UNKNOWN rather than selecting an arbitrary winner.

These are candidate invariants only; they are not formally verified.

## Next exact research action: AB104.864R
Attack the boundary between correction/reversal and identity/incarnation reuse:
- same resource identifier reused across lifecycle/incarnation;
- old correction event arriving after resource recreation;
- provider reference reuse versus stable operation/event identity;
- reconciliation accidentally applying an old correction to a new incarnation.

Core question:
Does I18 namespace/incarnation confusion + I19 correction/reversal fully cover this, or does a distinct cross-domain interaction survive reduction?

Constraints remain unchanged:
NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED

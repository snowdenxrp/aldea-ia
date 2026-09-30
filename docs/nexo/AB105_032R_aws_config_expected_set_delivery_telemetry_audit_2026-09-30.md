# AB105.032R — AWS Config expected-set + delivery telemetry: separating no-change from delivery uncertainty
Date: 2026-09-30
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Research question

Can the documented AWS Config delivery status and CloudWatch failure metrics be combined with the conditional history-file expected-set model to distinguish “no qualifying recorded change” from “evidence delivery is uncertain”?

## Primary evidence

AWS Config's DeliveryChannelStatus exposes separate delivery information for configuration history, snapshots, and stream notifications. ConfigExportDeliveryInfo includes lastAttemptTime, lastSuccessfulTime, lastStatus, lastErrorCode/message, and nextDeliveryTime. citeturn0search0turn0search5

AWS Config's verification documentation shows that delivery status is reported through describe-delivery-channel-status, including the last successful and attempted history delivery times. citeturn0search1

AWS exposes CloudWatch success/failure metrics including Config History Export Failed, Config Snapshot Export Failed, Change Notifications Delivery Failed, and Configuration Recorder Insufficient Permissions Failure. citeturn0search3

AWS states that Config generally records detected changes promptly or at the configured frequency, but this is best effort and can take longer at times. citeturn0search7

AWS documents that a configuration history is a collection of ConfigurationItems for a resource, while the history file is delivered by resource type. citeturn0search2turn0search6

## Findings

### F1 — DeliveryChannelStatus is useful for positive delivery facts and known failure boundaries

A successful last delivery provides positive evidence that a delivery attempt succeeded at a particular time.

A failure status/error provides positive evidence of a delivery problem.

But these are not an immutable historical ledger of every delivery attempt.

Therefore:

lastSuccessfulTime -> positive bounded delivery fact

lastStatus=Failure -> positive delivery-failure fact

current Success -> not proof of all historical deliveries

### F2 — CloudWatch failure metrics strengthen historical coverage analysis

The CloudWatch metrics expose counts of failed history exports, snapshot exports, stream notifications, and recorder permission failures. citeturn0search3

For a target interval, a retained metric series can therefore establish that failures occurred or did not occur according to the metric's documented semantics and retained coverage.

However, “metric shows zero” is only useful if the metric's retention, period, dimensions, and scope cover the exact claim.

Thus:

documented metric + retained interval + correct scope -> bounded operational evidence

metric unavailable/incomplete -> UNKNOWN for claims that depend on it

### F3 — No-file + no known delivery failure is still not automatically a no-change fact

The previous node established that AWS does not send a history file when there are no configuration changes.

The new evidence adds a way to test delivery health, but it does not eliminate all epistemic dependencies.

A bounded inference requires:

- recorder coverage;
- resource-type scope;
- known recording semantics;
- expected delivery interval;
- delivery-channel evidence;
- artifact inventory;
- retention/deletion controls.

Only then can:

no expected artifact + complete coverage
-> bounded NO-RECORDED-CHANGE

be justified.

### F4 — “No failure metric” and “zero failures” are different states

If the historical metric series is unavailable, not retained, or cannot be shown to cover the interval, absence of a visible failure count is not equivalent to a documented zero.

The model must preserve:

METRIC_ZERO = observed zero under covered metric semantics

METRIC_MISSING = UNKNOWN

This prevents telemetry absence from silently becoming negative evidence.

### F5 — Best-effort recording creates another boundary

AWS explicitly describes recording as best effort and notes that recording can take longer than expected. citeturn0search7

Therefore even with a healthy delivery channel, the claim “no file means no underlying resource change” is too broad.

The defensible claim is narrower:

“no qualifying change was recorded by AWS Config within the covered semantics.”

That distinction matters because the architecture must not convert provider detection behavior into an absolute statement about reality.

### F6 — Delivery success does not prove recorder completeness

A successful history export proves delivery of what Config exported.

It does not independently prove that Config detected every underlying resource change.

Therefore:

recorder coverage -> detection/recording layer

delivery coverage -> export layer

artifact inventory -> retained-evidence layer

These must remain separate evidence dependencies.

### F7 — Stream and history are separate channels

AWS exposes separate delivery status for history files and stream notifications. citeturn0search0

A healthy history delivery channel does not automatically prove that SNS stream delivery succeeded, and vice versa.

Therefore a claim relying on one channel must not inherit completeness from the other.

## Formal three-valued decision rule

For a scope S = (account, Region, resource type, recording mode, interval):

### NO_RECORDED_CHANGE
Allowed only if:
1. recorder scope/active interval is covered;
2. recording semantics are known;
3. delivery coverage is established;
4. expected-set interpretation is valid;
5. artifact inventory is complete;
6. retention/deletion boundaries are covered;
7. no unresolved delivery/recorder failure affects the interval.

### CHANGE_EVIDENCED
Allowed when a valid ConfigurationItem/history artifact is positively bound to S.

### UNKNOWN
Required when any evidence dependency above is missing, ambiguous, or contradicted.

This is explicitly a statement about AWS Config's recorded evidence, not an absolute statement that no underlying resource operation occurred.

## Anti-collapse rules

- lastSuccessfulTime != complete historical delivery ledger;
- current Success != historical all-success;
- CloudWatch metric absent != zero failures;
- metric zero without coverage proof != universal no-failure fact;
- healthy delivery != complete recorder detection;
- no history file != absolute no resource change;
- Config recorded no change != reality had no change;
- history channel health != stream channel health;
- positive artifact != complete artifact set.

## New distilled rule

Negative evidence must be scoped to the provider observation contract.

complete recorder coverage + documented recording semantics + complete delivery coverage + expected-set + retained inventory
-> NO_RECORDED_CHANGE (bounded to AWS Config)

Anything less:
-> UNKNOWN

This is the first clean separation between:

NO_RECORDED_CHANGE
and
NO_CHANGE_IN_REAL_WORLD.

The latter remains unproven unless another independent source establishes it.

## Status ledger

- DeliveryChannelStatus as positive delivery evidence: FOUND.
- CloudWatch delivery/recorder failure metrics: FOUND.
- Conditional expected-set + delivery coverage model: ESTABLISHED IN PRINCIPLE.
- Bounded NO_RECORDED_CHANGE state: ESTABLISHED IN PRINCIPLE.
- Absolute NO_CHANGE_IN_REAL_WORLD from Config alone: REJECTED.
- Universal delivery completeness: NOT ESTABLISHED.
- Acquisition-boundary closure: NOT CLOSED GLOBALLY.
- Reconstruction: BOUNDED/PER-CLAIM ONLY.
- W19/W20: NOT FROZEN.
- Coverage denominator: NOT FROZEN GLOBALLY.
- Formal verification: NOT PERFORMED.
- Implementation: NOT STARTED.
- Architecture/semantic freeze: NOT DECLARED.
- AB50–AB58 unresolved ternary/EventDAG state: CARRIED FORWARD UNCHANGED.

## Exact next research direction

Investigate AWS Config recorder detection semantics and failure metrics at the resource-change boundary: determine what AWS guarantees when a resource changes but Config detects it late, cannot retrieve configuration because of permissions, or records related resources. The goal is to separate “not delivered,” “not recorded,” “recorded later,” and “no qualifying change detected” without collapsing them.

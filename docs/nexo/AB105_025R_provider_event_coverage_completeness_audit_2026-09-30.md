# AB105.025R — Provider event coverage is claim-specific, not universal lifecycle completeness
Date: 2026-09-30
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Research question

Can a provider explicitly documented event-logging contract turn absence of an event into a bounded negative historical fact?

## Primary evidence reviewed

AWS documents that Amazon S3 logs all control-plane operations as CloudTrail management events. AWS specifically lists bucket-level operations including CreateBucket and DeleteBucket. However, S3 object-level operations are data events and are not present in CloudTrail Event history by default. Data-event collection must be configured separately, with selectors controlling which resources and operations are captured.

CloudTrail documentation states that event selectors determine whether a trail processes an event. If an event does not match any selector, that trail does not log it. Advanced selectors can further restrict data-event collection by resource type, event name, and resource ARN.

## Findings

### F1 — A provider can document a strong event-class guarantee

For S3 bucket-level control-plane activity, AWS states that S3 logs control-plane operations as management events and identifies CreateBucket/DeleteBucket among bucket-level calls tracked by CloudTrail.

This supports a claim of the form:

provider documents event class E as CloudTrail management activity.

It does NOT automatically support:

every historical transition of resource R is reconstructible from the available CloudTrail records.

The latter requires retention, scope, and collection coverage.

### F2 — Event-class completeness differs from resource-lifecycle completeness

Suppose a query covers a resource's entire relevant account/region interval and the provider contract establishes that every CreateBucket and DeleteBucket control-plane call is recorded.

Then absence of DeleteBucket in that covered event class can support a bounded statement:

no recorded DeleteBucket event for this resource was found within the documented covered interval and scope.

That is materially stronger than ordinary event absence.

But it still does not prove that no lifecycle transition occurred through another mechanism unless the provider contract and resource semantics establish that such a transition must manifest as the covered event class.

Therefore:

event-class completeness -> bounded negative fact for that class

event-class completeness != universal lifecycle completeness

### F3 — S3 demonstrates why data-plane coverage is separate

S3 object-level actions such as GetObject/DeleteObject are data events. AWS states that data events are not logged by default and are not included in CloudTrail Event history. They require explicit configuration.

Therefore a CloudTrail Event History query cannot support a claim about absence of object-level activity.

This is a concrete demonstration that even within one resource family, lifecycle/evidence classes have different coverage contracts.

### F4 — Selectors can create silent coverage holes

CloudTrail event selectors determine which events a trail processes. AWS documents that if an event does not match any selector, the trail does not log it. Advanced selectors can filter by resource type, event name, ARN, and other fields.

Therefore the evidence model must retain selector configuration as part of the coverage proof.

A retained log without the selector configuration is insufficient to establish the denominator of possible events.

### F5 — A bounded negative fact needs four independent dimensions

For a claim such as:

“No DeleteBucket occurred for resource X during interval [t1,t2]”

the minimum safe evidence pattern is:

1. Provider/event semantics: DeleteBucket is a relevant and documented event class.
2. Target binding: the event resource identity can be bound to X.
3. Coverage: the logging configuration covers X, the account/region scope, the full interval, and the event class.
4. Retention/integrity: the retained source covers the interval and records are attributable to the claimed source.

Only when all four are established can absence become a bounded negative observation.

### F6 — The claim must be narrower than the evidence

Even with all four dimensions, the resulting statement must remain bounded:

“Within covered scope and interval, no DeleteBucket event was observed.”

It must not be upgraded to:

“X was never deleted.”

The latter additionally requires a stronger provider/resource lifecycle theorem showing that any deletion/recreation relevant to the claim necessarily produces the covered event and that no alternate lifecycle path exists.

### F7 — This closes one sub-question, not the acquisition boundary

We now have a concrete provider example showing how an event-class guarantee plus coverage can support a bounded negative fact.

This does NOT close the global acquisition-boundary problem.

A pre-acquisition historical claim still needs:
- identity/incarnation binding;
- complete relevant interval coverage;
- documented provider semantics;
- retained evidence;
- and a claim whose scope matches the evidence.

## Distilled rule

A provider event guarantee can convert absence into a bounded negative fact only when the guarantee covers the exact event class required by the claim and the evidence establishes target, scope, interval, selector, retention, and provenance coverage.

Operationally:

documented_event_class + complete_claim_coverage + target_binding + retained_integrity
-> bounded_negative_fact

missing_coverage or mismatched_event_class
-> UNKNOWN

event_class_completeness
!= lifecycle_completeness

## Anti-collapse rules

Do not collapse:

- documented event class -> complete resource history;
- management-event coverage -> data-event coverage;
- provider guarantee -> actual retained coverage;
- retained logs -> selector denominator;
- absence in Event History -> absence of data events;
- absence of DeleteBucket -> proof of never-deleted resource;
- Create/Delete event coverage -> complete configuration history;
- event ordering -> causal ordering.

## Status ledger

- Concrete provider event-class guarantee: FOUND (S3 control-plane operations).
- Bounded negative fact from documented event class + coverage: ESTABLISHED IN PRINCIPLE.
- Universal lifecycle completeness: NOT ESTABLISHED.
- Universal historical completeness across acquisition boundary: NOT CLOSED.
- Reconstruction: BOUNDED/PER-CLAIM ONLY.
- W19/W20: NOT FROZEN.
- Coverage denominator: NOT FROZEN GLOBALLY.
- Formal verification: NOT PERFORMED.
- Implementation: NOT STARTED.
- Architecture/semantic freeze: NOT DECLARED.
- AB50–AB58 unresolved ternary/EventDAG state: CARRIED FORWARD UNCHANGED.

## Exact next research direction

Investigate whether AWS Config configuration history or another provider-native state-history mechanism supplies a different kind of completeness guarantee than CloudTrail event logging. Specifically determine whether state snapshots/history can establish continuity between two observations, or whether gaps and retention still force UNKNOWN for unobserved intervals.

Do not generalize beyond documented provider semantics or observed evidence.

# AB105.034R — CloudTrail ↔ ConfigurationItem causal binding audit
Date: 2026-09-30
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Research question

What causal relationship can be reconstructed between an AWS Config ConfigurationItem and CloudTrail events, without collapsing event identity, resource identity, configuration state, and causal order?

## Primary evidence

AWS Config documents that ConfigurationItem.relatedEvents is a list of CloudTrail event IDs. Historically, a populated field indicated that the current configuration was initiated by those events; however, AWS now states that as of ConfigurationItem Version 1.3, relatedEvents is empty and LookupEvents should be used to retrieve events for the resource. AWS Config documentation confirms this current behavior. [AWS Config ConfigurationItem; AWS Config Components of a Configuration Item]

CloudTrail LookupEvents supports management-event lookup by EventId, EventName, EventSource, ResourceName, ResourceType, Username, and other attributes, with a 90-day lookup window. It returns EventId, EventName, EventSource, EventTime, Resources, and the CloudTrailEvent payload. [AWS CloudTrail LookupEvents]

CloudTrail explicitly states that its log files are not an ordered stack trace of API calls, so event order must not be interpreted as causal order merely from listing order or timestamps. [AWS CloudTrail Understanding events]

CloudTrail event records contain identifiers such as eventID and, where applicable, requestID/sharedEventID; sharedEventID can identify separate CloudTrail records generated from the same AWS action across recipient accounts. [AWS CloudTrail record contents]

## Findings

### F1 — Version 1.3 removes direct relatedEvents evidence from the CI

A current ConfigurationItem cannot be treated as carrying a populated relatedEvents causal edge merely because older schemas/documentation described that field.

Current contract:
CI.relatedEvents empty -> use CloudTrail LookupEvents/resource lookup to investigate.

Therefore a missing relatedEvents list is NOT negative causal evidence.

### F2 — LookupEvents provides candidate event evidence, not automatic causal proof

LookupEvents can retrieve events by resource name/type or exact EventId. This establishes an explicit event-resource matching mechanism.

But a resource match does not by itself prove:
- event caused the CI;
- event was the only cause;
- event caused the observed state transition;
- no other event contributed.

Therefore:
resource match != causal proof.

### F3 — EventId is event identity, not operation-state identity

CloudTrail EventId identifies the CloudTrail event record. It remains distinct from:
- ConfigurationItem identity;
- configurationStateId;
- resource incarnation identity;
- requestId;
- operationId;
- causal relation.

A single AWS action can generate separate CloudTrail records across accounts that share sharedEventID while retaining distinct eventID values.

Thus eventID equality/inequality must not be used as a universal operation-identity theorem.

### F4 — Timestamp ordering is not causal ordering

CloudTrail explicitly says its logs are not an ordered API-call stack trace.

Therefore:
eventTime < captureTime
is useful temporal evidence, but is not alone proof that the event caused the CI.

A stronger bounded causal edge requires compatible resource identity, operation semantics, temporal consistency, and provider-documented relation where available.

### F5 — CloudTrail lookup coverage is bounded

LookupEvents exposes recent management events for a Region and has a 90-day lookup window.

Therefore:
no matching event returned by LookupEvents
cannot become:
event never occurred
unless the claim's time, Region, event class, retention, and lookup coverage are fully covered by the evidence contract.

The 90-day Event History boundary must remain explicit.

### F6 — Management-event coverage is not data-event coverage

CloudTrail distinguishes management and data events, and default trails/event data stores log management events rather than data events.

Therefore a resource investigation requiring data-plane operations cannot inherit completeness from management-event lookup.

### F7 — ConfigurationItem relationships are not causal edges

AWS Config relationships describe related AWS resources. AWS explicitly notes that these relationships do not represent network-flow or data-flow dependencies.

Therefore:
CI relationship edge != CloudTrail causal edge.

A related resource can help identify candidates for event correlation, but does not prove which operation produced the observed CI.

## Causal-evidence ladder

For a candidate CI C and event E:

1. C exists -> positive configuration-state evidence.
2. E exists -> positive event evidence.
3. E references C.resource identity -> positive event-resource association.
4. E time compatible with C capture -> temporal consistency.
5. E semantics can produce the observed configuration transition -> semantic compatibility.
6. provider/documented relation -> stronger causal evidence.
7. complete competing-event coverage -> strengthens exclusion of alternative causes.

Only layers 1–3 are not sufficient for a causal claim.

The architecture must preserve:
EVENT_EVIDENCED
RESOURCE_ASSOCIATED
TEMPORALLY_COMPATIBLE
CAUSALLY_BOUND
CAUSALITY_UNKNOWN

## Refined decision rules

- Current CI.relatedEvents empty -> UNKNOWN causal linkage, not “no event.”
- Exact EventId lookup hit -> EVENT_EVIDENCED.
- Event references target resource -> RESOURCE_ASSOCIATED.
- Compatible time -> TEMPORALLY_COMPATIBLE.
- Semantics + provider relation + sufficient competing-event coverage -> bounded CAUSALLY_BOUND.
- Missing retention/coverage -> CAUSALITY_UNKNOWN.
- Multiple related CIs -> do not count as multiple causal operations.

## New distilled rule

CloudTrail can provide event identity and resource-associated evidence; causal binding requires an additional claim-specific relation.

CI state + CloudTrail event + resource identity binding + temporal compatibility + operation semantics + coverage of plausible alternatives
-> potentially BOUNDED_CAUSAL_BINDING

Without those dependencies:
CAUSALITY_UNKNOWN.

## Anti-collapse rules

- CI.relatedEvents empty != no initiating event.
- EventId != CI identity.
- EventId != resource incarnation.
- EventId != requestId.
- requestId != universal operation identity.
- ResourceName match != causal proof.
- EventTime order != causal order.
- CloudTrail management coverage != data-event coverage.
- LookupEvents no-hit != event never occurred.
- CI relationship != causal event edge.
- Multiple CIs != multiple operations.
- Multiple CloudTrail records != necessarily multiple operations.

## Status ledger

- Current relatedEvents Version 1.3 limitation: FOUND.
- LookupEvents resource/EventId retrieval: FOUND.
- Event ordering limitation: FOUND.
- Event/resource identity separation: FOUND.
- Management vs data-event boundary: FOUND.
- CI relationship vs causal relation separation: FOUND.
- Universal CI↔CloudTrail causal reconstruction: NOT ESTABLISHED.
- Universal negative inference from LookupEvents no-hit: REJECTED.
- Acquisition-boundary closure: NOT CLOSED GLOBALLY.
- Reconstruction: BOUNDED/PER-CLAIM ONLY.
- W19/W20: NOT FROZEN.
- Coverage denominator: NOT FROZEN GLOBALLY.
- Formal verification: NOT PERFORMED.
- Implementation: NOT STARTED.
- Architecture/semantic freeze: NOT DECLARED.
- AB50–AB58 unresolved ternary/EventDAG state: CARRIED FORWARD UNCHANGED.

## Exact next research direction

AB105.035R: investigate CloudTrail requestID, sharedEventID, serviceEventDetails, and operation-specific correlation semantics across concrete AWS services. Determine when these identifiers provide a bounded operation edge and when they remain only event-level correlation, especially across cross-account delivery and service-generated events.

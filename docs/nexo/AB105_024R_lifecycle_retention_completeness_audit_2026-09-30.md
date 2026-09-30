# AB105.024R — Lifecycle retention and the completeness gap
Date: 2026-09-30
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Research question

Can retained provider-side lifecycle evidence establish a complete creation→management→deletion/recreation chain, and when does absence of a recorded event justify UNKNOWN rather than a negative historical claim?

## Primary evidence reviewed

AWS CloudTrail Event history provides a searchable, downloadable, immutable record of management events for the previous 90 days, scoped to an AWS Region. AWS explicitly states that Event history is limited to 90 days and that events after that period are no longer shown. It also states that Event history does not show data events.

CloudTrail Lake event data stores can retain selected event categories for substantially longer periods, but retention depends on the configured store, event selectors, region/account scope, and retention period. AWS states that events occurring before an event data store was created are not present unless eligible trail events are explicitly copied into it.

AWS also documents that reducing an event data store's retention period removes events older than the new retention period.

## Findings

### F1 — Retention is not the same as completeness

A retained event store proves that some events within its configured scope and retention policy are available. It does not, by itself, prove that every lifecycle event relevant to a resource was captured.

Therefore:

retained_events != complete_lifecycle_history

Completeness requires an explicit coverage argument for the claim.

### F2 — The ordinary CloudTrail Event history cannot close long historical gaps

The default Event history window is 90 days and is regional. Therefore a resource acquired today cannot have its entire earlier lifecycle reconstructed from Event history if relevant events fall outside that window.

Absence from that view means only that the event is not available in that queryable window; it does not establish that the event never occurred.

### F3 — A long-retention store still has a configuration boundary

CloudTrail Lake can retain events for years, but the store only contains events matching its configured collection scope. AWS states that events from before creation are absent unless copied from an existing trail, and copied events are themselves constrained by the configured retention period.

Thus:

long_retention != complete_prior_history

The historical coverage interval must be established independently.

### F4 — Event absence is epistemically asymmetric

Positive evidence:

event_found + valid identity binding + valid semantics
-> observed lifecycle fact

Negative observation:

event_not_found
-> only an UNKNOWN/UNOBSERVED result unless the query scope provides a justified completeness guarantee for the claim.

The search space may be limited by region, account, event category, selectors, retention, or store creation time.

### F5 — Complete chain requires more than adjacent events

A useful chain is:

create -> management/update -> acquisition/import -> later observation -> delete/recreate

But even if create and delete are found, intermediate state is not automatically reconstructed. Conversely, finding acquisition/import and current state does not prove the pre-acquisition lifecycle.

The evidence model therefore needs both event identity and interval coverage.

### F6 — Provider-native history and CloudFormation management history have different roles

CloudTrail records API/management activity in its configured scope; CloudFormation records stack/resource lifecycle semantics and operation correlation for resources managed by the stack.

Neither source should be treated as a universal history oracle.

A safe composition is:

provider event evidence
+ CloudFormation lifecycle/operation evidence
+ resource identity semantics
+ coverage proof
= bounded historical reconstruction

Without coverage proof, the result remains bounded or UNKNOWN.

### F7 — The acquisition boundary remains open when prior coverage is missing

If a resource is imported at t2 and the earliest retained provider evidence begins at t2, then the model can establish:

management_relationship_start = t2

and current observations after t2.

It cannot establish the complete pre-t2 lifecycle.

Therefore:

pre_acquisition_history -> retained evidence | UNKNOWN

remains the correct boundary rule.

## Minimum completeness contract

For a historical claim that says “no deletion/recreation occurred during interval [t1,t2],” the evidence must establish at least:

1. source/provider and account/tenant scope;
2. region/scope coverage;
3. event-category coverage;
4. retention interval covering [t1,t2];
5. collection/selector configuration relevant to the lifecycle events;
6. identity/incarnation binding for the target;
7. integrity/provenance of the retained records;
8. an explicit provider guarantee or justified completeness argument that absence of the relevant event is meaningful.

If these cannot be established, absence must not be promoted to a negative historical fact.

## Anti-collapse rules

Do not collapse:

- retention period -> completeness;
- event store existence -> historical coverage;
- event absence -> event non-occurrence;
- CloudTrail history -> complete resource lifecycle;
- CloudFormation management history -> provider-wide history;
- import event -> pre-import history;
- current resource state -> continuous historical state;
- timestamp sequence -> causal completeness.

## New distilled rule

A lifecycle record is positive evidence; absence becomes negative evidence only when the evidence source supplies a claim-specific completeness guarantee covering the relevant scope and interval.

Operationally:

event_found + identity + semantics -> observed_fact

event_missing + incomplete_coverage -> UNKNOWN

event_missing + claim-specific completeness_guarantee -> bounded_negative_fact

The completeness guarantee must itself be evidenced; it cannot be assumed from retention alone.

## Status ledger

- Provider lifecycle evidence as positive historical evidence: FOUND.
- Retention/completeness distinction: FOUND.
- Event absence as automatically proving non-occurrence: REJECTED.
- Claim-specific completeness contract: REQUIRED, NOT YET GENERICALLY ESTABLISHED.
- Acquisition-boundary closure: NOT CLOSED GLOBALLY.
- Reconstruction: BOUNDED/PER-CLAIM ONLY.
- W19/W20: NOT FROZEN.
- Coverage denominator: NOT FROZEN.
- Formal verification: NOT PERFORMED.
- Implementation: NOT STARTED.
- Architecture/semantic freeze: NOT DECLARED.
- AB50–AB58 unresolved ternary/EventDAG state: CARRIED FORWARD UNCHANGED.

## Exact next research direction

Investigate a concrete provider lifecycle where the provider explicitly documents which events are guaranteed to be emitted, retained, and queryable, and determine whether that contract is sufficient to turn event absence into a bounded negative historical fact. Separate “all events of this class are captured” from “all lifecycle transitions of this resource are captured.”

Do not generalize beyond documented provider semantics or observed evidence.

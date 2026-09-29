# AB104.938R — stale projection with local concurrency rejection and external effect audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Can a downstream stale projection combined with local optimistic-concurrency rejection and an external side effect create an interaction independent from I21/I19/class 11/12?

## Fresh evidence
Microsoft Event Sourcing documents eventual consistency of materialized views, at-least-once consumer delivery, optimistic concurrency that can reject an append when an event stream changed, and the need for application-level reconciliation for conflicts spanning multiple entities. It also explicitly warns that external side effects such as payments or notifications can be duplicated when consumer idempotency is absent. Microsoft Saga guidance documents lost updates, fuzzy reads, semantic locks, rereads, and version files as defenses against cross-service anomalies. AWS Event Sourcing likewise describes projection lag and collision handling through versioning/timestamps. These sources establish the composite pattern but do not establish a new interaction class.

## Scenario
P2 reads stale projection v0.
P1 updates authoritative state and commits arbitration A.
P2 attempts local write C2 using stale version v0.
Local optimistic concurrency rejects C2.
Before or independently of that rejection, an external provider receives effect request E2.
Provider outcome is CONFIRMED or UNKNOWN.
Later reconciliation sees the local rejection and provider evidence.

## Findings
1. Local rejection proves only the local concurrency condition at the checked boundary. It does not, by itself, prove the external provider did not receive or commit E2.
2. If E2 is confirmed, the historical effect remains even though the local command was rejected. This is a split-boundary outcome, not a rollback of history.
3. If provider outcome is UNKNOWN, local rejection cannot collapse UNKNOWN to FAILED.
4. If provider confirms no effect using authoritative evidence, the local rejection and provider non-execution can jointly close the uncertainty; neither fact alone is sufficient.
5. The stale projection explains decision context but does not itself determine authority or effect outcome.
6. If the local write and external effect are intended to be one atomic action, their separation is a cross-domain atomicity boundary (class 20), but this is not a new class created by stale projections.
7. If a retry uses the same logical operation identity, provider idempotency scope must be explicit. If a new operation identity is used, it must not silently overwrite the prior UNKNOWN/effect record.
8. A later compensation is a new operation/effect and must carry its own identity, authority, target, lifecycle, idempotency and outcome.
9. If both the local rejection and external effect are independently authoritative, preserve both as facts with provenance linking the decision context and effect path.
10. No evidence found that this composite requires a new top-level interaction. It is a particularly important cross-boundary witness of existing classes.

## Representation
P2(observed=v0)
A commits at v1
C2(local append expected=v0) -> REJECTED
E2(provider submission)
E2 -> CONFIRMED or UNKNOWN
RECONCILIATION(C2,E2)
If confirmed: EFFECT-2 remains fact.
If unknown: UNKNOWN remains until authoritative resolution.
If no-effect evidence: UNKNOWN -> FAILED only through authoritative evidence/contract.

## Anti-collapse rules
LOCAL_REJECTION != PROVIDER_NON_EXECUTION
STALE_PROJECTION != EFFECT_ABSENCE
LOCAL_COMMIT_REJECTION != GLOBAL_OPERATION_REJECTION
UNKNOWN != FAILED
NEW_OPERATION != RETRY_OF_OLD_OPERATION
RETRY != HISTORY_REWRITE
COMPENSATION != ERASURE
PROVIDER_EFFECT != LOCAL_STATE_COMMIT

## Classification
Primary: I21 stale observation/order; I19 provenance/causal uncertainty; class 11 external-effect ambiguity.
When the local and external boundaries are one intended operation: class 20 cross-domain atomicity boundary.
I15/I22 for idempotency/retry, I24 for in-progress transitions, I9 for authority-generation boundaries.
No new top-level class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
This is a stronger concrete witness of why local optimistic concurrency cannot be treated as an external-effect oracle. The correct Nexo model must preserve local rejection, external outcome, stale decision context, and reconciliation as separate evidence dimensions. The interaction remains covered by existing classes, with class 20 explicitly relevant when atomicity across the local and external domains is the claimed invariant.

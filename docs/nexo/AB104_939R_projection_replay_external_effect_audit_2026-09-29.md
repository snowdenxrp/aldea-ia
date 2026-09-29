# AB104.939R — projection replay/rebuild with external side-effect boundary audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Can rebuilding or replaying a stale projection after arbitration create an independent interaction when the projection has already produced external effects?

## Fresh evidence
Microsoft Event Sourcing states that event streams are the permanent source of information, projections are eventually consistent, and compensating changes are new events rather than edits to history. It also states that event delivery is typically at-least-once and consumers must be idempotent; otherwise duplicate deliveries can trigger side effects such as payments or notifications. AWS Event Sourcing warns that replay can interact dangerously with external systems when replayed events cause external updates, and recommends controlling such updates. AWS Saga guidance documents eventual consistency, retries, lack of transaction isolation, and stale data during concurrent orchestration.

## Scenario
Projection P processed events through version v0 and produced external effect E1.
Arbitration A later appears at v1 and changes the semantic interpretation of the history.
P is rebuilt/replayed from the event stream.
During replay it reaches the old event again.
Possible outcomes:
- replay only reconstructs internal state;
- replay accidentally repeats E1;
- replay emits a new effect E2;
- replay is interrupted after E2 but before its checkpoint advances;
- replay is retried and may produce E2 again.
A second consumer may independently rebuild from a different checkpoint.

## Findings
1. Projection reconstruction is not historical re-execution unless implementation deliberately couples replay to external effects.
2. The event stream remains the historical source; rebuilding a projection does not erase prior E1.
3. If replay emits an external effect, that effect is a new execution/effect and requires its own operation/effect identity and provenance. It cannot be treated as the original event occurring again merely because the source event is the same.
4. A replay crash after external effect but before checkpoint update creates a progress/effect boundary. On restart, duplicate execution is possible unless the external operation is idempotent or deduplicated.
5. If E2 is UNKNOWN, checkpoint state cannot collapse UNKNOWN to FAILED; reconciliation must use authoritative external evidence.
6. Later arbitration does not retroactively authorize or erase an already-produced E1. Any new replay behavior is governed by the replay operation's explicit policy and authority.
7. If replay is intentionally allowed to generate external effects, replay needs explicit effect policy, identity derivation, side-effect suppression or deduplication, and audit provenance. Without these, replay can create duplicate or unintended effects.
8. A second projection rebuilding from another checkpoint can produce a different external-effect history. The checkpoint is evidence of consumer progress, not a global effect boundary.
9. If an external effect is generated during replay from a historical event, temporal proximity to the original event does not prove causal identity with E1.
10. The scenario composes existing dimensions: I21 stale/order, I15/I22 retry/idempotency, class 11 external-effect ambiguity, class 12 reconciliation, and class 20 cross-domain atomicity when checkpoint persistence and external effect are intended as one atomic boundary. I19 applies to provenance/causal attribution. I24 applies if replay/remediation remains in progress across an authority transition.
11. No new top-level class is justified by current evidence.

## Representation
HISTORY: E0 -> E1
ARBITRATION: A(v1)
REPLAY: R1
R1 -> EFFECT-2
CHECKPOINT(R1)=v0 before crash
RETRY(R1) -> possible EFFECT-3
If EFFECT-2 or EFFECT-3 outcome is UNKNOWN, preserve UNKNOWN until authoritative evidence.
If compensation occurs, record a new operation/effect and explicit COMPENSATES relation.

## Anti-collapse rules
REPLAY != ORIGINAL_EXECUTION
SAME_SOURCE_EVENT != SAME_EFFECT_IDENTITY
CHECKPOINT != EFFECT_COMMIT
CHECKPOINT_ADVANCEMENT != PROVIDER_NON_EXECUTION
REPLAY_COMPLETED != EXTERNAL_EFFECT_ABSENT
ARBITRATION != HISTORY_REWRITE
REPLAY_POLICY != HISTORICAL_AUTHORIZATION
DUPLICATE_REPLAY != NEW_HISTORY_OF_ORIGINAL_EVENT
UNKNOWN != FAILED

## Classification
Primary: I21, I19, I15/I22, class 11 and class 12.
Class 20 applies when replay progress and external effect are claimed to be one atomic action.
I24 applies to in-progress replay/remediation across authority/context transitions.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
Projection replay is a critical boundary because a historical event can be intentionally replayed without being a new historical occurrence, while any external side effect produced by the replay is a new effect. Nexo must therefore separate source-event identity, replay-operation identity, effect identity, consumer checkpoint, and external outcome. Current evidence supports existing interaction families rather than a new top-level class.

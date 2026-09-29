# AB104.940R — replay after projection schema/logic change and deduplication horizon audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does replaying historical events after a projection logic/schema change, when prior external effects are outside the deduplication horizon, create a new interaction class?

## Fresh evidence
Microsoft Event Sourcing states that event data is immutable, schema evolution may require upcasters during replay, projections can be regenerated from historical events, and at-least-once delivery requires idempotent consumers. Microsoft Idempotent Consumer guidance states that a duplicate may arrive after an acknowledgement or consumer failure, and that external side effects cannot be made exactly-once merely by broker semantics; it recommends durable deduplication and explicitly recognizes the failure window between an external effect and recording its completion. Microsoft Event Hubs resilience guidance similarly notes that checkpoint loss causes replay and that an already-successful outgoing request can be followed by retries when its acknowledgement is lost.

## Scenario
At T1, historical event E0 is consumed under projection logic L1 and produces external effect F1.
At T2, the projection is upgraded to L2 or an upcaster U2 and rebuilt from E0.
The old deduplication record for F1 has expired or is unavailable.
Replay produces an external request F2.
The provider may:
- deduplicate F2 because provider identity is still valid;
- execute F2 as a second effect;
- return UNKNOWN.
A later reconciliation discovers that the replay happened after the historical effect.

## Findings
1. Schema/version change does not change the identity or historical existence of E0 or F1.
2. Upcasting changes how historical data is interpreted for the new projection; it does not retroactively rewrite the original effect.
3. Expired local deduplication evidence means the consumer can no longer safely infer that F2 is a duplicate from local memory alone.
4. Deduplication expiry is not evidence that F1 did not occur.
5. If F2 uses a new operation/effect identity, it is a new effect even if generated from the same source event.
6. If F2 deliberately reuses the old external idempotency identity, whether it deduplicates depends on the provider's scope and retention contract; local expiry cannot establish provider behavior.
7. If F2 is UNKNOWN, replay completion and checkpoint advancement cannot collapse UNKNOWN to FAILED.
8. If F2 is confirmed as a second effect, both F1 and F2 remain historical facts; correction/compensation must be represented as additional operations/effects.
9. If replay logic changes semantic intent, the replay operation needs explicit authority/policy. Historical authorization of E0 does not automatically authorize a newly emitted external effect F2.
10. A replay after a long interval can therefore combine I15 temporal idempotency horizon, I21 stale/order, I19 provenance/causal attribution, class 11 external-effect ambiguity, class 12 reconciliation, and class 20 when replay progress and external effects are claimed to be one atomic boundary.
11. The evidence does not justify a new top-level interaction class.

## Representation
E0 --(L1)--> F1
dedup(F1) expires
L2/U2 replay(E0) -> R2 -> F2
F2 = CONFIRMED | UNKNOWN
If confirmed and distinct: F1 and F2 both remain facts.
If compensation is needed: C -> F3 with explicit COMPENSATES(C,F2/F1).

## Anti-collapse rules
SCHEMA_VERSION != OPERATION_IDENTITY
UPCAST != HISTORY_REWRITE
DEDUP_EXPIRY != EFFECT_ABSENCE
SAME_SOURCE_EVENT != SAME_EFFECT
REPLAY != ORIGINAL_EXECUTION
LOCAL_DEDUP_MISS != PROVIDER_NONEXECUTION
CHECKPOINT != EFFECT_COMMIT
UNKNOWN != FAILED
HISTORICAL_AUTHORIZATION != NEW_REPLAY_EFFECT_AUTHORIZATION

## Classification
Primary: I15/I22, I21, I19, class 11 and class 12.
Class 20 applies where replay progress and external effect are intended as one atomic boundary.
I24 applies when replay/remediation remains in progress across an authority/context transition.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
Replay after schema or logic evolution exposes a particularly important retention boundary: a consumer can lose local deduplication evidence while the historical effect remains real. The safe model preserves event identity, replay identity, effect identity, provider idempotency scope, deduplication horizon, checkpoint state, and external outcome separately. Current evidence still reduces the scenario to existing interaction families.

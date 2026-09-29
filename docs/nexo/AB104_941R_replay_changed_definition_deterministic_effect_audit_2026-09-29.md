# AB104.941R — replay under changed projection definition and deterministic side-effect boundary audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If a projection/replay definition changes after an earlier external effect, can deterministic replay semantics or a fresh checkpoint prove that the old external effect should not be repeated?

## Fresh evidence
Microsoft's Event Sourcing guidance states that replay reconstructs state from immutable events, that consumers commonly receive events at least once, and that handlers must be idempotent to avoid repeated side effects. Microsoft also documents checkpoint/replay behavior in stream processing: after failure, processing can resume from the last checkpoint and reprocess events, while end-to-end exactly-once depends on the output destination. AWS event-sourcing guidance explicitly warns that replay can unintentionally update external systems and recommends controlling external updates. AWS Durable Execution guidance requires replayed workflow code to be deterministic and places nondeterministic/external side effects inside durable operations rather than directly in replayed code.

## Scenario
At T1, projection definition L1 processes E0 and produces external effect F1.
At T2, L1 is replaced by L2.
At T3, the consumer restarts from checkpoint C0 and replays E0 under L2.
L2 may:
- produce no external effect;
- intentionally produce F2;
- produce F2 but crash before checkpoint C1;
- retry and produce another attempt;
- consult current external state and therefore diverge from the historical run.

## Findings
1. Deterministic replay constrains replayed computation; it does not make an external effect identical to a prior effect.
2. A changed projection definition is a new execution context. The historical event E0 retains its identity.
3. A checkpoint identifies consumer progress, not the external provider's committed-effect state.
4. If L2 produces an external effect, that effect needs its own operation/effect identity and explicit replay authority/policy.
5. A fresh checkpoint after replay does not prove that no duplicate external effect occurred before the checkpoint.
6. If replay invokes external APIs directly, current external state/time can make replay nondeterministic; the safer boundary is to isolate external side effects from replayed computation or route them through explicit durable/idempotent operations.
7. If the external effect is UNKNOWN, deterministic replay and checkpoint advancement cannot convert UNKNOWN to FAILED.
8. If L2 deliberately changes semantic behavior, the new behavior must not be interpreted as evidence that F1 was historically wrong, absent, or unauthorized.
9. If F2 is confirmed, F1 and F2 remain distinct historical facts unless authoritative provider evidence establishes deduplication/identity equivalence.
10. If L2 is intended only to rebuild internal state, external side effects should be suppressed by explicit policy; otherwise replay can create unintended historical fan-out.
11. The scenario remains within I15/I22, I21, I19, I24 where applicable, class 11, class 12, and class 20 at the replay/effect boundary. No new top-level class is justified.

## Representation
E0 -> historical F1 under L1
L2 + checkpoint C0 -> replay R2
R2 -> F2 (CONFIRMED | UNKNOWN | no-effect)
checkpoint C1 records replay progress
If F2 occurs, preserve F1 and F2 separately.
If F2 compensates F1, record a new compensation operation/effect and explicit relation.

## Anti-collapse
DETERMINISTIC_REPLAY != SAME_EFFECT
CHECKPOINT != EFFECT_PROOF
FRESH_CHECKPOINT != PRIOR_NONEXECUTION
SCHEMA/LOGIC_VERSION != OPERATION_IDENTITY
REPLAY != HISTORICAL_REEXECUTION
REPLAY_POLICY != HISTORICAL_AUTHORIZATION
CURRENT_EXTERNAL_STATE != HISTORICAL_STATE
UNKNOWN != FAILED
COMPENSATION != ERASURE

## Classification
Primary: I21, I19, I15/I22, class 11, class 12.
Class 20 applies where replay checkpoint and external effect are treated as one atomic boundary.
I24 applies when replay/remediation crosses an authority or context transition.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
The critical boundary is not merely whether replay is deterministic. The boundary is whether replayed computation is allowed to produce an external effect, and how that effect is identified, authorized, deduplicated, and reconciled. A deterministic replay can still create a distinct real-world effect; a fresh checkpoint can still coexist with UNKNOWN or duplicated external outcomes.

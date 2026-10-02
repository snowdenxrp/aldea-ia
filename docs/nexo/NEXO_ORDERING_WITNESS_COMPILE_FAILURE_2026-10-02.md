# Ordering witness compile failure — 2026-10-02

## Verified failure
Run: 37042188881
Job: 110954753077
Workflow: NEXO AB105 G0 Kafka Bootstrap
Job reached execution and exposed the actual compiler failure.

Compilation itself reached :server:compileTestJava and failed in the temporary frozen harness:
- NexoG0RuntimeTest.java:151 — NewTopic(TOPIC, 1, ...) passed ResourceType.TOPIC instead of the String topic name.
- line 180 — ResourcePattern(TOPIC, TOPIC, LITERAL) passed ResourceType.TOPIC as the resource name.
- line 188 — same ResourcePattern resource-name error.

The exact correction is to use TOPIC_NAME as the second/new-topic name argument:
- new NewTopic(TOPIC_NAME, 1, (short) 1)
- new ResourcePattern(TOPIC, TOPIC_NAME, LITERAL).toFilter()
- new ResourcePattern(TOPIC, TOPIC_NAME, LITERAL)

## Epistemic classification
This is a CONFIRMED harness compilation defect.
It is NOT a Kafka behavior result.
No NEXO_ORDER W1/ENQUEUE/DEQUEUE/R1 evidence was emitted.
The run did not execute the real-broker witness.

## Method boundary
AB105.116R remains unchanged.
AB105.117R remains not created.
TLC remains not rerun.
PR #94 remains draft/not merged.
Do not infer ordering from this failure.

## Next action
Apply the exact harness-only correction to the executable workflow, rerun the real-broker witness, and inspect raw NEXO_ORDER events. No production Kafka source change is required for this correction.

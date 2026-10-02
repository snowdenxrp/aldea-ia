# NEXO AB105 G0 — executable harness audit (2026-10-02)

## Epistemic state
- AB105.116R: UNCHANGED.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.
- Real broker ordering witness: NOT EXECUTED.
- NEXO_ORDER evidence: NONE.
- W1 -> R1: UNKNOWN.

## Finding
PR #94's executable ordering workflow (`.github/workflows/nexo-ab105-g0-ordering-witness.yml`) writes `NexoG0OrderingWitnessTest.java` directly into the pinned Kafka checkout. The generated source contains a type/name collision:

- `TOPIC` is declared as `ResourceType.TOPIC`.
- The topic string is separately declared as `TOPIC_NAME` in the corrected design.
- The executable draft instead passes `TOPIC` where Kafka APIs require the topic name string.

Required corrections in the generated harness:

- `new NewTopic(TOPIC_NAME, 1, (short) 1)`
- `new ResourcePattern(TOPIC, TOPIC_NAME, LITERAL)`
- `new ResourcePattern(TOPIC, TOPIC_NAME, LITERAL).toFilter()`

## Adapter finding
The PR also adds workflow-local `AclBindingFilter` and `AccessControlEntryFilter` adapters under `server/src/test/java/org/apache/kafka/server/`. These do not correct the TOPIC/TOPIC_NAME errors and do not alter Kafka production semantics. They are unnecessary if the harness imports and uses Kafka's common ACL filter classes directly.

## v2 execution blocker
The v2 workflow attempts to read another workflow file from Python using a literal `${GITHUB_WORKSPACE}` inside a single-quoted shell heredoc. Shell expansion is therefore disabled, and Python receives the literal string. The v2 runner is consequently NOT validated as executable.

## Method boundary
No failed/no-job Actions run is treated as broker evidence. No cache-identity or authorize-snapshot diagnostic is repeated. The intended witness remains:

`D0 -> W1 -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION`

with D0 explicitly distinguished from local W1.

## Next action
A corrected executable workflow/harness must be run against Kafka pin `99b940733a9f6bc409457dba7108f08421d81e42`. Only raw `NEXO_ORDER` events from that execution can establish the observed ordering witness.
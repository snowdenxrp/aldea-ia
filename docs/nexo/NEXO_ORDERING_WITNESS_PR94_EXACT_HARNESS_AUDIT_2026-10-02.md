# NEXO AB105 G0 — ordering workflow exact-source audit (2026-10-02)

## New confirmed finding
The exact PR #94 ordering workflow still contains the same executable harness defect despite the prior runtime-fix branch existing elsewhere.

In `NexoG0OrderingWitnessTest.java` it declares:
- `private static final String TOPIC = "nexo-g0-ordering";`
- static import `ResourceType.TOPIC`

and then uses `TOPIC` in both positions of `ResourcePattern(TOPIC, TOPIC, LITERAL)`. The first position requires the resource type; the second requires the topic-name String. Because the names collide, the actual failed run resolved the affected `TOPIC` references incorrectly.

The same workflow also constructs `new AclBindingFilter(...)` and references `AccessControlEntryFilter.ANY` without importing those common ACL filter classes.

## Important consequence
The existence of branch `nexo-ab105-g0-runtime-api-fix-v2` does not repair PR #94. Its corrected harness is a separate earlier experiment and measures the frozen A1/D0/D1/D2/E scenario, not the ordering witness. No code from that branch is treated as evidence for W1 -> R1.

## Required minimal correction to PR #94 harness
Use distinct identifiers:
- `private static final String TOPIC_NAME = "nexo-g0-ordering";`
- static `ResourceType.TOPIC` for the resource type
- `new NewTopic(TOPIC_NAME, 1, (short) 1)`
- `new ResourcePattern(TOPIC, TOPIC_NAME, LITERAL)`
- `new ResourcePattern(TOPIC, TOPIC_NAME, LITERAL).toFilter()`

and import:
- `org.apache.kafka.common.acl.AclBindingFilter`
- `org.apache.kafka.common.acl.AccessControlEntryFilter`

## Epistemic state
- AB105.116R: UNCHANGED.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.
- Real broker ordering witness: NOT EXECUTED.
- Raw NEXO_ORDER evidence: NONE.
- W1 -> R1: UNKNOWN.

No historical runtime-fix result is promoted to ordering evidence.
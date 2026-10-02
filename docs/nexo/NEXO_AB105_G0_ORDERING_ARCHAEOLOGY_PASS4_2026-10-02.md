# NEXO AB105 G0 — archaeology pass 4: historical search closure and next minimal path

Date: 2026-10-02

## Search result

Repository-wide searches for RequestChannel, KafkaRequestHandler, NEXO_ORDER, AUTH_ENTER and AUTH_DECISION in aldea-ia found no additional historical implementation outside PR #94's ordering workflow. Therefore there is no recovered prior queue-instrumented runtime to reuse.

## External Kafka source cross-check

The current Apache Kafka source confirms the server wiring: BrokerServer constructs the data-plane RequestChannel and request-handler pool, and KafkaApis handles requests received through that channel. This supports the architectural meaning of PR #94's ENQUEUE/DEQUEUE probes, but it is not evidence that the pinned 99b9407... experiment executed those probes. citeturn0search0turn0search1

## PR #94 v2 blocker remains real

The v2 workflow extracts the Java harness using:
\`Path("\${GITHUB_WORKSPACE}/.github/workflows/nexo-ab105-g0-ordering-witness.yml")\`
inside a single-quoted Python heredoc. Shell expansion therefore does not occur, so Python receives the literal \`\${GITHUB_WORKSPACE}\`. The continuity record already identified this and no successful v2 execution should be inferred.

## Current evidence closure

1. PR #91: successful real Kafka runtime, but D1 authorization was a direct \`authorize()\` call. Not queue ordering.
2. PR #84: real Producer D1 was executed, but the expected target authorization callback was not observed and the test failed. Not a complete R1 witness.
3. PR #94: contains the required W1/ENQUEUE/DEQUEUE/AUTH_ENTER/AUTH_DECISION instrumentation, but no successful raw execution has been recovered; original compile defect is known and v2 has a separate path-extraction defect.
4. No older aldea-ia workflow with the complete real-RPC + RequestChannel event chain was found.

## Decision

The archaeology phase is exhausted for historical reuse. The next scientifically justified action is a MINIMAL CORRECTED PR #94 execution, not another archaeology loop.

Required corrections only:
- use a distinct \`TOPIC_NAME\` String for topic creation/resource name;
- use \`ResourceType.TOPIC\` only for the resource-type argument;
- ensure all ACL filter imports resolve to Kafka's common ACL classes;
- fix v2 path extraction only if v2 is used; otherwise prefer the primary workflow;
- retain workflow-local instrumentation;
- retain real Producer D1;
- capture raw log + artifact;
- do not alter AB105.116R;
- do not create AB105.117R;
- do not rerun TLC.

## Acceptance criteria

A successful execution must show, for the same real D1 request:
\`ACL_W1 → ENQUEUE → DEQUEUE → AUTH_ENTER → AUTH_DECISION\`.

Timestamps are diagnostic. The event sequence can establish observed execution order within the instrumented run, but it does not by itself prove a language-level JMM happens-before edge between W1 and R1. Any stronger causal claim remains UNKNOWN unless the complete synchronization/publication path is demonstrated.

No stale-authorization or exploitability conclusion is permitted from this experiment alone.

## Epistemic state

Historical evidence: 🟢 separated by semantics.
Historical ordering witness: 🔴 absent.
Need for new run: 🟢 justified.
W1→R1 HB: UNKNOWN.
Stale visibility: UNKNOWN.
Exploitability/security impact: UNKNOWN.

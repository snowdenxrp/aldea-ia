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


## PASS 5 — minimal harness correction applied
Commit: 40ca7ad58415f301f08f32d0bde1a4431e00baed.

Applied only executable-harness corrections to PR #94 workflow:
- renamed topic-name constant to TOPIC_NAME;
- retained ResourceType.TOPIC as the resource type;
- corrected NewTopic(TOPIC_NAME,...);
- corrected ResourcePattern(TOPIC, TOPIC_NAME, LITERAL) and its filter;
- added imports for AclBindingFilter and AccessControlEntryFilter.

No Kafka production source was changed. AB105.116R remains untouched; AB105.117R not created; TLC not rerun.

### Execution boundary after correction
The branch head is now 40ca7ad... and PR #94 remains draft. The available GitHub connector cannot dispatch a workflow or enumerate push-triggered runs; its commit-run wrapper is PR-triggered only. A zero result from that wrapper is therefore NOT evidence that the push workflow did or did not execute.

Combined commit status currently returns no statuses. Consequently no raw NEXO_ORDER evidence is promoted and the ordering result remains UNKNOWN.

### External source sanity check
Kafka's request path is consistent with the intended probe: the network layer creates a Request and calls requestChannel.sendRequest(req), while KafkaRequestHandler receives a RequestChannel.Request and calls apis.handle(request,...). This supports the probe locations but is not experimental evidence for W1→R1. See Apache Kafka source references retrieved during this pass.

## NEXT
If raw Actions run/job/artifact data becomes accessible, inspect it immediately. Otherwise the next blocker is tooling, not scientific ambiguity: the corrected workflow exists and is ready, but execution cannot be verified from the available connector. Do not infer a result from the commit alone.

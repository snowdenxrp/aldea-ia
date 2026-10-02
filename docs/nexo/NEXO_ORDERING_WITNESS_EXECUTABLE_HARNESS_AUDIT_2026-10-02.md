# NEXO AB105 G0 — executable harness audit (2026-10-02)

## Epistemic state
- AB105.116R: UNCHANGED.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.
- Real broker ordering witness: NOT EXECUTED.
- NEXO_ORDER evidence: NONE.
- W1 -> R1: UNKNOWN.

## New source-level finding
The exact PR #94 ordering workflow hardcodes the test harness in a heredoc. The harness has a name collision between the topic-name constant and the static import of ResourceType.TOPIC.

The executable draft contains:
- private static final String TOPIC = "nexo-g0-ordering";
- import static org.apache.kafka.common.resource.ResourceType.TOPIC;

The actual failed compilation already established that TOPIC was resolved as the resource-type value at the affected call sites. Therefore the safe correction is to use distinct names everywhere:
- private static final String TOPIC_NAME = "nexo-g0-ordering";
- new NewTopic(TOPIC_NAME, 1, (short) 1)
- new ResourcePattern(TOPIC, TOPIC_NAME, LITERAL)
- new ResourcePattern(TOPIC, TOPIC_NAME, LITERAL).toFilter()

This removes the ambiguity instead of relying on Java name-shadowing behavior.

## Second compile requirement
The harness also uses AclBindingFilter and AccessControlEntryFilter without importing the common Kafka ACL filter classes. The required imports are:
- org.apache.kafka.common.acl.AclBindingFilter
- org.apache.kafka.common.acl.AccessControlEntryFilter

The workflow-local adapter files do not repair the separately hardcoded heredoc and therefore do not constitute a fix for the executable path.

## v2 execution blocker
The v2 workflow attempts to read the original workflow from Python using a literal ${GITHUB_WORKSPACE} inside a single-quoted shell heredoc. Shell expansion is disabled, so the path is not resolved. v2 is therefore NOT validated as executable.

## Method boundary
No failed/no-job Actions run is treated as broker evidence. No cache-identity or authorize-snapshot diagnostic is repeated.

The intended witness remains:

D0 -> W1 -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION

D0 is external Admin delete completion; W1 is the target broker's local ACL-cache replacement completion. D0 must not substitute for W1. Timestamps remain diagnostic only.

## Current conclusion
The ordering witness is still scientifically open. No real-broker NEXO_ORDER evidence exists yet, so no W1 -> R1 ordering conclusion is promoted.

## Next action
Obtain one executable path containing the corrected harness, run it against Kafka pin 99b940733a9f6bc409457dba7108f08421d81e42, and audit the raw NEXO_ORDER events before creating AB105.117R.

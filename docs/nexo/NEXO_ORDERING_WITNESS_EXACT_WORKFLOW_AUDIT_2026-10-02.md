# NEXO AB105 G0 — ordering workflow exact-source audit (2026-10-02)

## New finding
The exact PR #94 ordering workflow still contains three harness defects in its hardcoded heredoc, independent of the v2 path defect.

### 1. TOPIC name/type collision
The harness declares:
- TOPIC as a String topic name
- a static import of ResourceType.TOPIC

Affected calls use TOPIC for both semantic roles. The safe correction is:
- TOPIC_NAME = "nexo-g0-ordering"
- ResourceType.TOPIC remains the resource type
- NewTopic(TOPIC_NAME, ...)
- ResourcePattern(TOPIC, TOPIC_NAME, LITERAL)

### 2. ACL filter imports are missing
The generated ordering harness instantiates AclBindingFilter and AccessControlEntryFilter but does not import the Kafka common ACL filter classes. The required imports are:
- org.apache.kafka.common.acl.AclBindingFilter
- org.apache.kafka.common.acl.AccessControlEntryFilter

### 3. Delete/authorization resource name is also wrong
The delete path and the D1 authorization path use ResourcePattern(TOPIC, TOPIC, LITERAL). Even after resolving the Java name collision, the second argument must be TOPIC_NAME. Otherwise the probe would target a resource name different from the topic created by the harness.

## Source verification
At the pinned Kafka source, StandardAuthorizerData.authorize(...) receives Action as a parameter and performs findAclRule(..., action), so the planned AUTH_ENTER/AUTH_DECISION insertion points are structurally valid. No production synchronization is added by these probes.

## Evidence boundary
This is a source-level workflow audit only. It is not broker evidence.
- AB105.116R: unchanged.
- AB105.117R: not created.
- TLC: not rerun.
- Real-broker NEXO_ORDER evidence: none.
- W1 -> R1: UNKNOWN.

## Next action
Correct all three harness defects in one executable path, then compile the exact ordering harness against Kafka pin 99b940733a9f6bc409457dba7108f08421d81e42 before interpreting any ordering result.

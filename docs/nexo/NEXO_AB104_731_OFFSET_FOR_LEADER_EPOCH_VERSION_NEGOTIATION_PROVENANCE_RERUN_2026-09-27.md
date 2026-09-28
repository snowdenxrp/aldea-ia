# NEXO AB104.731 — OffsetForLeaderEpoch version negotiation, correlation and topic-identity re-run

Date: 2026-09-27

Status:
SOURCE_CODE_VERIFIED=PARTIAL/YES by direct current Apache Kafka public source routes;
PROTOCOL_SHAPE_VERIFIED=YES;
VERSION_SELECTION_VERIFIED=YES;
REQUEST_HEADER_CORRELATION_VERIFIED=YES;
BROKER_DESTINATION_BINDING_VERIFIED=YES;
TOPIC_ID_IN_CURRENT_PROTOCOL=NOT_ESTABLISHED / CURRENT STABLE PROTOCOL SAYS NO;
TOPIC_ID_PROPOSAL_HISTORY=VERIFIED BUT NOT CANONICAL CURRENT SUPPORT;
DIRECT_OFFSETS_FOR_LEADER_EPOCH_CLIENT_BODY=NOT_RETRIEVED;
IMPLEMENTED=NO;
EXECUTED_BY_NEXO=NO;
NEXO_CORRECTNESS_VERIFIED=NO;
TLC=PENDING.

## Scope

This is a fresh AB104.731 re-run. It supersedes the earlier chat-only AB104.731 claim and does not inherit it as evidence.

Questions fixed by the continuity audit:
1. exact OffsetForLeaderEpoch request/response schema versions;
2. effective version selection/negotiation;
3. NodeApiVersions capability state;
4. request header apiVersion/correlationId/clientId;
5. broker/node identity at request and response boundaries;
6. topic identity/incarnation handling;
7. exact provenance retained before reducer loss.

## 1. Current protocol shape

Apache Kafka protocol documentation for the current 4.1 protocol family lists OffsetForLeaderEpoch request versions 2, 3 and 4, with v4 using flexible encoding (compact strings/tag buffers). Request v2 adds current_leader_epoch; v3 adds replica_id; v4 changes encoding/header version. The documented request still identifies topics by topic name.

The same current protocol documentation lists response versions 2 and 4 in its current-version section; response v4 remains topic-name based and carries throttle_time_ms, error_code, partition, leader_epoch and end_offset. Version 0 has no leader_epoch; version 1+ has leader_epoch. No topic UUID field appears in the current documented v4 shape.

Therefore the previous AB104.730 statement that OffsetForLeaderEpoch v4 itself adds topic identifiers is CORRECTED/REJECTED as a current-protocol claim.

Evidence:
- Kafka 4.1 protocol page: https://kafka.apache.org/41/design/protocol/
- KIP-516 proposed a topic-ID form for OffsetForLeaderEpoch v4, but proposal text is not equivalent to current implementation.
- KAFKA-10549 remained In Progress in the current Jira snapshot, and PR #21126 (the server/protocol part of the topic-ID work) was closed on 2026-05-03 for inactivity. The PR discussion proposed topic IDs for a future v5 while retaining v4 name-based requests.

Conclusion: TOPIC_ID_FOR_CURRENT_OFFSET_FOR_LEADER_EPOCH = NOT ESTABLISHED; the available current protocol evidence supports NAME_BASED identity. A future/unstable topic-ID version must not be assumed.

## 2. Effective version selection

Current Kafka consumer fetch code obtains NodeApiVersions for the leader node and checks whether the node has a usable OffsetForLeaderEpoch version. It calls apiVersions.get(node.idString()), and if no capability record exists it tries to connect. If the broker does not support a usable version, validation is skipped rather than silently inventing a version.

Current NetworkClient source shows the effective request version is selected per destination node:
- if no NodeApiVersions is known, it uses the request builder's latest allowed version for the initial/unknown-capability case;
- otherwise it calls NodeApiVersions.latestUsableVersion(apiKey, oldestAllowedVersion, latestAllowedVersion);
- the selected version is then passed to builder.build(version).

NodeApiVersions.current implementation defines latestUsableVersion as the intersection of the broker-advertised min/max range and the client's allowed range, selecting the maximum version in that intersection.

This means the effective OffsetForLeaderEpoch version is not merely a global local constant. It is a function of:
CLIENT_ALLOWED_RANGE × NODE_ADVERTISED_RANGE × REQUEST_BUILDER_CONSTRAINTS.

Important epistemic boundary: this proves the selection mechanism, not that a particular production broker currently advertises any specific range.

## 3. Request header provenance

Current Kafka RequestHeader directly stores:
- apiKey
- apiVersion
- clientId
- correlationId
- headerVersion

It exposes apiVersion(), clientId(), correlationId(), and derives the response-header version from apiVersion.

Therefore the parsed request provenance boundary contains the exact API version and correlation identifier used on the wire, plus clientId.

For Nexo, apiVersion must be captured from the actual request header rather than inferred later from the local latest version.

## 4. Request/response correlation and node binding

Current Kafka ClientResponse contains:
- the original RequestHeader;
- destination (the node the request was sent to);
- created/received timing;
- response body or disconnect/version-mismatch state.

Current NetworkClient response handling associates a received network source with the corresponding in-flight request, parses the response using the request header's API key/version, and verifies the response correlation against the request correlation.

Thus the current client path provides a concrete provenance chain:

network source/destination
→ in-flight request
→ original RequestHeader
→ apiKey/apiVersion/correlationId/clientId
→ parsed response body.

The response object retains destination and requestHeader, so a Nexo capture record should bind broker/node identity to the request/response correlation rather than treat topic/partition alone as sufficient.

Important limitation: node identity here is the Kafka client/network destination identity. It is not by itself proof of a stable physical broker incarnation or of external-world identity after reconnect/replacement. That stronger property remains a Nexo-level requirement.

## 5. Topic identity / incarnation

The current Kafka 4.1 protocol evidence is name-based for OffsetForLeaderEpoch v4. Therefore a provenance record cannot claim a topic UUID/incarnation from this API version because the response/request shape does not carry one.

A topic name is not sufficient for an incarnation-sensitive Nexo claim when a topic can be deleted and recreated under the same name. The current protocol therefore leaves an identity gap for any Nexo claim requiring protection against name reuse.

Research history confirms topic-ID support for OffsetForLeaderEpoch was proposed under KAFKA-10549. The relevant server/protocol PR discussion proposed v5 topic IDs while keeping v4 name-based, but the PR was later closed for inactivity. This is evidence of proposed direction, not evidence of current deployed support.

Nexo consequence:
TOPIC_NAME != TOPIC_INCARNATION.
If a protected claim requires incarnation identity, Nexo must bind an independent authoritative incarnation/identity source or use a future protocol version only after its actual support is directly verified. It must not manufacture a topic UUID from a name.

## 6. Minimum pre-reducer provenance envelope

For the OffsetForLeaderEpoch path, the minimum candidate protected capture now becomes:

- AdmissionID / OperationID
- Kafka API key = OFFSET_FOR_LEADER_EPOCH
- request API version
- request header version
- correlationId
- clientId
- destination/node identity
- request creation/send context
- response received time
- topic name
- partition
- requested leader_epoch
- current_leader_epoch when the selected request version carries it
- response errorCode
- response leader_epoch when the selected response version carries it
- response end_offset
- response protocol version/schema identity
- response parsing status
- disconnect/timeout/version-mismatch state where applicable
- topic incarnation/UUID only if independently and authoritatively available; never inferred from the name.

The capture point must be before OffsetsForLeaderEpochUtils reduces retry-classified errors into the shared partitionsToRetry result.

## 7. Important correction to AB104.730

AB104.730's general provenance conclusion remains valid: raw errorCode alone is insufficient when the claim depends on the epoch boundary.

The specific statement that v4 itself adds topic identifiers is corrected:
- KIP-516 proposed topic IDs for OffsetForLeaderEpoch v4.
- Current Kafka 4.1 protocol documentation still shows v4 as topic-name based.
- KAFKA-10549's later work proposed a topic-ID v5 path, but the relevant PR was closed for inactivity.
Therefore CURRENT_TOPIC_ID_SUPPORT = NOT ESTABLISHED.

## 8. What is still UNKNOWN

1. Exact current trunk generated OffsetForLeaderEpoch request/response schema files were not retrievable through the available GitHub connector route in this run. Current Apache Kafka protocol documentation was therefore used for protocol shape, while source-level version-selection/header/client-network evidence was obtained from current Apache source mirrors/GitHub-rendered source.
2. The exact current OffsetsForLeaderEpochClient.java body was not directly retrieved in this run. The surrounding current Fetcher/OffsetFetcher/NetworkClient mechanisms establish the version-selection path but do not prove every detail inside that client class.
3. A current exhaustive test proving preservation of all provenance fields through the real OffsetForLeaderEpoch path was not found/executed.
4. Topic incarnation continuity is not supplied by the current name-based OffsetForLeaderEpoch protocol and remains a separate Nexo evidence dependency.
5. Broker/node physical incarnation across disconnect/reconnect/replacement is not proven by destination string alone.
6. No Nexo implementation or runtime test has been performed.
7. TLC/formal correctness remains PENDING.

## 9. Required adversarial tests before implementation

A future Nexo test matrix should include at minimum:

A731-1 version intersection: broker min/max intersects client range at one version.
A731-2 version intersection: multiple usable versions; verify highest permitted version is selected.
A731-3 no capability record: verify unknown-node behavior is explicit and not treated as proof of broker support.
A731-4 broker too old/new: verify UnsupportedVersion/skip behavior remains explicit.
A731-5 request header binding: apiVersion/correlationId/clientId are captured from the actual header.
A731-6 response correlation mismatch: reject/quarantine provenance rather than attaching response to the wrong operation.
A731-7 source/destination mismatch: verify response cannot be rebound to a different node identity.
A731-8 disconnect/timeout before response: preserve UNKNOWN outcome; do not synthesize NOT_COMMITTED or successful response evidence.
A731-9 v0/v1/v2/v3/v4 schema differences: preserve which fields were actually available.
A731-10 name reuse: same topic name, different authoritative incarnation; verify name alone cannot close an incarnation-sensitive claim.
A731-11 reducer collapse: raw errorCode/epoch/endOffset captured before reduction and remains linked to OperationID.
A731-12 mixed multi-partition response: provenance remains per partition, not only per aggregate retry set.
A731-13 capability change between requests: each request binds its actual selected version/capability evidence; historical capability is not reused as current proof.
A731-14 node replacement/reconnect: destination identity is not silently promoted to stable broker incarnation.
A731-15 stale response after metadata/topic recreation: old response cannot satisfy a new incarnation-bound claim.

These are test designs only, not executed tests.

## 10. Final AB104.731 conclusion

CONFIRMED:
- OffsetForLeaderEpoch has versioned schemas and current documented v4 remains topic-name based.
- Effective version selection is node-capability-aware through NodeApiVersions and allowed request ranges.
- RequestHeader binds apiVersion, clientId and correlationId.
- ClientResponse retains the originating RequestHeader and destination.
- Network response parsing/correlation binds the response to the in-flight request.
- Raw reducer loss remains a real provenance boundary.

CORRECTED:
- Do not state that current OffsetForLeaderEpoch v4 contains topic identifiers.

OPEN:
- exact current generated schema/source-body retrieval;
- topic incarnation binding;
- broker incarnation binding;
- exhaustive direct reducer/provenance tests;
- Nexo implementation/runtime verification;
- TLC/formal correctness.

No Kafka source was modified. No Nexo implementation was performed. No runtime test was executed. No correctness, security, broker-durability, or deployment guarantee is claimed.

## EXACT NEXT ACTION

AB104.732 — direct code/test audit of the current OffsetForLeaderEpoch client path and provenance-loss boundary:
- retrieve exact current OffsetsForLeaderEpochClient/OffsetFetcherUtils/NetworkClient test bodies where available;
- verify how the parsed response is handed to the reducer;
- identify every field that is discarded before the Nexo capture boundary;
- inspect direct tests for correlation mismatch, stale responses, unsupported versions and mixed-partition responses;
- keep topic incarnation and broker incarnation as explicit UNKNOWN unless direct evidence closes them.

Do not implement Nexo. Do not create V21. Do not promote AB104.732 until this record is canonically committed.

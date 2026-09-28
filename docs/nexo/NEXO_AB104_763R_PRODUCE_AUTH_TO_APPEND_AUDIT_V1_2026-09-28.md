# NEXO AB104.763R — Produce authorization-to-append boundary audit

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation and no claim of executed adversarial testing.

## Scope

Trace the current Apache Kafka Produce path from authorization through ReplicaManager append to determine whether the same request is re-authorized after ACL revocation, and distinguish request-local caching from cross-request authorization caching.

## Source findings

1. KafkaApis.handleProduceRequest performs topic authorization through:
   `authHelper.filterByAuthorized(request.context, WRITE, TOPIC, ...)`.
   The source contains the comment:
   "cache the result to avoid redundant authorization calls".
   This is a request-local collection named `authorizedTopics`; it avoids repeated authorization calls while processing the same Produce request. It is NOT evidence of a persistent/cross-request authorization cache.

2. After that single authorization phase, Kafka builds `authorizedRequestInfo` containing the records for topics that passed authorization and then invokes:
   `replicaManager.handleProduceAppend(... entriesPerPartition = authorizedRequestInfo ...)`.
   No second AuthHelper/Authorizer call is visible in this transition.

3. ReplicaManager.handleProduceAppend performs transactional verification when applicable, then calls `appendRecords(...)`, which calls `appendRecordsToLeader(...)`, which calls `appendToLocalLog(...)`.
   The normal non-transactional path therefore proceeds from the earlier authorization result to local log append without a generic second ACL authorization gate.

4. Transactional Produce has an additional authorization check for the transactional ID before the topic authorization phase, and transactional partition verification can happen before append. Those checks concern transaction state/transactional identity and do not constitute a generic re-check of the topic WRITE ACL immediately before the local log effect.

5. The Produce code clears the request's partition records after handing them to ReplicaManager, indicating that the append pipeline owns the already-authorized data after the handoff.

6. Kafka's Authorizer API explicitly describes `authorize` as synchronous and designed around locally cached ACLs. StandardAuthorizer evaluates each authorization call against its current local data. This means a later authorization call could observe newer local ACL state, but the normal Produce path does not appear to make that later call.

## Important correction

The phrase "cache the result" in KafkaApis is a potential source of false positives in this audit.

CLAIM:
"Kafka caches authorization decisions."

Correct interpretation:
"Kafka caches the set of resources authorized during this particular Produce request so that the same request does not perform redundant authorization calls."

This is **request-local reuse**, not evidence of a stale authorization cache shared across requests.

## Interleaving analysis

The source supports the following conceptual ordering:

T0: Produce request enters broker.
T1: topic WRITE authorization occurs against the authorizer's local ACL state.
T2: authorized records are retained in `authorizedRequestInfo`.
T3: request proceeds into ReplicaManager.
T4: ReplicaManager reaches local append path.
T5: records are appended.

The audited source does not establish a generic authorization check between T1 and T4/T5.

Therefore the adversarial interleaving remains a live research question:

T1 ALLOW
→ T2 ACL revocation becomes committed/visible
→ T3 same already-authorized request continues
→ T4 append

The code trace does not provide evidence that the topic WRITE authorization is automatically invalidated or rechecked at T4.

## What this does NOT prove

- It does NOT prove a security vulnerability in Kafka.
- It does NOT prove that ACL revocation is globally instantaneous.
- It does NOT prove that a specific revocation race is externally exploitable.
- It does NOT establish the exact ordering between metadata ACL publication and an in-flight Produce handler without an execution/test.
- It does NOT establish behavior for every custom Authorizer.
- It does NOT establish credential/session revocation semantics.

## Nexo relevance

This is strong evidence for a general architectural distinction:

AUTHORIZATION_AT_ADMISSION
is not necessarily
AUTHORIZATION_AT_EFFECT.

If a Nexo protected effect must remain revocable after admission, the architecture needs an explicit effect-time freshness/fence mechanism. The exact mechanism remains OPEN until the evidence study defines the required semantics.

## Evidence ledger

PRODUCE_TOPIC_AUTHORIZATION_BEFORE_REPLICA_MANAGER: SOURCE CONFIRMED
REQUEST_LOCAL_AUTHORIZATION_RESULT_REUSE: SOURCE CONFIRMED
CROSS_REQUEST_AUTHORIZATION_CACHE_IN_THIS_PATH: NOT FOUND
GENERIC_SECOND_ACL_CHECK_BEFORE_APPEND: NOT FOUND IN AUDITED PATH
TRANSACTIONAL_VERIFICATION_BEFORE_APPEND: SOURCE CONFIRMED
REVOCATION_RACE_EXECUTED: NO
REVOCATION_PROPAGATION_ORDERING: OPEN
CUSTOM_AUTHORIZER_BEHAVIOR: OPEN
EFFECT-TIME REVOCATION FENCE: NOT ESTABLISHED

## Exact next action

AB104.764R:
Audit Kafka's ACL mutation and metadata publication path plus relevant tests around StandardAuthorizer/AclPublisher. Establish the strongest source-backed ordering available between deleteAcls completion, ACL metadata propagation to a broker's StandardAuthorizerData, and an already-running Produce handler. Then search for existing Kafka tests that intentionally exercise ACL changes while requests are in flight.

Do not convert source ordering into an executed race result.

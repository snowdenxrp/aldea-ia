# NEXO AB104.768R — Kafka authorization tests / semantic contract audit

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation and no executed revocation race.

## Scope

Audit current Kafka authorization semantics and available test/request evidence for ACL deletion versus Produce, with emphasis on whether Kafka defines or tests an effect-time authorization fence.

## Findings

1. Kafka's current security documentation defines normal PRODUCE authorization as WRITE on the Topic. DELETE_ACLS is separately authorized as ALTER on the Cluster resource. This confirms that authorization is operation/request based; the documentation does not describe a revocation fence coupling the two operations.

2. The current KafkaApis request dispatcher routes DELETE_ACLS to the controller, while PRODUCE is handled on the broker. Thus ACL mutation and the protected Produce effect cross different request/control-plane paths.

3. The audited Produce path still performs topic authorization before passing authorized request information toward ReplicaManager. The current source surface does not show a generic second ACL authorization immediately before append.

4. The searched current GitHub surface did not return a deterministic test that synchronizes an in-flight Produce against ACL deletion and then asserts the post-revocation append outcome. This is a search result, not proof that no such test exists anywhere in Kafka's complete test tree.

5. Kafka's security documentation explicitly describes the shipped KRaft StandardAuthorizer as storing ACLs in cluster metadata and says brokers use the configured authorizer for authorization. It does not promise that an already-authorized in-flight request is retroactively canceled when ACL state changes.

6. Therefore the evidence currently supports a semantic statement narrower than 'Kafka is vulnerable': Kafka documents request authorization and distributed ACL state, but the audited sources do not establish an effect-time revocation guarantee for an already-admitted Produce.

## Important negative-result discipline

NOT FOUND in the searched surface != DOES NOT EXIST in the entire Kafka repository.

EXECUTED RACE = NO.

Therefore no exploitability or vulnerability conclusion is made.

## Evidence ledger

PRODUCE_TOPIC_WRITE_AUTHORIZATION: SOURCE CONFIRMED
DELETE_ACLS_CLUSTER_ALTER_AUTHORIZATION: SOURCE CONFIRMED
DELETE_ACLS_AND_PRODUCE_USE_DIFFERENT_PATHS: SOURCE CONFIRMED
GENERIC_EFFECT_TIME_SECOND_ACL_CHECK: NOT FOUND IN AUDITED PATH
DETERMINISTIC_ACL_DELETE_VS_INFLIGHT_PRODUCE_TEST: NOT FOUND IN SEARCHED SURFACE
RETROACTIVE_CANCELLATION_SEMANTIC_GUARANTEE: NOT FOUND
EXECUTED_RACE: NO
ABSENCE_FROM_COMPLETE_REPOSITORY_PROVEN: NO

## Nexo implication

The evidence strengthens the requirement that admission authorization and effect authorization must be modeled as distinct events when authority can change during an operation. It does not yet prove that a particular fencing design is necessary in every system; that question remains part of the cross-system research.

## Exact next action

AB104.769R: broaden beyond Kafka to systems with explicit revocation/fencing semantics. Study at least one durable distributed system that exposes a fencing token/epoch at the protected effect, and one authorization system with revocation propagation semantics. Compare their actual source/tests/failure handling with Kafka's metadata-offset model. Preserve the distinction between observation, synchronization, authorization, and effect fencing.

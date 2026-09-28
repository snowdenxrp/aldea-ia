# NEXO AB104.765R — DeleteAcls completion versus broker authorization freshness

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation and no executed race test.

## Scope

Determine what a successful Kafka DeleteAcls response actually establishes, and whether it establishes that every broker has already applied the ACL deletion to its local StandardAuthorizer.

## Source-confirmed path

1. KafkaApis.handleDeleteAcls authorizes the administrative operation with Cluster:Alter, then calls the configured Authorizer's deleteAcls operation. It waits on the returned per-filter futures before constructing and sending DeleteAclsResponse.

2. ClusterMetadataAuthorizer.deleteAcls delegates to its AclMutator. Its documented contract says the returned future completes once the relevant deleteAcls operation has been called on the controller and the ACL deletions have been persisted to the cluster metadata log.

3. For KRaft, QuorumController.deleteAcls uses appendWriteEvent. ControllerWriteEvent generates the ACL deletion records, appends them through the Raft layer, and associates the response with the resulting metadata-log offset.

4. ControllerWriteEvent does NOT complete the client future merely when the in-memory controller state is changed. It places the event in deferredEventQueue and completes it when the relevant log offset reaches the controller's stable/commit completion path. The QuorumMetaLogListener completes pending items up to lastStableOffset.

5. Therefore a successful DeleteAcls response is stronger than merely 'the controller changed memory': it establishes successful persistence/commit progress for the ACL deletion in the controller metadata log.

6. It still does NOT establish that every broker has already consumed that metadata record and applied removeAcl to its local StandardAuthorizerData. Broker-side AclPublisher is a separate metadata-consumer/application boundary.

## Freshness boundary classification

DELETE_ACLS_RESPONSE = CONTROL_PLANE_COMMIT/PERSISTENCE EVIDENCE
DELETE_ACLS_RESPONSE != GLOBAL_BROKER_AUTHORIZER_FRESHNESS
DELETE_ACLS_RESPONSE != PROOF THAT AN IN_FLIGHT PRODUCE WAS REVOKED

The response therefore provides a useful metadata-log point, but not a universal effect-time revocation point for all brokers.

## Important interleavings

Let:
D = DeleteAcls metadata record reaches the controller's relevant completion point
P = target broker's AclPublisher applies removeAcl
A = previously authorized Produce reaches append

The source does not establish D <= P for every broker at the instant the DeleteAcls response is sent.

Thus both broad orderings remain possible from the audited evidence:

1. authorization(ALLOW) < D < P < A
2. authorization(ALLOW) < D < A < P

The second ordering means a previously admitted request can reach the effect before that broker has locally consumed the revocation, even after the administrative DeleteAcls operation has successfully completed.

This is a source-derived ordering model, not an executed race result.

## New architectural distinction

Kafka gives us three different authority points:

A0 = controller metadata-log commit point
A1 = broker-local authorizer publication point
A2 = protected request effect point

A0 is not automatically A1, and A1 is not automatically A2.

For Nexo, an authority_epoch or revocation record must therefore identify which point it fences. Merely observing a control-plane commit is insufficient to claim that all effect domains have crossed the revocation boundary.

## Evidence status

DELETE_ACLS_ADMIN_AUTHORIZATION: SOURCE CONFIRMED
DELETE_ACLS_RESPONSE_WAITS_FOR_MUTATION_FUTURES: SOURCE CONFIRMED
ACL_DELETE_PERSISTED_TO_METADATA_LOG_BEFORE_MUTATION_FUTURE_COMPLETION: SOURCE CONFIRMED
CONTROLLER_STABLE/COMMIT COMPLETION PATH: SOURCE CONFIRMED
GLOBAL_BROKER_APPLICATION_BEFORE_RESPONSE: NOT ESTABLISHED
IN_FLIGHT_PRODUCE_REVOCATION: NOT ESTABLISHED
EXECUTED RACE: NO

## Exact next action

AB104.766R:
Audit the broker MetadataLoader/AclPublisher delivery semantics and any explicit metadata offset/freshness APIs available to request processing. Determine whether a broker can prove that its local authorizer has applied at least metadata offset D before executing an effect, and whether Kafka's normal Produce path uses any such proof. Preserve the distinction between 'broker caught up to offset D' and 'the specific request was re-authorized after D'.

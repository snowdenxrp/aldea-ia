# NEXO AB105 — D1 R1 batch authorization refinement — 2026-10-06

Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

New source finding:

KafkaApis.handleProduceRequest calls AuthHelper.filterByAuthorized for WRITE/TOPIC. AuthHelper builds the Action list, invokes authorizer.authorize directly, and immediately converts the returned AuthorizationResult list into the authorized resource-name set.

KafkaApis then processes the topic/partition entries on the same request-handler path. An entry continues only when its topic is authorized and metadataCache contains the target partition. The resulting authorizedRequestInfo is passed directly to handleProduceAppend.

For the ordinary non-transactional path, handleProduceAppend proceeds directly to appendRecords, then appendRecordsToLeader, appendToLocalLog, and Partition.appendRecordsToLeader.

Therefore the downstream path is:

D1 authorize
-> immediate result consumption
-> authorizedRequestInfo
-> target existence check
-> handleProduceAppend
-> appendRecords
-> appendRecordsToLeader
-> appendToLocalLog
-> Partition.appendRecordsToLeader

No new asynchronous boundary was identified between the D1 result and the local append path for this ordinary case.

Important condition:
D1=ALLOW alone does not guarantee the append. The target must also pass the metadataCache existence check and record validation.

State:
D1 authorize: VERIFIED
D1 result consumption: VERIFIED
D1 -> R1: VERIFIED CONDITIONALLY
W1 -> D1 HB: UNKNOWN / NOT IDENTIFIED
W1 -> R1: UNKNOWN
Observed stale-read: NOT OBSERVED / NOT DISPROVEN

This is a refinement of the existing R1 audit, not a new runtime execution.

# NEXO AB105 G0 — publication boundary result 2026-10-02

## New evidence

Fresh source review confirms the operational model:
- Kafka's authorization framework requires authorizer implementations to support concurrent authorization and ACL update activity.
- KRaft StandardAuthorizer stores ACL state in cluster metadata.
- The KAFKA-14828 design explicitly assumes a single writer for ordered ACL application, while authorization reads occur concurrently.

The exact pinned implementation still has:
- volatile StandardAuthorizer.data;
- mutable StandardAuthorizerData;
- non-volatile StandardAuthorizerData.aclCache;
- incremental addAcl/removeAcl replacing only aclCache, not the volatile data reference.

## Boundary conclusion

The investigation has now isolated the unresolved property to one precise question:

Does the Kafka execution/synchronization model create a Java Memory Model happens-before edge from the MetadataLoader/AclPublisher thread's incremental aclCache assignment to an unrelated RPC authorization thread?

The queue lock itself is insufficient evidence because the RPC thread does not acquire that same queue lock.

No source examined so far proves the required cross-thread publication for the incremental aclCache field.

This remains an UNKNOWN, not a demonstrated defect.

## Runtime implications

PR #86 already demonstrated:
IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0

The new source evidence does not change those runtime results.

## Next controlled experiment

A new experiment is justified, but it must be a JMM/publication discriminator rather than another Kafka metadata propagation timing test.

Required properties:
1. pin Kafka revision 99b940733a9f6bc409457dba7108f08421d81e42;
2. exercise StandardAuthorizerData incremental add/remove on the designated writer thread;
3. exercise authorize concurrently on an independent reader thread;
4. establish a deterministic handoff around the update so the test asks visibility rather than network propagation;
5. distinguish stale read from in-flight authorization;
6. repeat enough iterations to detect a visibility anomaly, while preserving UNKNOWN if none occurs.

No AB105.117R.
No TLC rerun.
AB105.116R remains frozen.

# NEXO AB105 G0 — D0 Future vs Target W1 Causality Audit — 2026-10-03

## Question

Does AdminClient deleteAcls().all().get() provide a happens-before edge proving that target-broker StandardAuthorizerData.removeAcl() (W1) completed before the test thread sends the D1 request?

Pinned Kafka revision:
99b940733a9f6bc409457dba7108f08421d81e42

## Source findings

### ClusterMetadataAuthorizer

The default deleteAcls implementation delegates to AclMutator.deleteAcls() and completes its returned CompletableFutures from the controller result callback.

Its contract states that the futures complete once the relevant controller delete operation has been called and ACL deletions have been persisted to the cluster metadata log.

This is not a statement that every broker has already applied the ACL deletion to its local StandardAuthorizerData.

### QuorumController

QuorumController.deleteAcls() calls appendWriteEvent("deleteAcls", ... aclControlManager.deleteAcls(...)).

ControllerWriteEvent:
1. executes the controller operation;
2. appends the generated metadata records;
3. applies the records to active-controller in-memory state;
4. schedules the prepared append;
5. records the resulting metadata-log offset;
6. defers completion until the deferred-event queue reaches that offset;
7. completes the CompletableFuture.

Therefore the Admin future establishes a completion boundary for the controller/metadata-log operation, not a direct completion boundary for target-broker ACL application.

## Relation to the real-broker witness

Run 37081442555 / job 111082635995 showed an especially useful fact:

- cycle 4 target-broker ACL_W1 occurred AFTER D0_RETURN by 101,061 ns;
- cycle 5 target-broker ACL_W1 occurred AFTER D0_RETURN by 397,572 ns;
- in both cycles target W1 still occurred BEFORE D1 DEQUEUE/AUTH.

This demonstrates directly that:

D0_RETURN != target W1 completion.

Therefore D0_RETURN must not be used as the publication point for ACL state.

## What the run actually establishes

The real-broker run provides temporal evidence that target W1 occurred before D1 request handling in all 10 cycles.

It does not, from timestamps alone, establish a JMM happens-before edge:

W1 -> D1 ENQUEUE

The RequestChannel queue does provide its normal synchronization/publication edge:

ENQUEUE -> DEQUEUE

The unresolved boundary is still:

W1 -> ENQUEUE

## Epistemic state

- target W1 before D1 DEQUEUE temporally: OBSERVED 10/10
- D1 DENIED: OBSERVED 10/10
- D0_RETURN as W1 completion: DISPROVED AS A GENERAL ASSUMPTION
- W1 -> ENQUEUE JMM happens-before: UNKNOWN
- stale read after W1: UNKNOWN
- exploitability: UNKNOWN
- generalization: UNKNOWN
- production impact: UNKNOWN
- security conclusion: NOT_ESTABLISHED

## Next action

Continue source-level audit only at the W1 -> ENQUEUE boundary.

Do not introduce a synchronization primitive in the witness to wait for W1; that would manufacture the very edge being measured.

Do not rerun TLC, modify AB105.116R, create AB105.117R, or merge PR #94.

# NEXO AB104.773R — etcd atomic compare-and-swap: stale-client boundary

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation; no executed external-resource race.

## Scope

Audit current etcd transaction source and API semantics to determine exactly where stale state is rejected and where the mutation becomes atomic.

## Findings

1. etcd's Txn API evaluates all Compare predicates and then applies either the success or failure operations as one transaction. The API explicitly permits comparisons against key version, create revision, modification revision, value, and lease. All comparisons are applied atomically. citeturn0search0

2. Current etcd server source confirms the separation of read/compare and write execution inside the transaction implementation, while writes are serialized on the Raft loop. The implementation obtains a read view for comparison, then enters the write transaction for mutation; it does not expose the intermediate comparison result as a separately committed authorization that can later be reused independently.

3. The transaction response contains the resulting revision, and the API documents that a write transaction increments the store revision once for the transaction. Thus the successful guarded mutation obtains a single ordered commit position rather than a separate 'check revision' followed by an unguarded write. citeturn0search0

4. etcd's STM implementation further demonstrates the optimistic-concurrency pattern: a read set is converted into ModRevision comparisons and the write set is committed through one transaction. If the comparisons fail, the transaction does not apply the write set and the STM can retry using fresh state. citeturn0search4

5. This is stronger than a client-side read/check/write sequence. A stale client can hold an old ModRevision indefinitely, but when it submits the guarded transaction, the server compares the current key state against that old revision atomically with the requested mutation. If a newer writer has changed the key, the compare fails and the stale write is not committed.

6. This demonstrates a precise stale-operation safety pattern: stale state may exist in a client, but it cannot cross the server's atomic compare-and-effect boundary.

## Timeout/retry boundary

A successful transaction response is the authoritative result of the committed transaction. A client timeout does not itself establish whether the transaction committed; recovery therefore requires querying/using the resulting state or an idempotency/operation identity strategy where the application needs to distinguish retry from duplicate effect.

The etcd transaction primitive itself prevents the same stale comparison from succeeding after the guarded key has advanced, but it does not automatically solve arbitrary external side effects performed outside the transaction.

## External resource distinction

If the protected effect occurs outside etcd, the etcd transaction can establish ownership/version state but cannot atomically roll that state together with an unrelated external side effect. A separate resource-side fence, transactional intermediary, or reconciliation protocol is still required.

## Evidence ledger

ATOMIC_COMPARE_AND_MUTATE: SOURCE CONFIRMED
REVISION/VERSION/LEASE_COMPARE: SOURCE CONFIRMED
WRITE_REVISION_ORDERING: SOURCE CONFIRMED
STALE_READSET_REJECTION_PATTERN: SOURCE CONFIRMED
STM_READSET_GUARDS_WRITES: SOURCE CONFIRMED
CLIENT_TIMEOUT_AS_EXECUTION_PROOF: FALSE
ETCD_TXN_ATOMIC_WITH_ARBITRARY_EXTERNAL_EFFECT: FALSE
EXECUTED_EXTERNAL_RACE: NO

## Nexo research implication

The strongest currently supported abstraction is not simply 'authorization token'. It is:

`guarded effect = condition(authority/state/version) AND mutation in one protected commit boundary`

For external effects, that boundary must be supplied by the effect resource or by a trusted transactional intermediary. A prior successful check is weaker because it can become stale before the effect.

This remains a research finding, not a final Nexo design.

## Exact next action

AB104.774R: inspect etcd concurrency/lock tests and failure tests around stale transactions, retries, lease expiration, and compaction. Determine which properties are tested versus merely documented, and identify counterexamples where a client can observe success but remain uncertain about external effect completion.

# NEXO AB104.772R — Fencing token persistence, restart, failover, and domain binding

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation; no executed production race.

## Scope

Study etcd as a concrete distributed coordination system and determine what its revision/lease mechanisms prove about restart, failover, stale tokens, and resource/domain binding.

## Findings

1. etcd explicitly warns that leases alone do not guarantee mutual exclusion. Its documentation states that a server may revoke a lease while a client still believes it owns the resource because TTL uses physical time. Mutual exclusion for etcd's own keys is instead implemented using version/revision validation in the atomic KV/Txn operation. This is strong independent evidence for the resource-side enforcement principle.

2. etcd revisions are a persistent, monotonically increasing cluster-wide logical clock. Modifying operations receive a revision, and the revision is stored with key state. This provides an ordering primitive that survives ordinary member/process restart because the state is persisted.

3. etcd's persistent-storage documentation exposes lease state as persisted data and notes an important caveat: crash-looping servers do not release leases merely because a process restarted. Lease remaining-TTL persistence/checkpointing is a separate concern. Therefore restart behavior of a lease is not equivalent to ownership automatically resetting.

4. etcd documents a recovery hazard when restoring a snapshot: the restored revision can move backwards relative to a previously running cluster. The documented `--bump-revision` mechanism exists specifically to ensure revisions never decrease after restore; `--mark-compacted` invalidates stale watchers/caches. This is direct evidence that logical-clock rollback can break consumers that rely on monotonicity.

5. Domain binding is structural rather than universal: etcd's revision is cluster-wide, while key version/create/modification revisions are attached to particular keys. The application must still bind a fencing condition to the correct key/resource namespace. A numeric revision alone does not identify which protected resource it authorizes.

6. etcd's own docs explicitly state that its lock feature cannot protect external resources. For external resources, the resource must provide its own version-number validation and replica consistency. This directly reinforces that control-plane lease ownership is insufficient for arbitrary side effects.

## Failure conclusions

- Process restart: does not imply authority reset.
- Lease expiration: does not by itself stop an already-paused client from attempting an external effect.
- Snapshot restore: may require revision bumping to preserve monotonicity assumptions.
- Stale cache/watch: must not be treated as current authority without a consistency boundary.
- Cross-resource reuse: a token/revision must be bound to the intended authority/resource domain.
- External effect: must enforce the version/fence itself or through an atomic intermediary.

## Evidence ledger

LEASE_ALONE_IS_INSUFFICIENT: SOURCE CONFIRMED
PERSISTENT_MONOTONIC_REVISION: SOURCE CONFIRMED
LEASE_STATE_PERSISTENCE: SOURCE CONFIRMED
RESTORE_REVISION_ROLLBACK_HAZARD: SOURCE CONFIRMED
REVISION_BUMP_RECOVERY: SOURCE CONFIRMED
EXTERNAL_RESOURCE_NEEDS_OWN_VALIDATION: SOURCE CONFIRMED
NUMERIC_TOKEN_ALONE_IDENTIFIES_RESOURCE: FALSE
EXECUTED_RESTART_RACE: NO

## Nexo research implication

The research adds two constraints to any future fencing model:

A. Fence identity must be scoped to an authority/effect domain; a bare integer is insufficient.
B. The ordering source must have a defined recovery rule that preserves the monotonicity assumptions on which stale-token rejection depends.

These remain research findings, not final Nexo architecture.

## Exact next action

AB104.773R: study actual implementation/tests of an etcd compare-and-swap/version-condition transaction and its behavior around stale clients. Determine exactly where atomicity occurs, what happens on timeout/retry, and whether a stale client can ever commit after a newer revision. Then contrast with an external-resource pattern where the resource is not etcd itself.

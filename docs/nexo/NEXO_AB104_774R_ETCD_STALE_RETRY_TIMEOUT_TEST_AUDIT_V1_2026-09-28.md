# NEXO AB104.774R — etcd stale retry, ambiguous timeout, and test evidence audit

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation; no executed production race.

## Scope

Audit current etcd evidence around stale retries, ambiguous transaction outcomes, lease/lock ownership, and client-side caches. Distinguish server-side atomicity from correctness failures in higher-level client recipes.

## Findings

1. Current etcd transaction semantics provide an atomic compare-and-effect boundary for operations inside etcd. This remains the strong primitive established in AB104.773R.

2. A current 2026 etcd GitHub issue reports a concrete stale retry bug in the high-level `concurrency.Mutex` recipe: an `Unlock` request can commit on the server while the client observes an error; the same session can later reacquire the same key; retrying the old Unlock can then delete the newer lock incarnation. The issue proposes fencing the delete with `CreateRevision(m.myKey) == m.myRev`. This is an important real-world counterexample: a correct underlying transactional KV primitive does not automatically make every client-side ownership protocol safe. citeturn0search0

3. The issue includes a minimal integration-test reproduction using a lost delete reply, re-acquisition, and stale Unlock. The reported failing assertion shows that the stale retry can delete the later lock incarnation in the affected implementation. This is stronger evidence than documentation alone, but it is an open issue report rather than a completed upstream fix/verification.

4. A separate etcd issue reports correctness bugs in the client-side `leasing` cache: concurrent Put/Delete and Put/Get can leave cached state stale or inconsistent with the server. The report includes new failing test cases. This reinforces the rule that server linearizability does not automatically transfer to an asynchronous client cache. citeturn0search2

5. etcd's own test/reliability history includes network-fault testing, membership reconfiguration failures, quorum loss, and snapshot recovery in its functional tester. This demonstrates that these failure classes are part of the project's test surface, but it does not prove every fencing property is covered by those tests. citeturn0search1

6. Compaction creates another boundary: revisions before a compaction point become inaccessible to historical reads. A protocol that depends on replaying old state must therefore define behavior when its evidence is compacted. This is an availability/knowledge boundary, not itself an authorization fence. citeturn0search8

7. A timeout or lost reply remains an ambiguous outcome. The client cannot safely infer `not committed` merely from failure to observe the response. This is directly illustrated by the stale-Unlock issue: the server-side delete had committed while the client saw an error. Therefore retries of state-changing operations require operation identity, conditional state checks, or reconciliation rather than blind repetition. citeturn0search0

## Critical result

We now have an actual counterexample to a tempting but unsafe abstraction:

`lease acquired + client remembers ownership + retry on error`

is NOT sufficient.

The safer shape is:

`operation carries ownership incarnation/version → server/resource conditionally accepts only matching current incarnation → mutation commits atomically`

The CreateRevision-fenced delete proposed by the issue is exactly this pattern.

## Evidence ledger

ETCD_SERVER_ATOMIC_CAS: SOURCE CONFIRMED
STALE_UNLOCK_AFTER_LOST_REPLY: REAL REPORTED BUG / REPRODUCTION PROVIDED
HIGH_LEVEL_LOCK_PROTOCOL_AUTOMATICALLY_SAFE: FALSE / COUNTEREXAMPLE
CLIENT_CACHE_LINEARIZABILITY_AUTOMATIC: FALSE / COUNTEREXAMPLE
NETWORK/SNAPSHOT FAILURE TESTING EXISTS: SOURCE CONFIRMED
COMPACTION_INVALIDATES OLD HISTORY: SOURCE CONFIRMED
TIMEOUT_IMPLIES_NOT_COMMITTED: FALSE
UPSTREAM_FIX_VERIFIED: NOT ESTABLISHED
EXECUTED_BY_THIS_AUDIT: NO

## Nexo implication

This is a major research checkpoint: safety cannot be inherited transitively from a strong storage primitive. Every layer that can issue or retry an effect must preserve the ownership/version condition. A stale retry can reintroduce an old authority unless the protected mutation itself rejects the old incarnation.

This should remain an explicit future audit item for Nexo: operation_id/idempotency, authority generation, resource-side conditional commit, and reconciliation must be analyzed together rather than independently.

## Exact next action

AB104.775R: inspect the reported etcd stale-Unlock issue's proposed/follow-up implementation and tests, plus related lock/lease code, to determine whether and how revision fencing was integrated. Then look for an independently different system using generation numbers on delete/release to confirm this is a general stale-incarnation pattern rather than an etcd-specific quirk.

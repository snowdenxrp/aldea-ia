# NEXO AB104.775R — etcd ownership-incarnation fencing follow-up

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Scope

Follow the etcd stale-Unlock finding from AB104.774R into current source and compare it with an independent fencing-token implementation.

## Current etcd source result

Current upstream `client/v3/concurrency/mutex.go` still defines Mutex with `myKey` and `myRev`, and `IsOwner()` already constructs the correct ownership predicate: `CreateRevision(myKey) == myRev`. However, current `Unlock()` performs an unconditional `client.Delete(ctx, m.myKey)` rather than using that predicate. Therefore the ownership predicate exists in the API but is not currently enforced by Unlock itself.

This directly matches issue #22082, which reports that a lost Unlock response followed by same-session relock can allow the old Mutex instance to delete the newer key incarnation. The issue provides an integration-test reproduction and proposes fencing the delete with the existing ownership comparison. The issue remains open in the source consulted for this audit. \n
## Why the independent comparison matters

The open-source `ahrtr/disco` project implements fencing tokens on top of etcd. Its documented model gives each lock/permit/election term a strictly increasing token and requires the protected resource to remember the highest token it has accepted and reject older tokens. This is independently useful implementation evidence for the general pattern, but it is not proof that arbitrary external resources are safe. \n
## Important distinction

Two different fencing patterns are now visible:

1. **Incarnation fencing**: the mutation must match the exact resource incarnation that the operation originally acquired, e.g. CreateRevision(oldKey) == oldCreateRevision.
2. **Monotonic authority fencing**: the protected resource remembers the greatest accepted generation/token and rejects lower generations.

They solve related but not identical problems. Incarnation fencing prevents an old operation from acting on a newly recreated object with the same logical name. Monotonic token fencing prevents an older owner from acting after a newer owner has taken precedence.

A robust Nexo external-effect contract may need both, depending on resource semantics.

## Evidence ledger

CURRENT_ETCD_MUTEX_UNLOCK_UNCONDITIONAL_DELETE: SOURCE CONFIRMED
MUTEX_HAS_OWNERSHIP_COMPARATOR: SOURCE CONFIRMED
OPEN_STALE_UNLOCK_ISSUE: SOURCE CONFIRMED
STALE_UNLOCK_REPRODUCTION: REPORTED TEST EVIDENCE CONFIRMED
UPSTREAM_FIX_MERGED_AND_VERIFIED: NOT ESTABLISHED
INDEPENDENT_FENCING_TOKEN_IMPLEMENTATION: SOURCE CONFIRMED
EXTERNAL_RESOURCE_MUST_REJECT_STALE_TOKEN: SOURCE CONFIRMED FOR DISCO DESIGN
INCARNATION_FENCE_EQUALS_GLOBAL_MONOTONIC_FENCE: FALSE
EXECUTED BY THIS AUDIT: NO

## Nexo implication

Do not collapse operation_id, object incarnation, and authority generation into one identifier. They have different semantics:

- operation_id: identifies one attempted operation/retry lineage;
- resource incarnation: identifies which creation/ownership instance the operation belongs to;
- authority generation: identifies which authority epoch supersedes earlier owners;
- effect acceptance state: records what the protected resource has already accepted.

This is now a concrete research boundary to preserve before architecture design.

## Exact next action

AB104.776R: inspect a second independent system's actual implementation/tests for generation/fencing enforcement at the protected resource, preferably one where stale operations are rejected at the storage/effect boundary rather than merely documented. Compare failure, retry, restart, and recovery semantics against the etcd pattern.

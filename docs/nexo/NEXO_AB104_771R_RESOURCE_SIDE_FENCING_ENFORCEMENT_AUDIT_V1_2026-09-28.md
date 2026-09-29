# NEXO AB104.771R — Resource-side fencing enforcement audit

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation; no executed race.

## Scope

Study real distributed lease/fencing designs to determine whether safety comes from the lease service alone or from enforcement at the protected resource.

## Findings

1. Martin Kleppmann's canonical fencing analysis states the key construction directly: every protected write carries a monotonically increasing fencing token, and the storage/resource service remembers the greatest token it has accepted and rejects older tokens. The resource must actively participate; merely knowing that a lock service granted a lease is insufficient.

2. The failure being prevented is a delayed/paused old owner. Client A can acquire token 33, pause, lose its lease, and later send a write with 33 after client B has acquired token 34. A correctly fenced resource rejects 33 after observing 34. This is precisely a stale-operation problem, not simply a lock-acquisition problem.

3. A current open-source etcd-based implementation (`ahrtr/disco`) provides an inspectable concrete pattern: lock/permit acquisition returns a monotonically ordered fencing token derived from etcd revision state; the client propagates the token to the protected resource, and the documented resource contract rejects lower tokens. This is useful as implementation evidence, but the repository's own correctness claims are not treated as independent proof of a production guarantee.

4. The resource-side check must be atomic with the protected mutation, or equivalent ordering must be provided by the resource. A separate `check(token)` followed later by `write()` creates a TOCTOU window in which a newer owner can supersede the old token. Therefore `token validation` and `effect commit` belong to one protected ordering boundary.

5. Fencing tokens address stale writes, but not every class of problem. Read safety, external irreversible side effects, and uncertain RPC outcomes may require additional versioning, idempotency, reconciliation, or an intermediary that can enforce the fence.

6. The token source must itself provide an order that survives the intended failure model. A random identifier or local counter does not establish the same stale-order rejection property. The research source explicitly ties safety to monotonic token generation.

## Comparative result

Lease service alone:
`grant → client believes owner → pause/partition → old client may continue`

Fenced resource:
`grant(token=N) → protected request(token=N) → resource compares N with highest accepted → atomic accept/reject`

The safety boundary is therefore at the protected resource, not at the lease acquisition call.

## Evidence ledger

LEASE_ALONE_PROTECTS_STALE_EFFECT: FALSE / COUNTEREXAMPLE ESTABLISHED
RESOURCE_SIDE_TOKEN_VALIDATION: SOURCE CONFIRMED
STALE_TOKEN_REJECTION: SOURCE CONFIRMED
ATOMIC_CHECK_AND_EFFECT_REQUIRED: SOURCE/REASONING SUPPORTED
MONOTONIC_TOKEN_REQUIRED: SOURCE CONFIRMED
EXTERNAL_SIDE_EFFECTS_FULLY_SOLVED: NO
RANDOM_TOKEN_EQUIVALENT_TO_MONOTONIC_FENCE: NO
EXECUTED_PRODUCTION_RACE: NO

## Nexo implication

The research now gives a concrete invariant candidate for later formalization:

`A protected resource must not accept an operation carrying an authority generation lower than the highest generation already accepted for that protected namespace.`

This is only a research invariant candidate. It is not yet a Nexo law, because we still need to study namespace/domain binding, token persistence, failover, retries, cross-resource effects, and cases where the protected resource cannot directly validate a token.

## Exact next action

AB104.772R: investigate token namespace/domain binding and restart/failover behavior. Determine how real systems prevent token reuse or cross-resource token confusion, and how the resource preserves its highest accepted generation across crash/recovery. Include source/tests where possible.

# NEXO AB105 G0 — ACL cache read site closed — 2026-10-03

## Exact pinned source
Kafka: 99b940733a9f6bc409457dba7108f08421d81e42.

`authorize()` calls `findAclRule()`. `findAclRule()` performs the critical field read:

`AclCache aclCacheSnapshot = aclCache;`

The snapshot is then passed to both `checkSection(...)` calls. This means the authorization operation captures one `AclCache` reference and uses that same object for the remainder of the rule search.

W1, by contrast, constructs a new immutable cache and assigns it with:

`aclCache = aclCacheSnapshot;`

No volatile modifier is present on the field, and the inspected `StandardAuthorizerData` path does not add a lock around this assignment/read pair.

## Important consequence
The exact observation point is now identified. A stale observation, if it occurs, would be: target W1 creates/assigns cache object N, then a later authorization operation temporally reads an older cache object O at `AclCache aclCacheSnapshot = aclCache`.

The existing 10/10 temporal witness did NOT observe this identity. It only established W1 < ENQUEUE < DEQUEUE < AUTH and D1 DENIED.

## Probe boundary
A probe should capture the already-read `aclCacheSnapshot` identity without changing the field modifier or introducing a cross-thread publication primitive. Reconciliation must occur after the causal window.

## Status
🟢 Exact AUTH cache-read site identified.
🟢 Single snapshot reference used for each authorization operation.
🔵 Whether that read can observe an older cache after W1 remains UNKNOWN.
🔵 JMM happens-before W1→AUTH remains UNKNOWN.
🔴 Vulnerability/security conclusion NOT_ESTABLISHED.

## Frozen
AB105.116R unchanged. AB105.117R not created. TLC not rerun. PR #94 unmerged.

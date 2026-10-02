# NEXO AB105 G0 — StandardAuthorizer publication boundary

Date: 2026-10-02
Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42

## New source finding

The pinned StandardAuthorizer source makes an important distinction:

- `data` is `volatile`.
- `authorize()` snapshots that volatile reference into `curData`.
- But normal `addAcl()` and `removeAcl()` call `data.addAcl()` / `data.removeAcl()` directly.
- Those methods mutate the existing StandardAuthorizerData instance by assigning a new value to its non-volatile `aclCache` field.
- They do NOT assign a new StandardAuthorizerData to the volatile `data` field.
- `loadSnapshot()`, `configure()`, `completeInitialLoad()`, and similar operations DO replace the volatile `data` reference.

Therefore, for ordinary incremental ACL deltas, the volatile `data` field by itself does not establish a publication event for the updated `aclCache` to concurrent RPC authorization threads.

## Why this matters

The prior hypothesis is now materially sharper:

METADATA THREAD:
AclPublisher -> StandardAuthorizer.removeAcl(id) -> currentData.aclCache = newCache

RPC THREAD:
StandardAuthorizer.authorize() -> curData = data -> curData.authorize() -> aclCacheSnapshot = aclCache

The two paths can operate on the same StandardAuthorizerData object.

This is NOT yet a verified Java memory-model defect. We still need to identify the intended synchronization contract that makes these concurrent accesses safe, including whether there is an external lock, thread-affinity rule, request barrier, or another publication mechanism not yet traced.

The source comment in StandardAuthorizer says a read-write lock is used to synchronize reads/writes, but the pinned implementation shown here contains no such lock field or lock acquisition around these operations. This discrepancy is itself a source-level item requiring resolution, not a conclusion of vulnerability.

## Epistemic state

IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0
ACL_PUBLISHER_ORDERING=SOURCE_CONFIRMED
STANDARD_AUTHORIZER_DATA_NOT_THREAD_SAFE=SOURCE_CONFIRMED
DATA_VOLATILE_REFERENCE=SOURCE_CONFIRMED
INCREMENTAL_ACL_UPDATE_REPUBLISHES_DATA_REFERENCE=NO
DIRECT_ACL_CACHE_PUBLICATION_TO_RPC=NOT_ESTABLISHED
EXTERNAL_SYNCHRONIZATION_CONTRACT=UNKNOWN
JAVA_MEMORY_VISIBILITY_BUG=UNKNOWN
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED

## Next target

Trace the exact history/introduction of the read-write-lock comment and inspect tests/concurrency assumptions around StandardAuthorizerData. Then inspect whether Kafka's supported execution model relies on single-writer semantics plus some external visibility guarantee.

Do not change AB105.116R.
Do not create AB105.117R.
Do not rerun TLC.
Do not repeat PR #86 unchanged.
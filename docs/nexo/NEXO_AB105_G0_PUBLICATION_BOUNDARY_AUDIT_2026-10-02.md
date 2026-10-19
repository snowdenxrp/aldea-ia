# AB105 G0 publication-boundary audit — 2026-10-02

## Exact pinned source finding

Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42.

StandardAuthorizer declares:
private volatile StandardAuthorizerData data = StandardAuthorizerData.createEmpty();

But the steady-state ACL mutation methods are:
addAcl -> data.addAcl(...)
removeAcl -> data.removeAcl(...)

They do NOT assign to the volatile StandardAuthorizer.data field.

StandardAuthorizerData.aclCache is a plain field. removeAcl() constructs a new immutable AclCache and assigns:
aclCache = aclCacheSnapshot;

Therefore the volatile publication of StandardAuthorizer.data is not a publication write on the steady-state removeAcl() path. A reader loading the volatile data reference does not, by itself, establish a happens-before edge from the later plain aclCache assignment, because the volatile write on data did not occur as part of that mutation.

The volatile data field is reassigned on other lifecycle/snapshot paths such as loadSnapshot() and completeInitialLoad(), but those are distinct operations and cannot be assumed to synchronize an unrelated later removeAcl().

## Methodological consequence

The cache/snapshot diagnostic already covered the behavioral boundary without synchronization being added to the race. The remaining causal question is now narrower:

Does any existing synchronization/publication edge outside StandardAuthorizer.removeAcl() establish visibility of the plain aclCache mutation to the unrelated RPC authorization reader?

This must be investigated from the actual ACL mutation call chain, not inferred from the presence of the volatile data field.

## Status

🟢 SOURCE-VERIFIED: steady-state removeAcl() does not write volatile StandardAuthorizer.data.
🟢 SOURCE-VERIFIED: aclCache mutation is a plain-field replacement on StandardAuthorizerData.
🟡 JMM happens-before from the real mutation path to RPC authorization: UNKNOWN until call-chain synchronization is audited.
🟡 stale-read mechanism: NOT OBSERVED in executed diagnostics.
🟡 security impact/exploitability/generalization: UNKNOWN.

## Do not repeat

Do not repeat the cache identity/snapshot diagnostic merely to rediscover this boundary.
Do not add synchronization to the race and then treat the result as evidence about the unmodified production path.
Do not rerun TLC.
Do not create AB105.117R.
Do not modify AB105.116R.

## Next action

Trace the real ACL mutation call chain from the metadata/controller/event application path into StandardAuthorizer.removeAcl(), and independently trace the RPC authorization call path into StandardAuthorizer.authorize(). Identify concrete locks, volatile writes/reads, thread joins, executor handoffs, futures, queues, or other specified JMM publication edges that connect the two paths. If no edge is found, preserve UNKNOWN rather than converting that absence into a proof of stale visibility.

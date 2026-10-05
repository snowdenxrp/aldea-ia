# AB105 — StandardAuthorizerData Snapshot Boundary — 2026-10-05

Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

## Exact source finding
`StandardAuthorizerData` explicitly declares itself **not thread-safe**.

`StandardAuthorizer.authorize()` captures the volatile `data` reference into `curData`, then calls `curData.authorize(...)`.

Inside `StandardAuthorizerData.findAclRule()`, D1 takes:
`AclCache aclCacheSnapshot = aclCache`
and both ACL searches use that same local snapshot.

`addAcl/removeAcl` replace the `aclCache` field inside the same `StandardAuthorizerData` object. They do not replace the outer volatile `StandardAuthorizer.data` reference.

## Consequence
The volatile `data` field is a publication mechanism for replacement of the outer `StandardAuthorizerData` object, but the observed incremental ACL mutation path operates on the already-published object and replaces only its non-volatile `aclCache` field.

Therefore, `volatile data` must NOT be treated as proof of W1→D1 publication for incremental ACL updates.

This is consistent with the prior empirical state:
- W1→D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale ACL read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

## Important boundary
This finding is a source-level explanation of why the obvious `volatile data` argument does not close the race. It is **not** itself proof that D1 can observe a stale `aclCache`.

## Do not repeat
Do not rerun 117R, G0, TLC, or the already-covered D1 snapshot diagnostic. Do not add artificial synchronization.

## Next frontier
If continuing source analysis, inspect only a genuinely new publication mechanism that could connect the thread performing `addAcl/removeAcl` to the request-authorizing thread. Otherwise, further source inspection of the same `StandardAuthorizerData → findAclRule` boundary is repetition.
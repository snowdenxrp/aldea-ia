# AB105 StandardAuthorizer synchronization-comment reconciliation — 2026-10-05

Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

## Finding

`StandardAuthorizer.java` contains a comment above the volatile `data` field saying that a read-write lock is used to synchronize reads and writes to ACL data. The exact implementation inspected at this pin does not show such a read-write lock around `authorize/addAcl/removeAcl`.

The actual implementation is:
- `data` is volatile.
- `authorize()` copies `data` to local `curData` and authorizes through that object.
- `addAcl()` delegates to `data.addAcl()`.
- `removeAcl()` delegates to `data.removeAcl()`.
- `StandardAuthorizerData.aclCache` is non-volatile and is replaced inside `StandardAuthorizerData.addAcl/removeAcl`, while the containing `StandardAuthorizerData` reference is not reassigned by those methods.

## Classification

This is a **source-comment / implementation reconciliation finding**, not new proof of a vulnerability. The underlying volatile-`data` / in-place-`aclCache` distinction was already established in earlier AB105 work and must not be counted as a new discovery.

The comment must not be interpreted as evidence of an actual lock or JMM happens-before edge.

## Epistemic state

- W1 -> D1 HB: UNKNOWN / NOT IDENTIFIED.
- stale ACL read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.
- No new synchronization edge identified.

## Do not repeat

Do not rerun the prior aclCache visibility analysis merely because of this comment. Do not manufacture a lock/barrier in the experiment.

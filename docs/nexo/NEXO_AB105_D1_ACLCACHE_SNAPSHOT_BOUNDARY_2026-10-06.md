# NEXO AB105 — D1 authorization snapshot boundary — 2026-10-06

## 🟢 Exact pinned source
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

At D1, StandardAuthorizerData.findAclRule() executes:
`AclCache aclCacheSnapshot = aclCache;`

The subsequent ACL matching work uses that same snapshot for the relevant checks. The snapshot itself is immutable.

## 🔵 Precise consequence
Once D1 has read an AclCache reference, the authorization calculation is internally based on one immutable snapshot rather than observing in-place mutations to that snapshot during the calculation.

This narrows the race semantics:

- The unresolved question is whether D1's initial read of plain `aclCache` sees the W1-published new snapshot.
- It is NOT an intra-calculation mutation race against the same AclCache object.
- If D1 sees the old reference, immutable snapshot semantics preserve that old view for the authorization calculation.
- If D1 sees the new reference, the new immutable snapshot remains internally stable for that calculation.

Therefore the critical visibility boundary is exactly the plain-field read at the start of the authorization rule calculation.

## Epistemic state
- W1→ENQUEUE JMM HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NOT IDENTIFIED.
- stale-read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

## Reconciliation
This is a source-level refinement of the existing AB105 publication model. No runtime sample was created and no prior evidence is superseded.

## DO-NOT-REPEAT
Do not design a new experiment around mid-authorization AclCache mutation; the pinned implementation snapshots the reference before ACL matching.
Do not treat the immutable D1 snapshot as evidence that W1's newer snapshot was published.

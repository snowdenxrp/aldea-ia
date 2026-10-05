# NEXO AB105 — MASTER CONTINUITY — 2026-10-05

## Canonical project state
- Repository: snowdenxrp/aldea-ia
- Master branch: main
- Exact Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42
- AB105 authoritative witness: run 37098764557 / job 111133973894 / artifact 11265332252
- Artifact SHA-256: d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c
- W1→D1 JMM happens-before: UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge: NOT IDENTIFIED
- stale ACL read: NOT OBSERVED / NOT DISPROVEN
- vulnerability: NOT ESTABLISHED
- W1→R1: UNKNOWN
- TLC: NOT_RERUN

## New finding — immutable AclCache boundary
Exact pinned AclCache.java was inspected at 99b9407.

Confirmed:
- AclCache is immutable.
- aclsByResource and aclsById are final.
- addAcl/removeAcl construct and return a new AclCache.
- Existing AclCache instances are not mutated in place.
- This gives strong snapshot structural consistency.

Critical distinction:
- StandardAuthorizerData.aclCache itself is a plain reference.
- Incremental addAcl/removeAcl assign the new immutable AclCache to that plain reference.
- The immutable object's final fields do not themselves establish publication of the new aclCache reference to another thread.
- Therefore immutable/persistent structure solves snapshot coherence, but does not by itself establish W1→D1 JMM happens-before.

## PCollections 4.0.2 publication audit
Kafka pins PCollections 4.0.2.

A version-labelled upstream-source mirror was inspected for the PCollections implementation. It identifies the dependency as 4.0.2 and exposes the relevant implementation classes.

Confirmed in the inspected implementation:
- HashPMap stores its backing PMap and size in final fields.
- HashPMap.plus/minus construct new HashPMap instances; they do not mutate the existing map.
- HashTreePMap uses a static final EMPTY instance and delegates to HashPMap; no lock/volatile/atomic/future publication primitive was identified in the class.
- TreePSet stores its tree, comparator and direction in final fields.
- TreePSet.plus/minus produce a new TreePSet through withTree(); no lock/volatile/atomic/future publication primitive was identified in the class.
- KVTree uses final fields for height, size, left, key, value and right; node construction creates new immutable tree nodes.
- IntTree likewise uses final node fields and creates new nodes for updates.
- No explicit synchronization/publication mechanism was identified in these relevant PCollections classes.

Epistemic interpretation:
- 🟢 Persistent/immutable structure confirmed.
- 🟢 Structural snapshot coherence strengthened.
- 🔴 No PCollections-level W1→D1 publication/HB mechanism identified.
- This does NOT prove that no HB exists elsewhere in the Kafka execution path.
- It only closes the hypothesis that the PCollections primitives themselves provide the missing publication bridge.
- Final-field safe initialization of newly constructed immutable objects is not equivalent to publication of Kafka's plain StandardAuthorizerData.aclCache reference.

Evidence qualification:
- The inspected source mirror explicitly identifies the dependency as org.pcollections:pcollections:4.0.2.
- This is source evidence for the 4.0.2 implementation, not a Maven artifact checksum. Do not silently upgrade this to artifact-byte identity.
- Maven metadata independently confirms 4.0.2 exists and was released in March 2024.

## Current model
AclPublisher thread:
  W1 -> StandardAuthorizerData.removeAcl()
     -> aclCache = new immutable AclCache

Request thread:
  StandardAuthorizer.authorize()
     -> volatile read of outer data
     -> same StandardAuthorizerData
     -> plain read of aclCache

Important:
- Incremental removeAcl/addAcl do NOT replace outer volatile StandardAuthorizer.data.
- loadSnapshot/copyWithNewAcls DOES replace outer data and therefore has a volatile publication edge.
- Do not generalize the snapshot-replacement publication edge to incremental ACL updates.

## Historical/design reconciliation
KAFKA-14214 (6c6b8e2) explicitly used ReentrantReadWriteLock around ACL updates and authorization.
KAFKA-14828 (df137752542c005c6998c37c03222ffbeca0f349) removed the R/W lock in favor of persistent immutable structures and per-read snapshots.
No inspected PR discussion, exact pinned implementation, or post-merge change identified an explicit per-update JMM publication guarantee for incremental aclCache replacement.

## Closed / do-not-repeat
- Do not rerun 117R.
- Do not rerun G0/PR92/PR93/PR94.
- Do not rerun TLC merely because the source audit continues.
- Do not add artificial volatile/latch/barrier/Future synchronization.
- Do not repeat the already-covered D1 snapshot structural probe.
- Do not use D0_RETURN as a proxy for W1.
- Do not treat temporal ordering as JMM happens-before.
- Do not repeat the PCollections wrapper audit unless a genuinely new dependency/version/source discrepancy appears.

## Next frontier
The PCollections primitive hypothesis is now closed at the implementation level: no publication primitive was identified in the relevant persistent structures.

The remaining source-audit frontier is outside the collection itself:
- determine whether any Kafka-level publication/admission mechanism connects the metadata-loader W1 update to the request-serving authorization read;
- otherwise preserve W1→D1 HB as UNKNOWN / NOT IDENTIFIED.

## Continuity rule
No finding, contradiction, failed attempt, epistemic state, or do-not-repeat decision is silently discarded or replaced.


## 2026-10-05 — diagnostic cache-observation frontier

The source audit is now exhausted for the concrete G0 authorizer path. The remaining empirical question is whether D1 actually reads a pre- or post-removal immutable AclCache snapshot.

Exact pinned source confirms that `findAclRule()` performs `AclCache aclCacheSnapshot = aclCache` and then uses that same local snapshot for both ACL scans. A diagnostic immediately after that local read can therefore observe the exact cache object used by D1 without changing authorizer state.

Safe diagnostic requirements:
- observe only the already-selected local `aclCacheSnapshot`;
- identify the target ACL structurally, with no W1-shared variable;
- record cache identity/count/membership only after the snapshot read;
- keep W1 and D1 observation sinks separate; do not reuse shared `System.err`;
- do not introduce volatile/latch/barrier/Future synchronization;
- preserve AB105.117R unchanged as baseline;
- treat the run as diagnostic evidence, not JMM proof.

Classification:
- POST_W1_CACHE: D1 snapshot lacks the target ACL.
- PRE_W1_CACHE: D1 snapshot still contains the target ACL, with independent evidence W1 preceded D1.
- AMBIGUOUS: cycle/target cannot be uniquely correlated.

Current state remains:
- W1→D1 HB = UNKNOWN / NOT IDENTIFIED
- stale ACL read = NOT OBSERVED / NOT DISPROVEN
- vulnerability = NOT ESTABLISHED
- AB105.116R unchanged
- AB105.117R not recreated
- TLC not rerun

Next action: build and validate one isolated workflow-local diagnostic probe, then execute only after its instrumentation path has been audited for absence of an artificial W1→D1 synchronization edge.


## 2026-10-05 — isolated cache-probe prepared (PR #97)

A new draft-only workflow was prepared on branch `nexo-ab105-g0-cache-probe` / PR #97.

Design:
- recovers the existing G0 harness from the prior witness branch without modifying the baseline harness;
- pins Kafka exactly to `99b940733a9f6bc409457dba7108f08421d81e42`;
- observes D1 immediately after `AclCache aclCacheSnapshot = aclCache`;
- tests exact target ACL membership in that same immutable snapshot;
- records cache identity/count/membership in a D1-only file sink;
- records W1 completion in a separate W1-only file sink;
- adds no volatile/latch/barrier/Future/lock synchronization;
- leaves AB105.116R untouched, does not recreate AB105.117R, and does not rerun TLC.

Audit status:
- PR #97 is DRAFT and not merged.
- No diagnostic runtime execution has been accepted as evidence yet.
- Static safety review caught and corrected an initial workflow-source checkout mistake; current workflow fetches the baseline harness from the Nexo repository branch, not the Apache Kafka clone.
- Current epistemic state remains unchanged: HB UNKNOWN, stale read NOT OBSERVED/NOT DISPROVEN, vulnerability NOT ESTABLISHED.

Next action: run the workflow only after reviewing the final generated probe/source diff; any resulting artifact must be independently reconciled before changing epistemic state.

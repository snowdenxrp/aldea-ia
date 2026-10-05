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

## Next frontier
Inspect the exact pinned implementations of Kafka immutable collection primitives used by AclCache (ImmutableMap / ImmutableNavigableSet) only to determine whether they contain an actual synchronization/publication mechanism. Do not assume immutability implies cross-thread publication. If no such mechanism exists, record that as another closed synchronization hypothesis while preserving UNKNOWN for W1→D1 HB.

## Continuity rule
No finding, contradiction, failed attempt, epistemic state, or do-not-repeat decision is silently discarded or replaced.

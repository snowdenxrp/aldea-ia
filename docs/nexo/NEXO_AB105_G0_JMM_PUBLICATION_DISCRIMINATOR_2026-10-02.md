# NEXO AB105 G0 — JMM publication discriminator design — 2026-10-02

## Boundary recovered

The current G0 runtime harness clones the pinned Kafka revision at workflow time, so the repository does not need to vendor Kafka source. PR #86 confirms the reproducible mechanism for executing temporary tests against revision `99b940733a9f6bc409457dba7108f08421d81e42`.

Official Kafka documentation confirms KRaft uses `StandardAuthorizer` and stores ACL state in cluster metadata. citeturn0search0

## Experiment target

The next experiment must test **publication/visibility**, not metadata propagation.

Writer:
MetadataLoader/AclPublisher execution context -> StandardAuthorizerData.addAcl/removeAcl -> replacement of non-volatile `aclCache`.

Reader:
independent authorization/request thread -> StandardAuthorizer.authorize() -> StandardAuthorizerData.findAclRule() -> snapshot of `aclCache`.

## Required discriminator

The harness must:
1. pin Kafka revision `99b940733a9f6bc409457dba7108f08421d81e42`;
2. initialize a known ACL state;
3. perform an incremental ACL removal/addition from the designated writer path;
4. prevent the test from confusing network/metadata propagation with memory visibility;
5. invoke authorization from an independent reader thread;
6. record whether the reader observes the post-update ACL state;
7. repeat the observation sufficiently to detect a reproducible stale-reference outcome;
8. preserve UNKNOWN if no stale observation occurs.

A synchronization primitive used only to coordinate test phases must not accidentally become the claimed production publication mechanism. The test must separately document every happens-before edge it introduces.

## Important constraint

A direct unit test that calls writer and reader methods under an artificial CountDownLatch can prove behavior under that test synchronization, but cannot prove the production execution model. Therefore a useful discriminator must include two layers:

A. **raw StandardAuthorizerData concurrency test** — isolates the field-publication property.

B. **production-path executor test** — uses the pinned MetadataLoader/AclPublisher path and an independent authorization thread, documenting real synchronization edges.

Only B can inform the production execution question. A is diagnostic only.

## Current epistemic state

IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0
SINGLE_WRITER_ACL_UPDATE_MODEL=SOURCE_CONFIRMED
ACL_CACHE_NONVOLATILE=SOURCE_CONFIRMED
RPC_READER_VISIBILITY=UNKNOWN
JAVA_HAPPENS_BEFORE_PUBLISHER_TO_RPC=UNKNOWN
JAVA_MEMORY_VISIBILITY_BUG=UNKNOWN
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED

## Integrity

AB105.116R remains frozen.
No AB105.117R created.
No TLC rerun.
PR #86 is not repeated unchanged.

## Next action

Implement the two-layer discriminator in a fresh research branch/workflow against the pinned Kafka revision, with explicit evidence for every synchronization edge and no elevation of UNKNOWN without a recoverable witness.

# NEXO AB105 G0 — KAFKA-14828 test coverage finding

Date: 2026-10-02
Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42

## Finding

The historical KAFKA-14828 change explicitly removed the StandardAuthorizer R/W lock in favor of immutable/persistent ACL structures. Its commit description says the intended model was: build a new immutable cache/object during a write, publish the main cache reference after the operation, and have each read operate against one cache object.

The pinned current implementation, however, has evolved to:
StandardAuthorizer.data (volatile) -> StandardAuthorizerData (mutable container) -> aclCache (plain non-volatile reference to immutable AclCache).

Incremental addAcl/removeAcl mutate the existing StandardAuthorizerData by replacing its aclCache field.

## Test audit

The pinned StandardAuthorizerTest.java was inspected at the exact audited Kafka revision. It contains extensive functional authorization, ACL ordering, configuration, initialization, metrics, CIDR and ACL-list tests, but no dedicated concurrent stress/race test was identified that simultaneously exercises incremental add/remove ACL publication against authorize() on separate threads.

The KAFKA-14828 commit also introduced an update benchmark for addAcl performance; this is performance measurement, not a Java Memory Model visibility test.

Therefore:
- persistent/immutable AclCache design = SOURCE CONFIRMED
- lock removal = SOURCE CONFIRMED
- thread-safety contract = SOURCE CONFIRMED
- dedicated concurrent incremental-update visibility test in StandardAuthorizerTest = NOT IDENTIFIED
- JMM publication guarantee for mutable aclCache reference = STILL UNKNOWN

This does NOT establish a defect. Absence of a test is not evidence of a race. It does establish that the exact safety property under investigation is not demonstrated by the obvious unit-test surface.

## Important refinement

KAFKA-14828's original description says the "main reference to the cache" changes after the write. The audited implementation instead keeps the cache reference inside StandardAuthorizerData and mutates that field during incremental updates. This difference between the architectural description and the later concrete structure must be traced historically before drawing conclusions.

## Epistemic state

IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0
ACL_PUBLISHER_ORDERING=SOURCE_CONFIRMED
RW_LOCK_REMOVAL=SOURCE_CONFIRMED
PERSISTENT_ACL_CACHE_DESIGN=SOURCE_CONFIRMED
AUTHORIZER_THREAD_SAFETY_REQUIREMENT=SOURCE_CONFIRMED
CONCURRENT_INCREMENTAL_VISIBILITY_TEST=NOT_IDENTIFIED
ACL_CACHE_PUBLICATION_MECHANISM=UNKNOWN
JAVA_MEMORY_VISIBILITY_BUG=UNKNOWN
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED

## Next target

Trace the commits after KAFKA-14828 that moved the cache reference into StandardAuthorizerData and determine whether a later change intentionally established a different publication model. Also inspect immutable collection semantics and any authorizer concurrency tests outside StandardAuthorizerTest.

Do not repeat PR #86 unchanged.
Do not rerun TLC.
Do not create AB105.117R.
AB105.116R remains frozen.

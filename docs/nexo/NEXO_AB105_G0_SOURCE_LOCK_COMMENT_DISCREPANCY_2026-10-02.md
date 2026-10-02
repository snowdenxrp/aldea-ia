# NEXO AB105 G0 — Source-Level Lock/Comment Discrepancy Audit — 2026-10-02

## STATUS
ANCHOR=AB105.116R (INTACT)
AB105.117R=NOT_CREATED
TLC=NO_RERUN
PR89=OPEN / NOT MERGED
KAFKA_PIN=99b940733a9f6bc409457dba7108f08421d81e42
MISSION=CAUSAL_ATTRIBUTION_BOUNDARY

## NEW VERIFIED OBSERVATION
A fresh source comparison was performed against public Kafka source documentation/search results.

In current Kafka StandardAuthorizer.java, the field comment says that a read-write lock is used to synchronize reads and writes to the data.

However, the current source shown in the same file has:
- private volatile StandardAuthorizerData data = ...
- no ReentrantReadWriteLock field;
- addAcl() directly calls data.addAcl(...);
- removeAcl() directly calls data.removeAcl(...);
- authorize() snapshots StandardAuthorizerData curData = data and authorizes through it;
- no lock acquisition surrounds these paths.

The same structural pattern is also documented for StandardAuthorizerData: the class is explicitly described as not thread-safe; aclCache is a plain field; removeAcl() computes a new cache and assigns it to aclCache; authorize() reads aclCache into a local snapshot.

Public source evidence:
- Apache Kafka StandardAuthorizer.java current source/search result: the read-write-lock wording is present in the comment, while the shown implementation contains no lock.
- Apache Kafka StandardAuthorizerData.java current source/search result: class explicitly not thread-safe, aclCache plain field, mutation by assignment, authorization via local aclCacheSnapshot.

## IMPORTANT LIMITATION
This does NOT by itself prove that the exact pinned revision 99b940733a9f6bc409457dba7108f08421d81e42 has the same source text, because the exact pinned raw file could not be independently fetched from the public raw endpoint during this step.

Therefore:
PINNED_IMPLEMENTATION_LOCK_STATUS=ALREADY_INSPECTED_IN_CANONICAL_REVIEW; CURRENT_PUBLIC_SOURCE=CONSISTENT_WITH_NO_LOCK
COMMENT/IMPLEMENTATION_DISCREPANCY=CURRENTLY_OBSERVED
PINNED_COMMENT_DISCREPANCY=NOT_RE-INFERRED; retain prior UNKNOWN/CONFLICT status
JMM_HB=NOT_IDENTIFIED
STALE_READ=UNKNOWN
MECHANISM_ATTRIBUTION=UNKNOWN

## METHOD CHOICE
No experiment was rerun.
No synchronization was added.
No TLC was rerun.
No AB105.117R was created.
No AB105.116R modification occurred.

## NEXT DISTINCT FRONTIER
The remaining causal question is not whether StandardAuthorizerData can be mutated concurrently in source; that boundary is already strongly documented.

The next experiment, if needed, must distinguish:
1. authorization overlapping removeAcl();
2. authorization whose measured entry occurs after removeAcl() return but still observes the old ACL state;
3. the exact JMM mechanism responsible for such an observation.

A cache-identity/version witness is therefore the next useful diagnostic target, but instrumentation must be designed so that it does not introduce a new synchronization edge or change the race being measured.

## DO-NOT-REPEAT
Do not repeat the two successful causal-v2 runs merely to obtain more overlap counts.
Do not treat OVERLAP_ALLOWED as stale-read evidence.
Do not treat the source comment as proof of an actual lock.
Do not promote current-source observations into exact pinned-revision evidence without pin verification.

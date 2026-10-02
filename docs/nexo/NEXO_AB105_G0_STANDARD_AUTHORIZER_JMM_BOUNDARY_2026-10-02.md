# NEXO AB105 G0 — StandardAuthorizer publication/JMM boundary refinement

Date: 2026-10-02 UTC
Pinned Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42
Canonical anchor: AB105.116R (unchanged)

## Source-confirmed boundary
StandardAuthorizer keeps a volatile StandardAuthorizerData reference. authorize() reads that volatile reference once per call and then authorizes through the captured StandardAuthorizerData.

StandardAuthorizerData itself is explicitly documented as not thread-safe. Its aclCache field is plain/non-volatile. addAcl/removeAcl mutate that same StandardAuthorizerData instance by assigning a new immutable AclCache to the plain aclCache field; they do not replace StandardAuthorizer.data for normal incremental ACL deltas.

Therefore the source establishes a real concurrency boundary of interest:
- publication/reference: volatile StandardAuthorizer.data
- incremental ACL mutation: non-volatile StandardAuthorizerData.aclCache
- writer: metadata publication/AclPublisher path
- readers: unrelated authorize() calls

This is stronger and more precise than saying 'the whole authorizer cache is volatile'. It is not.

## Important source discrepancy
StandardAuthorizer's comment says a read-write lock synchronizes reads and writes to the data, but the pinned implementation contains no read-write lock. This discrepancy is preserved as a source finding and must not be silently normalized.

## Runtime evidence already obtained
The real KRaft production-path discriminator run 36958014786, job 110685238774, used real StandardAuthorizer and real RPC requests. Across 10 iterations after controller-side WRITE deletion:
D1_DENIED=10, D1_ALLOWED=0, D1_UNEXPECTED=0.
Thus no post-D0 stale WRITE authorization was observed in that controlled production-path test.

This runtime result does not establish a Java Memory Model happens-before edge from AclPublisher's writer thread to RPC authorization threads.

## Next discriminator
Do not rerun TLC. Do not create AB105.117R. Build a focused concurrency diagnostic against the pinned StandardAuthorizer implementation that does NOT use an auxiliary completion flag to gate the reader. Instead:
1. create WRITE ACL;
2. continuously issue authorize() calls from reader threads;
3. invoke removeAcl() from a writer thread;
4. record whether any ALLOWED result is observed after the writer has returned from removeAcl();
5. repeat at high iteration count with fresh authorizers;
6. classify as diagnostic only: a zero stale result does not prove JMM safety; any reproducible post-remove ALLOWED result is evidence requiring immediate source/runtime escalation.

The diagnostic must preserve the distinction between a real happens-before edge and mere observed behavior.

## Epistemic state
PRODUCTION_PATH_TEST=SUCCESS
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0_AND_PRODUCTION_TEST
PUBLISHER_TO_RPC_VISIBILITY=UNKNOWN
JAVA_HAPPENS_BEFORE_PUBLISHER_TO_RPC=UNKNOWN
INCREMENTAL_ACL_FIELD_VISIBILITY=SOURCE_LEVEL_CONCURRENCY_GAP
DIRECT_JMM=OBSERVED_NO_STALE_RESULT_IN_PRIOR_200-ITER_DIAGNOSTIC
PRODUCTION_JMM_BUG=UNKNOWN
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED

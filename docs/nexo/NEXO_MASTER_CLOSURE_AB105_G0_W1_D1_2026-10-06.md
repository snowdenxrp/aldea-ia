# NEXO MASTER CLOSURE — AB105 G0 W1→D1 — 2026-10-06

## Purpose
Canonical continuation addendum to the NEXO master evidence map. This is NOT a new AB checkpoint and does NOT replace AB105.116R.

## Final bounded audit result

### 🟢 Verified production chain
MetadataLoader → AclPublisher → StandardAuthorizer / StandardAuthorizerData W1
Request producer → RequestChannel ENQUEUE → DEQUEUE → KafkaRequestHandler → KafkaApis → Authorizer D1
D1 → authorizedRequestInfo → ReplicaManager append/E continuation.

### 🟢 Verified synchronization boundaries
- KafkaEventQueue synchronization publishes metadata events to its EventHandler.
- RequestChannel ArrayBlockingQueue provides ENQUEUE → DEQUEUE publication.
- Program order provides DEQUEUE → D1.
- These are real synchronization edges within their respective execution domains.

### 🔵 Missing edge — final frontier
No concrete production synchronization/publication edge was identified that establishes:

W1 → ENQUEUE

or equivalently:

W1 → Request producer → RequestChannel ENQUEUE.

Therefore the transitive chain:

W1 → ENQUEUE → DEQUEUE → D1

cannot be promoted to JMM happens-before.

Observed temporal ordering W1 < ENQUEUE remains TEMPORAL evidence only.

### 🔵 Important source conclusion
The pinned StandardAuthorizer structure has a volatile outer data reference, but incremental ACL mutation replaces the nested plain aclCache inside the existing StandardAuthorizerData object. The incremental mutation therefore does not itself constitute a new volatile write to data.

The inspected metadata publisher, startup readiness, first-publication future, metadata cache publication, RequestChannel admission, authorization path, and append continuation did not reveal a per-ACL-update bridge consumed by D1.

This is a bounded absence-of-identified-edge result, NOT a proof that stale visibility is impossible.

### 🟢 Real-broker evidence
The authoritative real-broker witness family records temporal:

W1 → ENQUEUE → DEQUEUE → AUTH_ENTER → AUTH_DECISION

with D1 denied in the accepted G0 v2 diagnostic family.

This did not establish W1→D1 JMM HB and did not reproduce a stale authorization read.

### 🔵 Epistemic state
- HB(W1→D1): UNKNOWN / NOT IDENTIFIED
- HB(W1→ENQUEUE): UNKNOWN / NOT IDENTIFIED
- stale-read execution: NOT OBSERVED / NOT DISPROVEN
- W1→R1 exploit chain: UNKNOWN
- security vulnerability / exploitability: NOT ESTABLISHED
- safety proof: NOT ESTABLISHED

## Closed hypotheses
The following candidate bridges are now closed for this audit unless new source evidence appears:
- D0_RETURN as local W1 completion: FALSE
- StandardAuthorizer.data volatile field alone as per-update ACL publication: NOT SUFFICIENT
- initialLoadFuture as per-update publication: FALSE
- firstPublishFuture as per-update publication: FALSE
- metadataCache volatile write before AclPublisher as publication of later aclCache write: NOT SUFFICIENT
- KafkaEventQueue internal lock as metadata→request bridge: NOT IDENTIFIED
- RequestChannel ENQUEUE→DEQUEUE as metadata→request bridge: NOT SUFFICIENT
- downstream append synchronization as retroactive W1→D1 publication: FALSE

## DO-NOT-REPEAT
- Do not rerun TLC.
- Do not rerun PR93 exact JMM snapshot diagnostic.
- Do not rerun PR92 cache census.
- Do not add volatile/latch/barrier/Future/synchronization to the experiment.
- Do not create or recreate AB105.117R.
- Do not promote timestamps to JMM HB.
- Do not treat D0_RETURN as broker-local W1.
- Do not claim vulnerability or safety from the current evidence.

## Branch decision
The direct production causal-path audit is TERMINATED/BOUNDED.

The next work is evidence reconciliation, not another synchronization hunt:
1. reconcile documented vs recoverable runs;
2. preserve authoritative artifact identities;
3. deduplicate historical PR/run claims;
4. maintain the UNKNOWN boundary exactly as stated.

## Continuity identity
Protected anchor: AB105.116R.
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.
Latest repository head observed during this closure: b45443bbdf8b38bb3cc39bd8561312bdca91ddbd.
Previous NEXO research checkpoint before the Lúmina-only commits: 08a97c7601f70591c9152bf09d265ec22546d413.

This addendum must be read together with the existing NEXO master evidence map and the authoritative W1/D1 closure documents.

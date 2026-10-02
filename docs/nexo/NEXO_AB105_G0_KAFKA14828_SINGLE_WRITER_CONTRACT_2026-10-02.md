# NEXO AB105 G0 — KAFKA-14828 PR contract clarification

Date: 2026-10-02
Source: Apache Kafka PR #13437, KAFKA-14828

## New primary evidence

The original PR discussion explicitly states the concurrency assumption behind removing the read/write lock:

- writes are performed on a single thread;
- ACL changes must be applied in arrival order;
- in KRaft, that order is the order written to the metadata topic;
- therefore multiple threads are not expected to read metadata and write AclCache concurrently.

This confirms the design's **single-writer** invariant and explains why no write lock was retained.

## What this does and does not establish

It establishes:
SINGLE_WRITER_ACL_UPDATE_MODEL = SOURCE_CONFIRMED
ORDERED_ACL_APPLICATION = SOURCE_CONFIRMED
NO_CONCURRENT_ACL_WRITERS_BY_DESIGN = SOURCE_CONFIRMED

It does NOT establish:
RPC_READER_VISIBILITY_OF_INCREMENTAL_ACL_REFERENCE = PROVEN
JAVA_HAPPENS_BEFORE_PUBLISHER_TO_RPC = PROVEN
STALE_INCREMENTAL_ACL_REFERENCE = OBSERVED

The PR discussion focuses on consistency of the immutable cache and the single-writer property. It does not provide a Java Memory Model publication proof for the non-volatile StandardAuthorizerData.aclCache reference.

## Important refinement

The investigation must not treat 'single writer' as equivalent to 'single thread total'.

Kafka's own contract requires authorization to execute synchronously on request threads while ACL updates are asynchronous. Therefore the relevant question remains whether the single metadata-writer thread has a defined happens-before/publication path to concurrent authorization readers.

## Current epistemic state

IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0
KAFKA14828_LOCK_REMOVAL=SOURCE_CONFIRMED
KAFKA14828_IMMUTABLE_CACHE=SOURCE_CONFIRMED
SINGLE_WRITER_ACL_UPDATE_MODEL=SOURCE_CONFIRMED
ACL_CACHE_NONVOLATILE=SOURCE_CONFIRMED
INCREMENTAL_ACL_UPDATE_REPUBLISHES_VOLATILE_DATA=NO
RPC_READER_VISIBILITY=UNKNOWN
JAVA_HAPPENS_BEFORE_PUBLISHER_TO_RPC=UNKNOWN
JAVA_MEMORY_VISIBILITY_BUG=UNKNOWN
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED

## Next action

Trace the actual synchronization boundary between the MetadataLoader publisher thread and the request-handler thread. If no shared synchronization/publication edge exists, construct a narrowly scoped concurrency experiment against the pinned Kafka revision.

Do not repeat PR #86 unchanged.
Do not rerun TLC.
Do not create AB105.117R.
AB105.116R remains frozen.

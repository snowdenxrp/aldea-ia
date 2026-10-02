# NEXO AB105 G0 — JMM publication boundary 2026-10-02

## Fresh boundary result

Official Kafka sources confirm:
- StandardAuthorizer is the KRaft default authorizer and stores ACL state in cluster metadata.
- Authorization is synchronous on request threads.
- ACL updates must be thread-safe and may execute asynchronously.
- StandardAuthorizerData is explicitly not thread-safe.
- Its incremental ACL cache field remains a plain (non-volatile) reference in the inspected implementation.
- StandardAuthorizer keeps its outer StandardAuthorizerData reference volatile, but incremental addAcl/removeAcl mutate the existing data object's aclCache rather than republishing the volatile data reference.

KIP-801 separately confirms that ACL records are applied in order while authorization continues concurrently.

## Epistemic consequence

The design establishes:
SINGLE_WRITER_ACL_UPDATE_MODEL = SOURCE_CONFIRMED
ORDERED_ACL_APPLICATION = SOURCE_CONFIRMED
IMMUTABLE_ACLCACHE = SOURCE_CONFIRMED
CONCURRENT_AUTHORIZATION = SOURCE_CONFIRMED

It does not establish:
RPC_READER_VISIBILITY_OF_INCREMENTAL_ACLCACHE = PROVEN
JAVA_HAPPENS_BEFORE_PUBLISHER_TO_RPC = PROVEN
STALE_INCREMENTAL_ACLCACHE = OBSERVED

Therefore the JMM/publication question remains UNKNOWN.

## Experiment boundary

The next discriminator must not use network propagation timing and must not repeat PR #86.

It should exercise the pinned revision 99b940733a9f6bc409457dba7108f08421d81e42 with:
1. one designated ACL-update thread;
2. an independent authorization reader thread;
3. a deterministic synchronization point that distinguishes completion of the writer operation from mere in-flight authorization;
4. observation of the authorization decision and the cache state used for that decision;
5. repeated iterations sufficient to detect an actual visibility anomaly;
6. preservation of UNKNOWN if no anomaly is observed.

A result showing stale state after a completed writer handoff would be materially new evidence. A result showing only the already-observed in-flight authorization window would not advance the claim.

## Guardrails

AB105.116R remains frozen.
No AB105.117R.
No TLC rerun.
No duplicate PR #86 experiment.
No security conclusion from source shape alone.


# NEXO AB104.624 — transaction timeout vs EOS source-offset history
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
Kafka Connect EOS source support atomically writes a source batch and its source offsets in the same Kafka transaction. The connector must provide meaningful source offsets and be able to resume the external source at the exact corresponding position without dropping or duplicating records. citeturn0search1turn0search10
KIP-618 states offset commits remain periodic and transaction boundaries are tied to those commits; if a batch takes longer than Kafka's transaction timeout, the connector must increase transaction timeout, decrease offset interval, or lower throughput. citeturn0search2
Current Connect configuration requires distributed mode for framework EOS; standalone mode cannot provide the framework guarantee. citeturn0search0turn0search3
KIP-618 also allows a separate per-connector offsets topic; committed offsets there are transactional with source records, while a mirror into the worker global offsets topic can be non-transactional and retried separately. citeturn0search1

## Critical boundary
There are at least three histories:
1. external source position;
2. transactional source-record + primary offset history in Kafka;
3. optional mirrored/global Connect offset history.

Kafka EOS couples #2, not necessarily #1's physical source state nor #3's mirror.

Therefore EvidenceRetentionDeadline for an Nexo claim based on source progress must cover the authoritative primary offsets + transaction history AND the external source's own lineage/position evidence. A stale/missing global mirror cannot by itself invalidate the committed primary transaction, but it also cannot be treated as equivalent evidence.

## UNKNOWN mapping
- Transaction timeout before authoritative resolution -> UNKNOWN for Kafka transaction outcome.
- Transaction COMMITTED -> Kafka source-record/offset commit evidence, not proof that external source physically changed.
- Offset reset/alteration -> new administrative transition; prior offsets remain historical and must be fenced/reconciled.
- Missing/expired source-offset history -> cannot infer NOT_PROCESSED; UNKNOWN unless external source or independent anchor resolves it.
- Connector cannot resume exactly from source offset -> EOS claim is not valid for that source connector.

## Tests
T624-1 batch exceeds transaction timeout -> distinguish failed transaction from external source read already performed.
T624-2 Kafka transaction commits but source system later changes -> Kafka offset remains historical source-position evidence.
T624-3 primary offsets retained but global mirror missing -> preserve primary claim; mirror state separate.
T624-4 source offset reset while old task still runs -> old generation must be fenced before reset. citeturn0search5
T624-5 source offset history expires -> UNKNOWN, not NOT_PROCESSED.
T624-6 connector restart after timeout -> exact resume semantics required for EOS.

## Conclusion
AB104.624 expands EvidenceRetentionDeadline: it cannot be derived from Kafka transaction-state retention alone. For source-connector claims it must cover the complete chain needed to reconstruct source position: source lineage + primary transactional offsets + Kafka transaction state, with any mirror treated as a separate claim.

## Next
AB104.625: research source-offset reset/fencing implementation and crash windows around alterOffsets, then map administrative offset changes to Nexo AuthorityEpoch/AdmissionGeneration and historical-vs-current source position.
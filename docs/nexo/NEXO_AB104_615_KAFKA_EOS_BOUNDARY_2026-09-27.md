# NEXO AB104.615 — exact EOS boundary for Kafka Connect source connectors
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
KIP-618 states that Kafka Connect source EOS atomically writes source records and source offsets to Kafka in one Kafka transaction and fences older source-task generations. It also explicitly limits the guarantee to source connectors that can resume from meaningful offsets without dropping or duplicating records. citeturn0search0 Kafka's connector development guide confirms EOS source support from 3.3.0 and the requirement that the connector resume at the exact source position represented by its offsets. citeturn0search1

## Exact claim boundary
EOS_SOURCE_KAFKA = committed source records + corresponding source offsets are atomically committed within Kafka's transaction boundary, with zombie task fencing where configured.
It does NOT establish:
- source system external side effect atomicity;
- downstream consumer business-effect exactly-once;
- external provider exactly-once;
- current-world truth after provider/resource reincarnation;
- global cross-system atomicity.

## Nexo interpretation
1. Kafka transaction commit -> strong evidence inside Kafka authority domain.
2. Source offset -> replay position evidence, bound to connector/source incarnation.
3. Zombie fencing -> generation-level producer fencing inside Kafka, not universal Nexo authority fencing.
4. Downstream external effect -> separate EffectID, provider incarnation, fence, and reconciliation contract.

## Adversarial tests
T615-1: Kafka EOS transaction commits records+offset, external provider effect later fails -> Kafka EOS remains COMMITTED; external effect UNKNOWN/NOT_COMMITTED independently.
T615-2: connector resumes at offset after source restore with changed source incarnation -> old offset cannot establish current source lineage without transfer.
T615-3: zombie task attempts produce after fencing -> Kafka rejects old transactional generation; this is Kafka-domain fencing evidence.
T615-4: downstream consumer crashes after external effect but before ack -> Kafka EOS cannot classify external outcome.
T615-5: connector claims EOS but cannot resume exactly from source offset -> EOS claim invalid for that connector/configuration.
T615-6: source records and offsets committed to Kafka, but separate global offsets mirror fails -> local EOS transaction remains authoritative for its configured Kafka boundary; mirror state requires separate reconciliation.

## Conclusion
Nexo should model EOS as a typed, scoped mechanism evidence record, never as a universal "exactly once" property. The claim contract must name the authority domain and transaction boundary explicitly.

## Next
AB104.616: research Kafka transactional fencing/generation semantics in source code/docs and compare them with Nexo AuthorityEpoch/FenceRevision; identify exactly what can be reused versus what conflicts.
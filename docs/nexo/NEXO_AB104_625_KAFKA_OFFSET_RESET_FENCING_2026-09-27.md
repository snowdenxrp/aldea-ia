# NEXO AB104.625 — Kafka offset reset/fencing and alterOffsets crash windows
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
KIP-875 requires source offset alter/reset requests to target STOPPED connectors. For EOS source support, the worker first fences previously running tasks, then invokes alterOffsets and changes the connector's primary offsets transactionally. The transactional ID is the Connect group ID plus connector name. The KIP explicitly distinguishes definite success from possible success when a connector manages offsets externally. citeturn0search0
The SourceConnector API requires alterOffsets to be idempotent because callers may retry after a failure to write the new offsets. Connectors that manage offsets externally may propagate the change to that external system. citeturn0search1
KIP-875 says source offset reset is considered successful only after tombstones are emitted and the worker reads to the end of the relevant offsets topic; with EOS source support, prior tasks are fenced before reset. citeturn0search0

## Nexo mapping
Offset reset is an administrative authority transition over future source position.
Model:
- OffsetResetIntent
- TargetConnectorIncarnation
- ExpectedTaskGeneration
- ExpectedCurrentOffsetDigest
- NewOffsetDigest
- AuthorityEpoch
- FenceEpoch
- ExternalSourceTransfer/alteration evidence
- ResetOperationID
- outcome {COMMITTED, NOT_COMMITTED, UNKNOWN}
- reconciliation evidence

A successful Kafka-side offset reset does not prove an externally managed source offset was changed unless alterOffsets returned/recorded authoritative external evidence. KIP-875 deliberately distinguishes this case.

## Crash windows
C625-1 fence succeeds, crash before alterOffsets -> old tasks are fenced; reset outcome requires reconciliation.
C625-2 alterOffsets changes external source, crash before Kafka offset commit -> external source may be changed while Kafka primary offset is not; UNKNOWN across domains.
C625-3 Kafka transactional offset commit succeeds, response lost -> reconcile Kafka transaction/offset state.
C625-4 external alterOffsets succeeds, Kafka reset fails -> do not silently retry with new identity; reconcile source + Kafka position.
C625-5 old task attempts after fencing -> participant-local stale task rejected.
C625-6 reset request retried -> same operation identity/idempotency required; new generation must not inherit stale admission.

## Conclusion
AB104.625 establishes that offset administration is a first-class authority/fencing transition, not merely metadata editing. Kafka's sequence—STOPPED -> fence old tasks -> connector-specific alterOffsets -> transactional primary-offset update—maps strongly to Nexo's AuthorityEpoch/FenceEpoch/Reconciliation model, but external source mutation remains a separate claim.

## Next
AB104.626: research Kafka Connect task-generation/config-topic fencing source code around stop/reset and identify whether a crash can leave a fenced generation with externally altered offsets but no durable Nexo-equivalent operation identity.
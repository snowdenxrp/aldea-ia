# NEXO AB104.619 — Kafka replication durability boundaries
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
Kafka documentation states that with acks=all, min.insync.replicas requires enough ISR members for a write to succeed; replication factor 3 + min.insync.replicas 2 is a typical majority durability configuration. Kafka also states committed messages are not lost while at least one ISR remains alive. citeturn1search0turn1search1
Kafka documents unclean leader election as a last-resort election of a replica outside ISR and explicitly warns this may cause data loss. Default is false. citeturn1search0
Kafka 4.x ELR changes leader-election behavior: when ISR is empty, eligible leader replicas can be selected before the last known leader; strict min-ISR prevents the high watermark from advancing below min ISR. citeturn1search11

## Nexo evidence boundary
acks=all + minISR is durability evidence only for the configured Kafka partition/replication domain. It does not establish permanent survival through arbitrary cluster loss, identity continuity after restoration/rebuild, external effect completion, or global authority continuity.

unclean.leader.election=true is a direct downgrade of the evidence model for historical committed state because a non-ISR replica may become leader with data loss. A recovered state from such a lineage must not be treated as automatically equivalent to the prior authoritative state.

ELR is not itself a proof of safety; it changes leader-selection semantics. EvidenceRecord must capture Kafka version/configuration relevant to the election regime.

## Confidence/UNKNOWN rules
D619-1: acks=all + minISR satisfied + authoritative transaction-state record replicated under clean lineage -> strong Kafka-domain evidence.
D619-2: insufficient ISR / NotEnoughReplicas -> no successful durability claim.
D619-3: unclean election occurred or may have selected a stale replica -> historical state potentially lost; affected transaction outcome becomes UNKNOWN until authoritative lineage is reconciled.
D619-4: cluster restore/rebuild -> new authority incarnation unless explicit continuity evidence exists.
D619-5: ELR-enabled regime -> record election regime/version in provenance before interpreting recovered state.
D619-6: external effect remains independent regardless of Kafka durability.

## Adversarial tests
T619-1 ISR drops below minISR during transaction-state append.
T619-2 acks=all response lost after replicated append -> reconcile Kafka state, not infer failure.
T619-3 unclean leader election after committed transaction-state record -> test whether authoritative history is lost/retained; classify lineage before trusting state.
T619-4 KRaft ELR selects non-ISR eligible replica -> verify high-watermark/transaction-state interpretation.
T619-5 cluster restore creates new incarnation -> reject old evidence as current authority without explicit transfer.
T619-6 Kafka transaction COMMITTED while external effect UNKNOWN -> preserve both claims.

## Conclusion
Kafka durability is conditional, configuration-dependent evidence. Nexo should store replication/election regime alongside recovered transaction evidence and quarantine/reconcile when lineage may have lost authoritative history. No implementation or fault test execution claimed.

## Next
AB104.620: research Kafka transaction-state topic-specific replication/configuration and retention/compaction semantics; determine whether transaction outcome evidence can disappear or become non-reconstructible and what Nexo durable anchoring requires.
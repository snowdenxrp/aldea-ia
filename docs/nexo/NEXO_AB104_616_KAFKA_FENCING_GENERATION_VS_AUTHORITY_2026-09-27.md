# NEXO AB104.616 — Kafka fencing/generation vs Nexo authority fencing
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
KIP-618 defines Kafka transactional fencing through transactional IDs and producer epochs: initializing a new producer for the same transactional ID bumps the PID epoch, fencing the older producer, and recovering its incomplete transaction. Kafka Connect source EOS also uses connector/task generations and proactively fences old task producers before new tasks start. citeturn0search0turn0search2

## Exact mapping
Kafka ProducerEpoch/transactional-ID fencing:
- protects a Kafka transactional producer identity;
- rejects/fences older producer generations inside Kafka;
- can recover an incomplete Kafka transaction;
- depends on the configured transactional ID and Kafka coordinator state.

Nexo AuthorityEpoch/FenceRevision:
- protects a broader Nexo authority/admission claim;
- must bind authority to dependency graph/version-set, provider/resource incarnation, effect contract, recovery generation and external-effect policy;
- must survive UNKNOWN and distinguish historical commit from current admissibility;
- must not assume an external provider honors Nexo fencing.

Therefore:
1. ProducerEpoch -> reusable evidence/mechanism for one participant's generation fencing.
2. Kafka transactional ID -> scoped participant identity, not Nexo EffectID or global authority identity.
3. Kafka zombie fencing -> 🟢 mechanism evidence for participant-local stale-writer suppression.
4. Kafka epoch bump -> 🔵 extension candidate for a Nexo participant FenceEpoch, only inside the Kafka domain.
5. Treating Kafka epoch as universal Nexo AuthorityEpoch -> 🔴 conflict.

## Important limitation
KIP-618 requires source connectors to have at most one task per source partition at a time and to resume from upstream using framework source offsets for EOS viability. Therefore the fence is part of a larger connector-specific claim, not a standalone proof of global exactly-once. citeturn0search0turn0search2

## Adversarial tests
T616-1 old producer sends after epoch bump -> Kafka fencing evidence.
T616-2 old task has external effect after Kafka fence -> Kafka fence does not classify external effect; UNKNOWN/reconciliation remains separate.
T616-3 same transactional ID reused after authority reincarnation -> Kafka producer generation is not automatically Nexo authority continuity.
T616-4 task config changes after fencing but before start -> Connect's config-topic/generation checks demonstrate that fencing alone is insufficient; admission/config lineage also matters. citeturn0search0
T616-5 Kafka transaction commits while external provider fails -> Kafka COMMITTED, external outcome independent.
T616-6 Nexo authority revoked while Kafka producer remains valid -> Kafka producer validity cannot override Nexo authority.

## Conclusion
Reuse Kafka's pattern, not its scope: generation-specific fencing + durable identity + explicit predecessor invalidation are strong architectural mechanisms. Nexo must place them beneath a higher-level authority/admission contract and keep external effects/reconciliation separate.

## Next
AB104.617: research Kafka transactional producer state/recovery and failure semantics (epoch bump, abort/commit recovery, coordinator changes), then map exact UNKNOWN states to Nexo reconciliation.
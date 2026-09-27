# NEXO AB104.611 — concurrent inbox uniqueness + CDC relay failure semantics
Date: 2026-09-27
Status: research/design only; no implementation or executed-test claim.

## Evidence
- Current Microsoft idempotent-consumer guidance states that check-then-process is race-prone under concurrent duplicate delivery; a database uniqueness constraint is the correctness arbiter. It also states dedup marker + business effect should commit atomically when possible, while external effects require an in-progress/reconciliation state. 
- Debezium outbox emits a unique event ID specifically intended for consumer deduplication; the outbox is append-only in its documented pattern.
- etcd transactions atomically evaluate all comparisons, so compare predicates can serve as a concurrency guard inside the etcd authority domain.

## Adversarial scenarios
A611-1 Concurrent duplicate: workers A/B both observe no marker; only one atomic unique claim may commit. The loser must not execute the business effect.
A611-2 Duplicate after local commit/before ACK: redelivery finds committed marker and returns stored outcome.
A611-3 Crash between marker and external effect: if external effect is outside transaction, marker must be IN_PROGRESS, not COMPLETED; recovery reconciles before retry.
A611-4 Same EffectID, different contract digest: identity collision -> BLOCK/QUARANTINE, never treat as duplicate.
A611-5 CDC relay restart: same outbox event ID may be emitted again; consumer dedup must absorb replay.
A611-6 CDC reordering: event ID uniqueness does not prove causal ordering; aggregate/sequence evidence is separate.
A611-7 Stale inbox restore: restore old dedup state under a new consumer incarnation; old marker is historical evidence, not current authorization.
A611-8 Concurrent redelivery across incarnations: old consumer's in-progress marker must not be interpreted as current completed processing without reconciliation.
A611-9 Marker commit then DB snapshot rollback: durable authority incarnation changes; prior marker cannot silently suppress a new logical attempt.
A611-10 Dedup-store unavailable: absence of marker is UNKNOWN, not proof of NOT_PROCESSED; protected effect must HOLD unless a stronger idempotent contract exists.

## Minimum concurrency contract
Dedup key = ConsumerDomainID + ConsumerIncarnation + LogicalEffectID + ContractDigest.
Atomic claim must establish one of CLAIMED/ALREADY_COMPLETED/CONFLICT. CLAIMED is not completion. For external effects, completion requires authoritative outcome evidence. An IN_PROGRESS record must carry lease/epoch/generation and reconciliation identity.

## New distinction
A unique dedup key prevents two current transactions from both owning the same logical effect inside one authority domain. It does not survive authority restore/reincarnation automatically, and it does not fence an external provider.

## Next
AB104.612: research CDC ordering/replay semantics and stale snapshot recovery; define causal ordering evidence separately from dedup identity and test replay after restore.
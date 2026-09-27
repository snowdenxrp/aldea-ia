# NEXO AB104.607 — concrete etcd CAS + outbox/inbox implementation mapping
Date: 2026-09-27
Status: research only.

## Concrete implementation evidence
1. etcd v3 transaction API exposes If/Then/Else; comparisons can target key VERSION, CREATE revision, MOD revision, or VALUE. A transaction applies all comparisons atomically and increments the store revision once for a modifying transaction. The client implementation builds these comparisons and commits one TxnRequest.
2. etcd KeyValue records create_revision, mod_revision, version, and lease. These are useful evidence dimensions but are scoped to the etcd authority domain; they are not a universal Nexo identity.
3. AWS transactional-outbox reference implementation writes business state and outbox event in one DB transaction, then a separate relay publishes to SQS and deletes the outbox row after successful broker response. AWS explicitly notes duplicate delivery and requires idempotent consumers.

## Nexo mapping
- Compare(ModRevision/Version/Value) -> AuthoritativePredicateEvidence (scope=store incarnation, key/range, expected comparator, observed revision/value digest).
- TxnResponse revision/succeeded -> LocalCommitEvidence; never directly ExternalEffectCommitted.
- Outbox row -> durable IntentDeliveryRecord bound to EffectID/OperationID and contract digest.
- Relay publish -> DeliveryAttempt; success means broker accepted delivery, not downstream execution.
- Consumer dedup marker -> ProcessedEffectRecord; must be atomically coupled to the protected side effect when the side effect is locally transactional.
- If dedup marker and effect cannot share an atomic boundary -> outcome can become UNKNOWN after crash and requires reconciliation.
- Retry must retain logical identity; a new EffectID is a new logical effect and cannot be used to resolve the original UNKNOWN.

## New fault-injection matrix
FI-607-A: CAS compare passes -> commit -> response lost. Expected LOCAL_COMMITTED/UNKNOWN_RESPONSE; reconcile same operation.
FI-607-B: compare fails -> no success branch. Expected NOT_COMMITTED for that attempted CAS, but do not generalize to an external effect.
FI-607-C: outbox DB transaction commits -> relay crashes before publish. Expected pending durable intent.
FI-607-D: relay publishes -> crashes before delete. Expected duplicate delivery on retry; consumer dedup.
FI-607-E: consumer effect commits -> crash before dedup/ack. Expected UNKNOWN unless effect state and dedup are atomic/reconciled.
FI-607-F: stale serializable read feeds final gate. Expected HOLD/STALE_ADMISSION.
FI-607-G: watch misses/arrives late. Expected no authority conclusion from absence.
FI-607-H: local CAS commits but external provider timeout. Expected external UNKNOWN, local commit evidence preserved.
FI-607-I: retry after UNKNOWN with new identity. Expected BLOCK.
FI-607-J: key reincarnates after deletion; old revision/EffectID reused against new incarnation. Expected BLOCK absent explicit transfer.

## Important distinction
etcd succeeded=true proves the transaction branch succeeded inside the etcd consistency domain; it does NOT prove a downstream provider mutation, world-state change, or cross-provider atomicity.

## Next
AB104.608: research exact etcd response/timeout ambiguity and restore/incarnation behavior, then design executable crash tests that distinguish local CAS COMMITTED/NOT_COMMITTED/UNKNOWN from external-effect UNKNOWN.
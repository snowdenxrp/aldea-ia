# NEXO AB104.608 — etcd timeout/restore/incarnation + executable crash-test design
Date: 2026-09-27
Status: research only; no Nexo implementation.

## Evidence
- etcd snapshot restore creates a new logical cluster and overwrites member/cluster identity; restored state is therefore a new authority incarnation even when keyspace contents are inherited. etcd recommends revision bumps when consumers/caches depend on watch history because restored revisions can otherwise confuse observers.
- Transactional outbox does not provide exactly-once downstream delivery. AWS explicitly documents duplicate delivery and requires idempotent consumers; the sample relay can publish before its local published marker is durably updated.

## AB104.608 model boundary
LOCAL_CAS_COMMITTED: authoritative store proves the transaction succeeded in its own consistency domain.
LOCAL_CAS_NOT_COMMITTED: authoritative store proves compare branch did not commit for that attempt.
LOCAL_CAS_UNKNOWN: client cannot distinguish commit from lost response/transport failure; reconcile using durable operation identity + authoritative revision/state.
EXTERNAL_EFFECT_UNKNOWN: local CAS outcome is known but downstream provider outcome is not. These are distinct UNKNOWN domains.
RESTORED_AUTHORITY: inherited keyspace does not inherit current authority identity; new AuthorityIncarnation/epoch is required.

## Executable fault tests
T608-1: inject transport failure immediately after etcd Txn commit and before client response. Assert retry does not create a new logical operation; reconciliation determines local outcome.
T608-2: inject client crash after Txn commit. Restart with same OperationID and reconcile before retry.
T608-3: inject stale serializable read immediately before final gate. Assert stale evidence cannot authorize protected mutation.
T608-4: save snapshot, restore new cluster, retain old OperationID record. Assert old AuthorityIncarnation cannot authorize current mutation without explicit continuity transfer.
T608-5: restore older snapshot and watch consumer. Assert revision-bump/new-generation mechanism prevents old watch/cache state being treated as current.
T608-6: outbox publish succeeds, relay crashes before published-marker update. Assert duplicate delivery carries same logical EffectID and consumer dedup prevents a second effect.
T608-7: consumer effect commits, process crashes before acknowledgement/dedup completion. Assert outcome is UNKNOWN unless dedup+effect share an atomic boundary or reconciliation proves state.
T608-8: local CAS commits, external provider times out. Assert LOCAL_CAS_COMMITTED + EXTERNAL_EFFECT_UNKNOWN, never external COMMITTED.
T608-9: after UNKNOWN, retry with a new EffectID. Assert BLOCK until original effect is reconciled.
T608-10: key deleted/recreated after old operation. Assert old revision/operation identity cannot target the new resource incarnation.

## Required evidence per test
operation/effect ID; authority incarnation; store revision/transaction result; provider/resource incarnation; admission/fence generation; fault injection point; durable logs; post-crash reconciliation result; explicit expected state. No test result may be labeled verified until actually executed.

## Next
AB104.609: inspect exact etcd revision semantics and restore revision-bump behavior in source/docs, then convert T608-1..10 into a minimal runnable fault-injection harness specification (still research/design, not Nexo implementation).
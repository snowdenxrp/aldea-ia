# P112 — EFFECT IDENTITY / CROSS-ARTIFACT LINKAGE AUDIT V1 — 2026-10-07

## Scope
Audit existing effectJournal identities and whether they can already link prepared intent, mutation outcome, canonical world-state revision, and recovery.

## Findings
1. The concrete runtime idempotency identity is `missionId:stepId`. This is useful local mission-step deduplication, but it is not a complete protected effect identity.
2. Existing research explicitly records missing bindings: target/resource incarnation, authority epoch/root, and payload fingerprint are not included in the current runtime key.
3. `effectJournal` is persisted as part of `simulation.nexoMemory` when the canonical world-state snapshot is successfully persisted. Thus a journal entry can travel with a committed snapshot.
4. That does NOT make the journal entry itself the canonical commit certificate. The current adapter's terminal `persist()` is in-memory; `persistPreparedIntent` is only a callback seam.
5. `nexoEffectRevision` is local/in-memory and not a durable external acceptance marker.
6. There are three distinct local records: effectJournal, Nexo execution history, and mission outcome. Existing evidence deliberately does not collapse them into one authority. A mission outcome can therefore not substitute for effect evidence, and an effect journal entry cannot by itself prove external target acceptance.
7. The journal is bounded to 200 entries. An unresolved PREPARED/UNKNOWN record can therefore be evicted. Missing journal evidence must not be interpreted as NOT_ATTEMPTED.
8. The current identity can identify a mission step, but it does not establish which canonical world-state revision durably contains the entry. A later reconciliation needs a durable relation such as effect identity → candidate/committed state revision, plus status of that commit.
9. Existing broader Nexo research already names `operation_id` and `effect_identity` as conceptual fields, but these are not demonstrated as a complete implemented cross-artifact binding in the current runtime.
10. Therefore we should NOT invent a new identity yet. The immediate architectural gap is the missing durable linkage/commit provenance, not merely another identifier string.

## Decision
🟢 Existing missionId:stepId identity is real local deduplication evidence.
🔵 It is insufficient as a complete effect identity.
🔵 Existing effectJournal is durable only indirectly through successful canonical snapshot persistence.
🔵 Canonical revision linkage and external-effect acceptance remain separate unresolved facts.
🔴 No exactly-once/external fencing/atomic effect+commit claim.

## Exact next
Audit the current journal entry schema and every status transition (PREPARED, completed/failed/UNKNOWN/blocked), then map which fields survive serialization and which are lost. Goal: determine the smallest existing evidence record that could carry commit provenance without prematurely designing a new protocol.

## DO-NOT-REPEAT
No new identity implementation, no retention patch, no global stateRevision promotion, no TLC rerun, no AB104.185, no AB105.117R.

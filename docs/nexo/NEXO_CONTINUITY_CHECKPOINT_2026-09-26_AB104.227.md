# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.227

## Persisted
- Research: docs/nexo/NEXO_AB104_227_OPERATION_REGISTRY_ATOMICITY_RECEIPT_BINDING_V1_2026-09-26.md
- Commit: b3c8c4d33331dcc955fb5c42bc278a81fb7ff0da

## Core result
- An operation registry is not automatically proof of effect completion.
- Reservation/intent, effect commit, and receipt delivery are distinct durable facts.
- Safest conceptual target boundary: condition authority/fence/version -> atomically mutate target and register EFFECT_COMMITTED -> bind receipt to that commit.
- Registry before effect can create false completion; effect before registry can create UNKNOWN/duplicate risk.
- Same operation_id with different payload fingerprint is collision/quarantine.
- Registry expiry never proves historical non-execution.
- Restoring registry/resource from different snapshots can create inconsistency; common continuity is required.
- Receipt loss after target commit requires reconciliation, not retry.
- Transactional outbox independently confirms publish-then-crash can duplicate external publication.

## Current prototype evidence
- effect-adapter.js SHA: 3ed48663b4da0d165c3a86da248d3f11d1e7b598
- runtime.js SHA: 1b4096bd6868fd9086ba6740f07d6a104a258651
- effect-adapter test SHA: 02050c53303711de7baba5fe276a3e9f8b205681
- intent persistence test SHA: 579964c3e684744d79ec39a3162c3a505ca70072
- runtime key remains missionId:stepId.
- journal capped at 200.
- prepared entries require reconciliation.
- handler exception returns UNKNOWN without persist(); test expects persisted UNKNOWN entry. This discrepancy remains unresolved; no test-pass claim.
- local locks are not distributed fencing.

## External evidence
- AWS durable execution: retries may re-run side effects; stable idempotency keys and conditional writes help tolerate retries. citeturn0search0turn0search6
- etcd: atomic multi-condition transactions and linearizable operations provide a concrete reference primitive. citeturn0search1turn0search4
- Transactional outbox: relay can duplicate publication after crash between publish and recording. citeturn0search9

## Residuals
AB50→AB58 unchanged:
TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.
AB55 remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks.

## Constraints
Research/study only. No V21. No architecture implementation. Preserve UNKNOWN/PENDING and contradictions. No unsupported security/correctness/formal/CI/fault-injection claims.

## Exact next mission
AB104.228: operation-registry state machine and receipt semantics; attack RESERVED→COMMITTED, crashes, negative evidence, expiry/reuse and partial child operations.

## DO-NOT-REPEAT
- registry presence != effect completion
- reservation != effect commit
- registry absence != NOT_COMMITTED
- receipt absence != effect absence
- expiry != historical erasure
- local lock != distributed fencing
- no V21 / no architecture implementation
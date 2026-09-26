# NEXO CONTINUITY CHECKPOINT — AB104.289

Date: 2026-09-26
Canonical repo: snowdenxrp/aldea-ia
Branch: main

## Completed
- AB104.289 researched: fencing/sequencer persistence across restore and target incarnation changes.
- Research commit: 5e73f62da3b56fa3d1fae12d9a6ae56ff3a3efe8

## Carry-forward
- Fencing counters must not silently reset while old tokens may reappear.
- Restore is an authority/incarnation boundary.
- Target-side acceptance must bind fencing generation to target incarnation.
- Revision bumping can prevent visible revision rollback but does not prove external-effect history or current authority.
- If fencing continuity is unproven, pre-restore fencing cannot create executable permission.
- Fencing prevents stale execution; it does not resolve UNKNOWN_EXTERNAL or prove NOT_COMMITTED.

## Constraints
Research only. No architecture implementation, formal verification, semantic freeze, V21 patching, overwrite/delete, or silent migration. Preserve AB50→AB58 unresolved findings.

## Next exact action
AB104.290 — study joint restoration of fencing state + operation registry + authoritative receipts without false NOT_COMMITTED or stale-operation resurrection.

## DO-NOT-REPEAT
- Reset fencing counter != safe continuation.
- Restore validity != current authority.
- Absence after restore != NOT_COMMITTED.
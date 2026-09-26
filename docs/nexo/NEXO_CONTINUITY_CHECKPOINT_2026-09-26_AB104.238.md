# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.238

Research file: docs/nexo/NEXO_AB104_238_CRASH_CONSISTENT_INVALIDATION_JOURNAL_REPLAY_V1_2026-09-26.md
Research commit: cba3a3814716aaf575cc9bb3ad940eb766bcefa6

Core result: invalidation is an ordered evidence stream; derived invalidation state must be reconstructable. Replay must converge idempotently and can never grant effect permission.

Crash findings:
- event not durable -> use authoritative authority-change source, never partial write;
- event durable/traversal incomplete -> resume from event;
- partial dependency traversal -> derived state can be mixed, but source event remains authoritative;
- duplicate event -> same event identity converges;
- reordered event -> sequence/generation/predecessor detects stale/gap;
- concurrent root/revocation changes -> authenticated transition/ordering, not arrival time;
- old snapshot -> must not decrease accepted authority generation or resurrect permission;
- invalidated decision before queue fencing -> queued work still requires current fence.

Candidate event identity: authority_scope + authority_generation + event_id + predecessor + event_type + subject_digest + policy + issuer/authenticity.

Candidate recovery: trusted anchor -> snapshot validation -> journal continuity -> replay after snapshot -> rebuild derived indexes -> verify monotonic generation -> revalidate pending decisions -> expose execution only after current authority checks.

TUF provides a reference separation of coherent Snapshot state, freshness and rollback/freeze detection. citeturn0search0turn0search1

Current prototype: no durable invalidation journal or authority-generation replay engine demonstrated in inspected Nexo path. No implementation added.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; no architecture implementation; preserve UNKNOWN/PENDING and contradictions.

Exact next mission: AB104.239 — mixed snapshot+journal recovery, schema/version changes, forked invalidation histories, root rotation during replay, duplicate event IDs, and proving replay cannot resurrect old executable permission.
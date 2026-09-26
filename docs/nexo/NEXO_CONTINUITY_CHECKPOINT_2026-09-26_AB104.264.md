# NEXO CONTINUITY CHECKPOINT — AB104.264 — 2026-09-26

Persisted research checkpoint.

AB104.264: recovery + concurrency + stale-worker fencing. Raft supports monotonic term fencing and rejection of stale-term requests. etcd supports atomic compare/version/revision transactions and distinguishes linearizable from potentially stale serializable reads. Candidate rule: stale authority/fence must not produce external effects; resource-version/CAS and authority fence are distinct and may need a common linearization point. Recovery must not reconstruct executable permission from stale frontier before current admissibility. Prototype still uses missionId:stepId idempotency and does not demonstrate target incarnation/fence/fingerprint enforcement.

Research-only. No implementation, architecture selection, or semantic freeze.

Persistent unresolved AB50–AB58:
TERNARY_MATH_GAP=FOUND
TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION=UNKNOWN
EVENTDAG_CLOSURE=PARTIAL
RECONSTRUCTION=BOUNDED_ONLY
SEMANTIC_FREEZE=NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED

Prior persistence pending remains explicitly pending: AB104.256, AB104.257, AB104.259. Do not fabricate commit SHAs or treat blob/tree SHAs as commits.

Next: AB104.265 — linearization point during authority transition; stale request arriving exactly across fence transition.
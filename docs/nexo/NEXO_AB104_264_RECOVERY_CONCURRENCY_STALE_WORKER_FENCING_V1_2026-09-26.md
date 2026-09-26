# NEXO AB104.264 — Recovery concurrency and stale-worker fencing — 2026-09-26

Research-only checkpoint. No implementation, architecture selection, or semantic freeze.

Findings:
- Raft terms are monotonic logical clocks; stale-term requests are rejected and stale leaders step down. This supports studying authority-generation fencing, not copying Raft wholesale.
- etcd transactions atomically compare current value/version/revision and apply writes only when all comparisons pass; linearizable reads reflect current consensus, while serializable reads may be stale.
- Candidate invariant: a recovered/stale worker must not produce an external effect when its authority/fence is below the current target fence.
- Resource version/CAS and authority fence are orthogonal: fence answers whether actor generation is admissible; resource version answers whether expected protected state still holds.
- Candidate effect boundary may need to evaluate authority generation + target incarnation + expected resource version + operation identity/fingerprint atomically or under an equivalently proven linearization point.
- Recovery should not reconstruct executable permission from stale historical evidence before current admissibility is established.
- Current prototype evidence: src/nexo/effect-adapter.js uses prepared->reconcile, treats handler exception as EFFECT_OUTCOME_UNKNOWN, and runtime idempotencyKey is missionId:stepId. Prototype does not demonstrate target incarnation/fence/payload-fingerprint enforcement.
- Status: RESEARCHED_NOT_FORMALLY_VERIFIED. AB50–AB58 residuals unchanged.
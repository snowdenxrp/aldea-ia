# NEXO AB104.267 — Atomic domain vs two-phase authority/effect — 2026-09-26

Research-only.

Evidence:
- Raft provides linearizable semantics for commands but a crash after commit before response can leave the client uncertain; unique command serials prevent duplicate execution.
- etcd transactions atomically guard and apply updates; KV operations are linearizable/strictly serializable by default, while watch delivery is not itself linearizable. Timeouts/network disruption can leave clients uncertain about completion.

Finding:
1. One atomic domain is the cleanest proof boundary when authority generation/fence, operation identity, target-state precondition, mutation and receipt can truly share one linearized commit.
2. A two-phase protocol can work only by explicitly accepting an intermediate uncertainty window; PREPARE/ACCEPT/COMMIT evidence must never be treated as equivalent to target mutation.
3. If phase 1 authorizes F7 and F8 becomes current before phase 2, phase 2 must revalidate/fence at the target boundary. Cached authorization is insufficient.
4. Crash between phases => UNKNOWN unless authoritative evidence resolves the target effect.
5. Therefore two-phase does not remove UNKNOWN; it moves the proof burden to recovery/reconciliation.
6. A transaction/consensus system can provide a linearization point for its own state, but that does not automatically linearize an external side effect outside that domain.

Candidate invariant:
AUTHORITY_ACCEPTED != EFFECT_COMMITTED unless the same protected boundary (or an equivalently provable cross-domain protocol) binds both.

No architecture selected. Prototype does not demonstrate an atomic authority+external-effect domain.

AB50–AB58 residuals unchanged. Next: AB104.268 — cross-domain commit protocols / transactional outbox and why they still require external-effect reconciliation.
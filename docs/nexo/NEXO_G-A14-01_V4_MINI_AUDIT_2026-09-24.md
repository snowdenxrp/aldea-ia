# G-A14-01 V4 mini-audit — 2026-09-24

Research checked against Raft, etcd, TLA+ and seL4 documentation.

Finding A: an actor-local observation is not authoritative state.
Finding B: the final protected transition must compare its stored context with current protected epochs.
Finding C: a simple valid/invalid flag is insufficient if validity can be lost and later restored while an old grant remains present.
Finding D: the same issue applies to a stop state that can later be cleared.
Finding E: therefore the admission binding needs currentness lineage and stop lineage, or an equivalent epoch that is guaranteed to advance on each relevant invalidation.
Finding F: capability-like artifacts remain derived outputs and must not be treated as independent authority.

Formal status: NOT PROVEN. SANY/TLC not executed in this environment.
Implementation status: NOT STARTED.
Gate: CLOSED.
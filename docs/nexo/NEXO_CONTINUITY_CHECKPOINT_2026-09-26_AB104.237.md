# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.237

Research file: docs/nexo/NEXO_AB104_237_INVALIDATION_ORDERING_DURABLE_PROPAGATION_STALE_CACHE_V1_2026-09-26.md
Research commit: b106e4c9944967b952d434a271374ef3fe22e402

Core result: durable invalidation is not sufficient by itself. Consequence-bearing paths need authoritative generation or equivalent target fencing.

Key findings:
- cached allow is not current permission;
- lost invalidation is not proof of no revocation;
- derived invalidation indexes are rebuildable accelerators, not authority;
- revocation notification is not target fencing;
- historical effect is not retroactively erased;
- older snapshot restore must not resurrect stale permission;
- target-side linearization is required to order revocation against effect;
- if ordering cannot be established after possible boundary crossing, remain UNKNOWN_EXTERNAL.

External evidence: a current 2026 individual IETF draft discusses revocation finality at protected commit, stale caches, crash recovery, partitions and revocation/effect races. It is draft/reference only. citeturn0search0turn0search5
TUF provides analogous freshness/rollback controls through expiration and coherent Snapshot metadata. citeturn0search1turn0search6

Current prototype: no demonstrated durable invalidation engine, authority-generation fence, dependency traversal or multi-device revocation mechanism in inspected path. No implementation added.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; no architecture implementation; preserve UNKNOWN/PENDING and contradictions.

Exact next mission: AB104.238 — crash-consistent invalidation journal and replay semantics.
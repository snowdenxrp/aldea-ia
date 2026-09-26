# NEXO — CONTINUITY CHECKPOINT AB104.201
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

AB104.201 file:
docs/nexo/NEXO_AB104_201_DURABLE_FRESHNESS_ANCHOR_ATTACK_V1_2026-09-25.md
Commit: 8c1668e309a0ef19b1bc5392c36004ae22db1e66

External evidence studied:
- SQLite atomic commit/recovery/WAL documentation: crash atomicity, durability limits, recovery locks/checksums, and crash-test methodology.
- NIST trust-anchor definition/key-management material: trust anchor is authoritative and its authenticity/integrity must be protected.

Core finding:
ATOMICITY != ANTI-ROLLBACK.
A journal/WAL can make a transition all-or-nothing across a crash while an attacker or restore can still revert the entire mutable image to an older internally consistent state.

Also:
AUTHENTICITY != FRESHNESS.
A valid signature on an old root does not establish current authority.

AB104.201 result:
The true freshness anchor must survive ordinary mutable-state rollback. Candidate protected evidence may involve hardware-backed monotonic counters/rollback-resistant storage, TEE/secure-element semantics, independent multi-device quorum, or external signed checkpoints. No mechanism is selected.

Recovery invariant:
If protected freshness says E is accepted, restored mutable state advertising <E is ROLLBACK/STALE and cannot become canonical.
If mutable state says E while protected anchor says E+1, mutable state is stale/incomplete.
Divergent device roots must not be resolved by timestamp/arrival order.

Code study:
No verified implementation of this protected-anchor invariant has been established in the canonical repo. No implementation claim is made. Future claims require tracing actual persistence/recovery/authority/fencing/effect boundaries and execution evidence.

Historical residuals AB50→AB58 remain unchanged:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

DO-NOT-REPEAT:
- atomicity != anti-rollback
- commit marker != current authority
- valid signature != freshness
- backup consistency != currentness
- local mutable counter != rollback-resistant anchor
- do not select anchor mechanism prematurely
- no V21
- no unsupported verification/CI/fault-injection claims

EXACT NEXT ACTION — AB104.202:
Study concrete rollback-resistant anchor mechanisms and failure modes:
1 hardware monotonic counters/rollback-resistant storage;
2 TEE/secure-element semantics;
3 Android/Apple anti-rollback patterns as comparative evidence;
4 multi-device quorum/equivocation;
5 backup restore/device replacement;
6 key rotation and anchor compromise recovery;
7 map mechanisms to Nexo identity/authority without selecting prematurely.

CONTINUITY:
Next CONTINUITY resumes directly at AB104.202. Preserve all UNKNOWN/PENDING states and AB50→AB58 residuals; do not restart AB104.201.

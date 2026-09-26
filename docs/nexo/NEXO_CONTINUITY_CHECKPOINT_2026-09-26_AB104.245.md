# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.245

Research: docs/nexo/NEXO_AB104_245_MIGRATION_ROLLBACK_COMPENSATION_ANTI_RESURRECTION_V1_2026-09-26.md
Commit: dbd4a0ab4e15e2dba2b29eedc2b0441dddff86e8

Core: representation rollback, compensation, authority transition/revocation, and external compensation are distinct operations. None can silently imply another.

Anti-resurrection invariant: if G is the highest trusted current authority generation, recovery must not expose executable permission below G merely because an older snapshot/representation was restored.

Compensation is itself an effect: it needs its own identity, authority, target incarnation, fingerprint, acceptance/commit evidence, idempotency and reconciliation. Compensation does not erase the historical fact of the original effect.

Attacks covered: old snapshot after authority advance; down-migration authority restoration; partial reverse chain; compensation replay/collision; stale workers; compensation after UNKNOWN original effect; dependency resurrection; target-incarnation rollback; receipt rollback.

External research: TUF rollback/freshness and coherent snapshot metadata; Kubernetes resourceVersion/stale-write protection and stale-controller handling. These are references, not Nexo implementation choices.

Code-search limitation preserved: indexed search did not expose migration-specific implementation; earlier direct prototype inspection remains evidence. No implementation added.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints: research/study only; no V21; no architecture implementation; preserve UNKNOWN/PENDING and contradictions.

Exact next: AB104.246 — crash/recovery during rollback and compensation, atomicity boundaries, partial inverse chains, receipt loss, UNKNOWN original effects, concurrent compensators and reconciliation without double compensation.
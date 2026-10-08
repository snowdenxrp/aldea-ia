# STEP 7 — Minimum Protected PolicyContext Evidence Contract Attack — 2026-10-08

Status: ATTACK COMPLETE — REFINE BEFORE IMPLEMENTATION

## Attack results
1. `policyContent` as embedded content could accidentally become a universal policy snapshot. Keep it semantically governed and do not imply that every policy must be fully materialized.
2. `policyContent` as a live reference could drift after resolution. The protected boundary must establish the semantic content/version/hash used for the evaluation context.
3. `evaluationContext` must remain actual claim/mission context, not a provider-defined scope shortcut.
4. `checks` must contain evidence/facts, not final PASS/FAIL assertions supplied by callers. Otherwise the earlier circular-trust flaw returns.
5. `provenance` cannot authenticate itself. Its authority comes from the protected establishment boundary.
6. `materiality` must identify conditions requiring re-evaluation, not become a new fencing or version mechanism.
7. Dependency evidence must be governed by required roots/relations; the container cannot claim universal closure.
8. No field may imply authorization, admission, commit, execution, or external-effect certainty.

## Refinement
The minimum representation should avoid a generic `checks.status` field. It should carry governed facts/evidence that the evaluator can interpret.

Do not implement yet. First convert this refinement into the smallest concrete contract without introducing a new authority token or dependency/version mechanism.
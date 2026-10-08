# P112 — ISOLATED-SNAPSHOT FINAL VALIDATOR / CONFLICT CLASSIFICATION V1 — 2026-10-07

## Scope
Bounded audit of the final-gate candidate across executeAction()/performDecision() and the Nexo runtime path. Research only; no implementation.

## Findings
1. A single validator can conceptually operate on the isolated simulation snapshot before persistState(), but it must validate the selected claim rather than merely compare stateRevision.
2. Its input must include the selected intent/operation identity, complete claim-specific DependencySet provenance, current authority/invalidation context, participant/resource identity and incarnation, relevant policy/config version, freshness, RNG evidence when outcome-defining, and canonical expectedRevision.
3. The validator must read authoritative current values from the isolated working snapshot after all protected local mutation preparation, not from stale admission-time copies. Derived helpers/aggregates/predicates must be recomputed or their provenance/version validated.
4. executeAction() alone cannot host the universal validator because performDecision() has direct social, knowledge, cooperation and exploration/discovery mutation branches outside executeAction().
5. performDecision() alone is also not a durable commit boundary because shared daily writers and lower-level modules can mutate relevant state outside its ownership, and persistence is separate.
6. The Nexo runtime path currently creates an adapter over the live simulation and can mutate it before canonical persistState(); therefore the validator must sit before the irreversible protected local mutation or operate over an isolated snapshot that has not yet modified canonical state.
7. Post-effect learning/memory/discovery/event writes should not be included in the protected physical commit merely because they occur in performDecision(). They become dependencies only when their current authoritative values influence the protected claim.
8. Failure classification: dependency/authority mismatch before physical effect => STALE_ADMISSION; missing/indeterminate required authority or provenance => HOLD; possible physical effect with no authoritative outcome => UNKNOWN; known prior effect requiring lookup/idempotency/reconciliation => RECONCILE.
9. stateRevision mismatch at persistState() is STALE_COMMIT_CANDIDATE. It is not sufficient to infer STALE_ADMISSION, because the conflict does not identify which semantic dependency changed or prove whether an effect occurred.
10. Therefore the smallest defensible final validator is claim-specific and snapshot-local, followed by existing persistState(expectedRevision). It is not a second persistence wrapper and not a global semantic revision.

## Strong result
🟢 An isolated-snapshot final validator can conceptually cover the protected claim without swallowing unrelated post-effect writes.
🔵 Completeness still depends on dynamic DependencySet capture and proof that every authoritative writer is represented or the whole snapshot is treated as the conflict domain.
🔵 Production conflict/reconciliation ownership is absent today.
🔴 No runtime concurrency/JMM-HB/exactly-once/power-loss claim.

## Exact next
Compare the claim-specific validator against whole-snapshot validation: enumerate what semantic dependencies cannot be safely captured dynamically, and determine the minimum reason to choose composite dependency tokens versus simply treating the isolated snapshot + expectedRevision as the protected conflict domain.

## DO-NOT-REPEAT
No implementation; no new persistence wrapper; no global stateRevision promotion; no TLC rerun; no AB104.185 backfill; no AB105.117R.
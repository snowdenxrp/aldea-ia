# P112 POSTERIOR AB EVIDENCE RECONCILIATION — 2026-10-07

Observed later AB104 artifacts as requested. No later artifact was promoted to replace missing historical primary AB104.185.

## Strong direct correspondence
AB104.180: minimum serialization scope must include every mutation entry point touching an admitted effect write-set.
AB104.181: day-transition writers overlap resource/farm effect write-sets.
AB104.182: no current effect class had enough evidence for standalone protected boundary; proposed versioned transition/conflict contract with state version, ReadSet, WriteSet, DependencySet, fence and stale rejection.
AB104.183: stateRevision is a version/conflict token, not the Nexo authority fence.
AB104.184: concrete lifecycle is capture -> read/mutate -> validate -> conditional commit -> conflict/reconciliation, with bypass audit.

These later artifacts directly corroborate the current P112 research direction. They are retrospective evidence only.

## Stronger later provenance evidence
AB104.600: dynamic dependency capture must reject incomplete instrumentation as STALE_ADMISSION/HOLD rather than best-effort execution; exact next was adversarial derived/cache/helper leakage.
AB104.601: derived values, caches and helpers can erase dependency identity; dynamic capture alone is insufficient without provenance-preserving derivation/capture boundaries.
AB104.602: direct adversarial findings establish MULTI-STAGE DERIVATION, CACHE REFRESH RACE, INVALIDATION LOSS, SPECULATIVE READS, EXTERNAL OBSERVATIONS, CRASH/RETRY, DERIVATION/CACHE COMPOSITION and FINAL-GATE RACE as provenance-loss classes. Minimum provenance includes source predicate/range/aggregate identity, source version/incarnation, evaluator/derivation identity, dependency digest, cache generation, freshness, policy/logic version, AdmissionID/OperationID, capture generation and completeness status.

## New reconciliation result
The current concrete Lúmina audit has now independently reproduced the same classes from actual code: helper-hidden reads, derived scores, predicate membership, collection ordering, normalization writes, memory/knowledge derivations and final handler dependencies. Therefore the P112 direction is not merely hypothetical or imported from later notes.

## Important boundary
AB104.602 explicitly keeps implementation/formal verification blocked. It does not close the executable capture problem. Current P112 remains research-only.

## Status
GREEN: later AB evidence directly corroborates P112 version/dependency/provenance direction.
GREEN: no historical AB104.185 backfill performed.
BLUE: executable completeness, final-gate validation and practical minimal granularity remain OPEN/UNKNOWN.

## DO-NOT-REPEAT
Do not treat later AB notes as primary chronology. Do not implement dependency capture yet. Do not rerun TLC. Do not create AB104.185. Do not claim exact-once or whole-world serialization.

## Exact next
Continue the full admission-chain trace and use AB104.602's provenance-loss classes as adversarial checks against each concrete Lúmina dependency envelope.
# AB104.601 — Derived/cache/helper dependency leakage audit

Date: 2026-09-27
Status: RESEARCH ONLY. No V21, implementation, architecture freeze, or formal verification claim.

## Findings
1. Derived values erase dependency identity unless provenance survives. A helper-computed aggregate such as pressure must carry the authoritative objects/predicates and versions that produced it, or be recomputed through an authoritative dependency-aware evaluator.
2. Cache hits are still reads. Authority-relevant cached data must carry source version/incarnation, dependency digest, freshness/expiry and derivation identity. Otherwise it cannot authorize a protected transition.
3. Helper functions cannot hide authoritative reads. Any helper capable of consulting protected state belongs to the trusted dependency-capture boundary.
4. Aggregates/predicates (count, sum, exists, thresholds, ordering, joins, negative predicates) need predicate/range/aggregate dependency tokens or a conservative enclosing authoritative version. PostgreSQL SERIALIZABLE explicitly uses predicate locking for this class of dependency, and its captured locks depend on the executed query plan. 
5. An observed DependencySet is not proof of completeness. If an authority-relevant access path is uninstrumented, completeness is unknown and final admission must HOLD/REVALIDATE or use a conservative broader version.
6. External provider observations, telemetry and model outputs remain separate evidence classes; if they affect a protected transition they need explicit provenance, freshness, identity/incarnation and validation.

## Minimum provenance candidate
ReadID; source object/resource or predicate/range/aggregate identity; source incarnation; authoritative version/revision; ordering context; evaluator/helper identity+version; input dependency digest; derivation identity; cache identity/source provenance/expiry when applicable; policy/config/logic version when relevant; Operation/AdmissionID; completeness/coverage status; evidence that the read crossed the trusted authoritative boundary.

A canonicalized digest over these records can bind the final DependencySet.

## Safety rule
DependencySetRecorded != DependencySetComplete.
Completeness requires a trusted authoritative access boundary covering all authority-relevant read/derive/cache/helper paths. If coverage cannot be proven:
INCOMPLETE_CAPTURE -> STALE_ADMISSION/HOLD/REVALIDATE.

## External evidence
PostgreSQL 18 documents that SERIALIZABLE relies on predicate locks, that captured locks depend on the query plan, and that data read by a serializable transaction must not be treated as valid until successful commit. PostgreSQL source also states that predicate coverage must include ranges that would have been read, not only tuples actually read. These are direct evidence that dependency tracking must cover semantic read scope and execution/access paths, not only final values. Sources: https://www.postgresql.org/docs/18/transaction-iso.html ; https://doxygen.postgresql.org/predicate_8c_source.html

## Conclusion
Dynamic capture is necessary when static closure is incomplete, but dynamic capture alone is insufficient. The capture boundary plus provenance-preserving derivation/cache mechanisms become claim-specific TCB for dependency-completeness.

## Open gap
Test multi-stage derivation, nested caches, speculative/model-generated reads, provider observations, and crash/retry between capture and final gate.

## Exact next action
AB104.602: adversarially test provenance loss across multi-stage derivation, cache refresh races, speculative reads, external provider observations, and crash/retry between capture and final gate.

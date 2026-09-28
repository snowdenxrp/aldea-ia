# GLOBAL-AUDIT-030 CONTINUITY

Audit commit: 6e218fd4dc01ac2af3199a9f091b23fcbec71613
Previous continuity: 3d42ba1fb0e795f45c820aeeec30ade0705a6d92

Dependency-graph completeness attack completed.

Findings:
- Hidden protected reads make caller ReadSet incomplete unless all authoritative reads cross a claim-scoped access boundary.
- Aggregates require dependency-set/version and predicate identity; aggregate scalar alone is unsafe.
- Layered caches require generation/dependency propagation or trusted invalidation chains.
- External observations may require provider/endpoint/resource identity, incarnation, revision/consistency, freshness and operation identity.
- Different processes/services/models are not automatically independent; common-mode analysis is claim-relative.
- Conditional dependencies must record the branch actually taken.
- Retry can cross dependency generations and requires revalidation.
- Historical claims require historical event/order dependencies; current snapshot cannot substitute.

Required provenance envelope candidate: SourceIdentity, SourceIncarnation, SourceVersion/Revision, ReadID, AdmissionID, DerivationID, ParentDigest, DependencyGeneration, Freshness, ConsistencyMode, Completeness, TrustBoundary. Aggregates additionally require predicate/range/aggregate identity and covered dependency set or authoritative aggregate generation.

Key rule: uninstrumented protected read != no dependency; it is INCOMPLETE_CAPTURE -> UNKNOWN/HOLD/REVALIDATE.

Next exact action: GLOBAL-AUDIT-031 — common-mode/independence attack and claim-scoped TCB boundaries.
No model execution, implementation or V21.
Carryover: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; EventDAG closure PARTIAL; formal verification NOT PERFORMED.

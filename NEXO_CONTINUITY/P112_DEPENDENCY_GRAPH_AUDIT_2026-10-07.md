# P112 — dependency-graph audit extension — 2026-10-07

Status: RESEARCH ONLY. This is an additive current checkpoint, not a backfilled AB104 artifact.

## New retrospective clue
GLOBAL-AUDIT-030 independently extends AB104.600/601 and is directly relevant to the current code audit.

It identifies ten leakage classes:
1. hidden helper reads;
2. aggregate reads;
3. indirect predicate reads;
4. cache reads;
5. layered-cache invalidation;
6. external observations;
7. common-mode dependencies;
8. branch-dependent reads;
9. retry-crossing generation boundaries;
10. historical/order dependencies.

Required read provenance includes:
SourceIdentity, SourceIncarnation, SourceVersion/Revision, ReadID, AdmissionID, DerivationID, ParentDigest, DependencyGeneration, Freshness, ConsistencyMode, Completeness, TrustBoundary.
Aggregates additionally require predicate/range/aggregate identity plus covered dependency set or authoritative aggregate generation.

## Consequence for current Lúmina audit
The exact minimal practical VersionSet cannot yet be fixed by object/subsystem labels. A transition is safe only if its authoritative access boundary captures all claim-relevant reads and derived values.

A hidden/uninstrumented read is NOT equivalent to “no dependency”; it is INCOMPLETE_CAPTURE.

Conservative fallback:
INCOMPLETE_CAPTURE -> UNKNOWN/HOLD/REVALIDATE.

## New precise research target
Map these ten leakage classes onto the actual Lúmina paths already identified:
- tick -> world/society/agents/actions
- direct executeAction resource mutations
- ecosystem aggregate/derived state
- economy/institution/governance thresholds
- helper-mediated state reads
- retry/restart/reconciliation paths.

Do not implement capture yet.
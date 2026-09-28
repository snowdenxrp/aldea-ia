# NEXO GLOBAL AUDIT — CHAT HANDOFF — 2026-09-28

## Recovery instruction
When the next chat receives `CONTINUITY`, resume the global Nexo audit from **GLOBAL-AUDIT-045**. Do not restart chronology, do not repeat completed audits, do not jump to architecture construction, and do not invent missing commits/results.

## Canonical repository
`snowdenxrp/aldea-ia`, branch `main`.

## Current verified endpoint
The global audit has reached **GLOBAL-AUDIT-044**.

- GLOBAL-AUDIT-041: dynamic quorum membership epochs.
- GLOBAL-AUDIT-042: quorum certificate replay, cross-epoch composition, evidence reclamation.
- GLOBAL-AUDIT-043: retention horizons and FutureObs semantics.
- GLOBAL-AUDIT-044: archival summary and history reconstruction.

### Latest verified commits
- 041 audit: `00b3a557b6f206f9dc379fc43d4e95ae8233bbd8`
- 041 continuity: `daa5116998775f8a14c47339610a6a1861c179d7`
- 042 audit: `f29e79aea53cfafbf96dfecb6d9b27176c2c91c9`
- 042 continuity: `9596ec5852310ea08503a1a84e8109c268f9ca98`
- 043 audit: `c82cdf5d85ee4f5a836d3a4d723a9413e01fa749`
- 043 continuity: `2c9c741f7c4eb93ccefb25fe58576b6c68915d81`
- 044 primary artifact commit: `3a98161effea68e8bcfb757db5da0e58a6af72f0`
- 044 continuity blob verified: `64ee083bb54edf39681250df9925de9f038ea1b2`

## What has been established in 041–044

### 041 — Dynamic quorum membership epochs
Quorum certificates are meaningful only relative to exact membership epoch/generation, participant incarnation, evidence generation and claim scope. Membership epoch != authority epoch. Historical certificates may support historical claims without supporting current claims. Split-brain/local quorum does not imply a single global authoritative quorum. Reconfiguration needs an explicit transition relation.

### 042 — Replay / cross-epoch composition / reclamation
Certificate signature validity does not prevent semantic replay. Cross-epoch composition is not valid merely because each certificate is individually valid:
`VALID(Q1) + VALID(Q2) != VALID(Q1 ∪ Q2)` unless an explicit reconfiguration/composition contract proves it. Historical evidence is not automatically current evidence. Evidence reclamation is claim-relative and requires an authoritative reconstruction path; deletion can alter future distinguishability.

### 043 — Retention horizons
Finite retention is not automatically semantically safe. Late disputes, delayed invalidations and delayed external outcomes can require deleted distinctions. Safe finite retention needs explicit semantic bounds or sufficient authoritative reconstruction checkpoints, or explicit claim-scope exclusion. Retention policy can affect FutureObs semantics.

### 044 — Archival summary / reconstruction
`SUMMARY_PRESENT != RECONSTRUCTION_COMPLETE`.
A summary can lose actual UsedAdmissionContext linkage, event order, resource incarnation, dependency/provenance, negative-space completeness or contradiction state. Repeated compaction must preserve semantic soundness compositionally across the whole chain. Cryptographic digest integrity does not prove semantic completeness:
`INTEGRITY != COMPLETENESS`.
Unsupported reconstruction must yield UNKNOWN rather than selecting an arbitrary compatible witness.

## Global epistemic state — DO NOT CHANGE SILENTLY
- `P_AA quotient congruence = UNKNOWN`
- `FutureObs_PAA = UNKNOWN`
- `R1-R5 completeness = UNKNOWN`
- `R1-R5 minimality = UNKNOWN`
- `dependency completeness = UNKNOWN`
- `TCB completeness = UNKNOWN`
- `evidence reducer completeness = UNKNOWN`
- `independence proof = UNKNOWN`
- `quorum semantics completeness = UNKNOWN`
- `retention/reconstruction soundness = UNKNOWN`
- `formal verification = NOT_PERFORMED`
- `implementation = NOT_STARTED`
- `V21 = FORBIDDEN / NOT_STARTED`
- `semantic freeze = NOT_DECLARED`

## Earlier carryover that must remain visible
AB55/AB56 did not close FutureObs_PAA. AB55 only executed a minimal Boolean state/order exploration, not the full UsedAdmissionContext/EventDAG/FutureObs_PAA space. AB56 specified the missing interpreter but did not close it. Do not let later audits erase this fact.

## Method constraints
Continue:
`INVESTIGAR → ANALIZAR → CONSTRUIR → GUARDAR`
But the project is still in research/audit. Construction here means research artifacts only, not Nexo implementation.

For each new audit:
1. Inspect primary evidence where possible.
2. Attack the current semantic boundary adversarially.
3. Separate candidate model/specification from executed verification.
4. Preserve UNKNOWN when evidence is insufficient.
5. Create an audit report in `docs/nexo/`.
6. Create/update a continuity checkpoint with exact commit/blob information.
7. Never invent a GitHub commit or claim a test/tool was executed without evidence.

## NEXT EXACT MISSION — GLOBAL-AUDIT-045
Attack **composition of repeated archival summaries and reconstruction-version/schema migration**.

Questions to answer:
1. Can two individually sound summary transformations compose without losing a distinction needed by a later claim?
2. What happens when SummaryV1 is reconstructed into SummaryV2 with a different schema/derivation rule?
3. How are old reconstruction rules/version identities bound to archived evidence?
4. Can migration accidentally reinterpret historical evidence under a newer semantic contract?
5. How are LossSet, completeness boundaries and UNKNOWN preserved across migration?
6. Can a migrated summary remain integrity-valid while becoming semantically incomplete?
7. What happens when migration itself occurs across authority/resource/membership epochs?
8. What minimum provenance is required to reconstruct the original semantics or conservatively return UNKNOWN?

Expected focus:
`SummaryVersion`, `DerivationID/Version`, `SourceHistoryRange`, `ClaimScope`, `LossSet`, `CompletenessStatus`, `AdmissionLinkage`, `EventOrder`, `IncarnationBindings`, `DependencyClosure`, `InvalidationState`, `ReconstructionContract`.

Do not assume migration is semantics-preserving. Demand an explicit refinement/observational-equivalence argument or preserve UNKNOWN.

## DO-NOT-REPEAT
Do not redo 041–044 except where needed as a direct premise for a new attack. Do not begin architecture implementation. Do not claim FutureObs, quotient congruence, retention soundness, or reconstruction completeness is solved.

## Continuity principle
The next chat must be able to continue from this file alone plus the repository artifacts. The canonical state is the repository evidence, not the conversational context.

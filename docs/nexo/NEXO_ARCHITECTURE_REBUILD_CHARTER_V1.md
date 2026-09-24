# Nexo Architecture Rebuild Charter V1

Date: 2026-09-24
Status: RESEARCH/ARCHITECTURE TRANSITION — NOT IMPLEMENTATION

## Purpose
Create a clean Nexo architecture from the accumulated research and audits rather than extending V1–V20 by patches. V1–V20 remain historical research/design lineage and are not discarded.

## Non-negotiable continuity
The rebuild MUST preserve:
- the chronological research lineage V1–V20;
- every recorded defect, rejected mechanism, audit, invariant, formal sketch, and evidence limitation;
- the distinction `DESIGNED != IMPLEMENTED != TESTED != VERIFIED`;
- the open-gap register and unresolved questions;
- provenance for every architectural decision carried into the new design.

## Distillation rule
Each historical item is classified as exactly one of:
1. `CARRY_FORWARD` — survives into the clean architecture.
2. `REWORK` — useful concept, but semantics/interface must be redesigned.
3. `REJECTED` — demonstrated unsafe/incomplete/contradictory and must not be inherited.
4. `HISTORICAL_ONLY` — retained for lineage/evidence but not part of the new architecture.
5. `OPEN` — insufficient evidence; cannot be promoted yet.

No historical mechanism is carried forward merely because it exists in V20.

## Target architecture layers
The clean architecture is expected to preserve the researched conceptual boundaries, subject to final audit:

0. Constitution / Trust
1. Identity / Authority
2. Mission / Goal / Intent
3. Request / Effect Identity
4. Policy / Admission
5. Coordination / Fencing
6. Execution / Actuation
7. Observation / Reconciliation
8. Verification / Assurance
9. Durable History / Recovery

Cross-cutting safety/recovery planes remain separately modeled: Emergency Stop, Recovery Fence, Update/Rollback/Bootstrap, Evidence/Provenance, Dependency Closure, Common-Mode Analysis.

## Construction gate
The clean architecture must not be implemented until the following are separately reviewed:
- distilled principles/invariants;
- object boundaries and ownership;
- state machines and forbidden transitions;
- authority and epoch semantics;
- effect identity and reconciliation semantics;
- emergency-stop and recovery semantics;
- evidence/provenance/assumption model;
- dependency/common-mode model;
- formal correspondence/refinement plan;
- verification/toolchain boundaries;
- remaining open gaps.

## Verification strategy
The architecture will eventually be represented at multiple evidence layers. TLA+ supports refinement mappings for showing that a lower-level specification implements a higher-level specification; this is an explicit future gate, not a claim that the current sketches are already refined or verified. citeturn0search18turn0search0 TLAPS proof obligations are individually fingerprinted and can be tracked across proof evolution, which aligns with the existing proof-lineage work. citeturn0search1turn0search19

## Explicit prohibition
This charter does NOT authorize:
- V21 implementation;
- runtime construction;
- silent migration of old code into the clean architecture;
- deletion of historical artifacts;
- declaring the new architecture verified before its own gates pass.

## Current status
`CHARTERED / RESEARCH CONTINUES / IMPLEMENTATION BLOCKED BY DESIGN`

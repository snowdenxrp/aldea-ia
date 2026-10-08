# NEXO CONTINUITY — NEW CHAT HANDOFF — 2026-10-08

## Mission
Resume Nexo from the end of P112 research without losing evidence or repeating closed audits. Goal: a correct, evidence-driven Nexo Core with no patches, silent migration, or invented verification.

## Current decision
AB105 is **frozen evidence**, not an active audit queue. MASTER is the operational guide. P112 broad research has reached the point where another general audit is more likely to repeat than change architecture.

Protected anchor: **AB105.116R**.
AB105.117R: **PROHIBITED**.
TLC: **FROZEN; DO NOT RERUN**.
No historical AB104.185 backfill.

## Established evidence
- Safety is a **protected transition footprint**, not a fixed object version.
- WriteSet-only validation is insufficient; admission reads, transitive dependencies, predicates/ranges/aggregates, derived/cache/helper inputs, identity/incarnation, policy/config/logic and causal random/time/external observations matter when they influence the protected claim.
- Existing persistState(expectedRevision) is a usable conservative conditional snapshot-commit primitive for cooperating canonical world-state writers.
- It is NOT by itself final semantic validation, complete dependency coverage, external-effect exactly-once, power-loss durability, or universal writer fencing.
- applyState() isolates world/agents but current evidence found mutable nexoMemory/effectJournal object aliasing that must be detached for protected candidate isolation; event-object alias is a conservative lower-confidence boundary.
- Random/time/external/provider inputs are causal provenance and are not covered merely by stateRevision.
- Inspected Lumina handlers are local snapshot mutations, not currently proven irreversible external effects. Future external effects require explicit durable intent/effect identity and UNKNOWN/RECONCILE semantics.
- Effect journal can retain PREPARED but is bounded/evictable and lacks a non-evictable tombstone; missing evidence never means NOT_ATTEMPTED.
- Runtime has no complete final semantic revalidation → persistState(expectedRevision) protected-transition owner; this is a construction gap, not a reason for another broad audit.
- Mission/finding provenance has compression boundaries: planner deduplication, eight-step cap, and durable mission projection. Action+target equality is not proof of claim equivalence.
- Eight-step cap is historically intentional as bounded orchestration; do not silently remove it. Its omitted-candidate semantics need explicit treatment when redesigned.

## Canonical architecture
**INTENT → PROVENANCE/DEPENDENCIES → ISOLATED STATE → FINAL VALIDATION → CONDITIONAL COMMIT → RECONCILIATION**

When safe commit cannot be proven, use **UNKNOWN/STOP/HOLD** according to the contract rather than guessing.

## Mandatory rules
1. Evidence first; no invented verification.
2. No patches or silent migration.
3. No rerun of closed audits merely for confidence.
4. If new implementation facts contradict a recovered invariant, stop and investigate.
5. Use AB105 only as historical evidence when MASTER lacks a needed detail; do not replay AB105.
6. Keep UNKNOWN/PENDING explicit.
7. Do not invent a global semantic revision/token just to simplify implementation.
8. Do not claim JMM happens-before, exactly-once, or power-loss durability unless separately proven.

## Exact next work
### STEP 1 — FINAL DESTILLATION
Do one concise synthesis of recovered evidence into the minimum Nexo Core contracts:
- authority + STOP/fence boundary;
- identity/incarnation;
- claim/provenance/dependency envelope;
- isolated working snapshot boundary;
- final semantic validator;
- conditional commit using existing persistState(expectedRevision);
- conflict classification;
- UNKNOWN/HOLD/RECONCILE contract;
- operation/effect identity boundary for future external effects.

This is **distillation, not another repository-wide audit**.

### STEP 2 — CORE CONSTRUCTION DESIGN
Define modules/interfaces and ownership before modifying the old orchestration path. Do not turn the legacy orchestrator into the Core by incremental patches.

### STEP 3 — BUILD THE PROTECTED-TRANSITION SKELETON
First implementation target is the protected transition lifecycle, with explicit evidence/provenance and conservative conflict handling. Existing Lumina handlers can later execute against an isolated candidate snapshot.

### STEP 4 — VALIDATE EACH NEW INVARIANT
Every implementation claim needs source/test evidence. If it cannot yet be proven, mark it PENDING/UNKNOWN and do not hide it.

## CONTINUITY instruction
The next chat must start at **STEP 1 — FINAL DESTILLATION**, then proceed to Core construction. Do NOT restart P112, AB105, VersionSet, provenance, mutable-graph, persistState, or mission-cap audits unless new code produces a contradiction.

## Key saved artifacts
Use MASTER P112 and its addenda in NEXO_CONTINUITY. Important evidence includes VersionSet, admission-chain/provenance, final-gate, protected-footprint/writer graphs, isolated snapshot/final validator, persistState feasibility/crash cuts, runtime protected-transition gap, action irreversibility, mutable graph, random causal-input, effect journal/recovery, and mission provenance/cap analyses.

## Final principle
We are not stopping because research is perfect. We are stopping because the evidence now tells us what the architecture must be; remaining non-architecture-changing uncertainty belongs as explicit PENDING states during construction rather than endless re-auditing.

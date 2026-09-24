# NEXO CONTINUITY CHECKPOINT — 2026-09-24

## Purpose
Checkpoint explícito para poder retomar la investigación en otro chat sin empezar a ciegas ni alterar la arquitectura histórica.

## Canonical repository
Repository: snowdenxrp/aldea-ia
Current latest research commit verified before this checkpoint:
94119991a46492b7dfa8a152ce9cd07995095057e23

## Current mode
RESEARCH + CLEAN ARCHITECTURE DESIGN ONLY.
NO V21 implementation.
NO patching V20.
NO deletion/overwrite of historical research.
Open gaps remain open unless independently closed with evidence.

## What is already persisted
The research sequence has been continuously persisted as separate immutable historical documents/commits, including:
- formal unification / PG-009
- recovery, restart, fencing
- common-mode and dependency closure
- invalidation durability and trace correspondence
- cross-resource atomicity
- post-commit/pre-observation failure
- double-failure rollback/recovery
- recovery ownership and split recovery
- STOP/external-effect races
- UNKNOWN and compensation selection
- concurrent effects and compensation races
- multi-resource quarantine and hierarchical containment
- coordination-domain scope computation
- absorbing safe states and hidden continuations
- open-world effect-path closure
- in-flight revocation/update/replacement/crash/restore
- effect identity, retry/redrive, continuity and compatibility
- admission/invalidation races and durable intent
- control/effect commit and ACK ambiguity
- mission invariants and temporal resource conservation
- partial-order reduction and commutativity
- abstraction soundness and assume-guarantee closure
- proof-context fingerprinting/reproducibility
- semantic identity/equivalence
- proof/policy/effect drift
- partial invalidation and authoritative cutoff
- control atomicity vs external effect boundary
- effect-contract floor
- quorum loss and independent fencing
- enforcement boundary and open-world/break-glass closure
- proof reuse and migration/effect drift
- mixed-generation assurance
- assurance commit and ownership/fencing
- dynamic trust discovery and scope widening
- live effects with dynamic trust/invalidation
- resource-side fencing/provider continuation
- partial multi-resource fencing and degraded claims
- stale capability and claim binding
- bounded delegation/revocation closure
- multi-parent authority composition
- authority cycles/bootstrap
- root rotation/compromise/multi-root trust
- split-brain root rotation/recovery
- reconciliation-of-reconciliation
- concurrent reconcilers and compensation authority races
- compensation storms/uncertainty budgets
- global effect graph cycles and termination

## Latest research conclusion
The latest persisted finding is:
LOCAL_CHAIN_TERMINATION != GLOBAL_EFFECT_TERMINATION.
Independent compensation chains can merge/interact and form a global cycle. Global termination therefore requires interaction closure, not only local chain termination.
Candidate objects: EffectDependencyGraph, EffectInteractionHyperedge, Effect Coordination Component (ECC), EffectClosureContext, GlobalTerminationContext.
Latest document:
NEXO_GLOBAL_EFFECT_GRAPH_CYCLES_TERMINATION_RESEARCH_V1_2026-09-24.md
Commit:
94119991a46492b7dfa8a152ce9cd07995057e23

## Next research gate
Investigate:
ECC MERGE -> INTERACTION -> SPLIT / SCOPE REDUCTION + CAUSAL MEMORY / GARBAGE COLLECTION.

Questions:
1. Conditions for safe split after interaction.
2. Residual causal/effect/resource/evidence/callback/delegation/mission-invariant dependencies crossing the boundary.
3. Minimum causal memory that must survive split.
4. Safe history compaction and proof/certificate boundary.
5. Whether garbage collection can destroy evidence needed for future reconciliation.
6. Merge/split oscillation and repeated boundary changes.

Candidate objects:
ScopeSplitCertificate, CausalMemoryBoundary, CausalSummary, InteractionResidue, HistoricalDependencyClosure, EffectGraphCompactionCertificate, SplitSafetyClaim, ResidualDependencySet, CausalTombstone, HistoryRetentionPolicy, BoundaryReclamationContext.

Candidate split protocol:
REQUEST_SPLIT -> FREEZE_NEW_CROSS_EFFECTS -> COMPUTE_CROSS_BOUNDARY_CLOSURE -> IDENTIFY_RESIDUAL_DEPENDENCIES -> FENCE/INVALIDATE_CROSS-SCOPE_PATHS -> VERIFY_NO_ACTIVE_CROSS-BOUNDARY_EFFECTS -> ESTABLISH_HISTORICAL_SUMMARY/TOMBSTONES -> LINEARIZE_SPLIT -> PUBLISH CLAIM.

## Mandatory continuity rules
- Preserve V1-V20 lineage and all research; never silently replace history.
- Preserve all open gaps and uncertainty.
- Do not promote design conclusions into runtime/correctness guarantees.
- Do not implement V21 during the research gate.
- Every substantive research round must be persisted before moving to the next major round.
- If a new chat begins, read this checkpoint plus NEXO_CONTINUITY_HANDOFF_2026-09-24.md and the latest research documents/commits before proceeding.

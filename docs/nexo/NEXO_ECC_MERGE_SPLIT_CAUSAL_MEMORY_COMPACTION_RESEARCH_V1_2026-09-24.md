# NEXO ECC MERGE-SPLIT, CAUSAL MEMORY AND SAFE COMPACTION RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching.
This document extends the persisted global-effect-graph research and does not close any formal/runtime gap.

## Research question
After two Effect Coordination Components (ECCs) interact and later appear separable, when may Nexo reduce coordination scope without forgetting causal information that could matter for future reconciliation, authority, evidence, or mission invariants?

## Core findings

### 1. Scope reduction is not history erasure
SCOPE_REDUCTION != HISTORY_ERASURE.
An ECC boundary may shrink only if the current protected interaction closure is proven separated. Historical facts that remain necessary to interpret late effects, stale evidence, resource incarnations, callbacks, delegated capabilities, compensation lineage, or mission invariants must survive either as raw history or as a sound causal summary.

### 2. No current interaction is weaker than no historical dependency
NO_CURRENT_INTERACTION != NO_HISTORICAL_DEPENDENCY.
A split is unsafe if a late provider callback, queued retry, delegated capability, delayed job, stale observer, resource incarnation transition, or compensation can still carry causal consequences across the proposed boundary.

### 3. Compaction is a claim-preserving transformation, not deletion
COMPACTION != LOSSLESS_CLAIM_PRESERVATION.
The system may replace detailed history with a summary only when it can demonstrate that every claim/reconciliation decision still permitted after compaction has enough information in the retained summary to reach the same safe classification, or a deliberately weaker classification.

Distributed-systems literature gives a useful analogue: tombstones and causal metadata can be reclaimed after causal stability, but the safety condition depends on knowing that no replica can later reintroduce a causally concurrent operation; time alone is not sufficient. Version-vector/frontier techniques are used for this purpose. citeturn0search0turn0search3turn0search10

For Nexo, the condition is stricter because the relevant universe is not merely replicas: it includes effect-capable providers, retries, callbacks, delegated capabilities, recovery actors, observers, resource incarnations, and mission-level dependencies.

### 4. The minimum retained object is a causal boundary, not necessarily the full log
Candidate CausalMemoryBoundary should capture the information needed to answer future safety questions at the boundary:
- which effects/attempts existed;
- which effects were causally before/after the boundary;
- which interactions crossed the boundary;
- which effects remain UNKNOWN;
- resource incarnations involved;
- provider/callback/retry/delegation lineages;
- relevant authority/stop/recovery/fence generations;
- mission-invariant dependencies;
- evidence/claim generations;
- assumptions about closed membership/environment;
- a proof/verification context for the summary itself.

A compact summary is acceptable only if its abstraction boundary is explicit and its lost detail cannot change the permitted claim classification.

### 5. Split requires closing future paths, not merely observing an empty queue
QUEUE_EMPTY != NO_FUTURE_CROSS_BOUNDARY_EFFECT.
The proposed split gate is:

REQUEST_SPLIT
→ FREEZE_NEW_CROSS_EFFECTS
→ COMPUTE_CROSS_BOUNDARY_CLOSURE
→ IDENTIFY_RESIDUAL_DEPENDENCIES
→ FENCE/INVALIDATE_CROSS-SCOPE PATHS
→ VERIFY NO ACTIVE CROSS-BOUNDARY EFFECT PATH
→ ESTABLISH HISTORICAL SUMMARY/TOMBSTONES
→ LINEARIZE SPLIT
→ PUBLISH CLAIM

Any unknown open-world path blocks a strong split claim.

### 6. A provider can invalidate an apparently completed split
If a provider can redrive, callback, retry, or replay an earlier effect after the split, then the old effect remains an interaction path unless the provider-side continuation is contractually fenced/rejected or the environment is explicitly bounded. This follows the earlier effect-path-closure research: closed/boundary worlds can support stronger closure claims; unknown open-world environments require weaker claims.

### 7. Resource replacement creates a new causal identity
A replaced resource is not merely the old resource with a new state.
RESOURCE_REPLACED != HISTORICAL_EFFECT_ERASED.
The split summary must preserve the resource-incarnation relationship needed to distinguish old effects from effects against the replacement.

### 8. Delegation can survive the apparent split
A child capability, delayed job, callback, or provider continuation can outlive the parent ECC's active workload. Therefore capability lineage must be part of cross-boundary closure. Expiration is not equivalent to proof of immediate revocation.

### 9. Mission invariants can keep ECCs coupled after effect-level separation
Two ECCs may have no active direct effect interaction while still sharing a mission invariant or resource-conservation constraint.
Therefore:
EFFECT_GRAPH_SEPARATION != MISSION_INVARIANT_SEPARATION.
A split can require only a weaker local claim if the mission-level coupling remains.

### 10. Compaction must preserve UNKNOWN
A dangerous optimization is to compact an unresolved historical effect into "nothing remains."
UNKNOWN + COMPACTION != NO_EFFECT.
If the original evidence only supported UNKNOWN, the summary must preserve UNKNOWN or a conservative superset of possible outcomes.

## Adversarial split cases
1. queued callback appears after split;
2. retry/redrive executes from an old attempt;
3. resource is replaced between closure calculation and split;
4. delegated child capability remains active;
5. evidence is compacted and later needed for reconciliation;
6. rollback makes the current resource look clean while historical effects remain possible;
7. mission invariant spans both components;
8. network partition hides an active dependency;
9. provider resurrects/replays an old continuation;
10. stale observer publishes old evidence after split;
11. snapshot restore reintroduces pre-split state;
12. merge/split oscillation causes repeated boundary changes.

All cases support the same structural rule: the split boundary must be an authoritative transition with a frozen context, explicit closure assumptions, enforcement verification, and retained causal residue sufficient for future claims.

## Candidate objects
- ScopeSplitCertificate
- CausalMemoryBoundary
- CausalSummary
- InteractionResidue
- HistoricalDependencyClosure
- EffectGraphCompactionCertificate
- SplitSafetyClaim
- ResidualDependencySet
- CausalTombstone
- HistoryRetentionPolicy
- BoundaryReclamationContext

## Candidate invariants
SP-01: A published split claim MUST NOT exceed the verified post-split enforcement scope.
SP-02: A split MUST NOT erase information required to distinguish any still-possible effect outcome relevant to a protected claim.
SP-03: NO_CURRENT_INTERACTION MUST NOT be treated as proof of NO_HISTORICAL_DEPENDENCY.
SP-04: Every cross-boundary continuation that can still produce a protected effect MUST either be fenced/rejected or remain inside the coordination closure.
SP-05: Resource incarnation changes MUST invalidate incompatible historical bindings rather than silently reconnecting them.
SP-06: Compaction MUST preserve every currently supported safety claim, or explicitly degrade the claim.
SP-07: UNKNOWN outcomes MUST survive compaction unless a new independent reconciliation proof resolves them.
SP-08: Mission-invariant dependencies MUST participate in split closure when the requested claim is mission-scoped.
SP-09: Snapshot/checkpoint restoration MUST NOT resurrect authority or erase post-checkpoint causal residue.
SP-10: Repeated merge/split cycles MUST NOT cause loss of causal information needed to reject stale continuations.

## Important distinction: causal stability vs Nexo split safety
Causal-stability GC in replicated data systems is useful evidence for a bounded class of history reclamation: once all relevant replicas have observed an event, tombstone metadata may become reclaimable. But that result relies on a defined membership/causal domain. Literature also notes that open membership and churn complicate this condition. citeturn0search3turn0search10turn0search23

Nexo cannot directly equate "all replicas observed" with "all future causal paths closed." Its closure domain must additionally account for effect-capable external providers, delayed continuations, delegated authority, recovery, resource incarnations, and claim-specific mission dependencies.

Therefore a candidate Nexo rule is:

SAFE_TO_COMPACT(H, C) iff
C proves closure of every dependency class relevant to claim set C,
and the retained summary is sufficient to reproduce or conservatively weaken every permitted future safety decision.

## Compaction levels
C0 — No compaction: retain full history.
C1 — Representation compaction: lossless encoding/compression only.
C2 — Causal summarization: replace events with a formally bounded causal summary while retaining claim-relevant provenance.
C3 — Claim-scoped compaction: retain only information needed for a specified set of claims; all other claims become unsupported/UNKNOWN.
C4 — Destructive reclamation: historical information is actually removed. This requires the strongest closure certificate and must never silently imply stronger world knowledge.

Candidate rule:
CLAIM_SCOPE_AFTER_GC <= VERIFIED_CLOSURE_SCOPE.

## Split/compaction ordering
The safer ordering is:
1. freeze new cross-boundary effects;
2. close effect paths;
3. fence/invalidate stale paths;
4. verify enforcement;
5. establish causal summary/tombstones;
6. linearize scope reduction;
7. only then reclaim raw history covered by the certificate.

Compacting before closure creates a proof-obligation inversion: the evidence needed to prove that compaction was safe may have already been destroyed.

## Merge/split oscillation
A component that repeatedly merges and splits can accumulate "interaction residue." Repeated splitting must not assume that a previous split erased all history. Each new merge creates a new interaction generation. A future split must prove closure against the current generation plus any retained residual dependencies from earlier generations.

Candidate InteractionResidue should therefore be generation-bound and monotonic with respect to unresolved causal possibilities:
- resolved residue may be compacted under certificate;
- unresolved residue persists;
- contradictory/unknown residue cannot be silently dropped;
- a new merge cannot inherit a weaker historical context than the strongest unresolved dependency requires.

## Preliminary conclusion
A safe ECC split is not a graph operation alone. It is a protected claim transition.

The architecture should treat:
MERGE = EXPANSION OF COORDINATION CLOSURE
and
SPLIT = PROTECTED REDUCTION OF COORDINATION CLOSURE SUBJECT TO HISTORICAL RESIDUE.

The split is permitted only when the reduction is proven for the requested claim scope. Historical information may be compressed, but not forgotten merely because the current graph has no visible edge.

This does NOT prove the model correct. Formalization, SANY/TLC, implementation refinement, fault injection, and runtime enforcement remain open.

## Next unresolved attack
The next research target should be:
CAUSAL SUMMARY SOUNDNESS + COMPACTION CERTIFICATE + LATE ARRIVING EFFECT AFTER COMPACTION.

Specifically attack whether a finite summary can be sound when:
- a provider is temporarily unreachable;
- membership changes;
- an old capability is replayed;
- a resource incarnation changes;
- a snapshot predating compaction is restored;
- a stale observer later presents apparently valid evidence;
- a previously unknown effect becomes observable after compaction.

No guarantee should be promoted until that attack is closed.

# NEXO CAUSAL SUMMARY SOUNDNESS, COMPACTION CERTIFICATE AND LATE EFFECTS RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. Formal/runtime gaps remain open.

## Core result
A finite causal summary is not automatically safe merely because it preserves a version frontier. Version-vector style summaries can preserve causal ordering inside a defined membership/causal domain, but truncation or incomplete membership can lose information and force weaker conflict classification. Dynamo's original design treats incomparable histories as concurrent and notes that truncating causal metadata can reduce precision. citeturn0search24turn0search5

For Nexo the stronger rule is:

FINITE_SUMMARY != SAFE_SUMMARY.

A summary is safe only relative to:
1. a defined closure domain;
2. a defined claim set;
3. a defined set of effect-capable continuations;
4. a current context/generation;
5. a sound mapping from discarded detail to conservative future decisions.

## Finding 1 — membership is part of the proof
Classical causal GC can use a minimum version vector over known active clients to identify changes observed by all active members. citeturn0search6
But this does not establish safety for an open universe. A previously disconnected or newly introduced participant can invalidate an assumption if it can later reintroduce causally relevant state.

Candidate object: CausalMembershipClosure.

It must answer:
- Who/what is inside the causal domain?
- Who can still emit an old operation?
- Who can be added?
- Who can be restored from an old snapshot?
- Which providers/callback systems are effect-capable?
- What revocation/fencing mechanism prevents excluded actors from continuing?

If any effect-capable actor is outside the proven closure, the strong compaction claim is blocked or degraded.

## Finding 2 — unreachable is not equivalent to quiescent
A provider being unreachable at compaction time proves only lack of current observation.

UNREACHABLE != QUIESCENT
NO_RESPONSE != NO_CONTINUATION

A provider can later reconnect and reveal a previously attempted effect. Therefore compaction cannot use timeout or communication silence as proof that historical effects do not exist.

## Finding 3 — UNKNOWN must survive compaction
If an effect was UNKNOWN before compaction, replacing its history with ABSENT destroys a safety-relevant distinction.

UNKNOWN -> COMPACTED_ABSENT is forbidden without an independent reconciliation proof.

The summary must retain an uncertainty set or equivalent conservative representation: EffectOutcomeUncertaintySet.

This is consistent with the distributed-systems lesson that concurrent/incomparable histories cannot simply be discarded without changing semantic results. citeturn0search24turn0search1

## Finding 4 — capability replay is a separate closure problem
A causal summary about data history does not by itself prove that old authority cannot produce a future effect.

CAUSAL_CLOSURE != AUTHORITY_CLOSURE.

Before destructive compaction, the architecture must independently establish:
- old capability invalidated;
- queued work fenced;
- provider continuation rejected or fenced;
- retry/redrive lineage closed;
- recovery owner/generation current;
- stale context rejected at the last effect-capable boundary.

Otherwise a late effect can appear after the summary has forgotten the details needed to classify it.

## Finding 5 — resource incarnation must remain explicit
A resource replacement can make an old identifier appear current while representing a different physical/logical incarnation.

RESOURCE_IDENTITY != RESOURCE_INCARNATION.

The causal summary must preserve enough incarnation information to distinguish:
- old effect against old resource;
- new effect against replacement;
- late observation from old resource;
- stale evidence referring to the previous incarnation.

## Finding 6 — snapshot restore is an adversarial resurrection path
If a snapshot taken before compaction can be restored into an effect-capable actor, then the snapshot itself is a hidden causal branch.

SNAPSHOT_RESTORE != HISTORICAL_STATE_REJOIN.

A safe compaction certificate must either:
1. include snapshot lineage in the closure and invalidate/fence pre-boundary snapshots; or
2. restrict the environment so restored snapshots cannot regain effect authority.

This mirrors the structural issue seen in tombstone GC: deleting historical metadata before every relevant causal source is covered permits stale state to reappear. citeturn0search2turn0search4

## Finding 7 — stale observers can corrupt claims without changing the world
An observer may later publish evidence generated before the compaction boundary.

Therefore evidence needs its own currentness context:
- observation generation;
- effect/resource identity;
- causal boundary;
- authority/policy generation where relevant;
- freshness;
- provider identity;
- provenance.

A stale observation may remain useful historical evidence, but cannot silently become current-world truth.

LATE_OBSERVATION != CURRENT_WORLD_TRUTH.

## Finding 8 — compaction is claim-relative
There is no single universal safe-to-forget bit.

A summary may be sufficient for:
- local containment claim;

while insufficient for:
- mission-level invariant claim;
- historical no-effect claim;
- external-world finality claim.

Thus:

CLAIM_SCOPE_AFTER_COMPACTION <= VERIFIED_COMPACTION_SCOPE

Candidate: CompactionClaimContext.

## Candidate compaction certificate

EffectGraphCompactionCertificate should bind at minimum:
- certificate_id
- compaction_generation
- source history boundary
- retained causal summary fingerprint
- closure-domain fingerprint
- membership/actor set and membership policy
- effect-capable provider set
- authority/revocation generation
- stop/recovery/fence generations
- resource-incarnation set
- unresolved effect/UNKNOWN set
- mission-invariant dependencies
- evidence/claim generations
- snapshot lineage constraints
- dependency/common-mode fingerprint
- environment/closure mode
- assumptions
- verification method
- invalidation triggers
- permitted claim classes
- expiry/revalidation conditions
- owner/authority context.

The certificate is not itself authority to execute effects.

## Candidate soundness condition

For history H, retained summary S, closure domain D, and supported claim set C:

COMPACTION_SOUND(H,S,D,C) only if:
1. every effect-capable continuation relevant to C is inside D or independently fenced;
2. every dependency relevant to C is represented exactly or conservatively in S;
3. every UNKNOWN relevant to C remains UNKNOWN or is independently resolved;
4. resource incarnations relevant to C remain distinguishable;
5. stale snapshots/capabilities cannot reintroduce pre-boundary authority;
6. late observations cannot be promoted beyond their provenance;
7. the summary's assumptions remain valid;
8. the certificate itself has a current verification context.

This is a candidate semantic condition, not a proved theorem.

## Attack matrix

A. Provider unreachable during GC
Result: strong compaction blocked unless provider continuation is fenced or provider is inside a closed causal domain.

B. Membership changes
Result: previous frontier cannot automatically cover new members. Membership transition must be part of protected closure.

C. Old capability replay
Result: causal summary insufficient; authority closure required.

D. Resource replacement
Result: incarnation-aware summary required.

E. Snapshot restored before GC
Result: snapshot is a hidden causal branch; must be fenced/invalidated or included in closure.

F. Stale observer after GC
Result: historical evidence may be retained but cannot become current truth.

G. UNKNOWN effect becomes observable later
Result: summary must preserve enough residue to reconcile it; otherwise only weaker claims are allowed.

H. Merge/split oscillation
Result: compaction generation and interaction residue must prevent a new split from inheriting an unsoundly compressed old context.

## New structural separation

This round strengthens the architecture's separation into three independent closures:

1. CAUSAL CLOSURE — can old information/effects still reappear?
2. AUTHORITY CLOSURE — can old authority still create effects?
3. CLAIM CLOSURE — is enough information retained to justify the requested claim?

None implies the others.

A strong compaction claim requires all three to be sufficient for the requested scope.

## Candidate state machine

RAW_HISTORY
→ COMPACTION_PREPARED
→ CAUSAL_CLOSURE_VERIFIED
→ AUTHORITY_CLOSURE_VERIFIED
→ CLAIM_CLOSURE_VERIFIED
→ SUMMARY_COMMITTED
→ RECLAMATION_LINEARIZED
→ COMPACTED

Any invalidation before or after reclamation:
COMPACTED → REVALIDATION_REQUIRED
or, if the retained summary cannot support the claim:
COMPACTED → CLAIM_DEGRADED/UNKNOWN.

No transition to COMPACTED should mean that the external world has been proven free of historical effects.

## Main conclusion
The research does NOT support a universal finite causal memory that lets Nexo forget arbitrary history safely.

It supports a narrower architecture:

FULL HISTORY -> CLAIM-SCOPED CAUSAL SUMMARY -> VERIFIED COMPACTION -> LIMITED CLAIM SCOPE

The summary is safe only inside a closed or explicitly bounded causal/effect domain and only for claims whose proof obligations remain representable after compaction.

Open-world providers, mutable membership, replayable authority, restorable snapshots, unresolved UNKNOWN effects, and mission-spanning dependencies prevent strong destructive reclamation.

Therefore the safe default remains:
UNKNOWN / UNVERIFIED CLOSURE -> RETAIN OR QUARANTINE.

## Remaining open attack
Next research should attack whether the three closures can themselves interact cyclically:

CAUSAL CLOSURE -> AUTHORITY CLOSURE -> CLAIM CLOSURE -> COMPACTION -> CAUSAL CLOSURE

Specifically:
- Can a compaction certificate depend on a claim whose evidence was itself compacted?
- Can authority closure depend on a historical summary that is being reclaimed?
- Can claim closure circularly justify its own retained summary?
- What independent root/foundation is required to prevent self-certifying garbage collection?
- Can two compaction certificates mutually justify each other across an ECC boundary?
- What happens during crash between summary commit and reclamation?

No correctness guarantee is claimed until this circularity attack is resolved.

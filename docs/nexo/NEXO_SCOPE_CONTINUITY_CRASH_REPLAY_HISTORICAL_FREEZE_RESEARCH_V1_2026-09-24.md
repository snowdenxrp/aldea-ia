# NEXO - SCOPE CONTINUITY / CRASH REPLAY / HISTORICAL FREEZE RESURRECTION RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can an old ScopeFreeze become authoritative again after crash/restore when a provider created an unobserved child effect after admission?

## Cross-checks

Kubernetes resourceVersion provides a useful model for stale-write rejection: a client sends the version it observed and the API server rejects a stale update rather than silently applying it. Kubernetes also distinguishes resource-version semantics and warns that some reads/watch starts may be stale. citeturn0search1 AWS Durable Execution explicitly separates replay/checkpoint semantics from side-effect execution; replay can re-run an interrupted operation, while checkpointed completed steps can be returned without re-execution. AWS also states that replay/retry does not create workflow-wide exactly-once semantics automatically. citeturn0search0turn0search3 TLA+ refinement requires an implementation to satisfy the higher-level specification under an explicit refinement mapping; invariants of the abstract specification can transfer only through that mapping. citeturn0search36turn0search37

## Core result

SCOPE_GENERATION alone is insufficient.

A historical scope generation must be bound to a continuity context and a protected currentness rule. Otherwise crash/restore can resurrect a syntactically valid old ScopeFreeze and accidentally treat it as current authority context.

Core separations:

SCOPE_IDENTITY != SCOPE_CURRENTNESS
SCOPE_GENERATION != CONTINUITY
RESTORED_SCOPE != CURRENT_SCOPE
HISTORICAL_FREEZE != CURRENT_ADMISSION_CONTEXT
CHECKPOINT_RESTORATION != AUTHORITY_RESTORATION

## Adversarial sequence

1. Scope G is computed and frozen.
2. Admission linearizes against G.
3. Provider begins external work.
4. Provider creates child effect C not yet visible to Nexo.
5. Nexo crashes.
6. Child C continues, retries, queues or completes.
7. Nexo restores checkpoint containing ScopeFreeze G.
8. Local state says G is valid.
9. Recovery tries to continue/retry/compensate using G.

This is unsafe if G is treated as current without establishing a new recovery context and current external scope.

## Why a generation number is not enough

A number can tell Nexo that one state is numerically newer than another, but cannot by itself prove the same resource incarnation, topology, provider contract, dependency closure, boundary generation, STOP/recovery state, external effect history or continuity root.

Therefore:

NUMERICALLY_NEWER != SEMANTICALLY_CURRENT

## New architectural object: ContinuityContext

Candidate fields:

- context_id
- parent_context_id
- scope_generation
- authority_epoch
- invalidation_generation
- dependency_generation
- topology_generation
- policy/invariant versions
- boundary generations
- resource incarnations
- effect-path closure version
- recovery epoch
- STOP epoch
- continuity anchor
- compatibility contract
- invalidation state
- creation/linearization evidence

A ScopeFreeze references a ContinuityContext; it does not establish one merely by existing.

## Recovery rule

RESTORE_HISTORICAL_BASELINE
→ CREATE_NEW_RECOVERY_CONTEXT
→ INVALIDATE_HISTORICAL_AUTHORITY
→ ESTABLISH_CURRENT_CONTINUITY
→ DISCOVER_CURRENT_SCOPE/BOUNDARIES
→ IDENTIFY_IN_FLIGHT_EFFECTS
→ RECONCILE_EXTERNAL_WORLD
→ CLASSIFY_CHILD/QUEUE/RETRY_UNKNOWN
→ RECOMPUTE_EFFECT-PATH_CLOSURE
→ REVALIDATE_SCOPE
→ REVALIDATE_AUTHORITY
→ EXPLICIT_RELEASE

The historical ScopeFreeze is evidence of what Nexo previously believed, not permission to continue.

## The child-effect problem

The most dangerous case is not simply an unobserved child.

It is:

parent admitted under G
→ child created under provider
→ child has its own retry/redrive
→ child enters queue
→ Nexo crashes
→ parent checkpoint restored
→ recovery sees no child
→ old scope reused.

The child belongs to the historical effect-path closure even if Nexo did not observe it at the time.

Therefore:

UNOBSERVED_CHILD != NO_CHILD

If the provider contract cannot establish a bounded child-effect boundary, recovery cannot assume the restored scope is complete.

## Historical scope versus current effect

The old scope remains valuable as history:

ScopeFreeze(G) = historical assurance context.

But after crash:

ScopeFreeze(G) != current admission context.

It can reconstruct what was admitted, which claims existed, which dependencies were believed, which resources were bound, which fences were expected and which effect identity was active.

It cannot by itself authorize retry, continuation, compensation, release, scope reduction or child execution.

## Durable continuity anchor

Candidate requirement:

The state that prevents resurrection of invalidated scope must not be restorable solely from the same rollback-vulnerable snapshot as the ScopeFreeze.

Otherwise restore(old_snapshot) could restore both the old ScopeFreeze G and the old “G is current” marker, creating a false-current state.

Therefore a continuity mechanism needs an anchor or monotonic protection that survives the restoration path, or recovery must establish a new context that explicitly dominates the restored historical state.

This is consistent with the stale-version pattern: a stale writer should be rejected rather than silently accepted. Kubernetes uses resourceVersion conflict detection for this purpose. citeturn0search1

## Two viable patterns

### Pattern A - External/current monotonic anchor

A protected authority/continuity store holds a current generation or epoch that cannot regress with ordinary snapshot restore.

Restored G is accepted only if compatible with the current anchor.

### Pattern B - New recovery context dominates history

Recovery creates C_new > C_old in a protected continuity domain.

All restored scope/effect contexts are historical children of C_new.

Nothing from C_old can authorize a new protected effect unless an explicit compatibility transition validates it.

Pattern B is more general because semantic compatibility can change even when numeric generations appear valid.

## Scope compatibility

Candidate:

CompatibleScope(G_old,C_new,E,M)

must check effect identity, mission claim, dependency closure, topology, policy/invariant, boundary generation, resource incarnation, provider contract, STOP/recovery, effect-path closure, unresolved child effects, queue/retry/redrive state and continuity anchor.

Possible results:

COMPATIBLE
FENCE_COMPATIBLE
INCOMPATIBLE
UNKNOWN

UNKNOWN does not become COMPATIBLE by optimism.

## Replay rule

Replay is not RESTORE → CONTINUE.

It is:

RESTORE → RECONSTRUCT → RECONCILE → REVALIDATE → NEW_PROTECTED_TRANSITION

AWS Durable Execution provides a concrete example of why checkpoint/replay and side effects must be distinguished: completed checkpointed steps can avoid re-execution, while interrupted steps can replay according to retry semantics. citeturn0search0turn0search3

## Old child effect arriving after recovery

Suppose recovery creates C_new and later receives evidence that child C from C_old completed.

That evidence is HISTORICAL_EFFECT_EVIDENCE.

It must not automatically become CURRENT_AUTHORITY.

The recovery process must bind it to old effect identity, old attempt, old resource incarnation, old provider execution and old context, then evaluate the current reconciliation claim.

If the old child can still produce future effects, the current boundary must be fenced separately.

## Scope continuity and invalidation

If scope G was invalidated before crash but the invalidation record was not in the restored snapshot, recovery must not infer:

missing invalidation == no invalidation.

The authoritative continuity/invalidation source must decide currentness.

Therefore:

ABSENCE_FROM_RESTORED_SNAPSHOT != CURRENT

## Crash windows

W1: crash before ScopeFreeze durable → no assumption that freeze existed.
W2: freeze durable, admission not linearized → freeze is historical candidate, not admission.
W3: admission linearized, durable intent missing → external outcome remains uncertain.
W4: admission + intent durable, child created → child is part of in-flight effect closure even if unseen.
W5: child exists, Nexo crashes before observing → UNKNOWN child/history.
W6: checkpoint restores old freeze → historical only.
W7: recovery reuses old freeze → DENY unless current compatibility is proven.
W8: child completes after recovery → historical evidence bound to old context; reconcile.
W9: child retries after recovery → current provider/resource fence must reject or explicitly authorize retry.
W10: resource replaced → old scope/resource binding invalid unless transfer contract exists.

## Candidate invariant family INV-SCC-01..32

01 Scope generation is not currentness.
02 Scope identity is not authority.
03 Historical ScopeFreeze cannot grant new authority.
04 Checkpoint restoration cannot restore historical authority.
05 Recovery creates a current recovery context.
06 Restored historical state is evidence, not current permission.
07 Invalidated scope cannot become current through snapshot rollback.
08 Continuity must survive or explicitly re-establish after restore.
09 Numeric generation is not semantic continuity.
10 Resource incarnation changes invalidate incompatible scope.
11 Topology changes invalidate incompatible scope.
12 Provider contract changes invalidate incompatible scope.
13 Unobserved child is not absent child.
14 Queue absence is not historical no-effect.
15 Provider continuation belongs to effect-path closure.
16 Replay is a new protected transition.
17 Retry inherits no historical authority.
18 Compensation inherits no historical authority.
19 Late child evidence is historical until current reconciliation validates its claim.
20 Old effect identity does not imply current authority.
21 Current recovery ownership does not prove historical effect outcome.
22 Recovery cannot use restored scope as complete without current closure.
23 Unknown child scope blocks strong claims when child can affect M.
24 Boundary-bounded child closure can discharge the child enumeration obligation.
25 Continuity anchor cannot depend solely on rollback-vulnerable state.
26 Old STOP cannot be cleared by restored state.
27 Old recovery ownership cannot be restored as current.
28 Old fence cannot authorize post-recovery execution without current validation.
29 Current scope must bind current boundary/resource versions.
30 Current scope must bind current invalidation generation.
31 Crash/replay must preserve monotonic safety degradation.
32 No historical scope may silently cross the protected effect boundary as current authorization.

## Candidate recovery protocol

CRASH
→ RESTORE_HISTORICAL_BASELINE
→ MARK_HISTORICAL_CONTEXT
→ CREATE_RECOVERY_CONTEXT
→ ESTABLISH_CONTINUITY_ANCHOR
→ REPLAY_INVALIDATION
→ RECONSTRUCT_EFFECT/ATTEMPT_IDENTITIES
→ DISCOVER_CURRENT_EFFECT-PATH_CLOSURE
→ RECONCILE_EXTERNAL_EFFECTS
→ REVALIDATE_SCOPE/BOUNDARY/INCARNATION
→ RECOMPUTE_CLAIMS
→ EXPLICIT_RELEASE

No step grants normal execution authority merely because a previous checkpoint says it was once allowed.

## Candidate theorem

Not formally proven:

If every restored ScopeFreeze is treated as historical; recovery establishes a new current ContinuityContext; currentness is checked against a non-regressing continuity/invalidation boundary or equivalent protected transition; every in-flight effect and child path is reconciled or safely bounded; and stale contexts cannot cross the current effect boundary, then crash/replay cannot resurrect a historical ScopeFreeze as current admission authority.

This remains a research theorem until formalization, model checking and implementation refinement.

## Architectural result

The Scope/Closure Plane now requires a Continuity Gate between historical restoration and new admission:

HISTORICAL_SCOPE
→ CONTINUITY_GATE
→ CURRENT_RECOVERY_CONTEXT
→ CURRENT_CLOSURE
→ CURRENT_FENCE/BOUNDARY
→ CURRENT_AUTHORITY
→ NEW_ADMISSION

This reinforces:

HISTORY != AUTHORITY
RESTORATION != REAUTHORIZATION
SCOPE_GENERATION != CONTINUITY
CHECKPOINT != CURRENTNESS

## Open gaps

G-SCC-01 formal continuity theorem.
G-SCC-02 non-regressing continuity anchor implementation.
G-SCC-03 exact recovery/invalidation replay ordering.
G-SCC-04 provider child-effect closure under open-world conditions.
G-SCC-05 formal compatibility between old scope and new recovery context.
G-SCC-06 resource replacement during recovery.
G-SCC-07 queue/retry/redrive reconstruction.
G-SCC-08 actual SANY/TLC/TLAPS.
G-SCC-09 implementation refinement.
G-SCC-10 fault-injection and long-duration validation.

## Next attack

CONTINUITY GATE + PROVIDER CHILD EFFECT + RESOURCE REPLACEMENT + STALE OBSERVER + DOUBLE RECOVERY.

Question: can two recovery contexts both believe they have reconstructed the current scope after a crash while an old provider child is still active and the target resource has been replaced? This attacks recovery split-brain at the intersection of continuity, effect-path closure, incarnation and stale evidence.
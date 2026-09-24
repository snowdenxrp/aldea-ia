# NEXO IN-FLIGHT EFFECT + REVOCATION + UPDATE + RESOURCE REPLACEMENT + CRASH/RESTORE RESEARCH V1 — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No runtime correctness claim.

## External cross-check

The current etcd disaster-recovery documentation explicitly warns that restoring an older snapshot can make revisions appear to go backwards and can leave consumers/caches inconsistent; its restore procedure creates a new logical cluster identity and can use revision bumps/compaction to prevent stale consumers from treating old history as current. This is a concrete operational analogue for the Nexo rule that historical state must not silently regain current authority. citeturn0search0

Current etcd upgrade/downgrade guidance also distinguishes mixed-version transition from completed upgrade/downgrade and requires explicit recovery procedures rather than treating rollback as an ordinary reversal. citeturn0search2turn0search3

NIST's September 15, 2026 token-protection guidance emphasizes token verification, key management, and lifecycle controls, reinforcing that authorization artifacts require lifecycle/currentness controls rather than one-time authenticity checks. citeturn0search9turn0search12

## Adversarial sequence

E1 admitted under context C1
→ E1 in flight
→ authority/policy/boundary update to C2
→ old capability remains in circulation
→ resource replaced: incarnation R1 → R2
→ Nexo crashes
→ stale snapshot C1 restored
→ old worker reconnects
→ revocation propagation is incomplete
→ E1 reaches a boundary
→ boundary is running generation G2
→ resource is R2
→ late E1 observation arrives
→ recovery begins.

Question: Can E1 legitimately cross the new safety boundary despite having been admitted under the old context?

## Result

Only if the effect class explicitly permits continuation across the context transition and the new enforcement boundary verifies that continuation under current semantics.

Otherwise the old in-flight effect must be fenced, rejected, cancelled, reconciled, or left UNKNOWN.

It cannot inherit authority merely because its original admission was valid.

## Critical distinction

VALID_AT_ADMISSION != VALID_AT_EXECUTION

AUTHENTIC_OLD_CONTEXT != CURRENT_CONTEXT

RESTORED_STATE != CURRENT_AUTHORITY

REVOCATION_REQUESTED != EFFECT_STOPPED

RESOURCE_REPLACED != HISTORICAL_EFFECT_ERASED

LATE_OBSERVATION != CURRENT_WORLD_TRUTH

## Findings IR-01..IR-30

1. An admitted effect has a lifetime; authority cannot be modeled only at admission.
2. Every in-flight protected effect needs a context binding.
3. Context binding must include the minimum versions/generations/incarnations required by its effect contract.
4. A safety-relevant policy/boundary update invalidates old release eligibility unless continuation is explicitly supported.
5. A resource replacement creates a new resource incarnation; old bindings cannot automatically transfer.
6. A crash between external attempt and local observation preserves UNKNOWN when evidence is insufficient.
7. A restored snapshot may be authentic while representing an obsolete context.
8. Restoring old control state must not restore old authority, old release eligibility, or old capability validity.
9. An old worker may restart successfully yet remain fenced because its context is stale.
10. Revocation state must have a protected ordering relative to effect admission/execution.
11. Revocation propagation that is incomplete cannot support a claim requiring complete enforcement.
12. A new boundary generation must reject incompatible old context unless the effect class explicitly defines a safe continuation protocol.
13. Resource-side enforcement is the final protection against stale effect execution when the resource can reject old generations/fences.
14. A resource replacement must invalidate prior resource-specific evidence, capabilities, fence bindings, and in-flight assumptions as applicable.
15. A late observation from the old resource incarnation cannot automatically classify the new incarnation.
16. A restored local state cannot prove that an external effect did not happen during the interval not represented by the snapshot.
17. Rollback can create a mixed-generation system: old control state, new resource state, old workers, new boundary.
18. Mixed-generation state is a first-class unsafe recovery condition, not a transient implementation detail.
19. Recovery must identify every relevant generation before release.
20. If a critical generation/continuity relation is UNKNOWN, dependent strong claims remain blocked.
21. Re-establishing a boundary does not erase historical in-flight uncertainty.
22. Fencing a stale actor prevents future effects only if the actual effect boundary/resource enforces the fence.
23. A stopped worker does not prove an effect was never externally committed.
24. A current worker does not inherit historical authority merely because it restored the old checkpoint.
25. Capability caches, queues, snapshots, logs and delegated artifacts are part of the continuity/revocation closure when effect-capable.
26. An update may be safe only if old and new versions have an explicit coexistence/transition contract.
27. Rollback requires its own continuity semantics; it is not temporal reversal.
28. Resource replacement during an in-flight effect may turn a formerly bounded effect into UNKNOWN unless the provider contract preserves effect identity across replacement.
29. Recovery-of-recovery repeats the same generation and stale-context checks; progress alone is not authority.
30. The safe default for unresolved cross-generation protected effects is HOLD/QUARANTINE plus reconciliation, not silent completion.

## Mixed-generation hazard model

A dangerous state is:

CONTROL=C1
BOUNDARY=G2
RESOURCE=R2
WORKER=C1
CAPABILITY=C1
REVOCATION=PARTIAL
LOCAL_HISTORY=H1
WORLD=UNKNOWN

This is not one coherent context.

Candidate invariant:

NO_PROTECTED_EFFECT_ADMISSION_FROM_MIXED_CRITICAL_CONTEXT

unless the effect contract explicitly proves compatibility of every differing component.

## New object: ContinuityContext

Candidate fields:
- context_id
- parent_context_id
- authority_epoch
- policy_version
- invariant_version
- boundary_generation
- resource_incarnations
- capability_generation
- revocation_generation
- dependency_graph_version
- topology_version
- update_generation
- recovery_epoch
- continuity_anchor
- compatibility contract
- invalidation state
- creation/linearization evidence

Purpose: represent the coherent safety context against which an effect is admitted and later evaluated.

This is deliberately different from a version number.

VERSION_EQUALITY != CONTEXT_COHERENCE

NUMERIC_MONOTONICITY != SEMANTIC_CONTINUITY

## Continuation contract

For each protected effect class, define one of:

C0 — Must not continue: any critical context transition invalidates the in-flight effect.

C1 — Fenceable continuation: the effect may continue only if the resource validates the current fence/generation.

C2 — Contract-compatible continuation: the new context explicitly proves semantic compatibility with the old effect.

C3 — Provider-preserved identity: the provider guarantees stable effect identity across the transition and exposes sufficient reconciliation.

C4 — UNKNOWN: no safe continuation rule exists.

C4 requires HOLD/QUARANTINE unless a separate action is proven SAFE_UNDER_UNCERTAINTY.

## Crash/restore protocol candidate

CRASH
→ RESTORE_HISTORICAL_BASELINE
→ CREATE_NEW_RECOVERY_CONTEXT
→ INVALIDATE_HISTORICAL_AUTHORITY
→ DISCOVER_CURRENT_BOUNDARY_GENERATIONS
→ DISCOVER_CURRENT_RESOURCE_INCARNATIONS
→ RECONSTRUCT_REVOCATION_STATE
→ IDENTIFY_IN_FLIGHT_EFFECTS
→ RECONCILE_EXTERNAL_WORLD
→ CLASSIFY_EVIDENCE
→ REVALIDATE_EFFECT_CONTEXTS
→ FENCE_STALE_CONTEXTS
→ RECOMPUTE_CLAIMS
→ EXPLICIT_RELEASE

Important:

RESTORE != RESUME

## Resource replacement protocol

R1_ACTIVE
→ R1_FENCED/RETIRED
→ R2_IDENTIFIED
→ R2_NEW_INCARNATION
→ R2_BOUNDARY_ESTABLISHED
→ R2_FENCE_VERIFIED
→ R2_RECONCILIATION
→ R2_RELEASE_ELIGIBLE

An old capability for R1 cannot become an R2 capability merely because the logical resource name is identical.

This addresses the ABA problem at the resource boundary.

## Update/rollback protocol

UPDATE_REQUEST
→ IMPACT_CLOSURE
→ INVALIDATE_AFFECTED_CLAIMS
→ PROTECT/FENCE_TRANSITION
→ INSTALL_NEW_GENERATION
→ VERIFY_BOUNDARY
→ VERIFY_DEPENDENCIES
→ RECONCILE_IN_FLIGHT_EFFECTS
→ ESTABLISH_NEW_CONTINUITY_CONTEXT
→ REPUBLISH_CLAIMS

Rollback follows the same safety structure.

It does not receive a special privilege because the target version is older.

## Key adversarial scenario

1. E1 admitted under G1/R1.
2. E1 becomes externally attempted.
3. Nexo crashes before observation.
4. Boundary updates to G2.
5. Resource is replaced by R2.
6. Revocation of G1 reaches only some paths.
7. Old worker W1 reconnects.
8. Snapshot restores C1.
9. W1 sends E1.
10. R2 receives the request.
11. Late evidence about R1 arrives.
12. Recovery sees a valid old E1 record.

The correct question is not “Was E1 originally authorized?”

It is:

“Under the current context, is this exact in-flight effect still admissible, and can its current resource boundary enforce that decision?”

If the answer is UNKNOWN, strong admission is blocked.

## Candidate invariants INV-IR-01..20

- INV-IR-01: Historical admission never alone grants current execution authority.
- INV-IR-02: Every in-flight protected effect has explicit context binding.
- INV-IR-03: Critical context generation changes invalidate incompatible in-flight authority.
- INV-IR-04: Resource incarnation changes invalidate incompatible resource bindings.
- INV-IR-05: Restore creates a new recovery context.
- INV-IR-06: Restore cannot resurrect historical authority.
- INV-IR-07: Mixed-generation critical context cannot silently authorize effects.
- INV-IR-08: Revocation completeness is claim-specific and evidence-backed.
- INV-IR-09: Boundary generation is part of effect authorization where required.
- INV-IR-10: Resource-side enforcement is required where stale actors can otherwise produce protected effects.
- INV-IR-11: Late evidence remains bound to its historical resource/context.
- INV-IR-12: Old evidence cannot automatically classify a new incarnation.
- INV-IR-13: Rollback is a new continuity context, not time reversal.
- INV-IR-14: Capability caches and delegated copies are part of revocation closure.
- INV-IR-15: Provider continuation across context changes requires an explicit contract.
- INV-IR-16: Unknown continuity blocks claims that require continuity.
- INV-IR-17: Recovery progress cannot substitute for current authority.
- INV-IR-18: Recovery-of-recovery repeats generation and incarnation validation.
- INV-IR-19: UNKNOWN external outcome survives crash/restore until claim-adequate evidence changes it.
- INV-IR-20: No stale context may cross a protected effect boundary without an explicit compatible continuation rule.

## Formal model candidates

Add:
ContinuityContext
InFlightEffect
ResourceIncarnation
BoundaryGeneration
CapabilityGeneration
RevocationContext
UpdateContext
RecoveryContext

Candidate relation:
Compatible(old_context, new_context, effect_class)

must be explicit rather than inferred from equal names or compatible-looking versions.

Candidate property:
CurrentAdmission(e) => CoherentContext(e)

Candidate stronger property:
CurrentAdmission(e) => CurrentBoundary(e) AND CurrentResourceIncarnation(e) AND CurrentAuthority(e) AND AcceptableRevocation(e) AND EffectPathClosure(e)

## Major conclusion

Nexo cannot model a safety-relevant external effect as a point event.

The architecture needs a lifecycle identity extending from admission through execution, possible crash, update, revocation, resource replacement, observation and reconciliation.

The clean architecture is therefore converging toward:

EFFECT_IDENTITY
→ CONTINUITY_CONTEXT
→ BOUNDARY_GENERATION
→ RESOURCE_INCARNATION
→ REVOCATION_CONTEXT
→ IN_FLIGHT_EFFECT
→ EXTERNAL_EFFECT_HISTORY
→ RECONCILIATION
→ CLAIM

rather than a simple request/response model.

## Remaining gaps

G-IR-01 formal compatibility relation between old/new contexts.
G-IR-02 exact provider semantics for continuing effects across update.
G-IR-03 resource replacement with persistent external effect identity.
G-IR-04 revocation under partition and delayed delivery.
G-IR-05 capability copies surviving crash artifacts.
G-IR-06 rollback-vulnerable continuity anchor.
G-IR-07 mixed-generation formal model.
G-IR-08 actual TLC/SANY execution.
G-IR-09 implementation refinement.
G-IR-10 fault-injection evidence.

## Next attack

Next target:

CONTEXT COMPATIBILITY + EFFECT IDENTITY ACROSS UPDATE/ROLLBACK + PROVIDER RETRY/REDRIVE + RESOURCE REPLACEMENT

The key question will be whether Nexo can safely preserve an effect across a version/context transition without accidentally treating historical authorization as current authority.

# NEXO BOUNDARY BYPASS UNDER UPDATE/ROLLBACK + CAPABILITY LEAKAGE + IN-FLIGHT EFFECTS + REVOCATION LATENCY V1 — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No formal/runtime correctness claim.

## Research cross-check

NIST defines a Policy Enforcement Point as the mechanism that actually protects the resource and enforces policy decisions, distinguishing it from the Policy Decision Point. NIST zero-trust guidance also emphasizes dynamic authorization and continuous assessment rather than implicit trust. citeturn0search3turn0search13turn0search49

NIST's current September 2026 guidance on protecting tokens and assertions explicitly addresses theft, misuse, token verification, key management, and lifecycle controls. This supports treating token/capability lifecycle as part of the protected enforcement surface rather than as a one-time authorization artifact. citeturn0search1

MITRE's TOCTOU definition confirms that a resource can change between check and use, invalidating the check; mitigation requires atomicity/locking or equivalent protection of the checked state through use. citeturn0search0turn0search10

## Core result

The previous boundary model still had a hidden assumption:

BOUNDARY_VERIFIED != BOUNDARY_REMAINS_EFFECTIVE_DURING_IN_FLIGHT_OPERATION

A boundary can be valid at admission and become invalid before the external effect is actually produced.

Therefore boundary assurance must cover not only admission but the complete lifetime of an effect path.

New distinction:

BOUNDARY_AUTHORIZATION != BOUNDARY_EXECUTION_CONTINUITY != BOUNDARY_EFFECT_ENFORCEMENT

## Adversarial findings UBR-01..UBR-30

1. Updating policy after admission can invalidate an in-flight authorization.
2. Updating the boundary implementation can invalidate a previously verified boundary generation.
3. Rolling back a boundary can resurrect an older enforcement behavior.
4. Rolling back a capability issuer can resurrect old authority unless continuity is external to the rollback-vulnerable state.
5. A valid signature proves authenticity/integrity, not currentness.
6. A current authorization token may become stale before use.
7. Revocation propagation latency creates a window in which old capabilities may still be accepted.
8. If that window is safety-relevant, it must be represented explicitly rather than hidden behind eventual revocation.
9. Resource-side enforcement is the decisive point for stale-effect rejection.
10. Revoking issuance does not necessarily revoke already-issued capabilities.
11. Revoking a capability does not necessarily cancel an effect already admitted or queued.
12. Queued, retried, redriven, callback, child-process and provider-generated work must carry current effect/fence context.
13. In-flight effects need an explicit revocation semantics: cancelable, fenceable, irreversible, compensatable, or UNKNOWN.
14. Closing a session is not equivalent to cancelling all downstream effects.
15. Boundary update and effect execution can race; message order cannot define safety order.
16. A stale worker can continue after logical revocation unless the resource rejects stale generation/fence.
17. A new boundary generation must invalidate incompatible old evidence and release eligibility.
18. A rollback to an older but authentic boundary must not restore old authority.
19. A restored checkpoint containing a valid capability cannot by itself establish current authorization.
20. Capability serialization/deserialization is an authority-transfer operation and must be modeled as such.
21. Capability leakage through logs, traces, snapshots, queues, metrics, crash dumps or IPC creates new paths.
22. Capability duplication makes revocation a graph problem, not merely an issuer-state problem.
23. Delegation depth and fan-out can make revocation closure unbounded unless a terminating enforcement boundary exists.
24. A break-glass capability must have explicit scope, generation, expiry/fence semantics and resource-side enforcement.
25. Emergency authority cannot be outside the same currentness/continuity model merely because it is exceptional.
26. Resource replacement invalidates old capability-to-resource bindings even when the capability itself remains authentic.
27. Provider failover can create a new enforcement incarnation; old in-flight work must be rejected or explicitly reconciled.
28. If revocation state is unavailable or UNKNOWN, strong claims requiring revocation completeness must HOLD/QUARANTINE.
29. Revocation ACK proves only the property defined by its contract; it cannot automatically prove historical absence of effect.
30. No generic global revocation algorithm can safely classify every in-flight external effect; effect-class-specific semantics remain necessary.

## New lifecycle model

For a capability/effect binding:

ISSUED
→ BOUND
→ ADMITTED
→ IN_FLIGHT
→ COMPLETED / REJECTED / UNKNOWN

A safety-relevant invalidation can occur at every stage.

For the enforcement boundary:

DECLARED
→ VERIFIED_FOR_GENERATION(g)
→ ACTIVE(g)
→ INVALIDATED(g)
→ REPLACED(g+1)
→ VERIFIED_FOR_GENERATION(g+1)

A generation transition must invalidate incompatible claims, evidence and pending admissions.

## Revocation model

Distinguish:

REVOCATION_REQUESTED
REVOCATION_AUTHORITY_COMMITTED
REVOCATION_PROPAGATING
REVOCATION_ENFORCED_AT_BOUNDARY
REVOCATION_VERIFIED
REVOCATION_WORLD_EFFECT_CLASSIFIED

These are not interchangeable.

In particular:

REVOCATION_VERIFIED != NO_PRIOR_EFFECT

and

REVOCATION_ENFORCED != HISTORICAL_NO_EFFECT.

## In-flight effect contract

Every protected effect class should define:

- whether admission is revocable;
- whether execution can be fenced after admission;
- whether the target enforces generation/fence;
- whether queued work can survive revocation;
- whether retries/redrives inherit or refresh authorization;
- whether callbacks can create child effects;
- whether cancellation is provider-supported;
- whether cancellation is best-effort;
- whether compensation exists;
- whether compensation is safe under UNKNOWN;
- whether historical outcome can be reconciled;
- maximum tolerated revocation latency;
- required resource incarnation;
- required boundary generation;
- claim downgrade semantics when revocation is incomplete.

No generic assumption of cancellation should exist.

## Update / rollback invariant

Candidate:

A safety-relevant update changes context identity.

Therefore:

UPDATE/ROLLBACK
→ NEW CONTEXT/GENERATION
→ INVALIDATE OLD CLAIMS
→ FENCE OLD EFFECT PATHS
→ REVALIDATE DEPENDENCIES
→ REVALIDATE BOUNDARY
→ REVALIDATE CAPABILITY DISTRIBUTION
→ RECONCILE IN-FLIGHT EFFECTS
→ VERIFY
→ RELEASE NEW CLAIM

An authentic rollback is still a new context; it is not a time reversal.

## Capability leakage closure

Capability-bearing artifacts must be treated as effect-capable state:

files, IPC messages, queues, logs, traces, metrics, snapshots, checkpoints, crash dumps, environment/configuration, caches, serialized jobs, provider sessions, child-process inheritance and delegated credentials.

Candidate invariant:

CAPABILITY_LEAK_PATH ⊆ EFFECT_PATH_CLOSURE

If an artifact can recreate or authorize a protected effect, it belongs in the closure.

## Revocation latency as a first-class safety parameter

A new candidate object:

RevocationContext:
- revocation_id
- target capability/effect/resource
- authority epoch
- boundary generation
- resource incarnation
- propagation scope
- required enforcement points
- current propagation state
- maximum tolerated latency
- in-flight effect set
- unknown paths
- verification evidence
- claim impact
- recovery/reconciliation requirement

Candidate states:

UNKNOWN
REQUESTED
PROPAGATING
PARTIALLY_ENFORCED
ENFORCED
VERIFIED
CONFLICTED

A strong claim requiring complete revocation cannot be published while a required boundary remains PARTIALLY_ENFORCED or UNKNOWN.

## New invariants INV-UBR-01..20

- Old boundary generations cannot authorize new protected effects.
- Rollback cannot restore historical authority.
- Capability authenticity does not establish currentness.
- Revocation issuance does not imply revocation enforcement.
- Revocation enforcement does not imply historical no-effect.
- In-flight effects are first-class protected state.
- Every in-flight effect has explicit cancellation/fencing/reconciliation semantics.
- Queued/retried/redriven work retains current effect identity and safety context.
- Resource incarnation changes invalidate incompatible bindings.
- Boundary generation changes invalidate incompatible claims.
- Capability serialization is authority propagation.
- Capability leakage expands effect-path closure.
- Delegation expands revocation closure.
- Unknown revocation propagation cannot be silently treated as complete.
- Break-glass remains bounded and resource-enforced.
- Session closure does not imply downstream effect termination.
- Provider failover creates an enforcement-context transition requiring revalidation.
- Update/rollback invalidates stale evidence and release eligibility.
- TOCTOU between authorization and effect must be prevented or explicitly bounded.
- Claim strength cannot exceed revocation/enforcement evidence.

## Formal model additions

Candidate objects:
RevocationContext
InFlightEffect
CapabilityContext
BoundaryGeneration
EnforcementGeneration
CapabilityDistribution
RevocationClosure
EffectCancellationContract

Candidate state variables:
boundary_gen
capability_gen
revocation_gen
resource_incarnation
inflight_effects
queued_effects
delegated_capabilities
revocation_status
enforcement_status

Candidate safety properties:

UBR-TLC-01: no stale generation crosses an enforcing boundary.
UBR-TLC-02: rollback cannot restore old authority.
UBR-TLC-03: revocation cannot be claimed complete before all required enforcement points are verified.
UBR-TLC-04: in-flight effects cannot silently escape their current effect contract.
UBR-TLC-05: resource replacement invalidates stale bindings.
UBR-TLC-06: leaked capabilities cannot create protected effects outside the closure.
UBR-TLC-07: TOCTOU invalidation prevents stale execution.
UBR-TLC-08: break-glass remains bounded.
UBR-TLC-09: UNKNOWN revocation blocks claims that require complete enforcement.
UBR-TLC-10: boundary generation changes invalidate incompatible assurance.

## Important architectural consequence

The boundary is not a static wall.

It is a **versioned, enforceable, continuously relevant safety boundary**.

The clean architecture therefore needs to reason about:

EFFECT_IDENTITY
× AUTHORITY_EPOCH
× BOUNDARY_GENERATION
× RESOURCE_INCARNATION
× REVOCATION_CONTEXT
× IN_FLIGHT_STATE
× EFFECT_PATH_CLOSURE

A protected effect is admissible only under a coherent context. If that context changes while the effect is in flight, the architecture must have a defined answer: fence it, cancel it, let it finish under a formally bounded contract, reconcile it, or classify the outcome UNKNOWN.

It must never silently assume that the original authorization remains valid.

## Remaining open gaps

G-UBR-01 formal bounded revocation latency.
G-UBR-02 provider-specific in-flight cancellation semantics.
G-UBR-03 capability leakage through crash/recovery artifacts.
G-UBR-04 exact capability revocation closure under arbitrary delegation.
G-UBR-05 update/rollback continuity root.
G-UBR-06 resource-side generation enforcement.
G-UBR-07 formal TOCTOU model across external domains.
G-UBR-08 revocation under network partition.
G-UBR-09 revocation under common-mode dependency compromise.
G-UBR-10 actual SANY/TLC execution.
G-UBR-11 implementation refinement.
G-UBR-12 fault-injection evidence.

## Next attack

Next research target:

IN-FLIGHT EFFECT + REVOCATION + CONCURRENT UPDATE + RESOURCE REPLACEMENT + CRASH/RESTORE

The purpose is to determine whether a protected effect can survive every current boundary/fence while the system changes generations, crashes, restores old state, and encounters a new resource incarnation.

No implementation should begin until this adversarial chain is reduced to explicit contracts/invariants and the remaining proof obligations are isolated.

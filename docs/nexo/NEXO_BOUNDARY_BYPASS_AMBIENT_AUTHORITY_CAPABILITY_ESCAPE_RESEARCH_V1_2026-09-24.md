# NEXO BOUNDARY BYPASS / AMBIENT AUTHORITY / CAPABILITY ESCAPE RESEARCH V1 — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No formal/runtime correctness claim.

## External cross-checks
NIST's reference-monitor concept requires mediation of all accesses, tamper resistance, and a mechanism small enough to analyze/test; NIST SP 800-160 likewise treats always-invoked mediation as a core assurance property. MIT's protection principles emphasize complete mediation, fail-safe defaults, least privilege, and systematic invalidation of cached authority after changes. citeturn0search3turn0search48turn0search4
seL4 provides a concrete capability-system reference: operations are authorized through unforgeable capabilities; capabilities can be copied/delegated, attenuated by minting, and revoked recursively. Its capDL tooling can reason about which future resource accesses are possible from a declared capability distribution. These are research inputs, not claims that Nexo should use seL4. citeturn0search49turn0search6

## Core distinction
A boundary is not merely an API, process, network hop, approval step, or logging point.

BOUNDARY_COVERAGE(E,C) means every relevant path to E intersects an enforcement point whose semantics are current, claim-compatible, tamper-resistant, and actually mandatory.

OBSERVATION != ENFORCEMENT
AUTHORIZATION != ENFORCEMENT
API ENTRY != BOUNDARY
PROCESS SEPARATION != NON-BYPASSABILITY
CAPABILITY POSSESSION != CURRENT AUTHORITY
TOKEN ISSUANCE != TOKEN ENFORCEMENT

A graph cut is only a candidate proof boundary. If an unmodeled ambient authority or alternate route exists, the graph is incomplete.

## New architectural objects
EffectBoundary: boundary_id; protected effect classes; protected targets/resources; accepted identity/authority/fence/effect-context; enforcement mechanism; bypass assumptions; dependency/trust-root closure; boundary generation/incarnation; revocation/fencing semantics; crash/restart/restore semantics; update/rollback semantics; delegation semantics; verification evidence; supported claim strength.

NonBypassabilityClaim: every relevant path capable of producing the protected effect is either forced through a specified enforcement boundary, proven unable to produce the effect, or explicitly included in a bounded environment assumption. The claim is context-, effect-, target-, incarnation-, version-, and dependency-bound.

EnforcementCutSet: boundaries such that every relevant effect path intersects at least one boundary in the set. Minimality is secondary to soundness: under-approximation is safety-dangerous; over-approximation reduces liveness.

AmbientAuthoritySurface: any authority available without an explicit current capability/effect binding, including inherited credentials, filesystem/device access, network reachability, environment/configuration secrets, privileged admin paths, kernel/hypervisor authority, shared queues, autonomous resource authority, and undocumented provider paths.

## Adversarial findings NB-01..NB-24
1. A boundary bypassable by an alternate API is not a protected boundary.
2. Direct resource access outside the mediator invalidates a strong mediation claim.
3. Ambient authority can create effect paths absent from the declared capability graph.
4. Inherited credentials can survive logical revocation unless resource-side enforcement checks current authority/fence.
5. Capability copying/delegation creates new effect paths.
6. Attenuation limits delegated rights but does not prove currentness or revocation.
7. Revocation is ineffective for an effect path that bypasses the capability enforcement point.
8. Capability leakage through IPC, queues, files, environment, logs, snapshots, checkpoints, or serialization is a new effect path.
9. Capability possession must be bound to effect identity, target, incarnation, policy/invariant version, authority epoch and fence context where required.
10. A valid capability from an old generation is stale authority, not current authority.
11. TOCTOU between authorization and effect execution can bypass a logically correct boundary; authorization and protected effect need protected ordering/fence semantics.
12. A current boundary does not imply a current downstream resource; resource incarnation must be bound.
13. A boundary ACK does not prove every downstream path has stopped.
14. Queue injection, retry, redrive, callback, child-worker, failover and provider-autonomous behavior are bypass candidates.
15. Break-glass/admin paths are inside the closure, not exceptions outside it.
16. Human approval is evidence of a decision, not technical effect enforcement.
17. Closing a provider session does not prove all provider-generated effects are terminated.
18. Autonomous resource authority can bypass a controller-level boundary unless its effect interface is enforced.
19. Shared kernel/hypervisor/device/trust-root authority can invalidate an apparent software-level cut set.
20. Boundary update/rollback can create a stale enforcement generation; assurance must be invalidated and re-established.
21. Boundary state restored from a rollback-vulnerable snapshot is not automatically current.
22. Two boundaries are not independent if they share a common bypass-capable dependency.
23. A graph-computed cut set is not a proof of non-bypassability until graph completeness/environment assumptions are justified.
24. If non-bypassability cannot be established, the claim must degrade to the strongest bounded claim actually supported.

## Ambient authority attack surface
Minimum closure analysis must ask whether the effect can be produced through direct resource APIs; alternate protocols/transports; inherited OS credentials; filesystem/device handles; environment/configuration secrets; kernel/hypervisor/driver interfaces; privileged operators/admin control planes; shared queues/event buses; provider callbacks/webhooks; retries/redrives/delayed jobs; child processes/agents; failover/autonomous resource behavior; stale snapshots/checkpoints; replacement resources; emergency/break-glass mechanisms; undocumented or dynamically discovered provider capabilities.
Any unknown route is UNKNOWN_PATH, never NO_PATH.

## Capability escape model
Authority propagation is itself an effect-path graph. Candidate edge types: CAN_COPY, CAN_DELEGATE, CAN_ATTENUATE, CAN_SERIALIZE, CAN_EXPORT, CAN_QUEUE, CAN_CALLBACK, CAN_RETRY, CAN_REDRIVE, CAN_FAILOVER, CAN_ESCAPE, CAN_ACCESS_AMBIENT_AUTHORITY.
A capability closure is strong only when delegation is bounded or reaches a terminating enforcement boundary. Unbounded delegation without a terminating boundary prevents finite closure.

## Non-bypassability condition
For every path capable of producing protected effect E under claim C: the path must intersect EnforcementCutSet(C,E); the boundary must be current and enforced; it must not be bypassable by the modeled authority surface; resource-side effect enforcement must be current where required; boundary-critical dependencies must be acceptable; and no unresolved UNKNOWN_PATH may remain inside the claim scope.
This is a candidate formal obligation, not yet a theorem.

## TOCTOU / ordering requirement
Candidate protected sequence: CURRENT_CONTEXT -> AUTHORIZATION_CHECK -> BOUNDARY_BINDING -> FENCE/INCARNATION_BINDING -> PROTECTED_EFFECT_LINEARIZATION -> EFFECT_ATTEMPT.
If authority, STOP, fence, resource incarnation, policy, dependency closure, or boundary generation changes between check and effect, admission must be invalidated or revalidated according to the effect contract.

## Boundary lifecycle
DECLARED -> BOUND -> ENFORCING -> VERIFIED.
Any boundary-critical change: CHANGE -> INVALIDATE CLAIMS -> FENCE/RESTRICT -> REVALIDATE BOUNDARY -> REVALIDATE DEPENDENCIES -> VERIFY -> REPUBLISH CLAIM.
Crash/restart/restore must not restore historical boundary authority automatically.

## Boundary escape and recovery
Recovery must recompute effect identity; effect path closure; ambient authority surface; boundary set/cut set; current boundary generations; resource incarnations; delegation closure; current fences; STOP/recovery constraints; dependency/common-mode closure; and claim requirements.
If closure is incomplete, recovery may establish a bounded local safety state, but cannot publish a stronger global non-bypassability claim.

## Boundary + absorbing state
A safe absorbing state only reduces coordination scope if it creates an enforceable boundary covering every relevant future effect path.
ABSORPTION != QUIESCENCE; ABSORPTION != HISTORY CLASSIFICATION; ABSORPTION != NON-BYPASSABILITY.
Absorption is eligible to reduce scope only after boundary enforcement and verification for the relevant claim.

## Boundary + CCD
A provider/domain can be excluded from a Coordination Domain only if every relevant effect path from it to the protected effect crosses a verified enforceable boundary. Otherwise it belongs to the relevant safety closure.
CCD(E,C) must contain every domain that can change the truth of C unless that domain is separated by a verified non-bypassable enforcement boundary.

## Candidate invariants INV-NB-01..20
INV-NB-01: No strong protected-effect claim without complete mediation or explicit bounded environment assumptions.
INV-NB-02: UNKNOWN_PATH is never treated as NO_PATH.
INV-NB-03: Authorization alone does not constitute enforcement.
INV-NB-04: Observation alone does not constitute enforcement.
INV-NB-05: Every bypass-capable route must be covered, blocked, or explicitly excluded by claim scope.
INV-NB-06: Ambient authority is part of effect-path closure.
INV-NB-07: Delegation expands closure unless it terminates at an enforceable boundary.
INV-NB-08: Capability possession from an old generation cannot authorize a protected effect.
INV-NB-09: Revocation must reach the actual enforcement point.
INV-NB-10: TOCTOU cannot cross a protected effect boundary without revalidation/fencing semantics.
INV-NB-11: Resource incarnation changes invalidate incompatible boundary bindings.
INV-NB-12: Boundary state rollback cannot restore historical authority.
INV-NB-13: Break-glass paths are included in closure and bounded.
INV-NB-14: Human approval cannot substitute for technical enforcement.
INV-NB-15: Queue/retry/redrive/callback paths are closure members when effect-capable.
INV-NB-16: Autonomous resource behavior is inside closure unless externally constrained.
INV-NB-17: Common-mode dependencies can invalidate apparent boundary independence.
INV-NB-18: Boundary update/rollback invalidates claims until reverified.
INV-NB-19: A graph cut set is insufficient if graph completeness is unproven.
INV-NB-20: Claim strength cannot exceed boundary/environment assumption strength.

## Formalization candidates
Add to the clean formal kernel: EffectBoundary; NonBypassabilityClaim; EnforcementCutSet; AmbientAuthoritySurface; BoundaryGeneration; CapabilityContext; DelegationClosure; BoundaryEscape; EnvironmentContract.
BoundaryState = ABSENT, DECLARED, BOUND, ENFORCING, VERIFIED, INVALID.
Claim strength = LOCAL -> RESOURCE -> BOUNDARY -> GLOBAL.
Candidate property: NoStrongClaimWithoutVerifiedBoundaryCoverage.

Candidate TLC model: actors owner/stale_owner/admin/provider/autonomous_resource; routes direct_api/mediated_api/queue/callback/retry/redrive/admin/ambient/autonomous; boundary absent/declared/enforcing/verified/invalid; capability current/stale/revoked/leaked/delegated; resource incarnation 0/1/2; authority epoch 0/1/2.
Candidate properties: no protected effect without current boundary coverage; stale/revoked capability cannot cross boundary; boundary rollback cannot restore old authority; bypass path invalidates strong claim; unknown path prevents strong global claim; delegation cannot create authority outside bounded closure; resource incarnation invalidates stale bindings; TOCTOU invalidation prevents stale effect; break-glass remains bounded; boundary verification is claim-specific and context-bound.

## Open gaps
G-NB-01 path completeness under finite/infinite dynamic graphs.
G-NB-02 ambient authority at kernel/hypervisor/physical-resource boundary.
G-NB-03 capability leakage across serialization/checkpoints/logs.
G-NB-04 revocation latency and in-flight capability semantics.
G-NB-05 TOCTOU across heterogeneous resource domains.
G-NB-06 provider/autonomous resource boundary contract.
G-NB-07 boundary update/rollback continuity.
G-NB-08 break-glass authority and bounded emergency semantics.
G-NB-09 common-mode dependency closure for boundary independence.
G-NB-10 actual SANY/TLC execution.
G-NB-11 implementation refinement and runtime fault injection.
G-NB-12 proof of boundary completeness for a concrete deployment.

## Architectural consequence
The Effect Path Closure concept must be strengthened into an Effect Boundary / Non-Bypassability layer.
Nexo should not try to prove that the entire external world is observable. It should prove, for a specific claim, that every relevant path to the protected effect is inside the authoritative/effect closure, forced through a verified enforcement boundary, proven unable to produce the protected effect, or explicitly covered by an environment assumption.
This closes a major semantic hole in the previous open-world result without claiming universal environmental control.

Next attack: BOUNDARY BYPASS UNDER UPDATE/ROLLBACK + CAPABILITY LEAKAGE + IN-FLIGHT EFFECTS + REVOCATION LATENCY, followed by an adversarial mini-audit of the combined EffectPathClosure + Boundary + CCD + AbsorbingState model.
# NEXO G-A14-01 — Capability-Bound Footprints, Revocation and Recovery
## Research Delta V1 — 2026-09-24

Status: DESIGN RESEARCH / CODE STUDY / ADVERSARIAL
No implementation. No formal proof.

## 1. Question

Can capability-bound access enforce a validated conflict footprint without introducing an unsafe new TCB, stale authority, replay, revocation, snapshot-restore, or TOCTOU failure?

## 2. Real systems studied

seL4:
- capabilities are kernel-managed, unforgeable authority tokens;
- derived capabilities can be minted with a subset of rights;
- capabilities can be copied/delegated;
- revocation recursively removes derived capabilities;
- capability derivation is represented as a kernel-managed derivation structure.

This is strong evidence that authority attenuation and revocation can be structural rather than advisory. However, seL4's guarantees rely on the kernel being the authority enforcement point. cite turn0search0 turn0search26 turn0search2

Linux Landlock:
- unprivileged processes can restrict their own ambient filesystem/network rights through an LSM;
- restrictions are enforced by the kernel rather than by cooperation from the restricted process;
- denied access can be audited. cite turn0search6 turn0search7 turn0search10

CHERIoT:
- capability bounds and revocation mechanisms can structurally prevent use of capabilities to freed memory;
- the design explicitly distinguishes capability monotonicity from memory reuse and uses revocation machinery to close that gap. cite turn0search3

## 3. Central finding

Capability enforcement is useful only if the capability boundary is itself inside a trusted enforcement mechanism.

A user-space token saying:
"operation O may access resource R"

is not enough if the resource provider independently accepts requests without validating the token.

Therefore:

CAPABILITY CLAIM
≠
ENFORCED AUTHORITY

The enforcement point must be protected.

## 4. New distinction: attenuation vs revocation

Attenuation:
parent authority → narrower child authority.

Revocation:
previously issued authority → no longer usable.

seL4 demonstrates both as kernel-enforced mechanisms. cite turn0search26turn0search24

For Nexo, footprint binding primarily needs attenuation, while STOP, authority revocation, VersionSet changes, and footprint invalidation require revocation or an equivalent fencing mechanism.

## 5. Stale capability attack

Unsafe:

1. capability C issued under footprint epoch E10;
2. policy/authority changes to E11;
3. old actor retains C;
4. provider accepts C without checking current epoch;
5. stale effect executes.

Therefore a capability must not be treated as timeless authority.

Candidate binding:

Capability =
(operation_id,
effect_key,
target,
footprint_epoch,
authority_epoch,
VersionSet,
policy/invariant context,
fence,
rights,
expiry,
nonce/identity)

The provider/enforcement point must reject stale context.

## 6. Snapshot restore attack

If a snapshot restores an old capability state:

C(E10) may reappear after the system has reached E11.

A local capability table therefore cannot by itself prove currentness.

This directly connects to G-A14-01's PMA/currentness work.

Required rule:

RESTORED_CAPABILITY_STATE
≠
CURRENT_AUTHORITY

unless protected currentness/lineage is established.

## 7. Revocation race

Consider:

T1: capability valid
T2: operation begins
T3: authority revoked
T4: operation reaches provider

If the provider validates only the capability's historical signature, revocation may be bypassed.

Therefore revocation must participate in the same protected coordination/fencing domain as the effect admission.

Candidate:

capability epoch E10
revocation → E11
provider admission requires current E11

An already-admitted effect remains governed by its existing effect lifecycle; revocation does not retroactively erase history.

## 8. Capability copying/delegation

seL4 permits capability copying, IPC transfer, and attenuation. cite turn0search26turn0search11

For Nexo, delegation therefore creates another dependency edge:

A delegates capability to B
→ B becomes part of the authority/dependency graph.

Delegation must preserve:
operation/effect identity
footprint
authority epoch
fence
VersionSet
expiry/revocation semantics
audit lineage.

A delegate cannot enlarge authority.

## 9. The dangerous bypass

If one component can invoke a provider through:

CAPABILITY PATH
or
ADMIN/BYPASS PATH

then the actual protected dependency closure includes both.

Therefore:

BYPASS PATH
→ TCB
→ footprint/dependency closure

If bypass is not structurally prevented, the claim that capability enforcement bounds all protected access is false.

## 10. Capability validation location

Candidate hierarchy:

Planner validates capability
→ UNSAFE

Provider application validates capability
→ safer but provider becomes part of TCB

Protected gateway validates capability
→ stronger architectural boundary

Kernel/hardware enforcement
→ strongest for that resource class, but may not cover external effects

Nexo should not assume that all external providers can provide kernel-grade enforcement.

## 11. Capability for external effects

A capability can authorize an attempt to invoke provider P.

It cannot by itself prove that P produced the intended external effect.

Therefore:

CAPABILITY VALID
≠
EXTERNAL EFFECT OCCURRED

Existing model remains:

AUTHORITY
→ EFFECT ATTEMPT
→ EFFECT IDENTITY
→ OBSERVATION
→ RECONCILIATION
→ VERIFIED CLAIM

## 12. Capability expiration

Expiry can reduce stale authority but cannot establish external-world truth.

Therefore:
expired capability
≠
no external effect

This preserves the earlier rule:
lease expiry is coordination state, not evidence of effect absence.

## 13. Revocation and STOP

STOP must dominate normal capability use.

Candidate:
STOP epoch E20
capability issued E19

Even if capability has not expired:
provider admission must reject it under STOP fencing.

Restart must not recreate the old capability as executable authority.

## 14. Recovery

Recovery must not simply reload capability tables.

Candidate recovery:
RESTARTED
→ QUARANTINED
→ currentness verified
→ authority epoch verified
→ STOP state verified
→ capability lineage verified
→ VersionSet verified
→ pending effects reconciled
→ recovery owner established
→ fresh capabilities issued

Old capability objects may remain as historical evidence but cannot automatically regain execution authority.

## 15. Capability revocation is not necessarily instantaneous globally

Distributed providers may cache authority.

Therefore a central revocation record alone does not prove remote enforcement.

For remote providers, Nexo needs one of:
- provider-side epoch validation;
- short bounded lease plus protected fence;
- gateway that mediates every effect;
- provider-specific cancellation/reconciliation contract;
- conservative assumption that revocation cannot immediately stop remote execution.

If remote enforcement cannot be established, capability revocation only changes local admission, not necessarily the external effect.

## 16. TOCTOU

Unsafe:
1. validate capability;
2. resolve target;
3. target changes;
4. execute using old binding.

Therefore capability should bind the exact target/context or require a second protected execution-admission check.

Candidate:

CAPABILITY VALID
AND
CURRENT TARGET BINDING
AND
CURRENT FOOTPRINT EPOCH
AND
CURRENT AUTHORITY/FENCE
AND
CURRENT VERSION
→ EXECUTION ADMISSION

## 17. Capability scope

A capability should be attenuated to the narrowest domain that can be safely proven, but not narrower than the protected dependency closure.

If exact dependency is unknown:
use conservative super-domain capability.

Example:
unknown provider subresource
→ capability to provider safety domain

This reduces concurrency but preserves safety.

## 18. New TCB components

If Nexo adopts capability-bound footprint enforcement, the TCB claim must explicitly include:

C1 capability issuance
C2 capability validation
C3 attenuation correctness
C4 revocation/fencing
C5 snapshot/currentness protection
C6 delegation tracking
C7 bypass prevention
C8 target/context binding

This does not mean all implementation code must be trusted equally; it means the safety claim must identify the components whose failure could invalidate the capability-boundary property.

## 19. Candidate architecture

PLANNER
→ typed operation
→ conservative footprint analyzer
→ runtime binder
→ protected validator
→ capability issuance/attenuation
→ protected gateway
→ external provider

with:

REVOCATION/FENCE
→ capability invalidation

and:

STOP
→ protected gateway enforcement

and:

CURRENTNESS/PMA
→ capability-state lineage validation

## 20. Adversarial cases

A. Old capability after policy change:
reject via context/fence.

B. Old capability restored from snapshot:
reject unless currentness lineage established.

C. Delegated capability with broader rights:
structurally impossible; attenuation only.

D. Provider bypass:
must be blocked or included in TCB.

E. Cached remote capability after revocation:
remote enforcement must be provider/gateway-specific; otherwise external effect remains potentially active/UNKNOWN.

F. Capability valid but target changed:
reject exact execution binding.

G. Capability valid but VersionSet changed:
invalidate.

H. STOP active:
normal capability cannot authorize execution.

I. Recovery reloads old capabilities:
quarantine until lineage/currentness/recovery checks complete.

J. Capability service unavailable:
no new independent protected authorization.

## 21. New contracts

PSC-73 — Capability Enforcement Boundary
PSC-74 — Capability Context Binding
PSC-75 — Revocation/Fence Coupling
PSC-76 — Capability Snapshot Non-Restoration
PSC-77 — Delegation Attenuation
PSC-78 — Bypass Closure
PSC-79 — Remote Revocation Limitation
PSC-80 — Capability/Effect Separation

## 22. New invariants

INV-GA14-01-85:
A capability claim without protected enforcement cannot authorize protected access.

INV-GA14-01-86:
A stale capability cannot authorize a protected effect.

INV-GA14-01-87:
Capability restoration from an old snapshot cannot restore current execution authority.

INV-GA14-01-88:
Delegation cannot increase protected authority or footprint.

INV-GA14-01-89:
Revocation/fence changes invalidate affected execution capabilities.

INV-GA14-01-90:
Capability validity does not prove external effect outcome.

INV-GA14-01-91:
Protected bypass paths are part of the authority TCB or must be structurally impossible.

INV-GA14-01-92:
STOP fencing dominates normal capability authorization.

## 23. Mini-audit

The research does NOT justify selecting a specific capability technology.

It does establish:
- capability-bound access is a credible enforcement pattern;
- revocation and attenuation are separate mechanisms;
- stale/snapshot-restored capabilities are a direct currentness problem;
- distributed revocation is not automatically external cancellation;
- capability enforcement itself becomes part of the safety TCB;
- capability validity remains separate from external-world outcome.

No contradiction found with A01-A14 or prior G-A14-01 artifacts.

## 24. Status

Capability-bound access: DESIGN REFINED.
Capability technology selection: OPEN.
Revocation semantics: DESIGN REFINED, provider-specific portions OPEN.
Currentness interaction: DESIGN REFINED.
External provider enforcement: OPEN.
Formal verification: NOT PROVEN.
Implementation: NOT STARTED.

Next research target:
Study whether a protected gateway can become the universal enforcement point for safety-relevant external effects, and identify unavoidable exceptions (direct hardware, remote providers, emergency STOP, recovery paths). Determine whether the gateway itself can remain small enough to be a tractable TCB.

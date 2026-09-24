# NEXO G-A14-01 — Capability-Bounded Executor and TCB Tractability
## Research + Code Study Delta V1 — 2026-09-24

Status: DESIGN RESEARCH / CODE STUDY / ADVERSARIAL
No Nexo runtime implementation. No formal proof.

## 1. Question

Can a capability-bounded executor be made small enough that its enforcement substrate becomes a tractable TCB, including native code, dynamic loading, IPC and device access?

## 2. Research evidence

seL4 documents capabilities as unique, unforgeable tokens of authority and makes capability invocation the mechanism through which userspace requests operations on kernel-controlled objects. This demonstrates a useful structural property: authority can be represented and enforced below ordinary application logic. [seL4 capabilities documentation]

CAmkES demonstrates a stronger composition model: hardware access can be explicitly connected to components through capability-backed interfaces, and reusable components exist for hardware and network services. CAmkES also has refinement tooling that can generate proof artifacts for specified capability configurations in supported configurations. [CAmkES manual; CAmkES release documentation]

seL4's current verified-configuration documentation is also a warning against overclaiming: some features, including device address translation/IOMMU and certain boot/debug facilities, are not included in all verified configurations. Therefore "verified kernel" does not automatically mean "verified whole hardware-enforcement stack."

Linux Landlock demonstrates another useful structural pattern: a process can restrict itself and future children, and the policy is enforced by the kernel. Its current documentation also explicitly lists limitations, including some pre-existing/opened resources and special filesystem/kernel paths. This reinforces the rule that a sandbox's documented coverage boundary must be treated as part of the security claim.

CHERIoT material demonstrates hardware-assisted capability bounds and compartmentalization, while also showing that revocation is a distinct problem from spatial bounds. Therefore capability bounds alone cannot be equated with temporal authority revocation.

## 3. Central result

A tractable Nexo executor is possible only if we minimize what the executor is trusted to decide.

Candidate trusted kernel:

1. Parse/validate a fixed capability representation.
2. Check capability authenticity/type.
3. Check current epoch/fence/context binding.
4. Check target/effect identity binding.
5. Enforce bounded resource access.
6. Enforce STOP/revocation state where applicable.
7. Route only to an allowed effect boundary.
8. Emit protected admission/effect evidence.

Everything else should remain outside the safety TCB where possible:
- planning;
- model inference;
- natural-language interpretation;
- optimization;
- ordinary orchestration;
- provider-specific business logic;
- telemetry aggregation;
- UI;
- non-authoritative caches.

## 4. Important correction

A capability-bounded executor is NOT automatically a small TCB.

It becomes tractable only if the enforcement mechanism itself has:
- complete mediation over the protected effect;
- no ambient bypass path;
- bounded interface;
- explicit failure semantics;
- protected currentness;
- revocation/fence semantics;
- stable identity;
- auditable configuration;
- known native/runtime dependencies.

Otherwise the "small executor" merely moves the TCB into hidden infrastructure.

## 5. Native code

Native code should be classified by authority, not language.

If native code has:
- direct device access;
- unrestricted syscalls;
- raw network;
- privileged IPC;
- arbitrary process creation;
- access to credential material;

then it is inside or adjacent to the effect enforcement TCB.

Preferred pattern:

UNTRUSTED NATIVE CODE
→ capability-limited runtime
→ protected boundary

If native code can escape the capability domain, the capability claim is incomplete.

Native extensions must therefore be bound to:
artifact digest,
ABI/runtime version,
allowed syscalls,
allowed resources,
allowed devices,
allowed IPC,
and capability context.

## 6. Dynamic loading

Dynamic loading is safe only when the loaded set is bounded.

Preferred:
- immutable module manifest;
- artifact digest;
- signed/provenance-bound package;
- capability scope inherited or explicitly re-admitted;
- no ambient privilege increase.

If arbitrary paths can be loaded at runtime:
DYNAMIC_MODULE_SET = UNKNOWN.

A capability cannot safely be issued as though the closure were bounded.

## 7. IPC

IPC is a first-class effect path.

A sandbox that blocks Internet access can still reach a privileged local daemon if IPC is not controlled.

Therefore the protected executor needs a bounded IPC graph:
- endpoint identity;
- direction;
- allowed operation class;
- authority context;
- peer identity;
- capability requirements;
- revocation behavior.

Pre-existing handles are especially important: policy applied after a resource is opened may not retroactively eliminate all access. Landlock's documentation explicitly calls out limitations around resources opened before sandboxing and special kernel paths.

## 8. Device access

Device access is a separate enforcement problem.

Candidate architectures:

A. No device access from executor.
B. Device broker with capability-limited operations.
C. Kernel/hypervisor-enforced device assignment.
D. Direct device access under a separately verified component.

For direct hardware:
device identity,
MMIO range,
DMA memory,
interrupts,
IOMMU/SMMU state,
driver identity,
and reset/recovery semantics
become part of the protected boundary.

CAmkES demonstrates explicit hardware component interfaces and DMA pools; seL4's verified-configuration documentation demonstrates why hardware translation and platform-specific mechanisms cannot simply be assumed verified.

## 9. Remote providers

Remote providers cannot be made part of a local TCB merely by putting an SDK behind a gateway.

Need:
- authenticated provider identity;
- exact effect identity;
- target binding;
- provider-side authorization;
- idempotency/reconciliation semantics;
- cancellation/STOP contract where available;
- provider response integrity;
- UNKNOWN handling.

The local executor can prove:
AUTHORIZED ATTEMPT

It cannot by itself prove:
WORLD EFFECT OCCURRED AS INTENDED.

That remains in the existing:
AUTHORITY → ATTEMPT → EFFECT IDENTITY → OBSERVATION → RECONCILIATION → VERIFIED CLAIM
chain.

## 10. STOP and emergency paths

Emergency STOP should not depend on the ordinary executor queue.

Candidate:
NORMAL EXECUTION PATH
and
OUT-OF-BAND SAFETY FENCE PATH

The emergency path may be physically or logically separate, but it must still be part of the safety TCB.

If STOP uses a separate mechanism, its:
- identity;
- authority;
- delivery;
- enforcement;
- verification;
- failure mode;
- independence assumptions
must be explicitly modeled.

Separate path does not mean outside TCB.

## 11. Recovery

Recovery must not reconstruct authority by simply restoring executor state.

Recovery should:
- establish current identity;
- establish current fence;
- validate VersionSet;
- validate STOP;
- reconcile pending effects;
- validate capability lineage;
- obtain fresh capabilities;
- then release execution.

Restored capability tables are evidence of historical state, not proof of current authority.

## 12. TCB minimization rule

The protected executor should NOT understand:
- natural-language plans;
- arbitrary models;
- general-purpose memory;
- provider business semantics unless needed for safety admission;
- optimization policies.

It SHOULD understand only:
- typed effect request;
- exact target;
- exact effect identity;
- authority/fence;
- capability;
- VersionSet;
- safety policy/invariant context;
- STOP/recovery state;
- bounded provider/device interface;
- durable admission semantics.

This creates a candidate narrow semantic kernel.

## 13. TCB composition

Candidate:

TCB =
Protected Authority Core
+
Capability Enforcement Mechanism
+
Effect Boundary Enforcement
+
Currentness/Fencing Anchor
+
Critical Persistence
+
Minimum Provider/Device Enforcement Assumptions

This is preferable to:

TCB =
Entire Nexo runtime
+
Model
+
Planner
+
Memory
+
Plugins
+
UI
+
All providers.

## 14. Critical adversarial findings

A. Capability is copied after revocation.
→ current epoch/fence must reject it.

B. Capability remains valid after target mutation.
→ target/version binding must reject it.

C. Native extension opens raw socket.
→ network boundary must structurally deny or classify path as TCB/UNKNOWN.

D. Plugin loads unlisted module.
→ module closure invalidated or capability expansion re-admitted.

E. Child inherits privileged file descriptor.
→ inherited-handle closure required.

F. IPC endpoint points to privileged daemon.
→ IPC graph must include peer and operation authority.

G. Device DMA reaches memory outside declared region.
→ device/IOMMU boundary required.

H. Provider receives request but local executor crashes.
→ effect identity remains durable; outcome becomes UNKNOWN/reconciliation.

I. STOP arrives after external attempt.
→ STOP does not erase UNKNOWN.

J. Sandbox policy changes while executor is active.
→ VersionSet/fence invalidation and re-admission required.

K. Kernel/runtime enforcement changes.
→ affected safety claims invalidated.

L. Verified kernel configuration differs from deployed hardware configuration.
→ verification claim does not transfer automatically.

## 15. New contracts

PSC-113 — Capability-Bounded Execution
PSC-114 — Native-Code Authority Closure
PSC-115 — Dynamic-Module Closure
PSC-116 — IPC Enforcement Closure
PSC-117 — Device Enforcement Closure
PSC-118 — Remote Provider Boundary
PSC-119 — Emergency Path TCB Inclusion
PSC-120 — Recovery Capability Non-Restoration

## 16. New invariants

INV-GA14-01-125:
A capability does not grant authority beyond its protected enforcement domain.

INV-GA14-01-126:
Revoked or stale capability context cannot create a new protected effect.

INV-GA14-01-127:
Unbounded dynamic loading prevents bounded effect-path claims.

INV-GA14-01-128:
IPC capable of reaching a safety-relevant service is an effect path.

INV-GA14-01-129:
Direct device access requires an explicit protected device boundary.

INV-GA14-01-130:
Local authorization cannot be interpreted as verified external-world outcome.

INV-GA14-01-131:
Emergency STOP mechanisms are part of the safety TCB even when physically or logically separate from normal execution.

INV-GA14-01-132:
Restored capability state cannot establish current authority without currentness, fence and context validation.

INV-GA14-01-133:
A safety claim tied to a verified enforcement configuration is invalid when the deployed enforcement configuration is outside the verified scope.

## 17. Mini-audit

The hypothesis survives, but only in a narrower form.

SUPPORTED:
A capability-bounded executor can reduce the semantic TCB substantially.

NOT SUPPORTED:
A user-space capability wrapper alone can make arbitrary native code safe.

NOT SUPPORTED:
A verified kernel alone proves device/provider/world-effect correctness.

NOT SUPPORTED:
A sandbox automatically closes IPC, device, pre-opened-resource, or remote-provider paths.

The strongest candidate architecture is therefore a small semantic admission core combined with structurally enforced capability/device/network/IPC boundaries.

## 18. Status

Capability-bounded executor: DESIGN REFINED.
Native-code closure: OPEN.
Dynamic loading: DESIGN REFINED.
IPC closure: DESIGN REFINED / implementation-dependent.
Device closure: OPEN / separate boundary.
Remote provider boundary: DESIGNATED_EXTERNAL.
Emergency STOP: DESIGN REFINED.
Recovery capability restoration: REJECTED.
TCB minimization: DESIGN REFINED.
Formal proof: NOT PROVEN.
Implementation: NOT STARTED.

Next research target:
Study whether the proposed narrow semantic admission core can be specified as a minimal abstract state machine whose concrete enforcement mechanisms can be independently substituted, and whether its TCB can be decomposed into independently auditable contracts rather than one monolithic gateway.

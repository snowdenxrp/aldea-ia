# NEXO G-A14-01 — Effect-Path Coverage: Gateway, Mesh, and Equivalent Boundaries
## Research Delta V1 — 2026-09-24

Status: DESIGN RESEARCH / CODE STUDY / ADVERSARIAL
No implementation. No formal proof.

## 1. Question

Should Nexo require one universal gateway, multiple equivalent protected boundaries, or a capability-gated effect mesh?

## 2. Evidence studied

Complete mediation is the underlying security property: every security-relevant reference must be mediated by an enforcement mechanism. A reference monitor is one implementation, but certification/static analysis can also contribute if it proves all accesses are controlled. cite turn0search11 turn0search15

Kubernetes documents a concrete bypass class: direct kubelet API access is not subject to API-server admission control and can bypass controls that would otherwise detect or prevent actions. This is strong evidence that an architectural gateway claim requires explicit bypass analysis, not merely a preferred request path. cite turn0search12

Istio Ambient Mesh uses multiple enforcement layers and explicitly requires additional policy to prevent traffic from bypassing a waypoint; a default-deny L4 policy can be combined with identity-based restrictions so traffic that arrives outside the intended path is denied. cite turn0search0 turn0search10

SPIFFE's Broker Endpoint specification documents a progression from per-workload sidecars to node-level brokers acting on behalf of multiple workloads, while stressing that the broker and workload are different security boundaries and require strong access control. cite turn0search5

seL4 provides the strongest contrasting case: capabilities are kernel-enforced permissions to controlled resources, so the enforcement boundary is below the application architecture. cite turn0search13

## 3. Central result

A single gateway is not inherently safer than multiple boundaries.

The required property is:

EVERY SAFETY-RELEVANT EFFECT PATH
→ protected enforcement boundary

The boundary may be:
- one gateway;
- several equivalent gateways;
- kernel/hardware enforcement;
- provider-enforced authorization;
- a combination.

What matters is complete mediation and explicit equivalence.

## 4. Coverage model

For each EffectClass E define an effect-path inventory:

E
→ entry points
→ identities/capabilities
→ sessions/handles
→ routing paths
→ provider adapters
→ direct provider paths
→ emergency/recovery/migration paths
→ enforcement boundary
→ evidence/reconciliation path.

A path is COVERED only if its safety-relevant authority is checked by a protected boundary that enforces the required context.

UNKNOWN path coverage prevents a universal safety claim.

## 5. Three candidate architectures

### A. Single Protected Gateway

All safety-relevant effects traverse one gateway.

Advantages:
- one primary enforcement implementation;
- simpler central reasoning;
- easier evidence collection.

Risks:
- single chokepoint;
- direct-device/provider exceptions;
- emergency STOP must not depend on normal availability;
- gateway compromise becomes broad TCB event;
- difficult to cover legacy/direct paths.

### B. Multiple Equivalent Protected Boundaries

Examples:
- gateway for network effects;
- kernel/hardware boundary for local device effects;
- provider-native authorization for external systems;
- separate STOP boundary.

Safety requires a common semantic contract:
same operation/effect identity
same authority/fence semantics
same VersionSet/policy binding
same UNKNOWN semantics
same evidence contract
same recovery/decommission semantics.

A boundary is equivalent only for the properties it actually enforces.

### C. Capability-Gated Effect Mesh

Each effect domain has a protected enforcement point and capabilities are scoped to that domain.

This resembles broker/service-mesh patterns, but Nexo cannot assume network interception alone gives complete mediation. SPIFFE/Istio examples show that separate direct paths can exist and must be explicitly denied or governed. cite turn0search5 turn0search10

## 6. New distinction: path coverage vs path routing

A preferred route is not an enforcement guarantee.

ROUTED_THROUGH_GATEWAY
≠
COVERED_BY_GATEWAY

The latter requires that alternate paths are:
- impossible;
- denied;
- independently equivalent;
- or explicitly modeled as residual risk/UNKNOWN.

## 7. Direct provider access

If a process can call provider P directly while normal traffic goes through gateway G:

G cannot claim universal mediation.

Possible remedies:
1. structurally remove direct access;
2. enforce provider-side authorization;
3. force all access through a protected adapter;
4. classify direct access as a separate boundary and prove equivalence.

If none is possible:
affected safety-critical effects remain restricted.

## 8. Existing handles/sessions

Path closure includes resources acquired before current policy.

Required inventory:
- open sockets;
- provider sessions;
- file/device handles;
- cached credentials;
- delegated capabilities;
- queued work;
- in-flight operations.

A new gateway policy cannot be assumed to revoke old handles automatically.

## 9. Emergency STOP

Emergency STOP may require a second boundary.

That does not violate the architecture if it is explicitly modeled:

NORMAL EFFECT BOUNDARY
+
STOP ENFORCEMENT BOUNDARY

The STOP boundary must have its own:
- identity;
- authority;
- currentness;
- fencing;
- evidence;
- recovery semantics.

If STOP itself routes through the same unavailable/compromised gateway, the architecture may have a common-mode failure.

## 10. Recovery and migration paths

Recovery tools and migration processes can create safety-relevant effects.

Therefore they cannot be treated as administrative exceptions.

Each must either:
- use an equivalent protected boundary;
- possess narrowly scoped emergency authority with explicit fences;
- or remain incapable of producing safety-critical effects.

A migration utility that can write protected state directly is part of the TCB.

## 11. Mesh-specific risk

A mesh increases the number of enforcement nodes.

This can improve fault isolation but increases:
- policy distribution complexity;
- version consistency requirements;
- revocation propagation;
- evidence aggregation;
- common-mode configuration risks.

Therefore mesh topology does not reduce TCB automatically.

## 12. Common semantic contract

Equivalent boundaries should implement the same abstract admission predicate, conceptually:

Admission =
IdentityValid
AND AuthorityCurrent
AND FenceCurrent
AND STOPAllows
AND FootprintCurrent
AND TargetExact
AND VersionCompatible
AND RecoveryStateAllows
AND RequiredEvidenceValid
AND NoBlockingUNKNOWN

Provider-specific constraints may add restrictions but must not widen this predicate.

## 13. Boundary equivalence

Define boundary B as equivalent for property P only if:

B enforces all required predicates for P
AND
B binds them to the same effect identity/context
AND
B preserves failure/UNKNOWN semantics
AND
B emits sufficient evidence
AND
B has compatible recovery/fencing semantics.

A boundary can therefore be equivalent for authentication but not for effect authorization.

## 14. Code/audit implication

Effect-path coverage requires code-level inventory, not only architecture diagrams.

Audit targets:
- network clients;
- provider SDK calls;
- raw sockets;
- device APIs;
- filesystem/control sockets;
- subprocess execution;
- plugin dispatch;
- admin/debug endpoints;
- migration/recovery tools;
- background queues;
- cached sessions.

Any unclassified safety-relevant sink is an uncovered path.

## 15. New candidate artifact: Effect-Path Coverage Record

Fields:
effect_class
path_id
entry_point
caller_identity
capability_domain
target/provider
required_authority
enforcement_boundary
boundary_version
VersionSet
policy/invariant context
existing-handle exposure
emergency/recovery classification
evidence path
coverage_status
dependencies
last_audit
invalidators

Coverage statuses:
COVERED
EQUIVALENT_BOUNDARY
RESTRICTED
UNKNOWN
INVALIDATED

UNKNOWN must not satisfy a universal coverage claim.

## 16. Adversarial matrix

A. Normal request → gateway → provider: covered if predicates verified.

B. Direct provider SDK call: uncovered unless provider boundary is equivalent.

C. Cached session after revocation: requires provider/session fencing or remains potentially active.

D. Emergency STOP path: separate boundary; must be independently protected.

E. Recovery tool writes effect directly: equivalent boundary or TCB expansion.

F. Migration writes old and new stores: both boundaries plus cutover fencing required.

G. Mesh node policy stale: current VersionSet/fence validation prevents stale authorization.

H. Gateway down: no new protected admission through that path.

I. Provider accepts request after gateway revocation: local revocation does not prove external cancellation; reconcile.

J. Unknown entry point: no universal coverage claim.

## 17. New contracts

PSC-89 — Effect-Path Coverage
PSC-90 — Boundary Equivalence
PSC-91 — Route-vs-Coverage Separation
PSC-92 — Direct-Path Closure
PSC-93 — Existing-Handle Coverage
PSC-94 — Emergency Boundary Independence
PSC-95 — Administrative-Path Inclusion
PSC-96 — Coverage-Context Versioning

## 18. New invariants

INV-GA14-01-101:
Every safety-relevant effect must have a classified enforcement path.

INV-GA14-01-102:
Preferred routing through a gateway does not prove complete mediation.

INV-GA14-01-103:
An alternative boundary may satisfy coverage only when semantic equivalence for the claimed property is established.

INV-GA14-01-104:
Unknown effect path coverage cannot satisfy universal coverage.

INV-GA14-01-105:
Existing handles/sessions are part of effect-path closure.

INV-GA14-01-106:
Emergency STOP must not rely exclusively on a potentially unavailable normal effect gateway.

INV-GA14-01-107:
Recovery/migration/admin paths that can create safety effects are included in the protected effect-path model.

INV-GA14-01-108:
A stale boundary policy cannot authorize an effect under a newer safety context.

## 19. Mini-audit

No contradiction found with previous G-A14-01 research.

Important refinement:
The research does not justify a universal single-gateway requirement.

The stronger architectural property is:

COMPLETE EFFECT-PATH COVERAGE

implemented by one or more protected/equivalent enforcement boundaries.

This is more general and better matches real systems where kernel, device, provider, network, and emergency paths may have different enforcement mechanisms.

## 20. Status

Universal single gateway: REJECTED AS REQUIRED ARCHITECTURAL ASSUMPTION.
Complete effect-path coverage: DESIGN REFINED.
Equivalent protected boundaries: DESIGN REFINED.
Effect mesh: CANDIDATE.
Coverage inventory: CANDIDATE.
Formal verification: NOT PROVEN.
Implementation: NOT STARTED.

Next research target:
Study whether the Effect-Path Coverage Record can itself be mechanically checked against repository/code sinks and runtime topology, and how to handle dynamically loaded plugins, generated clients, subprocesses, raw sockets/devices, and external providers without claiming completeness that cannot be proven.

# NEXO G-A14-01 — Structural Bounding of Effect-Path Closure
## Research + Code Study Delta V1 — 2026-09-24

Status: DESIGN RESEARCH / CODE STUDY / ADVERSARIAL
No Nexo runtime implementation. No formal proof.

## 1. Question
Can Nexo reduce UNKNOWN effect paths by making the set of executable effect paths structurally bounded at build and deployment time?

## 2. Research evidence
CodeQL documents that build mode affects analysis completeness. Its documentation states that none mode can omit generated code and that manual build control gives the best accuracy in relevant compiled-language cases. Therefore build configuration is part of the coverage claim, not merely tooling. cite turn0search5turn0search2
Docker documents seccomp as a kernel-enforced allowlist/deny mechanism and no-new-privileges as a control preventing processes from gaining additional privileges. These are examples of structural restrictions below application code. cite turn0search3turn0search7
Kubernetes Pod Security Standards show the same principle at deployment level: restricted profiles can prohibit privileged containers, host namespaces and hostPath volumes, while exemptions must be explicitly enumerated. Deployment topology can therefore structurally narrow the effect surface. cite turn0search0turn0search4

## 3. Central result
Static analysis alone cannot make effect-path closure complete.
The stronger strategy is:
ANALYSIS + BUILD CLOSURE + DEPLOYMENT CLOSURE + RUNTIME ENFORCEMENT
The purpose is to make the set of possible safety-relevant effect paths finite, explicit, and mechanically auditable.

## 4. Candidate structural closure contract
A Nexo effect-capable component should declare:
ComponentIdentity, BuildIdentity, ArtifactDigest, AllowedEffectClasses, AllowedProviderDomains, AllowedNetworkDestinations, AllowedDeviceDomains, AllowedSubprocesses, AllowedPlugins, AllowedDynamicModules, AllowedIPC, AllowedCredentials/Capabilities, EnforcementBoundary, VersionSet, PolicyBaseline, InvariantBaseline.
Anything outside this closure should be structurally denied or require protected re-admission.

## 5. Build closure
Bind source commit, lockfile/dependency graph, compiler/interpreter version, build command, generated source, generated-client versions, plugin set, native extensions, packaged executables, configuration schema, and analyzer/rule version.
A source commit alone is insufficient if the build can generate or select different effect-capable artifacts.

## 6. Generated code
Generated code must be included in the audited artifact set.
Candidate invariant: GENERATED_ARTIFACT_DIGEST == CLAIMED_ARTIFACT_DIGEST.
If generation is nondeterministic or depends on unbound external state, coverage becomes UNKNOWN or RESTRICTED.
CodeQL documentation supports this distinction because analysis accuracy and completeness can change depending on whether generated code is present in the analyzed build. cite turn0search5turn0search8

## 7. Plugin closure
Preferred modes: immutable digest-bound plugin set; protected capability issuance after validation; or sandboxed plugins with a bounded effect interface.
If plugin identity is selected from an unbounded runtime location: PLUGIN_SET = UNKNOWN.
No safety-critical capability should be granted from that state.

## 8. Subprocess closure
A safety-capable component should not freely spawn arbitrary executables.
Allowed subprocesses should be explicitly enumerated, digest/version bound, capability scoped, resource/network/device restricted, and prevented from gaining additional privileges.
Docker no-new-privileges and seccomp illustrate enforcement mechanisms that reduce what child processes can do independently of application intent. They bound authority but do not prove child semantic safety. cite turn0search3turn0search7

## 9. Network closure
The effect-capable runtime should have an explicit allowed-destination set containing provider identity, endpoint identity, protocol, port, and identity context.
An unlisted destination must be denied or require protected re-admission.
A logical gateway is insufficient if the process can independently open a provider connection.

## 10. Device closure
Direct hardware/device access is a separate effect boundary.
A safety-capable component should have no direct device access, use a protected broker, or use a separately verified/enforced device boundary.
Kubernetes treats privileged containers, host namespaces and hostPath access as security-sensitive deployment capabilities. cite turn0search4

## 11. IPC closure
Control sockets, local RPC, Unix sockets, shared memory, queues, and service-manager interfaces are possible effect paths.
NETWORK_CLOSED does not imply EFFECT_CLOSED.

## 12. Configuration closure
Configuration can dynamically select provider, endpoint, plugin, executable, device, policy, capability, or effect class.
Configuration is therefore part of effect-path closure.
A runtime configuration change that expands a protected effect domain must trigger REVALIDATE / RE-ADMIT or be rejected.

## 13. Deployment closure
Bind artifact digest to runtime identity, network policy, device policy, capabilities, subprocess policy, plugin set, provider set, enforcement boundary, and VersionSet.
A changed deployment topology invalidates affected coverage claims even if source code is unchanged.

## 14. Capability-bounded execution
Candidate:
PLANNER → operation → analyzer → protected validator → capability issuance → sandboxed executor → protected/equivalent boundary → provider.
The executor should not possess ambient authority to create arbitrary effects.
Its capability can encode effect class, target/domain, operation/effect identity, authority epoch, fence, VersionSet, expiry/nonce, and footprint/context binding.
This shifts part of the problem from proving all possible behavior toward proving that behavior outside the capability cannot produce the protected effect. Bypass closure remains necessary.

## 15. Structural deny versus analytical detection
ANALYTIC CONTROL: detect that code calls provider X.
STRUCTURAL CONTROL: code without the capability cannot reach provider X.
The second is stronger because correctness does not depend solely on the analyzer finding every call.
Preferred architecture: analysis finds candidate paths; structural enforcement prevents unauthorized paths; protected validation grants bounded authority; evidence records admitted effects.

## 16. Hard residual classes
Residual difficult classes include arbitrary native code, JIT/runtime code generation, unrestricted reflection, arbitrary shell execution, privileged host access, kernel/device drivers, remote providers with weak authorization, compromised dependencies, side-channel effects, and undocumented management interfaces.
These must not be forced into PROVEN_BOUNDED. They become RESTRICTED, DESIGNATED_EXTERNAL, or UNKNOWN according to the actual boundary.

## 17. Closure levels
C0 — Unbounded: arbitrary dynamic effects possible.
C1 — Enumerated: known effect sinks and providers listed.
C2 — Build-bounded: artifact/dependency/generated-code closure bound.
C3 — Deployment-bounded: runtime capabilities/network/device/subprocess/IPC paths structurally restricted.
C4 — Enforcement-bounded: protected boundary prevents effects outside declared closure.
C5 — Evidence-bounded: claim includes current artifacts, topology, enforcement and invalidation context.
These are descriptive closure states, not assurance scores.

## 18. Critical rule
A higher closure level must never be inferred from a lower one.
C1 != C2; C2 != C3; C3 != C4; C4 != C5.
All known sinks scanned does not imply that no unknown sink exists.

## 19. Adversarial cases
New dependency added to lockfile → build closure changes; coverage invalidated.
Generated client changes endpoint → artifact/context mismatch; old coverage invalid.
Plugin directory changes → plugin closure invalid unless immutable and digest-bound.
Child process inherits network capability → deployment closure must catch or block it.
Privileged Unix socket remains reachable → IPC closure catches alternate path.
Configuration changes provider endpoint → protected re-admission required.
Container becomes privileged → deployment closure invalidated.
Sidecar bypass route appears → topology coverage invalidated.
Native extension loads arbitrary code → native runtime capability must be bounded or closure remains UNKNOWN.
Analyzer misses generated code → artifact inventory prevents a positive completeness claim.

## 20. New contracts
PSC-105 — Build Closure Binding
PSC-106 — Generated Artifact Binding
PSC-107 — Plugin Closure
PSC-108 — Subprocess Closure
PSC-109 — Network Destination Closure
PSC-110 — Device Boundary Closure
PSC-111 — IPC Closure
PSC-112 — Configuration Closure

## 21. New invariants
INV-GA14-01-117: Effect-path coverage claims bind to the exact build artifact set.
INV-GA14-01-118: Generated artifacts are part of effect-path closure.
INV-GA14-01-119: Unbounded dynamic plugin sets cannot satisfy bounded coverage.
INV-GA14-01-120: Arbitrary subprocess execution is incompatible with bounded effect closure unless authority is structurally constrained.
INV-GA14-01-121: Network allowlisting alone does not establish complete effect closure because IPC, device, and local-provider paths may remain.
INV-GA14-01-122: Deployment privilege expansion invalidates affected effect-path coverage.
INV-GA14-01-123: Runtime configuration that expands an effect domain requires protected re-admission.
INV-GA14-01-124: Analytical detection is weaker than structural prevention of unauthorized effect paths.

## 22. Mini-audit
No contradiction found.
This round strengthens the gateway result: the tractable architecture is not a perfect analyzer. It is structural prevention of unauthorized effect paths, with analysis auditing the remaining closure.
The new risk is that sandbox and deployment controls become part of the TCB. Their versions, policies, enforcement points and failure modes therefore belong in VersionSet and evidence.

## 23. Status
Build closure: DESIGN REFINED.
Generated-code closure: DESIGN REFINED.
Plugin closure: OPEN / structurally constrainable.
Subprocess closure: DESIGN REFINED.
Network closure: DESIGN REFINED.
Device closure: OPEN / separate boundary likely.
IPC closure: OPEN.
Configuration closure: DESIGN REFINED.
Universal semantic completeness: NOT PROVEN.
Implementation: NOT STARTED.

Next research target: study whether a capability-bounded executor can be made small enough that kernel/container/provider enforcement mechanisms form a tractable TCB, including native code, dynamic loading, IPC and device access.
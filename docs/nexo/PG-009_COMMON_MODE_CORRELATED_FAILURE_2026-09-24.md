# NEXO — PG-009 COMMON-MODE / CORRELATED-FAILURE ARCHITECTURE
Fecha: 2026-09-24

## Status
DESIGNED / RESEARCH-CROSS-CHECKED.
No implementation, fault injection, quantitative safety claim, or TLC verification is claimed.

## Research question
Can apparently independent Nexo safety layers fail together because they share a hidden dependency, failure domain, authority, artifact, state, operator, or semantic assumption?

## Cross-check
NIST material on software common-cause failures identifies common hardware, software, personnel, tools, documentation, interfaces, algorithms and processes as possible common causes; it emphasizes analyzing the safety function rather than merely counting backup components. citeturn0search37
IEC 61508 explicitly includes methodology for addressing hardware common-cause failures and treats independence/diversity as functional-safety concerns. citeturn0search0turn0search5
IEC 62340 gives a concrete safety-system example where independent I&C systems are used to cope with common-cause failure; it is domain-specific and is used here only as an architectural analogy. citeturn0search11
NIST SP 800-193 similarly recommends that recovery mechanisms and recovery images be protected independently of the running firmware. citeturn0search36

These sources support the analysis pattern, not a claim that Nexo meets any standard.

## Core finding

Process separation is not independence.

For Nexo:

INDEPENDENT PROCESS != INDEPENDENT FAILURE DOMAIN
DIFFERENT MODEL != INDEPENDENT EVIDENCE
DIFFERENT SERVICE != INDEPENDENT AUTHORITY
DIFFERENT HOST != INDEPENDENT TRUST
REPLICATED STATE != INDEPENDENT STATE
SECOND VERIFIER != INDEPENDENT VERIFIER

A safety claim must identify the dependencies that can cause multiple supposedly independent controls to fail or agree incorrectly at the same time.

## Common-mode dependency domains

Every critical safety component receives a dependency set:

CM_DOMAIN {
  hardware
  host
  kernel
  hypervisor
  container/runtime
  storage
  network
  DNS/service-discovery
  clock/time
  identity-provider
  credential/key/KMS
  trust-root
  policy-source
  configuration
  artifact/update-source
  builder/CI
  dependency/package
  model/provider
  data/source
  operator/personnel
  administration/control-plane
  observability/logging
  coordination-store
  recovery-store
  semantic/schema/state-machine
}

The exact set is deployment-specific and must be versioned.

## Dependency graph

Represent critical components as a directed graph:

component -> dependency -> dependency -> failure domain

For each critical claim, calculate the transitive closure relevant to that claim.

A verifier is not independent if it depends on the same compromised:
- identity provider;
- policy service;
- storage;
- host;
- update artifact;
- clock;
- administrator;
- trust root;
- model/provider;
- coordination store.

## Correlated failure classes

CF-1 shared infrastructure:
executor, gate and verifier share host/kernel/hypervisor.

CF-2 shared authority:
normal execution, emergency stop and recovery all depend on the same authority service/key.

CF-3 shared trust root:
update verifier and recovery verifier accept the same compromised root.

CF-4 shared artifact:
executor, verifier and emergency gate are produced from the same compromised build artifact.

CF-5 shared semantics:
two verifiers independently execute the same flawed policy/schema/state-machine interpretation.

CF-6 shared state:
supposedly independent observers read the same corrupted state store.

CF-7 shared time:
expiry, freshness, lease and epoch logic all trust one compromised/stale clock.

CF-8 shared network:
safety channel and execution channel fail or are manipulated together.

CF-9 shared operator/control plane:
one administrative credential can modify every safety boundary.

CF-10 shared model/provider:
multiple "independent" reasoners receive the same manipulated model output or provider state.

CF-11 shared dependency:
different components import the same vulnerable package/library/runtime.

CF-12 shared recovery mechanism:
normal plane and recovery plane depend on the same compromised recovery service.

CF-13 shared observability:
all evidence disappears or becomes misleading through one logging/telemetry failure.

CF-14 semantic common mode:
different implementations share the same wrong interpretation of STOP, UNKNOWN, AUTHORIZED, RELEASE or SUCCESS.

## Safety-claim contract

A critical safety claim must bind:

claim_id
protected function
components relied upon
required evidence
dependency closure
common-mode domains
independence assumptions
diversity assumptions
failure assumptions
authority domains
trust roots
artifact/config versions
policy/invariant versions
world-state assumptions
freshness bounds
known correlated-failure scenarios
assurance degradation rule
expiry/review

If a dependency is UNKNOWN, independence cannot be upgraded silently.

## Independence levels

I0 — process separation only.
I1 — distinct runtime instances.
I2 — distinct hosts/failure domains.
I3 — distinct trust/authority dependencies.
I4 — distinct implementation/artifact/semantic paths.
I5 — independently governed recovery and actuation path.

These are architectural assurance labels, not universal safety levels.

A higher level requires evidence for the lower relevant dependencies; it cannot be inferred merely from topology.

## Diversity rule

Diversity is useful only when it breaks a relevant common cause.

Examples:
- two models from different providers can still share the same manipulated input;
- two implementations can share the same flawed requirement;
- two observers can share the same corrupted database;
- two hosts can share the same hypervisor;
- two signing systems can share the same compromised root;
- two clocks can share the same upstream time source.

Therefore:

DIVERSITY MUST BE TRACEABLE TO A FAILURE-MODE BREAK.

## Safety degradation

When a critical common-mode dependency fails:

NORMAL
→ ASSURANCE_DEGRADED
→ RESTRICTED / HOLD / QUARANTINE
→ REVALIDATE
→ RESTORE ASSURANCE
→ NORMAL

The system must not continue at the previous assurance level merely because one remaining component still responds.

For critical claims, unknown dependency state is itself an epistemic state.

## Evidence independence

Two observations count as corroboration only when their relevant evidence paths are sufficiently independent for the claim.

Thus:
- two logs from one compromised host are not independent;
- two services reading one database are not independent;
- two model outputs generated from one manipulated source are not independent;
- two signatures under one compromised root are not independent trust anchors.

The Evidence Contract must therefore carry dependency/common-mode metadata.

## Update interaction

Safety-plane update admission must evaluate common-mode changes.

A candidate update is not acceptable merely because it preserves local interfaces.

It must identify whether it changes:
- trust roots;
- verifier implementation;
- emergency gate;
- recovery path;
- coordination store;
- policy source;
- dependency closure;
- shared runtime;
- artifact builder;
- operator authority;
- observability.

A change that collapses two previously independent failure domains is a safety-relevant architecture transition.

## Recovery interaction

Recovery must preserve or explicitly account for independence.

A recovery path that restores executor, verifier and recovery authority from one compromised snapshot is one correlated recovery event, not three independent protections.

Recovery should record:
- dependency graph version;
- failure domains believed compromised;
- remaining trusted domains;
- recovery authority;
- evidence that trust roots remain valid;
- whether diversity/independence assumptions survive recovery.

## Emergency-stop interaction

For an emergency stop, the assurance claim must answer:

1. Can executor failure prevent the stop?
2. Can verifier failure prevent proof of enforcement?
3. Can common identity failure disable both?
4. Can shared storage erase stop state?
5. Can shared network failure affect both stop and execution?
6. Can update replace both gate and verifier?
7. Can one operator credential alter both emergency authority and executor?
8. Can a common clock invalidate both stop freshness and recovery fencing?

If yes, the claimed independence must be reduced and the resulting state must be explicit.

## Failure-domain matrix

For each critical control pair A/B:

same host? same kernel? same hypervisor? same storage? same network? same identity? same key? same policy? same artifact? same builder? same model/provider? same data? same clock? same admin? same coordination store? same recovery path? same semantic specification?

Any YES becomes a candidate common-mode edge.

UNKNOWN is not NO.

## Adversarial tests

1. compromise shared identity provider;
2. compromise shared KMS/trust root;
3. corrupt shared policy;
4. corrupt shared configuration;
5. compromise update artifact;
6. compromise builder/CI;
7. corrupt shared storage;
8. partition shared network;
9. corrupt/stale clock;
10. compromise coordination store;
11. compromise shared host/kernel/hypervisor;
12. shared runtime/package vulnerability;
13. common malicious model/provider response;
14. common manipulated input;
15. shared schema/state-machine defect;
16. shared administrator credential;
17. shared logging corruption;
18. recovery snapshot contains the same compromise;
19. verifier and gate updated together by one authority;
20. two "independent" observers read identical corrupted evidence;
21. one common dependency fails during emergency STOP;
22. one common dependency fails during release;
23. common dependency changes during staged update;
24. dependency closure reports UNKNOWN;
25. A→B→A recovery attempts to hide a common-mode compromise.

## New invariants

INV-669 — process/service separation alone cannot establish independence.
INV-670 — every critical safety claim has a dependency closure.
INV-671 — UNKNOWN dependency is not equivalent to independence.
INV-672 — shared trust roots constrain claimed verifier independence.
INV-673 — shared authority constrains claimed control-plane independence.
INV-674 — shared artifact/builder constrains claimed implementation independence.
INV-675 — shared semantics constrain claimed diversity.
INV-676 — shared state constrains claimed evidence independence.
INV-677 — shared time source constrains freshness/lease independence.
INV-678 — common-mode failure degrades assurance explicitly.
INV-679 — critical assurance cannot silently continue after loss of required independence.
INV-680 — evidence corroboration requires relevant dependency separation.
INV-681 — recovery must record compromised and trusted failure domains.
INV-682 — recovery cannot recreate multiple independent claims from one compromised source without qualification.
INV-683 — update changes that collapse failure domains require governed safety review.
INV-684 — emergency-stop independence claims include identity/network/storage/update dependencies.
INV-685 — diversity must be linked to an identified failure-mode break.
INV-686 — same-input observers are not automatically independent.
INV-687 — same-root signatures are not independent trust anchors.
INV-688 — common-mode dependency graphs are versioned inputs to critical admission.
INV-689 — dependency-closure UNKNOWN blocks or restricts critical assurance.
INV-690 — safety claims expire or require revalidation after material dependency changes.

## Architectural result

Nexo now treats independence as an evidence-backed claim:

SAFETY CLAIM
→ DEPENDENCY CLOSURE
→ FAILURE-DOMAIN ANALYSIS
→ COMMON-MODE ANALYSIS
→ DIVERSITY/INDEPENDENCE EVIDENCE
→ ASSURANCE LEVEL
→ ADMISSION

rather than:

"there are two processes, therefore there are two protections."

## Limitations

This remains architecture, not a quantitative reliability model.

Still unresolved:
- exact deployment failure domains;
- quantitative CCF probabilities;
- Byzantine correlated compromise;
- hardware/root-of-trust assumptions;
- executable dependency-graph model;
- automated independence checker;
- TLC verification;
- fault-injection implementation.

## Next research

1. Correct/expand the recovery TLA+ model.
2. Add common-mode/failure-domain state to formalization.
3. Model update/rollback transitions and dependency changes.
4. Define an executable safety-claim/dependency-closure schema.
5. Implement fault-injection scenarios.
6. Run TLC when tooling is available.
7. Perform final PG-009 semantic reconciliation before opening the next Property Gap.

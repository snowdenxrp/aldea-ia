# NEXO TCB / COMMON-MODE / ATOMICITY CONCENTRATION ANALYSIS V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. Architecture remains blocked.

## 1. External cross-check

NIST SP 800-160 Rev. 1 describes trustworthy secure systems engineering as a system-level discipline across the lifecycle and emphasizes mapping security design characteristics to system elements and their dependencies. NIST SP 800-160 Vol. 2 Rev. 1 treats cyber resiliency as a property engineered across systems and services, including the ability to anticipate, withstand, recover and adapt to adverse conditions. This supports analyzing the TCB as a dependency concentration and failure-propagation problem, not merely as a list of trusted modules. citeturn0search0turn0search3turn0search13

## 2. TCB definition for this research

For Nexo, TCB is not synonymous with “important software.”

A component/function enters the effective TCB for a claim when failure, compromise or semantic corruption of that element can cause the system to accept a protected claim or protected external effect that should have been rejected.

Therefore:

TCB(claim) = minimum mechanisms whose correctness/trustworthiness is necessary for that claim.

A component may be inside the TCB for one claim and outside it for another.

## 3. Candidate TCB domains

### T1 — Trust / Identity primitives
Responsible for:
- trust-root validation;
- identity authenticity;
- attestation where required;
- credential validity.

If compromised:
authority and provenance claims may collapse.

### T2 — Authority admission
Responsible for:
- current AuthorityContext;
- scope;
- epoch;
- revocation;
- policy/invariant applicability.

If compromised:
unauthorized protected effects may become admissible.

### T3 — Protected state transition / linearization
Responsible for:
- atomic protected transitions;
- fencing;
- stale-actor exclusion;
- durable ordering.

If compromised:
otherwise-correct policy can be bypassed by race/interleaving.

### T4 — Safety / emergency stop
Responsible for:
- independent stop admission;
- enforcement;
- stop epoch;
- prevention of normal execution bypass.

If compromised:
normal execution may continue despite a valid stop.

### T5 — Recovery fence
Responsible for:
- quarantine;
- current fence observation;
- recovery ownership;
- reconciliation before release;
- explicit release.

If compromised:
restart/recovery can become an authority-escalation channel.

### T6 — Effect identity
Responsible for:
- exact effect identity;
- target binding;
- parameter fingerprint;
- idempotency/replay semantics.

If compromised:
retry, duplication and cross-operation evidence substitution become possible.

### T7 — Evidence validity
Responsible for:
- exact claim/effect/target binding;
- provenance;
- freshness;
- dependency closure;
- invalidation.

If compromised:
stale or unrelated evidence can support current release.

### T8 — Configuration/version admission
Responsible for:
- complete VersionSet;
- semantic compatibility;
- policy/invariant/configuration integrity;
- safety-relevant activation.

If compromised:
individually valid components can be combined into an unsafe system.

## 4. TCB concentration findings

### TC-01 — Trust-root concentration
Trust root can affect identity, authority, evidence provenance, recovery and updates.

Mitigation question:
Can all these claims safely share one root, or must some trust domains be separated?

### TC-02 — Linearization concentration
A single state-transition primitive may protect many guarantees.

This reduces distributed race complexity but creates a high-value failure domain.

Required analysis:
- compromise;
- corruption;
- availability failure;
- rollback;
- stale replica;
- storage corruption;
- recovery path.

### TC-03 — Stop concentration
The stop plane must be sufficiently independent from normal execution that the executor cannot disable it.

However, making it “independent” creates new trust dependencies that must themselves be evaluated.

### TC-04 — Recovery concentration
Recovery is inherently privileged.

If the recovery mechanism can rewrite state and then declare itself recovered, it becomes a hidden authority channel.

Therefore recovery must not both create the conditions for release and unilaterally authorize execution.

### TC-05 — Evidence concentration
A universal verifier can simplify assurance but can become a single common-mode failure for many claims.

Independent verification is claim-specific, not automatically required for every property.

### TC-06 — Version-set concentration
The version-set mechanism controls which combination of components is considered active.

It therefore belongs to the safety architecture, not ordinary deployment metadata.

## 5. TCB minimization rule

Do NOT minimize TCB by merely reducing the number of processes.

Minimize the semantic authority of the trusted core.

A large component with no ability to create protected effects may be outside the TCB for a specific claim.

A tiny component that controls release eligibility may be inside the TCB.

Therefore TCB minimization should measure:
- authority;
- protected state access;
- effect admission;
- ability to alter trust context;
- ability to invalidate/accept evidence;
- recovery/update powers;
- common-mode reach.

## 6. TCB cut-set analysis

A claim is unsafe if every admissible path to its protected guarantee passes through a compromised common-mode cut set.

Candidate cut sets:

CS-01 Trust root + identity
CS-02 Authority admission + linearization
CS-03 Final execution gate
CS-04 Stop enforcement
CS-05 Recovery fence + release
CS-06 Effect identity + reconciliation
CS-07 Evidence validity + verifier
CS-08 VersionSet + activation
CS-09 External observation + reconciliation authority

A future architecture must explicitly state which cut sets are:
- single trusted dependency;
- replicated;
- independently implemented;
- independently verified;
- recoverable;
- deliberately accepted as residual risk.

No numerical “security score” is assigned.

## 7. What must NOT be in the TCB by default

Unless a specific claim proves otherwise:
- planner/model;
- natural-language parser;
- ordinary memory/knowledge;
- UI;
- optimizer/reward computation;
- convenience orchestration;
- analytics;
- telemetry aggregation;
- proof cache;
- non-authoritative audit projections.

These may influence proposals, but cannot independently authorize protected effects.

## 8. TCB and common-mode interaction

For every candidate TCB component:

TCB element
→ owner
→ authority
→ state variables
→ dependencies
→ failure domains
→ recovery dependencies
→ update path
→ verification method
→ common-mode neighbors
→ claims affected.

If two supposedly independent TCB components share a critical dependency, independence is reduced to that shared domain.

## 9. TCB and availability

A TCB dependency that becomes unavailable creates a separate design question:

Can Nexo safely degrade?

For protected authority/safety decisions:
UNKNOWN current authority → HOLD/RESTRICT.

For noncritical cognition:
degradation may be tolerated.

Therefore availability requirements must be claim-specific; “system unavailable” cannot be treated as one global condition.

## 10. New invariants

TCB-01: TCB membership is claim-specific.
TCB-02: TCB membership is determined by ability to affect a protected guarantee, not component importance.
TCB-03: every TCB element has explicit dependency and failure-domain closure.
TCB-04: common-mode compromise of a required TCB cut set invalidates affected assurance.
TCB-05: recovery cannot both establish and unilaterally authorize its own release conditions.
TCB-06: evidence verification cannot silently depend on the same compromised source it is supposed to validate independently.
TCB-07: the atomicity/linearization mechanism is TCB where its failure can bypass protected transition semantics.
TCB-08: configuration/version admission is TCB for safety claims whose validity depends on the active version set.
TCB-09: TCB availability failure must have explicit DENY/HOLD/RESTRICT semantics.
TCB-10: reducing process count does not prove TCB reduction.
TCB-11: every claim must identify its minimal required TCB closure.
TCB-12: TCB changes are safety-relevant architecture changes and require impact analysis/reverification.

## 11. Research result

We now have the missing bridge:

ATOMICITY GRAPH
+
COMMON-MODE GRAPH
+
TCB GRAPH

These are not three independent diagrams. They form one assurance structure:

STATE
→ TRANSITION
→ ATOMICITY
→ DEPENDENCIES
→ FAILURE DOMAINS
→ TCB
→ EVIDENCE
→ CLAIM

This gives us a principled way to compare the future A/B/C storage architectures: not by performance or simplicity alone, but by which protected guarantees each topology can actually enforce, what failure domains it creates, and what becomes part of the TCB.

## 12. Next gate

Before topology selection:

1. enumerate every canonical claim;
2. compute its minimal TCB closure;
3. overlay TCB closure with common-mode domains;
4. identify unavoidable single points of trust/failure;
5. identify where independent implementation/verification is actually necessary;
6. map TCB changes to update/recovery/decommission paths;
7. formalize the resulting claim-specific TCB graph;
8. only then compare architecture A/B/C.

No implementation, migration or V21 runtime construction is authorized.
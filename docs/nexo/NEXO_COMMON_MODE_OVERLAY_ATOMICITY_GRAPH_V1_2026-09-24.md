# NEXO COMMON-MODE OVERLAY ON ATOMICITY GRAPH V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. Architecture remains blocked.

## 1. Research basis

NIST SP 800-160 Rev. 1 explicitly discusses failure propagation, protective failure/recovery, redundancy and diversity, including the danger of common-mode failures. NIST SP 800-160 Vol. 2 Rev. 1 also calls for dependency analysis that examines how resiliency functions depend on underlying security functions and how failures can propagate into the system-of-interest and its environment. citeturn0search20turn0search22

## 2. New graph dimension

The previous dependency graph answered:
“What state/function depends on what?”

This overlay adds:
“Which dependencies can fail together?”

Therefore every critical dependency now has two independent attributes:

DEPENDENCY RELATION
and
FAILURE-DOMAIN RELATION.

Different processes, services, models or machines are NOT automatically independent.

## 3. Common-mode domain taxonomy

CM-01 Hardware
CM-02 Host/VM
CM-03 Kernel/runtime
CM-04 Container/orchestration
CM-05 Storage
CM-06 Network
CM-07 DNS/service discovery
CM-08 Clock/time source
CM-09 Identity provider
CM-10 Credential/KMS
CM-11 Trust root
CM-12 Policy/configuration source
CM-13 Artifact/update source
CM-14 Builder/CI
CM-15 Package/dependency supply chain
CM-16 Model/provider
CM-17 Data/source
CM-18 Operator/personnel
CM-19 Administration/control plane
CM-20 Observability/logging
CM-21 Coordination store
CM-22 Recovery store
CM-23 Schema/semantic/state-machine definition

## 4. False-independence findings

### FI-01 — Separate verifier processes
Two verifier processes sharing the same trust root, policy source, dependency package or host are not independent for claims that depend on those domains.

### FI-02 — Separate databases
Two databases on the same storage substrate or under the same administrative/credential path may share a failure domain.

### FI-03 — Separate models
Different model families using the same provider, data, prompt transformation, retrieval corpus or policy source may share common failure modes.

### FI-04 — Separate clocks
Two clocks are not independent evidence if both derive from the same time source or if timestamp integrity depends on the same compromised authority.

### FI-05 — Separate evidence observers
Two observers reading the same compromised source do not provide independent world evidence.

### FI-06 — Recovery versus production
A recovery service hosted on the same infrastructure, trust root, identity path or dependency chain as production may not be independent from the failure it is meant to recover.

### FI-07 — Stop plane versus execution
A stop service that shares the same control process, credentials, runtime or failure domain as the executor is not truly independent merely because it has a separate API.

### FI-08 — Update verifier versus update source
A verifier that obtains both its verification logic and artifacts from the same compromised update path cannot establish independence from that path.

### FI-09 — Audit versus state store
An audit log stored through the same mutable state path may fail together with the state it is supposed to independently establish.

### FI-10 — Reconciliation versus external observation
A reconciliation service does not become an independent source of truth simply by being a separate process if it observes the same potentially compromised upstream source.

## 5. Critical-cut overlay

### CUT-01 Trust root
Potential common modes:
CM-09, CM-10, CM-11, CM-12, CM-14, CM-15.

A compromise can affect identity, authorization, evidence provenance, recovery and updates simultaneously.

### CUT-02 Authority linearization
Potential common modes:
CM-05, CM-21, CM-08, CM-09, CM-10, CM-12, CM-23.

A failure here can affect multiple protected transitions simultaneously.

### CUT-03 Final execution gate
Potential common modes:
CM-01..CM-05, CM-08..CM-12, CM-19, CM-21, CM-23.

This is the most direct path from architectural failure to protected external actuation.

### CUT-04 Stop enforcement
Required independence analysis:
normal executor, coordination store, normal policy path, normal credentials, normal host/runtime.

If stop enforcement shares all of them, the “independent stop” claim may collapse.

### CUT-05 Effect identity
Potential common modes:
CM-05, CM-12, CM-21, CM-23.

Corruption here can cause retry duplication, evidence substitution or UNKNOWN erasure.

### CUT-06 Version-set integrity
Potential common modes:
CM-11..CM-15, CM-19, CM-23.

A single compromised configuration/update chain can invalidate otherwise separate components.

### CUT-07 Evidence validity
Potential common modes:
CM-05, CM-08, CM-11, CM-12, CM-16, CM-17, CM-20, CM-23.

Evidence independence must therefore be claim-specific.

### CUT-08 Recovery fence
Potential common modes:
CM-05, CM-09..CM-12, CM-19, CM-22, CM-23.

Recovery cannot be considered independent if the same failure can alter both the failed state and the recovery authority.

### CUT-09 External reconciliation
Potential common modes:
CM-06, CM-07, CM-09, CM-16, CM-17, CM-18, CM-20.

External reconciliation must distinguish “another process observed it” from “an independent failure domain observed it.”

### CUT-10 Decommission closure
Potential common modes:
CM-09, CM-10, CM-12, CM-19, CM-21, CM-22, CM-23.

A decommission claim is incomplete if the same common mode can silently recreate authority or resurrect workers.

## 6. Independence labels

The previous I0–I5 labels are retained only as architectural descriptors, not scores or certifications.

I0 — same failure domain.
I1 — process/runtime separation only.
I2 — infrastructure separation.
I3 — distinct administrative/control domain.
I4 — distinct trust/authority domain.
I5 — claim-specific independence with explicit dependency and common-mode analysis.

An I5 label is not automatically a safety level. It is valid only relative to a stated claim and its dependency closure.

## 7. Assurance consequence

For every safety claim:

CLAIM
→ required evidence
→ observers
→ dependencies
→ failure domains
→ common-mode relationships
→ independence assumptions
→ authority domains
→ trust roots
→ configuration/version context.

If the claim requires independence and the required domains collapse into a common mode:

ASSURANCE_DEGRADED
→ RESTRICTED / HOLD / REVALIDATE

It must NOT silently remain NORMAL.

## 8. New invariants

CM-01: process separation does not imply failure-domain independence.
CM-02: service diversity does not imply evidence independence.
CM-03: model diversity does not imply provider/data/policy independence.
CM-04: replicated state does not imply independent state.
CM-05: a recovery mechanism must be analyzed against the failure domains of the state it recovers.
CM-06: emergency stop independence is claim-specific and must be demonstrated by failure-domain analysis.
CM-07: every critical evidence source has an explicit dependency closure.
CM-08: common-mode collapse lowers assurance when independence is required.
CM-09: a common dependency can invalidate multiple apparently independent claims.
CM-10: independence labels never replace explicit dependency/failure-domain evidence.
CM-11: trust-root and administrative-domain sharing are safety-relevant common modes.
CM-12: unavailable independence must result in HOLD/RESTRICT/REVALIDATE when the claim requires it.

## 9. Architecture consequence

The final Nexo architecture needs a typed graph with at least:

- object/dependency edges;
- authority edges;
- ownership edges;
- atomicity edges;
- failure-domain edges;
- trust-root edges;
- evidence/provenance edges;
- recovery/update edges;
- external-world boundaries.

This means the future architecture cannot merely say:
“component A is separate from component B.”

It must be able to answer:
“separate in which failure domains, under which trust assumptions, for which exact claim?”

## 10. Next gate

Before selecting topology A/B/C:

1. overlay all common-mode domains onto every atomicity bundle;
2. calculate shared cut sets;
3. identify where independence is actually required;
4. identify minimum diversity required for each claim;
5. determine which common-mode failures force HOLD/RESTRICT;
6. map common modes into the formal model;
7. determine whether the proposed TCB itself creates a common-mode concentration;
8. compare topology A/B/C using the resulting graph, not abstract database properties.

No implementation, migration or V21 runtime construction is authorized.
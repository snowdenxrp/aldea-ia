# NEXO TRUSTED FENCE COMPROMISE, FALSE ENFORCEMENT EVIDENCE AND INDEPENDENT ASSURANCE RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## Evidence
NIST treats verification/validation as a distinct activity and notes that access-control policy/model verification must account for inconsistency and incompleteness between specification and implementation. NIST zero-trust guidance also recommends ongoing verification that actual enforcement matches defined policy, rather than trusting a control merely because it exists. citeturn0search0turn0search1turn0search2
NIST's cloud-native ZTA model emphasizes identity-based enforcement at application/service boundaries. SPIFFE separately models trust domains and their issuing cryptographic roots, including key rotation and trust-domain-specific validation. These are useful analogies for separating identity, trust context, enforcement and evidence. citeturn0search3turn0search4

## Core result
A fence cannot be a safety root merely because:
- the fence controller says ACTIVE;
- the resource says ACTIVE;
- a verifier says VERIFIED;
- a signature is valid;
- two components independently report the same state.

If the verifier, resource, evidence source and trust root share a compromise domain, the apparent verification may be circular.

Candidate rule:
ENFORCEMENT_EVIDENCE != ENFORCEMENT_TRUTH

and, more precisely:
VERIFIED(FENCE) -> VERIFIED_ONLY_RELATIVE_TO_TRUST_AND_OBSERVATION_ASSUMPTIONS

## 1. The four-way split
Separate:
1. Enforcement state: what the boundary is configured to enforce.
2. Enforcement observation: what an observer reports.
3. Enforcement evidence: authenticated evidence supporting a property.
4. Enforcement truth: the actual external behavior of the boundary.

Nexo may only claim #4 when the assurance contract justifies the inference.

Therefore:
CONFIGURED != ENFORCED
OBSERVED != TRUE
SIGNED != CURRENT
VERIFIED != INDEPENDENT
INDEPENDENT != COMPLETE

## 2. Same-root verifier attack
Attack:
- resource R enforces fence F;
- verifier V checks R;
- V and R share root K;
- attacker compromises K;
- R reports correct-looking state;
- V validates it;
- Nexo publishes FENCE_ENFORCED.

The chain is cryptographically valid but not independent.

This extends the existing common-mode rule:
PROCESS SEPARATION != FAILURE-DOMAIN INDEPENDENCE.

Candidate requirement:
AssuranceDependencyGraph must include:
resource -> verifier -> trust root -> identity authority -> evidence source.

If the claim's critical support path contains a compromised common root, the claim must be invalidated or degraded.

## 3. False enforcement evidence
A provider may return:
fence_generation=42, enforced=true

while an alternate privileged path remains active.

Therefore a provider assertion cannot automatically establish complete containment.

The claim must name the exact property:
- token acceptance blocked;
- primary API blocked;
- all known APIs blocked;
- all known effect paths closed;
- provider-wide effect capability disabled;
- external world effect impossible.

These are different claims with different proof burdens.

## 4. Enforcement claim ladder
Candidate ladder:
E0 REQUESTED
E1 RECEIVED
E2 AUTHENTICATED
E3 CONTEXT_BOUND
E4 CONFIGURED
E5 ENFORCEMENT_ACCEPTED
E6 ENFORCEMENT_OBSERVED
E7 ENFORCEMENT_VERIFIED
E8 EFFECT-PATH-CLOSURE_VERIFIED
E9 INDEPENDENTLY_ASSURED_CONTAINMENT

E9 is not universal. It requires an explicit assurance contract and defined failure domains.

A system should never promote E6 to E9 by naming conventions.

## 5. Independent evidence is claim-specific
There is no universal notion of independent verifier.

Independence must be evaluated against:
- hardware;
- host/kernel;
- hypervisor;
- runtime;
- storage;
- network;
- clock;
- identity authority;
- KMS/trust root;
- policy/config;
- artifact/update source;
- provider;
- observer;
- operator;
- coordination store;
- recovery store.

A verifier independent from the provider but dependent on the same root key is not fully independent for a claim whose security rests on that root.

This directly extends the existing I0-I5 common-mode framework.

## 6. Three assurance classes
Candidate:

A0 SELF-ATTESTED
- source reports its own enforcement.

A1 CROSS-OBSERVED
- another component observes the enforcement.

A2 INDEPENDENTLY-ROOTED
- observation is backed by a failure-domain/trust root sufficiently independent for the exact claim.

None is automatically equivalent to world truth.

## 7. Tamper-resistant enforcement
If a protected boundary can be modified by an administrator or privileged process outside the fence contract, then fence enforced cannot be treated as unconditional.

The enforcement contract must define:
- who can mutate enforcement;
- what paths can mutate it;
- how those mutations are authenticated;
- how old enforcement state is invalidated;
- what happens during update/recovery;
- how rollback affects fence state;
- how break-glass paths are closed or reflected in the claim.

This extends the existing break-glass/open-world closure research.

## 8. Enforcement store rollback
Attack:
1. generation 42 is active;
2. fence advances to 43;
3. resource store snapshots;
4. rollback restores 42;
5. stale client holding 42 acts;
6. resource accepts it.

Therefore:
STORE_ROLLBACK != SAFE_FENCE_STATE

The fence state must have rollback protection or an external monotonicity mechanism.

Candidate FenceMonotonicityAnchor:
- survives ordinary snapshot restore;
- detects generation regression;
- binds to resource incarnation;
- fail-closes on ambiguity.

## 9. Resource compromise
If the resource itself is compromised, ordinary application-level fencing may become insufficient.

Candidate claim degradation:
RESOURCE_COMPROMISED -> FENCE_ASSURANCE_DEGRADED

If the resource remains capable of bypassing its own enforcement:
NO_STRONG_CONTAINMENT_CLAIM.

Nexo may still retain:
- historical evidence;
- attempted fence record;
- control-plane intent;
- external observation;
- weaker bounded claims.

It must not manufacture external safety from compromised self-reporting.

## 10. Independent external witness
A possible stronger architecture uses an external witness for specific properties.

Candidate FenceWitness must:
- have a distinct failure/trust domain;
- observe the relevant boundary;
- authenticate resource identity/incarnation;
- know the applicable fence generation;
- record observation context;
- have defined freshness;
- have a defined compromise response.

But:
SECOND_WITNESS != INDEPENDENT_WITNESS.

The common-mode dependency closure remains mandatory.

## 11. Cryptographic attestation
Cryptographic attestation can establish properties about an attested component/configuration, but it does not automatically prove that every external effect path is closed.

Therefore:
ATTESTED_CONFIGURATION != COMPLETE_EFFECT-CLOSURE.

Trust-domain systems such as SPIFFE explicitly bind identity validation to the appropriate trust domain and cryptographic bundle; key rotation changes the trust context, so identity validity is inherently context-dependent. citeturn0search4turn0search5

This maps directly onto Nexo's rule:
SIGNATURE_VALIDITY != CURRENT_TRUST.

## 12. False verifier during root compromise
Attack:
- root A is compromised;
- verifier V accepts evidence under A;
- root A is revoked;
- old evidence remains cryptographically valid;
- V continues to report enforcement.

Therefore root cutoff must propagate to enforcement claims:
ROOT_CUTOFF -> VERIFIER_INVALIDATION -> FENCE_CLAIM_INVALIDATION -> AUTHORITY_FENCING -> EFFECT_RECONCILIATION -> ASSURANCE_RECOMPUTATION.

This is consistent with the earlier root-reliance closure work.

## 13. Update and break-glass
A privileged update path can be an effect path.

If update/recovery can modify:
- fence generation;
- enforcement policy;
- resource identity;
- verifier;
- trust root;
- high-water mark;

then those paths belong in the fence's effect/bypass closure.

Otherwise the system can prove normal API is fenced while an update path remains effect-capable.

That is insufficient for a global containment claim.

## 14. What can actually be claimed?
Candidate claim hierarchy:

C0: FENCE_REQUESTED
C1: FENCE_ACCEPTED_BY_ENDPOINT
C2: FENCE_STATE_AUTHENTICATED
C3: FENCE_ENFORCEMENT_OBSERVED
C4: FENCE_ENFORCEMENT_VERIFIED_FOR_DECLARED_PATH
C5: KNOWN_EFFECT_PATHS_VERIFIED_CLOSED
C6: CONTAINMENT_VERIFIED_UNDER_DECLARED_ENVIRONMENT_CONTRACT
C7: STRONG_CONTAINMENT_ASSURED_UNDER_INDEPENDENT_TRUST/FAILURE-DOMAIN CONTRACT

C7 must remain unavailable if its independence assumptions are not satisfied.

## 15. New principle
A safety boundary cannot prove its own independence.

If the evidence needed to establish independence is generated by the same compromised dependency being evaluated, the proof is circular.

Candidate rule:
CLAIM_USED_TO_ESTABLISH_ITS_OWN_TRUST_BOUNDARY -> DENY

This is the enforcement analogue of the earlier compaction-assurance circularity result.

## 16. New invariants
ET-01: Enforcement configuration does not prove enforcement.
ET-02: Self-attested enforcement cannot establish independent assurance.
ET-03: A valid signature does not establish current trust after root cutoff.
ET-04: Enforcement claims must carry dependency/common-mode context.
ET-05: Shared trust roots count as shared failure dependencies.
ET-06: Resource rollback must not resurrect stale fence generations.
ET-07: Resource incarnation changes invalidate prior enforcement continuity.
ET-08: Break-glass/update/recovery paths are part of effect-path closure.
ET-09: A verifier cannot establish a stronger claim than its dependency closure supports.
ET-10: Cryptographic attestation does not automatically prove complete external effect closure.
ET-11: Compromised resource self-reporting cannot support strong containment.
ET-12: Strong containment requires a claim-specific assurance contract.
ET-13: Evidence supporting independence must not depend circularly on the boundary whose independence is being claimed.
ET-14: Root compromise invalidates dependent enforcement assurance unless independently re-established.
ET-15: Enforcement claim scope must not exceed verified effect-path closure.

## Candidate objects
- EnforcementAssuranceClaim
- EnforcementWitness
- EnforcementDependencyClosure
- EnforcementTrustContext
- FenceMonotonicityAnchor
- EnforcementBoundaryAttestation
- EnforcementVerificationRecord
- EnforcementClaimDegradation
- RootRelianceClosure
- BypassClosureCertificate

## Architecture consequence
The protected architecture now has four distinct semantic responsibilities:

1. SafetyOrderingDomain — orders authority and conflicting protected transitions.
2. ProtectedEnforcementContract — defines what the final effect-capable boundary must reject/enforce.
3. EnforcementAssurance — determines what evidence justifies a claim about that enforcement.
4. External Reconciliation — determines what actually occurred.

This prevents a dangerous collapse:
ORDER -> FENCE -> EVIDENCE -> WORLD TRUTH.

They remain separate.

## Open boundary
Next attack:
MULTI-WITNESS / MULTI-ROOT ASSURANCE FAILURE.

Scenario:
- two enforcement witnesses;
- different hosts;
- different processes;
- different trust roots;
- both attest the fence;
- but share a hidden dependency such as provider firmware, hypervisor, network path, clock, update source, or common administrative authority;
- one witness is stale;
- the other observes a replacement incarnation;
- root rotation occurs during the observation window.

Question:
Can Nexo construct a compositional assurance claim from multiple witnesses without accidentally treating correlated evidence as independent?

No correctness guarantee is claimed.

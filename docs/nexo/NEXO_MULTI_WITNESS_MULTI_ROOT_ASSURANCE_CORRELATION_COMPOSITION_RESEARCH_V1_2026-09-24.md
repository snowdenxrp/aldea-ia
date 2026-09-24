# NEXO MULTI-WITNESS MULTI-ROOT ASSURANCE CORRELATION AND COMPOSITION RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## Evidence boundary
SPIFFE explicitly treats trust domains as separate administrative/security boundaries, binds bundles to their trust-domain names, and warns that sharing cryptographic keys degrades isolation. It also uses monotonically increasing bundle sequence numbers for update ordering/supersession. These are useful analogies for Nexo's trust-context binding, but do not prove Nexo assurance composition. citeturn0search0turn0search1
SPIFFE federation also requires foreign bundles to remain distinct rather than pooled, because merging trust material can permit one trust domain to impersonate another. This supports a general architectural rule: evidence from different trust contexts must not be combined merely because each item is individually valid. citeturn0search2turn0search3

## Core result
Multiple witnesses do not automatically create independent assurance.

Candidate rule:
MULTI_WITNESS != INDEPENDENT_ASSURANCE

Composition is safe only when the claim's required failure-domain, trust-domain, freshness, scope, incarnation and causal dependencies are explicitly satisfied.

## 1. Individual validity is not joint validity
Suppose W1 and W2 each produce valid evidence E1 and E2.

It does not follow that:
VALID(E1) + VALID(E2) -> INDEPENDENT(E1,E2)

The witnesses may share:
- provider firmware;
- hypervisor;
- host management plane;
- network path;
- DNS;
- clock;
- identity authority;
- KMS;
- trust root;
- update source;
- policy/config;
- resource;
- resource incarnation;
- operator;
- recovery system;
- common observation source.

## 2. Evidence dependency graph
Candidate object:
EvidenceDependencyGraph.

Nodes:
- evidence record;
- witness;
- resource;
- resource incarnation;
- trust root;
- identity authority;
- policy/config;
- artifact/update source;
- network/clock;
- observer;
- external state;
- claim.

Edges:
SUPPORTS, DEPENDS_ON, DERIVED_FROM, INVALIDATES, OBSERVES, AUTHORIZES, PRESERVES.

For a claim C, construct its transitive support closure.

If two evidence paths converge on a dependency D that can falsify both, they are correlated for the relevant failure mode.

## 3. Independence is property-specific
W1 and W2 can be independent for one failure mode and correlated for another.

Example:
- separate hosts: independent of host crash;
- same hypervisor: correlated for hypervisor compromise;
- separate trust roots: independent of one key compromise;
- same operator: correlated for administrative compromise;
- separate observers: correlated if both consume the same provider self-report.

Therefore a single boolean INDEPENDENT is insufficient.

Candidate:
IndependenceVector = {failure_domain -> independent/correlated/unknown}.

## 4. Claim-specific quorum
A fixed rule such as 2-of-3 is insufficient.

If all three witnesses share one critical dependency, 3-of-3 may still provide one effective failure domain.

Conversely, two witnesses may be enough for a narrow claim if their relevant failure domains are genuinely independent and the claim's threat model permits it.

Candidate:
ClaimSpecificEvidenceThreshold.

Inputs:
- claim class;
- required properties;
- failure assumptions;
- evidence independence vector;
- witness freshness;
- scope overlap;
- resource incarnation;
- trust generation;
- common-mode closure.

## 5. Common-mode collapse
Attack:
W1 -> Provider P
W2 -> Provider P
W3 -> Provider P

All three report fence generation 42.

If P is compromised, the apparent 3-witness evidence can collapse to one compromised source.

Therefore:
N_WITNESSES != N_INDEPENDENT_SOURCES.

Candidate metric:
EffectiveAssuranceCardinality(C)

which counts independent support classes for the exact claim, not raw evidence records.

## 6. Hidden shared update source
Attack:
- W1 and W2 run on separate hosts;
- each has separate keys;
- both received the same malicious update artifact;
- both report fence enforcement.

The update source becomes a common-mode dependency.

Therefore artifact provenance belongs in evidence dependency closure.

This extends the existing dependency closure and update/rollback research.

## 7. Hidden shared hypervisor
Separate VMs do not automatically provide independent evidence if one hypervisor controls both.

Therefore:
PROCESS SEPARATION != HOST INDEPENDENCE
HOST SEPARATION != HYPERVISOR INDEPENDENCE
VM SEPARATION != FAILURE-DOMAIN INDEPENDENCE

## 8. Hidden shared clock
If the claim depends on freshness or lease expiry, two witnesses sharing a compromised clock source can produce mutually consistent but false freshness evidence.

Therefore freshness must bind to:
- authoritative ordering where required;
- monotonic local sequence where available;
- explicit clock assumptions;
- observation generation;
- evidence expiry.

Wall-clock agreement is not independence.

## 9. Mixed-generation witnesses
Attack:
W1 observes resource incarnation I1.
W2 observes replacement I2.
Both produce valid signatures.

Combining them without recognizing the incarnation mismatch can manufacture a false claim.

Therefore:
MIXED_GENERATION_EVIDENCE != COHERENT_ASSURANCE.

Candidate AssuranceBundle rule:
all evidence supporting one coherent protected claim must agree on the required context tuple:
- resource identity;
- resource incarnation;
- fence generation;
- authority epoch;
- root generation/trust context;
- policy/invariant version;
- effect identity/scope;
- observation boundary;
- dependency closure version.

If not, either split the claims or degrade/quarantine.

## 10. Multi-root evidence
Two witnesses may use different roots R1 and R2.

That does not automatically mean independence.

Cases:
A. R1 and R2 have genuinely independent compromise domains.
B. R1 and R2 are issued by the same authority.
C. R1 and R2 share update/recovery/operator dependencies.
D. One root is subordinate to the other.
E. The roots were created from the same compromised bootstrap.

Only A, subject to the exact claim contract, supports a meaningful independent-root assumption.

Candidate RootDependencyClosure.

## 11. Root rotation during evidence collection
Attack:
- W1 signs under root R1;
- root rotates to R2;
- W2 signs under R2;
- both signatures are valid under their respective contexts;
- evidence is combined as though it were one current bundle.

This is invalid unless the assurance contract explicitly defines a transition boundary and continuity semantics.

Candidate:
AssuranceContextTransition.

Rule:
ROOT_TRANSITION_IN_PROGRESS -> DO_NOT_MERGE_CROSS_GENERATION_EVIDENCE unless explicit transition proof exists.

SPIFFE's bundle sequence numbers and explicit key rotation semantics illustrate why trust material has an ordering/freshness context rather than being an unordered set of valid keys. citeturn0search0turn0search1

## 12. Stale witness
W1 may be independently rooted but stale.

W2 may be current but correlated with a compromised provider.

The correct result is not simply “two witnesses agree.”

The claim must evaluate:
CURRENTNESS × INDEPENDENCE × SCOPE × INCARNATION × TRUST CONTEXT.

Candidate assurance state:
- CURRENT_INDEPENDENT;
- CURRENT_CORRELATED;
- STALE_INDEPENDENT;
- STALE_CORRELATED;
- UNKNOWN.

## 13. Witness disagreement
If W1 says FENCE_ACTIVE and W2 says FENCE_INACTIVE:

DISAGREEMENT != automatically malicious.

Possible causes:
- different observation times;
- different resource incarnations;
- propagation delay;
- root transition;
- provider replication lag;
- actual enforcement divergence.

Therefore disagreement triggers causal/context analysis, not majority voting by default.

Candidate sequence:
FREEZE_CLAIM -> ALIGN_CONTEXTS -> CHECK_ORDER -> CHECK_INCARNATION -> CHECK_TRUST -> CHECK_DEPENDENCY_CLOSURE -> CLASSIFY -> RECONCILE.

## 14. Majority voting is not a universal assurance primitive
A majority is meaningful only relative to a defined fault model and independent membership.

Therefore:
MAJORITY != INDEPENDENCE
MAJORITY != CURRENTNESS
MAJORITY != EFFECT-PATH-CLOSURE
MAJORITY != WORLD-TRUTH

A 5-of-7 witness result can still be unsafe if all seven share the same compromised effect boundary.

## 15. Evidence composition algebra
Candidate composition operators:

AND:
requires all component claims to hold under compatible contexts.

OR:
requires at least one component to satisfy the claim, but the claim must state which branch was sufficient.

THRESHOLD:
requires a defined independent-support threshold under the claim's failure model.

SEQUENTIAL:
requires ordered evidence across a transition.

DISJOINT:
allows separate evidence for separate scopes only if their effect/authority closures are proven disjoint.

UNSAFE_UNION:
raw pooling of evidence without context/dependency closure.

Candidate rule:
UNSAFE_UNION is never an assurance constructor.

## 16. Witness evidence cannot silently amplify authority
Even a very strong multi-witness containment claim cannot automatically grant mission authority.

Therefore:
ASSURANCE_STRENGTH != AUTHORITY_SCOPE.

A witness bundle may justify a claim; a separate protected admission transition decides whether that claim permits an effect.

This preserves:
CLAIM != CAPABILITY != AUTHORITY.

## 17. Witness revocation
If one witness or root becomes compromised:

WITNESS_REVOKED
→ FIND_DEPENDENT_CLAIMS
→ INVALIDATE_OR_DEGRADE
→ RECOMPUTE_EFFECTIVE_ASSURANCE
→ FENCE_IF_REQUIRED
→ RECONCILE

A claim that relied on two witnesses cannot remain unchanged merely because one remaining witness still has a valid signature.

The claim's minimum assurance threshold must be recomputed.

## 18. Evidence graph SCC attack
Suppose:
W1 validates W2,
W2 validates W3,
W3 validates W1.

No external trusted support exists.

Then the cycle cannot create an independent assurance root.

This extends the earlier Assurance Dependency Graph result:
ASSURANCE_SCC_WITHOUT_EXTERNAL_ROOT -> NOT_INDEPENDENT_PROOF.

## 19. Candidate assurance construction
Candidate protocol:

REQUEST_CLAIM
→ FREEZE_CLAIM_CONTEXT
→ ENUMERATE_REQUIRED_PROPERTIES
→ BUILD_EVIDENCE_DEPENDENCY_GRAPH
→ COMPUTE_COMMON_MODE_CLOSURE
→ CLASSIFY_INDEPENDENCE_VECTOR
→ ALIGN_GENERATION/INCARNATION/TRUST CONTEXT
→ VERIFY_REQUIRED_EVIDENCE
→ APPLY_CLAIM_SPECIFIC_COMPOSITION
→ CHECK_EXTERNAL_ROOT/FOUNDATION
→ PUBLISH_ASSURANCE_BUNDLE
→ BIND_TO_CURRENT_AUTHORITY

Publication must itself be a protected transition.

## 20. Candidate AssuranceBundle
Fields:
- bundle_id;
- claim_id;
- evidence_ids;
- property set;
- effect scope;
- authority epoch;
- root/trust generation;
- policy/invariant generation;
- resource incarnation set;
- observation generations;
- freshness bounds;
- EvidenceDependencyGraph fingerprint;
- common-mode closure fingerprint;
- IndependenceVector;
- composition contract;
- required threshold;
- external assurance root;
- invalidation triggers;
- expiry/revalidation;
- permitted claim class;
- owner/authority.

## New invariants
MW-01: Multiple evidence records do not imply multiple independent sources.
MW-02: Independence is claim-specific and failure-mode-specific.
MW-03: Common-mode dependencies must be included in evidence closure.
MW-04: Mixed resource incarnations cannot support one coherent claim unless explicitly modeled.
MW-05: Mixed root generations cannot be merged as current assurance without an explicit transition contract.
MW-06: Majority counts do not replace independence analysis.
MW-07: Witness disagreement requires context/order analysis before claim publication.
MW-08: Stale evidence cannot become current merely through corroboration by another stale source.
MW-09: Revoking one critical witness requires recomputation of dependent claims.
MW-10: Assurance cycles without an external trusted root cannot establish independent assurance.
MW-11: Evidence composition cannot silently widen authority scope.
MW-12: An assurance bundle must bind its dependency/common-mode context.
MW-13: Raw evidence pooling without a composition contract is unsafe.
MW-14: A strong multi-witness claim remains bounded by the verified effect-path closure.
MW-15: Cross-trust-domain evidence must preserve explicit trust-domain binding.

## Candidate objects
- EvidenceDependencyGraph
- IndependenceVector
- EffectiveAssuranceCardinality
- ClaimSpecificEvidenceThreshold
- RootDependencyClosure
- AssuranceContextTransition
- WitnessContext
- WitnessRevocationClosure
- AssuranceCompositionContract
- AssuranceBundle
- CommonModeClosure

## Architecture consequence
Nexo should not have a generic `evidence_count` or `witness_count` field that can directly promote assurance.

Instead, assurance is a typed composition result:
`ASSURANCE = COMPOSE(EVIDENCE, CLAIM, CONTEXT, DEPENDENCY_CLOSURE, FAILURE_MODEL, EXTERNAL_ROOT)`

This is a much stronger boundary than “two verifiers agree.”

## Open boundary
Next attack:
`ASSURANCE COMPOSITION UNDER PARTITION + STALE WITNESSES + ROOT ROTATION + RECOVERY`.

Scenario:
- W1 is partitioned and stale;
- W2 is current but loses its root;
- W3 sees a replacement resource incarnation;
- a root rotation occurs;
- recovery starts;
- old evidence arrives late;
- a claim composer sees a majority of individually valid records.

Question:
Can the assurance bundle remain monotonic and safe when its supporting evidence arrives out of order across partitions and trust transitions, or must assurance itself become a versioned state machine with a protected linearization boundary?

No correctness guarantee is claimed.

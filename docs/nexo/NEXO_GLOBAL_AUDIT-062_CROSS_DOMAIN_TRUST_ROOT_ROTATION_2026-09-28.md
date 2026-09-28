# NEXO GLOBAL AUDIT-062 — CROSS-DOMAIN TRUST-ROOT ROTATION / FEDERATION LIFECYCLE
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Status: research/audit artifact only

## Objective
Attack federation lifecycle semantics after GLOBAL-AUDIT-061:
foreign trust-root rotation; bundle/key rollover; overlapping roots; stale foreign anchors; trust-domain split/merge; mapping-authority changes; revocation during transition; rollback across federation epochs; and common-mode federation metadata.

## External evidence studied

### SPIFFE Federation / Trust Domain and Bundle
SPIFFE Federation requires foreign trust-domain bundles to remain bound to the represented trust domain. Bundle contents are expected to change over time; new keys should be published before use and deprecated keys removed after active valid credentials no longer depend on them. Clients retain and refresh foreign bundles, with sequence/freshness semantics, and bundle contents from different trust domains must not be merged. Federation relationships are explicitly one-way and have a lifecycle of establishment, maintenance, and termination.
Sources:
- https://github.com/spiffe/spiffe/blob/main/standards/SPIFFE_Federation.md
- https://github.com/spiffe/spiffe/blob/main/standards/SPIFFE_Trust_Domain_and_Bundle.md

### TUF root rotation / rollback
TUF provides a concrete model where root metadata changes require a trusted continuity chain: a new root is authenticated using thresholds from both the currently trusted root and the new root; root versions must advance exactly one step during update; clients persist trusted root state; rollback and freeze attacks are explicitly handled. This is evidence that root rotation is not merely "new key exists" but a state-transition problem with continuity and anti-rollback semantics.
Source:
- https://github.com/theupdateframework/specification/blob/master/tuf-spec.md

### RFC 5280 trust-anchor semantics
X.509 path validation takes a trust anchor as an input and validates the target path relative to that anchor and the relevant time. Different paths may use different trust anchors. This reinforces that trust-anchor identity and temporal context are claim-relevant inputs rather than incidental metadata.
Source:
- https://www.rfc-editor.org/rfc/rfc5280

## Findings

### A — Root rotation is a semantic transition, not a key-set replacement
A foreign root/bundle moving from epoch E to E+1 cannot be treated as equivalent solely because the new bundle validates correctly. The transition requires an authenticated continuity relation or an explicitly authorized replacement relation.

FOUND: root rotation must carry predecessor/current identity, authority, effective interval/epoch, and provenance.
NOT PROVEN: a universal Nexo root-rotation algebra.

### B — Overlapping old/new roots are intentionally ambiguous without interval semantics
During rollover, both old and new keys may be valid simultaneously. "Accepted by either root" does not by itself establish whether a credential is:
- valid under both roots,
- valid only during a transition interval,
- historically valid but currently invalid,
- or evidence of continuity between roots.

A union of trust anchors can accidentally broaden authority if scope, issuer, audience, incarnation, and effective interval are not preserved.

DISTINCTION:
OVERLAPPING ROOTS != PROVEN ROOT CONTINUITY
DUAL VALIDATION != DUAL INDEPENDENT EVIDENCE
BUNDLE UNION != SEMANTICALLY SAFE AUTHORITY UNION

### C — Stale foreign trust anchors create a temporal closure dependency
A cached foreign bundle can remain cryptographically authentic while being semantically stale. Therefore current authorization depends on freshness relative to the relevant root epoch, revocation state, and transition contract.

SPIFFE explicitly expects bundle refresh and describes key addition/removal timing; this supports treating freshness as part of the federation state rather than optional transport metadata.

DISTINCTION:
AUTHENTIC OLD BUNDLE != CURRENT TRUST STATE
LAST RECEIVED != CURRENTLY AUTHORITATIVE
REFRESH SUCCESS != SEMANTIC COMPLETENESS

### D — Key rollover and root rollover are different boundaries
Rotating an issuer key inside one trust domain does not necessarily mean the trust domain/root identity changed. Conversely, changing the trust root can invalidate assumptions about prior issuer-key continuity.

Therefore the model must distinguish:
1. key lifecycle;
2. issuer lifecycle;
3. trust-root lifecycle;
4. trust-domain identity/lifecycle;
5. federation-relationship lifecycle.

DISTINCTION:
KEY ROTATION != ROOT ROTATION != DOMAIN ROTATION

### E — Trust-domain split cannot silently inherit all old mappings
If one trust domain splits into D1 and D2, historical mappings from D to an external domain do not automatically prove whether they apply to D1, D2, both, or neither.

Any inheritance needs an explicit authority statement defining scope, subject/incarnation continuity, effective interval, and mapping semantics.

Otherwise affected current claims remain UNKNOWN.

DISTINCTION:
DOMAIN SPLIT != AUTOMATIC AUTHORITY INHERITANCE

### F — Trust-domain merge cannot silently merge trust roots
If D1 and D2 merge, accepting both prior roots as one authority can create an unintended union of trust. The fact that both were previously trusted does not establish that every identity, scope, credential, or delegation from D1 is interchangeable with D2.

The resulting merged-domain semantics require an explicit mapping/authority contract.

DISTINCTION:
DOMAIN MERGE != ROOT UNION
ROOT UNION != IDENTITY EQUALITY
HISTORICAL TRUST != CURRENT UNIFIED AUTHORITY

### G — Mapping-authority changes are themselves evidence-bearing transitions
If the authority that defines A→B identity/scope mappings changes, old mappings cannot automatically remain current merely because they were correctly signed under the previous authority.

The mapping record must be bound to mapping-authority identity/incarnation, authority epoch, effective interval, and federation state.

DISTINCTION:
SIGNED MAPPING != CURRENT MAPPING
MAPPING AUTHORITY EPOCH != FOREIGN ROOT EPOCH

### H — Revocation during rollover requires transition-aware propagation
A credential or root may be revoked while old and new roots overlap. A receiving domain needs to determine whether revocation applies to:
- the old root;
- the new root;
- a particular issuer key;
- a subject/incarnation;
- a federation relationship;
- a specific mapping;
- or only future issuance.

Without explicit scope and effective-time semantics, revocation propagation cannot be safely generalized.

DISTINCTION:
REVOCATION DURING ROLLOVER != UNIVERSAL INVALIDATION

### I — Rollback across federation epochs can resurrect obsolete authority
Restoring an older bundle/mapping/trust snapshot can reintroduce keys or mappings that were valid before a later revocation or root transition.

Therefore rollback must be checked against current authority epoch, revocation history, transition sequence, and anti-rollback state.

TUF provides a concrete analogue: trusted root metadata cannot simply move backwards in version, and root transitions require an authenticated stepwise continuity chain.

DISTINCTION:
RESTORABLE SNAPSHOT != CURRENTLY ADMISSIBLE SNAPSHOT
ROLLBACK != ERASURE OF LATER EVENTS

### J — Federation metadata can become a common-mode trust root
If multiple validators rely on the same bundle endpoint, mapping registry, federation directory, cache distributor, or bridge, their apparently separate authorization decisions may share the same metadata dependency.

Therefore:
MULTIPLE CONSUMERS OF ONE FEDERATION METADATA ROOT != INDEPENDENT EVIDENCE

This extends the common-mode findings from GLOBAL-AUDIT-047/048/061.

### K — Trust-anchor replacement needs claim-relative historical/current semantics
A root that was valid for historical decisions may no longer be valid for current authorization. Historical acceptance should remain reconstructible as historical fact without allowing the old anchor to authorize new actions.

DISTINCTION:
HISTORICAL ROOT VALIDITY != CURRENT AUTHORITY
HISTORICAL DECISION IMMUTABILITY != CURRENT CLAIM IMMUTABILITY

### L — Federation termination and re-establishment are not automatically continuous
SPIFFE explicitly models termination by deleting the local foreign bundle and ceasing federation polling, followed by a fresh lifecycle if the relationship is re-established. Re-establishment therefore cannot be assumed to inherit all prior state without an explicit continuity contract.

DISTINCTION:
RELATIONSHIP RE-ESTABLISHMENT != AUTOMATIC CONTINUITY

## Attack matrix

| Attack | Required semantic boundary | Result |
|---|---|---|
| Old root + new root overlap | validity interval + authority semantics | UNKNOWN without explicit contract |
| New root appears without predecessor proof | continuity/replacement authority | UNKNOWN |
| Stale foreign bundle | freshness + epoch + revocation closure | UNKNOWN for affected current claims |
| Split domain | inheritance/mapping scope | UNKNOWN unless explicitly defined |
| Merge domains | root/identity/scope union semantics | UNKNOWN unless explicitly defined |
| Mapping authority rotates | mapping epoch/incarnation | UNKNOWN for stale mappings |
| Revocation during rollover | target/scope/interval/epoch propagation | UNKNOWN if unresolved |
| Federation snapshot rollback | anti-rollback + revocation history | MUST NOT silently restore current authority |
| Shared federation registry | common-mode dependency closure | independence remains UNKNOWN |
| Relationship terminated then re-established | continuity contract | historical and current states must remain distinct |

## Candidate claim-relative closure boundary
A cross-domain authorization claim C may only become deterministic if the evidence closure establishes, for the relevant claim:

SourceIdentity + SourceIncarnation
+ DestinationIdentity + DestinationIncarnation
+ FederationRelationship
+ TrustDomainIdentity
+ TrustRoot/Bundle Identity
+ Root/Key Epoch
+ Rotation/Replacement Continuity
+ Audience
+ MappingAuthority/Incarnation/Epoch
+ Capability/Resource Translation
+ Scope Semantics
+ Effective Interval
+ Revocation State and Propagation
+ Freshness/Anti-Rollback State
+ Provenance and Common-Mode Closure.

This is a candidate audit boundary only. It is NOT a frozen Nexo protocol and does NOT establish completeness/minimality.

## Key distinctions
ROOT ROTATION != KEY ROTATION
ROOT ROTATION != TRUST-DOMAIN ROTATION
OVERLAPPING ROOTS != PROVEN CONTINUITY
DUAL VALIDATION != INDEPENDENT EVIDENCE
AUTHENTIC OLD BUNDLE != CURRENT TRUST STATE
DOMAIN SPLIT != AUTOMATIC AUTHORITY INHERITANCE
DOMAIN MERGE != ROOT UNION
ROOT UNION != IDENTITY EQUALITY
SIGNED MAPPING != CURRENT MAPPING
MAPPING AUTHORITY EPOCH != FOREIGN ROOT EPOCH
REVOCATION DURING ROLLOVER != UNIVERSAL INVALIDATION
ROLLBACK != ERASURE OF LATER EVENTS
RESTORABLE SNAPSHOT != CURRENTLY ADMISSIBLE SNAPSHOT
SHARED FEDERATION METADATA != INDEPENDENT EVIDENCE
RELATIONSHIP RE-ESTABLISHMENT != AUTOMATIC CONTINUITY
HISTORICAL ROOT VALIDITY != CURRENT AUTHORITY
DETERMINISTIC ROTATION PROCEDURE != PROVEN SEMANTIC CORRECTNESS

## Result
FOUND:
- root rotation is a semantic state transition;
- overlapping roots require explicit interval/authority semantics;
- stale bundles are a temporal evidence dependency;
- key, issuer, root, domain, and federation lifecycles are distinct;
- domain split/merge requires explicit inheritance/union semantics;
- mapping-authority changes can invalidate current translation assumptions;
- revocation during rollover requires transition-aware propagation;
- rollback can resurrect obsolete authority unless anti-rollback semantics bind the state;
- shared federation metadata creates common-mode dependencies;
- termination/re-establishment does not prove continuity.

NOT CLOSED:
FutureObs_PAA; P_AA quotient congruence; complete cross-domain rotation/federation algebra; R1-R5 completeness/minimality; dependency/TCB/evidence reducer completeness; independence/quorum completeness; retention/reconstruction soundness.

NOT PERFORMED:
implementation; formal verification; runtime/fault injection; V21; semantic freeze.

## Global epistemic state — preserve exactly
P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

AB55/AB56 carryover unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission — GLOBAL-AUDIT-063
Attack federation transition composition:
- simultaneous root + mapping-authority rotation;
- overlapping federation epochs;
- partial rollout across validators;
- divergent cached bundle versions;
- split-brain federation metadata;
- concurrent revocation and re-keying;
- recovery after partial trust-domain migration;
- composition of multiple federation bridges;
- evidence independence when federation layers share roots;
- whether transition certificates compose without manufacturing current authority.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.

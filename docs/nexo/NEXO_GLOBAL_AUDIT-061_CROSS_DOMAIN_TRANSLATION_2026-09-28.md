# NEXO GLOBAL AUDIT-061 — CROSS-DOMAIN DELEGATION / AUTHORITY TRANSLATION
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Status: research/audit artifact only

## Objective
Attack namespace/subject translation, capability/resource semantic translation, audience binding, foreign trust roots, incompatible scope languages, translated revocation, bridge/gateway common-mode dependencies, stale translation caches, and rollback/restoration across domains.

## External evidence
SPIFFE Federation explicitly treats trust domains as separate administrative/security namespaces and defines federation through exchange of trust bundles so one domain can authenticate credentials from another. This demonstrates that cross-domain identity requires an explicit trust relationship; namespace equality is not presumed. citeturn0search4turn0search7

UCAN delegation requires explicit issuer/audience alignment and describes the delegation chain as proof of authority; it also notes that a structurally and cryptographically valid chain can still be semantically invalid. citeturn0search0turn0search1

OAuth security guidance provides another concrete example: audience restriction binds an access token to an intended resource server, and the resource server is expected to reject a token whose intended audience does not match. citeturn0search8

## Findings

### A — namespace translation
Domain A's subject identifier does not automatically equal Domain B's subject identifier. Translation requires an authoritative mapping with provenance, validity interval and trust basis.

### B — capability/resource translation
A capability in domain A may have no exact semantic equivalent in domain B. String/path similarity is insufficient. Translation must establish operation, resource, constraints and authority semantics.

### C — audience binding
A credential intended for A is not automatically valid for B. Audience is claim-relevant evidence. A bridge may translate audience only under an explicit trust contract.

### D — foreign trust roots
Federation imports trust in a foreign issuer/root. That root becomes a dependency of every translated authorization claim. It must enter the evidence dependency graph.

### E — incompatible scope languages
Scope syntax can look equivalent while meaning different things. Wildcards, hierarchy, resource identifiers and conditions require a translation contract. If semantic correspondence cannot be established, affected authorization remains UNKNOWN.

### F — translated revocation
Revocation in A does not automatically exist in B. B needs an authenticated, current translation of target identity/incarnation, scope, authority, effective interval and revocation semantics.

### G — bridge/gateway common-mode
If all cross-domain decisions pass through one gateway or mapping registry, apparently independent authorizations may share the same failure mode. The bridge is a potential common-mode dependency, not independent evidence.

### H — stale translation cache
A cached identity/scope/revocation translation may remain cryptographically authentic while being semantically stale. Cache freshness/epoch/revocation state therefore enters authorization closure.

### I — rollback/restoration
Rolling a bridge or mapping database back to an earlier snapshot can resurrect obsolete mappings or pre-revocation authority. Restoration must be provenance- and revocation-aware.

### J — cross-domain subject reincarnation
A mapping valid for subject/incarnation i1 must not silently attach to i2 merely because the visible identifier is reused.

### K — trust-domain changes
If a domain changes its root, bundle, issuer, or authority epoch, old translations cannot automatically be treated as current. Historical validity and current admissibility remain distinct.

### L — translation completeness
A deterministic cross-domain authorization projection requires:
SourceIdentity/Incarnation
+ DestinationIdentity/Incarnation
+ MappingAuthority
+ Audience
+ Resource/CapabilityTranslation
+ ScopeTranslation
+ ForeignTrustRoot
+ AuthorityEpochs
+ EffectiveIntervals
+ RevocationTranslation
+ CacheFreshness
+ Provenance/CommonModeClosure.
Unresolved claim-relevant translation => UNKNOWN.

## Key distinctions
NAMESPACE EQUALITY != IDENTITY EQUALITY
IDENTITY MAPPING != IDENTITY PROOF
CAPABILITY STRING EQUALITY != SEMANTIC EQUALITY
AUDIENCE TRANSLATION != AUTOMATIC TRUST
FEDERATION != SHARED AUTHORITY
FOREIGN TRUST ROOT != INDEPENDENT EVIDENCE
SIGNED TRANSLATION != CURRENT TRANSLATION
CACHE AUTHENTICITY != CACHE FRESHNESS
REVOCATION IN A != REVOCATION IN B
ROLLBACK != ERASE OF LATER EVENTS
BRIDGE AVAILABILITY != BRIDGE CORRECTNESS
DETERMINISTIC TRANSLATION != PROVEN SEMANTIC EQUIVALENCE

## Result
FOUND:
- cross-domain identity requires explicit mapping/trust semantics;
- capability/resource translation is semantic, not syntactic;
- audience binding is claim-relevant;
- foreign trust roots enter dependency closure;
- incompatible scope languages can force UNKNOWN;
- revocation must be translated rather than assumed;
- bridges and registries can become common-mode roots;
- stale caches and rollback can resurrect obsolete authority.

NOT CLOSED:
FutureObs_PAA; P_AA quotient congruence; complete cross-domain translation algebra; R1-R5 completeness/minimality; dependency/TCB/evidence reducer completeness; independence/quorum completeness; retention/reconstruction soundness.

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

## Next exact mission — GLOBAL-AUDIT-062
Attack cross-domain trust-root rotation and federation lifecycle:
- foreign root rotation;
- bundle/key rollover;
- overlapping roots;
- stale foreign trust anchors;
- trust-domain split/merge;
- mapping authority changes;
- revocation during federation transition;
- rollback across federation epochs;
- common-mode federation metadata.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.

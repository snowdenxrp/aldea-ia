# NEXO AB48 — PAA SIX-CONTRACT RELATIONAL SCHEMA & COLLISION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC/TLAPS run, or proof claim.

## 1. Goal
Make the AB46 six-contract interface explicit and attack whether a genuine collision can survive all six relations.

## 2. Canonical action-contract shape
For protocol p and action a:
`A_p(a) = <Pre_p(a), Post_p(a), Frame_p(a), Invalidation_p(a), HistorySupport_p(a), AdmissionLink_p(a)>`.

These are semantic relations/obligations, not six mandatory runtime variables.

## 3. Relational schemas
### Pre
`Pre_p(H,a)` contains the claim-relevant conditions required before action a: current authorization context, complete binding prerequisites, protocol prerequisites, boundary permission, and required predecessor/order facts.

### Post
`Post_p(H,a,H')` states the claim-relevant facts established by a: actual admission linkage, used authorization/bridge/recheck context, protocol-specific semantic guarantee, and immutable historical linkage.

### Frame
`Frame_p(H,H')` states which claim-relevant facts remain unchanged and explicitly excludes silent changes to authority, binding, protocol validity, invalidation relations, or future continuation rights.

### Invalidation
`Inv_p(H,H')` is relational: it identifies which existing authorization/bridge/admission obligations become invalid, and why. A boolean `invalidated=true` is insufficient.

### HistorySupport
`HS_p(H,a)` is the minimum claim-relative support needed to reconstruct the admission semantics and prove/assess P_AA. It may be represented by order, invalidation, linkage, and auxiliary history rather than a dedicated state variable.

### AdmissionLink
`Link_p(H,a)` identifies the actual authority/bridge/recheck context used by the admission. Existence of an unrelated valid witness never satisfies linkage.

## 4. Collision criterion
For fixed claim, boundary, threat model and environment contract, define:
`C6_p(H,a) = <Pre,Post,Frame,Inv,HS,Link>`.

A genuine six-contract collision requires:
`C6_p(H1,a)=C6_p(H2,a)`
while
`FutureObs_PAA(H1) != FutureObs_PAA(H2)`
with both histories otherwise admissible.

If every such collision is excluded by the contract itself, the six-contract interface is extensionally sufficient for the bounded model.

## 5. Attack family
### Atomic
Potential separators: hidden linearization point, prohibited interleaving, later invalidation ordering. These are already forced into HS/Inv if the schema is relational and claim-relative.

### Lease
Potential separators: expiry, renewal, replay/consumption, policy/delegation/incarnation invalidation, bridge linkage. These must be represented by Link + Inv + HS or protocol-specific bridge semantics.

### Recheck
Potential separators: exact fact set, check/admission order, mutation between check and admission, stale result reuse. These must be represented by Post/Link/HS or produce UNKNOWN.

### Joint protocols
Protocol collisions remain possible only if the six relations intentionally abstract away a future semantic distinction that changes P_AA. Current TRUE_JUSTIFIED equality is not enough.

## 6. Key result
Under a sufficiently rich relational interpretation, the previously found attacks do not produce a genuine collision; they instead expose under-specified versions of the six relations.

This is a methodological result, not a minimality proof. There is a danger of circularity: if HS is defined as “whatever is needed to preserve all future P_AA observations,” then the six-contract interface becomes tautologically sufficient. Therefore HS must be constrained by an independently specified representation language.

## 7. Anti-circularity requirement
A valid minimality argument must specify an admissible support language L_HS before testing collisions. HS cannot contain an oracle equivalent to `FutureObs_PAA` or the quotient itself.

Candidate admissible support primitives:
- event identity/type;
- claim-relevant precedence/order;
- actual authority/bridge/recheck linkage;
- invalidation edges;
- protocol-specific linearization/interval/recheck facts;
- replay/consumption facts;
- bounded auxiliary history references.

Forbidden oracle-like primitive:
`HS = FutureObs_PAA(history)`.

## 8. Reduction test
HistorySupport is eliminable as a named component if there is a total reconstruction from the admissible primitives that is:
1. deterministic modulo P_AA equivalence;
2. linkage-preserving;
3. transition-preserving;
4. future-observation-preserving;
5. non-amplifying;
6. boundary-preserving;
7. UNKNOWN-safe when required support is absent.

## 9. Current assessment
No genuine collision has been established against the fully relational six-contract schema. However, no proof of sufficiency exists because the support language and transition semantics are not yet formalized enough to rule out all collisions.

Therefore:
- six-contract interface: viable candidate;
- six-contract sufficiency: OPEN;
- HistorySupport as permanent variable: NOT REQUIRED YET;
- HistorySupport as semantic obligation: REQUIRED;
- minimality: OPEN;
- formal verification: NOT STARTED/NOT VERIFIED.

## 10. AB49 frontier
1. Freeze an explicit non-oracular support language for HS.
2. Enumerate minimal protocol separators inside that language.
3. Attack joint transition closure, not just current observations.
4. Test whether `Order + Invalidation + Linkage + protocol primitives` reconstruct HS.
5. Only after that decide whether the semantic kernel can be frozen and encoded in a next TLA+ model.

# NEXO GLOBAL AUDIT-052 — REVOCATION / TEMPORAL VALIDITY / CERTIFICATE LIFETIME
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: research/audit artifact only

## Boundary

Attack certificate revocation and temporal validity:
- retroactive versus prospective revocation;
- revocation-reason scope;
- historical closure versus current projection;
- chained revocation propagation;
- conflicting revocation authorities;
- expiry versus semantic invalidation;
- stale but cryptographically valid certificates;
- authority epochs and source incarnation.

No implementation, V21, semantic freeze, or formal verification is performed.

## External evidence

W3C PROV explicitly models entity invalidation as a semantic event and gives ordering constraints around generation, usage and invalidation. It also distinguishes identified events from physical-clock timestamps and treats temporal consistency as an event-ordering problem. This supports treating revocation/invalidation as part of claim semantics rather than as a mere field update. citeturn0search0

## Attack A — prospective revocation

Certificate K is valid for interval [t1,t2]. A revocation R occurs at t3 > t2.

If R only applies prospectively, historical decisions whose semantic scope ended before t3 may remain historically valid, while current projections after t3 may reject K.

Therefore:
REVOCATION EVENT != AUTOMATIC ERASURE OF HISTORICAL FACT.

The system must distinguish historical validity at decision time from current admissibility.

## Attack B — retroactive revocation

Now suppose R at t3 states that K's premises were invalid during [t1,t2].

Then a prior closure based on K may become semantically inadmissible even though the historical record "closure was issued at t2" remains immutable.

This creates two layers:
- historical decision record;
- current claim validity under the latest authoritative knowledge.

Candidate transition:
HISTORICAL_DECISION(t2,K)=RECORDED
does not imply
CURRENT_CLAIM(K)=SUPPORTED.

## Attack C — revocation reason scope

A certificate can be revoked for different reasons:
- key compromise;
- authority loss;
- source corruption;
- scope error;
- incomplete observation domain;
- semantic defect discovered after issuance.

These reasons have different propagation scopes.

A key compromise may affect every certificate signed by that key.
A scope error may affect only claims relying on a particular domain.
A source-incarnation defect may affect only one epoch/incarnation.

Therefore a universal "revoked = everything invalid" rule is not justified.

Candidate requirement:
Revocation must carry reason, affected scope, effective interval, authority, and dependency relation.

## Attack D — chained revocation

K1 supports K2; K2 supports K3; K3 supports claim C.

If K1 is revoked, the effect must propagate through the dependency graph to K3/C unless an independent valid replacement closes the same dependency.

But propagation cannot be done by simply walking certificate references if scope or temporal applicability differs.

This carries forward GLOBAL-AUDIT-048:
dependency closure requires semantic identity, epoch/incarnation and cycle handling.

## Attack E — revocation cycles

Suppose K1's validity depends on K2, while K2's revocation status is justified by K1.

A naive reducer could reach a circular fixed point and incorrectly treat the cycle as settled.

Candidate conservative rule:
Self-supporting or mutually supporting revocation chains do not establish admissibility without an external/declared trust boundary.

## Attack F — conflicting revocation authorities

Authority A says K remains valid.
Authority B says K is revoked.

No generic "latest timestamp wins" rule is safe unless authority precedence, scope and epoch are defined.

The conflict may represent:
- different jurisdictions/domains;
- different source incarnations;
- one authority superseding another;
- stale information;
- genuine unresolved disagreement.

If the conflict affects the claim and no admissible precedence rule resolves it, current claim state remains UNKNOWN.

## Attack G — expiry versus semantic invalidation

Expiry means a certificate is no longer acceptable after its declared validity interval.

Semantic invalidation means evidence shows that a premise was wrong or inadmissible, potentially affecting the interval during which the certificate appeared valid.

Therefore:
EXPIRY != RETROACTIVE INVALIDATION.

A certificate can be expired yet historically valid.
A certificate can be unexpired yet semantically invalid.

## Attack H — stale but cryptographically valid

A signature may verify forever, while the certificate's authority, source state, key status, scope, or incarnation has changed.

Thus:
SIGNATURE VALID != CURRENTLY ADMISSIBLE.

Current admissibility must evaluate temporal validity, authority state, revocation, scope, source incarnation and dependency closure.

## Attack I — authority epoch

If authority state changes from epoch e1 to e2, a certificate issued under e1 must not silently authorize operations or claims scoped to e2.

A late revocation may be valid for e1 but irrelevant to e2, or vice versa.

Therefore certificate validity must bind to:
AuthorityID + AuthorityEpoch + Scope + EffectiveInterval.

## Attack J — source incarnation

A resource/source can be recreated with the same external identifier.

Certificate K about incarnation i1 must not automatically validate incarnation i2.

A revocation for i1 likewise must not silently poison i2 unless the authority contract explicitly relates them.

Candidate identity:
(SourceID, IncarnationID, Epoch).

## Attack K — retroactive revocation versus historical reconstruction

If K is retroactively invalidated after supporting evidence has been compacted or expired, current recomputation may be unable to reconstruct the exact dependency set.

Then the system knows a revocation occurred but cannot establish its complete claim impact.

Therefore:
REVOCATION OBSERVED != REVOCATION IMPACT FULLY RECONSTRUCTABLE.

This carries forward GLOBAL-AUDIT-045 and -050.

## Attack L — candidate validity state decomposition

A single boolean valid/invalid is insufficient for the research boundary.

Candidate dimensions:
- cryptographic authenticity;
- temporal validity;
- authority validity;
- scope validity;
- source incarnation validity;
- revocation status;
- dependency completeness;
- reconstruction availability.

A certificate can be cryptographically valid while UNKNOWN on one or more semantic dimensions.

This is a research decomposition, not an implementation schema.

## Attack M — candidate revocation propagation rule

For claim C supported through dependency graph G:

A revocation R can change current support only when:
1. R has valid provenance/authenticity;
2. R is issued by an authority admissible for the affected scope;
3. its effective interval overlaps the relevant certificate/claim semantics;
4. its reason applies to the affected dependency;
5. source incarnation/authority epoch bindings match;
6. propagation path to C is established;
7. no unresolved conflict blocks the result.

If any claim-relevant condition is UNKNOWN, the conservative current state is UNKNOWN rather than silently retaining prior support.

## Key distinctions

EXPIRY != RETROACTIVE INVALIDATION
SIGNATURE VALID != CURRENTLY ADMISSIBLE
HISTORICAL DECISION != CURRENT CLAIM
REVOCATION EVENT != ERASURE OF HISTORY
CERTIFICATE REVOCATION != UNIVERSAL INVALIDATION
AUTHORITY EPOCH != SOURCE INCARNATION
REVOCATION OBSERVED != REVOCATION IMPACT RECONSTRUCTABLE

## Epistemic status

FOUND:
- revocation must be temporally and scope bound;
- historical decisions and current claim projections must remain distinct;
- expiry and semantic invalidation are different mechanisms;
- cryptographic validity does not imply current semantic admissibility;
- authority epoch and source incarnation must participate in validity;
- revocation propagation is dependency-graph dependent;
- conflicting revocation authorities require explicit precedence or UNKNOWN;
- retention can prevent complete reconstruction of revocation impact.

NOT PROVEN:
- complete revocation algebra;
- universal retroactive/prospective semantics;
- complete authority precedence rules;
- FutureObs_PAA;
- P_AA quotient congruence;
- R1-R5 completeness/minimality;
- dependency/TCB/evidence-reducer completeness;
- independence/quorum soundness;
- retention/reconstruction soundness;
- formal verification.

NOT PERFORMED:
- implementation;
- runtime/fault injection;
- formal proof;
- V21;
- semantic freeze.

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

AB55/AB56 carryover remains unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission — GLOBAL-AUDIT-053

Attack revocation provenance and conflict resolution:
- who is authorized to revoke whom;
- revocation-of-revocation;
- emergency authority versus ordinary authority;
- evidence required to establish revocation scope;
- conflicting revocation histories;
- delayed/out-of-order revocation events;
- whether revocation evidence itself can be revoked;
- common-mode failure in revocation infrastructure.

No implementation. No V21. Preserve UNKNOWN unless closed by evidence.

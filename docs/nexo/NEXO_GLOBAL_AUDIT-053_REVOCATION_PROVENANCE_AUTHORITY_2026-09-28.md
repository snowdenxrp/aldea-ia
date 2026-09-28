# NEXO GLOBAL AUDIT-053 — REVOCATION PROVENANCE / AUTHORITY CONFLICT / OUT-OF-ORDER EVENTS
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: research/audit artifact only

## Boundary

Attack the authority and provenance of revocation itself:
- who is authorized to revoke whom;
- revocation-of-revocation;
- emergency versus ordinary authority;
- evidence required for revocation scope;
- conflicting revocation histories;
- delayed/out-of-order revocation;
- revocation evidence being revoked;
- common-mode failure in revocation infrastructure.

No implementation, V21, semantic freeze, or formal verification is performed.

## External evidence

W3C PROV models agents, attribution, delegation, generation, usage and invalidation as provenance relationships and treats invalidation as a semantic event with ordering constraints. It also emphasizes that different systems may use different clocks, so combining provenance requires reasoning over identified events and their ordering rather than assuming a single synchronized timeline. citeturn0search0turn0search1

## Attack A — authority to revoke

A revocation R is not admissible merely because it is syntactically well formed or cryptographically authentic.

The system must establish that issuer A has authority over target K for the relevant:
- scope;
- authority epoch;
- source/resource incarnation;
- effective interval.

Therefore:
AUTHENTIC REVOCATION != AUTHORIZED REVOCATION.

A signed statement from an unauthorized issuer cannot close the semantic boundary.

## Attack B — delegation chain

Suppose A delegates revocation authority to B, and B revokes K.

Admissibility now depends on the delegation chain:
A -> B -> R(K).

If delegation D is expired, revoked, scope-limited, or itself UNKNOWN, B's revocation cannot automatically be treated as authoritative.

Delegation provenance becomes part of the revocation dependency graph.

## Attack C — revocation of a revocation

Let R1 revoke K.
Later R2 says R1 itself is invalid/revoked.

This creates at least three separate claims:
1. R1 was issued;
2. R1 was authoritative under its rules;
3. R1's effect on K is currently admissible.

R2 does not erase the historical fact that R1 was issued. It may, however, change the current admissibility of R1 and therefore K.

Candidate distinction:
REVOCATION EVENT HISTORY != CURRENT REVOCATION AUTHORITY.

## Attack D — emergency authority

An emergency authority may have powers broader or different from ordinary authority.

A generic "latest revocation wins" rule is unsafe because:
- emergency scope may be narrow;
- emergency authority may expire;
- emergency action may require later ratification;
- emergency authority may not cover historical intervals;
- emergency authority may be limited to specific resource classes.

Therefore emergency revocation requires an explicit authority contract, not an implicit priority boost.

## Attack E — evidence required for scope

A revocation can be authentic and authorized yet still fail to establish that it applies to the target claim.

Example:
R revokes source S for incarnation i1, while C depends on i2.

Or R revokes one claim scope while C is outside that scope.

Therefore revocation must bind:
TargetIdentity + Scope + Epoch/Incarnation + EffectiveInterval + Reason.

Without this binding, the revocation's impact remains UNKNOWN.

## Attack F — conflicting revocation histories

History H1:
A issues R1: K revoked.

History H2:
B issues R2: K remains valid.

Both may be authentic.

No universal ordering follows from signatures alone.

Possible resolution depends on:
- authority precedence;
- scope;
- delegation;
- epoch;
- effective interval;
- source incarnation;
- emergency status;
- revocation dependencies.

If no admissible precedence rule resolves the conflict, current support remains UNKNOWN.

## Attack G — delayed/out-of-order revocation

Event R has semantic event-time t1 but arrives at t3 after another decision at t2.

Arrival order cannot redefine semantic order.

A reducer must preserve:
EventID + event-time/order relation + observation time + authority context.

Otherwise a delayed revocation can be incorrectly treated as a post-decision fact when it actually invalidates the earlier claim's dependency.

## Attack H — revocation evidence itself becomes invalid

Suppose R is supported by evidence E.
Later E is shown corrupted, unauthorized, duplicated, or semantically invalid.

Then R's provenance closure changes.

Therefore:
REVOCATION VALIDITY DEPENDS ON REVOCATION EVIDENCE.

A revocation cannot be treated as an unconditionally final primitive merely because it is itself a revocation event.

## Attack I — common-mode revocation infrastructure

Suppose multiple revocation authorities depend on the same:
- key-management root;
- time service;
- log;
- attestation system;
- identity provider;
- source registry.

Their revocations may appear independent while sharing a common failure mode.

This carries forward GLOBAL-AUDIT-047:
different records/authorities do not imply independent evidence.

Candidate rule:
Common-mode overlap unresolved => independence UNKNOWN.

## Attack J — revocation chain cycles

R1 depends on authority state established by R2.
R2 depends on R1.

A naive resolver may converge to an apparently stable state without an external trust boundary.

Candidate:
No mutually supporting revocation cycle may bootstrap its own authority.

## Attack K — temporal scope of authority

Authority A may be valid only during epoch e1.
A revocation issued under e1 may affect evidence in e1, but not necessarily later epoch e2.

Conversely, a revocation discovered in e2 may establish that a premise used in e1 was defective, depending on the authority contract.

Thus authority validity and semantic effect interval are separate dimensions.

## Attack L — candidate revocation certificate contract

A research-level admissible revocation R would require:
1. authenticated issuer identity;
2. demonstrated authority/delegation for target scope;
3. authority epoch binding;
4. target source/resource incarnation binding;
5. explicit effective interval/event ordering;
6. reason and affected scope;
7. complete provenance for the revocation evidence;
8. no unresolved conflicting authority affecting the same claim;
9. no unresolved common-mode dependency where independence is required;
10. valid retention/reconstruction of the evidence needed to establish these conditions.

This is a candidate contract, not a proven Nexo algebra.

## Key distinctions

AUTHENTIC REVOCATION != AUTHORIZED REVOCATION
REVOCATION ISSUED != REVOCATION CURRENTLY EFFECTIVE
REVOCATION HISTORY != CURRENT REVOCATION AUTHORITY
LATEST ARRIVAL != LATEST SEMANTIC EVENT
SIGNED != INDEPENDENT
REVOCATION EVIDENCE != IMMUTABLE TRUTH
AUTHORITY EPOCH != EFFECTIVE CLAIM INTERVAL
MULTIPLE AUTHORITIES != MULTIPLE INDEPENDENT ROOTS

## Epistemic status

FOUND:
- revocation authority must be established separately from cryptographic authenticity;
- delegation becomes part of the revocation dependency graph;
- revocation-of-revocation changes current admissibility without erasing history;
- emergency authority requires explicit scope and lifetime;
- revocation scope must bind target, epoch/incarnation and interval;
- conflicting authentic revocations can remain UNKNOWN without precedence rules;
- delayed revocation requires event-time/order separate from arrival-time;
- revocation evidence can itself lose admissibility;
- common-mode infrastructure prevents naive independence assumptions;
- cyclic revocation authority cannot self-bootstrap.

NOT PROVEN:
- complete revocation-authority algebra;
- complete emergency-authority semantics;
- universal conflict-resolution rule;
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

## Next exact mission — GLOBAL-AUDIT-054

Attack revocation conflict resolution as a formal semantic problem:
- precedence lattices versus partial orders;
- incomparable authorities;
- emergency/ordinary authority intersections;
- multiple valid revocations with different scopes;
- revocation cancellation versus supersession;
- conflict persistence across epochs/incarnations;
- conservative UNKNOWN behavior under unresolved conflict;
- whether conflict resolution itself can introduce common-mode trust assumptions.

No implementation. No V21. Preserve UNKNOWN unless closed by evidence.

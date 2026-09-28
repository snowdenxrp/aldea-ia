# NEXO GLOBAL AUDIT-051 — CLOSURE CERTIFICATE COMPOSITION / FINALITY CONFLICTS
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: research/audit artifact only

## Boundary

Attack the closure certificate introduced as a candidate in GLOBAL-AUDIT-050:
- composition of multiple source finality/completeness certificates;
- conflicting horizons from different authorities;
- partial-domain closure and hidden dependencies;
- revocation of a previously issued finality certificate;
- whether certificate composition can safely produce CLOSED(C,H);
- common-mode failure between a source finality claim and the evidence used to establish that claim.

No implementation, V21, semantic freeze, or formal verification is performed.

## External evidence

W3C PROV defines validity as consistency of provenance histories and supports independent provenance bundles, but provenance-bundle validity being independently established does not make the bundles semantically independent for an application claim. PROV also uses event ordering rather than requiring synchronized physical clocks. citeturn0search0turn0search4

in-toto provides a concrete supply-chain pattern in which a signed layout specifies authorized steps and an expiration date, while signed link metadata supplies evidence for those steps. This demonstrates that a signed/expiring certificate can bind scope, authority and evidence, but it does not establish that independently issued certificates are safely composable for arbitrary semantic claims. citeturn0search1

TUF similarly separates timestamp, snapshot and target metadata; snapshot metadata binds a consistent view by listing hashes/versions of target metadata, while timestamp metadata is frequently re-signed and short-lived. This supports treating certificate composition as a dependency graph with explicit consistency links rather than simply unioning independently signed records. citeturn0search5

Iceberg provides a concrete retention boundary: expired snapshots are removed from metadata and become unavailable for time-travel queries. Therefore a finality/closure certificate whose justification depends on reconstructing expired source state cannot be treated as permanently auditable merely because the certificate bytes remain. citeturn0search2turn0search3

## Attack A — independent certificates are not automatically composable

Suppose C1 certifies source S1 complete through H1 and C2 certifies S2 complete through H2.

A claim C depends on both S1 and S2.

Naively:
CLOSED(C, min(H1,H2))

is not sufficient.

Required questions include:
- Are S1 and S2 domains jointly exhaustive for all claim-relevant events?
- Are there hidden shared dependencies?
- Are the certificates based on the same upstream source or common-mode observation system?
- Do their authority scopes overlap or conflict?
- Are their temporal semantics comparable?
- Are their retention/reconstruction guarantees compatible?
- Does either certificate depend on the other?

Finding:
CERTIFICATE VALIDITY != CERTIFICATE COMPOSABILITY.

## Attack B — conflicting horizons

Suppose authority A certifies S through H=100 and authority B certifies the same S through H=80.

The conflict cannot be resolved by selecting the larger or smaller horizon without a precedence rule.

Possible meanings include:
- B has narrower authority and A is valid for the broader domain;
- A is stale and B supersedes it;
- the authorities cover different source incarnations;
- one certificate has been revoked;
- the certificates are incomparable.

Conservative candidate:
If authority precedence, scope, incarnation and revocation state do not establish a unique admissible horizon, the affected closure remains UNKNOWN.

No "max horizon" or "min horizon" rule is proven.

## Attack C — partial-domain closure

S1 may be complete for events of class E1 while S2 covers E2.

A claim reducer that treats {C1,C2} as covering the whole domain can miss E3, a relevant event class absent from both certificates.

Therefore domain closure needs an explicit coverage relation:
ClaimScope(C) -> RelevantEventClasses -> SourceCertificates.

Absence of a listed class cannot be interpreted as proof that the class is irrelevant.

Finding:
PARTIAL CERTIFICATE COVERAGE != DOMAIN COMPLETENESS.

## Attack D — hidden dependency

Certificate C1 may assert that S1 is complete, but the evidence supporting C1 may depend on:
- S2;
- a coordinator;
- an upstream timestamp service;
- a shared log;
- a prior certificate;
- a reconstructed/compacted history.

If C2 also depends on that same component, C1+C2 do not provide independent closure evidence.

This carries forward GLOBAL-AUDIT-047:
different certificates/records do not imply independent evidence.

Candidate dependency identity must include the certificate itself and its supporting provenance graph.

## Attack E — certificate of certificate

If C1 is used as evidence for C2, then C2's dependency closure includes C1 and C1's dependencies.

If C1 itself relies on C2, a cycle can appear.

A certificate must not bootstrap its own admissibility through a circular chain.

This carries forward GLOBAL-AUDIT-048:
ACYCLIC TRAVERSAL != SEMANTIC COMPLETENESS, and self-reference cannot bootstrap admissibility.

## Attack F — revocation after composition

History:
1. C1 and C2 are individually valid.
2. Their composition is accepted and CLOSED(C,H) is recorded.
3. Later, authority revokes C1 for a reason affecting its validity interval.
4. C1's revocation changes the dependency closure of C.

The historical closure decision must remain an immutable historical fact, but the current claim projection cannot remain CLOSED merely because the old composition was once valid.

Candidate:
COMPOSED-CLOSURE validity is contingent on the validity of every certificate dependency.

Therefore revocation propagates through the evidence dependency graph unless an authoritative temporal rule proves the revocation is outside the claim's relevant interval/scope.

## Attack G — revocation versus historical validity

A certificate may have been valid for interval [t1,t2] and later be revoked at t3 because of a discovery about its premises.

This creates two distinct questions:
- Was the certificate valid under its rules at decision time?
- Is its asserted semantic conclusion still admissible after the revocation?

These cannot be collapsed.

Historical decision immutability does not imply current claim immutability.

## Attack H — common-mode finality failure

Suppose S1 and the authority issuing its finality certificate both depend on the same clock/log/attestation root R.

Two certificates from apparently different authorities may therefore share R.

If R is wrong, compromised, incomplete, or semantically misinterpreted, both certificates can fail together.

Thus:
TWO CERTIFICATES != TWO INDEPENDENT FINALITY ROOTS.

This directly carries forward the anti-double-counting/common-mode rule from GLOBAL-AUDIT-047.

## Attack I — source finality and evidence of finality can share the same failure

A certificate might say "S is complete through H" while the evidence used to establish completeness is itself drawn from S.

That creates a self-referential completeness argument:
S proves its own completeness.

Without an independent or explicitly trusted finality root, this cannot close the observation boundary.

Candidate rule:
A finality certificate may be self-authenticating as a signed statement, but semantic completeness still depends on the authority/contract that gives that statement finality meaning.

Cryptographic authenticity != semantic completeness.

## Attack J — inconsistent temporal semantics

C1 may use event-time, C2 may use ingestion-time, and C3 may use source-sequence position.

Their horizons cannot be composed until a relation between these temporal domains is established.

A smaller numeric timestamp is not necessarily an earlier semantic event across heterogeneous clocks.

W3C PROV's reliance on identified event ordering rather than a single synchronized physical clock reinforces this boundary. citeturn0search0

## Attack K — retention incompatibility

C1 may be auditable for 30 days while C2 depends on source history retained for 7 days.

A composed closure intended to remain reconstructible for 30 days cannot inherit the weaker retention without losing part of its proof basis.

Therefore composition requires:
Retention(C) >= retention required by every proof dependency,
or an equivalent authoritative preserved summary whose semantic preservation is itself established.

Iceberg's snapshot expiration is a concrete example of how historical reconstruction can become unavailable after retention. citeturn0search2

## Attack L — candidate composition contract

A candidate composition rule for CLOSED(C,H) requires:
1. every claim-relevant observation domain is explicitly mapped to one or more certificates;
2. certificate scopes cover all relevant event classes;
3. certificate temporal semantics are mutually related;
4. authority precedence/conflict rules are resolved;
5. source incarnation/epoch bindings are compatible;
6. certificate dependency graphs are closed without cycles/self-bootstrap;
7. common-mode overlap is known or conservatively unresolved;
8. revocation status is admissible for the relevant interval;
9. retention/reconstruction obligations are satisfied;
10. no hidden dependency affecting C remains UNKNOWN;
11. the composition itself has provenance identifying all certificate inputs and its exact claim scope.

This is a research candidate, not a proven algebra.

## Key distinctions

CERTIFICATE VALIDITY != CERTIFICATE COMPOSABILITY

SIGNED != SEMANTICALLY FINAL

PARTIAL COVERAGE != DOMAIN COMPLETENESS

TWO CERTIFICATES != TWO INDEPENDENT FINALITY ROOTS

HISTORICAL CERTIFICATE VALIDITY != CURRENT CLAIM ADMISSIBILITY

CRYPTOGRAPHIC AUTHENTICITY != SEMANTIC COMPLETENESS

COMPOSED CLOSURE != CLOSURE OF EACH DEPENDENCY'S MEANING

## Epistemic status

FOUND:
- individually valid certificates do not automatically compose into a closed claim;
- conflicting horizons require explicit authority/scope/incarnation semantics;
- partial-domain certificates cannot establish whole-domain completeness without coverage proof;
- certificate dependencies must enter the evidence dependency graph;
- self-referential/cyclic certificate chains cannot bootstrap admissibility;
- revocation can propagate through composed closure;
- common-mode dependencies defeat naive independence counting;
- cryptographic authenticity alone does not prove semantic completeness;
- retention requirements compose across the proof dependency graph.

NOT PROVEN:
- complete certificate-composition algebra;
- a safe universal horizon-combination operator;
- complete authority-precedence rules;
- FutureObs_PAA;
- P_AA quotient congruence;
- R1-R5 completeness/minimality;
- dependency/TCB/evidence-reducer completeness;
- independence/quorum soundness;
- retention/reconstruction soundness;
- formal verification.

NOT PERFORMED:
- Nexo implementation;
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

## Next exact mission — GLOBAL-AUDIT-052

Attack certificate revocation and temporal validity more deeply:
- retroactive versus prospective revocation;
- revocation reason scope;
- whether a revoked certificate invalidates historical closure or only current projection;
- chained revocation propagation;
- conflicting revocation authorities;
- certificate expiry versus semantic invalidation;
- stale-but-cryptographically-valid certificates;
- interaction with authority epochs and source incarnation.

No implementation. No V21. Preserve UNKNOWN unless closed by evidence.

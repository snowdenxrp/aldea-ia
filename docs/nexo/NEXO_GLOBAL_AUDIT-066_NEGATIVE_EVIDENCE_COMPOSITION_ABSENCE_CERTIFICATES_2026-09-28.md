# NEXO GLOBAL AUDIT-066 — NEGATIVE-EVIDENCE COMPOSITION & ABSENCE CERTIFICATES

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Audit: GLOBAL-AUDIT-066
Status: RESEARCH / ANALYSIS ONLY — NO IMPLEMENTATION

## Scope

Attack the assumption that multiple negative observations ("no X observed") can be composed into an absence certificate strong enough to authorize action.

Test dimensions:
1. multiple incomplete "no X" observations;
2. partitioned coverage;
3. overlapping scopes;
4. duplicate/common-mode negative evidence;
5. later positive evidence;
6. expiry/revocation of absence certificates;
7. replay/rollback;
8. population-completeness claims;
9. feeding negative certificates into authorization;
10. interaction with UNKNOWN and FutureObs_PAA.

## Evidence studied

### TUF

The current TUF specification explicitly treats indefinite freeze and rollback as security threats. Clients must detect stale metadata through expiration and monotonic/version checks, and reject rollback conditions. The specification also distinguishes inability to obtain updates from successful proof that no newer state exists.

Relevant implementation evidence was inspected in go-tuf's updater tests:
- expired root/timestamp/snapshot/targets metadata is rejected;
- timestamp/snapshot/targets version rollback is rejected;
- local rollback state is retained even when local metadata has expired;
- same-version modified timestamp content does not replace the trusted local version;
- fast-forward recovery exists as a separate transition requiring trust-root/key changes.
This demonstrates an operational pattern important to Nexo: freshness/anti-rollback state is itself security-relevant state and cannot be reconstructed from an arbitrary current observation.

### SPIFFE

SPIFFE Trust Domain and Bundle specifies that bundles change over time, keys may be added/revoked, and sequence numbers can represent update ordering/supersession. Bundle maps are trust-domain keyed and are treated atomically; bundle contents from different trust domains must not be merged. SPIFFE Federation recommends periodic refresh and using sequence numbers when comparing freshness/order.

Therefore:
- "I have not observed key X" is not equivalent to "key X does not exist/is not trusted";
- an observation without a complete domain and freshness contract is only a bounded observation;
- absence from one trust-domain-scoped bundle cannot establish absence in another domain;
- combining scoped bundles requires semantic scope preservation rather than set union.

### OCSP / X.509

RFC 6960 defines certificate status values GOOD, REVOKED, and UNKNOWN. GOOD is bounded: at minimum it says that the requested certificate is not revoked within the applicable validity interval; it does not necessarily establish that the certificate was ever issued. UNKNOWN means the responder cannot determine the status. Responses have thisUpdate/nextUpdate semantics, and stale responses should not be treated as reliable.

This is direct evidence that a negative/status observation needs:
- target identity;
- issuer/authority;
- scope;
- validity interval;
- freshness;
- responder authorization;
- semantic meaning of the status;
- explicit UNKNOWN when the responder lacks knowledge.

## Findings

### F066-01 — Incomplete negatives do not compose by default

Let N_i assert "X absent from domain D_i during observation interval H_i".

If the union of D_i is not proven to cover the claim domain D, then:

  N_1 + N_2 + ... + N_n != ABSENT(X,D)

unless a completeness contract proves D_i coverage, freshness, identity binding, and non-overlapping or correctly-accounted overlap.

Partitioned coverage can support absence only for the covered partition. It cannot silently promote to global absence.

### F066-02 — Overlap does not create independent negative evidence

Two observations over overlapping domains can share the same underlying source, cache, registry, snapshot, trust root, or observation pipeline.

Therefore:

  different negative records != independent negative evidence.

If dependency overlap is unresolved, the reducer must not increase confidence merely because the records are numerically distinct.

This carries forward GLOBAL-AUDIT-047 common-mode evidence rules.

### F066-03 — UNKNOWN is not a compositional zero

For a negative claim, an observation of UNKNOWN means the source could not determine the requested state. It cannot be treated as "no positive event found."

Thus:

  UNKNOWN != ABSENT
  UNKNOWN + ABSENT != ABSENT for a broader domain
  missing partition != empty partition

Any reducer that converts missing coverage into an empty set is semantically asserting a fact that the evidence did not establish.

### F066-04 — Negative evidence is asymmetric with positive evidence

A positive observation of X can directly establish existence/occurrence when identity, authority, time and provenance are admissible.

An absence observation establishes non-observation only inside its declared observation domain and completeness contract.

Therefore the reducer must not use symmetric algebra such as:
  positive_count - negative_count
or
  all-observers-report-no-X => globally-no-X
without a proof of population and observation completeness.

### F066-05 — Population completeness is a first-class claim

To issue an absence certificate over population P, the system must establish which members of P were authoritative observers for the relevant interval.

"All current validators reported no X" is insufficient if:
- validator membership is incomplete;
- a validator was offline;
- a validator held stale state;
- a validator was excluded without an admissible exclusion rule;
- validator identities/incarnations changed;
- the observer set itself is derived from the same possibly stale registry.

Thus population completeness is evidence for the absence certificate, not merely metadata.

### F066-06 — Later positive evidence reopens prior negative conclusions

An absence certificate is not historical erasure. If a later authoritative event establishes X inside the certificate's claim scope, the current claim projection may move:

  CONCRETE-ABSENT -> UNKNOWN
  CONCRETE-ABSENT -> PRESENT

depending on event-time, observation-time, authority epoch, and the certificate's declared finality boundary.

A historical absence decision can remain immutable as a record while current admissibility changes.

This carries forward GLOBAL-AUDIT-049/050/055.

### F066-07 — Expiry invalidates currency, not history

An absence certificate with a bounded validity interval can become stale. Expiry should not be interpreted as proof that the opposite is true.

Therefore:

  EXPIRED-ABSENCE != PRESENT
  EXPIRED-ABSENCE != CURRENT-ABSENCE
  EXPIRED-ABSENCE -> UNKNOWN unless another admissible observation closes the claim.

This is consistent with OCSP validity intervals and TUF expiration/freeze defenses.

### F066-08 — Revocation of an absence certificate is scoped

Revoking an absence certificate does not erase the observation that occurred historically.

The current projection must account for:
- certificate identity;
- issuer authority;
- target claim scope;
- effective interval;
- revocation reason;
- authority epoch;
- source incarnation;
- dependency propagation.

A revoked certificate cannot silently remain usable merely because its cryptographic signature remains valid.

### F066-09 — Replay/rollback can manufacture stale absence

A previously valid absence certificate can be replayed after a positive event or authority transition unless anti-rollback/freshness state is retained.

TUF provides direct implementation evidence that version monotonicity and expiration are persisted security state. Therefore a Nexo absence certificate cannot safely rely only on the certificate's signature and local timestamp.

### F066-10 — Scope union is semantic, not set-theoretic

If A proves absence over S1 and B proves absence over S2, A+B proves absence over S1 union S2 only if:
- S1 and S2 are semantically defined;
- target identity/incarnation matches;
- temporal intervals are compatible;
- authority is compatible;
- each scope's coverage is complete for its claimed partition;
- overlap/common-mode dependencies are accounted for;
- no later positive/revocation evidence invalidates the composed claim.

Set union of serialized scope labels is not sufficient.

### F066-11 — Duplicate negative observations must not increase evidentiary weight

Repeated polling of the same stale source, replicated caches, mirrors sharing a common root, or validators derived from one common snapshot are not independent absence witnesses.

This reinforces GLOBAL-AUDIT-047 and GLOBAL-AUDIT-064:
  representation multiplicity != evidence independence.

### F066-12 — Authorization must fail closed to UNKNOWN when absence is not closed

A negative certificate can be used as an authorization input only when the authorization policy explicitly defines:
- what exact negative fact is required;
- the observation domain;
- population;
- completeness;
- temporal interval/horizon;
- authority;
- source incarnation;
- dependency closure;
- freshness/anti-rollback state;
- revocation state;
- conflict state;
- retention/reconstruction guarantees.

If any claim-relevant boundary remains UNKNOWN, the negative certificate cannot be promoted to a concrete authorization fact merely because it is signed or replicated.

## Candidate absence certificate boundary (NOT FROZEN)

A candidate certificate ABSENT(C,D,H) would require at least:

- ClaimScope C;
- TargetIdentity + SourceIncarnation;
- ObservationDomain D;
- PopulationDefinition + PopulationCompletenessEvidence;
- ObservationInterval H;
- Event-time vs observation-time semantics;
- Observer set and observer authority;
- Coverage relation proving D is covered;
- dependency/common-mode closure;
- provenance closure;
- freshness / anti-rollback state;
- authority epoch;
- certificate validity interval;
- revocation status;
- conflict status;
- retention/reconstruction contract;
- explicit FutureObs/finality boundary;
- issuer authority.

Failure of any claim-relevant condition yields UNKNOWN rather than an invented absence.

## New distinctions

- NO OBSERVATION != ABSENCE
- ABSENCE IN PARTITION != GLOBAL ABSENCE
- MULTIPLE NEGATIVES != INDEPENDENT NEGATIVE EVIDENCE
- POPULATION ENUMERATION != POPULATION COMPLETENESS
- FRESHNESS EXPIRY != POSITIVE PRESENCE
- EXPIRED ABSENCE != ABSENCE
- REVOKED CERTIFICATE != ERASED OBSERVATION
- SIGNED ABSENCE != SEMANTICALLY COMPLETE ABSENCE
- SCOPE UNION != PROVEN COVERAGE UNION
- REPLAYED ABSENCE != CURRENT ABSENCE
- HISTORICAL ABSENCE DECISION != CURRENT ABSENCE CLAIM
- NEGATIVE CERTIFICATE VALIDITY != AUTHORIZATION SUFFICIENCY

## Audit verdict

GLOBAL-AUDIT-066 does NOT close the negative-evidence boundary.

The research instead strengthens the existing rule:

  absence is a claim requiring positive evidence about the completeness of the observation process.

No safe general algebra for composing negative evidence has been proven.

No authorization rule is implemented.

## Epistemic state

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

## Next audit

GLOBAL-AUDIT-067 — Negative-evidence finality, observer-set churn, and population membership transitions:
- observer join/leave/rejoin;
- offline periods;
- validator replacement/incarnation;
- membership epochs;
- partial observer failures;
- quorum changes;
- stale observers;
- late observations;
- whether a negative certificate can remain closed across population transitions.

No implementation. No V21. Preserve UNKNOWN.

# NEXO GLOBAL AUDIT — CONTINUITY — GLOBAL-AUDIT-066

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

Verified endpoint: GLOBAL-AUDIT-066
Audit commit: 92e7f6961913edc12cb78f1814417049cacf2c3e
Artifact: docs/nexo/NEXO_GLOBAL_AUDIT-066_NEGATIVE_EVIDENCE_COMPOSITION_ABSENCE_CERTIFICATES_2026-09-28.md

## Result

Negative-evidence composition remains an open semantic boundary.

Confirmed:
- incomplete negative observations do not compose into global absence without proven domain coverage;
- overlap does not create independent negative evidence;
- UNKNOWN is not an empty/zero observation;
- negative evidence is asymmetric with positive evidence;
- population completeness is a first-class claim;
- later positive evidence can reopen a prior absence projection;
- expiry makes an absence certificate stale, not positive;
- revocation changes current admissibility without erasing historical observation;
- replay/rollback can resurrect stale absence unless freshness/anti-rollback state is retained;
- scope union is semantic, not string/set union;
- duplicate/common-mode negative observations must not increase evidentiary weight;
- negative certificates cannot safely become authorization facts when any claim-relevant completeness/finality boundary remains UNKNOWN.

## External/code evidence

TUF current specification: rollback and indefinite-freeze defenses require persistent version/expiration semantics; the specification explicitly treats stale metadata as an attack surface.

SPIFFE Trust Domain and Bundle / Federation: trust bundles evolve, sequence numbers support freshness/order, bundle maps are trust-domain scoped and atomic, and bundles from different trust domains must not be merged.

W3C PROV constraints: provenance validity relies on uniqueness, event ordering and impossibility constraints; equivalence is defined over normalized provenance, not raw representation.

RFC 6960 OCSP: GOOD/REVOKED/UNKNOWN are distinct; GOOD is bounded by status semantics and validity interval, UNKNOWN means the responder cannot determine status, and stale responses are unreliable.

Real implementation inspection: theupdateframework/go-tuf updater tests explicitly test expired metadata, rollback checks, same-version content behavior, and fast-forward recovery. This confirms freshness/version state is operational security state rather than optional annotation.

## New distinctions

NO OBSERVATION != ABSENCE
ABSENCE IN PARTITION != GLOBAL ABSENCE
MULTIPLE NEGATIVES != INDEPENDENT NEGATIVE EVIDENCE
POPULATION ENUMERATION != POPULATION COMPLETENESS
FRESHNESS EXPIRY != POSITIVE PRESENCE
EXPIRED ABSENCE != ABSENCE
REVOKED CERTIFICATE != ERASED OBSERVATION
SIGNED ABSENCE != SEMANTICALLY COMPLETE ABSENCE
SCOPE UNION != PROVEN COVERAGE UNION
REPLAYED ABSENCE != CURRENT ABSENCE
HISTORICAL ABSENCE DECISION != CURRENT ABSENCE CLAIM
NEGATIVE CERTIFICATE VALIDITY != AUTHORIZATION SUFFICIENCY

## Candidate boundary — NOT FROZEN

An absence certificate would require claim scope, target identity/incarnation, observation domain, population definition/completeness, observation interval, event-vs-observation time semantics, observer authority, coverage proof, dependency/common-mode closure, provenance closure, freshness/anti-rollback state, authority epoch, validity interval, revocation/conflict status, retention/reconstruction contract, explicit FutureObs/finality boundary, and issuer authority.

Failure of a claim-relevant condition remains UNKNOWN.

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

## Next exact mission — GLOBAL-AUDIT-067

Negative-evidence finality, observer-set churn, and population membership transitions:
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

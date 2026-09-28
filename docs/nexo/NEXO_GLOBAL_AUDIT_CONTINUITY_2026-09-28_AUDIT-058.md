# NEXO GLOBAL AUDIT — CONTINUITY — GLOBAL-AUDIT-058

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

Verified endpoint: GLOBAL-AUDIT-058
Audit commit: e745020372ca1235edfdce9e851d29931985ca56
Artifact: docs/nexo/NEXO_GLOBAL_AUDIT-058_KEY_CREDENTIAL_LIFECYCLE_2026-09-28.md

## Result

Key/credential lifecycle remains an open revocation boundary.

Confirmed:
- key rotation does not itself prove identity continuity;
- key revocation and subject revocation are distinct scopes;
- compromise does not automatically invalidate historical signatures;
- overlapping credentials need independent scope/epoch semantics;
- cryptographic validity does not imply current authorization;
- delegated authority propagates only under explicit delegation semantics;
- threshold/key-set changes require explicit epoch transition semantics;
- recovery can accidentally restore revoked authority if reconstruction predates revocation;
- key registries/trust roots can become common-mode dependencies.

External evidence: RFC 5280 distinguishes certificate/key/subject semantics and multiple revocation reasons; RFC 10007 (June 2026) adds a CRL issuer keyUsage validation requirement; W3C PROV provides provenance validity/constraints and provenance-of-provenance concepts. citeturn0search0turn0search8turn0search2turn0search7

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

## Next exact mission — GLOBAL-AUDIT-059

Attack delegation and authority inheritance:
- parent/child delegation scope;
- attenuation and non-escalation;
- delegation depth;
- delegated credential revocation;
- parent revocation versus child historical validity;
- authority transfer versus delegation;
- emergency delegation;
- cyclic delegation;
- delegation reconstruction after retention loss;
- common-mode delegation roots.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.

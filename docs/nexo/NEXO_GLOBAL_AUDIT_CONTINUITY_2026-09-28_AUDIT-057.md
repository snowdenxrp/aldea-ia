# NEXO GLOBAL AUDIT — CONTINUITY — GLOBAL-AUDIT-057

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

Verified endpoint: GLOBAL-AUDIT-057
Audit commit: 9e82e3bb72b4c3c37b0608ed344a07719f2a279a
Artifact: docs/nexo/NEXO_GLOBAL_AUDIT-057_IDENTITY_INCARNATION_REVOCATION_2026-09-28.md

## Result

Identity/incarnation semantics remain an open revocation boundary.

Confirmed:
- stable identity and historical incarnation must be distinct;
- identifier reuse cannot automatically transfer revocation;
- re-keying does not by itself define semantic continuity;
- aliases are evidence-bearing mappings, not identity proof;
- conflicting identity registries can force UNKNOWN;
- authority epoch and resource incarnation are independent;
- revocation/restoration should bind incarnation unless explicit inheritance exists;
- identity infrastructure can become a common-mode evidence dependency.

External evidence: W3C PROV explicitly represents changing resources using distinct entities/lifetimes and relations such as specializationOf/alternateOf; PROV also notes that attributes need not uniquely identify an entity. PROV-JSON leaves merging equivalent identifiers to the consuming application rather than silently merging them. citeturn0search0turn0search1turn0search6

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

## Next exact mission — GLOBAL-AUDIT-058

Attack key/credential lifecycle semantics at the revocation boundary:
1. credential rotation versus identity continuity;
2. compromised-key revocation;
3. replacement keys and overlap periods;
4. key revocation versus subject revocation;
5. delegated credentials and inherited authority;
6. threshold/key-set changes;
7. stale keys after epoch transition;
8. recovery paths that accidentally restore revoked authority;
9. common-mode key registries and trust roots.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.

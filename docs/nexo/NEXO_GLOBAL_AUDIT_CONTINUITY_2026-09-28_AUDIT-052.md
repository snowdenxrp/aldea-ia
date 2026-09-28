# NEXO GLOBAL AUDIT — CONTINUITY — GLOBAL-AUDIT-052

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Verified endpoint

GLOBAL-AUDIT-052 completed as a research/audit artifact only.

Audit commit:
68113b41981963df98ee7dc25b76d143d304055d

Artifact:
docs/nexo/NEXO_GLOBAL_AUDIT-052_REVOCATION_TEMPORAL_VALIDITY_2026-09-28.md

Previous continuity:
docs/nexo/NEXO_GLOBAL_AUDIT_CONTINUITY_2026-09-28_AUDIT-051.md
commit:
d198c43e6a07ae283bacb3d450ea9db4549a52aa

## 052 result

The revocation/temporal-validity attack did NOT close FutureObs_PAA.

Key findings:
- prospective revocation and retroactive semantic invalidation are distinct;
- historical decisions remain historical records even when current claim support changes;
- revocation reason determines propagation scope;
- chained revocation must propagate through the dependency graph;
- circular/self-supporting revocation chains cannot establish admissibility;
- conflicting revocation authorities require explicit precedence, scope and epoch semantics or UNKNOWN;
- expiry is not the same as retroactive semantic invalidation;
- cryptographic signature validity does not imply current semantic admissibility;
- authority epoch and source incarnation must bind certificate validity;
- retention can prevent complete reconstruction of revocation impact.

Key distinctions:
EXPIRY != RETROACTIVE INVALIDATION
SIGNATURE VALID != CURRENTLY ADMISSIBLE
HISTORICAL DECISION != CURRENT CLAIM
REVOCATION EVENT != ERASURE OF HISTORY
CERTIFICATE REVOCATION != UNIVERSAL INVALIDATION
AUTHORITY EPOCH != SOURCE INCARNATION
REVOCATION OBSERVED != REVOCATION IMPACT RECONSTRUCTABLE

## Candidate revocation boundary

A revocation can affect current claim support only if its provenance/authenticity, issuing authority, scope, effective interval, reason, epoch/incarnation bindings and propagation path are admissible. If any claim-relevant condition remains UNKNOWN, the conservative current state remains UNKNOWN.

This is a research candidate, NOT a proven Nexo algebra.

## External evidence

W3C PROV explicitly models invalidation as a semantic event, gives ordering constraints around generation/usage/invalidation, and minimizes assumptions about synchronized physical clocks by reasoning about identified events and their relative order. citeturn0search0

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
1. who is authorized to revoke whom;
2. revocation-of-revocation;
3. emergency authority versus ordinary authority;
4. evidence required to establish revocation scope;
5. conflicting revocation histories;
6. delayed/out-of-order revocation events;
7. whether revocation evidence itself can be revoked;
8. common-mode failure in revocation infrastructure.

No implementation.
No V21.
Preserve UNKNOWN unless closed by evidence.

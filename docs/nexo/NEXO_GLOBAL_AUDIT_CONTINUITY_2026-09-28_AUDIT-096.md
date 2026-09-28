# NEXO GLOBAL AUDIT CONTINUITY — AUDIT-096

Date: 2026-09-28
Latest audit: GLOBAL-AUDIT-096
Latest audit commit: 7a965e101ddd91e68f2349d0a47cc3b9e87bf3f2

Audit-096 attacked revocation propagation across incarnations: credential revocation, old-key reuse, delayed visibility, provider-side caches, fencing-token reuse, emergency authority and recovery after revocation.

Fresh evidence:
- etcd has explicit role/account revocation operations. citeturn0search1turn0search5
- etcd leases provide bounded revocation semantics: revoke/expiry deletes attached keys and produces deletion events. citeturn0search0turn0search9
- May 2026 etcd security release fixed an RBAC bypass in specific transaction paths, demonstrating that authentication alone does not establish authorization correctness. citeturn0search10

Core distinctions:
AUTHENTIC KEY != CURRENT AUTHORITY
REVOCATION ISSUED != REVOCATION OBSERVED EVERYWHERE
REVOCATION OBSERVED != REVOCATION ENFORCED EVERYWHERE
OLD KEY != CURRENT INCARNATION
KEY REUSE != IDENTITY CONTINUITY
CACHE FRESHNESS != REVOCATION COMPLETENESS
CACHE EXPIRY != GLOBAL REVOCATION PROOF
FENCING TOKEN REUSE != AUTHORITY CONTINUITY
RESTORE != REAUTHORIZATION
BOUNDED STALENESS != GLOBAL REVOCATION COMPLETENESS
TOKEN VALUE != AUTHORITY INCARNATION
EMERGENCY STATUS != UNIVERSAL PRECEDENCE
CURRENT REVOCATION != HISTORICAL ERASURE
BOUNDED REVOCATION CLOSURE != FUTURE FINALITY
FUTUREOBS_PAA REMAINS UNKNOWN

Mandatory AB55/AB56 carryover unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

Global epistemic state remains unchanged:
P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness/minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
population completeness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

Next exact mission: GLOBAL-AUDIT-097 — delayed revocation and cache/recovery races: offline verifiers, stale authorization snapshots, revocation during in-flight operations, emergency override races, provider cache invalidation, rollback to pre-revocation checkpoints, FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.

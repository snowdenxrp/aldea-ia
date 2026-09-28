# NEXO GLOBAL AUDIT CONTINUITY — AUDIT-095

Date: 2026-09-28
Latest audit: GLOBAL-AUDIT-095
Latest audit commit: 992f89000752046196c2143e3f0c89a608d994c1

Audit-095 attacked split-brain and rollback of identity/authority: concurrent old/new incarnations, stale writers, namespace reuse, operation-ID collisions, fencing divergence, dedup divergence, identity-map conflicts and anti-rollback bypasses.

Fresh evidence:
- Raft terms provide bounded stale-leader fencing; stale terms are rejected and leaders step down on higher terms. citeturn0search36
- HashiCorp Raft separates leadership loss from client-visible outcome by returning ErrLeadershipLost to in-flight operations. citeturn0search4
- HashiCorp Raft issue #661 reports a concrete crash-persistence safety issue involving non-atomic term/vote persistence and a split-brain counterexample after recovery; closed issue, retained as incident evidence. citeturn0search5
- etcd Raft rejects proposals without a known leader and tracks term/leader state. citeturn0search10

Core distinctions:
NEW INCARNATION != OLD INCARNATION
AUTHENTIC CREDENTIAL != CURRENT WRITE AUTHORITY
LOCAL FENCE != EXTERNAL FENCE
SAME NAMESPACE != SAME INCARNATION
SAME OPERATION_ID != SAME HISTORICAL OPERATION
SAME KEY != SAME DEDUP HISTORY
MAPPING CONFLICT != AUTOMATIC IDENTITY CONFLICT
MONOTONIC VERSION != GLOBAL ANTI-ROLLBACK
RECOVERY INTEGRITY != AUTOMATIC EXTERNAL AUTHORITY
LEADERSHIP LOSS != EFFECT ABSENCE
CLIENT ERROR != EXTERNAL NON-EXECUTION
AUTHENTIC A + AUTHENTIC B != ONE CURRENT AUTHORITY
SPLIT-BRAIN CLOSURE != FUTURE FINALITY
AUTHORITY RECONSTRUCTION != FUTUREOBS_PAA CLOSURE

Mandatory AB55/AB56 carryover unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

Global epistemic state remains UNKNOWN for P_AA quotient congruence, FutureObs_PAA, R1-R5 completeness/minimality, dependency completeness, TCB completeness, evidence reducer completeness, independence proof, quorum semantics completeness, retention/reconstruction soundness and population completeness. Formal verification NOT_PERFORMED; implementation NOT_STARTED; V21 FORBIDDEN/NOT_STARTED; semantic freeze NOT_DECLARED.

Next exact mission: GLOBAL-AUDIT-096 — authority/identity revocation propagation across incarnations: credential revocation, old-key reuse, delayed revocation visibility, provider-side credential caches, fencing-token reuse, emergency authority, recovery after revocation, FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.

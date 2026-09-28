# NEXO GLOBAL AUDIT CONTINUITY — AUDIT-097

Date: 2026-09-28
Latest audit: GLOBAL-AUDIT-097
Latest audit commit: 1250b8ae94a350e682b1370d5f9e3423f30c38d3

Audit-097 attacked delayed revocation and cache/recovery races.

Fresh evidence:
- RFC 7009 explicitly acknowledges propagation delay: some servers may know a token was invalidated while others do not. citeturn0search2turn0search7
- OAuth guidance distinguishes authorization-server revocation from resource-server awareness for self-contained access tokens. citeturn0search6
- Current TUF specification uses persisted versions, expiry, threshold signatures and explicit rollback/freeze checks. citeturn0search0

Core distinctions:
REVOCATION ISSUED != REVOCATION OBSERVED EVERYWHERE
REVOCATION OBSERVED != REVOCATION ENFORCED EVERYWHERE
VALID TOKEN != CURRENT AUTHORIZATION
CACHE HIT != CURRENT AUTHORIZATION
OFFLINE VERIFIER != CURRENT VERIFIER
STALE SNAPSHOT != CURRENT AUTHORITY
SNAPSHOT VALIDITY != REVOCATION COMPLETENESS
REVOCATION DURING FLIGHT != AUTOMATIC EFFECT ABSENCE
REQUEST AUTHORIZED AT START != EFFECT AUTHORIZED AT COMMIT
REVOKED-AFTER-START != AUTOMATIC ROLLBACK
EMERGENCY OVERRIDE != RETROACTIVE ERASURE
CACHE INVALIDATION != EXTERNAL EFFECT CANCELLATION
ROLLBACK TO PRE-REVOCATION CHECKPOINT != CURRENT REAUTHORIZATION
PERSISTED VERSION != GLOBAL REVOCATION STATE
ANTI-ROLLBACK != EXTERNAL-WORLD COMPLETENESS
REVOCATION CLOSURE != FUTURE FINALITY
REVOCATION CLOSURE != FUTUREOBS_PAA CLOSURE

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

Next exact mission: GLOBAL-AUDIT-098 — authorization/effect linearization at the external boundary: revocation exactly around commit, provider acceptance vs execution, cancellation races, receipt ambiguity, retry after revocation, FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.

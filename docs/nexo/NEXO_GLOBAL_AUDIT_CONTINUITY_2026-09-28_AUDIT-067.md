# NEXO GLOBAL AUDIT — CONTINUITY — GLOBAL-AUDIT-067

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

Verified endpoint: GLOBAL-AUDIT-067
Audit commit: cb505a5e824d668fc75e83d9655c35b72ee81a6e
Artifact: docs/nexo/NEXO_GLOBAL_AUDIT-067_NEGATIVE_EVIDENCE_FINALITY_OBSERVER_CHURN_2026-09-28.md

## Result

Observer-set churn does not close negative-evidence finality.

Confirmed:
- observer population is part of the meaning of an absence certificate;
- later membership cannot retroactively support earlier absence;
- observer departure creates an uncovered interval unless explicit semantics preserve coverage;
- rejoin must distinguish incarnation/epoch;
- offline/unreachable/failure-to-report are not negative observations;
- quorum counts only have meaning relative to membership configuration and authority rules;
- old quorum evidence does not automatically cover a new population;
- replacement observers do not automatically inherit historical evidentiary continuity;
- late event-time evidence can reopen a certificate even when receipt occurs later;
- stale observers are not independent evidence;
- membership registries themselves are evidence dependencies and can be stale/rolled back;
- a globally closed negative certificate needs a stable population/finality boundary.

## External evidence

TUF security guidance confirms that freshness is security-relevant and that clients must recognize when they may be unable to obtain updates; rollback and indefinite-freeze attacks demonstrate why stale views cannot be treated as proof of absence. citeturn0search0

TUF implementation/testing material shows historical cached metadata remains relevant for rollback checks even after expiry, reinforcing that historical freshness state cannot be discarded as mere metadata. citeturn0search1

## New distinctions

CURRENT MEMBERSHIP != HISTORICAL MEMBERSHIP
JOINED-LATER != OBSERVED-EARLIER
OFFLINE != NO-X
UNREACHABLE != ABSENT
FAILED-TO-REPORT != REPORTED-NO-X
REJOINED IDENTITY != SAME INCARNATION
REPLACEMENT OBSERVER != HISTORICAL CONTINUITY
QUORUM COUNT != QUORUM SEMANTICS
E1 QUORUM != E2 POPULATION
STALE OBSERVER != INDEPENDENT OBSERVER
MEMBERSHIP ENUMERATION != MEMBERSHIP COMPLETENESS
RECEIPT-TIME FINALITY != EVENT-TIME FINALITY
HISTORICAL CERTIFICATE VALIDITY != CURRENT CLAIM ADMISSIBILITY

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

## Next exact mission — GLOBAL-AUDIT-068

Quorum transitions, intersection, and negative-evidence composition:
- quorum intersection across membership epochs;
- joint configurations;
- threshold changes;
- disjoint quorums;
- overlapping quorums with common-mode dependencies;
- stale quorum certificates;
- reconfiguration during observation;
- whether quorum intersection can establish absence rather than merely agreement;
- interaction with UNKNOWN/FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.

# NEXO GLOBAL AUDIT-055 — REVOCATION PRECEDENCE / MONOTONICITY
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Status: research/audit artifact only

## Result

This audit examines whether revocation precedence can safely be monotone as new evidence arrives.

Findings:
- append-only event history does not imply monotone current claim state;
- relevant new evidence may reopen a previously concrete projection;
- duplicate evidence must not add support;
- supersession requires explicit authority, scope and semantic dominance, not merely later arrival;
- scope union/subsumption can create false dominance unless overlap is explicitly defined;
- emergency status alone does not establish precedence;
- authority precedence may change across epochs;
- historical decisions can remain immutable while current projections change;
- deterministic tie-breaking can manufacture unsupported semantics;
- monotone metadata/version rules are scoped security invariants, not proof that semantic claims are monotone.

W3C PROV defines provenance validity through normalization and event-ordering constraints, supporting the distinction between structural validity and claim-specific semantic equivalence. TUF provides a concrete anti-rollback example: trusted metadata versions are constrained not to decrease, while expiration and key-transition rules separately affect current trust. citeturn0search0turn0search2turn0search3

## Key distinctions

EVENT APPEND-ONLY != CLAIM MONOTONIC
UNKNOWN != TERMINAL
DUPLICATE EVIDENCE != NEW SUPPORT
SUPERSEDES != LATER ARRIVAL
SCOPE SUBSUMPTION != UNIVERSAL DOMINANCE
EMERGENCY LABEL != AUTOMATIC PRECEDENCE
PRECEDENCE(E1) != PRECEDENCE(E2)
HISTORICAL DECISION IMMUTABILITY != CURRENT CLAIM IMMUTABILITY
MONOTONIC VERSION != MONOTONIC CLAIM
DETERMINISTIC OUTPUT != PROVEN CORRECTNESS

## Candidate boundary

For a fixed authority/scope/epoch contract, historical decisions can remain immutable while current projections are recomputed from the full admissible evidence set. New claim-relevant evidence may legitimately produce CONCRETE -> UNKNOWN, CONCRETE -> REVOKED, or UNKNOWN -> CONCRETE. This is a research contract, not a proven Nexo algebra.

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

## Next exact mission — GLOBAL-AUDIT-056

Attack scope algebra and semantic partitioning for revocation: exact intersection/union/subsumption; hierarchical scopes; overlapping resources; wildcard/global revocations; identity aliases and incarnation boundaries; partial restoration; emergency scope overlays; and whether scope partitioning itself introduces UNKNOWN or common-mode dependencies.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.

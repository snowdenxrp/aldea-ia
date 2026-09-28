# NEXO GLOBAL AUDIT-049 — LATE EVIDENCE / RETRACTION / TEMPORAL CLAIM CLOSURE

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: research/audit artifact only

## Boundary

Attack the GLOBAL-AUDIT-048 dependency-closure boundary at the claim-reduction layer:
- monotonic versus non-monotonic evidence addition;
- late-arriving revocation/invalidation;
- negative evidence and absence claims;
- temporal closure and FutureObs_PAA;
- whether prior concrete claims require retraction/recomputation.

No Nexo implementation, V21, or formal verification is performed.

## External evidence

W3C PROV treats generation, usage, derivation and invalidation as time-related provenance events and defines ordering constraints between them. Its validity model is intended to distinguish histories that are internally inconsistent, including contradictory derivation cycles. This supports treating later invalidation/revocation as a semantic event rather than merely a metadata update. PROV also provides formal semantics for these provenance statements, but that semantics is not Nexo's claim-reduction semantics. citeturn0search1turn0search30

## Attack A — concrete claim followed by invalidation

At time t1, evidence E supports claim C and reducer emits C=TRUE.

At t2, a valid invalidation/revocation event R arrives and changes the admissibility of E.

If the system only appends R without reevaluating C, its current state can contain a concrete claim whose supporting dependency is no longer admissible.

Finding:
claim materialization must be tied to the validity interval and dependency state that justified it.

## Attack B — late evidence is not necessarily additive

Evidence arriving later can:
- confirm a claim;
- refine UNKNOWN;
- contradict an earlier claim;
- invalidate a supporting dependency;
- reveal that two apparently independent records were duplicates;
- reveal a missing historical event.

Therefore evidence accumulation is not guaranteed to be monotonic at the level of final claims.

Candidate distinction:
EVENT APPEND may be monotonic while CLAIM STATE is non-monotonic.

This prevents an append-only event history from being confused with irreversible semantic conclusions.

## Attack C — UNKNOWN becoming concrete

An earlier UNKNOWN can become concrete if newly arrived evidence closes the exact missing dependency/completeness boundary.

But the inverse must remain possible:
CONCRETE -> UNKNOWN if a previously assumed dependency is later invalidated, shown incomplete, or revealed to have unresolved common-mode dependence.

Therefore UNKNOWN is not merely a temporary absence of data; it is a semantic state whose transition requires an evidence condition in either direction.

## Attack D — negative evidence / absence

Absence claims are dangerous because failure to observe X is not automatically evidence that X did not occur.

Examples:
- no revocation record found;
- no event in a retained history;
- no attestation observed;
- no conflicting branch discovered.

A concrete negative claim requires a completeness contract for the observation domain and time interval.

Otherwise:
NOT_OBSERVED != NOT_OCCURRED.

If completeness of the search domain is UNKNOWN, the negative claim must remain UNKNOWN.

## Attack E — temporal closure and FutureObs_PAA

A claim may depend on events that have not yet become observable at decision time:
- delayed invalidation;
- delayed external outcome;
- late reconciliation;
- delayed revocation;
- later-discovered branch/history.

Thus a current claim can be stable only relative to an explicit temporal observation boundary.

Candidate state distinction:
CURRENTLY_SUPPORTED(C, t)
versus
CLOSED_AGAINST_FUTURE_OBSERVATIONS(C, horizon)

The second is substantially stronger and is directly relevant to the unresolved FutureObs_PAA question.

No claim that FutureObs_PAA is closed is made here.

## Attack F — retraction/recomputation

If a new event changes the dependency closure, the reducer needs a defined response:
1. recompute affected claims;
2. retract or downgrade claims whose support disappeared;
3. preserve the prior historical decision as a historical artifact;
4. record why the current state differs from the prior state.

This yields two distinct objects:
- immutable historical decision/event record;
- current claim projection derived from the authoritative history.

This is compatible with event-sourcing ideas, but does not by itself prove an event-sourced architecture is correct for Nexo.

## Attack G — non-monotonicity and authority epochs

A late event may be valid for a historical authority epoch but not authorize changing a later epoch's state, or vice versa.

Therefore retraction/recomputation must bind the event to:
- claim scope;
- historical time;
- authority epoch;
- resource/incarnation;
- provenance/dependency closure.

Historical correction must not silently rewrite the meaning of a later authority epoch.

## Candidate claim-transition contract

For claim C:
- evidence addition may move UNKNOWN -> SUPPORTED only when the new evidence closes the missing boundary;
- contradiction/revocation may move SUPPORTED -> UNKNOWN/REVOKED when prior support becomes inadmissible;
- a concrete negative claim requires completeness of the searched domain;
- current support must be distinguished from closure against future observations;
- every transition must retain predecessor claim state and causal evidence.

Candidate statuses are research semantics, not implementation.

## Key new distinctions

EVENT HISTORY MONOTONICITY != CLAIM MONOTONICITY.

NOT OBSERVED != NOT OCCURRED.

CURRENTLY SUPPORTED != CLOSED AGAINST FUTURE OBSERVATIONS.

HISTORICAL DECISION IMMUTABILITY != CURRENT CLAIM IMMUTABILITY.

## Epistemic status

FOUND:
- late invalidation can invalidate a previously concrete claim;
- append-only evidence does not imply monotonic claim truth;
- UNKNOWN can legitimately transition in both directions;
- negative/absence claims require domain completeness;
- FutureObs_PAA requires an explicit temporal observation boundary;
- retraction/recomputation must preserve historical decisions while updating current projections.

NOT PROVEN:
- complete claim-transition algebra;
- FutureObs_PAA;
- P_AA quotient congruence;
- R1-R5 completeness/minimality;
- dependency/TCB/evidence-reducer completeness;
- independence proof;
- quorum/retention/reconstruction soundness.

NOT PERFORMED:
- formal verification;
- executable implementation;
- runtime/fault injection;
- V21.

## Global epistemic state — unchanged

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

## Next exact mission — GLOBAL-AUDIT-050

Attack temporal claim closure and FutureObs_PAA directly:
- finite versus unbounded observation horizons;
- delayed observations and late invalidations;
- claim closure under explicit horizon;
- what evidence is required to declare a horizon closed;
- interaction with retention/reconstruction;
- whether horizon closure itself needs provenance and authority;
- adversarial case where a claim appears closed, then a valid late event arrives inside the declared horizon.

No implementation. No V21. Preserve UNKNOWN unless closed by evidence.

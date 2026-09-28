# NEXO GLOBAL AUDIT-050 — TEMPORAL CLAIM CLOSURE / FUTUREOBS_PAA
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: research/audit artifact only

## Boundary

Directly attack the unresolved FutureObs_PAA question:
- finite versus unbounded observation horizons;
- delayed observations and late invalidations;
- conditions for declaring a claim closed against future observations;
- retention/reconstruction interaction;
- provenance and authority of horizon closure;
- adversarial late event whose event-time lies inside an already-declared horizon.

No Nexo implementation, V21, semantic freeze, or formal verification is performed.

## External evidence

W3C PROV models provenance as a history of entities, activities and events, with entity lifetimes bounded by generation and invalidation and explicit event-ordering constraints. It deliberately minimizes assumptions about synchronized physical clocks and instead reasons over identified events and relative ordering. Its validity machinery can detect internally inconsistent event histories, but it does not define a universal finality mechanism saying that no future provenance event can affect a claim. citeturn0search0

Apache Iceberg provides a concrete engineering example of the distinction between historical availability and retention: snapshots support time travel, while expiration removes older snapshots so they are no longer available for time travel. This demonstrates that a finite retention policy can create a boundary on reconstructability, but it does not by itself prove that the retained boundary is semantically complete for an arbitrary claim. citeturn0search1turn0search2

## Attack A — finite horizon is not automatically closure

Let claim C be evaluated at decision time t0.

Suppose the system declares an observation horizon H and records C as CLOSED(H).

That declaration is sound only if the claim's relevant observation domain D is explicitly defined and the system has evidence that all claim-relevant events in D whose semantic occurrence falls within H are either:
1. observed and incorporated, or
2. provably impossible/missing under a stated completeness contract.

A timestamp H alone is insufficient.

Finding:
TIME BOUND != OBSERVATION COMPLETENESS != CLAIM CLOSURE.

## Attack B — unbounded horizon

For an open-world external environment, a claim that remains exposed to arbitrarily late relevant events cannot be proven permanently closed merely because no counter-event has yet been observed.

Therefore an unbounded FutureObs_PAA domain cannot be closed by elapsed time alone.

Candidate rule:
If relevant observation horizon is unbounded and no authoritative finality boundary exists, FutureObs_PAA remains UNKNOWN.

This is a semantic limitation, not an implementation defect.

## Attack C — delayed observation inside the declared horizon

Adversarial history:
- t1: C becomes supported.
- t2: authority declares CLOSED(H), where t2 < H.
- t3: a valid event E arrives.
- event-time(E) <= H, but arrival-time(E) > t2.
- E invalidates a dependency of C.

If the closure contract did not guarantee completeness against delayed arrival, CLOSED(H) was premature.

If the contract did guarantee completeness, then E is evidence that the closure certificate or the underlying source contract was invalid, incomplete, or violated.

Finding:
A closure certificate must cover both occurrence time and observation/arrival completeness. Otherwise late events can invalidate an apparently closed claim.

## Attack D — event time versus observation time

A single scalar timestamp is insufficient when the system can observe events after their semantic occurrence.

At minimum, the temporal model must distinguish:
- event/occurrence interval;
- observation/ingestion time;
- authority assertion/finality time.

Otherwise an event observed after closure may be incorrectly treated as a post-horizon event even when its semantic occurrence was inside the horizon.

Candidate distinction:
OCCURRED_WITHIN_HORIZON != OBSERVED_BEFORE_CLOSURE.

## Attack E — retention can destroy the ability to prove closure

Suppose C was closed at H, but later the provenance records needed to demonstrate completeness for D are expired.

The system may still retain the historical statement "C was closed at H", while losing the evidence needed to reconstruct why closure was justified.

Therefore:
HISTORICAL CLOSURE RECORD != RECONSTRUCTIBLY PROVEN CLOSURE.

Apache Iceberg demonstrates that snapshot expiration intentionally removes old snapshots from time-travel availability. This is useful evidence that retention is a semantic boundary for historical reconstruction, not merely storage housekeeping. citeturn0search1turn0search3

Candidate requirement:
A closure certificate must specify its retention/reconstruction dependency and whether the evidence needed to audit the certificate remains available for the lifetime of the certificate's intended meaning.

## Attack F — reconstruction after retention

If closure depends on reconstructing all relevant observations through H, and some source history has been compacted or expired, reconstruction can only establish closure if an authoritative summary preserves the exact distinctions relevant to C and its completeness contract.

This connects directly to GLOBAL-AUDIT-045 through -049:
- schema validity is not semantic preservation;
- migrated summaries are not automatically evidence-equivalent;
- dependency closure may expose reconstruction dependencies;
- late invalidation can reverse a current claim.

Therefore retention cannot be treated as harmless compression.

## Attack G — provenance of the horizon itself

A horizon H is itself an evidentiary claim.

The system must be able to answer:
- Who/what declared H?
- Under which authority epoch?
- For which claim scope and observation domain?
- Which source systems are covered?
- What completeness/finality contract applies?
- Which clock/order semantics define "inside H"?
- What retention/reconstruction guarantees preserve the certificate?
- What revocation mechanism can invalidate the horizon declaration?

Without provenance for H, the closure boundary becomes an ungrounded parameter.

Candidate distinction:
CLAIM EVIDENCE != HORIZON EVIDENCE.

The latter is part of the dependency closure of the former.

## Attack H — source finality versus local waiting

A local system can wait 1 minute, 1 hour, or 1 day, but elapsed waiting is not proof of external finality unless the observation domain has a documented bound guaranteeing that relevant events become observable by that deadline.

A stronger closure certificate therefore requires one of:
1. an authoritative source/finality mechanism that defines a finite completion boundary;
2. a closed observation domain with a completeness contract and bounded delivery delay;
3. an equivalent formally justified mechanism that proves no relevant event can still arrive inside the claim's semantic horizon.

Absent such evidence, the conservative state is UNKNOWN.

## Attack I — closure under explicit finite horizon

A candidate research-level closure predicate for claim C and horizon H is:

CLOSED(C,H) requires:
- ClaimScope(C) is fixed;
- ObservationDomain(C,H) is explicit;
- relevant event classes are enumerated;
- event-time/observation-time semantics are defined;
- source completeness/finality for D through H is established;
- dependency/provenance closure for the supporting evidence is complete;
- authority epoch and source incarnation bindings are valid;
- retention/reconstruction obligations are satisfied;
- no unresolved conflict, revocation, or late-event condition affecting C remains;
- the closure certificate itself is provenance-bound and revocable if its premises are later shown false.

This is a candidate contract, not a proven Nexo algebra.

## Attack J — adversarial late event after declared closure

History:
1. C is supported by E1.
2. Source S declares its stream complete through H.
3. Nexo records CLOSED(C,H).
4. Later, S emits E2 with event-time <= H.
5. E2 invalidates E1.

Two cases must be distinguished.

Case 1 — S's finality/completeness contract was sound and E2 is genuinely valid:
The closure certificate was based on a false premise or a violated source contract. C cannot remain semantically closed merely because the certificate was historically recorded.

Case 2 — E2 is outside the authoritative domain or lacks valid authority/provenance:
E2 does not automatically reopen C.

Finding:
Closure depends on the authority and scope of the finality/completeness contract, not simply on arrival order.

## Attack K — closure is claim-relative

A horizon that is sufficient for one claim may be insufficient for another.

For example:
- C1 depends only on source S1, whose domain has authoritative finality at H1.
- C2 depends on S1 plus S2, where S2 has unbounded or weaker finality.

Then H1 may close C1 while C2 remains UNKNOWN.

Therefore a global "world is closed through H" flag is unsafe unless every claim-relevant observation domain is covered.

Candidate distinction:
HORIZON-CLOSED-AS-GLOBAL-STATE != CLAIM-CLOSED-AS-EVIDENCE.

## Attack L — relation to FutureObs_PAA

The audit does not close FutureObs_PAA.

It narrows the unresolved question:

FutureObs_PAA can only be reduced from UNKNOWN for a claim-relative boundary if the system can prove an explicit observation/finality contract covering every relevant future observation that could change the claim, including delayed delivery, revocation, reconstruction, authority, incarnation, and retention dependencies.

A finite horizon is therefore not itself a proof of FutureObs_PAA closure.

## Key distinctions

TIME HORIZON != OBSERVATION COMPLETENESS.

OBSERVED-BEFORE-CLOSURE != OCCURRED-BEFORE-HORIZON.

ELAPSED-TIME != EXTERNAL FINALITY.

HISTORICAL CLOSURE RECORD != RECONSTRUCTIBLY PROVEN CLOSURE.

CLAIM EVIDENCE != HORIZON EVIDENCE.

GLOBAL HORIZON != CLAIM-RELATIVE HORIZON.

EVENT HISTORY APPEND-ONLY != FUTURE-OBSERVATION CLOSURE.

## Epistemic status

FOUND:
- finite elapsed time does not itself prove temporal closure;
- unbounded relevant observation domains cannot be closed by waiting alone;
- delayed observations require distinct occurrence and observation-time semantics;
- retention can destroy reconstructability of closure evidence;
- horizon declarations are themselves evidence-bearing claims with provenance/authority dependencies;
- closure must be claim-relative to an explicit observation domain;
- an adversarial late event inside a declared horizon can invalidate closure unless the finality/completeness contract excludes it with valid authority;
- closure semantics must include retention/reconstruction and authority dependencies.

NOT PROVEN:
- complete FutureObs_PAA algebra;
- a universal finite-horizon construction for Nexo;
- completeness/minimality of the candidate closure predicate;
- P_AA quotient congruence;
- R1-R5 completeness/minimality;
- dependency/TCB/evidence-reducer completeness;
- independence proof;
- quorum/retention/reconstruction soundness;
- formal verification.

NOT PERFORMED:
- Nexo implementation;
- runtime tests/fault injection;
- formal proof;
- V21;
- semantic freeze.

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

## Next exact mission — GLOBAL-AUDIT-051

Attack the closure certificate itself:
- composability of multiple source finality/completeness certificates;
- conflicting horizons from different authorities;
- partial-domain closure and hidden dependencies;
- revocation of a previously issued finality certificate;
- whether certificate composition can safely produce a closed claim;
- common-mode failure between source finality and the evidence used to prove finality.

No implementation. No V21. Preserve UNKNOWN unless closed by evidence.

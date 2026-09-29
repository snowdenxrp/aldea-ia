# AB104.933R — Concurrent incompatible corrections: preserve conflict, do not choose history
Date: 2026-09-29

## Question
C1 and C2 concurrently target EFFECT-2. Both effects are confirmed, but later evidence shows their outcomes are mutually incompatible. How should Nexo represent the conflict without arbitrarily selecting a history?

## Fresh evidence
AWS and Microsoft Event Sourcing guidance treat the event stream as an immutable historical record and describe optimistic concurrency as a mechanism for detecting conflicting writes; they also note that conflict handling can remain necessary when conflicts span multiple entities. A projection/current state is derived from the event history and can be eventually consistent. citeturn0search0turn0search1
A 2026 research paper on concurrent administrative conflicts in CRDT-like systems illustrates a related point: concurrent events may require an explicit arbitration/finality mechanism rather than an implicit winner. This is research evidence, not a normative architecture requirement. citeturn0academia13

## Scenario
EFFECT-2 is confirmed.
C1 and C2 are independently authorized and concurrent.
EFFECT-3 and EFFECT-4 are both confirmed.
Later evidence establishes that C1 and C2 cannot both be semantically valid under the same invariant.

## Findings
1. Both confirmed effects remain historical facts. Conflict does not erase either effect.
2. “Mutually incompatible” is a semantic relation that must be grounded in an explicit invariant/contract or authoritative rule; it is not established merely because the final projection looks surprising.
3. If the domain has an authoritative serialization/arbitration rule, Nexo may record that rule's decision as a new fact. It must preserve the underlying concurrent events and the arbitration evidence.
4. If no authoritative arbitration exists, Nexo must represent the state as CONFLICTING/UNRESOLVED rather than selecting C1 or C2 by recency, source count, arrival order, or convenience.
5. A later projection can choose a display/reconciliation view, but that view is not permission to rewrite the historical event graph.
6. If one correction is later compensated, that creates another effect/event; it does not prove the compensated correction never occurred.
7. If one event was unauthorized under its own checkpoint, that is an authorization assessment, not automatic evidence that its external effect did not occur.
8. If the conflict crosses multiple aggregates/resources, local optimistic concurrency is insufficient to resolve the global semantic conflict; a domain-level arbitration or reconciliation rule is required.
9. If authoritative evidence later resolves the conflict, Nexo should append the resolution/assessment with its provenance and preserve the prior CONFLICTING state as historical state.
10. If the resolution itself is disputed or incomplete, the result remains UNKNOWN/CONFLICTING.

## Representation
Preserve:
EFFECT-2
C1 -> EFFECT-3
C2 -> EFFECT-4
INCOMPATIBLE(C1,C2)
INVARIANT-ID
ARBITRATION/RECONCILIATION event, if authoritative
PROVENANCE for every relation

State should be derivable as:
FACTS = immutable observed/authoritative events
RELATIONS = explicit evidence-backed edges
ASSESSMENTS = versioned policy/authority interpretations
PROJECTION = derived current view
CONFLICT = explicit state, not an implicit choice

## Critical distinctions
CONFLICT != ERASURE
CONFLICT != C1_LOSES
CONFLICT != C2_LOSES
ARBITRATION != HISTORY_REWRITE
PROJECTION != SOURCE_HISTORY
RECENCY != AUTHORITY
SOURCE_COUNT != EVIDENCE_STRENGTH
ARRIVAL_ORDER != CAUSAL_ORDER
COMPENSATION != NONOCCURRENCE
UNAUTHORIZED != PROVEN_NONEXECUTION
LOCAL_CONCURRENCY_CONTROL != GLOBAL_SEMANTIC_ARBITRATION

## Classification
No new top-level interaction class. Primarily I19/I21/I24 + class11/class12; I9 where authority generations differ.

## Epistemic status
Research only. No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.

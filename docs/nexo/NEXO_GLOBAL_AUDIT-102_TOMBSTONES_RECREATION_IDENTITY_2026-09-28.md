# NEXO GLOBAL AUDIT-102 — Tombstones, Deletion, Recreation, and Identity Reuse

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope
Tombstones, deletion semantics, resource recreation, identity reuse, queue recreation, key generations, and whether deletion/recreation preserves historical effect identity and reconstruction.

No implementation. No V21. No semantic freeze.

## Fresh evidence

etcd explicitly models a key lifetime as a generation from creation through deletion. Deletion creates a tombstone and ends the current generation; a later creation constitutes another generation. Compaction can subsequently remove generations that ended before the compaction revision. [etcd data model]

Google Cloud Tasks treats explicit task names as a deduplication identity, remembers deleted task names for a bounded period, and imposes a separate three-day wait before recreating a deleted queue with the same name. [Cloud Tasks documentation]

AWS Durable Execution assigns unique event IDs and operation IDs inside an execution history, and history is retained only for a bounded period after completion. Therefore the provider's historical event identity is scoped to an execution/history contract, not automatically to a forever-global world effect. [AWS Durable Execution history documentation]

## Findings

DELETION != HISTORICAL ERASURE
TOMBSTONE != COMPLETE PRE-DELETION HISTORY
TOMBSTONE != WORLD-EFFECT REVERSAL
DELETED RESOURCE != PROVEN NON-EXISTENCE
DELETED RESOURCE != PROVEN NON-EFFECT
RECREATED RESOURCE != SAME INCARNATION
SAME RESOURCE NAME != SAME RESOURCE IDENTITY
SAME TASK NAME != SAME HISTORICAL TASK
SAME KEY != SAME KEY GENERATION
SAME QUEUE NAME != SAME QUEUE INCARNATION
NEW GENERATION != CONTINUATION OF OLD GENERATION
NAME REUSE != IDENTITY CONTINUITY
DEDUP MEMORY != HISTORICAL IDENTITY
DEDUP EXPIRY != PROOF OF NON-EXECUTION
RECREATION AFTER DEDUP EXPIRY != PROOF THAT OLD EFFECT IS ABSENT
CURRENT RESOURCE STATE != COMPLETE HISTORY OF PRIOR INCARNATIONS
CURRENT GENERATION != COMPLETE PRIOR GENERATION HISTORY
COMPACTION != PROOF THAT REMOVED GENERATIONS NEVER MATTERED
TOMBSTONE RETENTION != EFFECT RETENTION
RESOURCE EXISTENCE != EFFECT EXISTENCE
RESOURCE DELETION != EXTERNAL EFFECT CANCELLATION

## Critical race

Consider:

1. operation O targets resource identity R₁;
2. R₁ is deleted;
3. resource name R is recreated as R₂;
4. deduplication/history retention for R₁ expires;
5. a late receipt or external effect associated with R₁ appears;
6. current reads observe R₂.

Without a durable incarnation binding, a current-state observer can incorrectly associate evidence from R₁ with R₂.

Therefore:

SAME NAME + NEW INCARNATION + EXPIRED HISTORY -> IDENTITY AMBIGUITY

RESOURCE RECREATION != HISTORICAL EFFECT RECONSTRUCTION

## Identity boundary required for future formalization

Every externally effective resource must be modeled, at minimum, with:

- stable logical resource identity;
- provider resource identifier;
- provider incarnation/generation;
- creation evidence;
- deletion evidence;
- recreation evidence;
- operation identity;
- attempt/retry lineage;
- provider dedup namespace and validity window;
- receipt/effect lineage;
- authority/fencing epoch;
- provider/cluster incarnation;
- event-time and observation-time;
- retention/compaction boundary;
- tombstone semantics;
- dependency/provenance closure;
- reconstruction loss.

The critical invariant is not merely that names are unique. It is that historical evidence must bind to the exact incarnation whose authority and effect semantics it claims to describe.

## FutureObs_PAA impact

Deletion/recreation introduces another class of future observation ambiguity:

A future observation of name R does not by itself determine whether it refers to R₁, R₂, or a later incarnation.

Therefore:

FUTURE OBSERVATION OF NAME != FUTURE OBSERVATION OF INCARNATION
INCARNATION UNKNOWN -> HISTORICAL EFFECT CLAIM UNKNOWN

This does not close FutureObs_PAA.

## Epistemic state — unchanged

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
population completeness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

## Mandatory AB55/AB56 carryover

AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission

GLOBAL-AUDIT-103 — identity reuse under provider/cluster recreation: resource identity, queue identity, account/project identity, provider incarnation, and cross-provider migration mappings; attack whether any mapping can preserve historical identity without an authoritative continuity proof.

No implementation. No V21. Preserve UNKNOWN.

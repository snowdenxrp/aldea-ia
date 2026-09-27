# AB104.600 — VersionSet write-skew and dynamic dependency audit

Date: 2026-09-27
Status: RESEARCH ONLY. No V21, implementation, architecture freeze, or formal verification claim.

## Question
Can Nexo declare a static DependencySet before execution, or must it record authoritative reads dynamically to prevent hidden semantic dependencies and write-skew?

## Evidence studied
1. PostgreSQL SSI documentation/code: serializable execution tracks read/write conflicts; predicate reads must cover not only tuples read but ranges that could satisfy the predicate. Predicate-lock granularity can be widened under resource pressure. Sources: PostgreSQL SSI wiki, predicate.c source, PostgreSQL 18 transaction-isolation docs.
2. Cahill/Röhm/Fekete, "Serializable Isolation for Snapshot Databases": snapshot isolation permits write skew when concurrent transactions update different items linked by an integrity constraint.
3. 2026 PostgreSQL reports identified real scan-path gaps where a serializable implementation could miss the required predicate conflict. The reported TID/TID-range cases demonstrate that even an intended serializable mechanism can fail when the executed access path is not represented by the dependency-tracking mechanism.

## Findings

### F1 — Direct WriteSet is insufficient
A transaction may write only local objects while its decision depends on a wider predicate, aggregate, threshold, relationship, institution, ecosystem, or policy condition. Two transactions can therefore write disjoint objects while jointly violating an invariant.

### F2 — A static DependencySet is safe only if it is a proven conservative closure
A predeclared DependencySet can be used only when the system has a complete, authoritative dependency model for every semantic read that can affect the protected decision. If the closure is incomplete, the VersionSet can falsely validate a stale decision.

### F3 — Dynamic authoritative-read capture is required when dependency closure is not statically complete
Every authority-relevant read that influences admission/commit should contribute its object/range/predicate identity plus authoritative version/incarnation to the transaction's observed dependency set. Final validation must cover the resulting dependency closure, not merely the declared WriteSet.

### F4 — Predicate/range dependencies matter
Tracking only concrete object IDs is insufficient for queries such as "any available fish", "total ecosystem pressure below threshold", "at least one qualified institution/agent", or "price/availability within policy bounds". The dependency representation must be able to bind predicate/range/aggregate semantics, or conservatively bind a broader authoritative version.

### F5 — The executed access path is part of the proof surface
PostgreSQL's recent scan-path incidents show that a dependency mechanism can be conceptually correct yet miss conflicts if an access method fails to register the corresponding predicate dependency. Nexo therefore cannot treat "read API called" as proof of complete dependency capture; capture instrumentation itself must be audited against all authoritative access paths.

### F6 — Dynamic capture must not become an escape hatch
A dynamic read set is useful only if reads are authoritative, immutable for the observation, provenance-bound, versioned/incarnation-bound, and included in final commit validation. Reads performed outside the authoritative path cannot silently enlarge authority.

## Adversarial Nexo cases
- trade ↔ institution: trade reads governance threshold; concurrent governance change modifies admissibility while buyer/seller writes remain disjoint.
- farm ↔ ecosystem: farm reads fertility/pressure aggregate; concurrent ecological action changes aggregate without touching farm record.
- repair ↔ society: repair reads an invariant whose semantic writers include social/governance state; local repair object can remain unchanged while its correctness predicate changes.
- research/technology/governance: technology research changes a capability/policy interpretation that changes what a later mission is allowed to do, without mutating the mission's local object.

## Candidate contract
VersionSet = {
  direct ReadSet,
  direct WriteSet,
  DependencySet,
  Predicate/Range dependencies where applicable,
  object/resource incarnations,
  authoritative version tokens,
  policy/logic/config version where semantically relevant
}

Before execution: declare known closure.
During authoritative evaluation: append observed dependencies.
At final gate: validate the complete observed closure plus required declared dependencies against current authoritative state.
On mismatch or incomplete instrumentation: STALE_ADMISSION / HOLD, not best-effort execution.

## Open limitation
This establishes a research direction, not a complete dependency language or proof. The next audit must test whether dynamic capture itself can miss dependencies through derived values, cached reads, helper functions, external provider observations, or uninstrumented code paths.

## Exact next action
AB104.601: adversarially audit derived-value/cache/helper-function dependency leakage and define the minimum provenance record needed to prove that every authority-relevant read entered the final DependencySet.

# AB104.878R — multi-effect correction-of-correction audit
Date: 2026-09-29
Parent: AB104.877R
Mode: research/audit only

## Question
R1 commits E1, R2 independently commits E2 for one logical operation, then R1 issues correction C1 and R2 issues another correction C2. Does correction-of-multiple-effects create a new top-level interaction?

## Fresh evidence
- Microsoft Event Sourcing states original events remain immutable and reversal/correction is represented by compensating events; consumers are typically at-least-once and must be idempotent. citeturn0search0
- Microsoft Compensating Transaction guidance states compensation is a new forward operation, may execute multiple times, and must account for concurrent work rather than simply restoring old state. citeturn0search6turn0search10
- Transcore documents repeated/corrective payment updates and recommends using provider state plus ordering metadata when updates are unclear or out of order. citeturn0search16
- Payment reconciliation guidance describes unresolved webhook states being reconciled against the provider's authoritative API rather than assuming missing/out-of-order notifications prove absence of an effect. citeturn0search5

## Attack
O1 is processed in R1 and R2 due to the multi-region split. External effects E1 and E2 both commit. R1 later emits correction C1 targeting E1. R2 emits correction C2 targeting E2. C2 can arrive before C1, C1 can be duplicated, or either correction can arrive after a stale projection already incorporates the other effect.

## Analysis
A. Distinct corrections with explicit effect lineage: C1 -> E1 and C2 -> E2. This is multiple effect lineage plus I19. No new class.
B. C2 arrives before C1: correction ordering is I21; if ordering is not provable, preserve INCOMPARABLE/UNKNOWN rather than choosing arrival order.
C. C1 duplicated: I22/I23 duplicate/retry semantics. Compensation itself must remain idempotent; duplicate compensation is not equivalent to a second business correction.
D. C1/C2 target the same logical operation but different attempts/effects: operation identity alone is insufficient; attempt/effect lineage is required. This is I18 + class 11 + I19.
E. A correction is issued before the second effect is known: this creates a dependency edge in the effect graph. Later evidence can reveal whether the correction covered one effect or whether another independently committed effect remains open. This is class 11 + class 12, not a new class.
F. C1 itself is corrected/reversed: this is another compensating event in the same typed lifecycle. It does not create a new top-level class; it extends the event graph and requires causal/lineage metadata.
G. One correction succeeds and the other is UNKNOWN: the system must preserve per-effect knowledge. Aggregate state must not collapse UNKNOWN into FAILED or assume that correcting E1 corrected E2.

## Key refinement
`ONE_LOGICAL_OPERATION != ONE_EXTERNAL_EFFECT`
`ONE_CORRECTION != COMPLETE_COMPENSATION`
A correction is an event/action with its own identity and target lineage. When multiple attempts produce multiple effects, compensation must be scoped to each effect/attempt unless the provider contract explicitly defines a broader aggregate correction.

## Stronger typed model
Operation O
 -> Attempt A1/R1 -> Effect E1 -> Correction C1
 -> Attempt A2/R2 -> Effect E2 -> Correction C2

Each edge needs explicit identity/causal evidence. The aggregate operation state cannot replace the per-attempt/per-effect graph.

## Disposition
No new top-level interaction class frozen.
The scenario is fully represented by I18 + I19 + I21 + I22/I23, class 11 and class 12 as applicable.
The investigation strengthens the typed effect graph requirement and rejects a single flat operation status as sufficient evidence for multi-effect compensation.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Semantic freeze NOT DECLARED.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Nexo runtime race NOT EXECUTED.
V21 FORBIDDEN.

## Candidate invariants
INV-TE-76: A correction must bind to the specific effect/attempt lineage it compensates unless an explicit provider contract defines aggregate scope.
INV-TE-77: One logical operation may have multiple external effects; operation identity alone cannot collapse effect lineage.
INV-TE-78: Aggregate correction state must preserve per-effect UNKNOWN/COMMITTED/FAILED knowledge.
INV-TE-79: Duplicate compensation must be observationally idempotent and must not create an additional business correction.
INV-TE-80: A correction-of-correction remains a new typed event linked to its predecessor; it must not mutate historical events in place.

## Next
AB104.879R — investigate partial correction: E1 and E2 both commit, but only one is reversible/compensable while the other is irreversible or already externally consumed. Determine whether the inability to compensate one effect creates a distinct interaction or remains class 11 + I19 + class 12.

NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED
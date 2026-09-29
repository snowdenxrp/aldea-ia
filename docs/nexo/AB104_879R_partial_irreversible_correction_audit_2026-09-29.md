# AB104.879R — partial/irreversible correction audit
Date: 2026-09-29
Parent: AB104.878R
Mode: research/audit only

## Question
Two external effects commit; one is reversible/compensable and the other is already irreversible or externally consumed. Does partial correction create a new top-level interaction?

## Fresh evidence
- Microsoft Compensating Transaction guidance explicitly notes that compensation may not always be able to restore the original state, especially when external systems or concurrent work are involved; compensation is a new forward operation rather than rollback. citeturn0search0turn0search6
- Microsoft Saga guidance describes distributed transactions as sequences of local transactions with compensating transactions for failure; it also notes that some actions have no meaningful compensating transaction and may require a different recovery path. citeturn0search8
- Adyen documents that payment modifications can have distinct asynchronous outcomes, including refund failure/reversal, showing that a requested correction is not synonymous with successful compensation. citeturn0search12

## Attack
Logical operation O produces E1 and E2 in independent regions. E1 remains reversible. E2 is already externally consumed/settled or the provider contract offers no reversal. Correction C1 succeeds for E1. Correction C2 for E2 fails or is impossible. Coordinator must represent the aggregate outcome.

## Analysis
A. E1 corrected, E2 irreversible: this is per-effect outcome divergence. It is class 11 (external-effect boundary/knowledge) plus I19 (correction) and class 12 when reconciliation or recovery is required.
B. C2 requested but provider says not reversible: this is not evidence that E2 never happened. Preserve E2=COMMITTED/SETTLED and C2=UNAVAILABLE/FAILED according to the provider contract.
C. C2 UNKNOWN: preserve UNKNOWN; do not collapse it to FAILED merely because compensation is difficult or impossible.
D. Aggregate operation status: must not become simply CORRECTED if E2 remains committed, nor simply FAILED if E1 was corrected. Aggregate state needs a typed per-effect graph.
E. Manual/business remediation after irreversible effect: this is a new operation linked to E2, not a retroactive correction of E2. It remains within class 11 + class 12 unless the remediation itself introduces another interaction already covered by the taxonomy.
F. Compensation ordering: C1 can complete before C2 is even attempted; ordering/freshness is I21 where relevant, but inability to compensate does not create a new ordering class.

## Key refinement
`CORRECTION_REQUESTED != CORRECTION_EFFECTIVE`
`IRREVERSIBLE_EFFECT != UNKNOWN_EFFECT`
`COMPENSATION_FAILURE != ORIGINAL_EFFECT_FAILURE`
An inability to compensate an already committed external effect is a property of the correction boundary, not proof about the original effect's execution.

## Disposition
No new top-level interaction class frozen.
Partial correction is represented by per-effect lineage plus class 11 + I19 + class 12, with I21/I22/I18 as applicable.
This strengthens the requirement that Nexo distinguish original effect state from correction state and preserve non-compensable outcomes explicitly.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Semantic freeze NOT DECLARED.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Nexo runtime race NOT EXECUTED.
V21 FORBIDDEN.

## Candidate invariants
INV-TE-81: Correction outcome must be stored separately from original-effect outcome.
INV-TE-82: A non-compensable effect must remain represented as such; it must not be rewritten as FAILED or UNKNOWN without evidence.
INV-TE-83: Aggregate operation state must preserve heterogeneous per-effect correction outcomes.
INV-TE-84: Compensation failure does not imply original-effect failure or absence.
INV-TE-85: Manual remediation is a new linked operation, not mutation of historical effect state.

## Next
AB104.880R — investigate partial correction plus retention/idempotency expiry: one effect is corrected, the other remains committed, then correction records or idempotency keys expire and a late retry/replay occurs. Determine whether this adds anything beyond I15 + I19 + I22 + class 11/12.

NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED
# AB104.879R — partial correction / irreversible effect audit
Date: 2026-09-29
Parent: AB104.878R
Mode: research/audit only

## Question
If E1 and E2 both commit but E1 is compensable while E2 is irreversible/already externally consumed, does partial correction create a new top-level interaction?

## Fresh evidence
- Microsoft Compensating Transaction guidance states compensation may not restore the system to its exact original state and that business rules may require manual intervention when a step cannot be compensated. It also treats compensation as a new forward operation. citeturn0search0turn0search6
- Adyen documents that a payment can reach a successful/settled state and later be refunded or reversed, while some modification outcomes can fail or be reversed. This demonstrates that correction capability is resource/provider-contract dependent rather than universal. citeturn0search2turn0search5
- Event Sourcing guidance preserves original events and models correction through compensating events, so an irreversible external effect cannot be erased by rewriting historical state. citeturn0search1

## Attack
O1 produces E1 and E2 through separate attempts. C1 successfully compensates E1. E2 has already been consumed by an external system or has no supported reversal operation. Coordinator now holds one corrected effect and one committed-but-not-compensable effect.

## Analysis
A. Partial compensation is a capability/state difference, not a new concurrency primitive. It remains class 11 (external-effect boundary) + I19 (correction/reversal) + class 12 when reconciliation is required.
B. If the system incorrectly reports O1 as fully corrected after only C1, the defect is an aggregate-state/projection error. The underlying interaction is still class 11 + I19 + reconciliation.
C. If E2 cannot be compensated because the provider contract forbids reversal, this is a domain capability constraint. It must be represented explicitly rather than inferred from C1 success.
D. If E2's compensability changes over time, that is another lifecycle dimension; it combines with I21/order and class 12 but does not create a new top-level class.
E. If manual compensation is required, the system must preserve a durable unresolved state and an explicit remediation workflow. Manual action does not turn UNKNOWN into FAILED or erase E2.
F. If C1 itself creates a new external effect, that effect gets its own lineage. A compensation can therefore reduce exposure without returning the entire operation to an original state.

## Key refinement
`COMPENSATION_SUCCESS(E1) != OPERATION_FULLY_CORRECTED`
`NON_COMPENSABLE(E2) != EFFECT_ABSENT`
Correction capability is per effect/resource/provider contract. Aggregate status must be derived from per-effect evidence and declared policy, not from one successful correction.

## Proposed typed state addition
Effect capability should be represented separately from effect knowledge:
- EffectKnowledge: UNKNOWN / COMMITTED / FAILED / CORRECTED / REVERSED
- CompensationCapability: REVERSIBLE / IRREVERSIBLE / UNKNOWN
This is a modeling refinement, not a new top-level interaction class.

## Disposition
No new top-level interaction class frozen.
Partial correction remains class 11 + I19 + class 12, with I21/I22/I18 as applicable.
The research strengthens the requirement that correction capability and effect outcome are separate evidence dimensions.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Semantic freeze NOT DECLARED.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Nexo runtime race NOT EXECUTED.
V21 FORBIDDEN.

## Candidate invariants
INV-TE-81: Successful compensation of one effect must not imply full correction of the logical operation.
INV-TE-82: Compensation capability must be represented separately from effect knowledge.
INV-TE-83: An irreversible effect remains part of historical effect lineage even when another effect is successfully compensated.
INV-TE-84: Aggregate operation status must preserve unresolved per-effect states.
INV-TE-85: Manual remediation must be durable and explicit; it must not silently convert UNKNOWN into FAILED or erase historical effects.

## Next
AB104.880R — investigate compensation ordering where C1 succeeds before E2 becomes known, then E2 is discovered committed and non-compensable. Determine whether late effect discovery plus partial correction remains class 11 + I19 + class 12 + I21, or exposes a new knowledge-order interaction.

NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED
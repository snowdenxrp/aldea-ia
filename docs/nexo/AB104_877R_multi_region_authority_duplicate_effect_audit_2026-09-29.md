# AB104.877R — multi-region authority split + duplicate external effect audit
Date: 2026-09-29
Parent: AB104.876R
Mode: research/audit only

## Question
Can different authority generations in R1/R2 allow the same logical operation to produce external effects in both regions, and does that require a new top-level interaction?

## Fresh evidence
- AWS EC2 explicitly documents regional idempotency: the same client token can represent a separate request in another Region. Therefore an unchanged logical key does not universally provide cross-region duplicate protection. citeturn0search0
- AWS ECS likewise scopes idempotency to a cluster; the same token in another cluster is a separate request. citeturn0search3
- Stripe's 2026 payment-failover guidance treats idempotency and transaction safety as central failover controls and states that unclear outcomes require safe retry or abandonment, with reconciliation/audit records after failover. citeturn0search6
- A 2026 multi-region payment case study describes a cross-region idempotency store specifically to prevent duplicate settlement during failover; this is engineering evidence, not proof of a universal guarantee. citeturn0search2

## Attack
R1 holds authority G1. Operation O1 is accepted and sent toward external effect E1. R1 becomes partitioned/stale. R2 holds G2 and receives the same logical retry O1. Because regional idempotency/authority state is not shared or current, R2 accepts and produces E2. R1 may later complete E1. The coordinator subsequently sees evidence of one logical operation with potentially two external effects.

## Analysis
A. Authority split is the admission condition: class 9 + I18. A stale region accepting G1 after G2 exists is already covered by the authority-generation/fencing family.
B. Same logical operation reaching two independent idempotency domains is I15/I22 and I18; AWS explicitly shows that identical client tokens can be independently effective across regions.
C. If both external effects actually commit, class 11 (external-effect ambiguity/duplication) is implicated. If one effect is known and the other is unresolved, preserve UNKNOWN rather than infer absence from timeout or failover.
D. If reconciliation later determines both effects committed, this is a correction/reversal/reconciliation problem already represented by I19 + class 12 as applicable.
E. If the second attempt is prevented by a globally shared idempotency/claim domain, the attack collapses before E2; this is a system property, not evidence that the semantic interaction does not exist.
F. If R2's authority is explicitly fenced by a resource-side generation and rejects G1/G2 mismatch, the external duplicate path is prevented. Again, this is mitigation, not a new class.

## Critical refinement
`LOGICAL_OPERATION_ID != REGION_LOCAL_IDEMPOTENCY_KEY`
A stable logical operation identifier does not automatically imply a single global deduplication domain. Conversely, global deduplication does not by itself prove external effect outcome.

## Result
No new top-level interaction class frozen.
The full attack composes existing dimensions:
- class 9 — authority-generation/fencing
- I18 — regional/namespace identity
- I15/I22 — idempotency scope + retry
- class 11 — multiple/ambiguous external effects
- class 12 — reconciliation
- I19/I21 when correction/reversal or ordering enters.

The case therefore strengthens the cross-product and the need for a global operation/effect lineage model, but does not justify a new class.

## Important epistemic limit
Public failover guidance and case studies show the engineering hazard and mitigations. They do NOT establish that Nexo or any specific implementation executes this race. Nexo runtime race remains NOT EXECUTED.

## Candidate invariants
INV-TE-71: Authority generation and idempotency scope must be evaluated independently at every external-effect boundary.
INV-TE-72: A region-local idempotency key must not be treated as global operation deduplication.
INV-TE-73: Successful admission in R2 must not imply absence of an effect from R1.
INV-TE-74: Multiple external effects for one logical operation require explicit attempt/effect lineage and reconciliation.
INV-TE-75: Resource-side fencing can prevent stale-region effects but cannot serve as an oracle that an earlier effect never occurred.

## Disposition
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Semantic freeze NOT DECLARED.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Nexo runtime race NOT EXECUTED.
V21 FORBIDDEN.

## Next
AB104.878R — investigate the harder boundary: R1 effect commits, R2 independently commits, then one region issues correction/reversal while the other issues a second correction. Determine whether correction-of-correction across independent regional effects remains I19 + I21 + class 11/12, or exposes a distinct multi-effect correction interaction.

NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED
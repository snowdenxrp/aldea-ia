# AB104.871R — regional failover + cross-region correction/reversal

Date: 2026-09-29
Parent: AB104.870R
Mode: research/audit only

QUESTION
Can a correction/reversal emitted from the original provider region after a retry was accepted in a failover region create an independent interaction beyond I18 + I19 + I21?

FRESH EVIDENCE
- AWS EC2 explicitly defines regional idempotency: the same client token can be used in another Region, where it is treated as a separate idempotency domain. citeturn0search0
- AWS ECS likewise scopes idempotency to a cluster, making the same token a separate request in another cluster. citeturn0search3
- Transcore webhook documentation describes repeated/corrective updates for the same payment, including a later correction after an earlier FAILED/COMPLETED state; when ordering is unclear it recommends rereading authoritative payment state. citeturn0search6
- CrossPay demonstrates durable webhook-id deduplication with database uniqueness, reinforcing duplicate-delivery as distinct from correction semantics. citeturn0search5

ATTACK
E1 is accepted/committed or remains UNKNOWN in R1. Failover sends retry E1 to R2. R2 accepts under its own provider idempotency scope. Later, R1 emits correction/reversal C1 referring to E1. C1 reaches a coordinator whose current projection is based on R2.

REDUCTION
1. Cross-region identity/scope = I18. Provider region is part of the dedup/lineage domain when the contract makes it so.
2. Correction/reversal = I19. C1 is a later lifecycle event, not a new top-level class.
3. If C1 and R2 state have a provable causal/freshness relation, I21 applies; if no relation is established, preserve INCOMPARABLE/UNKNOWN rather than inventing order.
4. If both regional attempts can produce external effects, class 11 and class 12 may be involved.
5. If C1 is delivered more than once, duplicate delivery remains I22/I23 as applicable.

KEY ANALYSIS
Regional failover does not itself create a new semantic interaction. The hard boundary is lineage: C1 must identify which attempt/resource it corrects. A correction from R1 cannot be applied to R2 merely because both share a logical operation key or resource identifier. Conversely, a correction from R1 must not be discarded merely because R2 became the active region. Regional activation is not proof that the original attempt had no effect.

IMPORTANT REFINEMENT
ACTIVE_REGION != AUTHORITATIVE_LINEAGE.
A failover decision changes routing/processing responsibility; it does not retroactively rewrite the history or effect status of the prior region.

DISPOSITION
No new top-level interaction class frozen.
Absorbed by I18 + I19 + I21, with I22/I23, class 11, and class 12 as applicable.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Semantic freeze NOT DECLARED.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Nexo runtime race NOT EXECUTED.
V21 FORBIDDEN.

CANDIDATE INVARIANTS
INV-TE-42: Correction/reversal events must bind to the original attempt/resource lineage, not merely the current active region.
INV-TE-43: Failover must not retroactively invalidate prior-region effect evidence.
INV-TE-44: A correction whose causal/freshness relation to the current regional state is unestablished must preserve INCOMPARABLE/UNKNOWN.
INV-TE-45: Active-region selection must remain separate from authoritative historical lineage.

NEXT
AB104.872R — investigate whether provider-issued correction identifiers are globally unique across regions or region-scoped, and whether that identity contract changes the I18/I19 reduction.

CONSTRAINTS
NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED

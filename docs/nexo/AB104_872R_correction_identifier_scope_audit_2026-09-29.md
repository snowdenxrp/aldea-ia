# AB104.872R — correction/reversal identifier scope audit

Date: 2026-09-29
Parent: AB104.871R
Mode: research/audit only

QUESTION
Are provider-issued correction/reversal identifiers globally unique across regions, or can they be region-scoped, and does that create an interaction beyond I18 + I19 + I21?

FRESH EVIDENCE
1. Adyen states that each payment or modification request such as a refund receives a unique PSP reference. The reversal API returns a distinct PSP reference for the reversal while retaining paymentPspReference for the original payment.
2. Adyen's reversal webhook carries both originalReference and the pspReference of the reversal. This is concrete lineage binding between correction and original payment.
3. Adyen referenced-refund documentation uses the original PSP reference to match refunds across sales channels/merchant accounts, while the refund itself has its own PSP reference.
4. AWS documents region-scoped idempotency: the same client token may legitimately identify separate operations in different Regions. This demonstrates why identifier scope must be an explicit contract.

ATTACK
C1 generated in R1 has correction_id=C1-R1 and original_operation=E1-R1. Failover creates E1-R2. A delayed C1-R1 reaches the active R2 path. Alternatively, two regions generate identifiers that are only locally unique.

ANALYSIS
A. Global correction ID + explicit original-operation reference: correction identity and lineage distinguish C1 from R2 attempt. No new class; I19 + I18, with I21 if ordering/freshness is involved.
B. Region-scoped correction IDs: identifier alone is insufficient globally. Region/domain becomes part of identity: I18. Correction semantics remain I19.
C. Unique correction ID without original-operation linkage: uniqueness does not establish lineage. Reconciliation needs authoritative evidence; if lineage cannot be established, preserve UNKNOWN/INCOMPARABLE. I19 + I21 + class 12 as applicable.
D. Same correction ID reused in another region: known scope means I18. Unknown scope means unresolved identity ambiguity; do not select a winner.

KEY REFINEMENT
CORRECTION_ID_GLOBAL_UNIQUENESS != CORRECTION_LINEAGE
A globally unique correction ID helps identity but does not by itself prove which resource/attempt it corrects.
Stronger contract: correction_id -> original_operation/resource_lineage -> provider_scope.

DISPOSITION
No new top-level interaction class frozen.
Absorbed by I18 + I19 + I21, with class 12 for unresolved reconciliation and class 11 where external-effect knowledge is ambiguous.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Semantic freeze NOT DECLARED.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Nexo runtime race NOT EXECUTED.
V21 FORBIDDEN.

CANDIDATE INVARIANTS
INV-TE-46: Correction identity must include or resolve its authoritative scope.
INV-TE-47: Correction identity alone must not substitute for original-operation/resource lineage.
INV-TE-48: A correction referencing unknown or mismatched lineage must not mutate current state solely by identifier equality.
INV-TE-49: Provider-global uniqueness, when contractually guaranteed, is evidence about identity scope, not proof of lifecycle ordering.
INV-TE-50: Region/domain scope must remain explicit when interpreting correction identifiers.

NEXT
AB104.873R — correction/reversal identifier collision or reuse across provider failover/restart/incarnation boundaries: investigate whether restart can cause identifier reuse, whether provider guarantees monotonic/global uniqueness, and whether a reused correction identifier plus delayed old correction creates anything beyond I18 + I19 + I21 + I17.

CONSTRAINTS
NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED
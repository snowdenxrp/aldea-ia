AB104.869R — local vs provider idempotency horizon audit

Date: 2026-09-29
Parent: AB104.868R
Mode: research/audit only

QUESTION
Can disagreement between local and provider idempotency retention horizons create an independent interaction?

FRESH EVIDENCE
1. Adyen documents provider-side idempotency keys as company-account scoped, valid 7–14 days, and not deduplicated across multiple regional endpoints. This establishes explicit scope and finite provider-side retention. Source: Adyen API idempotency documentation.
2. An open-source provider integration gateway documents a separate gateway idempotency layer using tenant-plus-key uniqueness and durable records, while mapping logical keys to provider-native deduplication. This demonstrates two independent deduplication domains.
3. The same gateway distinguishes in-progress, successful replay, provider timeout, and reconciliation-required states, reinforcing separation of deduplication from external-effect knowledge.
4. Current engineering guidance warns that retention windows must be checked against maximum retry/redelivery windows.

ATTACK REDUCTION
A. Local remembers, provider forgets: local suppresses retry. I15 at local layer; provider expiry is only a parameter.
B. Local forgets, provider remembers: provider replays prior result. I15 + I22.
C. Both forget: retry may execute again. If original effect committed: class 11 + I15 + I22. Correction adds I19. New incarnation adds I18. Freshness uncertainty adds I21. Reconciliation adds class 12.
D. Different scope: local tenant scope and provider account/region scope differ. This is identity/scope: I18 + I15/I22.
E. Local dedup says duplicate while provider outcome is unknown: duplicate knowledge does not equal effect knowledge.
F. Provider dedup says duplicate while local history is absent: provider evidence may support reconciliation but does not recreate missing local history. I15 + class 11 + class 12.

KEY CONCLUSION
A mismatch between local and provider idempotency horizons is a cross-domain composition, not a new top-level semantic class.

Model the domains independently:
LocalIdempotency = scope + key + payload binding + retention + state.
ProviderIdempotency = scope + key + payload binding + retention + state.
ExternalEffect = effect identity + outcome knowledge.
Reconciliation = authoritative evidence + freshness + lineage.

Important refinement: DUPLICATE_KNOWN is not equivalent to EFFECT_KNOWN. PROVIDER_DEDUP_KNOWN is not equivalent to LOCAL_HISTORY_KNOWN. A local duplicate decision can prevent a new attempt without proving the original external outcome. Provider replay can prove provider-side recorded state without proving every downstream settlement state.

DISPOSITION
Provider/local idempotency-horizon mismatch is absorbed by I15 + I18 + I19 + I22 + class 11 + class 12 as applicable.
No new top-level interaction class frozen.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Semantic freeze NOT DECLARED.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Nexo runtime race NOT EXECUTED.
V21 FORBIDDEN.

CANDIDATE INVARIANTS
INV-TE-32: Local and provider idempotency state must be represented as separate evidence domains.
INV-TE-33: A local duplicate decision must not be treated as authoritative proof of external-effect outcome.
INV-TE-34: Provider-side duplicate/replay evidence must not be treated as proof that local historical state is complete.
INV-TE-35: Retention and scope must be evaluated independently at every external boundary; one layer's retention cannot be assumed to imply another's.
INV-TE-36: If local and provider idempotency domains disagree, preserve the disagreement as evidence rather than silently selecting one as globally authoritative.
Candidates only; not formally verified.

NEXT: AB104.870R — local/provider idempotency mismatch + provider regional failover. E1 processed in R1; provider idempotency exists in R1 but not R2; local dedup survives; failover routes retry to R2; correction/reversal and reconciliation may follow. Question: independent interaction or I15 + I18 + I19 + I21 + I22 + class 11 + class 12?

Constraints: NEXO_IMPLEMENTED=NO; RUNTIME_TEST_EXECUTED=NO; FORMAL_VERIFICATION=NO; V21=FORBIDDEN; SEMANTIC_FREEZE=NOT_DECLARED.
# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.253

Research: docs/nexo/NEXO_AB104_253_AUTHORITY_GENERATION_REVOCATION_FENCING_DELAYED_REPLAY_V1_2026-09-26.md
Commit: 3aef87ddd85268b0305871f83d977451007b7ace

Core: authority generation is an authenticated transition with lineage, not merely a larger integer. Higher generation can fence old permissions without erasing historical records. Candidate transition binds predecessor/successor roots/configuration, epochs, predecessor digest, policy, effective boundary, freshness, signer/threshold evidence and incarnation scope.

Revocation changes current admissibility, not historical truth. Delayed/replayed messages can remain cryptographically authentic but be STALE/FENCED. Therefore AUTHENTIC != CURRENTLY_AUTHORIZED and SIGNED_EVIDENCE != FRESH_EVIDENCE.

RATS RFC 9334 provides relevant freshness mechanisms (timestamps, nonces, epoch IDs) and discusses epoch transition races and epoch windows to avoid false stale classifications. TUF provides rollback/freeze/key-compromise analogues and scoped renewable trust. citeturn0search0turn0search2

Root rotation candidate: authenticate transition -> bind predecessor/successor -> persist fence/transition -> establish effective epoch -> reject below-fence execution -> retain old evidence. This is research, not selected architecture.

Emergency revocation should create explicit fence/generation evidence rather than delete old credentials/history. Revocation cannot convert an already committed external effect into historical NOT_COMMITTED.

Transition crash: successor authority cannot be assumed from partial local state; target-side fence is required at external effect boundary; restore to pre-transition state must be blocked by anti-rollback.

Code search did not surface operation-registry implementation; not evidence of absence. No implementation.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints preserved: research/study only; no V21; preserve UNKNOWN/PENDING/contradictions.

Exact next: AB104.254 — target-side fencing during authority transition: stale worker rejection at actual effect boundary, fence token/resource version binding, in-flight operations, lease expiry, and crash ordering between authority transition and external effect.
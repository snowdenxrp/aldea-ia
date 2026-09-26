# NEXO CONTINUITY CHECKPOINT — AB104.255 — 2026-09-26

Canonical chain: AB104.243 → AB104.244 → AB104.245 → AB104.246 → AB104.247 → AB104.248 → AB104.249 → AB104.250 → AB104.251 → AB104.252 → AB104.253 → AB104.254 → AB104.255

AB104.255: research-only study of crash ordering between authority/fence transition, target effect acceptance, operation registry, and recovery.

Key findings:
- Local authority transition durability does not prove target-side fence enforcement.
- Target acceptance can precede coordinator observation/persistence.
- Registry ACCEPTED is not automatically COMMITTED.
- Mutation committed with registry loss must remain recoverable through authoritative target evidence.
- If commit and non-commit executions remain observationally indistinguishable, recovery must remain UNKNOWN.
- Candidate target atomic boundary may combine fence, target incarnation, expected resource version, operation identity/fingerprint, mutation, and receipt.
- No architecture choice or implementation was made.

Direct code evidence checked: src/nexo/effect-adapter.js, src/nexo/runtime.js, src/nexo/orchestrator.js. Prepared intent is not proof of non-occurrence; prepared recovery requires reconciliation; handler exception returns EFFECT_OUTCOME_UNKNOWN without persist(); runtime records execution/outcome after adapter result; completed mission steps require verified evidence. Prototype evidence only.

Mandatory AB50–AB58 residuals remain unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED. AB55 was only 64 states × 6 total orders = 384 per attack, 8 attacks; it did not fully cover UsedAdmissionContext/EventDAG/FutureObs_PAA. AB56 did not close FutureObs_PAA.

Global constraints: research/study only; no V21; no patching historical prototype as architecture; no silent overwrite/delete; preserve UNKNOWN/PENDING/CONFLICT; never claim security/correctness/formal verification/fault-injection success without evidence.

Exact next mission AB104.256:
1. crash after target acceptance but before authoritative receipt;
2. crash after receipt but before local persistence;
3. target restore/rollback during UNKNOWN;
4. operation-registry reconciliation across target incarnation changes;
5. whether one target-side commit record can safely serve as effect-finality evidence and idempotency source;
6. adversarial interleavings and minimum evidence for COMMITTED, NOT_COMMITTED, PARTIAL, UNKNOWN, UNKNOWN_PERMANENT.

Do not skip direct code inspection where available.

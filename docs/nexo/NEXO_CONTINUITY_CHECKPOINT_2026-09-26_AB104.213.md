# NEXO CONTINUITY CHECKPOINT — AB104.213 — 2026-09-26

## Canonical chain
AB104.212 -> AB104.213

## AB104.213 persisted research
Research file:
docs/nexo/NEXO_AB104_213_NEGATIVE_EVIDENCE_CLAIM_DECISION_EFFECT_CONTRACT_V1_2026-09-26.md

Current research commit for AB104.213:
1a46f710ce216beb69370838527c95331e7ebb3c (verified by fetch)

## What was established
1. “NOT_PROCESSED” is only authoritative when the protocol/target guarantees non-processing at the exact relevant boundary.
2. Timeout, reset, lost response, missing local receipt, or current-state absence are not automatically NOT_COMMITTED.
3. RFC 9113 HTTP/2 gives concrete examples of protocol-level negative guarantees: applicable GOAWAY and REFUSED_STREAM. Such guarantees are boundary-specific and must not be generalized to target commit without mapping.
4. Claim Contract = what evidence asserts and its scope/binding.
5. Decision Contract = which operational conclusion is admissible from the claims.
6. Effect Contract = actual target semantics: identity, acceptance/commit boundary, idempotency, retention, receipts/lookups, negative evidence, restore/rollback, partial effects, fencing.
7. Current repository structural inspection found real effect/recovery code; earlier broad “no implementation evidence” language was too strong.
8. Current code inspected: src/nexo/effect-adapter.js, src/nexo/runtime.js, src/nexo/orchestrator.js and related Nexo tests.
9. Current effect-adapter behavior includes prepared-intent journaling, reconciliation before retrying prepared entries, EFFECT_OUTCOME_UNKNOWN on handler exceptions, and cached result reuse by idempotencyKey.
10. These tests/code observations are evidence about the current prototype, not proof of the future clean architecture or formal correctness.

## Critical distinction
A) adapter does not execute twice
B) external effect never happened
C) Nexo has sufficient evidence to classify NOT_COMMITTED

A does not imply B. B requires boundary evidence. C requires an explicit Claim/Decision/Effect mapping.

## UNKNOWN/PENDING
- exact external effect boundary of current implementation;
- target incarnation/authority/receipt representation;
- complete NOT_COMMITTED proof path;
- full partial/streaming representation;
- formal verification;
- implementation completeness.

## AB50 -> AB58 residuals — DO NOT DROP
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

## Constraints
- Research first; do not implement architecture yet.
- No V21.
- Do not patch the historical prototype into the final Nexo architecture.
- Do not overwrite/delete evidence silently.
- Do not claim formal verification, security, CI, fault-injection, or completeness without direct evidence.
- Preserve UNKNOWN/PENDING and contradictions.

## Exact next mission — AB104.214
Trace the current effect path end-to-end in actual code:
orchestrator -> runtime -> effect-adapter -> simulation-adapter -> persistence/memory -> recovery.

For every boundary record:
- durable vs in-memory state;
- exact evidence produced;
- operation/idempotency identity;
- where UNKNOWN can be lost or converted into failed/completed;
- whether recovery can re-execute an effect;
- crash/interleaving test coverage and missing cases.

Then continue adversarial research before any architecture design.

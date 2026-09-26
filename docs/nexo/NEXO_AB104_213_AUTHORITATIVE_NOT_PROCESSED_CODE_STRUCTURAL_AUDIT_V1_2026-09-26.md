# NEXO AB104.213 — AUTHORITATIVE NOT-PROCESSED GUARANTEES + CODE STRUCTURAL AUDIT — V1 — 2026-09-26

## Status
Research/audit only. No architecture construction, no V21, no formal verification claim.

## External protocol result
RFC 9113 provides a concrete example of authoritative negative evidence: HTTP/2 REFUSED_STREAM means the stream was refused before application processing, and GOAWAY identifies a highest stream number that might have been processed. The specification requires a server to make the "not processed" indication only when it can guarantee that fact. This is materially stronger than timeout, connection loss, or missing response.
RFC 9110 similarly says non-idempotent requests should not be automatically retried unless the client can know the original was not applied or otherwise establish idempotent semantics.

## Nexo contract mapping
Research distinction:
- Claim Contract: what evidence says happened, including issuer, scope, identity, fingerprint, freshness, and confidence/verification.
- Decision Contract: whether that evidence is sufficient to authorize a state transition/retry/recovery action.
- Effect Contract: what the external target guarantees about acceptance, processing, commitment, deduplication, negative results, retention, and restore/rollback.

A transport-level "not processed" guarantee can support a Claim of NOT_PROCESSED only within its exact protocol scope. It does not automatically prove that a downstream intermediary or later asynchronous processor did nothing unless the protocol boundary includes that processing.

Therefore:
NOT_PROCESSED is not synonymous with NOT_COMMITTED globally. It is a boundary-scoped claim that may justify retry only if the Effect Contract says no externally relevant effect crossed the protected boundary.

## Structural repository audit
The prior exact keyword searches were misleadingly sparse. A recursive repository tree inspection found concrete Nexo implementation and test surfaces:
- src/nexo/effect-adapter.js
- src/nexo/orchestrator.js
- src/nexo/runtime.js
- tests/nexo/effect-adapter.test.mjs
- tests/nexo/effect-intent-persistence.test.mjs
- tests/nexo/restart-reconstruction.test.mjs
- tests/nexo/persistence-lock-worker.mjs
- tests/nexo/runtime-concurrency.test.mjs
- tests/nexo/simulation-restart-persistence.test.mjs

This corrects the earlier statement: the repository DOES contain concrete effect/idempotency/recovery-related implementation. The previous keyword-only code-search surface failed to find it; that was a search limitation, not repository absence.

## Actual code observations
1. src/nexo/effect-adapter.js records a prepared intent before invoking the handler when an execution journal is supplied.
2. A journal entry with status "prepared" is reconciled before a handler can run again. Without a reconcile function it returns EFFECT_RECONCILIATION_REQUIRED and does not invoke the handler. This directly embodies the research rule "prepared/intent is not permission to repeat."
3. A cached result for the same idempotencyKey is returned without re-execution.
4. Handler exceptions produce EFFECT_OUTCOME_UNKNOWN with uncertainty "effect_may_or_may_not_have_occurred"; the source comment correctly says recovery must reconcile before retry.
5. Postconditions are required for a verified completed result; otherwise the effect is failed/unverified.
6. runtime.js uses idempotencyKey = missionId:stepId and commits mission outcome separately through memory reconstruction/recording.
7. tests/nexo/restart-reconstruction.test.mjs explicitly distinguishes an execution-only record from a durable mission outcome: execution-only does NOT reconstruct a step as completed. This is strong evidence for the CommitRecord/effect-result vs authoritative mission-outcome distinction.
8. tests/nexo/effect-adapter.test.mjs contains a prepared-journal recovery test: a prepared entry blocks and does not call the handler until reconciliation returns a verified completed result.
9. IMPORTANT AUDIT DISCREPANCY: effect-adapter.test.mjs expects that when a handler throws, exceptionJournal[0] becomes status "blocked" with result.code "EFFECT_OUTCOME_UNKNOWN". The actual effect-adapter.js catch block constructs that result but returns it WITHOUT calling persist(idempotencyKey,result). Therefore, on the inspected main source, that journal mutation is not performed by the catch block. This is a concrete source/test semantic mismatch requiring investigation; it is NOT being silently repaired in research phase.
10. A second observed semantic boundary: execute() serializes access through a shared queue per executionJournal and coalesces same-key in-flight calls. This is local concurrency control, not proof of external fencing.
11. The implementation's idempotencyKey is missionId:stepId. This may be sufficient for the current local mission model, but research has already shown that external identity may need target scope/incarnation and payload fingerprint. No claim that current key is sufficient for future Nexo architecture.

## What this changes
The research phase now has actual implementation evidence. We must stop saying "no effect/idempotency code exists." The accurate statement is:
- concrete local effect/recovery code exists;
- its semantics partially embody the research rules;
- the current code is not the clean future architecture;
- at least one source/test mismatch is visible;
- external proof, trust-root continuity, target-authoritative reconciliation, and formal verification remain unresolved.

## Residuals unchanged
TERNARY_MATH_GAP=FOUND
TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION=UNKNOWN
EVENTDAG_CLOSURE=PARTIAL
RECONSTRUCTION=BOUNDED_ONLY
SEMANTIC_FREEZE=NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED

## DO-NOT-REPEAT
Do not claim repository-wide absence based on failed keyword search. Do not claim the source/test mismatch is fixed. Do not equate HTTP/2 stream-not-processed with global target non-commit. Do not equate local idempotency/coalescing with external fencing. Do not claim tests pass unless actually executed and evidenced. No V21. No architecture implementation.

## Exact next action — AB104.214
Audit the concrete effect-adapter/restart-reconstruction semantics against AB104.197–AB104.213: prepared intent, exception UNKNOWN, persistence ordering, same-key concurrency, stale outcome reconstruction, partial effects, and external reconciliation. Determine which current behaviors are recovered evidence, which are local conveniences, and which are semantic gaps. Then inspect remaining runtime/memory paths.

# NEXO AB104.247 — UNKNOWN ORIGINAL EFFECT AND CONDITIONAL COMPENSATION POLICY V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
When the original external effect is UNKNOWN, there is no universally safe compensate-now operation. The system needs an explicit compensation policy stating what uncertainty it accepts and how late resolution changes the resulting state.

## Outcome lattice
Original O may be NOT_COMMITTED, COMMITTED, PARTIAL, UNKNOWN, or UNKNOWN_PERMANENT. These are not interchangeable. Compensation policy must declare which states permit which compensating effects.

## Three policy families
1. RECONCILE_FIRST: resolve O from target evidence before compensation. Strong when authoritative target state exists, but may reduce liveness.
2. CONDITIONAL_COMPENSATION: target atomically accepts compensation only if a predicate about O is true, such as committed + matching fingerprint/version. Requires target-side semantics; local pre-check followed by send is not atomic.
3. HEDGE/ESCROW: hold the affected resource in an intermediate non-final state while O remains UNKNOWN, blocking irreversible downstream decisions until resolution. Safety may improve at cost of liveness.
No family is selected as Nexo architecture.

## Why blind compensation fails
If O is UNKNOWN, it may be absent, committed, partial, or permanently unresolved. A normal inverse can therefore create an unintended opposite effect, compensate incompletely, or diverge after late resolution. UNKNOWN -> COMPENSATE is not universally valid.

## Conditional target boundary
Candidate target-side atomic acceptance binds original operation identity/fingerprint, current target incarnation, authority/fence, expected target condition, and compensation identity/fingerprint inside one acceptance decision. A local read followed by a later write is vulnerable to state changes between them.

## Late resolution
If O later resolves after compensation: NOT_COMMITTED may require compensating the compensation; COMMITTED may yield the intended final pair; PARTIAL requires child-level reconciliation; UNKNOWN remains explicit. Late resolution appends evidence/state transitions and does not rewrite original history.

## Divergence control
Every compensating effect needs stable identity and fingerprint. Retries preserve identity where target semantics provide idempotency. Transactional outbox research notes relay crashes can cause duplicate publication, requiring idempotent consumers. TUF separates role authority, freshness and coherent snapshot state.

## Candidate decision rule
ALLOW_COMPENSATION only when: contract permits the original outcome class; original identity/fingerprint are bound; target incarnation is current; authority/fence is current; target acceptance semantics are sufficient; compensation identity is stable; and late-resolution reconciliation exists.
Otherwise BLOCK, RECONCILE_FIRST, or UNKNOWN according to explicit policy.

## Code boundary
No implementation added. Earlier direct prototype findings remain evidence only; they do not demonstrate target-side conditional compensation, distributed fencing, or authoritative late-resolution semantics.

## AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.

## DO-NOT-REPEAT
UNKNOWN != NOT_COMMITTED; UNKNOWN != COMMITTED; blind compensation != safe compensation; client pre-check + later write != atomic conditional compensation; compensation != deletion; late resolution != history rewrite; idempotency key alone != target fencing; no V21; no architecture implementation; no unsupported verification claims.

## Exact next mission
AB104.248: target-side conditional compensation semantics and atomic compare-and-compensate — CAS predicates, operation registry binding, stale target state, partial effects, receipt semantics and recovery after target restart.
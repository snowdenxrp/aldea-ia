# NEXO AB104.868R — committed external effect + lost ACK + expired idempotency + correction/reversal audit

Date: 2026-09-29
Parent: AB104.867R
Mode: research/audit only

## Question

Can:
correction/reversal + migration + retry + expired idempotency + already-committed external effect + lost acknowledgement
create a distinct interaction class?

## Fresh evidence

### 1. Adyen: successful refund validation is not terminal effect knowledge

Adyen documents that a REFUND webhook with success=true means validations succeeded and the refund request was sent to the card scheme, but the refund can later fail or be reversed. REFUND_FAILED can arrive days later, and REFUNDED_REVERSED represents a later reversal. This is direct provider evidence that an apparently successful prior stage is not equivalent to immutable final effect knowledge.

### 2. Adyen: correction/reversal has separate identities

For reversal/refund, Adyen distinguishes the original payment reference from the reversal/refund PSP reference. The reversal request itself receives a unique PSP reference and its outcome is asynchronous. This supports binding corrections to operation/resource lineage rather than treating one identifier as the entire event identity.

### 3. Executable cross-check

The XT-Aegis repository contains a concrete side-effect contract in which a committed operation returns a stored receipt, while a lost acknowledgement becomes UNKNOWN and is explicitly not retried. Its idempotency key binds subject, target resource, policy version, logical operation id and canonical arguments.

This is implementation evidence from one system, not universal proof. It is useful because it explicitly separates committed-effect knowledge from acknowledgement knowledge.

## Attack decomposition

Timeline:

1. E1 correction/reversal submitted before migration.
2. External effect commits.
3. ACK is lost.
4. Migration cutover occurs.
5. Idempotency record expires or is unavailable.
6. Retry(E1) arrives through the new route.
7. Current resource may have a newer incarnation/ownership.
8. Reconciliation runs.

### A. Effect already committed + ACK lost

This is class 11 external-effect ambiguity.

The correct epistemic state after lost ACK is UNKNOWN unless authoritative evidence establishes the effect.

Idempotency expiry does not convert UNKNOWN into FAILED.

Reduction:
class 11 + I15 + I22.

### B. Retry after expiry causes a second external effect

If the receiver no longer recognizes E1 and the provider permits a second execution, the duplicate execution is a consequence of I15/I22 combined with the external-effect boundary.

It does not create a new semantic class.

The dangerous property is multiplicity of committed effects under one logical operation, which is already represented by duplicate/retry + external-effect ambiguity.

### C. Correction/reversal after the original effect

If the correction itself becomes a committed external effect, its lineage and relationship to the original effect must be explicit.

Reduction:
I19 + class 11, plus I15/I22 when retention/retry participates.

Adyen's model of originalReference plus a separate PSP reference for the reversal is concrete support for this distinction.

### D. Migration/new incarnation

If the retry reaches a new incarnation:
I18 + I15 + I19 + I22.
If freshness/order is uncertain:
+ I21.
If reconciliation participates:
+ class 12.

### E. Reconciliation discovers the first effect

If reconciliation proves the original external effect committed, the system can transition from UNKNOWN to authoritative knowledge.

If reconciliation instead cannot distinguish the first effect from the retry, the state remains UNKNOWN/INCOMPARABLE according to the evidence model.

Reconciliation is not itself a new effect oracle; it is an evidence/recovery mechanism.

## Key distinction

The combined attack crosses two independent boundaries:

1. **knowledge boundary:** did the external effect commit?
2. **identity/retention boundary:** is the retry recognized as the same logical operation?

These are orthogonal.

Therefore:
- idempotency does not prove effect absence;
- ACK does not prove effect absence;
- expiry does not prove effect absence;
- migration does not create a new operation identity;
- reconciliation evidence can change knowledge but must not rewrite historical effect identity.

## Does this create a new class?

No.

The combined scenario reduces to:

**I15 + I19 + I22 + class 11 + class 12**

with **I18/I21** added when incarnation/ownership or freshness/order participates.

The attack is more dangerous as a composition because it can produce a second external effect after the first effect is already committed, but the semantic dimensions are already represented by existing classes.

## Important epistemic rule

A useful canonical transition is:

ACK_LOST -> UNKNOWN

not:

ACK_LOST -> FAILED

and:

IDEMPOTENCY_EXPIRED + RETRY

does not imply:

ORIGINAL_EFFECT_ABSENT

Only authoritative provider/resource evidence can move UNKNOWN to a known terminal effect state.

## Disposition

RESULT:
No new top-level interaction class.

W19/W20 remain NOT FROZEN.
Coverage denominator remains NOT FROZEN.
Semantic freeze remains NOT DECLARED.
Formal verification remains NOT PERFORMED.
Implementation remains NOT STARTED.
Nexo runtime race remains NOT EXECUTED.
V21 remains FORBIDDEN.

## Candidate invariants

INV-TE-27:
Loss of acknowledgement must preserve UNKNOWN unless authoritative evidence establishes external-effect outcome.

INV-TE-28:
Idempotency expiry must never be interpreted as evidence that the original external effect did not commit.

INV-TE-29:
A correction/reversal must remain lineage-bound to the original operation/resource even when its own idempotency record expires.

INV-TE-30:
Reconciliation may upgrade epistemic knowledge, but must not silently rewrite historical operation identity or committed-effect history.

INV-TE-31:
A retry after expiry that may duplicate an external effect must be represented as a new attempt linked to the original logical operation, not silently merged as if it were proof of the original outcome.

Candidates only; not formally verified.

## Exact next action: AB104.869R

Investigate:
correction/reversal + migration + expired idempotency + committed original effect + retry + provider-side deduplication that is itself scoped/expired differently from the local deduplication layer.

Question:
Can disagreement between local and provider idempotency horizons create an independent cross-domain interaction, or does it reduce to I15 + I18 + I19 + I22 + class 11 + class 12?

Constraints:
NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED

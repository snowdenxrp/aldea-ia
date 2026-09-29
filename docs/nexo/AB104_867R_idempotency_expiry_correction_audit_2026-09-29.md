# NEXO AB104.867R — correction/reversal + migration + retry + idempotency expiry audit

Date: 2026-09-29
Parent: AB104.866R
Mode: research/audit only

## Question

E1 occurs before cutover. The old route processes E1. Cutover occurs. The deduplication/idempotency record expires or becomes unavailable. E1 is retried. The current resource has a new incarnation or ownership. Reconciliation runs.

Does retention expiry create a genuinely independent interaction, or is it absorbed by I15 + I18 + I19 + I21 + class 12?

## Fresh evidence

### 1. IETF idempotency-key draft

The current IETF HTTPAPI idempotency-key draft explicitly permits time-based key expiry and requires the resource owner to define the expiration policy. It also states that an idempotency key must not be reused with a different payload and permits an idempotency fingerprint.

This makes expiry a real protocol dimension rather than an implementation accident.

### 2. Stripe

Stripe documents that idempotency keys can be automatically removed after at least 24 hours. If a key is reused after pruning, Stripe treats it as a new request. Stripe also compares parameters to prevent accidental reuse with a different request while the original key is retained.

Therefore, retention expiry can turn a retry into a newly executed request under a documented provider contract.

### 3. Adyen

Adyen documents idempotency keys as account-scoped and valid for 7–14 days. It also states that idempotency depends on a consistent stateful store and that simultaneous duplicate requests can produce a transient conflict/retry path.

This shows that retention window and scope are explicit provider semantics.

### 4. Webhook evidence

Exodus documents at-least-once webhook delivery with stable event IDs across retries. Contio explicitly recommends retaining deduplication keys for at least the replay tolerance plus retry horizon. Nylas documents duplicate delivery and recommends carrying the notification-derived idempotency key into downstream systems when the side effect is external.

These sources independently reinforce that duplicate/replay protection has a retention horizon and that external side effects need a second idempotency boundary.

## Attack decomposition

### A. Expiry causes retry to be processed again

E1 processed before expiry.
Dedup key expires.
Retry(E1) arrives.

Semantic effect:
- retry/duplicate identity: I22;
- retention expiry: I15;
- if the second processing causes another external effect: class 11;
- if reconciliation repairs/compares state: class 12.

No new primitive beyond I15 + I22.

### B. Expiry + new incarnation

E1 belongs to resource R1.
R1 is replaced by R2.
The key expires.
Retry(E1) arrives for current resource identifier.

Now:
I15 retention expiry
+ I18 lineage/incarnation
+ I19 correction/reversal
+ I21 freshness/order
+ I22 retry

The expiry is an enabling condition, not an independent semantic transition.

### C. Expiry + migration

Old route retains E1 key; new route does not.
After cutover, retry reaches new route.

This is:
I15 + I18 + I22.
If E1 is correction: + I19.
If stale ordering matters: + I21.

Still no new class.

### D. Expiry + changed payload

Same key is reused with different parameters after expiry.

The IETF draft explicitly treats key reuse with a different payload as invalid for the same idempotent operation, and Stripe documents parameter comparison while the key is retained.

This is not a new class because the core issue is operation/payload binding plus retention:
I2 payload-binding conflict + I15 idempotency retention/reuse.

### E. Expiry + authority change

E1 was authorized under authority generation G1.
Key expires.
Retry occurs under G2.

Idempotency does not prove authorization under G2.
This reduces to:
I15 + I22 + authority-generation/fencing class 9.
If the operation is a correction/reversal, add I19.

This reinforces the separation between deduplication and authority.

### F. Expiry + UNKNOWN external effect

Original E1 may have produced an external effect whose acknowledgement was lost.
The dedup record expires.
A retry is issued.

This is:
I15 + I22 + class 11 external-effect ambiguity.
If reconciliation occurs: + class 12.

The retry cannot infer that the original effect failed merely because the dedup record expired.

## Important result

Retention expiry is a temporal policy over the deduplication identity. It changes whether a later retry is recognized as the same operation, but it does not create a new semantic effect category.

Therefore:

**I15 remains the correct top-level retention/reuse class.**

No new top-level interaction class is justified by this combination.

## Critical contract boundary

Expiry policy MUST NOT be silently treated as universal.

Examples differ:
- IETF: expiry policy is resource-defined.
- Stripe: automatic pruning after at least 24 hours; reuse after pruning can create a new request.
- Adyen: 7–14 day validity and account scope.
- Contio: recommended retention tied to replay/retry horizon.

Thus Nexo must model retention as a contract parameter, not a universal constant.

## Epistemic boundary

Confirmed:
- expiry is an explicit idempotency dimension;
- real providers document finite retention;
- expiry can make a later retry eligible for new execution;
- payload binding and authority remain separate concerns.

Not confirmed:
- universal provider semantics;
- any Nexo implementation behavior;
- a production Nexo race;
- formal completeness of I15.

## Disposition

RESULT:
**Idempotency-key expiry/retention loss does not create a new top-level interaction. It is I15 + I22, with I18/I19/I21/class 9/class 11/class 12 added according to the attack dimensions.**

No W19/W20 freeze.
No coverage denominator freeze.
No semantic freeze.
No formal verification.
No implementation.
No Nexo runtime race executed.

## Candidate invariants

INV-TE-23:
Idempotency retention is a declared contract parameter; expiry must not be assumed absent or infinite.

INV-TE-24:
A retry after expiry must be evaluated as potentially executable again; expiry is not evidence that the original effect failed.

INV-TE-25:
Idempotency identity must remain bound to its declared scope and operation/payload contract across migration and authority changes.

INV-TE-26:
Expiry/reuse of a deduplication key must never be treated as proof of external-effect absence.

Candidates only; not formally verified.

## Exact next action: AB104.868R

Investigate:
correction/reversal + migration + retry + expired idempotency + external effect already committed but acknowledgement lost.

Question:
Can the combined attack be reduced to I15 + I19 + I22 + class 11 + class 12, or does committed-effect correction after retention expiry create a distinct interaction?

Constraints:
NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED

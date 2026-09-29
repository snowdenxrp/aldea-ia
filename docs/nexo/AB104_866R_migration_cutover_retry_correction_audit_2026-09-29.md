# NEXO AB104.866R — correction/reversal + migration cutover + duplicate/retry audit

Date: 2026-09-29
Parent: AB104.865R
Mode: research/audit only

## Question

An event E is produced before migration cutover. Delivery fails. A retry occurs after cutover. The same logical event may reach the old and new routes, while reconciliation runs concurrently.

Does retry/duplicate delivery create an independent interaction beyond I18 + I19 + I21 + I22/I23?

## Fresh evidence

### 1. Live webhook migration: retry tail survives cutover

A current 2026 migration playbook describes the concrete failure mode: an event acknowledged by the old receiver can be retried after cutover and reach the new receiver. If old and new receivers do not share durable idempotency state, the new receiver can process the same logical event again.

This is direct evidence for the migration/retry interaction, but it decomposes into identity/deduplication plus migration boundary. It does not by itself establish a new semantic top-level class.

Source: Webhook Migration Without Dropping Events, Aug 10 2026.

### 2. Multitenant executable example

The KamerrEzz/ledgr repository provides executable examples for both tenant isolation and webhook deduplication. Its webhook test sends the same webhook twice with the same webhook ID and expects the second delivery to be reported as duplicate; its tenant examples use an explicit tenant identifier and row-level isolation.

This independently demonstrates that tenant scope and event deduplication are separate dimensions that must both be preserved.

### 3. Cross-check: duplicate delivery is not necessarily duplicate business event

Webhook guidance distinguishes:
- same logical event delivered multiple times;
- distinct events with similar payloads;
- delivery attempt identity;
- stable event identity.

A stable event/delivery key must be scoped correctly; where IDs are not globally unique, provider/tenant scope belongs in the deduplication key.

This matters during cutover because an old receiver and new receiver must agree on the same identity contract. A fresh local dedup store in the new receiver can otherwise treat an old event as new.

## Attack decomposition

### A. E before cutover, retry after cutover

E = event for (tenant A, resource X, lineage L, event_id E1)
cutover A_old -> A_new
retry(E1) arrives at new route.

If the new route shares the authoritative event identity/dedup state:
- retry is duplicate;
- no new business transition.

Reduction: I22/I23 + migration boundary.

### B. E reaches both old and new routes

Both routes process E1.

If the event identity is globally stable or correctly scoped:
- both observations refer to one logical event;
- duplicate delivery collapses to I22/I23.

If each route uses local identity:
- same E1 can be admitted twice;
- the failure is an identity/namespace boundary error (I18) plus duplicate delivery.

No new primitive appears.

### C. Retry after cutover but resource changed

Suppose E1 is a correction for R1 before cutover, and after cutover the current resource is R2 or has a newer incarnation.

Then the retry needs:
- event identity;
- resource lineage/incarnation;
- freshness/order;
- correction semantics.

Reduction: I18 + I19 + I21 + I22.

The duplicate aspect does not erase the stale/correction problem, and the correction aspect does not create a new class merely because delivery is duplicated.

### D. Reconciliation concurrent with retry

Reconciliation may independently observe the authoritative provider state while E1 is being retried.

Possible outcomes:
1. reconciliation confirms E1's effect;
2. reconciliation establishes a newer state;
3. evidence remains incomparable;
4. reconciliation cannot establish ownership/lineage.

These map to class 12 + I21/I18/I19. Duplicate retry remains I22/I23.

### E. Old and new routes disagree about idempotency retention

If old route remembers E1 but new route has lost the dedup record, the same logical event may be admitted twice.

This is the important migration-specific failure mode, but semantically it remains:
- I22 idempotency/retry retention;
- I18 identity/scope;
- class 12 reconciliation if repair is needed.

It does not justify a new top-level class.

## Important distinction

Migration cutover changes where an event is processed.
It does not automatically change what event the event is.

Therefore:
- routing identity != event identity;
- receiver incarnation != event incarnation;
- endpoint identity != resource identity;
- dedup key != authorization/ownership proof.

The dedup key must not be treated as a substitute for lineage or authority.

## Stronger evidence from current engineering guidance

A current 2026 webhook migration guide explicitly recommends shared idempotency state across old/new receivers and retaining the old receiver through the retry horizon. This is evidence that cutover creates a retry tail and that local dedup state is insufficient.

A separate executable repository example combines tenant isolation with webhook deduplication, supporting the separation of scope and event identity.

Neither source proves universal behavior for every provider.

## Disposition

RESULT:
Retry/duplicate delivery after migration cutover reduces to existing dimensions: I18 + I19 + I21 + I22/I23 + reconciliation class 12 where applicable.

No new top-level interaction class frozen.

No W19/W20 freeze.
No coverage denominator freeze.
No semantic freeze.
No formal verification.
No implementation.
No Nexo runtime race executed.

## Candidate invariants

INV-TE-19:
Migration cutover must not create a new event identity for a retry of an existing logical event.

INV-TE-20:
Old and new processing routes must share or provably reconcile the same event identity/deduplication domain across the retry horizon.

INV-TE-21:
A duplicate-delivery decision must not substitute for resource lineage, tenant ownership, authority, or freshness validation.

INV-TE-22:
If deduplication state is unavailable or inconsistent across migration boundaries, the system must not infer that a retry is a new authoritative event solely because it arrived through a new route.

Candidates only; not formally verified.

## Exact next action: AB104.867R

Investigate a harder combination:

correction/reversal + migration + retry + idempotency-key expiry/retention loss

Scenario:
- E1 occurs before cutover;
- old route processes E1;
- cutover occurs;
- dedup state expires or is unavailable;
- E1 is retried;
- current resource has a new incarnation or ownership;
- reconciliation runs.

Question:
Does retention expiry add a genuinely independent interaction, or is it fully absorbed by I15 (idempotency retention/reuse) + I18 + I19 + I21 + class 12?

Constraints:
NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED

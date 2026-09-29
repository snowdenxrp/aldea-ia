# NEXO AB104.864R — correction/reversal + identity/incarnation reuse audit

Date: 2026-09-29
Parent: AB104.863R
Mode: research/audit only

## Question
Does I18 namespace/incarnation confusion + I19 correction/reversal fully cover:
old correction event -> resource recreation -> reused/same identifier -> reconciliation,
or does a distinct cross-domain interaction survive reduction?

## Fresh external/code evidence

### 1. Adyen resource identity
Adyen transfer webhooks use a stable resource `data.id` to track the original transfer, while webhook `sequenceNumber` is per transfer and increases for each webhook. The sequence number exists specifically to restore event order when deliveries arrive out of order.

This supports a critical separation:
- resource identity;
- event identity/order;
- lifecycle state.

A correction event therefore cannot safely be matched only by a mutable local status or arrival time.

### 2. Adyen correction references
Adyen's cancel/refund flow explicitly carries `originalReference` for the original payment and a separate `pspReference` for the reversal. This is concrete evidence that correction/reversal can have a distinct operation/reference identity while remaining causally attached to an earlier resource.

Therefore, operation/reference identity is not interchangeable with the mutable resource identifier.

### 3. Event-sourcing evidence
Event Sourcing preserves original events and records corrections as new compensating events. Retroactive-event research further distinguishes out-of-order, rejected, and incorrect events and explains that corrections may require replay from an earlier branch point.

This means:
- historical event identity must survive correction;
- correction does not mutate the identity of the historical event;
- replay/reconciliation must know which entity/event lineage is being corrected.

### 4. Concrete executable cross-check: Kura replication
The open-source Kura cache mesh uses an explicit replication cursor containing an `incarnation` together with a sequence. Its documented protocol returns a distinct `incarnation` and rejects cursors referring to a different incarnation. This is concrete executable-system evidence that sequence alone is insufficient across lifecycle/restart boundaries: a cursor can be valid within one incarnation but invalid in another.

Kura also scopes cache resources with tenant/namespace information rather than treating a bare resource key as universally sufficient.

This does not prove a Nexo vulnerability; it demonstrates the engineering need for an incarnation/namespace discriminator at a reuse boundary.

## Attack matrix

### A. Old correction arrives after resource recreation, identifier reused

Timeline:
R1/id=X exists.
C1 is a correction for R1.
R1 is deleted/expired.
A new R2 is created with id=X.
Delayed C1 arrives.

If the consumer keys only on id=X, C1 can be associated with R2.

Reduction:
- stale historical event applied to a new lifecycle incarnation;
- identity lineage is ambiguous;
- correction semantics are domain-specific.

This is exactly the combination of:
I18 namespace/incarnation confusion
+
I19 correction/reversal.

The correction itself does not create a new concurrency primitive.

### B. Same provider resource ID but new local incarnation

If the provider guarantees globally stable non-reused IDs, this exact attack is unreachable at the provider boundary. It can still arise locally if Nexo maps provider resources into recyclable local IDs.

Therefore the interaction is contract-parameterized:
- provider-global immutable ID -> attack excluded by identity contract;
- locally reused ID -> attack remains and requires incarnation/lineage binding.

No new top-level class is justified merely from the second case.

### C. Old correction has a distinct correction-operation ID

Adyen's model demonstrates why this matters: the correction/reversal can carry a separate reference from the original payment.

If the system stores:
(resource_id, correction_operation_id, causal relation)
then an old correction can be rejected or quarantined when the resource incarnation no longer matches.

If it stores only resource_id + status, the lineage discriminator is missing.

This remains I18 + I19, not a new class.

### D. Reconciliation after recreation

Reconciliation reads current provider state for X after R2 exists. A stale C1 arrives concurrently.

Safe outcomes depend on the identity contract:
- C1 proves lineage=R1 -> do not apply to R2;
- C1 has no lineage proof -> UNKNOWN/QUARANTINED rather than guessing;
- provider state itself exposes a newer immutable resource identity/version -> reconcile against that authoritative identity.

This is a cross-domain identity/freshness boundary, but the causal failure is still namespace/incarnation confusion combined with stale correction.

## Reduction result

No genuinely independent interaction survived.

The attack decomposes into:
I18 = namespace/incarnation confusion
I19 = correction/reversal
I21 = stale observation/order only when the delayed event is also stale relative to the recreated resource
class 12 = reconciliation consistency where reconciliation participates.

The minimal discriminator is not merely a timestamp. It is lineage/identity scope:
(resource_type, namespace/domain, resource_id, incarnation/creation identity, event/correction identity, causal/version relation)

Not every system needs every field; the contract must establish which identity dimensions are authoritative.

## Important epistemic boundary

Evidence establishes:
- concrete provider separation between original resource reference and correction reference;
- concrete sequence numbering for resource event ordering;
- concrete event-sourcing correction semantics;
- executable distributed-system use of incarnation + sequence to prevent cross-incarnation cursor confusion.

Evidence does NOT establish:
- a Nexo runtime vulnerability;
- that all providers permit resource-ID reuse;
- that any provider's ID reuse is unsafe by itself;
- formal completeness of I18/I19/I21.

No Nexo runtime race was executed.

## AB104.864R disposition

RESULT: I18 + I19 COVER the resource-recreation/correction attack under an explicit identity/incarnation contract.

No new top-level interaction class frozen.
No W19/W20 freeze.
No coverage denominator freeze.
No semantic freeze.
No formal verification.
No implementation.

### Candidate invariants

INV-TE-13:
A correction event must be bound to the authoritative resource lineage/incarnation before it can mutate current state.

INV-TE-14:
A historical correction whose lineage cannot be established must not be applied to a newly created/reused resource merely because resource_id matches.

INV-TE-15:
Provider/resource identifiers, operation/correction identifiers, and local incarnation identifiers must not be silently conflated.

These are candidate invariants only; not formally verified.

## Exact next action: AB104.865R

Attack:
correction/reversal + namespace/domain migration or tenant/account reassignment.

Question:
Can an old correction event cross a namespace/tenant/account boundary while retaining the same local resource identifier, and does I18 already absorb this when namespace is explicit?

Investigate concrete provider/open-source code and incidents involving:
- tenant/account migration;
- resource moves between namespaces;
- delayed events after reassignment;
- reconciliation after ownership transfer;
- identifiers whose scope changes.

Constraints:
NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED

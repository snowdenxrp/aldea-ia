# NEXO AB104.782R — concrete Raft failover and stale-replica test evidence
Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Continuation note
The document contains the full prior audit chain. The following section is appended without deleting or overwriting prior findings.

## AB104.837R — FRESHNESS SEMANTICS + OUTBOX/EFFECT-JOURNAL BOUNDARY RESEARCH

**Status:** RESEARCHED / NO IMPLEMENTATION / NO ARCHITECTURE FREEZE.

### External evidence cross-check

NIST explicitly models stateful testing around ordered input combinations because failures can depend on the order in which states are established. Its sequence-covering work likewise treats event order as a first-class testing dimension. citeturn0search0turn0search5turn0search24

AWS documents transactional outbox as a way to make a database update and event publication atomic within one transaction boundary, while warning that downstream delivery may still duplicate and therefore consumers should be idempotent. It also stresses preserving notification order. citeturn1search2turn1search36

Stripe's current idempotency documentation provides concrete external-resource evidence: a server can persist the result associated with an idempotency key and return the same result for later retries. It also rejects reuse of the same key with different parameters. This is resource-side cooperation, not a property supplied by the coordinator alone. citeturn1search0

Kafka's current design documentation explicitly scopes exactly-once guarantees to Kafka-managed processing and states that exactly-once behavior for other destination systems generally requires cooperation from those systems. citeturn1search5

### Freshness relation attack

The candidate relation remains:

`compare(incoming, current) -> NEWER | EQUAL/DUPLICATE | OLDER | INCOMPARABLE`

#### Provider/entity sequence

Strongest case when the provider supplies a monotonic sequence/version scoped to the same entity or operation stream. It directly supports R1-R4 and I21. It is **not universal** because an external provider may not expose such a sequence, and scope/epoch semantics must be understood.

**Disposition:** portable as a semantic capability, not portable as a guaranteed field.

#### Aggregate revision

A monotonic local revision is useful for ordering local state transitions, but cannot by itself prove that an external event is newer than an external provider's authoritative state. It orders the coordinator's history, not necessarily the provider's history.

**Disposition:** useful local ordering primitive; insufficient alone for external-effect freshness.

#### Causal/event-stream position

A causal position or stream offset can establish order when all relevant events participate in the same authoritative stream. It becomes insufficient when an event arrives from an independent authority/domain with no shared causal position.

**Disposition:** strong within a common stream; not a universal cross-domain comparator.

#### Wall-clock timestamp

A timestamp is evidence about event time but is not a safe universal semantic-order relation under clock skew, delayed delivery, retries, or independent producers.

**Disposition:** auxiliary metadata, not a sole freshness fence.

#### INCOMPARABLE

This remains essential. If the system cannot establish that an incoming event is newer/equal/older under the applicable authority contract, it must not infer freshness from arrival order. The safe disposition is preserve current authoritative state and invoke explicit reconciliation/UNKNOWN according to the contract.

### AB104.837R result

No single freshness mechanism is universal.

The portable abstraction is therefore **not a timestamp, sequence field, or revision number**. The portable abstraction is a semantic **freshness/authority relation** whose evidence source is provider/domain-specific.

This is an important boundary result: technology selection must not silently define semantics.

### Outbox/effect-journal attack

Transactional outbox solves a specific dual-write boundary:

`local state transaction + durable outgoing event`

It does **not** make:

`durable outbox + arbitrary external side effect`

atomic.

The publisher can still crash after the external effect and before recording/acknowledging completion. Therefore an outbox alone does not eliminate the UNKNOWN effect window.

A durable effect journal can improve recovery by recording operation identity and observed outcomes, but if the external resource does not participate atomically, the coordinator still needs idempotency or reconciliation at the resource boundary.

### Derived failure windows

O1: local transaction + outbox commits → publisher never sends → recoverable from durable outbox.

O2: publisher sends → external effect occurs → publisher crashes before local outcome record → **UNKNOWN** unless resource-side query/idempotency resolves it.

O3: publisher retries after O2 → resource accepts same operation idempotently → safe convergence.

O4: publisher retries after O2 → resource has no idempotency and no reconciliation API → duplicate-vs-loss ambiguity cannot be eliminated by the coordinator alone.

O5: old authority sends effect after generation change → outbox correctness does not itself fence the external resource → authority-generation validation must exist at the protected effect boundary.

### Strong result

**Outbox, idempotency, fencing, and reconciliation solve different failure windows.**

- Outbox: closes local dual-write loss between durable local state and publication.
- Idempotency: prevents repeated logical operations from producing repeated semantic effects when the resource supports it.
- Fencing: prevents obsolete authority generations from continuing to act.
- Reconciliation: resolves ambiguous outcome when execution and observation are separated.

None of the four is a universal substitute for the others.

### Candidate invariant refinement

**INV-EF-01:** A durable intent/outbox record is evidence that an operation was durably requested; it is not evidence that the external effect occurred.

**INV-EF-02:** An idempotency key is not an authority credential. It can prevent duplicate logical effects while an obsolete actor may still be attempting the operation.

**INV-EF-03:** A fencing generation is not an execution result. It can reject stale authority while leaving the operation outcome unknown.

**INV-EF-04:** If an external resource provides neither atomic idempotency nor authoritative reconciliation, a coordinator cannot honestly transform an execution timeout into CONFIRMED or FAILED solely from its own local state.

These are candidate invariants, not formally verified properties.

### I19/I20/I21 impact

The freshness research strengthens the prior conclusion:

- **I19:** requires history reconstruction plus authoritative later correction/reversal and therefore remains independent.
- **I20:** requires late authoritative confirmation after UNKNOWN/retry and therefore remains independent.
- **I21:** requires semantic freshness against a late pre-correction event and remains a distinct ordered interaction.

However, all three can conceptually use the same evidence/history substrate without becoming the same test interaction.

### Evidence ledger additions

FRESHNESS_RELATION_PROVIDER_SEQUENCE — CAPABILITY CONFIRMED, UNIVERSALITY NOT ESTABLISHED
AGGREGATE_REVISION_EXTERNAL_FRESHNESS — INSUFFICIENT ALONE
CAUSAL_STREAM_POSITION — VALID WITHIN COMMON AUTHORITATIVE STREAM
WALL_CLOCK_AS_SOLE_FRESHNESS — INSUFFICIENT
INCOMPARABLE_FRESHNESS — MUST NOT IMPLY NEWER/OLDER
TRANSACTIONAL_OUTBOX_DUAL_WRITE_BOUNDARY — SOURCE CONFIRMED
OUTBOX_ALONE_ATOMIC_WITH_EXTERNAL_EFFECT — FALSE / NOT ESTABLISHED
RESOURCE_SIDE_IDEMPOTENCY — SOURCE CONFIRMED BY STRIPE EXAMPLE
EXACTLY_ONCE_EXTERNAL_DESTINATION_WITHOUT_RESOURCE_COOPERATION — NOT ESTABLISHED
OUTBOX != IDEMPOTENCY != FENCING != RECONCILIATION
FORMAL_VERIFICATION — NOT PERFORMED
NEXO_IMPLEMENTATION — NOT PERFORMED

### Current disposition

I17: absorbed by W17 parameterization.
I18: absorbed by W18 parameterization.
I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
INV-EH-01: candidate.
INV-EH-02: candidate.
INV-EF-01..04: candidate.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.838R:** study concrete resource-side fencing/idempotency protocols and reconciliation APIs, including epoch fencing, idempotency-key retention/expiry, conflicting parameter reuse, and recovery after provider-side partial completion. Attack whether an external resource can expose enough evidence to distinguish `UNKNOWN`, `CONFIRMED`, `FAILED`, `CORRECTED`, and `REVERSED` without coordinator-side assumptions.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**

# NEXO AB104.782R — concrete Raft failover and stale-replica test evidence
Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Continuation note
The document contains the full prior audit chain. The following section is appended without deleting or overwriting prior findings.

## AB104.838R — RESOURCE-SIDE IDEMPOTENCY / RECONCILIATION / PARTIAL-COMPLETION AUDIT

**Status:** RESEARCHED / NO IMPLEMENTATION / NO ARCHITECTURE FREEZE.

### Fresh external evidence

Stripe's current API documentation makes an important boundary explicit: an idempotency key can cause subsequent retries to return the original result, but keys may be automatically removed after at least 24 hours; reusing a pruned key can create a new request. Stripe also compares parameters on key reuse and rejects mismatched parameters. citeturn0search1turn0search2

Check's current API documentation provides an independent example of the same limitation: after its 24-hour key-expiry window, a reused key is treated as a new request, and its documentation recommends checking the resource before a late retry. This confirms that idempotency retention is a semantic part of the guarantee, not an implementation footnote. citeturn0search7

AWS transactional-outbox guidance confirms that outbox provides atomicity between the local database update and publication, while duplicate downstream delivery remains possible and consumers must be idempotent. It does not make an arbitrary external side effect atomic with the local transaction. citeturn0search0turn0search3

### Resource-side idempotency attack

A resource-side idempotency contract must answer at least four independent questions:

1. **Identity:** what exactly identifies the same semantic operation?
2. **Retention:** for how long is that identity remembered?
3. **Parameter binding:** what happens if the same identity is reused with different parameters?
4. **Execution state:** how are NEW, IN-PROGRESS, COMPLETED, FAILED, and expired identities exposed?

Stripe demonstrates all four dimensions in concrete form: result retention, parameter comparison, retry behavior, and a defined pruning window. citeturn0search1

### Critical expiry result

Idempotency is therefore **time-bounded unless the provider explicitly guarantees durable retention**.

This creates a new failure window:

`operation O → provider accepts O → idempotency record expires → coordinator retries same logical O → provider treats request as NEW`

The original idempotency key is no longer sufficient evidence of sameness.

Therefore:

**INV-EF-05 candidate:** an idempotency key only provides the deduplication guarantee within the provider's documented retention/semantic scope; outside that scope, reuse cannot be assumed safe.

### Parameter-conflict result

Same-key/different-parameters is not a normal retry. It is a semantic identity conflict.

A safe resource contract must not silently interpret:

`same key + different semantic request`

as a valid continuation of the original operation.

Stripe explicitly rejects this class of mismatch. citeturn0search1

Therefore:

**INV-EF-06 candidate:** operation identity must bind to the intended semantic parameters strongly enough that key reuse with conflicting parameters is rejected or otherwise made explicitly non-equivalent.

### Partial-completion attack

The dangerous state remains:

`reserve/accept O → execute external effect → crash before durable result`

A later retry can observe:

- key absent;
- key IN-PROGRESS;
- key COMPLETED;
- key FAILED;
- key EXPIRED;
- or provider-specific UNKNOWN.

These are materially different evidence states. A local coordinator must not collapse them into one Boolean retryable/not-retryable value.

AWS's outbox guidance reinforces the broader boundary: local durability and publication reliability do not remove duplicate or external-effect uncertainty. citeturn0search0

### Reconciliation consequence

The strongest safe external evidence hierarchy found in this round is:

**A. Authoritative resource lookup** — strongest when the resource has a stable operation/resource identity and the lookup semantics are authoritative.

**B. Provider-side idempotency record** — strong while retained and when the provider guarantees what the record means.

**C. Provider event/webhook history** — strong when authenticated, scoped, and semantically ordered; still requires freshness/reconciliation handling.

**D. Local ACK/timeout alone** — insufficient to establish external effect.

This is not a universal ranking across every provider; it is an evidence-contract pattern. The provider's own semantics determine which evidence is authoritative.

### State classification attack

Can resource-side evidence distinguish the five states?

| State | Resource-side evidence needed | Local timeout sufficient? |
|---|---|---|
| UNKNOWN | no authoritative terminal evidence | **No** |
| CONFIRMED | authoritative resource/event evidence of effect | **No** |
| FAILED | authoritative terminal rejection/failure | **No** |
| CORRECTED | authoritative later correction referencing prior state | **No** |
| REVERSED | authoritative later reversal/counter-effect | **No** |

Therefore the coordinator cannot manufacture these terminal meanings from absence of a response.

### New interaction candidates

**I22 — idempotency expiry × late retry × prior external effect**

`O executes → provider forgets idempotency identity → retry after retention window → second execution possible.`

This is distinct from I20 because I20 assumes the operation identity remains usable for reconciliation; I22 explicitly crosses the provider's deduplication-retention boundary.

**I23 — same idempotency key × conflicting parameters × retry**

`O(payload A) → uncertain outcome → retry with same key but payload B.`

This is not a normal duplicate; it is an identity/intent conflict and must not silently converge as though A and B were the same operation.

**I24 — partial completion × provider IN-PROGRESS evidence × retry/reconciliation**

`O may have executed → provider exposes IN-PROGRESS → coordinator must not issue an uncontrolled second effect.`

These remain **candidate interactions**, not frozen witnesses. They must pass reduction against I17/I20 and existing retry/idempotency classes first.

### Strong methodological result

The external resource's **idempotency contract has a lifecycle**. Therefore the previous abstraction `operation_id → idempotent` was incomplete.

The correct research-level abstraction is closer to:

`operation identity + parameter binding + retention scope + execution-state semantics + reconciliation authority`

This is still a semantic model, **not a Nexo architecture or data schema**.

### Evidence ledger additions

IDEMPOTENCY_RETENTION — SEMANTIC GUARANTEE IS PROVIDER-SCOPED AND TIME-BOUNDED IN SOME REAL APIs
SAME_KEY_DIFFERENT_PARAMETERS — EXPLICIT CONFLICT CLASS CONFIRMED
LATE_RETRY_AFTER_EXPIRY — CAN BECOME A NEW OPERATION
RESOURCE_IN_PROGRESS — DISTINCT FROM UNKNOWN/COMPLETED/FAILED
AUTHORITATIVE_RESOURCE_LOOKUP — POTENTIAL RECONCILIATION AUTHORITY, PROVIDER-DEPENDENT
TIMEOUT_AS_TERMINAL_EFFECT — INSUFFICIENT

### Current disposition

I17: absorbed by W17 parameterization.
I18: absorbed by W18 parameterization.
I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: candidate / untested.
I23: candidate / untested.
I24: candidate / untested.
INV-EH-01: candidate.
INV-EH-02: candidate.
INV-EF-01..04: candidate.
INV-EF-05: candidate.
INV-EF-06: candidate.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.839R:** reduce I22/I23/I24 against all existing retry, idempotency, stale-event, and UNKNOWN interactions. Then attack provider-side fencing/epoch semantics and determine whether stale authority can be rejected before effect execution, after reservation, or only after execution. Explicitly distinguish provider guarantees from coordinator assumptions.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**

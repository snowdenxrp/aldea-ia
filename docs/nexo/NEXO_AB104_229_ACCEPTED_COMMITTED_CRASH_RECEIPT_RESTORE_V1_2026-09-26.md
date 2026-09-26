# NEXO AB104.229 — ACCEPTED vs COMMITTED BOUNDARY, CRASH, RECEIPTS, RESTORE V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core finding
ACCEPTED and COMMITTED must not be conflated.

Candidate semantics:
- ACCEPTED: target has crossed its acceptance/linearization boundary.
- COMMITTED: target has durably applied the effect and can establish that fact under its recovery semantics.
- RECEIPTED: evidence of the commit is available to the caller/recovery system.

A crash between ACCEPTED and durable COMMITTED evidence creates UNKNOWN unless the target contract makes the acceptance itself equivalent to durable commit.

AWS Durable Execution provides a useful external comparison: checkpointed results are replayed instead of rerunning completed operations, while an interrupted side-effecting step may require checking the external system before deciding what happened. citeturn0search0turn0search3turn0search4

## Crash interleavings

### A. Before acceptance
No target acceptance evidence + protocol proves request never crossed boundary:
candidate NOT_COMMITTED.

Timeout/connection loss alone:
UNKNOWN.

### B. Acceptance occurs, worker crashes before local result
Target may already have committed. Local absence is not NOT_COMMITTED.
Recovery must reconcile by operation identity.

### C. Target commits, registry write is separate, then crash
Local registry can be missing while external state is committed.
This is UNKNOWN until authoritative target evidence resolves it.

### D. Registry says COMMITTED before target mutation
This is unsafe if the registry is not atomically bound to the mutation: it can create false COMMITTED evidence.
A reservation/prepare record must not be interpreted as completion.

### E. Target mutation and COMMITTED registry entry atomically commit
This gives a much stronger boundary: either both become durable or neither does, subject to the target's actual transaction/recovery guarantees.
etcd is an external example of atomic compare-and-write transactions whose successful branch is applied as one transaction with one revision. This is evidence about a primitive, not a Nexo architecture decision. citeturn0search12turn0search13

### F. Commit succeeds, receipt delivery fails
Receipt absence is not effect absence.
Target reconciliation can recover COMMITTED.

### G. Commit succeeds, target response says timeout
Transport outcome is UNKNOWN; target state is authoritative if queryable.

### H. Commit succeeds, then target is restored to an older snapshot
The old snapshot may make the operation appear absent. That absence cannot prove NOT_COMMITTED unless target continuity/anti-rollback semantics cover the restoration.

## Receipt as reconstruction evidence

A receipt can be sufficient to reconstruct a local COMMITTED state only if its semantics bind the receipt to the authoritative commit boundary.

Candidate binding:
- operation_id
- effect_identity
- payload_fingerprint
- target_identity
- target_incarnation
- authority_root/epoch/config
- accepted/commit state
- target commit revision/linearization identifier
- resource version/predecessor
- fence context
- result/result_digest
- issuer authenticity
- freshness/continuity context

Important separation:
RECEIPT_AUTHENTICITY = the receipt really came from its claimed issuer.
RECEIPT_COMMIT_PROOF = the receipt actually attests to a target commit under issuer semantics.
RECEIPT_CURRENT_AUTHORITY = the receipt remains admissible for current decisions.

These are different properties.

A receipt can therefore be valid historical evidence while being stale for current authorization. It must never become an independent authority merely because it is cryptographically valid.

## Negative receipt

A negative receipt can support NOT_COMMITTED only when:
1. exact operation identity is bound;
2. target identity/incarnation is bound;
3. receipt is authoritative and authentic;
4. the receipt refers to the relevant acceptance boundary;
5. target semantics guarantee the operation was not accepted/processed;
6. continuity/freshness covers the relevant period.

Examples:
- "conditional check failed before mutation" can be strong negative evidence if the transaction semantics guarantee no acceptance.
- "request timed out" is not negative evidence.
- "operation not found" is not negative evidence after restore/retention expiry unless target guarantees historical coverage.
- "duplicate operation" can indicate an earlier accepted/committed operation and must be reconciled, not classified as NOT_COMMITTED.

## ACCEPTED without COMMITTED

If a target exposes ACCEPTED as a durable state but commits asynchronously, the registry must preserve the distinction:

ACCEPTED -> PROCESSING -> COMMITTED

A crash at PROCESSING remains UNKNOWN/PENDING unless target reconciliation can establish the terminal state.

Therefore "accepted" cannot automatically grant permission to retry the effect. The retry decision needs target semantics: idempotency, operation ownership, or authoritative status.

AWS documents that retries can rerun side effects unless the external operation is idempotent, and recommends stable idempotency keys for repeated attempts. citeturn0search0turn0search10

## Restore/clone attacks

1. Target and registry restored together to an older consistent snapshot:
   internally consistent does not mean historically current. Anti-rollback continuity is required.

2. Target restored newer than registry:
   registry may say UNSEEN while target already committed. Reconcile; never execute because local registry is empty.

3. Registry restored newer than target:
   COMMITTED evidence conflicts with target snapshot. Do not erase either side; classify continuity inconsistency/quarantine until recovery semantics establish a common history.

4. Registry and target restored from different snapshots:
   individually authentic snapshots can compose into an invalid history. A shared commit/sequence anchor is required.

5. Clone:
   two targets can both present locally valid operation registries. Target identity/incarnation and authority continuity must prevent one clone from becoming a second canonical execution target.

## Concurrency

Two workers see UNSEEN simultaneously.

Unsafe:
check -> both mutate -> both record.

Stronger boundary:
conditional reservation/commit is serialized at the target, binding operation identity and effect fingerprint.

If worker A owns RESERVED and worker B retries, B must observe the reservation semantics and either:
- reattach/reconcile;
- wait;
- receive a definitive rejection;
- or remain UNKNOWN.
It must not infer that RESERVED means the effect did not happen.

## Partial effects

If parent P contains independently committing children:
P.C1 = COMMITTED
P.C2 = UNKNOWN
P.C3 = NOT_COMMITTED

Parent state cannot become COMMITTED until all required child semantics are resolved.
A parent receipt does not automatically prove child-level completion unless the target contract explicitly binds them atomically.

## Prototype cross-check

Known prototype evidence remains:
- runtime idempotency key = missionId:stepId;
- effect journal capped at 200 entries;
- prepared entries require reconciliation before another execution attempt;
- local stateVersion/nexoEffectRevision is not demonstrated as external fencing;
- exception path returns EFFECT_OUTCOME_UNKNOWN without persist(), while the current test expects an UNKNOWN journal result;
- no test-pass claim;
- no target-side atomic ACCEPTED+COMMITTED boundary has been demonstrated in the prototype.

## External research
AWS Durable Execution documents checkpointed results and replay behavior, including interrupted side effects and idempotency-key use. citeturn0search0turn0search3turn0search4
etcd documents atomic conditional transactions and a single revision for writes within a transaction. citeturn0search12turn0search13

## Residual AB50→AB58
UNCHANGED:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

AB55 coverage remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks, not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
- ACCEPTED != COMMITTED
- receipt delivery != commit
- receipt authenticity != commit truth
- historical receipt validity != current authority
- negative receipt != NOT_COMMITTED without boundary semantics
- timeout != NOT_COMMITTED
- registry absence != non-execution
- restore consistency != freshness
- reservation != permission to execute
- no V21
- no architecture implementation
- no unsupported formal/CI/fault-injection claims

## Next exact mission
AB104.230: study the commit-record/receipt durability boundary in greater depth: atomic commit markers, torn writes, acknowledgement ordering, recovery proofs, target-side operation lookup after restore, and whether a receipt can be safely used as the reconstruction anchor without allowing stale evidence to regain effect authority.
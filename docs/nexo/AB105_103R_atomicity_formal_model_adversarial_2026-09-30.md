# AB105.103R — adversarial audit of cross-resource atomicity and formal-model boundary

Date: 2026-09-30
Chain: AB105.102R -> AB105.103R

## Objective
Attack the two remaining behavior-changing choices identified by the Semantic Freeze Package: cross-resource atomicity and the exact formal-model boundary.

## Fresh primary evidence
RFC 2372 describes distributed atomicity as agreement on an all-or-none outcome and notes that two-phase commit is a mechanism for coordinating that outcome across participants; it also highlights the complexity of distributed transaction protocols. citeturn0search6turn0search7
Lamport's TLA+ material separates safety and liveness and describes refinement as proving that a lower-level specification implements a higher-level specification. This supports keeping the Nexo formal model above implementation mechanisms rather than selecting a mechanism first and treating it as the model. citeturn0search36turn0search38
NIST's OT guidance emphasizes that distributed/control systems have distinct reliability and safety requirements and should be assessed according to the concrete system and risk context; the current SP 800-82 Rev.4 draft remains a draft, so it is evidence about scope and concerns, not a finalized Nexo requirement. citeturn0search14

## Part A — Cross-resource atomicity adversarial audit

### A1 — two participants, one succeeds, one fails
True atomicity requires a protocol capable of preventing an externally visible mixed outcome or defining a recoverable semantic that is not falsely represented as atomic.
Result: atomicity cannot be assumed from a local transaction boundary.

### A2 — participant timeout
Timeout is not proof of participant failure or non-commit.
Result: outcome becomes UNKNOWN until reconciliation or protocol evidence resolves it.

### A3 — coordinator crash after decision
Coordinator persistence/recovery must preserve the decision state; otherwise participants can diverge.
Result: atomicity requires durable decision/recovery semantics, not only a coordinator API.

### A4 — participant executes before coordinator acknowledgement
External effect can exist before the local record says COMMITTED.
Result: EFFECT_OBSERVED and COMMIT_DECISION remain distinct.

### A5 — retry after uncertain outcome
Retrying a non-idempotent participant can create a duplicate effect.
Result: operation identity/idempotency/reconciliation remain prerequisites.

### A6 — compensation instead of atomic commit
A compensating action can produce a later semantic correction but does not prove that the original multi-resource operation was atomic.
Result: COMPENSATED != ATOMIC.

### A7 — one resource supports transactions, another does not
The stronger participant cannot extend atomicity to the weaker participant merely by wrapping it.
Result: atomicity scope must explicitly identify participating effect capabilities.

### A8 — partition during commit
A network partition can prevent immediate knowledge of the global outcome.
Result: UNKNOWN is a legitimate state; timeout cannot be converted into failure or success without evidence.

### A9 — irreversible external effect
If an effect cannot be rolled back, a protocol promising all-or-none semantics must establish its commit boundary before allowing the irreversible step, or classify the operation under a weaker semantic.
Result: protocol capability must match consequence class.

### A10 — mixed provider semantics
Different providers may expose different transaction, idempotency, cancellation, and reconciliation guarantees.
Result: provider adapters cannot silently upgrade the generic atomicity contract.

## Part A conclusion
No single universal cross-resource atomicity mechanism is justified.
The generic contract must define the desired semantic and allowed failure states; a concrete protocol is selected per capability/consequence class.
Possible semantic classes are intentionally left open: ATOMIC, SAGA/COMPENSATABLE, BEST_EFFORT_WITH_RECONCILIATION, or EXPLICITLY_NON_ATOMIC.
Selecting one universally would be an architecture decision, not an evidence finding.

## Part B — Formal-model boundary adversarial audit

### B1 — model only the happy path
Would miss STOP, UNKNOWN, retries, partitions and recovery.
Rejected.

### B2 — model only the database/state machine
Would omit external effects and authority boundaries.
Rejected for Nexo safety claims.

### B3 — model every provider implementation detail
Would make the generic model provider-bound and defeat the provider-independent contract.
Rejected as the primary model.

### B4 — model the LLM as the authority
Conflicts with the established policy/authority-outside-model separation.
Rejected.

### B5 — omit evidence uncertainty
Would collapse UNKNOWN into binary state and invalidate the evidence/decision contracts.
Rejected.

### B6 — omit EventDAG ambiguity
Would allow incomplete reconstruction to masquerade as terminal history.
Rejected.

### B7 — omit recovery/migration
Would fail to model authority transfer and successor exclusivity.
Rejected.

### B8 — prove only safety, not liveness
Safety can establish forbidden-state absence but cannot by itself prove required progress.
Rejected as a complete verification claim; safety and liveness must be separately scoped.

## Formal-model boundary that survives the audit
The primary Nexo model should be provider-independent and abstract over concrete mechanisms while explicitly modeling:
- authority and epochs;
- STOP/fencing;
- identity/incarnation;
- claims/appraisal/decisions;
- evidence freshness/dependency/conflict;
- operation identity and replay/idempotency;
- external-effect state and reconciliation;
- EventDAG uncertainty/reconstruction states;
- recovery/migration/successor exclusivity;
- UNKNOWN and fail-closed policy outcomes.

Provider adapters belong below this model and must be related by explicit refinement/contract conformance rather than silently changing semantics.
Formal verification should separately state which properties are safety, liveness, or refinement properties.

## Hidden dependency test
Cross-resource atomicity does NOT require the historical ternary semantic artifact.
The formal-model boundary does NOT require historical ternary semantics for the generic contracts.
Historical ternary compatibility can remain a separate model instance/legacy compatibility obligation.

Therefore neither remaining choice is secretly blocked by AB50–AB58.

## Result
CROSS_RESOURCE_ATOMICITY = SEMANTIC_CHOICE_REMAINS_OPEN
FORMAL_MODEL_BOUNDARY = GENERIC_BOUNDARY_IDENTIFIED
HISTORICAL_TERNARY_DEPENDENCY = ISOLATED
NEW_GENERIC_EVIDENCE_PRIMITIVE = NONE
SEMANTIC_FREEZE = READY_EXCEPT_FOR_EXPLICIT_ARCHITECTURE_CHOICES
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.104R — normative decision record for the formal-model boundary and atomicity capability taxonomy, without selecting a concrete distributed-transaction protocol. The goal is to freeze what must be modeled and what remains an explicit architecture choice.
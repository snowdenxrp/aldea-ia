# AB105.104R — normative freeze boundary: formal model + atomicity capability taxonomy

Date: 2026-09-30
Chain: AB105.103R -> AB105.104R

## Objective
Freeze what Nexo must mean independently of implementation, while refusing to silently choose a distributed-transaction protocol.

## Primary-source result
Distributed atomic commitment is a protocol property: RFC 2372 defines atomicity as all-or-none outcome and identifies two-phase commit as a mechanism for agreement among participants. The protocol mechanism is therefore separable from the higher-level semantic property. citeturn0search0turn0search1
TLA+ provides a suitable abstraction boundary for Nexo because a specification can describe asynchronous distributed systems, separate safety and liveness, and use refinement mappings to relate a lower-level implementation to a higher-level specification. citeturn0search24turn0search25turn0search27

## 1. Frozen formal-model boundary

### Model INCLUDES
- authority state, authority epoch and validity boundary;
- STOP request/enforcement state;
- fencing and successor exclusivity;
- identity and incarnation;
- observation freshness, coverage, conflict and dependency;
- claim, appraisal and decision states;
- operation identity, replay and idempotency;
- external-effect lifecycle;
- expected/observed/unobservable effect reconciliation;
- EventDAG reconstruction state and claim-relative uncertainty;
- recovery, migration and reauthorization;
- atomicity capability and its declared semantic class;
- UNKNOWN/CONFLICTING/STALE/UNVERIFIABLE outcomes where applicable.

### Model EXCLUDES FROM THE GENERIC CORE
- provider-specific APIs;
- provider-specific transaction protocol mechanics;
- database implementation details;
- transport-specific retry algorithms;
- LLM/provider internals;
- UI/device implementation;
- credentials' concrete storage mechanisms.

Those belong to lower-level adapter/implementation specifications and must satisfy the higher-level contract.

## 2. Verification layers
V0 — semantic contract: states, transitions, invariants, failure meanings.
V1 — safety: forbidden states/effects are unreachable under stated assumptions.
V2 — liveness/fairness: required progress occurs under explicitly stated assumptions.
V3 — refinement: concrete implementation preserves the abstract contract.
V4 — fault-injection/runtime evidence: crashes, partitions, retries, duplicate delivery, stale authority and recovery are exercised.

Passing V0 does not imply V1–V4.

## 3. Atomicity capability taxonomy

### ATOMIC
All participating effects share a protocol with a defined all-or-none commit boundary. An UNKNOWN participant outcome cannot be reclassified as success/failure without protocol evidence.

### COMPENSATABLE
Effects may become externally visible before global completion and can be compensated by a defined corrective workflow. COMPENSATABLE != ATOMIC.

### RECONCILIABLE_NON_ATOMIC
Partial effects are allowed by contract; correctness depends on durable operation identity, effect observation and reconciliation.

### UNSUPPORTED
The required consequence class cannot safely be achieved with the available participant capabilities. Decision must fail according to policy rather than silently downgrade semantics.

These are capability classes, not protocol selections.

## 4. Atomicity invariants
- ATOMIC != merely sequential.
- ATOMIC != local database transaction around external calls.
- COMMIT_REQUESTED != COMMITTED.
- ACK_RECEIVED != EFFECT_PROVEN unless the protocol defines that correspondence.
- TIMEOUT != ABORT.
- TIMEOUT != COMMIT.
- COMPENSATED != ATOMIC.
- PARTIAL_EFFECT != AUTOMATIC_FAILURE.
- RECONCILED != ATOMIC.
- PROVIDER_SUPPORT != GENERIC_NEXO_GUARANTEE.
- UNKNOWN_OUTCOME != SUCCESS.
- UNKNOWN_OUTCOME != ZERO_EFFECT.

## 5. Architecture consequence
Nexo should negotiate/declare an effect's required capability before consequential execution.
A decision requiring ATOMIC semantics cannot execute through a merely COMPENSATABLE or RECONCILIABLE_NON_ATOMIC capability unless the policy explicitly changes the consequence class and records that semantic change.

## 6. Historical ternary isolation
The AB50–AB58 ternary semantic gap remains a separate historical compatibility dependency. It does not determine the generic formal-model boundary or the atomicity taxonomy.
No historical meaning is reconstructed by assumption.

## 7. Freeze decision
FORMAL_MODEL_BOUNDARY = FROZEN_AT_SEMANTIC_LEVEL
ATOMICITY_SEMANTIC_TAXONOMY = FROZEN_AT_CAPABILITY_LEVEL
CONCRETE_ATOMICITY_PROTOCOL = INTENTIONALLY_UNSELECTED
HISTORICAL_TERNARY = LOCALIZED_BLOCKED_DEPENDENCY
FORMAL_PROOF = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED
RUNTIME_VERIFICATION = NOT_PERFORMED

## 8. Research-sprawl gate
No new generic evidence taxonomy should be opened from this point merely to improve completeness.
Remaining work must now be one of:
1. select an explicit architecture protocol/capability for a concrete Nexo effect class;
2. build the formal model from this frozen boundary;
3. locate the missing historical ternary semantic artifact;
4. test the frozen contracts against implementation/runtime evidence.

## Next exact direction
AB105.105R — formal-model seed audit: translate the frozen Nexo semantic boundary into a minimal state/transition inventory and attack it for missing behavior-changing states before any implementation. This is the gate between research semantics and formalization.
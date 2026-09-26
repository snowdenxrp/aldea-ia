# NEXO — ADMISSION→ATTEMPTED RACE ATTACK V1
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Finding
The split is viable only if ADMITTED→ATTEMPTED is itself a protected conditional transition. An admission record alone does not serialize two workers after the transaction ends. The minimum local rule is: a worker may claim an effect attempt only if the durable record still matches the immutable operation/effect binding, is in the expected lifecycle state, and the current authority/resource/STOP predicates permit the attempt. The transition must atomically consume the eligible state so a competing worker cannot claim the same effect identity.

## Race A — two workers after ADMITTED
W1 and W2 both read CONTROL_ADMITTED. If both can dispatch from that read, local idempotency is insufficient. Required repair: conditional durable transition ADMITTED→ATTEMPTED keyed by operation_id + effect_identity + retry_generation. Exactly one transition may succeed. The loser must reconcile the already-claimed effect rather than dispatching.

## Race B — STOP between read and claim
Reading STOP=clear before the conditional claim is not sufficient. The claim must validate STOP context at its linearization point. If STOP changed, the claim fails and no new dispatch is authorized. A previously admitted operation remains historical context; it does not silently inherit post-STOP authority.

## Race C — owner transfer/recovery restart
Owner generation and recovery incarnation must be checked at the protected claim. A stale worker holding an old admission cannot claim ATTEMPTED after ownership/recovery changed. The new owner/recovery process first reconciles the existing effect identity and then obtains any new protected attempt.

## Race D — resource replacement
resource_id alone is insufficient. The conditional claim must match resource_incarnation. Replacement therefore rejects the stale claim. A new incarnation requires explicit continuity evidence or a new protected binding.

## Race E — reconciliation races with retry
Reconciliation and retry must converge through the same protected lifecycle state, not independent booleans. If reconciliation confirms completion first, retry must observe terminal state and not dispatch. If retry claims ATTEMPTED first, reconciliation observes an in-flight/attempted identity and resolves it rather than creating another effect. If both evidence and lifecycle writes race, one conditional transition wins and the losing path re-reads/reconciles.

## Race F — timeout after claim
Timeout does not revert ATTEMPTED to NOT_ATTEMPTED. If dispatch may have occurred, state remains unresolved and the same effect_identity is retained. Retry is a reconciliation action until authoritative evidence establishes an allowed transition.

## Race G — crash after claim before dispatch
Durable ATTEMPTED means recovery cannot infer that dispatch happened, but it also cannot infer that it did not. The lifecycle therefore needs a distinct attempted/dispatch-unknown condition or equivalent evidence. Recovery must reconcile before creating a new effect.

## Race H — crash after dispatch before result
Same effect identity remains authoritative for reconciliation. A second effect identity is not justified merely because the first response was lost.

## Race I — partial multi-resource result
One participant becoming CONFIRMED cannot atomically promote another UNKNOWN participant. Each participant keeps its own evidence. Aggregate terminal state requires the documented transaction/effect scope to cover all participants.

## Minimum conditional claim
Conceptually:
claimAttempt(effect_identity, expected_state=CONTROL_ADMITTED, expected_owner_generation, expected_recovery_incarnation, expected_authority_epoch, expected_stop_epoch, expected_resource_incarnation, expected_retry_generation)
→ succeeds exactly once, producing EFFECT_ATTEMPTED/attempt record
→ or fails because one predicate changed.
The claim must be atomic with the state transition. A read followed by a separate write is not sufficient.

## Important distinction: local serialization vs external duplicate prevention
A protected local conditional transition prevents two local workers from both believing they own the same attempt. It does not by itself prevent an external provider from receiving duplicate requests after a network ambiguity. External duplicate prevention requires provider-side effect identity/idempotency or fencing semantics. Without that capability, the local state can safely remain UNKNOWN/HOLD rather than inventing exactly-once behavior.

## Persistence mechanism evidence
SQLite is a useful reference because its documented transaction model makes a multi-change commit atomic, isolates readers from partial changes, and has crash-recovery testing that repeatedly injects simulated power-loss/crash points. SQLite serializes ordinary writes; its WAL mode permits readers during writes but still has a single commit serialization point. These properties support the conditional-transition design, but they do not prove Nexo semantics or select SQLite.
SQLite's durability also depends on configuration and storage conditions: its documentation distinguishes synchronous modes and notes different durability guarantees under power loss. Therefore Nexo must define its own durability profile and fault-injection target instead of inheriting a database default.

## Refuted shortcuts
- check STOP, then dispatch
- read ADMITTED, then dispatch
- use operation_id without a conditional state transition
- use stateRevision as external effect fencing
- turn timeout into NOT_ATTEMPTED
- create a fresh effect identity after UNKNOWN without reconciliation
- let reconciliation and retry update separate unsynchronized records
- treat resource_id as stable across replacement

## Architecture consequence
The lifecycle needs at least two protected points:
1. ADMISSION: establish the immutable binding and authority context.
2. ATTEMPT CLAIM: atomically consume the eligible attempt state under current authority/resource/STOP predicates.
The effect itself may then execute outside the transaction. Outcome/reconciliation is a third lifecycle stage and must not rewrite the admission or attempt identity.

## Remaining OPEN
- Exact schema/index/conditional-write mechanism remains OPEN.
- Whether ATTEMPTED needs sub-states for dispatch-accepted vs dispatch-unknown remains OPEN.
- Exact provider fencing/idempotency contracts remain OPEN.
- Cross-resource atomic attempt claims remain OPEN.
- Crash/power-loss fault injection has NOT been performed.
- Formal proof of no duplicate external effect remains OPEN.
- No implementation/V21.
- No current CI PASS claimed.
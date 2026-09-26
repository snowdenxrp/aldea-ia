# NEXO — BOUNDED LUMINA LOCAL TRANSACTION CONTRACT V1
Date: 2026-09-25
Status: RESEARCH ONLY / PRE-IMPLEMENTATION

## Contract boundary
A future local transactional boundary must cover, in one authoritative commit unit:
1. current OwnerFence and recovery context;
2. STOP context;
3. ResourceBinding/resource_incarnation;
4. EffectBinding/effect identity and retry generation;
5. PreparedIntent;
6. deterministic local state transition;
7. durable operation outcome/history needed for recovery.

A filesystem lock plus later JSON replacement is not, by itself, evidence of this transaction. SQLite's crash model uses explicit journaling/recovery to make interrupted transactions appear either fully committed or rolled back; etcd transactions atomically apply guarded comparisons and writes. These are reference semantics, not proof for Nexo's implementation.

## Current-code mapping
A. createLuminaEffectAdapter handlers mutate simulation.agents/world directly and bump nexoEffectRevision.
B. executeLuminaNexoStep invokes the adapter, while persistPreparedIntent remains optional.
C. persistState later serializes world/agents/events/nexoMemory under a lock and stateRevision check.
D. nexoEffectRevision is not serialized.
E. Therefore the current handler execution is outside the durable transaction boundary.

## Required future state machine
PREPARED
 -> ADMISSION_REJECTED
 -> CONTROL_ADMITTED
 -> LOCAL_EFFECT_COMMITTED
 -> OUTCOME_CONFIRMED

Crash branches:
- before admission: no authority granted.
- after admission/before local commit: recovery sees admitted-but-not-committed and must use current authority; no stale retry.
- during commit: recovery must resolve to exactly one durable state: pre-transition or post-transition, according to the transaction mechanism.
- after local commit/before response: durable identity allows reconstruction; response loss is not a second effect.
- ambiguous recovery evidence: UNKNOWN/HOLD, never ABSENT.
- STOP/owner/recovery/resource changes after admission: invalidate later retry decisions unless the atomic transaction already committed the local transition.

## Atomicity requirement
For a single local transaction to collapse CONTROL_ADMITTED and LOCAL_EFFECT_COMMITTED, the state transition must be computed without exposing an uncommitted protected mutation. The transaction must atomically guard predicates and commit the resulting durable state/history. Every protected mutation path must use that boundary. A handler that mutates shared state first and persists later cannot satisfy this requirement.

## Isolation/concurrency
stateRevision can remain a local optimistic-concurrency version. It is not OwnerFence. The future transaction must compare the current authority/resource/STOP context at the protected commit point. Concurrent stale writers must fail without producing protected mutation.

## Durability/recovery
Durability must specify what survives application crash versus OS crash/power loss. A temp-file rename alone does not establish the required crash protocol. The contract must define recovery markers/history and the exact pre/post state after each crash cut.

## Multi-resource scope
If multiple local participants are included in the same transaction, all must share the same durable atomic boundary. Otherwise participant outcomes remain independent and partial commit is possible. Cross-boundary effects remain separate.

## Bypass inventory
Current protected mutation entry points identified in the inspected path:
- repair_agent_state
- repair_agent_needs
- repair_resource_state
- execute_lumina_action -> executeAction(...)
Any future direct mutation of simulation.world, simulation.agents, or equivalent protected state outside the contract is a bypass.

## Decision
The next architecture step is formal refinement of this contract, not implementation. A bounded local transaction can potentially combine control admission with durable local effect commit, but only inside a proven transactional boundary. External effects, external fencing, and world-truth evidence remain separate.

## Verification status
No formal verification.
No implementation.
No current CI PASS claimed.

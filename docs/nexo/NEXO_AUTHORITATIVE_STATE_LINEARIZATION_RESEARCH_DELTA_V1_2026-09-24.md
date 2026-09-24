# NEXO AUTHORITATIVE STATE AND LINEARIZATION RESEARCH DELTA V1
Date: 2026-09-24
Status: RESEARCH ONLY — ARCHITECTURE STILL BLOCKED

## External cross-check
NIST SP 800-160 states that system security applies to all system modes, states, and transitions, and that recovery/reconstitution must itself be secure; NIST also frames trustworthy engineering across the complete lifecycle and system boundary. This directly supports treating state-transition safety and trusted recovery as architectural semantics rather than implementation afterthoughts.

## 1. Core question
The previous object matrix exposed a decisive question:

Where is the authoritative serialization point for a protected transition?

The answer cannot be:
- whichever service receives the request first;
- whichever database writes first;
- whichever process currently holds a lease;
- whichever evidence record was written last;
- whichever model/planner believes the operation succeeded.

Those mechanisms may participate, but none is automatically the canonical serialization point.

## 2. Candidate authoritative-state models

### Model A — Single authoritative state machine
One authoritative state machine owns all safety-critical transition state.

Advantages:
- clear linearization boundary;
- simpler invariant reasoning;
- easier crash/restart semantics;
- one canonical revision/order.

Costs/open questions:
- scalability;
- availability under partition;
- external effects remain outside the state machine;
- large state surface could enlarge TCB.

Status: viable candidate, not selected.

### Model B — Partitioned authoritative stores with transactional commit
Different domains own state, but protected transitions use a transaction mechanism providing the required atomicity/isolation.

Advantages:
- domain separation;
- potentially better scalability;
- explicit ownership.

Risks:
- transaction semantics must actually match safety requirements;
- cross-store failures can create ambiguity;
- implementation proof burden is high.

Status: viable candidate, not selected.

### Model C — Protocolized multi-store transition
No global transaction. Protected transitions use fencing, immutable identities, monotonic epochs, idempotency, durable intent, reconciliation and compensating/recovery protocols.

Advantages:
- tolerant of heterogeneous/external systems;
- explicit failure semantics;
- potentially more deployable.

Risks:
- harder correctness proof;
- many partial states;
- reconciliation becomes critical;
- easy to accidentally claim atomicity that does not exist.

Status: viable candidate, not selected.

## 3. Important distinction
Internal transition atomicity and external-world atomicity are different problems.

Internal:
state_before → linearized_transition → state_after

External:
request → uncertain network/system → world effect

The architecture cannot make an external system atomic merely by making its local database transaction atomic.

Therefore:
- internal protected transitions need a defined linearization mechanism;
- external effects need exact identity, idempotency/replay semantics, observation and reconciliation;
- ambiguity remains UNKNOWN until reconciled.

## 4. Linearization contract
For each protected operation, define:
- operation_id;
- effect_id/effect_key;
- target fingerprint;
- normalized parameter fingerprint;
- authority context;
- policy/invariant versions;
- coordination fence/generation;
- preconditions;
- linearization point or equivalent serialization proof;
- durable outcome;
- evidence requirements;
- failure/timeout semantics.

The critical property is:

No stale or competing actor can make a protected transition appear committed after its authority/fence has become invalid.

## 5. Revision semantics
A global counter may provide ordering, but ordering alone does not prove atomicity.

Required distinctions:
- revision/order identifier;
- authority epoch;
- lease generation;
- evidence version;
- configuration/version-set;
- external-effect identity.

These values may correlate, but must not be treated as interchangeable.

## 6. Cross-store failure matrix

| Failure | Required semantic result |
|---|---|
| state write succeeds, audit write fails | transition cannot silently become fully committed; recovery/reconciliation required |
| audit succeeds, state write fails | audit cannot authorize the missing state transition |
| lease renewal fails during protected transition | transition outcome depends on defined linearization/fencing semantics; cannot assume success |
| authority revokes after request but before linearization | transition must be rejected if revocation precedes its authoritative point |
| authority revokes after linearization | result depends on explicit post-linearization policy; historical committed fact is not erased |
| process crashes after external request, before response | external effect UNKNOWN |
| external response lost after effect | UNKNOWN until reconciled |
| evidence write succeeds with stale context | evidence invalid for current claim |
| policy changes after release decision | affected release decision must be re-evaluated |
| restart after partial transition | durable state determines recovery path; restart creates no authority |

## 7. New invariants
LIN-01: Every protected transition has one defined linearization point or an explicitly proven equivalent serialization protocol.
LIN-02: Revision/order identifiers do not substitute for linearizability.
LIN-03: Lease generation does not substitute for authority.
LIN-04: Authority epoch does not prove external-world state.
LIN-05: Local atomicity does not imply external atomicity.
LIN-06: A protected transition cannot be finalized solely from an executor response when the effect is externally ambiguous.
LIN-07: Crash/restart preserves uncertainty where the external effect cannot be determined.
LIN-08: Cross-store partial completion has explicit recovery/reconciliation semantics.
LIN-09: Evidence generated under a superseded context cannot satisfy a current claim unless explicitly revalidated.
LIN-10: Historical committed state is not rewritten by later revocation; current authority determines future transitions.

## 8. TCB consequence
If a single state machine is selected, its serialization mechanism becomes part of the TCB.

If partitioned stores are selected, the transaction coordinator or equivalent protocol becomes part of the TCB for the claims it protects.

If a protocolized multi-store design is selected, the fencing/idempotency/reconciliation machinery becomes part of the TCB.

Therefore TCB membership is derived from the claim and chosen mechanism, not from component names.

## 9. Research conclusion
There is no justified basis yet to choose A, B, or C.

The clean architecture must first specify:
1. protected transitions;
2. required atomicity semantics;
3. failure semantics;
4. durability requirements;
5. external-effect reconciliation requirements;
6. acceptable availability/partition behavior.

Only then can state-store topology be selected without accidentally designing the implementation around a hidden assumption.

## 10. Next gate
Before architecture:
- formalize the transition atomicity contract;
- map each protected transition to required linearizability/serialization strength;
- identify which transitions can tolerate eventual consistency;
- identify which transitions require strong consistency;
- identify external boundaries where atomicity is impossible;
- define reconciliation contracts;
- map all of this to TLA/model state and future implementation tests.

DESIGNED != IMPLEMENTED != TESTED != VERIFIED.

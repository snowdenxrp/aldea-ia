# NEXO PROTECTED TRANSITION CONSISTENCY CLASSIFICATION V1
Date: 2026-09-24
Status: RESEARCH/CONSOLIDATION — ARCHITECTURE STILL BLOCKED

## External basis
NASA requirements management requires bidirectional traceability and evaluation of changes across the lifecycle; configuration management controls baselines, changes, integrity, and historical configuration. NASA also distinguishes verification (compliance with specifications) from validation (whether the product accomplishes its intended purpose). These practices support assigning explicit semantics and verification evidence to each protected transition rather than treating consistency as a generic database property.

## 1. Purpose
This matrix classifies protected transitions by the consistency/serialization strength their safety meaning requires. It deliberately does not select a storage technology.

Key rule:
CONSISTENCY STRENGTH IS DERIVED FROM THE PROPERTY BEING PROTECTED, NOT FROM THE DATABASE CHOSEN.

## 2. Classification vocabulary

- L0 — LOCAL/DERIVED: no authority or safety decision depends on atomic cross-object ordering.
- L1 — DURABLE ORDERED: durable ordering is required, but concurrent operations need not be globally linearizable.
- L2 — SERIALIZED PROTECTED TRANSITION: conflicting transitions must have one authoritative serialization order.
- L3 — LINEARIZABLE AUTHORITY/SAFETY TRANSITION: observers must not be able to accept a stale result as current after a conflicting transition.
- L4 — EXTERNAL EFFECT BOUNDARY: local serialization is necessary but insufficient; external ambiguity requires effect identity, fencing/idempotency where available, and reconciliation.

L4 is not a stronger database consistency level. It is a boundary classification: external-world truth cannot be obtained from local commit alone.

## 3. Transition matrix

| Transition | Required class | Why | Can be eventual? | External boundary? | Critical evidence |
|---|---|---|---|---|---|
| Request → Normalized | L0/L1 | deterministic canonicalization | yes if immutable replayable result | no | normalized request |
| Normalized → Fingerprinted | L1 | stable identity | no semantic need for global ordering | no | fingerprint |
| Fingerprinted → Admitted | L2 | admission must not race with contradictory policy/context | generally no | no | current policy/invariant |
| Admitted → Authorized | L3 | authority must be current at decision point | no | no | AuthorityContext |
| Authorized → Reserved | L3 | prevents competing/stale reservation | no | no | authority + fence |
| Reserved → Prepared | L2/L3 | protected preparation cannot use stale scope | no for critical effects | possibly | preparation attestation |
| Prepared → Executing | L3 | stale actor must not start after revocation/fence | no | yes if actuation begins | current fence/authority |
| Executing → External Unknown | L4 | crash/timeout can make world effect unknowable | state durable | yes | effect identity |
| Executing → Applied | L4 | local response is not necessarily world truth | no local shortcut | yes | external confirmation |
| Applied → Observed | L4 | observation must bind exact effect/target/time | observation may arrive async | yes | provenance/freshness |
| Observed → Reconciled | L4 | observation must establish external effect state | processing can be async, decision cannot bypass it | yes | reconciliation record |
| Reconciled → Verified | L3/L4 | current evidence/context must support claim | no for release-critical claims | often | verified evidence |
| Verified → Committed | L3 | durable mission history must reflect authorized verified state | no | depends | current authority + evidence |
| Stop requested → Stop enforcing | L3 | stop must dominate normal execution | no | possibly | independent stop path |
| Stop enforcing → Stop verified | L3/L4 | executor ACK alone insufficient | no | often | independent verification |
| Recovery started → Quarantined | L3 | restart cannot grant authority | no | no | recovery fence |
| Recovery reconciled → Release eligible | L3/L4 | unresolved effects block release | no | often | reconciliation + current authority |
| Release eligible → Execution enabled | L3 | explicit release required | no | no | release decision |
| Policy change → New baseline active | L3 | safety meaning may change | no | no | approved baseline |
| VersionSet change → Active | L3 | individually valid parts may form invalid combination | no | no | configuration attestation |
| Evidence → Invalidated | L2/L3 | stale context cannot remain authoritative | propagation may async, enforcement cannot lag silently | no | invalidation cause |
| Delegation → Revoked | L3 | stale delegate must lose future authority | no | possibly | revocation epoch |
| Decommission → Closed | L3/L4 | must close authority, effects, workers and recovery paths | no for closure claim | often | closure evidence |

## 4. Important consequence
Only a subset requires the strongest internal consistency:

- authority admission;
- protected capability transitions;
- stop dominance;
- recovery release;
- revocation;
- safety-relevant configuration activation;
- release/commit decisions.

Other data can be eventually consistent only when delayed convergence cannot create an unsafe authorization or false protected claim.

## 5. Eventual consistency boundary

An object may be eventually consistent only if all of the following hold:

1. stale data cannot grant authority;
2. stale data cannot clear a safety fence;
3. stale data cannot establish verified external truth;
4. stale data cannot erase UNKNOWN;
5. stale data cannot bypass current policy/invariant versions;
6. convergence failure produces HOLD/RESTRICT/REVALIDATE rather than unsafe continuation;
7. the claim explicitly tolerates temporary divergence.

Therefore:
EVENTUAL ≠ UNSAFE BY DEFINITION
but
EVENTUAL + AUTHORITY EFFECT = NOT ACCEPTABLE WITHOUT A SEPARATE PROTECTION MECHANISM.

## 6. Linearization-point inventory

Each L3 transition needs an explicit candidate linearization point:

- authorization: authoritative acceptance of current AuthorityContext;
- reservation: authoritative acquisition/fencing of the protected resource;
- execution admission: final protected gate immediately before actuation;
- stop enforcement: independent transition that blocks/interrupts execution;
- revocation: authoritative invalidation point;
- recovery release: explicit release transition after reconciliation;
- configuration activation: authoritative activation of a complete validated VersionSet;
- verified commit: authoritative durable acceptance of the verified result.

These are semantic requirements, not yet implementation mechanisms.

## 7. L4 external-effect contract

For every external effect:

EFFECT_REQUEST
→ EXACT_EFFECT_IDENTITY
→ TARGET_BINDING
→ PRECONDITIONS
→ AUTHORIZED_EXECUTION
→ EXTERNAL_ATTEMPT
→ {APPLIED | NOT_APPLIED | UNKNOWN | PARTIALLY_APPLIED}
→ OBSERVATION
→ RECONCILIATION
→ VERIFIED CLAIM

Forbidden:
- timeout → NOT_APPLIED;
- process exit → NOT_APPLIED;
- new operation_id → resolves old UNKNOWN;
- executor ACK → external truth;
- local transaction commit → external effect proof.

## 8. Partition behavior

A partition must be treated as a first-class state transition condition.

For L3 transitions:
- if current authority/fence cannot be established, deny/hold;
- never substitute stale authorization merely because it is locally cached;
- recovery cannot silently manufacture current authority.

For L4:
- preserve effect identity;
- persist UNKNOWN when outcome cannot be determined;
- use reconciliation before declaring final external state.

## 9. Crash behavior

Every protected transition must answer:
- what was durable before crash?
- what was only in memory?
- can an old actor resume?
- which fence/epoch invalidates it?
- can the operation be retried?
- if retried, does the same effect identity apply?
- how is duplicate external execution prevented or reconciled?
- what evidence survives?
- what becomes UNKNOWN?

No transition is complete architecturally until these answers are explicit.

## 10. New invariants

CONS-01: Consistency strength is derived from the protected property.
CONS-02: L3 transitions have an explicit authoritative serialization/linearization point or proven equivalent protocol.
CONS-03: Eventual consistency cannot directly grant or clear critical authority.
CONS-04: Stale state cannot clear a stop/recovery fence.
CONS-05: External effect ambiguity survives crash, timeout and restart.
CONS-06: Local atomicity cannot prove external-world atomicity.
CONS-07: Critical release decisions require current context, not merely durable historical PASS state.
CONS-08: Policy/configuration changes affecting safety trigger impact analysis and re-evaluation.
CONS-09: A transition's durability and consistency requirements are separately specified.
CONS-10: Each protected transition has explicit partition, crash, retry, timeout and recovery semantics.

## 11. Remaining research gate

Before selecting architecture/storage:
1. enumerate every protected transition exhaustively;
2. prove the classification is complete;
3. define exact pre/postconditions;
4. define conflict pairs;
5. define linearization candidates;
6. define durable state required at each boundary;
7. define recovery semantics;
8. map each transition to formal state/transition representation;
9. map each transition to future implementation tests;
10. identify transitions whose required semantics cannot be provided by a chosen deployment environment.

Architecture remains BLOCKED until this gate is sufficiently complete.

DESIGNED != IMPLEMENTED != TESTED != VERIFIED.

# NEXO - CONTROL ATOMICITY VS EXTERNAL EFFECT CONTRACT BOUNDARY - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question
When Nexo can atomically commit its own admission/control state but an external provider or resource cannot participate in that transaction, what can Nexo legitimately guarantee, and where must it stop claiming atomicity?

## Cross-checks
AWS documents that distributed exactly-once behavior is difficult and that idempotency tokens make repeated requests safer only when the provider implements the contract. Durable Execution distinguishes replay/retry semantics from end-to-end exactly-once effects. https://docs.aws.amazon.com/durable-execution/patterns/best-practices/idempotency/
AWS callbacks also separate initiating external work from receiving confirmation of completion. https://docs.aws.amazon.com/durable-execution/sdk-reference/operations/callback/
Saga architecture handles transactions across independent services through local transactions and compensation rather than one ACID transaction, with important tradeoffs around isolation and rollback. https://microservices.io/patterns/data/saga.html

## Core result
Nexo can make strong claims about its own authoritative control transition when that transition is atomic and durable. It cannot automatically extend that atomicity across an external provider that does not participate in the same protocol.

CONTROL_ATOMICITY != EXTERNAL_ATOMICITY
CONTROL_COMMIT != EFFECT_COMMIT
EFFECT_COMMIT != WORLD_TRUTH

## External contract classes
E0 TRANSACTIONALLY_PARTICIPATING: provider/resource participates in a protocol sufficient for the requested claim.
E1 IDEMPOTENT_RECONCILABLE: stable effect identity, durable deduplication, status/history, resource incarnation and adequate fencing/cancellation.
E2 FENCED_BUT_INCOMPLETELY_OBSERVABLE: stale future actions can be blocked but historical outcomes may remain UNKNOWN.
E3 NON_IDEMPOTENT_WEAKLY_OBSERVABLE: no stable identity/history/fencing sufficient to distinguish possible outcomes; strong post-failure claims may be impossible.
E4 OPEN_UNBOUNDED: no trustworthy effect boundary or bounded environment assumption; strong global claims are inadmissible.

## ControlCommit
If Nexo atomically commits admission, current authority/context, invalidation generation, durable intent and relevant fence state, it can establish ADMISSION_COMMITTED(E,C,G). This is an authoritative control fact, not an external-world fact.

## ExternalEffectContract
Relevant dimensions include effect identity, attempt identity, target identity, resource incarnation, request semantics, provider acceptance semantics, commit boundary, ACK semantics, idempotency, retry/redrive, cancellation/fencing, status/history, retention, replacement, autonomous continuation, crash semantics, reconciliation, compensation and assumptions/dependencies.
If the contract does not define a property, Nexo must not silently assume it.

## ACK ladder
A0 RECEIVED -> A1 ACCEPTED -> A2 DURABLE_INTENT -> A3 EXECUTION_STARTED -> A4 EFFECT_COMMIT -> A5 EFFECT_CONFIRMED -> A6 RECONCILED -> A7 VERIFIED_FOR_CLAIM.
ACK may promote only to the level justified by the external contract. ACK is not EFFECT_COMMIT unless equivalence is explicitly established.

## Crash boundary
ControlCommit -> external request -> provider commits effect -> Nexo crashes before recording the outcome.
Missing local record does not prove no effect. Possible worlds include no effect, accepted-not-committed, committed, committed with retry pending, and committed with lost observation. The correct state may remain EXTERNAL_EFFECT_UNKNOWN.

## Outbox limitation
An outbox can atomically couple Nexo control state to durable message intent inside Nexo. It does not make Nexo storage and an arbitrary external provider one atomic transaction.

## Idempotency limitation
Stable provider idempotency can make ambiguous retry safer, but does not automatically prove desired semantic state, cancellation, isolation, unchanged resource incarnation or historical absence.
IDEMPOTENCY != ATOMICITY
IDEMPOTENCY != WORLD_TRUTH
IDEMPOTENCY != ISOLATION

## Compensation
If external effect E commits and local control fails, compensation C is a NEW PROTECTED EFFECT. It can race with E retries, redrive, other actors, STOP, resource replacement and other compensation.
COMPENSATION != UNDO
COMPENSATION != TIME_REVERSAL

## Exact claim boundary
Nexo may claim CONTROL_COMMIT_ATOMIC when its protected store establishes that fact.
It may claim EFFECT_COMMIT only when the external protocol provides sufficient evidence for that exact effect class.
It may claim WORLD_STATE only after the required reconciliation/verification contract supports it.
It must not promote CONTROL_COMMIT -> EFFECT_COMMIT -> WORLD_STATE by assumption.

## Claim ladder
CONTROL_COMMITTED -> EXTERNAL_REQUESTED -> EXTERNAL_ACCEPTED -> EXTERNAL_COMMIT_UNKNOWN -> EXTERNAL_COMMIT_CONFIRMED -> WORLD_STATE_RECONCILED -> CLAIM_VERIFIED.
Weak external contracts may legitimately terminate at UNKNOWN or DEGRADED.

## Atomicity budget
Candidate AtomicityBudget grains: G0 command, G1 control admission, G2 coordination/fence, G3 resource enforcement, G4 external effect commit, G5 mission invariant/world outcome.
Nexo should claim only the highest grain actually supported.

## Effect-class-specific semantics
Financial debit, actuator command, message publication, file mutation, database mutation, deployment, reservation and irreversible physical action have different commit, cancellation, retry, reconciliation and compensation semantics. Therefore EffectClass maps to its own ExternalEffectContract.

## Unreconcilable effects
Before admitting weakly observable effects, evaluate reversibility, duplicate safety, stale-effect fencing, reconciliation, mission-invariant impact, autonomous continuation, containment and whether a weaker claim suffices.
If an unsafe branch remains possible: DO NOT ADMIT. If the action is safe across every allowed outcome, SAFE_UNDER_UNCERTAINTY may permit bounded admission. Otherwise HOLD or QUARANTINE.

## Open-world limitation
If an external provider can perform a protected effect through an unknown bypass path, Nexo cannot claim complete external control. UNKNOWN_PATH != NO_PATH. Strong claims require a closed world, enforceable effect boundary, or explicit bounded environment assumptions.

## Candidate theorem
Not formally proven: if Nexo has atomic authoritative control commit, durable stable effect identity, current resource/provider identity, enforceable effect boundary, a provider contract sufficient for the requested claim, crash/replay-safe reconciliation and complete relevant effect-path closure, then it can separate internal control atomicity from external outcome uncertainty and make only the strongest claim supported by the external contract. If a mandatory premise is UNKNOWN, the claim must be degraded or blocked.

## Candidate invariants INV-XAB-01..32
01 Control atomicity does not imply external atomicity.
02 ControlCommit is distinct from EffectCommit.
03 EffectCommit is distinct from world-state truth.
04 External provider participation must be explicit.
05 No ACK promotion without contract semantics.
06 Idempotency does not imply atomicity.
07 Idempotency does not imply isolation.
08 Idempotency does not imply world truth.
09 Stable effect identity is required where retry or reconciliation depends on it.
10 Attempt identity remains distinct from effect identity.
11 Resource incarnation is part of external identity when relevant.
12 Durable outbox intent does not equal external execution.
13 Missing local record does not prove no external effect.
14 External commit before local recording remains UNKNOWN until adequate evidence.
15 Compensation is a new protected effect.
16 Compensation is not automatic rollback.
17 Retry is a new execution attempt unless provider contract proves otherwise.
18 Provider autonomous continuation belongs to effect-path closure.
19 External cancellation must be contract-proven.
20 Fence activation must be enforced at the effect boundary.
21 Fence enforcement does not classify historical UNKNOWN.
22 Weak external contracts may require permanent degraded claims.
23 Open external bypass paths prevent strong global claims.
24 Claim strength cannot exceed external contract strength.
25 Atomicity grain must be explicit.
26 Effect-class semantics determine recovery protocol.
27 Reconciliation is distinct from control commit.
28 Reconciliation evidence is claim-specific.
29 Control-store recovery does not restore external truth.
30 External contract drift invalidates dependent assurance.
31 Provider version equality does not prove contract equality.
32 Unknown mandatory contract property blocks strong admission.

## Architectural conclusion
Nexo can atomize its control, but cannot atomize an external world that does not participate in the protocol.
The correct design is contract-bounded atomicity: INTERNAL ATOMICITY + EXTERNAL EFFECT CONTRACT + FENCING + RECONCILIATION + EXPLICIT UNKNOWN.

## Open gaps
G-XAB-01 formal atomicity-budget model.
G-XAB-02 provider contract verification.
G-XAB-03 formal refinement from provider contract to Nexo claim.
G-XAB-04 effect-class taxonomy completeness.
G-XAB-05 external effect boundary implementation.
G-XAB-06 fault injection across provider commit/local crash window.
G-XAB-07 compensation safety under joint uncertainty.
G-XAB-08 autonomous continuation closure.
G-XAB-09 actual SANY/TLC/TLAPS.
G-XAB-10 implementation refinement.
G-XAB-11 long-duration idempotency/retention testing.

## Next attack
EFFECT-CONTRACT MINIMALITY + UNRECONCILABLE EFFECTS + MISSION INVARIANTS.
Question: what is the minimum external contract required before Nexo is allowed to admit an effect whose UNKNOWN outcome could violate a mission-level invariant, and when must Nexo reject an otherwise locally valid operation?
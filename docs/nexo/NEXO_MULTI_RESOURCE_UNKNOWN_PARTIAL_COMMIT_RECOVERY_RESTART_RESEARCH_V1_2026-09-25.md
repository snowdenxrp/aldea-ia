# NEXO — MULTI-RESOURCE UNKNOWN + PARTIAL COMMIT + RECOVERY RESTART RESEARCH V1
Date: 2026-09-25
Status: RESEARCH / ARCHITECTURAL PRECONDITION
Implementation: BLOCKED. No V21.

## Scenario
A protected operation spans resources A and B. A commits. B becomes UNKNOWN. Recovery actor R1 crashes. R2 restarts from a checkpoint. Resource B is replaced with a new incarnation. STOP changes while recovery is running. Stale evidence and late ACKs arrive.

## External cross-check
Transactional-outbox material shows that a crash can occur after an external publication but before durable local recording, so replay must tolerate duplicate/ambiguous delivery; idempotency is a consumer-side property and does not make the whole distributed operation atomic. citeturn0search0turn0search3
AWS Saga guidance treats continuation/retry and compensation as different recovery paths and notes that compensating transactions are separately designed operations. It does not establish that compensation is safe under UNKNOWN; that safety remains effect-specific. citeturn0search1turn0search2
AWS guidance on distributed recovery emphasizes reconciliation after partial failures and preserving reconciliation evidence rather than assuming eventual consistency resolves discrepancies. citeturn0search5

## Findings
MRU-01: The operation must preserve a stable operation identity across recovery, while each resource binding must include a resource incarnation. A replacement resource is not automatically the same participant.
MRU-02: A partial commit state must be representable explicitly: A=CONFIRMED while B=UNKNOWN is not equivalent to whole-operation FAILURE or UNKNOWN.
MRU-03: Global operation status cannot be derived by collapsing participant states into one boolean.
MRU-04: The recovery checkpoint must preserve participant-level effect identities, resource incarnations, evidence generations, and unresolved states.
MRU-05: Restarting recovery creates a new recovery incarnation; restoring R1's checkpoint does not restore R1's authority.
MRU-06: R2 must reacquire current recovery ownership/fence before protected reconciliation, retry or compensation.
MRU-07: If B was replaced, evidence referring to old-B cannot establish current state of new-B unless an explicit continuity/identity contract proves equivalence.
MRU-08: A late ACK from old-B may be valid historical evidence for old-B but must not be promoted into current-new-B state.
MRU-09: STOP changes invalidate pending release/retry/compensation decisions whose admission depended on the prior STOP context.
MRU-10: STOP does not resolve A/B outcome ambiguity and does not prove external quiescence.
MRU-11: Recovery can reconcile under STOP while execution remains fenced, but clearing STOP requires its own protected transition.
MRU-12: Cross-resource recovery needs a footprint: participants, effect identities, resource incarnations, and dependencies. The footprint cannot silently expand after commitment.
MRU-13: If A is confirmed and B remains UNKNOWN, compensating A may create a second distributed effect; it must not be treated as a generic way to restore an imagined pre-operation state.
MRU-14: A retry of B is admissible only if B's external identity/idempotency semantics and current resource incarnation make duplicate/late execution safe.
MRU-15: If B's old resource disappeared/replaced and its outcome remains UNKNOWN, automatic retry against new-B is unsafe unless the operation contract defines transfer semantics from old-B to new-B.
MRU-16: Compensation of A while B is UNKNOWN is admissible only under a contract that proves safety for both B=ABSENT and B=PRESENT/PARTIAL possibilities still admitted.
MRU-17: If neither reconciliation nor bounded compensation can establish a safe path, QUARANTINE/HOLD is the valid convergence state.
MRU-18: A multi-resource decision must bind all relevant context generations: authority/recovery epoch, STOP epoch, resource incarnation/fence, policy/invariant version, evidence generation.
MRU-19: Reconciliation must be monotonic per claim and generation-aware; a late weaker observation must not regress a stronger current fact.
MRU-20: Conflicting recovery decisions require protected serialization/CAS or explicit conflict state; last writer wins is unsafe when contexts differ.
MRU-21: Evidence for one participant cannot silently prove another participant's state.
MRU-22: A successful local transaction on A does not prove atomic commitment of A+B.
MRU-23: A durable intent for A+B proves planned/prepared context, not external completion.
MRU-24: The minimum universal state model needs participant-level outcome plus aggregate decision state.
MRU-25: Cross-resource atomicity cannot be inferred from local idempotency keys.
MRU-26: If the operation contract chooses Saga semantics, partial completion and compensation are first-class states; if it chooses a stronger atomic protocol, the protocol must specify participant prepare/commit/recovery semantics. No family is selected yet.
MRU-27: The architecture must retain enough history to explain why a recovery decision was made, including the exact uncertainty set and evidence/context generation.
MRU-28: A resource replacement boundary is a semantic discontinuity unless the system has an explicit continuity certificate/contract.
MRU-29: A recovery restart is a new control actor, not a continuation of authority merely because it has the same checkpoint.
MRU-30: The minimum safe generic rule is: partial commit + unresolved participant + changed resource incarnation or stale context => no automatic compensating/retry effect until reconciliation establishes admissibility.

## Minimum candidate state
Operation:
- operation_id
- effect_class
- operation_generation
- participant_bindings[]

ParticipantBinding:
- participant_id
- resource_identity
- resource_incarnation
- external_effect_identity
- outcome: ABSENT | PRESENT | PARTIAL | UNKNOWN
- evidence_refs
- evidence_generation
- fence/epoch
- last_authoritative_transition

RecoveryContext:
- recovery_incarnation
- owner_identity
- recovery_epoch
- authority_epoch
- stop_epoch/state
- policy/invariant version
- dependency/footprint version
- checkpoint sequence

RecoveryDecision:
- decision_id
- operation_id
- decision_generation
- uncertainty_set
- decision: RETRY | WAIT | RECONCILE | COMPENSATE | QUARANTINE
- admissibility_basis
- evidence_refs
- context_binding
- protected linearization reference

These are candidate objects, not final schema.

## Candidate invariants
INV-MRU-01: Participant outcomes MUST remain distinct.
INV-MRU-02: Resource replacement MUST create a distinct incarnation unless continuity is explicitly proven.
INV-MRU-03: Recovery restart MUST NOT restore prior authority.
INV-MRU-04: Late evidence MUST be bound to its participant/resource incarnation and observation generation.
INV-MRU-05: STOP context changes MUST invalidate affected pending decisions.
INV-MRU-06: Partial commit MUST NOT be collapsed into whole-operation failure.
INV-MRU-07: Retry/compensation MUST be authorized against the current resource incarnation/fence.
INV-MRU-08: Compensation under UNKNOWN MUST be effect-class bounded.
INV-MRU-09: Cross-resource footprint MUST be explicit and non-expanding after commitment.
INV-MRU-10: Conflicting recovery decisions MUST serialize, compare-and-set, or quarantine.
INV-MRU-11: Evidence from participant A MUST NOT prove participant B without an explicit dependency contract.
INV-MRU-12: Aggregate completion MUST satisfy the operation's declared atomicity/evidence contract.
INV-MRU-13: Checkpoint restoration MUST NOT restore current ownership or release eligibility.
INV-MRU-14: Changed policy/invariant/STOP/resource incarnation MUST trigger revalidation of affected recovery progress.
INV-MRU-15: UNKNOWN + changed incarnation + no continuity proof MUST default to HOLD/QUARANTINE for nontrivial effects.

## Architecture consequence
The clean architecture needs a participant-aware External Effect State rather than one operation-level status. The operation needs an explicit atomicity model, participant footprint, and aggregate recovery decision. Recovery checkpoints need identity/context binding but cannot carry authority forward. Resource replacement must be modeled as a new incarnation. The execution-owner contract must eventually persist the participant-level prepared intent before external execution, but implementation remains blocked until the ownership contract is explicitly designed.

## Open questions
1. Exact aggregate state algebra for participant outcomes.
2. Formal refinement for Saga vs stronger atomicity families.
3. Continuity certificate semantics across resource replacement.
4. Minimum evidence proving ABSENT/PRESENT/PARTIAL for each effect class.
5. Cross-resource STOP and emergency-compensation policy.
6. Conflict-resolution protocol for concurrent recovery decisions.
7. Fault injection matrix for A-commit/B-unknown/restart/replacement/STOP races.
8. Whether participant outcome history belongs in authoritative core or effect/observation plane.

## Next attack
AUDIT THE EXECUTION-OWNER CONTRACT against this multi-resource model:
- What exact authority owns prepared-intent persistence?
- What is the protected linearization point?
- How are stateRevision, effectJournal and world mutation coordinated?
- What survives a crash between prepare persistence, participant A execution, participant B execution, and terminal persistence?
- Which semantics belong to the generic runtime versus effect-class policy?
- What happens when the owner itself restarts?

Do not implement.
Do not construct V21.
Maintain DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED != DEPLOYED VERIFIED.

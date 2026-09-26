# NEXO AB104.225 — COMPOSED EPOCH + RESOURCE FENCE + TARGET CAS ATTACKS V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
Global authority epoch, resource-scoped fencing token and target conditional version solve different races. They should not be treated as interchangeable.
The strongest composition studied is conceptually:
authority epoch/root -> resource incarnation + monotonically ordered fence -> target conditional version/atomic acceptance -> effect receipt.
Each layer answers a different question: Is this authority generation current? Is this worker stale for this resource? Is the target accepting this exact state transition now?
Composition is only safe if the layers have one explicit ordering model. Otherwise two individually valid mechanisms can disagree.

## Attack A — E2 revocation but target fence remains E1
If authority has advanced to E2 but the target has not learned E2, a worker carrying E1 may still be accepted unless the target's fence is itself authoritative for the same authority domain.
Classification: partition/liveness problem versus safety problem. If stale E1 can still mutate a safety-critical target, the target boundary is not enforcing the authority transition.

## Attack B — target fence advances but global epoch does not
A resource-local fence may reject stale workers for that resource while an older global authority remains otherwise valid.
This is not inherently contradictory: global authority and resource serialization can have different scopes. But the protocol must define whether resource fencing can revoke an otherwise globally authorized operation.
Open design question, not resolved here.

## Attack C — CAS succeeds under stale epoch
Suppose target.version matches the expected version and CAS succeeds, but the request carries E1 while current authority is E2.
A correct CAS over resource state alone does not prove current authority. The conditional must include the authority/fence predicate if current authorization is part of the safety property.
Therefore target CAS and authority validation cannot be treated as separate checks with an uncontrolled gap.

## Attack D — authority check then CAS
Worker verifies E1, reads target version 41, pauses, authority rotates to E2, then sends CAS(expected=41,E1).
If target atomically checks both expected target version and current authority/fence, it rejects. If target checks only version, stale E1 can succeed.
Conclusion: the authorization predicate must participate in the same target-side linearization boundary when stale authorization must be impossible.

## Attack E — CAS succeeds, then revocation
If the target atomically accepts E1 and advances its state before revocation linearizes, the effect is historically committed under E1.
Later revocation must not retroactively classify the effect as unauthorized execution.

## Attack F — restore target from version 41 to 33
A previously rejected or obsolete fence may become usable if target state is restored without a continuity anchor.
Therefore CAS/version and fence monotonicity both require rollback-resistant continuity if they are used for safety.

## Attack G — clone
A cloned device may carry a valid E1 authorization and local fence metadata. If both clones can reach the same target, local state cannot prevent duplicate/stale effects.
The target must enforce a shared authority/fence namespace or an independent canonical authority.

## Attack H — partial effect
Parent operation is authorized under E1. Child A commits under fence 41; child B is delayed until E2.
Fence must be evaluated at child-effect acceptance if children can independently cross the external boundary. Parent authorization cannot automatically authorize every later child.
Recovery must preserve child-level identity and evidence.

## Attack I — partitioned target
Authority rotates to E2 while target is partitioned and cannot learn E2.
Two possible protocol policies exist: fail closed for safety, or permit bounded historical authority with an explicitly weaker safety property. Nexo cannot silently claim strong current-authority enforcement if the target cannot observe the current authority state.
No policy selected.

## Attack J — two roots / two epochs
Device A accepts E2a and device B accepts E2b from conflicting branches.
An epoch number alone cannot resolve the fork. The epoch must be bound to a canonical authority root/configuration and transition evidence.
Two numerically equal epochs with different roots remain conflicting, not equivalent.

## Attack K — incarnation reuse
Resource R1 is destroyed. New R2 receives the same resource ID R.
A fence token valid for R1 must not become valid for R2 merely because the numeric resource ID matches.
Candidate identity boundary: (resource_id, resource_incarnation, authority_root/epoch, fence).

## Current prototype code study
Direct main-branch inspection added simulation-adapter.js and memory.js.
- simulation-adapter.js blob SHA: 291ef4d43ca1af2dad29503d8c15f5cdd05aa114
- memory.js blob SHA: c70f246a85e8c513b8f746d7de237f881b0de91c

Observed:
1. simulation-adapter.js defines nexoEffectRevision as a local integer and increments it after simulated mutations.
2. effect-adapter.js reads this revision before precondition and again before handler execution.
3. The simulated handlers mutate the in-memory simulation directly and then bump nexoEffectRevision.
4. This gives the prototype a useful local state-change signal, but it is not a target-side authority fence and has no demonstrated anti-rollback semantics.
5. memory.js keeps effectJournal to the last 200 entries and executions to the last 200 entries. This reinforces the AB104.214-216 retention concern: local bounded arrays are not a complete unresolved-effect history.
6. memory.js reconstructs a verified completed attempt preferentially and avoids regressing it with later failed/blocked results. This is useful local reconstruction behavior, but it does not prove external effect completion.
7. recordNexoOutcome intentionally refuses a second outcome for the same mission/step, while runtime uses missionId:stepId as the execution idempotency key. This is local mission semantics, not target-side idempotency/fencing.
8. No authority epoch/fence/target incarnation mechanism was observed in these inspected files.

## Important correction preserved
The prototype's nexoEffectRevision is not an authority epoch. It is a simulation-state revision.
Confusing these would incorrectly elevate local simulation state into security authority.

## Minimal composition hypothesis
A future architecture may need three distinct bindings:
1. Authority binding: root + epoch/configuration.
2. Resource binding: resource identity + incarnation + monotonic fence.
3. Acceptance binding: target version/conditional state at the actual effect boundary.
The exact composition remains OPEN. This is a research hypothesis, not an implementation decision.

## Evidence classification
- Target atomically rejects stale epoch/fence before acceptance and rejection semantics prove non-acceptance -> NOT_COMMITTED.
- Target accepts under valid current fence then commits -> EXTERNALLY_COMMITTED when authoritative evidence exists.
- Target state restored/continuity broken -> UNKNOWN_EXTERNAL unless protected continuity proves ordering.
- Local stateVersion/CAS succeeds but current authority is unknown -> cannot infer current authorization; classify according to external evidence.
- Partial children with mixed outcomes -> PARTIAL/UNKNOWN; never collapse to one parent boolean.

## External research cross-check
Kleppmann's fencing analysis describes the exact stale-client race: a client can pause or a packet can be delayed after a lease check, so the protected storage service must receive and reject an older fencing token. citeturn1search0
RATS separates verifier appraisal from relying-party authorization and states that freshness narrows the race window rather than eliminating races after evidence generation. citeturn0search5turn0search3
TUF separates root/role authority, snapshot coherence and timestamp freshness; its snapshot prevents combining individually valid metadata from different times, which is a useful analogue for binding Nexo authority context rather than trusting an isolated epoch. citeturn0search1turn0search0

## Open questions for AB104.226
1. What exact tuple must be atomically checked at the target boundary?
2. Can authority root+epoch and resource fence be represented as one monotonic authority context without losing scope?
3. When target is partitioned from authority, what exact safety/liveness tradeoff is admissible?
4. How can target fence continuity survive restore and clone?
5. How are fence transitions themselves committed and recovered?
6. How are competing authority roots prevented from producing the same numeric epoch?
7. How do child-effect fences compose with parent mission authorization?
8. Can target-side rejection be made cryptographically/auditably provable as non-acceptance?
9. What formal state machine would cover these interleavings? Not yet constructed.

## AB50→AB58 residuals
Unchanged: TERNARY_MATH_GAP = FOUND; TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION = UNKNOWN; EVENTDAG_CLOSURE = PARTIAL; RECONSTRUCTION = BOUNDED_ONLY; SEMANTIC_FREEZE = NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED.
AB55 coverage remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks, not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
- nexoEffectRevision != authority epoch
- local CAS/version != target authority fencing
- fence without rollback resistance != anti-rollback authority
- equal epoch numbers != equal authority roots
- parent authorization != automatic child-effect authorization
- historical authorization != current permission
- rejection != NOT_COMMITTED unless non-acceptance is guaranteed
- no V21
- no architecture implementation
- no unsupported formal/CI/fault-injection claims

## Exact next mission
AB104.226: define and attack the exact atomic target-boundary tuple; study linearization, conditional writes, resource incarnation, fence transition durability and recovery after target/authority snapshots diverge.
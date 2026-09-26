# NEXO AB104.223 — REVOCATION/ROTATION vs DECISION/EFFECT RACE & FENCING BOUNDARY V1 — 2026-09-26

## Status
Research/study only. No Nexo architecture implementation, no V21, no formal verification claim.

## Mission
Study the race between authorization/decision, authority rotation or revocation, stale execution, and the external effect boundary. Determine where a stale authorization can still produce an effect and what evidence/fencing is required to prevent or classify that outcome.

## Core conclusion
A local authorization check immediately before sending an effect is NOT sufficient to prevent a concurrent revocation/rotation race.

For a strong stale-authorization safety property, the effect boundary must enforce a freshness/fence condition that is ordered against authority changes. A fencing token/authority epoch can carry the required ordering, but the target/resource that accepts the effect must participate by rejecting stale tokens/epochs. A worker-side check alone cannot provide this guarantee.

Therefore the conceptual boundary is:

Decision/authorization
  -> immutable operation/effect identity + authority epoch/root + fence token/lease context
  -> target acceptance check at the effect boundary
  -> target-side linearization/commit
  -> receipt/reconciliation

If the target cannot enforce or authoritatively report this boundary, Nexo cannot prove that a stale worker was prevented from acting merely from local authorization state. The resulting external outcome may be UNKNOWN.

## Interleaving analysis

### R1 — authorization E1, revocation E2, stale send
1. Worker obtains authorization under E1.
2. Authority advances/revokes E1 and installs E2.
3. Worker sends using E1.
4. If target accepts E1 without checking a current fence, the stale worker can still produce an effect.
5. If target remembers a monotonic fence and rejects E1 after E2, stale execution is blocked.
Result: local freshness is insufficient; target-side fencing is the relevant safety boundary.

### R2 — local check races with revocation
Worker checks currentEpoch == E1, then pauses. Revocation changes state to E2. Worker resumes and sends E1.
Result: the pre-check is stale by construction. It is evidence about what the worker observed, not proof about what the target accepted.

### R3 — target accepts before revocation linearization
If the target's effect acceptance/commit linearizes before the revocation, the effect can be historically authorized under E1 even if its receipt arrives after E2.
Result: later revocation must not rewrite historical execution into non-execution. Current authority and historical fact remain distinct.

### R4 — revocation linearizes before target acceptance
If the target enforces E2 and receives E1 after the revocation boundary, it should reject as stale (REJECTED_STALE_AUTHORITY or equivalent).
Result: no external effect from E1, assuming rejection semantics guarantee non-acceptance.

### R5 — network partition
A worker can remain offline with E1 while the authority has advanced to E2 elsewhere. When it reconnects, replayed E1 must not gain authority merely because its signature is valid.
Result: freshness/epoch/fence must be checked at the effect boundary or by an authority service whose result is itself authoritative and fresh.

### R6 — delayed message
An E1 message may arrive after E2 because of transport delay.
Result: message validity and current authority are separate. Signature-valid E1 does not imply current permission.

### R7 — crash after local decision, before target
A decision is durable, then the worker crashes before sending.
Result: durable authorization is not an external effect. Recovery may reconstruct the decision but must not assume execution. If a send may have crossed the boundary, outcome becomes UNKNOWN and requires reconciliation.

### R8 — crash after target accepts, before local receipt/CommitRecord
Target has committed E1, worker dies before local persistence.
Result: local absence does not prove NOT_COMMITTED. Target-authoritative lookup/receipt is required. Recovery must not create a new effect merely because the local CommitRecord is missing.

### R9 — resource reincarnation
Resource identity R is destroyed and a new resource reuses R.
Result: an old E1 token bound only to R can become dangerous. The fence must bind resource incarnation/version, not merely a reusable resource identifier.

### R10 — concurrent effect and rotation
Effect request and authority rotation are concurrent.
Result: the protocol needs an explicit linearization point or conditional acceptance rule. Without one, there is no deterministic basis for claiming whether the effect was accepted before or after revocation.

## Fencing model studied
A conceptual fence can be represented as:
(authority_root, authority_epoch, resource_id, resource_incarnation, fence_token, operation_id, payload_fingerprint)

The target maintains a durable/current fence state. A write/effect is accepted only if the presented fence is valid for the target's current authority/resource state.

The critical invariant is monotonic rejection:
presented_fence < target_current_fence => REJECT

This is the essence of classic fencing-token designs: the storage/resource server must actively reject an older token rather than trusting the client to stop itself.

## What does NOT solve the race
- A local isAuthorized() check before send.
- A signed authorization by itself.
- A newer timestamp by itself.
- A lease timeout without target-side fencing.
- A valid old authority root.
- An idempotency key without current-authority semantics.
- A local stateVersion check unless that version is bound to the same authoritative target boundary.
- A durable DecisionContract without target acceptance semantics.
- Revocation stored only locally on one device while stale workers can reach the target through another path.

## Current prototype code study
Actual main-branch files inspected:
- src/nexo/effect-adapter.js blob SHA 3ed48663b4da0d165c3a86da248d3f11d1e7b598
- src/nexo/runtime.js blob SHA 1b4096bd6868fd9086ba6740f07d6a104a258651
- src/nexo/orchestrator.js blob SHA 973d3d5406c5cab16fb49529d94e07a1557c3111

Observed prototype controls:
1. effect-adapter.js checks getStateVersion() before precondition and again immediately before handler execution. If the version changed during the precondition, it returns STATE_CHANGED_DURING_PRECONDITION.
2. This is a useful local race check, but it is not equivalent to target-side fencing: the version can change after the second read and before/during the handler's external effect.
3. Prepared entries require reconciliation before another execution attempt.
4. idempotencyKey is currently formed by runtime as missionId:stepId.
5. The prototype key does not itself bind target incarnation, authority epoch/root, or payload fingerprint.
6. runtime.js maps adapter outcomes into mission outcomes and persists execution/outcome records. This is local durable reconstruction logic, not proof of external acceptance.
7. orchestrator.js enforces mission dependency and evidence rules, but no authority-epoch/revocation/fence mechanism was found in the inspected path.
8. Code-search queries for authorityEpoch, fence lease fencing, stateVersion, and revoke rotation authorization permission returned no matches in the available GitHub code-search surface. This is a search limitation, not proof that no related logic exists elsewhere.

Important prototype distinction:
STATE_CHANGED_DURING_PRECONDITION protects against one observed local state race; it does NOT establish that a concurrent external revocation cannot occur after the final local check.

## Required evidence at the boundary
For a future EffectContract/DecisionContract, candidate fields include:
- authority root/digest
- authority epoch/version
- target/resource identity
- target resource incarnation
- fence token or equivalent monotonic authority handle
- operation_id/effect_identity
- payload fingerprint
- acceptance/rejection result
- target-side current fence/epoch evidence where available
- receipt bound to the exact operation and authority context
- freshness/continuity evidence

These are candidate research requirements, not an implementation decision.

## Linearization cases
| Ordering | Target result | Historical classification |
|---|---|---|
| target accepts E1 before revocation | effect committed under E1 | EXTERNALLY_COMMITTED |
| revocation E2 before target acceptance; target enforces fence | E1 rejected | NOT_COMMITTED if rejection guarantees non-acceptance |
| local decision E1, crash before send | no boundary crossing proven | NOT_COMMITTED only with boundary-specific negative evidence; otherwise UNKNOWN |
| target accepts, local receipt lost | effect may have committed | UNKNOWN until target reconciliation |
| E1 arrives after E2 but target cannot check current fence | ambiguous | UNKNOWN_EXTERNAL / unsafe protocol |
| resource R reincarnated | old E1 references prior incarnation | reject as stale if bound; otherwise collision/unsafe ambiguity |

## Deeper finding
The strongest useful separation is not simply authorized/not authorized. It is:
1. DECISION_AUTHORIZED(E1) — a decision was valid under authority E1.
2. FENCE_ACCEPTABLE(E1, resource incarnation) — the target's current authority state still permits the operation.
3. EFFECT_ACCEPTED — target crossed its acceptance boundary.
4. EFFECT_COMMITTED — target completed the effect.
5. EFFECT_OBSERVED — Nexo obtained authoritative evidence.
6. REVOKED(E1) — E1 is no longer current.

These states must not be collapsed.

## External research
### Fencing
Martin Kleppmann's distributed-locking analysis describes fencing tokens that increase on lease acquisition and are checked by the storage/resource server; a delayed client with an older token is rejected. This directly supports the conclusion that the protected resource must participate in fencing. Source: https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
### RATS freshness and policy boundaries
The RATS architecture describes freshness as policy-dependent and explicitly notes that state can change immediately after evidence is produced; freshness narrows the acceptable recentness but does not erase the race. Source: https://datatracker.ietf.org/doc/html/draft-ietf-rats-architecture-06
Current RATS material also separates verifier appraisal from relying-party authorization decisions, supporting Nexo's separation of evidence, decision, and effect permission. Sources: https://datatracker.ietf.org/doc/html/draft-ietf-rats-endorsements-09 and https://datatracker.ietf.org/doc/draft-sokolov-rats-aep-composition/04/
### TUF rollback/freeze protection
TUF uses versioning, expiration, signed roles, and coherent snapshots to reject stale/rollbacked/frozen metadata; this is a useful external analogue for distinguishing valid historical metadata from currently admissible authority. Sources: https://theupdateframework.io/docs/security/ and https://theupdateframework.io/docs/metadata/

## AB50→AB58 residuals
Unchanged and MUST remain visible:
- TERNARY_MATH_GAP = FOUND
- TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
- TERNARY_PAA_COLLISION = UNKNOWN
- EVENTDAG_CLOSURE = PARTIAL
- RECONSTRUCTION = BOUNDED_ONLY
- SEMANTIC_FREEZE = NOT_DECLARED
- FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED
- AB55 coverage was minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks, not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## Open questions for AB104.224
1. What exact target-side primitive can linearize revocation + effect acceptance?
2. Can an authority epoch alone suffice, or is a resource-scoped fencing token required?
3. How is the fence made rollback-resistant across target restore/clone?
4. What is the recovery rule when rotation and effect acceptance are both durable but their ordering evidence is missing?
5. How are multi-device/offline authorities reconciled without allowing stale branches to execute?
6. How are fence tokens rotated/revoked during root compromise?
7. How are partial/streaming effects fenced at child-effect granularity?
8. What negative evidence proves REJECTED_STALE_AUTHORITY means no effect crossed the target boundary?
9. What fault-injection schedule is required to test every race? No such test has been executed/verified here.

## DO-NOT-REPEAT
- local authorization check != target-side fencing
- signed old authorization != current permission
- timestamp/arrival order != authority order
- lease expiration != fencing unless target rejects stale holders
- stateVersion check in prototype != proof of external race safety
- revocation != historical erasure
- valid historical effect != current permission
- missing local receipt != NOT_COMMITTED
- no V21
- no architecture implementation
- no formal verification/CI/fault-injection claim without execution evidence

## Exact next mission
AB104.224: research the minimal linearization primitive for revocation + effect acceptance, compare authority epoch vs resource-scoped fencing token vs conditional target version, then attack restore/rollback, clone, multi-device and partial-effect cases. Continue code study and preserve continuity.
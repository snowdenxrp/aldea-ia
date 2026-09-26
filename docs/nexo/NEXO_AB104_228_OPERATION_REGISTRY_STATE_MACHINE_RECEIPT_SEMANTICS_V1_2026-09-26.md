# NEXO AB104.228 — OPERATION REGISTRY STATE MACHINE AND RECEIPT SEMANTICS V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
The operation registry needs more states than a boolean "exists/completed". A useful research state machine is:

UNSEEN -> RESERVED -> ACCEPTED -> COMMITTED -> RECEIPT_AVAILABLE

with side/terminal states:
REJECTED_PRE_ACCEPTANCE
UNKNOWN_EXTERNAL
PARTIAL
CONFLICT
EXPIRED_HISTORICAL
QUARANTINED

Important distinction:
- RESERVED = identity/claim recorded, not proof of external effect.
- ACCEPTED = target crossed its acceptance boundary.
- COMMITTED = target durably applied the effect.
- RECEIPT_AVAILABLE = evidence of that commit is retrievable.
These may collapse into one atomic target transaction only if the target actually provides that guarantee. Otherwise they remain separate evidence states.

## Transition attacks
1. UNSEEN -> RESERVED -> crash: reservation alone cannot authorize a fresh retry as if nothing happened. Recovery must inspect reservation semantics and external evidence.
2. RESERVED -> ACCEPTED -> crash: target may have accepted before the worker died. Local state is UNKNOWN_EXTERNAL until target evidence resolves it.
3. ACCEPTED -> COMMITTED -> receipt lost: authoritative target registry can reconstruct COMMITTED if continuity is intact.
4. COMMITTED -> local checkpoint lost: rebuild from authoritative evidence; never execute again.
5. RESERVED -> REJECTED_PRE_ACCEPTANCE: NOT_COMMITTED only if rejection guarantees non-acceptance at the relevant boundary.
6. COMMITTED -> REJECTED: contradiction unless rejection refers to a later retry.
7. COMMITTED -> EXPIRED: expiration is retention, not erasure; preserve historical identity.
8. Same ID + different fingerprint: CONFLICT/QUARANTINE, never timestamp/arrival winner.

## Receipt semantics
A receipt must state what it proves. Candidate fields:
operation_id, effect_identity, payload_fingerprint, target_identity, target_incarnation, authority_root/epoch/configuration, target_commit_revision, acceptance/commit status, result/result_digest, predecessor/resource_version, fence accepted, issuer/authenticity, commit relation, retention/lookup information.

A receipt proving "request was recorded" is not equivalent to a receipt proving "external effect committed".

SCITT is a useful conceptual warning: a receipt can prove inclusion of a signed statement in a transparency structure without proving that the statement itself is true. citeturn0search18

## Atomic transition hypothesis
Strongest conceptual target transaction:

IF operation_id absent AND authority context valid AND resource incarnation valid AND fence valid AND expected resource version valid
THEN atomically:
- mutate resource
- register operation as COMMITTED
- bind commit revision/result digest

The response may be delivered afterward. If receipt delivery is outside the transaction, receipt absence remains compatible with COMMITTED.

etcd documents atomic transactions that evaluate multiple comparisons and apply a successful branch as one transaction. This is an external primitive reference, not a Nexo architecture decision. citeturn0search2turn0search9

## Negative evidence
A negative receipt is stronger than an ordinary error only if it binds to the exact operation and guarantees the operation did not cross the acceptance boundary.
- conditional failure before mutation: candidate NOT_COMMITTED if semantics guarantee no acceptance.
- timeout: UNKNOWN.
- connection closes after acceptance: UNKNOWN until reconciliation.
- durable rejection bound to operation and pre-acceptance boundary: candidate NOT_COMMITTED.
- duplicate with same ID: may indicate prior commit, not non-commit.

## Expiry and reuse
Idempotency identity needs an explicit retention policy. Expiry cannot erase historical ambiguity.
Safe reuse requires a new identity namespace/incarnation or target semantics that prevent confusion with the old operation.
AWS Durable Execution recommends stable idempotency keys across attempts and notes retries can execute side effects again. citeturn0search0turn0search12

## Partial child effects
Parent P may have C1=COMMITTED, C2=UNKNOWN, C3=NOT_COMMITTED. Parent cannot collapse to one terminal boolean. Each independently crossing child boundary needs its own identity, fingerprint, target/incarnation, authority/fence context, status and evidence.

## Restore attacks
- Registry older than resource: reconcile; do not execute.
- Resource older than registry: preserve registry evidence and classify continuity inconsistency until target recovery semantics resolve it.
- Both restored to old snapshot: prior COMMITTED can appear UNSEEN; anti-rollback continuity is required.
- Registry and resource restored from different points: individually valid snapshots can compose into invalid history; require common commit/sequence boundary or quarantine.

## Prototype cross-check
Current test file SHA: 02050c53303711de7baba5fe276a3e9f8b205681.
It tests duplicate suppression, same-key concurrency, prepared reconciliation, partial effects and UNKNOWN reconciliation.
Current effect-adapter exception branch previously inspected does not call persist() for EFFECT_OUTCOME_UNKNOWN while the test expects an UNKNOWN result in the journal. This discrepancy remains unresolved; no test-pass claim.
The prototype journal is capped at 200 entries, so it is not a complete historical operation registry.

## External evidence
AWS Durable Execution: replay/retry can execute operations more than once; stable idempotency keys and external reconciliation are needed. citeturn0search0turn0search4
Transactional Outbox: relay can publish twice after a crash between publication and recording. citeturn0search1
etcd: atomic multi-comparison transactions. citeturn0search9

## Open questions for AB104.229
1. RESERVED ownership/fencing semantics.
2. Whether ACCEPTED is durable or target-internal.
3. Atomic relationship among mutation, COMMITTED record and commit revision.
4. Receipt cryptographic binding and trust root.
5. Negative receipt grammar and proof of non-acceptance.
6. Expiry/reuse namespace semantics.
7. Archive representation for EXPIRED_HISTORICAL/UNKNOWN_PERMANENT.
8. Child operation aggregation and ordering.
9. Cross-system receipt trust/common-mode failures.
10. Formal state-machine model remains pending.

## AB50→AB58 residuals
UNCHANGED: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.
AB55 remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
- RESERVED != COMMITTED
- ACCEPTED != RECEIPT_DELIVERED
- receipt inclusion != truth of underlying effect
- registry absence != NOT_COMMITTED
- expiry != historical erasure
- same ID + different fingerprint != retry
- parent status != proof of every child
- local journal != complete target registry
- no V21
- no architecture implementation
- no unsupported formal/CI/fault-injection claims

## Exact next mission
AB104.229: attack ACCEPTED vs COMMITTED, target transaction commit, crash after acceptance, rollback/restore, durable negative receipts, and whether a receipt can be a self-contained reconstruction proof without becoming an independent authority.
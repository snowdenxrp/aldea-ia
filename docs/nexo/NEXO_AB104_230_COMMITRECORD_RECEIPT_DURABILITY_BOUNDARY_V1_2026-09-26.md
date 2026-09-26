# NEXO AB104.230 — COMMIT RECORD / RECEIPT DURABILITY BOUNDARY V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core finding
A durable CommitRecord needs a recognizable commit boundary, not merely a parseable record. Crash recovery must distinguish:
- record never committed;
- record partially written;
- record committed but receipt not delivered;
- receipt committed but local state not reconstructed;
- target committed while local record is absent.

SQLite provides a useful storage-level reference: atomic transactions can recover from interrupted writes, and WAL recovery identifies the last valid commit frame using checksums and commit markers. But SQLite's guarantees concern its database/storage semantics; they do not establish Nexo authority, external-effect truth, anti-rollback, or target-side fencing. citeturn0search1turn0search3turn0search4

## Commit marker principle
A candidate durable record should have an unambiguous boundary such that recovery can classify:
1. PRECOMMIT/INCOMPLETE — not authoritative.
2. COMMITTED — record itself is durable and internally complete.
3. CORRUPT/CONFLICT — evidence cannot be trusted.
4. UNKNOWN_HISTORY — required predecessor/anchor is unavailable.

A length prefix, checksum, hash or MAC can detect certain corruption/incompleteness, but none alone proves the record is the current authoritative commit.

## Torn write attacks
Attack:
- payload partially written;
- metadata written but payload missing;
- payload complete but commit marker missing;
- commit marker durable while dependent record is missing;
- two records appear valid but point to different predecessors.

Required behavior:
- never infer COMMITTED from parseability;
- reject incomplete marker/record combinations;
- preserve the incomplete evidence;
- require predecessor/anchor continuity;
- quarantine conflicting valid branches.

SQLite's documented recovery uses journal/WAL structure and checksums to distinguish valid frames and recover the last valid commit point. Its crash tests deliberately simulate incomplete writes, garbage data and reordered writes. This is strong evidence for the importance of crash testing, not proof of Nexo correctness. citeturn0search1turn0search3

## Acknowledgement ordering
Dangerous sequence:
1. target mutates;
2. target sends ACK;
3. local CommitRecord is not durable;
4. worker crashes.

ACK reception alone cannot make local history durable.

Opposite:
1. local record says COMMITTED;
2. target mutation did not occur.

If local record is outside the target's atomic commit boundary, this can become false COMMITTED evidence.

Strong conceptual ordering:
TARGET ATOMIC COMMIT
-> authoritative target operation record
-> receipt/evidence derived from that commit
-> local CommitRecord reconstruction/persistence

But if the local CommitRecord is itself the authoritative target transaction record, it needs a transaction/storage boundary that actually binds the effect to the record. The distinction must not be assumed.

## Receipt as reconstruction anchor
A receipt can reconstruct local state without re-executing only if:
- issuer is trusted for that target boundary;
- receipt authenticity is verified;
- operation_id/effect_identity/payload_fingerprint match;
- target incarnation matches;
- authority context is compatible;
- commit revision/linearization identity is bound;
- receipt semantics explicitly mean COMMITTED, not merely RECEIVED/ACCEPTED;
- freshness/continuity requirements are satisfied;
- any required predecessor/sequence is verifiable.

Then:
receipt -> verify -> reconstruct state -> verify convergence
and NOT:
receipt -> execute effect.

AWS Durable Execution explicitly returns a checkpointed result during replay rather than rerunning the completed step, illustrating the same anti-reexecution principle. citeturn0search6turn0search7

## Receipt must not become authority
Historical receipt:
COMMITTED(E1, epoch 7)

does not imply:
PERMIT_NEW_EFFECT(E2, epoch 7).

Current authority, revocation, epoch, resource incarnation and fencing must be checked separately.

A cryptographically authentic old receipt can therefore be:
- HISTORICALLY_VALID
- CURRENTLY_INADMISSIBLE
at the same time.

## Restore/rollback
Cases:
A. Record and target restored together to old consistent point:
  locally coherent but potentially stale. Freshness/anti-rollback continuity is required.

B. Record restored older than target:
  local history may say UNSEEN while target already committed. Reconcile; do not execute.

C. Record restored newer than target:
  COMMITTED evidence conflicts with target snapshot. Preserve both; quarantine until a trusted common history is established.

D. Receipt survives but target registry is restored older:
  receipt may prove a historical commit only if its issuer/continuity semantics cover the restored target state. Otherwise historical evidence exists but current target state is inconsistent.

E. Clone:
  copied records can produce two apparently valid local histories. Device/resource incarnation and authority continuity must prevent a clone from silently becoming canonical.

## Commit marker vs receipt
These are different layers:
- Commit marker: storage fact that a record/transaction reached its durable boundary.
- Receipt: evidence communicated from an authoritative boundary.
- Authority anchor: determines whether that evidence is admissible now.

None should silently substitute for another.

## Prototype code study — corrected current evidence
Current src/nexo/effect-adapter.js was inspected directly.

Observed:
- recordIntent() creates status prepared.
- journal is truncated to the last 200 entries.
- prepared entries require reconciliation before another execution.
- completed results are cached by idempotencyKey.
- handler exception constructs EFFECT_OUTCOME_UNKNOWN but returns without calling persist().
- current test tests/nexo/effect-adapter.test.mjs explicitly expects exceptionJournal[0].status to be blocked and exceptionJournal[0].result.code to be EFFECT_OUTCOME_UNKNOWN.

Therefore there is a concrete source/test semantic mismatch in the current main snapshot. We have NOT claimed the test suite passes. This is a directly observed unresolved prototype issue.

Runtime inspection:
- executeNexoStep() derives idempotencyKey = missionId:stepId.
- runtime stores adapter results through local memory records.
- runtimeCommitLocks serializes local memory commits only.
- nothing observed there establishes a distributed target-side atomic effect+CommitRecord boundary.
- getStateVersion / nexoEffectRevision remain local simulation/version evidence, not demonstrated external authority/fencing.

## Crash-test implication
SQLite's own documentation reports crash testing that varies simulated power-loss timing and partial/out-of-order writes, then verifies atomic recovery. Nexo's current prototype evidence does not establish an equivalent systematic crash-injection campaign. Therefore:
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED remains unchanged.

## New invariants
1. COMMITTED_RECORD requires a verified durable commit boundary.
2. RECEIPT may reconstruct but never execute.
3. AUTHENTIC_RECEIPT does not automatically mean CURRENT_AUTHORITY.
4. MISSING_RECEIPT does not mean NOT_COMMITTED.
5. MISSING_RECORD does not mean NOT_COMMITTED.
6. PARTIAL_WRITE does not mean FAILED; it means incomplete evidence until recovery classifies it.
7. RESTORED_VALID_RECORD does not automatically mean CURRENT.
8. VALID_OLD_RECEIPT cannot regain execution authority.

## AB50→AB58 residuals
UNCHANGED:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

AB55 remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
- parseable record != committed record
- checksum/hash/MAC != current authority
- receipt != permission
- receipt authenticity != target commit proof
- receipt delivery != commit
- ACK != durable local history
- missing record != NOT_COMMITTED
- old valid receipt != current permission
- restore consistency != freshness
- no V21
- no architecture implementation
- no unsupported CI/formal/fault-injection claims

## Exact next mission
AB104.231: study the recovery proof chain itself — trusted anchor -> record completeness -> integrity/authenticity -> predecessor continuity -> semantic compatibility -> receipt/target binding -> reconstruction convergence — and attack each transition with rollback, truncation, fork and mixed-snapshot cases.
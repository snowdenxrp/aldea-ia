# NEXO AB104.231 — RECOVERY PROOF CHAIN ADVERSARIAL AUDIT V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Recovery proof chain
Candidate chain:
TRUSTED ANCHOR
→ RECORD COMPLETENESS
→ INTEGRITY
→ AUTHENTICITY
→ PREDECESSOR CONTINUITY
→ SEMANTIC COMPATIBILITY
→ RECEIPT/TARGET BINDING
→ RECONSTRUCTION
→ CONVERGENCE

Critical result: passing one layer does not automatically pass the next.

## 1. Trusted anchor
A record can be internally self-consistent while anchored to a replaced/rolled-back root.
Therefore anchor continuity must be checked independently.
Two valid roots or histories are CONFLICT, not a timestamp race.

## 2. Record completeness
A partial record, missing predecessor or missing commit marker is not a failed operation. It is incomplete evidence.
SQLite demonstrates the value of explicit commit boundaries and crash recovery; its WAL recovery scans frames, verifies checksums and identifies the last valid commit frame. citeturn0search2turn0search14

## 3. Integrity
A valid checksum/hash proves consistency with the covered bytes, not truth, authority or freshness.
A corrupted/torn record must not be promoted.

## 4. Authenticity
A valid signature proves a trusted signer authenticated the covered statement under the applicable key semantics. It does not by itself prove current authority, freshness or external-effect truth.
Receipt systems reinforce this separation: SCITT defines receipts as proofs of inclusion in a verifiable data structure; inclusion is a property of the log, not automatically proof that the logged statement is true. citeturn0search4turn0search9

## 5. Predecessor continuity
A record with correct syntax, hash and signature but missing predecessor is not complete history.
Cases:
- predecessor absent from available history → HISTORY_GAP/UNVERIFIED_HISTORY;
- wrong predecessor digest → FORK/CONFLICT;
- same sequence with different valid predecessor → CONFLICT;
- older valid predecessor supplied after a newer trusted anchor → ROLLBACK/STALE.

SCITT continuity work makes the same conceptual point: an inclusion proof connected to no trusted earlier root can prove membership in a log that may have been rebuilt; consistency evidence is needed to connect states over time. citeturn0search3

## 6. Semantic compatibility
Cryptographic validity is not semantic compatibility.
A valid record can reference:
- wrong schema/version;
- wrong resource incarnation;
- incompatible authority epoch;
- wrong target;
- incompatible prepared intent;
- mismatched payload fingerprint.

These are QUARANTINE/INCONSISTENCY candidates, not execution permission.

## 7. Receipt/target binding
A receipt must bind to the exact operation/effect and target context.
A generic receipt that says "transaction included" is insufficient to infer a particular external effect unless the statement inside it explicitly binds that effect and the issuer is authoritative for the target boundary.

Current SCITT receipt profiles illustrate this distinction: inclusion and consistency proofs establish properties of the verifiable data structure; transaction details may be bound into the underlying ledger statement. citeturn0search1turn0search9

## 8. Reconstruction
Only evidence that has passed all required prior gates may reconstruct state.
Reconstruction must preserve:
- operation_id
- effect_identity
- payload fingerprint
- target/incarnation
- authority context
- commit revision
- result
- evidence lineage

Reconstruction is state materialization, never permission to execute.

## 9. Convergence
After reconstruction, independently verify that materialized state matches the authoritative evidence.
If evidence says COMMITTED but materialized state differs:
- stale snapshot;
- incomplete reconstruction;
- incompatible schema;
- missing dependency;
- alternate history;
- storage corruption;
- authority/epoch mismatch
are all possible.
Initial result: INCONSISTENT/QUARANTINED, not "corrupt" by default.

## Attack matrix

A. Rollback anchor
Valid old chain + valid records → stale/rollback if trusted anchor says newer state was accepted.

B. Truncation
Valid prefix with missing suffix → historical prefix remains valid, but current state cannot be reconstructed beyond the gap.

C. Fork
Two valid children from same predecessor → preserve both; explicit fork policy required.

D. Mixed snapshots
Snapshot A + archive B where each is individually valid → combined history may be invalid.

E. Receipt replay
Old valid receipt replayed into current recovery → historical evidence only; current authority/freshness recheck required.

F. Receipt substitution
Valid receipt for operation X supplied for Y → operation/effect/payload binding rejects.

G. Payload collision
Same operation_id, different fingerprint → CONFLICT/QUARANTINE.

H. Semantic downgrade
Valid old schema/authority record supplied to newer recovery → historical evidence may remain valid but semantic compatibility/current authority can fail.

I. Missing anchor
Complete record chain with unavailable trusted root → UNVERIFIED_HISTORY; no promotion to authoritative state.

J. Alternate complete history
Attacker replaces all records and root together → ordinary local verification cannot detect replacement; independent protected anchor is required.

K. Archive omission
Archived record unavailable → availability/history gap, not proof that operation never existed.

L. Reconstructed state mismatch
Valid evidence + incompatible materialized state → quarantine/reconcile, not blind re-execution.

## Key invariant
No recovery step may convert uncertainty into execution authority.

Candidate:
VERIFIED_COMMITTED → RECONSTRUCT
NOT:
VERIFIED_COMMITTED → EXECUTE

Likewise:
HISTORICALLY_VALID → MAY_INFORM_HISTORY
NOT:
HISTORICALLY_VALID → CURRENT_PERMISSION

## Crash-testing implication
SQLite reports systematic simulated crash testing across incomplete writes, garbage data and out-of-order writes, reopening the database after each simulated failure and checking consistency. citeturn0search0turn0search16
Nexo has not demonstrated an equivalent systematic fault-injection campaign. Therefore no formal verification or fault-injection completion claim is made.

## Current prototype cross-check
The existing prototype facts remain unchanged:
- effect journal capped at 200;
- prepared intents require reconciliation;
- idempotencyKey is missionId:stepId;
- exception UNKNOWN is returned without persist() while test expects an UNKNOWN journal result;
- local stateVersion/nexoEffectRevision is not demonstrated external fencing;
- no target-side atomic effect+CommitRecord boundary demonstrated;
- no test-pass claim.

## AB50→AB58 residuals
UNCHANGED:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

AB55 coverage remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
- integrity != authority
- authenticity != freshness
- receipt inclusion != external-effect truth
- missing predecessor != NOT_COMMITTED
- valid old chain != current chain
- valid record + mismatched materialized state != automatic corruption
- reconstruction != execution
- historical validity != current permission
- no V21
- no architecture implementation
- no unsupported formal/CI/fault-injection claims

## Exact next mission
AB104.232: investigate fork resolution and competing valid histories at recovery time: root continuity, same-sequence conflicts, archive/snapshot divergence, multi-device branches, authority arbitration, and conditions under which recovery may select one history without silently inventing a winner.
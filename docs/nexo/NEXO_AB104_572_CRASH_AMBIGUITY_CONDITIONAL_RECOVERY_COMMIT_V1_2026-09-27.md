# NEXO — AB104.572 — Crash ambiguity at conditional recovery commit

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE. No V21. No runtime construction. No formal verification.

## Exact question
What must Nexo do if a final conditional recovery transaction is submitted to the authoritative store, but the caller crashes or loses connectivity before receiving the result?

## Evidence
etcd documents that an operation is considered complete when committed through consensus, but a client can remain uncertain if it times out or loses the network connection. The client must not equate absence of a response with non-commit. etcd transactions expose a boolean result when the response is received, while the authoritative revision identifies the applied state. citeturn0search0turn0search4

Raft explicitly describes the crash-after-commit-before-response case: retrying a command can cause duplicate execution unless commands carry unique client serial numbers and the replicated state machine remembers processed identifiers/results. citeturn0search26turn0search27

A real Jepsen investigation of Redpanda documented a transaction coordinator crashing after commit but before acknowledging the client. A retry then encountered an already-committed transaction state; the incident demonstrated why an indeterminate outcome must not be interpreted as an ordinary failure and why transaction identity/status recovery matters. citeturn0search5turn0search28

## Finding
After the request crosses the authoritative commit boundary, the caller's local observation can become UNKNOWN even though the authoritative system has already committed the transition.

Therefore:
NO_RESPONSE != NOT_COMMITTED
TIMEOUT != ABORTED
CLIENT_CRASH != ROLLBACK
RETRY != NEW_RECOVERY

The authoritative state, not the caller's transport result, determines whether authority was committed.

## Required semantic states
For the caller-facing protocol, distinguish at minimum:
- COMMITTED: authoritative evidence proves the exact transition committed.
- NOT_COMMITTED: authoritative evidence proves the exact transition did not commit.
- UNKNOWN: available evidence cannot yet distinguish the two.

UNKNOWN is not a transient synonym for failure. It is a protected epistemic state requiring reconciliation.

## Exact operation identity
The final recovery commit needs a stable unique OperationID/RecoveryCommitID that survives client retry and process restart.

A retry must ask about the same logical operation, not submit an unrelated new recovery attempt.

Candidate identity tuple:
RecoveryCommitID
+ RecoveryGeneration
+ AuthorityEpoch
+ FenceRevision/Epoch
+ expected StateDigest
+ dependency snapshot/version-set digest.

The authoritative store should durably record the outcome or enough state to reconstruct it. If the exact operation is already committed, retry/recovery lookup returns the existing committed result instead of applying a second authority transition.

This is consistent with the Raft client-serial-number pattern: identity makes retry distinguishable from a genuinely new command. citeturn0search26

## Recovery protocol candidate
1. PREPARE recovery using a unique RecoveryCommitID.
2. Capture the complete claim-relevant dependency/version/incarnation set.
3. Submit one conditional protected transaction.
4. If a definitive COMMITTED response arrives, record the authoritative revision/result.
5. If a definitive guard-failure/NOT_COMMITTED result arrives, mark the prepared certificate stale.
6. If timeout, transport failure, caller crash or ambiguous server result occurs, enter UNKNOWN.
7. Reconcile by querying the authoritative store using RecoveryCommitID and/or an equivalent durable commit record.
8. Only after authoritative evidence establishes COMMITTED may the system expose the new recovery authority as active.
9. If evidence establishes NOT_COMMITTED, the attempt is closed and a new attempt receives a new generation/identity.
10. If reconciliation itself is unavailable or contradictory, remain BLOCKED/QUARANTINED; do not guess.

## Important boundary
A successful internal conditional commit proves the protected authoritative transition only within that authoritative linearization domain. It does not prove:
- external provider cancellation;
- physical-world effect;
- remote resource state;
- telemetry completeness;
- cross-resource atomicity.

Those remain governed by EffectID, fencing, observation and reconciliation.

## Adversarial cases examined
A. Commit succeeds, response lost → UNKNOWN locally; reconciliation discovers COMMITTED.
B. Guard fails, response lost → UNKNOWN locally; reconciliation discovers NOT_COMMITTED.
C. Leader/store fails during consensus → UNKNOWN until authoritative state is queried.
D. Retry arrives after original commit → same OperationID must resolve to existing outcome, not execute a second transition.
E. Old prepared certificate retried after authority epoch changed → conditional predicates reject it.
F. Recovery record exists but final authority transition does not → record is evidence of preparation, not authority.
G. Final commit is COMMITTED but process crashes before local archival → authoritative revision allows reconstruction; local absence is not proof of non-commit.
H. Reconciliation source itself is partitioned → UNKNOWN persists; no promotion.

## New invariant
For a protected recovery operation R:

OBSERVATION(R) = UNKNOWN must imply:
ACTIVE_AUTHORITY(R) = false
until authoritative reconciliation proves the exact commit.

More precisely, historical evidence may show that a commit possibly occurred, but activation requires claim-valid authoritative evidence.

## New distinction
COMMIT OUTCOME and CLIENT OBSERVATION are separate state dimensions.

The authoritative system may be:
COMMITTED while the client observes UNKNOWN.

Therefore the model must not collapse:
authoritative outcome ∈ {COMMITTED, NOT_COMMITTED}
with
client knowledge ∈ {KNOWN_COMMITTED, KNOWN_NOT_COMMITTED, UNKNOWN}.

## Nexo consequence
The final recovery gate is now better modeled as:

PREPARE(ID, SNAPSHOT)
→ CONDITIONAL_COMMIT(ID, GUARDS)
→ {COMMITTED | NOT_COMMITTED | UNKNOWN_TO_CALLER}
→ RECONCILE(ID)
→ authoritative outcome
→ only then expose authority.

A retry is a reconciliation/idempotent continuation of the same operation unless a new recovery generation is explicitly created.

## Closure status
AB104.572 closes the conceptual ambiguity protocol for the internal authoritative commit boundary, but does NOT close:
- cross-domain/external atomicity;
- correctness of any concrete store implementation;
- formal proof;
- fault-injection evidence;
- provider reconciliation correctness.

## Next exact step
AB104.573 — adversarially research whether RecoveryCommitID alone is sufficient under snapshot restoration, log compaction, state migration, replica replacement and authority-epoch rollover, or whether the identity must bind to a durable continuity anchor / incarnation so an old operation cannot be confused with a reincarnated store.

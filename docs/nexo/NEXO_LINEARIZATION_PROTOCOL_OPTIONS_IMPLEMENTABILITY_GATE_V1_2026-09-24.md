# NEXO LINEARIZATION PROTOCOL OPTIONS AND IMPLEMENTABILITY GATE V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation and no final protocol selected.

## 1. Research basis

NIST SP 800-160 Rev. 1 treats security as a system property and emphasizes secure state transitions, protective failure and recovery. NIST IR 8460 explains that state-machine replication and consensus can emulate a centralized service in a fault-tolerant distributed system by making distributed participants agree on the execution of client-submitted commands. These sources support using a protected state-machine/serialization abstraction where necessary, but do not dictate a specific protocol for Nexo. citeturn0search3turn0search0turn0search24

## 2. The actual question

For each L3 transition we need a defensible answer to:

1. What exact operation is being linearized?
2. Which state is read?
3. Which state is written?
4. What makes the decision unique?
5. What happens if two actors race?
6. What happens after crash?
7. What happens under partition?
8. How is a stale actor rejected?
9. How is replay handled?
10. How can the implementation trace be mapped to the formal transition?

A mechanism is not sufficient merely because it is called atomic.

## 3. Option P1 — Compare-and-swap / conditional atomic write

Concept:
READ expected_version → conditional write(expected_version → new_version) → success = linearization → failure = retry/reject/revalidate.

Strengths:
- small primitive;
- explicit conflict detection;
- useful for epochs, versions and fences.

Weaknesses:
- only as strong as the storage primitive;
- cross-object CAS may not exist;
- distributed CAS can hide a consensus/transaction protocol underneath;
- retry logic can accidentally duplicate external effects.

Critical requirement:
The CAS condition must cover every safety-relevant value whose change could alter the decision. A CAS over authority_epoch alone is insufficient if policy, stop, recovery or VersionSet can independently change the outcome.

## 4. Option P2 — Serializable transaction

Concept:
BEGIN → read protected context → validate preconditions → write transition → COMMIT.

Strengths:
- convenient multi-object atomicity;
- conflict detection can be delegated to a mature database;
- natural durability boundary.

Weaknesses:
- serializability of database transactions is not automatically linearizability of the entire Nexo effect;
- external side effects remain outside the transaction;
- transaction coordinator/storage become TCB;
- retry/commit ambiguity remains;
- isolation semantics must be verified rather than assumed.

Critical requirement:
The exact database isolation and commit semantics must be part of the architecture contract.

## 5. Option P3 — Consensus-backed protected state machine

Concept:
CLIENT COMMAND → consensus ordering → deterministic protected state machine → durable committed decision.

NIST IR 8460 describes SMR/consensus as a way for distributed processes to agree on ordered commands and emulate a centralized service. citeturn0search0turn0search23

Strengths:
- explicit total ordering inside the protected state machine;
- fault tolerance against defined node failures;
- clean formal abstraction;
- replicated durable history.

Weaknesses:
- consensus protocol becomes critical TCB;
- availability depends on quorum/failure assumptions;
- membership/configuration changes are safety-sensitive;
- common-mode failures can defeat nominal replica diversity;
- external effects remain outside the replicated state machine.

Critical requirement:
Consensus only solves agreement on the internal command/state sequence. It does not prove the external-world effect.

## 6. Option P4 — Epoch/fencing protocol

Concept:
CURRENT_EPOCH = E; actor holds E; protected transition accepts only if E remains current; revocation/change increments or replaces E; stale actor fails.

Strengths:
- powerful stale-actor defense;
- can work across asynchronous propagation;
- simple semantic contract;
- separates coordination from world truth.

Weaknesses:
- epoch source must itself be authoritative;
- rollback can resurrect old epoch unless protected;
- fencing must be enforced at every protected path;
- epoch alone does not serialize arbitrary multi-variable transitions.

## 7. Option P5 — Hybrid protected-core protocol

Concept:
Use a small authoritative serialization mechanism for the L3 core, with epochs/fences for distributed actors and durable intent/reconciliation for L4 external effects.

Possible structure:
PROTECTED CORE → linearize authority/safety transition → issue immutable context/fence → distributed workers act only under that fence → external attempt produces explicit outcome → reconciliation handles UNKNOWN → claim acceptance returns to protected core.

Potential advantage:
This separates three problems:
A. internal authority ordering;
B. distributed stale-actor control;
C. external-world uncertainty.

No final selection yet.

## 8. Conflict-by-conflict analysis

Authorization ↔ Revocation:
If revoke linearizes before authorization, authorization must fail. If authorization linearizes before revoke, the already committed authorization does not become retroactively nonexistent; subsequent protected transitions must observe the new authority context.

Execution ↔ STOP:
Once STOP enforcement linearizes, no stale execution may subsequently pass the final protected gate. STOP ACK is not equivalent to external cancellation.

Execution ↔ Recovery:
Recovery release cannot race with an active execution context. Checkpoint restoration cannot itself create current authority.

Execution ↔ Update:
No execution may use an incompatible VersionSet after the protected activation boundary.

Decommission ↔ Recovery:
A decommissioned identity cannot be resurrected by restoring old state.

Evidence ↔ Invalidation:
A claim cannot become current using evidence that became invalid under the same or earlier protected ordering.

## 9. Protocols can compose

These mechanisms are not mutually exclusive.

Possible composition:
CONSENSUS/TRANSACTION → establishes authoritative ordering
CAS/version checks → implement local guarded transitions
EPOCH/FENCE → reject stale distributed actors
DURABLE INTENT → survive crash before external effects
RECONCILIATION → resolve external UNKNOWN.

Choosing one primitive does not necessarily choose the whole architecture.

## 10. Linearizability proof obligation

For each protected operation, the implementation must expose a point or equivalent interval in which the operation can be treated as taking effect atomically.

Required correspondence:
FORMAL PRESTATE → implementation read set → implementation guard → implementation linearization event → implementation write set → FORMAL POSTSTATE.

If the implementation uses a database transaction, the commit event must correspond to the formal transition. If it uses CAS, the successful conditional write must correspond. If it uses consensus, the committed log position/state-machine application must correspond. If it uses fencing, the fence issuance/acceptance boundary must correspond.

## 11. Crash semantics

Crash before linearization → operation did not commit; retry may be allowed if idempotency permits.

Crash during linearization → outcome must be recoverable from durable authoritative state.

Crash after linearization before response → operation may already be committed; retry must not create a second logical effect.

Crash after external attempt → external outcome may be UNKNOWN.

Crash after response → durable state remains authoritative.

The protocol must never infer outcome merely from process survival.

## 12. Partition semantics

For L3:
NO CURRENT AUTHORITATIVE CONTEXT → HOLD / RESTRICT / QUARANTINE / DENY.

For L4:
LOSS OF RESPONSE → UNKNOWN.

This avoids conflating “cannot contact authority” with “external effect did not happen.”

## 13. Retry semantics

Every protected operation needs:
operation_id
effect_id/effect_key
request fingerprint
target fingerprint
normalized parameter fingerprint
idempotency/replay policy.

Retry must resolve to the same logical operation/effect, a new explicitly authorized effect, or rejection.

A new operation ID must never silently resolve an unresolved old external effect.

## 14. Fencing semantics

A fence should be treated as a capability boundary, not merely metadata.

Minimum:
- fence_id;
- scope;
- generation/epoch;
- owner;
- issuing authority context;
- expiry/revocation where applicable;
- exact protected operation/effect scope;
- validation rule;
- stale behavior.

The executor cannot mint a newer fence for itself.

## 15. Common-mode implications

A consensus cluster does not automatically provide independent safety.

Replica processes can share hardware, hypervisor, kernel, storage, network, KMS, trust root, administrator, policy source or software supply chain.

Likewise, a separate fence service may share the same failure domain as the executor.

Therefore protocol assurance must bind:
PROTOCOL → FAILURE DOMAINS → TRUST ROOTS → ADMIN DOMAINS → DEPENDENCIES.

## 16. External effect boundary

No protocol option eliminates the need for:
EFFECT INTENT → EXTERNAL ATTEMPT → APPLIED / NOT_APPLIED / UNKNOWN / PARTIALLY_APPLIED → OBSERVATION → RECONCILIATION → VERIFIED CLAIM.

Internal consensus, CAS or transaction commit cannot be substituted for external-world verification.

## 17. Candidate protocol composition

Research candidate, not selected architecture:

Core:
A small protected state machine using a durable serialization primitive.

Distributed actors:
Exact immutable context + epoch/fence.

External effects:
Durable intent + idempotency + explicit UNKNOWN.

Evidence:
Context-bound evidence with invalidation generation.

Recovery:
Protected recovery fence and explicit release.

Update:
VersionSet activation as an L3 transition.

Decommission:
Protected lifecycle closure that invalidates recovery/authority paths.

This is the first protocol composition that satisfies the previously derived boundaries without requiring all semantic state to share one transaction.

## 18. New invariants

LINPROTO-01: every L3 transition has one explicit linearization point or formally equivalent serialization interval.
LINPROTO-02: implementation atomicity must correspond to the formal transition.
LINPROTO-03: CAS only protects the variables included in its guard.
LINPROTO-04: database serializability does not by itself prove external-effect atomicity.
LINPROTO-05: consensus orders internal commands; it does not establish external-world truth.
LINPROTO-06: fences reject stale actors but do not replace multi-variable serialization.
LINPROTO-07: crash after external attempt preserves UNKNOWN.
LINPROTO-08: retry identity is bound to exact effect identity.
LINPROTO-09: partition cannot turn missing authority into permission.
LINPROTO-10: stale fence cannot authorize protected execution.
LINPROTO-11: recovery cannot inherit authority from restored state.
LINPROTO-12: evidence acceptance is bound to current context/invalidation state.
LINPROTO-13: common-mode assumptions are part of protocol assurance.
LINPROTO-14: protocol composition must preserve the same safety semantics across boundaries.
LINPROTO-15: every protocol mechanism has an explicit failure model and recovery semantics.

## 19. Remaining gate before architecture construction

Two things still must be closed:

1. Concrete storage/serialization semantics — exactly what primitive supplies the protected linearization.
2. Formal refinement — prove that the chosen implementation protocol refines the canonical transition semantics.

After that:
- select authoritative topology;
- freeze object contracts;
- write formal canonical model;
- perform actual SANY/TLC/toolchain validation;
- derive implementation interfaces;
- only then construct the clean architecture.

Architecture remains blocked.
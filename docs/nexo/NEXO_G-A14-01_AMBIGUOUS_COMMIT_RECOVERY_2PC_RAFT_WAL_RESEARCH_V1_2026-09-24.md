# NEXO G-A14-01 — Ambiguous Commit Recovery / 2PC / Raft / WAL Research Delta V1
Date: 2026-09-24

## Status
G-A14-01 remains OPEN.
This document is research/design refinement, not implementation or proof.

## Research question
Can Nexo safely resolve a crash where a protected transition may have committed, the response was lost, and an anti-rollback anchor or external effect may be uncertain?

## Research findings

### Raft
The Raft paper explicitly identifies the commit-before-response failure: a leader can commit a command and crash before responding, causing a retry against a new leader. The documented solution is stable command serial numbers plus state-machine tracking of the latest serial number and response. This confirms Nexo's distinction:
NEW ATTEMPT != NEW LOGICAL OPERATION.

etcd/raft also separates committed entries from application processing: committed entries are handed to the application state machine. A proposal may fail to commit and may need re-proposal. Therefore commit in the consensus layer and application effect are distinct stages.

Hashicorp raft documentation makes the boundary explicit: a command is committed durably on a quorum and only then applied to the FSM. This is useful evidence that durable consensus commit does not itself equal completion of all application semantics.

### PostgreSQL 2PC
PostgreSQL supports PREPARE TRANSACTION, COMMIT PREPARED and ROLLBACK PREPARED. Prepared state is durably recoverable through WAL and, where necessary across checkpoints, pg_twophase. The source code explicitly preserves prepared state after crashes and distinguishes states where a prepare/commit record was written from states where it was not.

This demonstrates a practical pattern:
PREPARED is a first-class durable uncertainty/coordination state.
It is not silently treated as committed or aborted.

But 2PC does not remove the distributed uncertainty problem. It introduces durable prepared state and requires a coordinator/recovery procedure to decide the second phase.

## Architectural conclusion

Nexo should not model ambiguous protected transitions as simply SUCCESS/FAILURE.

At minimum:
- NOT_COMMITTED
- COMMITTED
- PREPARED / CROSS_DOMAIN_PENDING
- UNKNOWN / RECONCILIATION_REQUIRED
- QUARANTINED

The exact state machine remains open.

## Important distinction

Consensus can provide a durable ordering point inside its own failure domain.

2PC can provide a durable prepared state across participating transactional resources.

Neither automatically proves:
- external-world effect;
- TPM/anchor atomicity;
- currentness after rollback;
- provider-side execution;
- evidence validity.

Therefore:

CONSENSUS COMMIT != EXTERNAL EFFECT
2PC PREPARE != EXTERNAL SUCCESS
WAL DURABILITY != CURRENTNESS
COMMAND DEDUPLICATION != EFFECT RECONCILIATION

## Counterexample

1. Protected transition T is committed.
2. Process crashes before response.
3. Client retries T.
4. Stable operation_id prevents duplicate protected transition.
5. But external provider effect remains UNKNOWN.

Correct result:
- do not create a new effect identity;
- preserve original operation_id/effect_key;
- reconcile provider;
- retain UNKNOWN until a valid claim resolves it.

This confirms existing Nexo rules rather than replacing them.

## New contracts

PSC-19 — Ambiguous Commit Preservation:
If a protected transition may have committed but the caller cannot determine the result, recovery must consult durable transition state; absence of response is not failure.

PSC-20 — Prepared-State Explicitness:
Any cross-domain protocol that can enter a prepared/pending state must persist that state and define recovery ownership; it cannot be collapsed into success or failure.

PSC-21 — Stable Retry Identity:
Retries after uncertain response reuse the logical operation/effect identity unless reconciliation proves that a new logical operation is intended.

PSC-22 — Commit/Effect Separation:
Protected commit establishes internal authoritative history only; it does not establish external-world effect.

PSC-23 — Recovery Decision Evidence:
A recovery decision that closes an ambiguous transition requires context-valid durable evidence or an explicit safe terminal/quarantine rule.

## Adversarial cases

CE-GA14-01-21: committed + response lost + duplicate retry.
CE-GA14-01-22: prepare durable + coordinator lost.
CE-GA14-01-23: prepare durable + participant unavailable indefinitely.
CE-GA14-01-24: commit durable + anchor update uncertain.
CE-GA14-01-25: anchor update durable + store commit uncertain.
CE-GA14-01-26: protected commit known + external effect UNKNOWN.
CE-GA14-01-27: duplicate retry uses new operation_id and attempts to bypass UNKNOWN.
CE-GA14-01-28: recovered snapshot omits prepared/pending record.
CE-GA14-01-29: stale leader/client retries old command after authority revocation.
CE-GA14-01-30: recovery falsely interprets timeout as abort.

## Mini-audit against A01-A14

No contradiction found.

The research strengthens:
- operation/effect identity;
- protected linearization;
- UNKNOWN preservation;
- recovery fencing;
- external-truth separation;
- evidence requirements;
- anti-rollback currentness.

It adds a missing explicit distinction:
DURABLE COMMIT ≠ RESPONSE DELIVERY ≠ APPLICATION EFFECT ≠ EXTERNAL EFFECT.

## Open issues

1. Whether Nexo should use a 2PC-like prepared state at all.
2. Whether cross-domain anchor updates can be modeled as a participant or must remain a witness.
3. Exact recovery owner and fencing for prepared/pending states.
4. Interaction between prepared state and STOP.
5. Interaction between prepared state and decommission.
6. Interaction between prepared state and VersionSet migration.
7. Formal state-machine model and TLC/SANY execution.
8. Fault-injection implementation.

## Sources
- Raft paper: https://raft.github.io/raft.pdf
- etcd/raft application integration: https://github.com/etcd-io/raft/blob/main/doc.go
- PostgreSQL two-phase transactions: https://www.postgresql.org/docs/17/two-phase.html
- PostgreSQL two-phase implementation: https://github.com/postgres/postgres/blob/master/src/backend/access/transam/twophase.c
- NIST SP 800-193: https://csrc.nist.gov/pubs/sp/800/193/final

Continuity rule:
DESIGNED != IMPLEMENTED != PROVED != VERIFIED != DEPLOYED VERIFIED.

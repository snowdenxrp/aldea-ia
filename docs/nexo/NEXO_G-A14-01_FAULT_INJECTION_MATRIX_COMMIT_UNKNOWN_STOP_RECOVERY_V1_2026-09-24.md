# NEXO G-A14-01 — Fault-Injection Matrix: Commit / UNKNOWN / STOP / Recovery
## Research Delta V1 — 2026-09-24

Status: RESEARCH / ADVERSARIAL DESIGN
G-A14-01 remains OPEN.
Implementation NOT STARTED. Formal verification NOT PROVEN.

## 1. Research basis

Primary/code sources reviewed:
- Raft paper: client retry after leader crash, stable command serial numbers, duplicate suppression.
- etcd/raft: committed entries are subsequently applied to the application state machine; proposals are not guaranteed to commit.
- Hashicorp Raft: durable quorum commit precedes FSM application and client response.
- PostgreSQL 2PC: PREPARED is durable and survives session loss/crash; later COMMIT PREPARED or ROLLBACK PREPARED resolves it.
- PostgreSQL source: prepared state may live in WAL or pg_twophase and crash recovery has to reconcile those representations.

These sources establish implementation patterns, not proof of the Nexo architecture.

## 2. Canonical fault-injection matrix

| ID | Injected failure point | Required semantic result |
|---|---|---|
| FI-01 | crash before protected linearization | no success inference; revalidate |
| FI-02 | crash after linearization before durable result | recover durable transition state; no duplicate |
| FI-03 | durable commit, response lost | COMMITTED; retry uses same logical identity |
| FI-04 | commit uncertain at caller | UNKNOWN/QUERY_DURABLE_STATE; never assume abort |
| FI-05 | apply delayed after commit | COMMITTED != APPLIED |
| FI-06 | apply crash/restart | replay/reapply according to idempotent state-machine semantics |
| FI-07 | anchor increment before store commit | CROSS_DOMAIN_UNCERTAIN; no authority release from anchor alone |
| FI-08 | store commit before anchor increment | CROSS_DOMAIN_UNCERTAIN; no currentness claim until resolved |
| FI-09 | anchor unavailable | currentness UNKNOWN; safety release blocked |
| FI-10 | old store snapshot restored with current anchor | lineage/binding mismatch; quarantine |
| FI-11 | current store restored with reset anchor | anchor trust/currentness lost; quarantine/re-enrollment |
| FI-12 | prepared state restored without coordinator context | recovery owner must be established; cannot auto-commit |
| FI-13 | STOP arrives during PREPARED | safety fence dominates; no normal release |
| FI-14 | STOP arrives after COMMITTED before APPLY | committed history preserved; execution/application remains fenced as required |
| FI-15 | STOP arrives after external attempt but outcome UNKNOWN | preserve UNKNOWN; reconcile; no retry-as-new-effect |
| FI-16 | authority revoked during recovery | recovery cannot acquire/retain ordinary execution authority |
| FI-17 | decommission during UNKNOWN | decommission cannot erase unresolved effect history |
| FI-18 | VersionSet changes while PREPARED | pending transition must be revalidated or quarantined |
| FI-19 | duplicate retry with new operation_id | reject as bypass if it targets unresolved effect |
| FI-20 | timeout after external request | timeout is not external outcome |
| FI-21 | response says failure but durable commit exists | durable authoritative state wins; caller response is not history |
| FI-22 | response says success but durable commit absent | do not treat response as protected history |
| FI-23 | snapshot omits consumed fence/epoch | stale authority blocked by independent currentness/fencing mechanism |
| FI-24 | reconciliation observer disagrees | preserve contradiction; no optimistic resolution |
| FI-25 | recovery owner crashes mid-recovery | fence ownership; next recovery must establish current owner |
| FI-26 | anchor increment error may hide successful increment | reconcile anchor before retry; never blind-increment |
| FI-27 | coordinator crash after PREPARE | PREPARED persists; recovery ownership required |
| FI-28 | participant unavailable during resolution | remain pending/quarantined according to safety policy |
| FI-29 | rollback after successful historical transition | anti-regression mechanism must detect/reject |
| FI-30 | all local copies restored together | no local evidence can prove currentness; external/independent anchor or equivalent required |

## 3. Dominance rules

The matrix yields explicit precedence rules:

STOP/FENCE > normal execution release.

UNKNOWN > optimistic retry.

Durable protected history > caller response.

Currentness failure > normal recovery release.

Decommission does not erase unresolved effect identity.

Version incompatibility > prepared/pending completion.

Anchor/store disagreement > success inference.

These are semantic dominance rules, not implementation instructions for a specific database.

## 4. Important refinement: COMMITTED is not always RELEASE-ELIGIBLE

A protected transition can be durably committed while ReleaseEligible remains false because:
- external effect is UNKNOWN;
- STOP fence is active;
- evidence is stale/invalid;
- VersionSet is incompatible;
- authority has been revoked;
- recovery is incomplete.

Therefore the architecture must not use COMMITTED as a synonym for EXECUTION_ENABLED or RELEASE_ELIGIBLE.

## 5. Recovery state proposal

Research supports a richer recovery state vocabulary:

NOT_COMMITTED
PREPARED
COMMITTED
APPLIED
EXTERNAL_UNKNOWN
RECONCILIATION_PENDING
VERIFIED_OUTCOME
QUARANTINED

Not every operation needs every state. The state machine must declare which transitions are legal for each effect class.

## 6. STOP interaction

STOP is a safety fence, not a transaction abort.

If STOP arrives while a transaction is PREPARED or COMMITTED:
- do not rewrite history;
- do not manufacture ROLLBACK;
- prevent further normal authority/action as required;
- preserve exact operation/effect identity;
- reconcile any external attempt;
- require explicit recovery/release after STOP verification and current safety context.

This preserves the existing A07/A08 model.

## 7. Fault injection as an implementation requirement

When implementation eventually begins, each protected transition must have injection points at minimum:
- before linearization;
- at linearization;
- after linearization;
- before durable result;
- after durable result;
- before response;
- after response;
- before anchor update;
- after anchor update;
- before external dispatch;
- after external dispatch;
- before reconciliation result;
- after reconciliation result;
- during STOP;
- during recovery;
- during snapshot/restore.

The test harness must distinguish:
CRASH, PROCESS STOP, NODE LOSS, STORAGE LOSS, STORAGE ROLLBACK, PARTITION, TIMEOUT, RESPONSE LOSS, DUPLICATE DELIVERY, REORDERING, CORRUPTION, RESOURCE EXHAUSTION.

## 8. New invariants

INV-GA14-01-25:
A caller-visible timeout cannot create a protected abort unless durable state records abort.

INV-GA14-01-26:
A durable commit cannot be erased by response loss, process restart, or client retry.

INV-GA14-01-27:
A committed protected transition may remain non-release-eligible.

INV-GA14-01-28:
STOP/fence blocks normal release regardless of PREPARED/COMMITTED/APPLIED status when its scope covers the operation.

INV-GA14-01-29:
Anchor/store disagreement is not success.

INV-GA14-01-30:
External UNKNOWN is preserved across retry, restart, migration, snapshot restore, and decommission until an explicit valid reconciliation terminal state exists.

INV-GA14-01-31:
Recovery cannot resolve ambiguity by creating a new operation identity.

INV-GA14-01-32:
A response cannot manufacture authoritative history absent a corresponding durable protected state.

## 9. Mini-audit

No contradiction found with A01-A14.

The matrix exposes a necessary distinction:
History state, execution permission, and world outcome are independent dimensions.

This reinforces:
INFORMATION != AUTHORITY != EFFECT != EVIDENCE.

The fault matrix also provides a direct bridge toward A14.14 (fault-injection architecture) without claiming that the implementation exists.

## 10. Status

G-A14-01a non-regression semantics: SUBSTANTIALLY DESIGNED.
G-A14-01b anti-rollback mechanism: OPEN.
G-A14-01c cross-domain atomicity: OPEN.
G-A14-01d anchor/state binding: OPEN.
G-A14-01e ambiguous commit/recovery protocol: DESIGN REFINED, implementation OPEN.
G-A14-01f fault-injection specification: DESIGN REFINED, implementation OPEN.
G-A14-01g formal verification: NOT PROVEN.

No implementation gate opened.

## Sources
- Raft paper: https://raft.github.io/raft.pdf
- etcd/raft: https://github.com/etcd-io/raft
- Hashicorp Raft apply semantics: https://github.com/hashicorp/raft/blob/main/docs/apply.md
- PostgreSQL PREPARE TRANSACTION: https://www.postgresql.org/docs/18/sql-prepare-transaction.html
- PostgreSQL 2PC internals: https://doxygen.postgresql.org/twophase_8c_source.html

Continuity rule:
DESIGNED != IMPLEMENTED != PROVED != VERIFIED != DEPLOYED VERIFIED.

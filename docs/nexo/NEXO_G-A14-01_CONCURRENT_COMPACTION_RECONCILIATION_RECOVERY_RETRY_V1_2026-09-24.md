# NEXO G-A14-01 — Concurrent Compaction × Reconciliation × Recovery × Retry
## Research / Adversarial Delta V1 — 2026-09-24

Status: DESIGN RESEARCH. No implementation. No formal proof.

## 1. Research question

Can Nexo compact protected pending/effect state concurrently with reconciliation, retry, recovery-owner changes, STOP, and migration without deleting the only information required to prevent duplicate effects or stale authority?

## 2. Evidence studied

PostgreSQL MVCC demonstrates that concurrent readers can observe historical snapshots while writers progress; serialization/isolation is a separate concern from storage cleanup. PostgreSQL also documents that prepared transactions can prevent VACUUM from reclaiming storage and can retain locks.

etcd exposes compaction as a revision operation: watchers attempting to start at a compacted revision are canceled and must not assume the old revision remains available. Its current maintenance documentation supports time- or revision-based compaction, but that mechanism is designed around revision history, not unresolved external effects.

The transactional outbox pattern demonstrates the classic relay race: a relay can publish and crash before recording publication, causing duplicate delivery; consumers therefore need idempotency.

These are comparative patterns, not direct Nexo implementation choices.

## 3. Central finding

Compaction cannot be based only on age, revision, or local storage pressure.

For safety-critical effect state, compaction must first establish a protected condition:

COMPACTION_ELIGIBLE
=
TERMINAL_OUTCOME
AND
NO_UNRESOLVED_DEPENDENCY
AND
NO_ACTIVE_RECOVERY_OWNER
AND
NO_ACTIVE_RETRY/RECONCILIATION_LEASE
AND
CURRENT_VERSION_COMPATIBLE
AND
CURRENTNESS_VALID
AND
SUFFICIENT_TERMINAL_SUMMARY_DURABLE

The exact predicate remains OPEN.

## 4. Race: compactor vs reconciler

Unsafe:
1. reconciler reads UNKNOWN;
2. compactor sees old timestamp;
3. compactor deletes record;
4. reconciler obtains provider outcome;
5. outcome cannot be bound to protected identity.

Required:
- compaction and reconciliation conflict on the same protected effect footprint;
- either reconciliation linearizes first, or compaction proves the reconciliation dependency is closed;
- deleting/compacting the record cannot race with creation of a new reconciliation obligation.

## 5. Race: compactor vs retry

Unsafe:
1. retry reads old dedup state;
2. compactor removes dedup record;
3. retry dispatches;
4. old external effect already existed.

Required:
stable effect identity + protected retry admission + current fence.
A retry decision must be serialized against compaction of the identity it relies on.

## 6. Race: compactor vs recovery owner

Unsafe:
1. recovery owner A holds a pending operation;
2. compactor removes it;
3. owner A crashes;
4. owner B cannot determine whether A had authority or whether effect was resolved.

Required:
compaction must not remove recovery-critical identity while an active recovery lease/fence can legitimately reference it.

If owner state itself is stale, current recovery fencing must dominate.

## 7. Race: compactor vs STOP

Unsafe:
1. effect is UNKNOWN;
2. compactor marks it terminal;
3. STOP arrives;
4. system no longer has enough identity to reconcile.

Required:
STOP creates/retains a protected dependency that blocks compaction until the STOP-related reconciliation obligations are closed.

## 8. Race: compactor vs migration

Unsafe:
1. migration starts V1→V2;
2. compactor sees V1 record as old;
3. record is compacted;
4. migration loses source lineage needed to prove semantic continuity.

Required:
migration creates a protected dependency/fence preventing compaction of source state until cutover and lineage validation complete.

## 9. Race: two reconcilers

Two recovery/reconciliation workers must not both independently resolve the same effect.

Required:
effect-scoped ownership/fencing:
(effect_key, reconciliation_epoch, owner)
Only current owner can publish a resolution.

A stale owner may finish physically but its result must be rejected if the protected epoch has advanced.

## 10. Race: retry vs reconciliation

If external outcome is UNKNOWN, retry and reconciliation are competing interpretations of the same effect.

Required default:
RECONCILIATION dominates creation of a new external effect.

Only a provider/effect-class-specific rule can establish that a new attempt is safe.

A new operation_id is not sufficient.

## 11. Race: compaction vs terminal verification

Terminal verification must linearize before compaction eligibility.

Candidate sequence:

VERIFY_TERMINAL
→ DURABLE_TERMINAL_SUMMARY
→ ADVANCE_COMPACTION_FLOOR
→ COMPACT

Never:
COMPACT
→ infer terminality from absence.

## 12. Protected Effect Registry — candidate concept

The combined races suggest a possible first-class protected structure:

ProtectedEffectRecord:
- operation_id
- effect_key
- target_fingerprint
- parameter_fingerprint
- effect_class
- lifecycle_state
- authority_context
- fence/epoch
- VersionSet
- currentness/lineage reference
- reconciliation_owner/epoch
- retry admission state
- STOP dependency
- migration dependency
- decommission dependency
- terminal verification reference
- compaction state
- protected history reference

This is a candidate semantic object, NOT YET canonical and NOT yet selected for implementation.

Its purpose would be to give all conflicting operations one protected conflict footprint.

## 13. Conflict footprint

For each protected operation, define:

ReadSet
WriteSet
EffectSet
AuthorityDomainSet
ResourceSet
VersionSet
RecoverySet
EvidenceDependencySet
ExternalSystemSet

Compaction must conflict with every operation whose safety depends on the same footprint.

This extends the earlier conflict-footprint model.

## 14. New contracts

PSC-37 — Compaction/Reconciliation Exclusion
Compaction cannot invalidate an active reconciliation obligation.

PSC-38 — Compaction/Retry Exclusion
Compaction cannot remove the identity required to authorize or suppress a retry.

PSC-39 — Compaction/Recovery Exclusion
Compaction cannot remove state required by a current recovery owner.

PSC-40 — Compaction/STOP Exclusion
STOP-related dependencies block compaction until resolved.

PSC-41 — Compaction/Migration Exclusion
Migration source lineage cannot be compacted before protected cutover.

PSC-42 — Effect-Scoped Reconciliation Fencing
Only the current reconciliation owner/epoch may resolve a pending effect.

PSC-43 — Terminal-Before-Compaction
Compaction eligibility requires a durable terminal resolution, not inference from age/absence.

## 15. New invariants

INV-GA14-01-49:
Compaction cannot make an unresolved effect unidentifiable.

INV-GA14-01-50:
A stale reconciliation owner cannot produce a current terminal resolution.

INV-GA14-01-51:
A retry cannot rely on deduplication state that is concurrently being compacted.

INV-GA14-01-52:
STOP creates a protected dependency that prevents unsafe compaction.

INV-GA14-01-53:
Migration cannot lose source lineage before protected cutover completion.

INV-GA14-01-54:
Terminal summary cannot claim stronger assurance than the verification that produced it.

INV-GA14-01-55:
Absence of a pending record after compaction is not evidence that no effect occurred unless a protected terminal summary establishes that fact.

INV-GA14-01-56:
Compaction must preserve enough state to reject stale retries and stale recovery owners.

## 16. Important result

The research does NOT prove that a separate ProtectedEffectRegistry is required.

It establishes that some protected mechanism must provide an equivalent property:

ALL safety-relevant operations that can race on one external effect must share a linearizable conflict domain or an equivalent provable coordination mechanism.

If the chosen storage/protocol cannot provide this, a separate protected registry or equivalent coordination layer becomes necessary.

## 17. Resource consequence

Compaction itself can become a bottleneck.

Therefore the future implementation must avoid requiring a global lock for every effect if scale matters.

Candidate mechanisms to study next:
- effect-sharded protected state machines;
- per-effect linearization keys;
- transactional conditional updates;
- consensus partitions/shards;
- epoch/fence based ownership;
- immutable terminal summaries;
- bounded reconciliation queues.

No technology selected.

## 18. Mini-audit

No contradiction found with A01-A14 or prior G-A14-01 deltas.

The result refines the earlier claim:
"garbage collection is a protected semantic transition"

into:
"compaction must participate in the same safety conflict domain as reconciliation, retry, recovery, STOP and migration for the effects whose state it can remove."

## 19. Status

G-A14-01a non-regression semantics: SUBSTANTIALLY DESIGNED.
G-A14-01b anti-rollback mechanism: OPEN.
G-A14-01c cross-domain atomicity: OPEN.
G-A14-01d anchor/state binding: OPEN.
G-A14-01e ambiguous pending lifecycle: DESIGN REFINED.
G-A14-01f fault injection: DESIGN REFINED.
G-A14-01g formal verification: NOT PROVEN.
G-A14-01h migration/decommission interaction: DESIGN REFINED.
G-A14-01i retention/compaction/resource protocol: DESIGN REFINED.
G-A14-01j concurrent compaction/reconciliation/retry/recovery: DESIGN REFINED.

No implementation gate opened.

## Sources
- PostgreSQL MVCC/concurrency: https://www.postgresql.org/docs/14/mvcc-intro.html
- PostgreSQL prepared transactions: https://www.postgresql.org/docs/18/sql-prepare-transaction.html
- PostgreSQL vacuuming: https://www.postgresql.org/docs/18/routine-vacuuming.html
- etcd maintenance/compaction: https://etcd.io/docs/v3.8/op-guide/maintenance/
- etcd API compaction semantics: https://etcd.io/docs/v3.5/dev-guide/api_reference_v3/
- Transactional outbox: https://microservices.io/patterns/data/transactional-outbox

Continuity rule:
DESIGNED != IMPLEMENTED != PROVED != VERIFIED != DEPLOYED VERIFIED.

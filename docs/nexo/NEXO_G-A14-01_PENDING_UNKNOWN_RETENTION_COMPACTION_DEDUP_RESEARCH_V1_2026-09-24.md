# NEXO G-A14-01 — Pending/UNKNOWN Retention, Compaction, Deduplication and Resource Bounds
## Research Delta V1 — 2026-09-24

Status: DESIGN RESEARCH / ADVERSARIAL
No implementation. No formal proof.

## 1. Research basis

PostgreSQL 18 documents that prepared transactions are intended to be short-lived; long-lived prepared transactions retain locks and interfere with VACUUM/resource reclamation. Its source maintains prepared transaction state in WAL and, across checkpoints, pg_twophase. It also has an explicit maximum prepared transaction capacity.

etcd recovery documentation shows that restoring an older snapshot can require a revision bump and marking historical revisions compacted so consumers do not continue using stale cache/watch history.

Kafka documentation provides a useful contrasting pattern: idempotent delivery uses producer identity plus sequence numbers; transactional identity can persist across producer sessions and fencing prevents an older producer instance with the same transactional identity from continuing. Kafka also has explicit transaction timeout and transaction-state storage.

These are implementation examples, not prescriptions for Nexo.

## 2. New central finding

Nexo cannot solve unbounded UNKNOWN/PREPARED state by ordinary garbage collection.

The system needs two separate mechanisms:

A. SAFETY RETENTION — minimum history required to prevent duplicate effect, stale authority, resurrection, or false resolution.

B. RESOURCE COMPACTION — removal/reduction of data only after a protected proof that the removed detail is no longer required for safety/reconciliation.

Therefore:

COMPACTION != DELETION OF SAFETY HISTORY.

## 3. Three retention classes

R0 — Safety Anchor:
Never compact unless replaced by a protected equivalent with preserved semantics and lineage.

R1 — Reconciliation Minimum:
Keep enough information to uniquely identify operation/effect, target, authority context, VersionSet, pending/UNKNOWN state, and required reconciliation dependencies.

R2 — Reconstructable Evidence/Telemetry:
Can be compacted when no safety-critical claim depends on the removed detail and a durable summary/claim preserves required lineage.

Exact retention periods remain OPEN and must be policy-specific.

## 4. Deduplication is not permanent by default

A deduplication record that says EFFECT-X was seen is not sufficient forever.

If the deduplication record is garbage-collected while the external provider can still replay, retry, or report a delayed result, a later retry may create a duplicate effect.

Therefore deduplication state can be compacted only when a stronger terminal condition exists, such as:
- verified terminal outcome;
- provider-specific replay horizon expired under a trusted time/currentness model;
- immutable external idempotency key remains valid;
- a protected summary prevents semantic resurrection;
- no unresolved dependency can reintroduce the effect.

The exact terminal conditions are effect-class specific and OPEN.

## 5. UNKNOWN must not have an arbitrary TTL

A timeout such as “UNKNOWN for 24h => delete” is unsafe by itself.

Timeout can trigger:
- reconciliation escalation;
- admission restriction;
- quarantine;
- human/operator review where authorized;
- provider-specific recovery.

It cannot by itself prove:
- no effect occurred;
- effect was reversed;
- effect is safe to retry.

Therefore:

UNKNOWN + TIMEOUT != NO_EFFECT.

## 6. Stable identity and compaction

The logical operation identity and effect identity must survive any compaction that still permits an effect to be outstanding.

Candidate minimum:
operation_id
effect_key
target fingerprint
payload/parameter fingerprint
authority context
VersionSet
current fence/epoch reference
pending/UNKNOWN state
reconciliation lineage
required dependency references

A new operation_id cannot be used to escape an unresolved older identity.

## 7. Compaction state machine

Candidate semantics:

ACTIVE
→ TERMINAL_VERIFIED
→ COMPACTION_ELIGIBLE
→ COMPACTED_WITH_SUMMARY

If terminal verification is absent:

ACTIVE
→ UNKNOWN
→ RECONCILIATION_REQUIRED
→ QUARANTINED or TERMINAL_VERIFIED

There must be no direct:

UNKNOWN → DELETED

or:

PREPARED → DELETED

## 8. Snapshot and restore

etcd's snapshot restore behavior provides a useful concrete lesson: restoring older state may require revision bumping and invalidating historical watches/caches to prevent stale consumers from treating old state as current.

For Nexo:
RESTORE_OLD_STATE must create a new recovery lineage and must not restore authority, leases, fences, or effect-release eligibility merely because the records exist in the snapshot.

If currentness cannot be established:
QUARANTINE/HOLD.

## 9. Fencing and deduplication interaction

Kafka's transactional identity/fencing demonstrates that deduplication across process sessions requires stable identity plus fencing of old sessions.

Nexo generalization:
DEDUPLICATION WITHOUT FENCING is insufficient where stale actors may still issue actions.

Required relationship:

stable operation/effect identity
+
current actor fence
+
current authority
=
eligible retry attempt

not:

stable identity alone = safe retry.

## 10. Resource exhaustion

When protected pending state approaches capacity:

Level 0 NORMAL:
normal admission.

Level 1 RESTRICTED:
reduce new non-critical operations.

Level 2 HOLD:
block new safety-relevant effects whose state would exceed protected capacity.

Level 3 QUARANTINE:
preserve existing safety state and reconciliation identity; admit only recovery/reconciliation operations required to reduce risk.

Resource pressure must never cause:
- UNKNOWN deletion;
- STOP clearing;
- authority resurrection;
- identity reuse;
- silent dedup reset;
- stale snapshot acceptance.

Exact thresholds are OPEN.

## 11. New contracts

PSC-30 — Safety Retention Minimum
Protected state may be compacted only when an equivalent safety/reconciliation guarantee remains.

PSC-31 — UNKNOWN No-TTL Resolution
Elapsed time alone cannot resolve UNKNOWN.

PSC-32 — Deduplication Retention Safety
Deduplication may not be removed while the corresponding external effect could still safely be replayed/reported as outstanding.

PSC-33 — Compaction Lineage
Compaction must preserve enough lineage to prove why removed state no longer matters.

PSC-34 — Restore Lineage
Restoring an old snapshot cannot restore current authority/currentness by itself.

PSC-35 — Fenced Retry
Retry requires both stable effect identity and current execution fencing/authority.

PSC-36 — Resource-Pressure Fail-Closed
Protected capacity exhaustion restricts admission rather than discarding safety state.

## 12. New invariants

INV-GA14-01-41:
UNKNOWN cannot transition directly to DELETED.

INV-GA14-01-42:
PREPARED cannot be garbage-collected while its effect identity may still be unresolved.

INV-GA14-01-43:
Compaction cannot remove the only protected lineage needed to explain an unresolved effect.

INV-GA14-01-44:
A new operation identity cannot invalidate or supersede an unresolved old effect merely by being newer.

INV-GA14-01-45:
Restore of an old snapshot cannot by itself satisfy currentness or authority predicates.

INV-GA14-01-46:
Deduplication without current fencing cannot authorize retry.

INV-GA14-01-47:
Resource exhaustion cannot weaken STOP, currentness, UNKNOWN preservation, or identity continuity.

INV-GA14-01-48:
A compacted terminal summary must not claim stronger assurance than the evidence that justified compaction.

## 13. Important architectural consequence

The protected core needs a distinction between:

CURRENT LIVE STATE
HISTORICAL SAFETY SUMMARY
RECONCILIATION-REQUIRED STATE
COMPACTED PROOF/CLAIM

Otherwise compaction risks becoming an implicit semantic rewrite.

This also means garbage collection itself becomes a safety-relevant transition and must receive:
- authority;
- linearization;
- fencing;
- crash semantics;
- evidence requirements;
- recovery semantics;
- traceability.

## 14. Mini-audit

No contradiction found with A01-A14 or prior G-A14-01 artifacts.

The result strengthens:
- UNKNOWN preservation;
- anti-rollback/currentness;
- operation/effect identity;
- recovery lineage;
- decommission;
- resource protection;
- fault injection.

New observation:
COMPACTION is not merely storage maintenance when protected state contains effect/recovery identity. It is a protected semantic transition.

## 15. Status

G-A14-01a non-regression semantics: SUBSTANTIALLY DESIGNED.
G-A14-01b anti-rollback mechanism: OPEN.
G-A14-01c cross-domain atomicity: OPEN.
G-A14-01d anchor/state binding: OPEN.
G-A14-01e ambiguous pending lifecycle: DESIGN REFINED.
G-A14-01f fault injection: DESIGN REFINED.
G-A14-01g formal verification: NOT PROVEN.
G-A14-01h migration/decommission interaction: DESIGN REFINED.
G-A14-01i retention/compaction/resource protocol: DESIGN REFINED.

No implementation gate opened.

## Sources
- PostgreSQL PREPARE TRANSACTION: https://www.postgresql.org/docs/18/sql-prepare-transaction.html
- PostgreSQL two-phase source: https://github.com/postgres/postgres/blob/master/src/backend/access/transam/twophase.c
- PostgreSQL two-phase transactions: https://www.postgresql.org/docs/18/two-phase.html
- etcd disaster recovery: https://etcd.io/docs/v3.5/op-guide/recovery/
- Kafka producer configuration: https://kafka.apache.org/26/configuration/producer-configs/
- Kafka exactly-once / transactional messaging: https://cwiki.apache.org/confluence/display/KAFKA/KIP-98%2B-%2BExactly%2BOnce%2BDelivery%2Band%2BTransactional%2BMessaging

Continuity rule:
DESIGNED != IMPLEMENTED != PROVED != VERIFIED != DEPLOYED VERIFIED.

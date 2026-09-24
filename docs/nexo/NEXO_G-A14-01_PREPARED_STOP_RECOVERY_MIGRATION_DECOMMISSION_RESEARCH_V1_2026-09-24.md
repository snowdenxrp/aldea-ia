# NEXO G-A14-01 — PREPARED × STOP × Recovery × Migration × Decommission
## Research / Adversarial Interaction Delta V1 — 2026-09-24

Status: DESIGN RESEARCH. No implementation. No formal proof.

## 1. Research basis

PostgreSQL documents PREPARED as a durable state that can survive crash and later be resolved by COMMIT PREPARED or ROLLBACK PREPARED. It also warns that prepared transactions retain locks/resources and should normally be resolved promptly. This is evidence that an explicit pending state has both recovery value and resource-liveness cost. PostgreSQL also documents crash-recovery and two-phase decoding concerns, showing that prepared state interacts with recovery and downstream consumers.

NIST SP 800-193 frames recovery as restoration to a valid and authorized state after corruption, not merely restoration of bytes.

These observations are architectural evidence, not proof that Nexo should implement PostgreSQL-style 2PC.

## 2. Combined adversarial interaction

The hardest combined case is:

PREPARED
+ STOP
+ recovery owner loss
+ VersionSet migration
+ decommission request
+ external outcome UNKNOWN

A safe architecture cannot resolve these dimensions independently.

## 3. Dominance model

Safety fences and currentness dominate completion.

Proposed precedence:

1. TRUST/INTEGRITY FAILURE
2. CURRENTNESS UNKNOWN / ROLLBACK DETECTED
3. STOP/FENCE
4. AUTHORITY REVOCATION
5. VERSION/SCHEMA INCOMPATIBILITY
6. DECOMMISSION CLOSURE REQUIREMENTS
7. PREPARED/PENDING RESOLUTION
8. NORMAL RELEASE

This is a semantic precedence ordering for state admission, not a user-facing priority score.

## 4. PREPARED + STOP

If STOP covers the operation:
- preserve PREPARED history;
- prohibit normal execution/release;
- prevent new attempts that could create a duplicate effect;
- preserve effect identity;
- reconcile external state;
- require verified STOP and a later explicit recovery/release path.

STOP does not imply ROLLBACK.
STOP does not erase PREPARED.
STOP does not prove absence of external effect.

## 5. PREPARED + recovery

Recovery must establish:
- current identity;
- current recovery fence/epoch;
- current authority;
- current VersionSet;
- exact pending operation/effect identity;
- current anchor/lineage;
- STOP state;
- external reconciliation state;
- ownership of the pending resolution.

If any required currentness or integrity fact is unavailable, recovery remains quarantined/pending.

A recovered snapshot must not manufacture authority merely because it contains a syntactically valid PREPARED record.

## 6. PREPARED + migration

Migration introduces a semantic risk:

representation continuity != semantic continuity.

Therefore a PREPARED record may migrate only if:
- operation_id/effect_key remain immutable;
- authority context remains bound;
- VersionSet transition is explicitly compatible;
- pending-state semantics are preserved;
- migration journal/lineage survives;
- no stale writer can continue from the old schema;
- cutover fencing prevents dual owners.

If compatibility cannot be demonstrated:
QUARANTINE / RECONCILIATION_REQUIRED.

UNKNOWN cannot become resolved merely because a representation was migrated.

## 7. PREPARED + decommission

Decommission cannot erase unresolved external effect history.

Before final closure, the system must account for:
- PREPARED/PENDING records;
- EXTERNAL_UNKNOWN operations;
- active recovery ownership;
- outstanding fences;
- evidence dependencies;
- external provider reconciliation;
- durable historical identity.

A decommissioned identity must not resurrect from an old snapshot or stale recovery path.

If unresolved effects cannot be safely transferred to a designated recovery lineage, decommission closure is blocked.

## 8. PREPARED + VersionSet change

A prepared operation created under VersionSet V1 cannot automatically complete under incompatible V2.

Possible safe outcomes:
- prove compatibility and continue;
- explicitly migrate/rebind under a protected migration protocol;
- quarantine and reconcile;
- safely terminate the pending transaction if semantics permit.

Never infer compatibility from matching operation_id alone.

## 9. Critical combined counterexample

T0: OP-77 becomes PREPARED under V1.
T1: STOP asserted.
T2: coordinator crashes.
T3: recovery snapshot is restored.
T4: V1 is migrated to V2.
T5: old coordinator returns.
T6: external provider reports UNKNOWN.
T7: decommission begins.

Unsafe shortcuts would allow:
- old coordinator to resolve OP-77;
- migration to silently rewrite semantics;
- decommission to delete OP-77;
- retry to create OP-78;
- timeout to be interpreted as failure.

Required outcome:
OP-77 remains uniquely identified and unresolved until a current, fenced, authorized recovery path establishes a valid resolution. STOP and currentness failures block normal release.

## 10. Resource/liveness finding

PREPARED is not free.

PostgreSQL documents that prepared transactions can retain locks and interfere with resource reclamation. Therefore Nexo cannot allow indefinite accumulation of PREPARED/UNKNOWN states without an explicit bounded-resource policy.

But resource exhaustion must not:
- erase UNKNOWN;
- recycle operation/effect identity unsafely;
- clear STOP;
- bypass currentness;
- authorize a new effect.

Safe pressure response tends toward:
ADMISSION RESTRICTED → HOLD → QUARANTINE,
while preserving minimum protected history needed for recovery.

## 11. New contracts

PSC-24 — STOP-PREPARED Preservation
STOP cannot erase or silently resolve PREPARED history.

PSC-25 — Recovery-PREPARED Ownership
Only a current, fenced recovery owner may resolve PREPARED/PENDING state.

PSC-26 — Migration-PREPARED Continuity
Migration must preserve operation/effect identity and pending semantics or quarantine.

PSC-27 — Decommission-PREPARED Closure
Decommission cannot close while safety-relevant unresolved pending/effect state lacks a valid successor lineage.

PSC-28 — Version-PREPARED Compatibility
Pending state cannot cross an incompatible VersionSet without explicit protected migration/revalidation.

PSC-29 — Pending-State Resource Safety
Resource exhaustion cannot justify loss of identity, UNKNOWN, STOP, or recovery history.

## 12. New invariants

INV-GA14-01-33:
A PREPARED operation covered by STOP cannot become release-eligible without a later valid release path.

INV-GA14-01-34:
A stale recovery owner cannot resolve PREPARED state.

INV-GA14-01-35:
Migration cannot change the semantic identity of a pending effect.

INV-GA14-01-36:
Decommission cannot remove the only protected record needed to reconcile an unresolved effect.

INV-GA14-01-37:
An incompatible VersionSet blocks automatic completion of pending state.

INV-GA14-01-38:
Resource pressure cannot be used as a semantic justification to discard safety-critical pending history.

INV-GA14-01-39:
A snapshot restore cannot restore authority or recovery ownership by itself.

INV-GA14-01-40:
UNKNOWN remains unresolved across STOP, recovery, migration and decommission until a valid reconciliation terminal claim exists.

## 13. Architectural consequence

The research now suggests that Nexo needs a first-class concept of a:

PENDING/AMBIGUOUS EFFECT LIFECYCLE

rather than treating uncertainty as an error flag.

Candidate lifecycle:

INTENDED
→ PREPARED / PENDING
→ ATTEMPTED
→ UNKNOWN
→ RECONCILIATION_PENDING
→ VERIFIED_OUTCOME
or
→ QUARANTINED

The exact lifecycle is still OPEN.

## 14. Mini-audit

No contradiction found with A01-A14 or previous G-A14-01 deltas.

The new interaction layer strengthens rather than replaces:
- STOP fencing;
- recovery ownership;
- VersionSet compatibility;
- decommission anti-resurrection;
- UNKNOWN preservation;
- currentness/lineage;
- external-truth separation.

Important negative result:
A generic 2PC implementation would not automatically solve these interactions because Nexo's external world is not assumed to participate as a transactional participant.

## 15. Status

G-A14-01a non-regression semantics: SUBSTANTIALLY DESIGNED.
G-A14-01b anti-rollback mechanism: OPEN.
G-A14-01c cross-domain atomicity: OPEN.
G-A14-01d anchor/state binding: OPEN.
G-A14-01e ambiguous pending lifecycle: DESIGN REFINED.
G-A14-01f fault injection: DESIGN REFINED.
G-A14-01g formal verification: NOT PROVEN.
G-A14-01h migration/decommission interaction: DESIGN REFINED.

No implementation gate opened.

## Sources
- PostgreSQL PREPARE TRANSACTION: https://www.postgresql.org/docs/18/sql-prepare-transaction.html
- PostgreSQL Two-Phase Transactions: https://www.postgresql.org/docs/17/two-phase.html
- PostgreSQL pg_prepared_xacts: https://www.postgresql.org/docs/17/view-pg-prepared-xacts.html
- PostgreSQL ROLLBACK PREPARED: https://www.postgresql.org/docs/17/sql-rollback-prepared.html
- NIST SP 800-193: https://csrc.nist.gov/pubs/sp/800/193/final

Continuity rule:
DESIGNED != IMPLEMENTED != PROVED != VERIFIED != DEPLOYED VERIFIED.

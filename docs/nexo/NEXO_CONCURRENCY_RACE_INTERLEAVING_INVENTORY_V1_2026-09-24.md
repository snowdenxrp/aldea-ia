# NEXO CONCURRENCY RACE AND INTERLEAVING INVENTORY V1
Date: 2026-09-24
Status: RESEARCH/CONSOLIDATION — ARCHITECTURE STILL BLOCKED

## External cross-check
NASA systems engineering explicitly includes functional, timing, and state analysis, and its V&V guidance calls for verification at increasing levels of integration and under nominal/off-nominal conditions. Requirements and verification artifacts are expected to remain traceable and configuration-controlled. This supports treating concurrent interleavings as explicit verification objects, not merely implementation bugs.

## 1. Purpose
This inventory enumerates safety-relevant race pairs and the required semantic outcome. It is not a scheduler implementation and does not assume a storage technology.

## 2. Race matrix

| Race | Unsafe shortcut to prohibit | Required ordering/semantic rule |
|---|---|---|
| Authorize ↔ Revoke | stale authorization commits after revocation | one authoritative ordering; pre-linearization revoke blocks authorization |
| Authorize ↔ PolicyChange | old policy authorizes under new safety meaning | authorization binds exact current policy/invariant versions |
| Reserve ↔ Reserve | two actors obtain same exclusive protection | one serialization point/fencing generation |
| Reserve ↔ Revoke | revoked actor retains reservation | revoke invalidates future protected use |
| Execute ↔ Revoke | stale executor starts/commits | final execution gate checks current authority/fence |
| Execute ↔ Stop | normal execution bypasses emergency stop | stop has independent dominating enforcement path |
| Stop ↔ Recovery | recovery accidentally clears stop | recovery may restore state but cannot release execution |
| Execute ↔ LeaseExpiry | expired owner completes critical transition | lease/fence semantics explicitly determine admissibility |
| Takeover ↔ OldOwner | old owner continues after takeover | fencing prevents stale owner effects |
| Commit ↔ Revoke | historical commit rewritten as if never happened | linearization defines which transition happened; revocation affects future authority |
| Verify ↔ PolicyChange | old evidence remains current after safety meaning changes | affected claim re-evaluated |
| EvidenceWrite ↔ EvidenceInvalidation | stale evidence accepted due to write order | validity is derived from current context/version/freshness |
| Recovery ↔ UNKNOWN effect | recovery assumes checkpoint proves external absence | UNKNOWN persists until reconciliation |
| Retry ↔ ExternalEffect | duplicate external effect | stable effect identity/idempotency/reconciliation |
| Timeout ↔ Response | timeout interpreted as failure | timeout creates/retains UNKNOWN unless independently resolved |
| Restart ↔ Authorization | restart grants fresh authority | restart creates no authority |
| Restart ↔ Stop | reboot clears stop | stop epoch/fence persists |
| Update ↔ Execute | old/new control planes both act | update fence and version-set admission |
| Rollback ↔ UNKNOWN | rollback assumes external state | unresolved effect blocks unsafe rollback/release |
| Decommission ↔ Restart | decommissioned identity resurrects | durable decommission fence prevents resurrection |
| Delegation ↔ Revoke | child continues after parent revoke | delegation validity depends on current parent authority |
| Delegation ↔ Expiry | expired delegation authorizes | expiry/revocation checked at authoritative point |
| Evidence ↔ ObserverCompromise | compromised observer self-validates | observer trust is an explicit dependency |
| Reconcile ↔ CompetingReconcile | two reconcilers produce contradictory truth | reconciliation ownership/serialization |
| RecoveryOwner ↔ ExecutionOwner | recovery role becomes unrestricted executor | role scope is explicit and non-transitive |
| ConfigActivation ↔ Evidence | evidence from incompatible VersionSet accepted | evidence binds exact relevant configuration |
| DependencyChange ↔ Release | newly compromised/changed dependency ignored | dependency impact invalidates affected assurance |
| ClockChange ↔ Lease/Expiry | time manipulation changes authority semantics | trusted time assumptions explicit; expiry never proves world truth |
| NetworkPartition ↔ CachedAuthority | stale cache continues authorization | critical authority requires current admissible context |
| StorageRollback ↔ Epoch | old state reappears with current authority | anti-rollback/version/fencing semantics |
| SnapshotRestore ↔ Delegation | restored old delegate becomes valid | delegation validity bound to current epoch/context |
| Migration ↔ ConcurrentWrite | semantic data loss or split meaning | migration fencing/version coexistence rules |
| SchemaChange ↔ Evidence | same field interpreted differently | schema/version binding invalidates incompatible evidence |
| HumanApproval ↔ ContextChange | approval for old scope applied to new scope | approval binds exact request/context and expiry |
| HumanApproval ↔ WrongTarget | authentic approval acts on unintended target | exact target binding before execution |
| EmergencyStop ↔ ExternalCancel | local stop mistaken for remote cancellation | separate states for local enforcement and external confirmation |
| AuditWrite ↔ StateCommit | audit record falsely implies committed state | audit cannot grant state transition |
| ProofCache ↔ ModelChange | cached proof reused after model/context change | obligation/context fingerprint invalidates cache |
| FormalProof ↔ ImplementationChange | proof assumed to cover changed implementation | implementation correspondence/reverification required |

## 3. Race classes

### R1 — Authority races
Authorize, revoke, delegate, expire, policy change, trust-root change.

Required property:
No operation may acquire or retain protected authority merely because it observed an older valid context.

### R2 — Ownership/fencing races
Reserve, renew, expire, takeover, old-owner retry.

Required property:
At most the currently admissible fenced owner can perform protected coordination transitions.

### R3 — Safety-plane races
Execute, STOP, recovery, restart.

Required property:
Safety/recovery fences dominate normal execution and cannot be cleared implicitly.

### R4 — Evidence races
Observe, invalidate, verify, context change, observer compromise.

Required property:
A claim cannot rely on evidence that is stale, superseded, context-mismatched or untrusted.

### R5 — External-effect races
Execute, retry, timeout, response loss, reconciliation.

Required property:
Effect identity is stable and ambiguity is preserved until independently reconciled.

### R6 — Lifecycle races
Update, rollback, migration, decommission, restart.

Required property:
No lifecycle transition resurrects authority or silently changes safety meaning.

## 4. Interleaving rule
For every critical race pair, analysis must enumerate at least:

1. A then B.
2. B then A.
3. A observes pre-state, B commits, A commits.
4. A commits, B observes post-state.
5. crash between A's observation and commit.
6. retry after crash.
7. stale actor after fencing/revocation.
8. partitioned actor with stale state.

A pair is not considered analyzed merely because its normal sequential behavior is correct.

## 5. Safety properties to check
For each interleaving:
- no unauthorized protected effect;
- no stale owner effect;
- no stop bypass;
- no resurrection after revoke/decommission;
- no false verified external effect;
- no deletion of UNKNOWN without reconciliation;
- no use of stale evidence for current release;
- no incompatible VersionSet activation;
- no cross-operation evidence substitution;
- no authority escalation through recovery/restart;
- no hidden common-mode assumption.

## 6. Linearization candidates exposed by race analysis
The race inventory suggests these semantic points require explicit definition:
- authorization acceptance;
- reservation/fence acquisition;
- final execution admission;
- stop enforcement;
- revocation;
- recovery release;
- configuration activation;
- verified commit;
- reconciliation finalization.

The architecture must define whether each is a single linearization point, a multi-step protocol with an equivalent proof, or intentionally non-linearizable with a weaker claim.

## 7. New invariants
RACE-01: Every safety-relevant concurrent pair has explicit interleaving semantics.
RACE-02: A stale observer cannot convert an old valid state into a new authorized effect.
RACE-03: Revocation and STOP cannot be bypassed by an actor that cached prior authority.
RACE-04: Recovery/restart cannot resurrect revoked, expired or decommissioned authority.
RACE-05: External-effect ambiguity survives all retries and restarts until reconciliation.
RACE-06: Evidence invalidation races are resolved by current context, not write order.
RACE-07: Configuration/migration races cannot silently alter the meaning of safety-relevant state.
RACE-08: Audit/proof artifacts cannot themselves create the state they describe.
RACE-09: A race analysis must include crash, retry, partition and stale-actor cases.
RACE-10: Race coverage is a verification obligation traceable to requirements/invariants.

## 8. New open gates
1. Build complete protected-transition graph.
2. Enumerate conflict pairs automatically from graph/object ownership.
3. Define pre/postconditions and affected state for every transition.
4. Define linearization or equivalent protocol for every L3 transition.
5. Define race-specific model-checking scenarios.
6. Define runtime concurrency/fault-injection tests.
7. Map each race to evidence and acceptance criteria.
8. Cross-check races against common-mode and dependency failures.

Architecture remains BLOCKED.

DESIGNED != IMPLEMENTED != TESTED != VERIFIED.

# NEXO INVALIDATION DURABILITY / CRASH CONSISTENCY / REPLAY MODEL V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation.

## 1. Research basis

NIST SP 800-160 Rev. 1 describes secure systems as systems that do not transition into insecure states and emphasizes protective failure and protected recovery. NIST SP 800-160 Vol. 2 frames resilience around anticipating, withstanding, recovering from and adapting to adverse conditions. NIST SP 800-53 includes protection of audit information and replay resistance concepts. These principles imply that revocation/invalidation state itself must have durable, replay-safe semantics; otherwise a crash can reopen a path that was supposed to be closed. citeturn0search25turn0search1turn0search26turn0search9

## 2. Core failure

Consider:

REVOCATION_REQUEST
→ authority revoked
→ crash
→ invalidation propagation incomplete
→ restart
→ stale worker/cache/queue appears valid.

If the architecture cannot prevent this, revocation is not a durable safety boundary.

Therefore:

REVOCATION DURABILITY != EVENT LOG DURABILITY.

What must survive is the semantic effect of the revocation.

## 3. Required durable semantic facts

At minimum, safety-critical invalidation needs durable representation of:
- change_id;
- change type;
- affected authority/context/version/fence identity;
- monotonic or otherwise non-reusable ordering/fencing information;
- effective state;
- dependency-impact status;
- propagation status;
- required revalidation;
- residual UNKNOWN conditions;
- relevant policy/invariant/VersionSet context;
- trust-root/configuration context;
- evidence of closure or unresolved propagation.

A generic revoked=true bit is insufficient for distributed stale-state handling.

## 4. Three different ordering problems

O1 — Change ordering: which context is newer?

O2 — Propagation ordering: which invalidation has been applied to which dependent object?

O3 — External-effect ordering: when did the real-world effect occur relative to the control-plane change?

Therefore:

CONTROL ORDER != PROPAGATION ORDER != WORLD ORDER.

## 5. Crash windows

Every critical invalidation transition must analyze:
W0 before change admission;
W1 change admitted but not durable;
W2 change durable but propagation not started;
W3 propagation partially completed;
W4 propagation durable but dependent worker still running;
W5 worker observes new fence;
W6 worker crashes before acknowledgement;
W7 system crashes after acknowledgement;
W8 restart/recovery;
W9 replay of old/new change records.

Safety rule:
No crash window may create a path from OLD_VALID_CONTEXT to NEW_AUTHORITY without a current protected admission.

## 6. Atomicity candidates

A — Single authoritative transaction:
change + critical invalidation state committed together.

B — Durable intent + deterministic replay:
commit CHANGE_INTENT, then replay until CHANGE_APPLIED / PROPAGATION_COMPLETE.

C — Epoch/fence invalidation:
change increments protected epoch/fence; dependents are valid only if their context matches current epoch/fence.

D — Combined protocol:
durable change intent + protected epoch/fence + dependency-aware replay.

D is currently the strongest research candidate, but it is NOT selected as final architecture.

## 7. Important distinction

Synchronous propagation is not necessarily required.

What is required is:

STALE CONTEXT
→ CANNOT PRODUCE PROTECTED EFFECT.

Therefore eventually updated caches may be acceptable if the protected execution gate independently checks authoritative fencing.

## 8. Replay semantics

Every invalidation event requires identity and replay semantics.

Minimum:
change_id + change_generation/fencing context + target scope + semantic version + predecessor/current relationship + idempotency semantics.

Replay cases:
- old invalidation replay → must not roll the system backwards;
- duplicate invalidation → harmless/idempotent;
- new invalidation after old one → new context dominates old;
- missing invalidation → not proof of no change;
- conflicting invalidations → deterministic conflict handling, not arbitrary last-writer-wins.

## 9. Last-writer-wins is unsafe by default

A timestamp or arrival order is not enough.

Example:
A = REVOKE epoch 8
B = REAUTHORIZE epoch 9

A arrives after B because of network delay.

Naive last-writer-wins could restore the semantics of epoch 8 after epoch 9.

The architecture needs explicit state-machine ordering, not transport arrival order.

## 10. Queue durability

Queue items must contain enough context to prevent stale execution:
- exact operation/effect identity;
- authority context/epoch;
- VersionSet;
- relevant policy/invariant versions;
- stop/recovery fence;
- expiration if applicable;
- idempotency/replay data.

After recovery:
QUEUE ITEM → revalidate → execute
or
QUEUE ITEM → reject/hold/quarantine.

Never blindly resume.

## 11. Cache durability

Caches need no authority to survive a crash.

Safe semantic:
CACHE = optimization.

If authoritative validation is unavailable:
- deny;
- hold;
- quarantine;
- or restrict according to claim.

Do not silently convert cached context into current authority.

## 12. Partial propagation

Suppose worker A received revoke and worker B did not.

Global status cannot simply be REVOKED_AND_CLOSED.

Instead:
REVOCATION = DURABLE
PROPAGATION = PARTIAL
ASSURANCE = DEGRADED

The system must know whether B can still produce a protected effect.

If B can, the architecture requires an independent fence that makes B stale automatically.

This is why protected epochs/fences can be more important than synchronous fan-out.

## 13. Crash after external attempt

Control-plane change and external effect cannot generally be made atomically identical.

Example:
external request sent
→ response lost
→ revocation occurs
→ process crashes.

After restart, Nexo must preserve:
EFFECT = UNKNOWN

until reconciliation.

Revocation does not retroactively prove NOT_APPLIED.

## 14. Invalidation journal

A possible durable semantic journal contains:

ChangeRecord:
- change_id;
- predecessor_context;
- resulting_context;
- scope;
- reason/class;
- policy/invariant/VersionSet context;
- affected dependency root;
- required propagation/revalidation;
- status;
- fencing value;
- creation/commit metadata.

DependencyImpactRecord:
- change_id;
- dependent_object_id;
- dependency relation;
- action: INVALIDATE/FENCE/REVALIDATE/UNAFFECTED;
- status;
- evidence;
- verifier/owner;
- completion metadata.

These are research objects, not final implementation decisions.

## 15. Recovery of invalidation itself

Restart sequence should not assume propagation completed.

Conceptually:
RESTART
→ load durable change baseline
→ determine latest authoritative fencing/context
→ identify incomplete propagation
→ quarantine affected work
→ replay idempotent invalidations
→ verify protected gates
→ reconcile external effects
→ recompute claims
→ restore normal assurance only after closure.

Thus:
RECOVERY OF CONTROL STATE != RESTORATION OF NORMAL AUTHORITY.

## 16. Double failure

Hard case:
REVOCATION COMMITTED + INVALIDATION STORE UNAVAILABLE + WORKER STORE AVAILABLE.

The worker must not infer that its local state is valid.

The protected gate must have fail-closed or claim-specific degraded behavior.

For critical effects:
UNKNOWN CURRENT AUTHORITY → no protected execution.

## 17. Storage rollback

A storage rollback may resurrect:
- old authority;
- old leases;
- old VersionSet;
- old evidence;
- old decommission state;
- old recovery state.

Required defenses:
- rollback detection;
- external monotonic fencing or equivalent;
- current trust/configuration validation;
- rejection of restored stale authority;
- recovery quarantine.

A restored snapshot cannot manufacture current time, authority or external truth.

## 18. New invariants

DURINV-01: safety-relevant revocation/invalidation semantics survive crash.
DURINV-02: duplicate invalidation replay is idempotent.
DURINV-03: stale invalidation cannot roll protected context backwards.
DURINV-04: missing invalidation is not equivalent to no invalidation.
DURINV-05: transport arrival order cannot determine safety-critical semantic order.
DURINV-06: control ordering, propagation ordering and world ordering remain distinct.
DURINV-07: partial propagation cannot produce normal assurance when an unpropagated path can cause protected effects.
DURINV-08: stale queues require execution-time revalidation.
DURINV-09: caches cannot become authority during recovery.
DURINV-10: crash after external attempt preserves UNKNOWN until reconciliation.
DURINV-11: storage rollback cannot silently restore current authority.
DURINV-12: recovery replays invalidation idempotently.
DURINV-13: current fencing must dominate stale local state.
DURINV-14: inability to establish current critical authority causes HOLD/RESTRICT/QUARANTINE rather than silent continuation.
DURINV-15: invalidation closure requires evidence of the required semantic effect, not merely message delivery.
DURINV-16: the invalidation mechanism itself is subject to dependency/common-mode analysis.

## 19. Result

The Invalidation Plane now has a more precise architectural role.

It is not responsible for synchronously updating every dependent component.

It is responsible for ensuring that after a safety-relevant context change:

NO STALE DEPENDENT STATE CAN STILL PRODUCE A PROTECTED OUTCOME.

The current research direction is therefore:

AUTHORITATIVE CHANGE
→ DURABLE SEMANTIC RECORD
→ FENCING / EPOCH
→ DEPENDENCY IMPACT
→ ASYNCHRONOUS INVALIDATION/REPLAY
→ INDEPENDENT PROTECTED-GATE CHECK
→ RECONCILIATION
→ CLAIM RECOMPUTATION.

## 20. Next research gate

The next gate is the DISTRIBUTED CONSISTENCY MODEL FOR THE CANONICAL CORE.

Compare rigorously:
A. single authoritative state machine;
B. partitioned transactional authoritative stores;
C. protocolized multi-store state with fencing/epochs/idempotency/reconciliation;
D. hybrid topology with a very small authoritative safety core and partitioned semantic stores.

Comparison dimensions:
- TCB size;
- linearization;
- crash consistency;
- partitions;
- common-mode concentration;
- stale actor rejection;
- recovery;
- external effects;
- evidence invalidation;
- update/decommission;
- formal verification burden.

Architecture remains blocked.
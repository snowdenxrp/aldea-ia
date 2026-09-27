# NEXO — AB104.585 — Carrera scheduler → admission → ejecución → invalidación

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE.

## Evidence
etcd transactions atomically evaluate comparisons and apply the success branch, providing a model for commit-time concurrency guards. citeturn0search4
Kubernetes leader election uses optimistic concurrency through resourceVersion so only one concurrent update wins; stale contenders fail rather than silently becoming leader. citeturn0search8
Kubernetes also exposes Lease expiry and identity as explicit coordination state. citeturn0search2

## Finding
The final race is not only scheduler → execution. It is:
ELIGIBLE → QUEUED → STARTING → COMMITTING
while authority, dependency graph, fence, incarnation, or policy may change at every boundary.

A queued item therefore carries an admission snapshot but is never permanently authorized by queue position.

## Required state
Each queued work item binds:
- AdmissionID
- GraphVersion / dependency digest
- AuthorityEpoch
- FenceRevision/Epoch
- Provider/resource incarnation
- EffectContractDigest
- RecoveryGeneration
- Admission expiry/deadline.

## Commit boundary
Immediately before an irreversible or externally visible mutation, Nexo must perform a final authoritative predicate check where the target boundary supports it.
Conceptually:
IF all expected predicates still hold
THEN atomically commit/admit
ELSE reject as STALE_ADMISSION.

This is stronger than a preflight check. A scheduler check alone cannot close TOCTOU.

## Race outcomes
1. Queue entry becomes stale before execution → discard and re-admit.
2. Authority revoked while executing → outcome depends on provider acceptance/execution evidence; do not infer rollback.
3. Provider accepts while local invalidation races → preserve external outcome separately from current authority.
4. Client times out at commit → UNKNOWN until authoritative reconciliation.
5. Queue node crashes after commit but before acknowledgement → reconcile by stable EffectID/RecoveryCommitID.

## Critical distinction
Queue fairness is not authority.
A high-priority queued operation does not retain authorization merely because it waited.
Likewise, an expired queued operation does not become NOT_COMMITTED merely because it was never observed executing.

## Scope
Invalidation should be dependency-scoped. A changed dependency invalidates its dependent closure, not unrelated queued work.

## Cross-domain limit
If the external provider cannot consume the final fence/CAS predicate, Nexo can protect its internal commit state but cannot honestly claim atomic authorization-to-external-effect. The residual race remains in the effect contract, consistent with AB104.579.

## New invariants
1. Queue membership never constitutes authority.
2. Every externally visible effect receives a final admission/commit check.
3. Final check must bind the exact admission snapshot, not merely current coarse status.
4. Stale admission is a distinct state from NOT_COMMITTED.
5. Provider UNKNOWN remains UNKNOWN until authoritative reconciliation.
6. Queue invalidation is dependency-scoped.
7. Fairness/priority cannot override authority, fence or freshness.
8. Internal atomic commit does not imply external atomic effect.

## Closure
AB104.585 closes the scheduler/admission TOCTOU boundary at the model level, while preserving the previously identified external-provider residual race.

OPEN:
- complete state-machine composition;
- fairness under repeated invalidation;
- formal liveness/safety proof;
- implementation/fault injection.

## Next exact step
AB104.586 — compose the full effect lifecycle state machine from intent through admission, queueing, commit, UNKNOWN, reconciliation, compensation and final closure; identify illegal transitions before any implementation.
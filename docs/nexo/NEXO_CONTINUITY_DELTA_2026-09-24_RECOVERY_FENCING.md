# NEXO — CONTINUITY DELTA
Fecha: 2026-09-24

## Purpose
Persistent checkpoint for the current PG-009 research step. This file is a delta record and does not replace historical architecture documents.

## Mandatory workflow reaffirmed
INVESTIGATE → ANALYZE → CONTRAST → RESTRUCTURE/BUILD → VERIFY → SAVE

For every material step:
- preserve research/evidence;
- preserve architectural decision;
- record limitations and uncertainty;
- record implementation/formal status honestly;
- save the artifact in Git;
- record the commit;
- preserve the next research point.

## Reconciled starting state
PG-009 is OPEN.

Emergency-stop observability is architecturally defined through:
STOP_REQUESTED → STOP_DELIVERED → STOP_ACCEPTED → STOP_ENFORCED → ENFORCEMENT_VERIFIED → WORLD_RECONCILIATION

The existing emergency-stop TLA+ artifact remains NOT TLC-VERIFIED.

## Research performed in this step

Question:
How can a stale process, capability, lease, checkpoint, queued operation, or recovery worker regain critical authority after an emergency STOP and restart?

Cross-checks:
1. Kubernetes Lease/leader-election documentation:
   - leases encode holder identity, renewal/expiry and transitions;
   - optimistic concurrency/resourceVersion prevents competing holders from both becoming authoritative;
   - lease expiry transfers coordination but does not establish that an old process is safe or stopped.
2. AWS Step Functions:
   - cancellation of integrated tasks can be best-effort;
   - stopping a workflow therefore does not automatically prove the integrated external task stopped;
   - Standard workflow redrive preserves execution identity/version/history semantics rather than treating restart as an unrelated fresh authorization.

Sources:
- Kubernetes Leases: https://kubernetes.io/docs/concepts/architecture/leases/
- Kubernetes Coordinated Leader Election: https://kubernetes.io/docs/concepts/cluster-administration/coordinated-leader-election/
- AWS Step Functions service integrations: https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html
- AWS Step Functions redrive: https://docs.aws.amazon.com/step-functions/latest/dg/redrive-executions.html
- AWS StartExecution: https://docs.aws.amazon.com/step-functions/latest/apireference/API_StartExecution.html

## Architectural findings

1. Restart is not release.
2. STOP must create a durable recovery fence.
3. Authority epoch, stop epoch, gate epoch, recovery epoch and reconciliation epoch are distinct dimensions.
4. Stale capabilities must be rejected at the protected execution boundary.
5. Lease expiry transfers coordination; it never proves absence of an external effect.
6. Checkpoint restore restores state, not authority.
7. Queued pre-STOP work requires current admission.
8. Recovery ownership is separate from normal execution ownership and reconciliation ownership.
9. Recovery owner changes require authoritative fencing and stale-owner commit rejection.
10. REMOTE_UNKNOWN remains uncertain across restart; local absence cannot become NO_EFFECT.
11. New operation IDs cannot bypass unresolved effect identity/uncertainty.
12. Common-mode independence must be evidenced, not assumed from process separation.

## New architecture artifact
docs/nexo/PG-009_RECOVERY_RESTART_FENCING_2026-09-24.md

Status:
DESIGNED / ARCHITECTURE REVIEWED.
No implementation, fault injection, or world verification claimed.

## New formal artifact
docs/nexo/formal/PG-009_RECOVERY_RESTART_FENCING_SKETCH_2026-09-24.tla

Status:
MODEL SKETCH / NOT TLC-VERIFIED.

The sketch intentionally records its own limitations, including simplified epoch relationships, missing CAS/coordination semantics, missing operation/effect identity, missing common-mode model and missing executable timing/fault semantics. It must be corrected before it can be treated as a useful executable model.

## New invariants
INV-629..648:
- restart does not imply release;
- stop/recovery fencing survives restart;
- stale authority/capability cannot authorize critical execution;
- lease expiry is not effect absence;
- recovery ownership is fenced;
- stale owners cannot commit;
- checkpoints cannot restore revoked authority;
- queued pre-stop work requires current admission;
- operation/effect identity survives recovery;
- new operation IDs cannot bypass uncertainty;
- recovery authority is distinct;
- release requires current enforcement/world/reconciliation conditions;
- stop-signal disappearance cannot release;
- recovery binds policy/invariant/dependency versions;
- world precondition changes invalidate recovery decisions;
- history survives owner transfer;
- recovery tokens cannot be self-issued;
- common-mode dependencies constrain independence claims;
- unknown recovery boundaries block/restrict critical execution;
- restart admission revalidates artifact/config/runtime.

## Verification status

Architecture:
DESIGNED / REVIEWED.

Implementation:
NOT IMPLEMENTED as a Nexo runtime subsystem.

Formal:
NOT TLC-VERIFIED.

Fault injection:
NOT RUN.

World verification:
NOT APPLICABLE YET.

## Important limitation
The new TLA+ sketch contains deliberately explicit review notes and must not be promoted to verified status. In particular, the Release action's epoch relationship is currently too simplified and needs correction before model checking.

## Next research point
1. Safety-plane update/rollback and bootstrap trust.
2. Common-mode/correlated-failure analysis.
3. Correct and complete the recovery TLA+ model, then run TLC when the environment/tooling is available.
4. Implement fault-injection scenarios for restart/recovery races.
5. Reconcile the master architecture/index snapshots with the accumulated PG-009 delta history without erasing historical records.

## Git persistence
Architecture commit:
5c6630366e36acbce82b01ad4caa39c1e31ba4b

Formal sketch commit:
32a4c9134d74c16fad618bf9f2091ada7467d641

This delta is the durable continuity checkpoint for this research step.

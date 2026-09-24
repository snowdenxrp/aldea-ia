# NEXO — PG-009 RECOVERY / RESTART FENCING AFTER EMERGENCY STOP
Fecha: 2026-09-24

## Status
DESIGNED / ARCHITECTURE REVIEWED.
No implementation, fault injection, or TLC verification is claimed.

## Research question
After an emergency STOP, how does Nexo prevent a stale process, lease, capability, checkpoint, recovery worker, or queued operation from silently resuming execution after restart or recovery?

## Research cross-check
- Kubernetes Leases use identity, renewal time, lease duration, transition count, and optimistic concurrency/resourceVersion to coordinate exclusive control ownership. Lease expiry transfers coordination; it does not make an old process trustworthy.
- Kubernetes leader election keeps only one elected holder active and uses versioned coordination to reject competing updates.
- AWS Step Functions documents that cancellation of integrated tasks is best-effort and that a stopped workflow does not by itself prove the integrated task was cancelled.
- AWS Standard workflow redrive preserves the original execution identity/version and resumes from unsuccessful work rather than silently creating an unrelated execution state.

Sources:
- https://kubernetes.io/docs/concepts/architecture/leases/
- https://kubernetes.io/docs/concepts/cluster-administration/coordinated-leader-election/
- https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html
- https://docs.aws.amazon.com/step-functions/latest/dg/redrive-executions.html
- https://docs.aws.amazon.com/step-functions/latest/apireference/API_StartExecution.html

## Core finding

Emergency STOP must create a durable recovery fence. A restart is not a release event.

The critical distinction is:

STOPPED STATE != AUTHORITY TO RESUME

and:

PROCESS RESTART != NEW AUTHORITY

A process that was valid before the STOP may restart with stale state. It must be treated as untrusted for critical execution until it proves current admission under the new fence/epoch.

## Recovery fence contract

Every critical stop creates or advances a Recovery Fence:

RecoveryFence {
  fence_id
  stop_id
  target/effect scope
  authority_epoch
  emergency_stop_epoch
  gate_epoch
  recovery_epoch
  recovery_owner
  recovery_token/fencing_token
  policy_version
  invariant_version
  dependency_graph_version
  artifact/config/runtime versions
  required_world_reconciliation
  required_enforcement_proof
  release_state
  expiry/review
}

The fence is durable and authoritative for restart admission.

## Epoch separation

Nexo must not collapse all generations into one counter.

At minimum distinguish:
- authority_epoch — who may act;
- stop_epoch — which emergency stop generation is active;
- gate_epoch — which enforcement boundary generation is active;
- recovery_epoch — which recovery/restart owner generation is current;
- reconciliation_epoch — which investigator owns uncertain external outcomes;
- world_version/causal_position — target/world state, when available;
- operation_id/effect_key — logical and semantic effect identity.

A higher epoch in one domain does not automatically authorize another domain.

## Restart admission

A restarted component enters:

RESTARTED
  -> QUARANTINED
  -> IDENTITY_ATTESTED
  -> ARTIFACT_CONFIG_VERIFIED
  -> CURRENT_FENCE_OBSERVED
  -> CURRENT_AUTHORITY_VALIDATED
  -> RECOVERY_OWNER_ACQUIRED
  -> RECOVERY_STATE_RECONCILED
  -> RELEASE_ELIGIBLE
  -> EXPLICIT_RELEASE
  -> EXECUTION_ENABLED

Any failed/unknown critical check returns to QUARANTINED or BLOCKED.

No restart path may jump directly from process boot to EXECUTION_ENABLED.

## Stale-process rule

A process is stale when any critical binding it carries is older than the authoritative recovery boundary, including:
- authority epoch;
- stop/recovery epoch;
- capability;
- lease/fence token;
- policy/invariant version;
- artifact/config digest;
- dependency graph;
- world/precondition version;
- unresolved external-effect state.

Stale process state may be read as historical evidence, but it cannot authorize a new critical effect.

## Capability revocation on STOP

Emergency STOP must fence capabilities, not merely tell the executor to stop.

A capability issued before the active stop/recovery boundary is invalid for critical execution unless it is explicitly reissued under the current authority/recovery epoch.

Capability renewal is a new admission event.

## Lease semantics

Lease expiry means:
- coordination ownership may be transferred;
- the old owner loses authority to commit after fencing validation;
- history/evidence remain intact.

Lease expiry does NOT mean:
- the old process stopped;
- the external effect did not occur;
- the STOP was cleared;
- the world is safe;
- recovery is authorized.

Critical commit requires an authoritative conditional/fenced transition that rejects stale owner tokens.

## Recovery owner

Only one current recovery owner may perform protected recovery transitions for a given critical recovery scope.

Recovery ownership is separate from:
- normal execution ownership;
- reconciliation ownership;
- emergency-stop authority;
- verifier identity.

A recovery owner cannot grant itself normal execution authority.

Transfer:
RECOVERY_OWNER_ACTIVE
 -> OWNER_EXPIRED/REVOKED
 -> SUCCESSOR_ELIGIBLE
 -> FRESH_FENCE_ACQUISITION
 -> SUCCESSOR_ACTIVE

The successor must revalidate the current stop/gate/policy/world conditions.

## Checkpoint / snapshot rule

A checkpoint can restore state; it cannot restore authority.

Restoring a checkpoint must not restore:
- revoked capabilities;
- expired leases;
- old recovery ownership;
- old emergency-stop release state;
- stale policy/invariant assumptions;
- obsolete world preconditions.

Restored state must be re-bound to the current epochs and re-admitted.

## Queue and scheduler rule

Queued work created before STOP remains identified by its original operation_id/effect_key.

After STOP:
- no queued critical item may execute merely because it was previously admitted;
- it must pass current recovery/authority/fence checks;
- material policy/authority/world changes invalidate the old admission;
- a new operation_id cannot be used to bypass unresolved duplicate/effect controls.

## Redrive / retry rule

Recovery must distinguish:
1. SAME_OPERATION_RETRY — same logical effect; preserve operation_id/effect_key and current admission boundary.
2. REPLAN_SAME_MISSION — mission remains valid but effect/plan changes; retire the old prepared operation and create a linked new operation.
3. NEW_OPERATION — genuinely different semantic effect.

A new operation ID is not a universal reset button.

If an external effect was REMOTE_UNKNOWN, restart cannot infer NO_EFFECT from local absence of state.

## Release contract

Release from emergency STOP requires, at minimum:
- current release authority;
- current stop/gate/recovery epochs;
- valid enforcement proof;
- recovery owner/fence;
- no unresolved critical external effect requiring quarantine/reconciliation;
- current policy/invariant/dependency applicability;
- artifact/config/runtime admission;
- required world/precondition validation;
- explicit release event.

Reboot, process restart, lease expiry, timeout, network restoration, checkpoint restore, or disappearance of a stop signal cannot release the fence.

## Recovery state machine

NORMAL
 -> STOP_REQUESTED
 -> STOP_ENFORCED
 -> STOP_VERIFIED
 -> RECOVERY_FENCED
 -> RECOVERY_ASSESSMENT
 -> RECONCILIATION_REQUIRED (when needed)
 -> RECOVERY_OWNER_ACTIVE
 -> RELEASE_ELIGIBLE
 -> RELEASE_AUTHORIZED
 -> EXECUTION_ENABLED

Failure/uncertainty:
any critical boundary
 -> UNKNOWN/BLOCKED/QUARANTINED
 -> revalidation/reconciliation
 -> explicit recovery decision

## Anti-bypass properties

The restarted executor must not be able to:
- clear the stop;
- increment its own recovery epoch;
- mint a new recovery token;
- replace the authoritative fence;
- reissue its own capability;
- reinterpret checkpoint state as current authority;
- convert lease expiry into proof of no effect;
- replace an operation ID to evade effect identity;
- delete recovery evidence;
- declare itself recovery owner;
- downgrade a required verification class.

## Common-mode concern

The recovery fence is not independent merely because it is a separate process.

Independence must be assessed across:
- host/kernel/hypervisor;
- identity provider;
- credential/key material;
- coordination store;
- network;
- storage;
- policy service;
- update artifact;
- runtime;
- administrator/control plane;
- clock/time source;
- model/provider.

If the STOP gate, recovery authority and executor share a failure domain, the architecture must record the reduced assurance rather than label the path independent.

## Adversarial tests required

1. stale process restarts while STOP remains active;
2. stale process presents an old valid capability;
3. stale lease owner attempts a critical commit after successor acquisition;
4. checkpoint restore contains old authority;
5. queue contains pre-STOP work;
6. process restarts after gate epoch changed;
7. recovery owner crashes during reconciliation;
8. recovery lease expires during commit;
9. old owner returns after successor takeover;
10. A→B→A state cycle attempts to bypass fencing;
11. policy changes while recovery is active;
12. dependency graph changes while recovery is active;
13. world precondition changes before release;
14. REMOTE_UNKNOWN effect exists during restart;
15. restart occurs with observer failure;
16. coordination store becomes unavailable;
17. recovery fence store returns stale data;
18. artifact/config changes between stop and restart;
19. attacker attempts self-issued recovery token;
20. emergency authority and normal authority disagree;
21. two recovery owners race;
22. old operation ID is replayed after release;
23. new operation ID is used to bypass old UNKNOWN effect;
24. stop signal disappears during reboot;
25. simultaneous executor + observer + coordination failure.

## New invariants

INV-629 — process restart never implies release.
INV-630 — STOP/recovery fencing survives process restart.
INV-631 — stale authority/capability cannot authorize critical execution.
INV-632 — lease expiry transfers coordination but does not prove effect absence or STOP release.
INV-633 — recovery ownership requires a current authoritative fence token.
INV-634 — stale recovery owners cannot commit after ownership transfer.
INV-635 — checkpoint restoration cannot restore revoked/expired authority.
INV-636 — queued pre-STOP work requires current admission before execution.
INV-637 — operation/effect identity survives restart and recovery.
INV-638 — a new operation ID cannot bypass unresolved effect uncertainty.
INV-639 — recovery authority is distinct from normal execution authority.
INV-640 — recovery release requires current enforcement evidence and current world/reconciliation conditions.
INV-641 — disappearance of the STOP signal cannot implicitly release a critical fence.
INV-642 — recovery state must be bound to policy/invariant/dependency versions.
INV-643 — world-version/precondition changes invalidate affected recovery decisions.
INV-644 — recovery ownership transfer cannot erase prior history/evidence.
INV-645 — self-issued recovery tokens are invalid.
INV-646 — common-mode dependencies constrain claimed recovery independence.
INV-647 — unknown recovery boundary blocks or restricts critical execution.
INV-648 — restart/recovery admission must revalidate the current artifact/config/runtime binding.

## Architectural result

The emergency-stop architecture now has a second protective boundary:

EXECUTION
  ↓
EMERGENCY STOP
  ↓
ENFORCEMENT PROOF
  ↓
RECOVERY FENCE
  ↓
RESTART QUARANTINE
  ↓
CURRENT AUTHORITY + CURRENT EPOCHS + CURRENT WORLD STATE
  ↓
EXPLICIT RELEASE
  ↓
EXECUTION

The key guarantee is not "the old process stopped."

It is:

"An old process, old capability, old lease, old checkpoint, or old operation cannot regain critical authority merely by restarting."

## Limitations

This is an architectural contract, not an implementation proof.

Still unresolved:
- actual coordination-store semantics and failure model;
- Byzantine/common-mode compromise;
- physical actuation;
- target-specific remote cancellation;
- quantitative recovery timing;
- executable TLC model;
- fault-injection implementation;
- proof that every critical execution sink actually consults the fence.

## Next research

1. safety-plane update/rollback and bootstrap trust;
2. common-mode/correlated-failure analysis;
3. complete executable TLA+ model and actual TLC execution;
4. implementation-level fault injection against restart/recovery races.


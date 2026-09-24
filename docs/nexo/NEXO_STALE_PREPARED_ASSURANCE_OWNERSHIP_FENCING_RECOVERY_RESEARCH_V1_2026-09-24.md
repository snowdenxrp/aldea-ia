NEXO - STALE PREPARED ASSURANCE / OWNERSHIP TRANSFER / FENCING / RECOVERY-OF-RECOVERY RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

RESEARCH QUESTION
Can a stale PREPARED Assurance bundle cross the publication boundary after its builder loses ownership, another builder commits, and the stale builder later recovers from an old checkpoint?

EXTERNAL CROSS-CHECKS
Kubernetes uses resourceVersion to reject stale writes at the authoritative update boundary, returning 409 when a client writes against an outdated version. This is a useful analogue for stale-prepared rejection. cite: turn0search0.
etcd elections associate leadership with a lease/key and expose a revision that can be checked transactionally for ownership; etcd also warns that lease/operation status can be uncertain across timeouts and partitions. cite: turn0search2, turn0search3.
etcd transactions can atomically compare ownership/version conditions before applying updates. cite: turn0search9, turn0search10.
These are analogies/research inputs, not requirements or compliance claims.

CORE RESULT
A lease alone is not enough.
A stale prepared bundle must be rejected at the final authoritative publication boundary using a current ownership/fencing condition.

Key rule:
PREPARED_STATE != PUBLICATION_RIGHT.

And:
LEASE_OWNERSHIP != EFFECTIVE_FENCING unless the publication target actually rejects stale owners.

Canonical stale-builder attack:
A acquires assurance ownership epoch 10.
A prepares bundle B10.
A loses lease / ownership.
B acquires epoch 11.
B commits B11.
A is partitioned or paused.
A later restarts from checkpoint containing B10.
A attempts publish B10.

Required result: B10 must fail at the authoritative publication boundary because its ownership/fence/context is stale.

FOUR IDENTITIES
1. Builder identity - which process/actor prepared the bundle.
2. Ownership identity - which builder currently owns the assurance coordination scope.
3. Bundle identity - which assurance bundle is being committed.
4. Context identity - under which policy/dependency/boundary/resource/continuity context the bundle was prepared.
None may be collapsed into one boolean current flag.

CANDIDATE ASSURANCE OWNERSHIP
Fields:
- scope_id
- owner_identity
- ownership_incarnation
- ownership_epoch/fencing token
- claim_id
- context_identity
- assurance_generation
- invalidation_generation
- lease/fence state
- acquisition linearization reference
- expiry/transfer semantics
- revocation state
- continuity anchor.

Ownership transfer candidate:
ACQUIRE(epoch N)
-> PREPARE(B,N)
-> ownership lost/revoked
-> ACQUIRE(epoch N+1)
-> PREPARE(B2,N+1)
-> COMMIT(B2,N+1)
Old B must remain historical preparation only and cannot publish.

FINAL PUBLICATION GUARD
A stale prepared bundle may cross the publication boundary only if the final commit condition accepts it. The candidate condition is:
CURRENT_OWNER(scope) == owner_identity
AND ownership_epoch == prepared_epoch
AND context_identity == current_context
AND invalidation_generation == prepared_invalidation_generation
AND claim requirements still hold
AND required boundaries/resources/incarnations are current
AND no unresolved impact invalidates the bundle.

This is analogous to conditional writes using current resourceVersion or lease/revision checks. cite: turn0search0, turn0search2, turn0search9.

IMPORTANT: checking the lease in the worker before publishing is insufficient if ownership can change between the check and the write. The ownership condition must participate in the same authoritative commit boundary, or an equivalent fencing mechanism must make the stale publication ineffective.

SPLIT-BRAIN
Two builders can both believe they own the scope during a partition.
Local belief cannot decide publication.
Only the authoritative coordination domain/fence can decide which owner is current.
If the authoritative domain itself is unavailable, no new strong Assurance Commit should be admitted unless an independently enforceable safety boundary guarantees stale publication cannot become authoritative.

LEASE LOSS
Lease expiry means coordination ownership has changed only when the ownership authority has serialized the change. It does NOT prove the old process stopped.
Therefore:
LEASE_EXPIRED != OLD_PROCESS_STOPPED.
The old process must be treated as potentially active and fenced at the publication boundary.

STALE CHECKPOINT
A checkpoint may contain:
- PREPARED bundle;
- old owner identity;
- old ownership epoch;
- old context;
- old proof results;
- old invalidation generation.
Restore must classify these as historical/prepared state, not current publication authority.

RECOVERY-OF-RECOVERY
Recovery itself can crash after acquiring ownership and before clearing stale prepared state.
A second recovery must establish a new recovery incarnation and revalidate current ownership/context.
Thus:
RECOVERY_PROGRESS != RECOVERY_AUTHORITY.
RECOVERY_CHECKPOINT != CURRENT_OWNERSHIP.

STALE PREPARED STATE LIFECYCLE
PREPARED_CURRENT
-> OWNERSHIP_LOST
-> STALE_PREPARED
-> INVALIDATED or SUPERSEDED
-> HISTORICAL_ONLY

A stale bundle should not simply be deleted; preserving it as historical evidence helps audit. But historical retention must not preserve publication authority.

ASSURANCE FENCE
Candidate object: AssuranceFence.
Fields:
- fence_id
- scope
- claim/effect class
- owner identity
- ownership epoch
- context identity
- invalidation generation
- publication generation
- continuity anchor
- resource/boundary dependencies
- state
- enforcement mechanism
- invalidation triggers.

The AssuranceFence is conceptually distinct from the external resource fence. It protects the assurance publication boundary; it does not itself stop an external effect.

ASSURANCE FENCE STATES
CURRENT
TRANSFERRING
REVOKED
UNKNOWN
REESTABLISHING
SUPERSEDED.
UNKNOWN or REESTABLISHING cannot support strong publication.

PUBLICATION BOUNDARY
The critical point is not when a worker says publish.
The critical point is when authoritative state accepts:
BUNDLE + OWNER + EPOCH + CONTEXT + CLAIM STATUS.
That is the Assurance Publication Linearization Point.

Candidate abstract transition:
PUBLISH_IF(
 owner_current
 AND owner_epoch_current
 AND context_current
 AND invalidation_current
 AND claim_obligations_current
 AND fence_current
)
-> COMMITTED_CURRENT_BUNDLE.

If any guard fails: DENY/STALE/REBUILD.

NO GLOBAL COORDINATOR REQUIREMENT
The research does not justify a global Assurance coordinator.
The coordination domain should be claim-specific.
If two bundles are genuinely independent, they may have separate owners/fences.
If they can jointly change a claim, they need a shared coordination domain or explicit compatibility/refinement protocol.

HIGHER-ORDER OWNERSHIP
Pairwise disjointness is insufficient if three bundles jointly affect a mission claim.
The ownership/fence domain must cover the interaction hyperedge or prove that the hyperedge cannot affect the claim.

CACHE AND WATCHES
An old builder may observe an old ownership state from cache/watch.
That observation is evidence of historical state, not current ownership.
Kubernetes explicitly documents that some read/watch semantics can expose stale data and that stale writes can be rejected using resourceVersion. cite: turn0search0, turn0search1.

ETCD LEASE CAVEAT
etcd notes that operations can be uncertain to clients during timeouts/network disruption and that lease keepalive responses can be buffered around revocation. Therefore a received old keepalive response cannot itself be treated as proof that current ownership still exists. cite: turn0search3, turn0search11.

CRASH WINDOWS
W1 prepare before ownership loss
W2 ownership loss before worker observes it
W3 ownership transfer
W4 new owner commits
W5 old worker resumes
W6 stale worker checks cached ownership
W7 stale worker reaches publication
W8 crash during publication
W9 recovery restores stale prepared checkpoint
W10 recovery acquires a new owner epoch but accidentally reuses old bundle

Safe property: no W1-W10 path allows a stale prepared bundle to become the current authoritative bundle.

MIGRATION/ROLLBACK
Rollback to byte-identical proof/bundle data does not restore old ownership epoch or publication authority.
A restored bundle must be rebound to the current context and current ownership.
Therefore:
RESTORED_BUNDLE_BYTES != CURRENT_PUBLICATION_RIGHT.

DECOMMISSION
Decommissioned builders must be unable to publish historical prepared bundles.
Decommission should revoke/fence their ownership identity and invalidate dependent prepared states.
Identity reuse must not create an ABA path.

BREAK-GLASS
Break-glass cannot simply ignore AssuranceFence.
If permitted, it requires a distinct protected transition with current authority, exact scope, bounded lifetime, audit, reconciliation, and post-action verification.

CANDIDATE INVARIANTS INV-SPA-01..40
01 PREPARED != PUBLICATION_RIGHT
02 lease ownership alone does not prove stale-owner rejection
03 final publication must bind current owner
04 final publication must bind ownership epoch
05 final publication must bind context identity
06 final publication must bind invalidation generation
07 stale checkpoint does not restore publication authority
08 lease expiry does not prove old process stopped
09 old process remains potentially active after ownership transfer
10 ownership transfer invalidates old publication rights
11 stale prepared state may remain historical but cannot publish
12 worker-local ownership checks are insufficient without atomic/equivalent publication fencing
13 cache currentness does not establish ownership
14 watch response does not establish current ownership
15 split-brain local belief cannot determine publication authority
16 unavailable ownership authority blocks strong publication absent independent enforcement
17 recovery progress does not grant recovery authority
18 recovery checkpoint does not grant current ownership
19 recovery-of-recovery requires new incarnation/current ownership
20 ownership ABA must be prevented
21 bundle identity is distinct from owner identity
22 context identity is distinct from ownership identity
23 builder identity is distinct from current owner
24 external resource fence is distinct from assurance publication fence
25 assurance fence cannot claim external effect prevention by itself
26 higher-order interactions require ownership/coordination closure
27 unknown overlap blocks strong publication
28 rollback does not restore old publication authority
29 decommission invalidates old publication rights
30 break-glass is inside the assurance effect path
31 publication linearization is the authoritative stale-state cutoff
32 failed final guard yields stale/rebuild, not best-effort publish
33 durable commit after crash is historical assurance, not automatic currentness
34 invalidation after commit changes currentness, not history
35 ownership transfer must be reflected at publication boundary
36 stale proof reuse cannot bypass current ownership
37 stale evidence cannot bypass current ownership
38 assurance degradation cannot bypass current ownership
39 formal model must represent ownership/fence state explicitly
40 correctness remains unproven until formal/runtime verification.

CANDIDATE THEOREM (NOT FORMALLY PROVEN)
If every current Assurance Publication transition is atomically or equivalently guarded by current ownership identity, ownership epoch/fence, current context and invalidation generation, and if stale builders cannot bypass that boundary, then loss/transfer of a builder lease cannot cause its stale prepared bundle to become the current authoritative assurance bundle.

ARCHITECTURE CONSEQUENCE
The clean architecture needs an Assurance Ownership/Fencing subplane, but it remains claim-specific and must not become a second general authority system.
Flow:
ASSURANCE REQUEST
-> CLAIM CLOSURE
-> ASSURANCE OWNERSHIP ACQUIRE
-> PREPARE
-> CONTEXT/DEPENDENCY/BOUNDARY VALIDATION
-> ASSURANCE COMMIT GUARD
-> PUBLICATION LINEARIZATION
-> PUBLISHED
-> INVALIDATION/SUPERSESSION.

The key reuse principle is:
THE FENCE PROTECTS THE PUBLICATION BOUNDARY; THE PROOF PROTECTS THE CLAIM; THE AUTHORITY CORE PROTECTS EXECUTION.

FORMALIZATION TARGET
Model two builders A/B, ownership epochs 10/11, lease loss, stale cache, PREPARED bundles, commit guard, crash/restart, recovery-of-recovery, decommission, ABA owner identity, higher-order claim interaction. Required property: STALE_PREPARED_BUNDLE NEVER BECOMES CURRENT_AUTHORITATIVE_BUNDLE.
No TLC/SANY result claimed.

NEXT ATTACK
ASSURANCE FENCE FAILURE + OWNERSHIP AUTHORITY FAILURE + INDEPENDENT PUBLICATION BOUNDARY + CRASH/RESTORE. Question: if the Assurance ownership store is unavailable or compromised, can an independent publication fence preserve assurance safety, and what exactly can still be claimed without a functioning Assurance coordinator?
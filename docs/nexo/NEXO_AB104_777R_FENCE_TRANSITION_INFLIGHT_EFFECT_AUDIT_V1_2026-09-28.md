# NEXO AB104.777R — fence transition vs in-flight stale effect

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Scope
Study the ordering between a fencing transition and an operation already in flight. The question is not whether a generation exists, but whether an old operation can still become durable after the fence transition.

## Evidence 1 — etcd atomic boundary
etcd documents that transactions atomically evaluate all comparisons and then apply the success block; revisions provide a total ordering for KV mutations. Therefore an etcd-native guarded mutation can reject a stale generation at the same commit boundary that would otherwise create the mutation. citeturn0search2turn0search4

## Evidence 2 — stale in-flight client operation
The current etcd Mutex implementation derives the key from the session lease, records myRev, exposes IsOwner() as CreateRevision(myKey) == myRev, but current Unlock() performs an unconditional delete by key. This is precisely the gap reproduced in issue #22082: the first delete can commit while its response is lost; the same session can recreate the key with a newer creation revision; an old Unlock retry can then delete the newer incarnation. The issue supplies an integration test and reports the test failing against the current behavior. citeturn0search0

This gives an executed/reported ordering witness:
old ownership O1 -> delete(O1) commits -> client does not observe response -> ownership O2 is created -> stale delete(O1) retry is sent -> because delete is not fenced by O1's revision, O2 is deleted.

The important point is that the stale effect occurs after a newer ownership state exists because the effect boundary does not enforce the old ownership predicate.

## Evidence 3 — external resources
etcd explicitly states that its lock feature cannot by itself protect resources outside etcd. An external resource must provide its own version-validation mechanism and replica consistency. etcd also describes the lease as insufficient by itself for mutual exclusion; version validation is what protects keys within etcd. citeturn0search3

## Fence-transition ordering model
F0 = new authority/generation becomes committed;
F1 = old operation reaches the protected effect boundary;
F2 = protected resource evaluates the generation/incarnation condition;
F3 = effect becomes durable.

Safety requires that an operation carrying an obsolete generation cannot pass F2 and reach F3. It does NOT require that the old process stop executing immediately at F0. A paused or partitioned process may continue computing; the protected effect boundary is what must reject it.

Therefore: old process stopped is not the core invariant. Old effect rejected is the core invariant.

## Recovery finding
A fence transition that only updates coordinator state is insufficient if a stale operation can directly mutate the resource without consulting that state. Conversely, a resource-side generation check can safely reject a stale operation even if the old process is still alive, provided the check and protected mutation share the required atomic/linearizable boundary.

Timeouts remain ambiguous: etcd's API guarantees explicitly say a client may be uncertain whether an operation completed after timeout/network disruption. Therefore recovery must not infer effect-did-not-happen from a lost response. citeturn0search4

## Evidence ledger
FENCE_TRANSITION_CAN_PRECEDE_OLD_PROCESS_STOP: SOURCE/FAILURE MODEL CONFIRMED
STALE_EFFECT_CAN_BE_REJECTED_AT_ATOMIC_RESOURCE_BOUNDARY: SOURCE CONFIRMED FOR ETCD-NATIVE TRANSACTIONS
CURRENT_ETCD_MUTEX_STALE_RETRY_COUNTEREXAMPLE: REPORTED TEST EVIDENCE CONFIRMED
FENCE_STATE_ONLY_WITHOUT_RESOURCE_ENFORCEMENT: INSUFFICIENT BY DOCUMENTED EXTERNAL-RESOURCE MODEL
TIMEOUT_STATUS_MAY_BE_AMBIGUOUS: SOURCE CONFIRMED
GLOBAL_EXTERNAL_EFFECT_ATOMICITY: NOT ESTABLISHED
EXECUTED NEW RACE BY THIS AUDIT: NO

## Nexo implication
The protected-effect boundary is becoming the central research object. The authority service may declare a new generation, but the effect domain must independently enforce that generation at commit time. Stopping the old agent is a liveness/control measure; rejecting its stale effect is the safety measure.

Candidate invariant, still not final:
If generation g2 supersedes g1 for protected namespace R, then no effect carrying g1 may become durable in R after the acceptance boundary for g2, unless the protocol explicitly defines that effect as already committed before the fence linearization point.

The final clause is important: we must define the exact linearization point rather than pretending every in-flight operation is retroactively canceled.

## Exact next action
AB104.778R: study real tests/implementations that explicitly define the fence linearization point and behavior of operations concurrent with fencing. Focus on whether an operation that starts before the fence but commits after it is rejected, and how the system distinguishes already-committed effects from stale late arrivals.
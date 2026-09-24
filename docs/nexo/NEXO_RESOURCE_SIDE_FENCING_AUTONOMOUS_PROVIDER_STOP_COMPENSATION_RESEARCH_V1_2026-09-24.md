# NEXO - RESOURCE-SIDE FENCING / AUTONOMOUS PROVIDER RETRY / STOP / COMPENSATION RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

If Recovery B becomes current and fences Recovery A, can an autonomous provider continuation created by A still produce a protected effect after STOP and after resource incarnation changes? What minimum external boundary is required before Nexo can make a strong containment claim?

## External cross-checks

AWS Step Functions documents that a Distributed Map can continue operating after a parent workflow stops or times out, and that child workflows have separate execution histories. It also documents that a Parallel state's invoked Lambda functions can continue running after the Parallel state fails, and activity workers need their own stopping mechanism. These are concrete examples that stopping an orchestrator does not universally terminate downstream work. citeturn0search0turn0search1turn0search10 AWS also documents redrive semantics in which unsuccessful child workflows can be restarted/redriven and successful history is preserved, reinforcing the distinction between orchestration state and downstream execution history. citeturn0search2turn0search3

## Core result

The minimum boundary for a strong containment claim is not:

`NEXO_STOP = ON`

and not:

`OLD_RECOVERY_OWNER = FENCED`.

The required property is:

`EVERY_PROTECTED_EFFECT_PATH_RELEVANT_TO_CLAIM(E) MUST CROSS AN ENFORCEABLE CURRENT BOUNDARY THAT REJECTS STALE AUTHORITY`.

Therefore:

`PROCESS_FENCED != PROVIDER_FENCED`

`PROVIDER_FENCED != RESOURCE_FENCED`

`RESOURCE_FENCED != WORLD_QUIESCENT`

and:

`STOP_REQUESTED != STOP_ENFORCED != EXTERNAL_QUIESCENCE`.

## Adversarial sequence

1. Recovery A admits effect E under context C1.
2. Provider creates autonomous child/retry C.
3. Nexo issues STOP.
4. Recovery B becomes current and fences A.
5. Resource R1 is replaced by R2.
6. Old provider C retries.
7. C reaches R2 using an old capability, queue, callback, credential or provider-side execution identity.
8. Observer sees no active A process and concludes containment.
9. C produces a protected effect.

If R2 accepts C, Nexo cannot honestly claim global containment.

The critical boundary is R2's enforcement path, not the local process state.

## STOP has layers

Candidate STOP state:

`STOP_REQUESTED
→ STOP_PROPAGATING
→ LOCAL_EXECUTION_BLOCKED
→ RECOVERY/ADMISSION_FENCED
→ EXTERNAL_BOUNDARIES_FENCED
→ ENFORCEMENT_VERIFIED
→ EXTERNAL_QUIESCENCE (only if the external contract proves it)
→ RECONCILIATION
→ CLAIM_PUBLICATION`

These are separate claims.

A local STOP may be verified while external quiescence remains UNKNOWN.

## Autonomous provider continuation

A provider continuation can originate from:

- provider retry;
- durable queue;
- delayed message;
- callback;
- scheduled task;
- child workflow;
- worker lease;
- webhook;
- server-side retry;
- redrive;
- delegated capability;
- cached credential;
- autonomous resource behavior.

Therefore all of these are part of effect-path closure if they can produce a protected effect.

AWS explicitly shows that child workflows can continue after a parent Map Run stops or times out, and that Lambda functions invoked by a failed Parallel state can continue running. citeturn0search0turn0search10

## Minimum external effect boundary

Candidate EffectBoundary:

- boundary_id;
- effect_id / effect class;
- target identity;
- resource incarnation;
- accepted authority epoch/fence generation;
- current recovery epoch;
- STOP generation;
- capability/revocation generation;
- provider execution identity;
- allowed request semantics;
- stale-request rejection rule;
- duplicate/retry semantics;
- queue/child continuation coverage;
- resource-side enforcement point;
- boundary state;
- enforcement evidence;
- failure behavior;
- crash/restart behavior;
- replacement behavior;
- continuity anchor;
- bypass paths;
- verification claim.

The critical property is not merely authentication.

The boundary must be able to say:

`REQUEST(context=C_old, fence=F_old)`

and deterministically reject it when:

`CURRENT_FENCE=F_new`.

## Resource-side rejection

The strongest boundary is one where the protected resource itself rejects stale authority.

Conceptually:

`ACCEPT(effect) iff
target == current_target
AND incarnation == current_incarnation
AND fence >= current_fence
AND authority/context compatible
AND STOP permits
AND capability valid
AND effect class permitted`

The exact comparison is effect-class-specific; numeric ordering alone is insufficient when domains differ.

## Fence activation versus fence verification

A command such as:

`FENCE(F_new)`

does not prove:

`F_new is enforced`.

We need:

`FENCE_REQUESTED
→ FENCE_ACCEPTED
→ FENCE_DURABLE
→ FENCE_ENFORCING
→ FENCE_VERIFIED`

Only the final state can support a strong enforcement claim, and even then only for the paths covered by the verification contract.

## Resource replacement

When:

`R1 → R2`

the new resource must not silently inherit acceptance of old contexts.

Candidate replacement protocol:

`RETIRE R1
→ FENCE R1
→ ESTABLISH R2 INCARNATION
→ ESTABLISH R2 BOUNDARY
→ INSTALL CURRENT FENCE
→ VERIFY STALE-REQUEST REJECTION
→ RECONCILE IN-FLIGHT EFFECTS
→ RELEASE R2`

If R2 starts with permissive defaults, old provider continuations may cross the replacement boundary.

Therefore:

`RESOURCE_BOOT != PROTECTED_ACCEPTANCE`

A protected resource should fail closed for protected effect classes until its current fence/boundary state is established.

## Stop + retry

STOP blocks future Nexo-authorized admission.

It does not automatically cancel provider-side retries.

Therefore STOP(E) must trigger impact propagation across:

`E → retries → queues → callbacks → child effects → provider executions → delegated capabilities → compensation paths → resource boundary`

If any path remains capable of producing a relevant protected effect and is not covered by an enforceable boundary:

`GLOBAL_CONTAINMENT = UNKNOWN`

## Stop + compensation

Compensation is a new effect.

Therefore STOP does not automatically authorize compensation.

Candidate:

`STOP
→ CLASSIFY ORIGINAL OUTCOME
→ EVALUATE UNCERTAINTY
→ EVALUATE COMPENSATION SAFETY
→ CURRENT AUTHORITY
→ CURRENT FENCE
→ NEW COMPENSATION ADMISSION`

If compensation can be unsafe in one possible world consistent with current UNKNOWN, it remains blocked.

## Fence + compensation race

Adversarial sequence:

`E1 UNKNOWN
→ STOP
→ B acquires recovery
→ B fences A
→ B decides compensation C
→ old provider E1 completes
→ C executes`

Now both E1 and C may affect the mission invariant.

Therefore compensation requires:

- current effect interaction graph;
- joint uncertainty;
- current resource incarnations;
- current fences;
- causal/order semantics;
- mission invariant closure.

`FENCED_A != SAFE_COMPENSATION`

## Fence ACK semantics

An ACK from the boundary must be typed.

Candidate:

`F0 RECEIVED
F1 ACCEPTED
F2 DURABLE
F3 ENFORCING
F4 VERIFIED_FOR_PATH
F5 VERIFIED_FOR_CLAIM`

F2 cannot be promoted to F4 without evidence.

And:

`F4 VERIFIED_FOR_PATH != GLOBAL_QUIESCENCE`

A boundary can prove stale request rejection while an already-executing effect remains active.

## In-flight effects

Fence activation does not erase work already admitted.

For an in-flight effect:

`ADMITTED@C1
→ FENCE C1
→ STOP
→ RESOURCE R1→R2`

possible states remain:

- no external attempt;
- attempt occurred;
- effect committed;
- provider continues;
- child created;
- outcome UNKNOWN.

The fence prevents additional stale effects only if all relevant paths enforce it.

It does not classify historical outcome.

## Queue closure

A queue is part of the effect boundary if it can release protected work.

The following are insufficient:

`QUEUE_EMPTY_AT_T0`
`QUEUE_STOP_ACK`
`WORKER_PROCESS_EXITED`

unless the contract proves no other path can enqueue/release the effect and no in-flight work remains.

`QUEUE_EMPTY != HISTORICAL_NO_EFFECT`

## Credential/capability closure

A stale provider may possess:

- token;
- credential;
- signed command;
- delegated capability;
- cached session;
- provider-side authorization.

Revocation is incomplete if the capability remains accepted at the protected boundary.

Therefore:

`REVOCATION_REQUESTED != REVOCATION_ENFORCED`

Strong containment requires the boundary to reject the stale capability or the capability's effect path to be otherwise safely bounded.

## Boundary bypass

Candidate bypass classes:

- alternate API;
- direct resource API;
- privileged operator path;
- cached capability;
- old queue;
- provider retry service;
- child workflow;
- callback;
- replication/failover path;
- emergency/break-glass path;
- management plane;
- resource local automation.

Every bypass capable of violating the claim must be covered or the strong claim is invalid.

## Autonomous resource

The strongest adversarial case is a resource that can continue acting without the controller.

Then:

`CONTROLLER_FENCED != RESOURCE_QUIESCENT`

If the resource can itself initiate a protected effect and Nexo cannot fence that behavior, global containment may be impossible.

The architecture must either:

1. establish a resource-side boundary that blocks the relevant action;
2. prove the autonomous action is harmless for the claim;
3. weaken the claim;
4. permanently quarantine the resource;
5. deny the operation.

## Minimum containment theorem candidate

Not formally proven:

For a claim C over protected effects E, strong containment after STOP is admissible only if every effect path capable of producing a C-relevant protected effect either:

1. crosses an enforceable current boundary that rejects stale authority;
2. is proven incapable of violating C;
3. is inside a verified safe absorbing state;
4. or is explicitly included in the environment assumptions and the claim is limited accordingly.

If any C-relevant path remains UNKNOWN and can violate C:

`STRONG_CONTAINMENT = NOT_ESTABLISHED`

## Claim strength

Containment must be claim-specific.

Candidate hierarchy:

`LOCAL_PROCESS_CONTAINED
→ RECOVERY_CONTAINED
→ RESOURCE_CONTAINED
→ EFFECT_PATH_CONTAINED
→ BOUNDARY_CONTAINED
→ MISSION_CONTAINED`

A lower claim must never silently become a higher claim.

## New object: EffectPathClosureCertificate

Candidate fields:

- closure_id;
- effect/claim identity;
- covered paths;
- provider continuations;
- queues;
- child effects;
- retry/redrive paths;
- capabilities;
- resource boundaries;
- bypass paths;
- unknown paths;
- environment assumptions;
- resource incarnations;
- fence generations;
- STOP generation;
- verification evidence;
- current continuity context;
- invalidation triggers;
- claim strength;
- status.

## New object: FenceActivationTransaction

Candidate fields:

- fence_id;
- target/resource;
- previous fence;
- new fence;
- effect scope;
- recovery scope;
- STOP scope;
- authority epoch;
- resource incarnation;
- activation linearization;
- durability state;
- enforcement state;
- verification state;
- crash semantics;
- rollback semantics;
- bypass coverage;
- release conditions.

## Candidate invariants INV-RSF-01..38

01 Process fencing is not provider fencing.
02 Provider fencing is not resource fencing.
03 Resource fencing is not world quiescence.
04 STOP requested is not STOP enforced.
05 STOP enforced is not external quiescence.
06 Fence requested is not fence active.
07 Fence active is not fence verified.
08 Fence verified is claim-specific.
09 Old recovery ownership cannot authorize new effects.
10 Provider retries are part of effect-path closure.
11 Child effects are part of closure.
12 Queues capable of releasing protected work are part of closure.
13 Delegated capabilities are part of revocation closure.
14 Resource incarnation changes invalidate incompatible bindings.
15 New resources must not accept old protected authority by default.
16 Resource boot does not imply protected acceptance.
17 Old provider execution identity cannot silently target new incarnation.
18 Stale requests must be rejected at the protected boundary.
19 Stale rejection must survive crash/restart where claim requires it.
20 Fence state rollback must not resurrect stale acceptance.
21 STOP cannot classify historical UNKNOWN.
22 Fence cannot classify historical UNKNOWN.
23 Ownership cannot classify historical UNKNOWN.
24 Compensation is a new protected effect.
25 Compensation under UNKNOWN requires joint uncertainty safety.
26 Old retries after STOP require explicit handling.
27 Late ACK cannot clear STOP.
28 Late ACK cannot authorize continuation.
29 Queue empty does not prove no historical effect.
30 Worker exit does not prove provider quiescence.
31 Provider session termination does not prove effect termination.
32 Every bypass path relevant to claim must be covered or assumed explicitly.
33 Autonomous resource behavior requires resource-side boundary or claim degradation.
34 Resource replacement requires new boundary/fence verification.
35 Strong containment cannot exceed effect-path closure coverage.
36 Boundary certificate is evidence, not authority.
37 Loss of boundary verification causes HOLD/QUARANTINE for dependent strong claims.
38 Safe non-convergence is preferred to false containment.

## Candidate protocol

`STOP_REQUEST
→ AUTHORITATIVE_STOP_CUTOFF
→ INVALIDATE_STALE_AUTHORITY
→ ACQUIRE_CURRENT_RECOVERY_OWNER
→ ESTABLISH CURRENT RECOVERY CONTEXT
→ DISCOVER EFFECT-PATH CLOSURE
→ FENCE PROVIDER/QUEUE/CAPABILITY PATHS
→ FENCE RESOURCE
→ VERIFY STALE-REQUEST REJECTION
→ RECONCILE IN-FLIGHT EFFECTS
→ CLASSIFY UNKNOWN
→ RECOMPUTE MISSION CLAIM
→ PUBLISH CONTAINMENT CLAIM
→ OPTIONAL COMPENSATION AS NEW PROTECTED EFFECT
→ EXPLICIT RELEASE`

## Important limitation

Even a verified resource-side fence may only establish:

`STALE_EFFECT_REJECTION`

It does not automatically establish:

`NO_PRIOR_EFFECT_OCCURRED`

or:

`WORLD_ALREADY_REVERSED`

This preserves the established separation:

`ENFORCEMENT != HISTORY`

## Architecture consequence

The clean architecture now requires a Resource/Effect Boundary Plane outside the normal Nexo control core.

The protected boundary is the last point where Nexo can enforce:

- current effect identity;
- current authority;
- current fence;
- current resource incarnation;
- STOP constraints;
- capability validity;
- retry/child semantics.

The internal control plane cannot compensate for a missing external enforcement boundary by merely recording that a STOP or fence was issued.

## Open gaps

G-RSF-01 formal resource-boundary model.
G-RSF-02 provider autonomous retry enforcement.
G-RSF-03 resource-side fence persistence across crash/restore.
G-RSF-04 replacement-resource bootstrap safety.
G-RSF-05 queue/child closure completeness.
G-RSF-06 capability revocation propagation.
G-RSF-07 bypass-path discovery.
G-RSF-08 compensation under joint uncertainty.
G-RSF-09 formal containment theorem.
G-RSF-10 implementation refinement.
G-RSF-11 actual SANY/TLC/TLAPS.
G-RSF-12 fault injection with autonomous providers/resources.
G-RSF-13 long-duration fence rollover.
G-RSF-14 common-mode failure between Nexo and resource boundary.

## Next attack

RESOURCE-SIDE FENCE ROLLBACK + SNAPSHOT RESTORE + FAILOVER + OLD CAPABILITY + NEW INCARNATION.

Question: can a resource restore an older snapshot that resurrects an old accepting fence, causing a previously fenced provider continuation to become valid again? This attacks resource continuity itself and may require a separate Resource Continuity Root rather than relying on Nexo's continuity state.
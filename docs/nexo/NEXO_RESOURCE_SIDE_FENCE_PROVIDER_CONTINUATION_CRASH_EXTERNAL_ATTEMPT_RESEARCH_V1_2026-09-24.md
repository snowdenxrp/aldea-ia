NEXO - RESOURCE-SIDE FENCE MINIMUM FOR PROVIDER CONTINUATION / STALE EFFECT PATH / CRASH AFTER EXTERNAL ATTEMPT RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

QUESTION
If Nexo commits the safety order correctly but an external provider/resource continues old work during the transition, what minimum resource-side enforcement is required for the Nexo claim to remain valid?

WEB CROSS-CHECKS
Kubernetes uses resourceVersion to detect stale writes and reject outdated clients with conflict; its documentation also warns that some reads/watch semantics can expose older state. This supports the distinction between coordination state and actual resource-side rejection of stale commands. cite: turn0search2.
etcd provides linearizable operations and atomic transactions, but watch delivery is not itself linearizable. This supports requiring an authoritative mechanism at the protected boundary rather than relying on observation streams. cite: turn0search1, turn0search3.
NIST SP 800-193 requires Roots/Chains of Trust to remain protected and resistant to interference from software above them; it also treats update, detection and recovery as distinct trust functions. This supports placing enforcement below the potentially compromised/stale controller when the claim requires stale-command rejection. cite: turn0search36.

CORE RESULT
An authoritative Nexo safety order can prevent NEW AUTHORIZED local decisions, but it cannot by itself stop an already-running external provider unless the old path crosses an enforceable boundary.
Therefore:
CONTROL CUTOFF != EXTERNAL QUIESCENCE.
AUTHORITY REVOCATION != RESOURCE REJECTION.
FENCE ACTIVATION != EFFECT CANCELLATION.
OBSERVATION != ENFORCEMENT.

MINIMUM RESOURCE-SIDE PROPERTY
For a protected effect class E, resource-side enforcement must be able to evaluate the relevant current fence/context at the point where the protected effect can actually occur.
Candidate predicate:
ALLOW_EXTERNAL(E,ctx) only if CURRENT_FENCE(ctx) AND CURRENT_INCARNATION(ctx) AND AUTHORIZED_CONTEXT(ctx) AND EFFECT_IDENTITY_COMPATIBLE(ctx).
A stale context must be rejected, isolated, or rendered incapable of producing the protected effect.

WHY CONTROLLER-ONLY FENCING FAILS
Sequence:
old controller A admitted E
-> Nexo revokes A
-> A remains alive
-> A has queued/provider work
-> provider executes E
-> Nexo observes later.
If provider/resource does not enforce current fencing, Nexo can truthfully claim only that it stopped its own admission path, not that the external effect was prevented.

FENCE LOCATION
Candidate enforcement levels:
B0 NEXO PROCESS: prevents local code only.
B1 NEXO AUTHORITY CORE: prevents stale authorization only.
B2 PROVIDER/API GATE: can reject stale provider requests.
B3 QUEUE/WORKER GATE: prevents stale queued work from executing.
B4 RESOURCE CONTROLLER: rejects stale commands at actuation boundary.
B5 PHYSICAL/HARDWARE INTERLOCK: prevents physical effect independently.
The required level is claim-dependent. A strong external-prevention claim requires coverage of every effect path capable of violating it.

FENCE CONTRACT
Candidate IndependentEffectFence fields:
- fence_id;
- protected effect classes;
- protected targets;
- effect identity domain;
- current fence generation;
- stale-generation rejection semantics;
- target/resource identity;
- resource incarnation;
- authority dependency;
- continuity anchor;
- crash/restore semantics;
- partition semantics;
- update/rollback semantics;
- queue/child/retry closure;
- bypass closure;
- failure-domain closure;
- activation evidence;
- enforcement verification;
- invalidation triggers;
- decommission semantics.

FENCE ACK LADDER
Do not collapse these:
F0 REQUESTED
F1 RECEIVED
F2 STORED
F3 ACTIVATED
F4 ENFORCING
F5 VERIFIED_FOR_PATH
F6 VERIFIED_FOR_CLAIM.
An ACK that the fence request was received does not prove the resource is rejecting stale commands.

RESOURCE-SIDE STALE REJECTION
Strongest useful property:
STALE_CONTEXT(E) -> REJECT/ISOLATE(E) at every claim-relevant effect boundary.
This is stronger than merely checking a token at the Nexo coordinator.

FENCE TOKEN
A fence token/epoch must be bound to more than a numeric value when required:
fence_generation + effect_scope + target_identity + resource_incarnation + context/authority generation.
Numeric monotonicity alone does not prevent ABA or cross-resource token reuse.

RESOURCE INCARNATION
R1 retired -> R2 created.
Old token valid for R1 must not silently become valid for R2.
Therefore:
SAME_RESOURCE_NAME != SAME_RESOURCE_INCARNATION.
Old evidence/commands remain bound to R1 unless an explicit transfer protocol establishes compatibility.

QUEUES AND CHILD EFFECTS
Resource-side fencing is incomplete if stale work can bypass it through:
- provider queues;
- worker retries;
- delayed callbacks;
- child jobs;
- redrives;
- scheduled actions;
- cached commands;
- alternate APIs;
- direct credentials;
- maintenance interfaces.
These are part of EffectPathClosure.

LONG-RUNNING EFFECT
Fence activation during a long-running operation must define whether the resource can:
A reject at next command boundary;
B interrupt active execution;
C complete atomically before fence takes effect;
D continue autonomously.
If D is possible, Nexo cannot equate fence activation with external quiescence.

CRASH AFTER EXTERNAL ATTEMPT
Canonical sequence:
Nexo ControlCommit
-> DurableIntent
-> Fence verified
-> ExternalAttempt
-> provider may commit
-> Nexo crashes before observation.
On recovery:
local absence of EffectCommit is not evidence of no effect.
Resource-side fence can block future stale attempts, but it cannot classify the already attempted effect.
Reconciliation remains required.

FENCE FAILURE MODES
F-A resource fence unavailable -> strong prevention claim blocked.
F-B fence state UNKNOWN -> strong prevention claim blocked unless another independently sufficient boundary covers the claim.
F-C fence store rollback -> old tokens may resurrect; continuity failure -> quarantine.
F-D fence and authority share common-mode compromise -> independence claim invalid.
F-E provider bypass -> boundary closure incomplete.
F-F stale worker has direct resource credentials -> controller fence insufficient.
F-G resource replacement -> old fence/evidence invalid until new incarnation established.
F-H fence activated but verification unavailable -> ENFORCEMENT_UNKNOWN.

INDEPENDENCE
A resource fence is not independent merely because it is another process/service.
Need failure-domain analysis over:
hardware, host, kernel, hypervisor, runtime, storage, network, identity, keys, policy, update, recovery, operator, provider, coordination store.
If the same compromised root controls both Nexo authority and resource fence, the two are not independent for that claim.

SAFETY-ONLY MODE
When authority coordination fails but an independent verified resource fence remains active:
- block new protected effects;
- preserve historical state;
- retain fence;
- allow bounded reconciliation if safe;
- do not manufacture new authority;
- do not claim external quiescence unless verified.
Safety may survive while liveness is lost.

FENCE ACTIVATION PROTOCOL
REQUEST_FENCE
-> CHECK_TARGET_INCARNATION
-> CHECK_CURRENT_AUTHORITY
-> CHECK_CURRENT_FENCE_GENERATION
-> DURABLE_FENCE_INTENT
-> ACTIVATE_RESOURCE_FENCE
-> VERIFY_STALE_REJECTION
-> VERIFY_BYPASS_CLOSURE
-> PUBLISH_ENFORCEMENT_CLAIM
-> RECONCILE EXISTING EFFECTS
-> RELEASE/QUARANTINE.

IMPORTANT SEPARATION
FENCE VERIFIED means the boundary rejects defined stale paths.
It does not mean:
- previous effect did not happen;
- provider queues are empty;
- external resource is physically quiescent;
- world history is known;
- compensation is safe;
- mission invariant is currently true.

CLAIM STRENGTH
Candidate claim ladder:
LOCAL_ADMISSION_PREVENTION
-> PROVIDER_PREVENTION
-> RESOURCE_PREVENTION
-> BOUNDARY_PREVENTION
-> PHYSICAL_PREVENTION
-> MISSION_SAFE.
Promotion requires closure and verification for the stronger claim.

RESOURCE FENCE + MISSION INVARIANT
A fence may stop future effects while an earlier UNKNOWN remains capable of violating an aggregate mission invariant.
Therefore resource fence does not automatically restore MISSION_SAFE.
Need:
uncertainty classification + temporal/resource accounting + reconciliation + mission invariant recomputation.

RECOVERY
After crash/restore:
RESTORE_HISTORICAL_BASELINE
-> DISCOVER_CURRENT_RESOURCE_INCARNATION
-> DISCOVER_CURRENT_FENCE
-> VERIFY_STALE_REJECTION
-> DISCOVER_PROVIDER_CONTINUATIONS
-> RECONCILE_EXTERNAL_EFFECTS
-> REBUILD_CONTEXT
-> RECOMPUTE_CLAIMS
-> EXPLICIT RELEASE.
Restoring a snapshot cannot restore historical fence authority automatically.

UPDATE / ROLLBACK
Fence implementation update is itself a protected effect.
During update, old and new enforcement generations need explicit overlap/transition semantics.
Rollback to byte-identical fence software does not restore historical fence continuity.
Need new continuity context and verification.

BREAK-GLASS
Break-glass cannot bypass the resource fence silently.
If permitted, it is a separate protected effect with exact scope, bounded lifetime, current resource incarnation, current policy, audit, reconciliation and post-action verification.

CANDIDATE OBJECTS
IndependentEffectFence
ResourceFenceState
FenceContinuityContext
FenceActivationTransaction
ExternalEnforcementClaim
ResourceIncarnation
ProviderContinuation
StaleEffectRejectionContract.

CANDIDATE INVARIANTS INV-REF-01..40
01 controller revocation alone does not prove external prevention.
02 stale protected contexts must be rejected at every relevant effect boundary.
03 fence activation is distinct from fence verification.
04 fence verification is distinct from world-effect classification.
05 fence generation is bound to target/resource identity.
06 resource incarnation changes invalidate incompatible fence state.
07 numeric token monotonicity alone is insufficient against ABA.
08 provider queues are part of effect-path closure.
09 child/retry/redrive paths are part of effect-path closure.
10 alternate APIs are part of bypass closure.
11 direct resource credentials are part of bypass closure.
12 fence ACK semantics must be explicit.
13 received is not activated.
14 activated is not enforcing.
15 enforcing is not verified-for-claim.
16 verified fence does not prove historical no-effect.
17 fence does not resolve UNKNOWN external outcome.
18 fence failure blocks dependent strong prevention claims.
19 fence UNKNOWN blocks dependent strong prevention claims.
20 fence rollback requires continuity re-establishment.
21 shared trust roots can defeat independence.
22 shared update/recovery paths can defeat independence.
23 safety-only operation may preserve safety while losing liveness.
24 safety-only operation cannot invent authority.
25 resource fence does not automatically imply mission safety.
26 resource fence does not imply external quiescence unless contract proves it.
27 long-running effects require explicit mid-execution fence semantics.
28 autonomous provider behavior remains in closure.
29 stale worker survival is not proof of stopped execution.
30 recovery rebuilds current fence context.
31 checkpoint does not restore fence authority.
32 update is part of fence effect-path closure.
33 rollback does not restore historical continuity.
34 break-glass remains inside fence closure.
35 decommission requires stale-controller rejection.
36 resource replacement creates new incarnation.
37 late ACK is historical evidence only.
38 observation cannot substitute for enforcement.
39 formal refinement is required before implementation assurance.
40 formal/runtime/deployment correctness remains unproven.

CANDIDATE THEOREM
Not formally proven: If every claim-relevant path capable of producing a protected external effect crosses an independently current enforcement boundary that rejects stale/incompatible contexts, and the boundary's continuity, bypass closure, resource incarnation and failure-domain assumptions are verified for the claim, then loss of Nexo's prior authority order need not permit stale external execution; liveness may still be lost.
If any required enforcement path is unknown, bypassable, rolled back, or outside the verified boundary, the strong external-prevention claim is unavailable.

ARCHITECTURE CONSEQUENCE
The clean architecture now has two separate questions at every protected effect:
1. WHO MAY AUTHORIZE THIS TRANSITION? -> Authority/Coordination.
2. WHAT ACTUALLY REJECTS A STALE EFFECT AT THE EXTERNAL BOUNDARY? -> Enforcement.
The two can cooperate but cannot be silently substituted.

DEEP RULE
IF NEXO CANNOT CONTROL THE LAST EFFECT-CAPABLE BOUNDARY, IT MUST NOT CLAIM THAT ITS INTERNAL STOP/REVOCATION PREVENTED THE EXTERNAL EFFECT.

NEXT ATTACK
RESOURCE FENCE FAILURE + PROVIDER BYPASS + AUTONOMOUS CONTINUATION + MULTI-RESOURCE EFFECT + PARTIAL FENCE + CRASH/RESTORE. Question: can a partially fenced multi-resource effect still preserve a weaker but useful mission claim without accidentally promoting local containment to global containment?
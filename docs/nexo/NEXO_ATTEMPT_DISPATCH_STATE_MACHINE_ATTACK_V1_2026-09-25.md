# NEXO ATTEMPT DISPATCH STATE MACHINE ATTACK V1 — 2026-09-25

## Scope

This research refines the lifecycle around `ATTEMPTED` after AB104.165. The target is not implementation. The question is whether Nexo can distinguish:

- dispatch-not-started;
- dispatch-accepted;
- dispatch-unknown;

while preserving UNKNOWN, preventing an unsafe second effect, and allowing recovery/reconciliation after crash or timeout.

The analysis separates local durable lifecycle evidence from external-world effect evidence.

## External evidence

RFC 9110 explicitly treats communication failure before a response as a reason that idempotent requests can be repeated, while warning that non-idempotent requests should not be automatically retried unless the client has a way to know the original request was not applied. This supports treating a lost response after a possible dispatch as unresolved rather than as proof of absence. citeturn1search0turn1search4

AWS EC2 documents a stronger provider-side pattern: a client token can make retries of the same request return the prior result without performing the action again, while parameter mismatches are rejected. AWS also notes that mutating APIs can return before asynchronous work completes, creating ambiguity that idempotency is intended to contain. citeturn1search2

Stripe similarly documents server-side idempotency keyed by a client-supplied identity; the first execution result is retained for subsequent retries, and concurrent requests that do not begin endpoint execution do not consume the saved result. This is useful evidence that provider-side idempotency needs explicit lifecycle semantics; a local retry counter is not equivalent. citeturn1search1

SQLite documents atomic transaction commit/recovery under crash and power-loss assumptions, but its atomicity is for changes inside the database transaction. It does not make an external provider call part of that transaction. SQLite also documents crash testing as necessary evidence for its own recovery behavior. citeturn0search0turn0search3

## Refined state machine

The minimum lifecycle is refined to:

PREPARED
→ CONTROL_ADMITTED
→ DISPATCH_NOT_STARTED
→ DISPATCH_CLAIMED
→ DISPATCH_ACCEPTED
→ EFFECT_ATTEMPTED
→ OUTCOME_CONFIRMED / OUTCOME_REJECTED / OUTCOME_UNKNOWN

With a provider that cannot distinguish acceptance from execution, the provider boundary may collapse DISPATCH_ACCEPTED and EFFECT_ATTEMPTED, but Nexo must record the weaker semantics rather than inventing a stronger state.

### Meaning of states

**CONTROL_ADMITTED**
- Protected transaction proves the exact effect identity was admitted under the frozen authority/resource/STOP context.
- Does not prove a dispatch occurred.

**DISPATCH_NOT_STARTED**
- Durable evidence says no worker has claimed the right to dispatch this attempt.
- This is the only state in which a fresh dispatch claim may be considered without first resolving an earlier dispatch claim.
- It must not be inferred merely because no dispatch log is visible after a crash.

**DISPATCH_CLAIMED**
- A single worker has won the conditional transition for the exact effect identity + retry generation.
- The claim must atomically consume the eligible dispatch right.
- A second worker seeing the same identity must reconcile, not create another claim.

**DISPATCH_ACCEPTED**
- Durable evidence from the intermediary/provider says the request was accepted for processing.
- Acceptance is not necessarily execution completion.
- The original effect identity remains authoritative.

**EFFECT_ATTEMPTED**
- Nexo has evidence that the effect request crossed the relevant dispatch boundary, but completion may still be unknown.
- If the transport fails after this point, the state remains unresolved.

**OUTCOME_UNKNOWN**
- The system cannot prove confirmed, rejected, or absent execution.
- UNKNOWN is a durable epistemic state, not a transient error flag.
- Retry must first reconcile the existing effect identity or obtain a provider-side guarantee that the prior request was not applied.

## Crash-cut attack

### D0: crash before dispatch claim
State: CONTROL_ADMITTED / DISPATCH_NOT_STARTED.

Safe recovery:
- Revalidate current authority and STOP/resource context.
- A new worker may claim the same effect identity only through the protected conditional transition.
- No second effect exists because no dispatch claim was consumed.

Caveat:
- Absence of an old worker process is not itself proof that it never dispatched. The claim record is the minimum local evidence only if the protected boundary guarantees the dispatch boundary cannot be crossed before the claim is durable.

### D1: claim durable, crash before actual send
State: DISPATCH_CLAIMED.

This is the critical ambiguity.

If the protocol guarantees that no provider send can occur before the claim commits, recovery can safely classify the attempt as not-yet-dispatched and reuse the same effect identity after current-context validation.

If the provider send may begin before the claim is durably committed, the state cannot be safely classified as DISPATCH_NOT_STARTED. It becomes DISPATCH_UNKNOWN.

Therefore the ordering invariant is:

**durable claim before any possible provider-side effect attempt**

or, if that cannot be guaranteed:

**post-claim recovery must treat the attempt as potentially dispatched.**

### D2: send starts, crash before provider acknowledgement
State: DISPATCH_UNKNOWN / EFFECT_ATTEMPTED-UNKNOWN.

Safe action:
- preserve effect identity;
- do not create a new effect identity;
- reconcile using provider lookup/idempotency query if available;
- otherwise remain UNKNOWN/HOLD or use a documented provider-specific compensation/retry contract.

RFC 9110 supports this conservative treatment for non-idempotent operations after communication failure. citeturn1search0

### D3: provider accepts request, acknowledgement lost
State: DISPATCH_ACCEPTED or UNKNOWN depending on whether acceptance evidence was durably recorded.

If acceptance was durably recorded before the crash:
- recovery continues from DISPATCH_ACCEPTED;
- no new dispatch claim for the same effect identity;
- query provider outcome.

If acknowledgement was only in volatile memory:
- durable local state remains DISPATCH_UNKNOWN;
- provider reconciliation is required.

### D4: provider executes, response lost
State: EFFECT_ATTEMPTED / OUTCOME_UNKNOWN.

The effect may already exist. Retrying with a fresh effect identity is forbidden unless the provider contract independently proves non-execution of the original identity.

Provider idempotency is the clean resolution when supported. AWS and Stripe both document provider-side mechanisms where retries with the same identity do not create a second operation. citeturn1search2turn1search1

### D5: timeout while provider is asynchronous
A timeout is not a state transition to failure.

Required result:
- DISPATCH_ACCEPTED if acceptance was durably observed;
- otherwise DISPATCH_UNKNOWN.

The system must not map timeout to ABSENT.

### D6: STOP changes after claim but before send
The old authorization context is invalidated.

The worker may not simply send because it already owns a local claim.

Required behavior:
- final provider fence/authorization check if the provider supports one;
- otherwise block new dispatch and reconcile whether a send may already have occurred;
- old claim cannot be silently converted into current authority.

### D7: owner/recovery generation changes
A new owner/recovery incarnation invalidates stale workers.

The old worker's late response may still be useful evidence about the same effect identity, but it cannot regain authority to retry, release, or compensate.

### D8: resource incarnation changes
Old resource binding becomes invalid unless continuity is explicitly proven.

A retry against the replacement resource must use a new protected admission/effect identity as appropriate.

### D9: reconciliation races with retry
Both operations must converge on one lifecycle record.

Two valid outcomes:

1. reconciliation wins first → state becomes terminal/known; retry observes terminal state and does not dispatch;
2. retry claims first → reconciliation observes the same effect identity and resolves its outcome.

There must be no legal path where both create independent effect identities from the same unresolved attempt.

## Minimum durable evidence

The minimum protected lifecycle record should include:

- operation_id;
- effect_identity;
- retry_generation;
- lifecycle_state;
- owner_identity;
- owner_generation;
- recovery_incarnation;
- authority_epoch;
- stop_epoch/state;
- resource_id;
- resource_incarnation;
- capability_class;
- fence_scope;
- dispatch_claim_revision;
- dispatch_claim_owner/worker identity;
- dispatch_claim timestamp/monotonic sequence where trustworthy;
- provider/intermediary request identity;
- provider acceptance evidence, when available;
- outcome evidence, when available;
- reconciliation status and evidence references;
- policy/invariant version binding;
- immutable admission context;
- durable history of state transitions.

Trusted wall-clock time is not required to establish ordering if the protected store supplies a monotonic transaction/revision sequence. Timeouts still need a separately defined timing source and must not be treated as proof of external non-execution.

## Key invariant derived from the attack

**A dispatch claim is an ownership transition over an effect identity, not proof that the external effect occurred.**

Therefore:

- CONTROL_ADMITTED grants permission for the lifecycle;
- DISPATCH_CLAIMED grants one worker the right to attempt dispatch;
- DISPATCH_ACCEPTED proves provider/intermediary acceptance only if authoritative evidence exists;
- EFFECT_ATTEMPTED means the dispatch boundary may have been crossed;
- OUTCOME_CONFIRMED/REJECTED requires authoritative outcome evidence;
- UNKNOWN remains UNKNOWN until evidence resolves it.

## Capability implications

R0: no reliable provider fencing/idempotency/reconciliation
- local lifecycle can prevent duplicate local workers;
- external duplicate prevention is unproven;
- UNKNOWN may require HOLD/QUARANTINE.

R1: idempotency/reconciliation but no stale-owner fence
- same effect identity may be safely retried according to provider contract;
- stale-owner exclusion remains unproven.

R2: effect identity + provider/resource conditional fence
- stale-owner dispatch can be rejected if every protected mutation path enforces the fence;
- still does not imply multi-resource atomicity.

R3: provider transaction covers all relevant participants
- stronger claims are permitted only within that exact transaction scope.

No capability class may be silently promoted.

## Architectural consequence

The previous AB104.165 state `ATTEMPTED` was too coarse. It conflated three different facts:

1. nobody has durably claimed dispatch;
2. one worker has claimed dispatch but the provider boundary has not been authoritatively crossed;
3. the provider boundary may have been crossed and outcome is unresolved.

Separating these states makes the recovery contract more precise, but it also exposes a hard boundary:

**Nexo cannot prove DISPATCH_NOT_STARTED from local absence alone unless the protected claim is ordered before every possible external send.**

If that ordering cannot be enforced, the correct state is DISPATCH_UNKNOWN, not DISPATCH_NOT_STARTED.

## Current implementation gap

The current Lúmina path still has no protected durable dispatch claim. `createLuminaEffectAdapter` handlers mutate simulation state directly; `persistPreparedIntent` is optional; `persistState` is later. Therefore the refined state machine is a design target, not an existing runtime guarantee.

No V21 implementation.
No formal verification.
No current CI PASS claimed.

## AB50–AB58 residual carryover — MUST PRESERVE

- TERNARY_MATH_GAP: FOUND
- TERNARY_PROTOCOL_RESIDUAL: UNKNOWN_DUE_TO_MISSING_SEMANTICS
- TERNARY_PAA_COLLISION: UNKNOWN
- EVENTDAG_CLOSURE: PARTIAL
- RECONSTRUCTION: BOUNDED_ONLY
- SEMANTIC_FREEZE: NOT DECLARED
- FORMAL_VERIFICATION/IMPLEMENTATION: NOT_PERFORMED

## DO-NOT-REPEAT

- Do not infer DISPATCH_NOT_STARTED from missing logs after crash.
- Do not treat DISPATCH_CLAIMED as proof of external execution.
- Do not convert timeout to ABSENT.
- Do not create a fresh effect identity while the previous identity is unresolved.
- Do not let STOP/owner/recovery changes be ignored because a worker already claimed dispatch.
- Do not equate provider acceptance with completion.
- Do not equate local conditional claim with external exactly-once.
- Do not use a fresh retry generation to hide an unresolved old effect.
- Do not implement V21 before the lifecycle contract is refined and attacked.
- Do not claim CI/test PASS without fresh evidence.

## EXACT NEXT ACTION

Attack the refined state machine against provider classes R0-R3 with a full race matrix:

1. claim-before-send crash;
2. send-before-claim-durable crash;
3. acceptance-before-record crash;
4. response-loss after provider execution;
5. STOP during each interval;
6. owner/recovery transfer during each interval;
7. resource replacement during each interval;
8. reconciliation/retry concurrent claims;
9. provider idempotency-key expiry;
10. provider parameter mismatch;
11. intermediary retry/duplicate forwarding;
12. multi-resource effects with one participant confirmed and another unknown.

The goal is to determine the exact boundary at which Nexo must downgrade from CONFIRMED/REJECTED to UNKNOWN/HOLD, and which provider capabilities can legitimately promote UNKNOWN without creating a duplicate effect.


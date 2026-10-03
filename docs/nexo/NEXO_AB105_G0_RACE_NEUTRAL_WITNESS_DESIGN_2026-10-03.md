# NEXO AB105 G0 — Race-Neutral Witness Design — 2026-10-03

## Purpose
Resolve the remaining empirical question around W1→ENQUEUE publication/visibility without manufacturing a happens-before edge.

## Frozen state
- AB105.116R unchanged.
- AB105.117R NOT_CREATED.
- TLC NOT_RERUN.
- PR #94 not merged.
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

## Question
Can a naturally concurrent post-start ACL update produce an authorization observation whose result distinguishes:
A) W1 becomes visible to the Processor/authorizer before D1, or
B) D1 may observe the previous aclCache state because no W1→ENQUEUE happens-before is established?

## Design rules
1. D1 requests are scheduled independently of W1 observation. The harness must never wait for, signal, latch on, or otherwise gate D1 issuance on W1.
2. No added volatile field, latch, barrier, Future completion, synchronized block, or callback from W1 may connect the two paths.
3. Do not use wall-clock or nanoTime ordering as proof of JMM ordering.
4. Preserve all raw event ordering, thread IDs, operation IDs, ACL generation identifiers, and authorization outcomes.
5. A DENIED result alone does not prove visibility; an ALLOWED result alone does not prove stale visibility unless the ACL semantics establish the expected state unambiguously.
6. Use multiple repetitions and controlled workload shaping only if the shaping does not create a synchronization edge.
7. The witness must separately record temporal order from causal/JMM claims.

## Minimal witness concept
- Start broker and wait for normal startup readiness.
- Establish baseline ACL state B for a target principal/resource.
- Generate an ACL update U that changes authorization state to N.
- Independently generate D1 requests for the same target during a naturally concurrent window around U.
- Do not observe W1 and then trigger D1.
- Record W1 when it naturally occurs, D1 enqueue/dequeue, authorization decision, and final ACL generation/state.
- Repeat enough times to capture both relative temporal orderings if the scheduler permits.

## Interpretation discipline
- If D1 observes N, this demonstrates an observed visibility outcome, not the exact JMM edge by itself.
- If D1 observes B after a temporally prior W1, this is evidence of a possible visibility race, but must be checked against all alternative explanations and exact ACL state transitions.
- If only N is observed, W1→ENQUEUE remains UNKNOWN unless source/JMM reasoning establishes the edge.
- If only B is observed, do not declare stale-read proof without ruling out request/update sequencing effects.
- Absence of a race manifestation is not proof that no stale-read execution is possible.

## Required evidence
Each cycle should preserve:
W1 event; ACL generation before/after; D1 enqueue/dequeue; authorization input snapshot if available; decision; thread identity; operation_id; raw broker event stream; harness timing metadata as contextual data only.

## Stop conditions
Stop and reassess if the harness needs any W1-gated action, if a test helper introduces synchronization between the paths, or if the experiment cannot distinguish ACL update sequencing from visibility.

## Next action
Before implementation, inspect the existing G0 witness/harness for reusable raw-event capture and verify the ACL semantics for a baseline/updated pair. Then implement only the smallest race-neutral change needed to expose the naturally concurrent window.

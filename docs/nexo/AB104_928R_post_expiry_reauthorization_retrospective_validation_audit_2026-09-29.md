# AB104.928R — Post-expiry reauthorization cannot silently validate a prior effect
Date: 2026-09-29

## Question
O2 starts while authorized, crosses authority expiry, EFFECT-2 is confirmed after expiry, and T6 issues a new authorization. Can T6 retrospectively validate EFFECT-2?

## Fresh evidence
The current IETF HTTPAPI Idempotency-Key draft distinguishes a retry of a completed request from a concurrent request whose original request is still outstanding, and requires an idempotency specification to define key lifecycle/expiry. This supports keeping request identity and outcome history distinct from a later authorization decision. citeturn0search6

## Attack
T3: O2 accepted under authority A2.
T4: A2 expires.
T5: provider confirms EFFECT-2.
T6: new authority A3 is issued.
Question: does A3 make EFFECT-2 retrospectively authorized?

## Findings
1. A3 is a new authorization decision; it does not automatically rewrite the authorization state that governed O2 at T3-T5.
2. Whether A3 may retroactively validate EFFECT-2 is policy-dependent and must be explicitly defined, including scope, effective time, target, and authority.
3. If no retroactive clause exists, A3 governs future actions; EFFECT-2 must be assessed under the policy applicable at its execution/effect checkpoint.
4. If an explicit retroactive rule exists, A3 can create a new historical assessment that EFFECT-2 is acceptable under A3, but this does not erase the original A2 assessment, expiry, or effect evidence.
5. Retroactive authorization assessment is distinct from proving that A2 was valid at T5.
6. If A2's checkpoint semantics are UNKNOWN, A3 cannot resolve that UNKNOWN merely by being newer; it needs a declared retroactive bridge.
7. A3 does not prove that EFFECT-2 was absent before T6, nor that the provider delayed execution until after A3.
8. If EFFECT-2 is irreversible, a later authorization classification cannot undo the physical/history fact.
9. If A3 authorizes a corrective action rather than reclassifying EFFECT-2, that action is a new operation with its own identity, target, authority and outcome.
10. If A3 reuses O2's operation/idempotency identity, it must not be treated as a new operation unless the provider contract explicitly defines that semantics; idempotency keys identify retries of the same request and have their own lifecycle. citeturn0search6
11. No new top-level interaction class. Primarily I9/I19/I21 + class11/class12; I24 remains the lifecycle boundary.

## Core distinctions
NEW_AUTHORIZATION != HISTORICAL_AUTHORIZATION
NEW_AUTHORIZATION != RETROACTIVE_VALIDATION
RETROACTIVE_ASSESSMENT != RETROACTIVE_EXECUTION
CURRENT_AUTHORITY != AUTHORITY_AT_EFFECT_TIME
AUTHORIZATION_CLASSIFICATION != EFFECT_EXISTENCE
EFFECT_EXISTENCE != EFFECT_VALIDITY
POLICY_UPDATE != HISTORY_REWRITE
REAUTHORIZATION != PROOF_OF_PRIOR_AUTHORIZATION
REAUTHORIZATION != PROOF_OF_NONEXECUTION
CORRECTION_OPERATION != ORIGINAL_OPERATION
IDEMPOTENCY_IDENTITY != AUTHORIZATION_IDENTITY
UNKNOWN != FAILED

## Required evidence
- A2 policy version and checkpoint semantics;
- exact expiry time;
- O2 submission/acceptance/execution/commit times;
- provider effect receipt and native effect ID;
- A3 policy version and effective time;
- explicit retroactive clause, if any;
- target/incarnation binding;
- relationship between A3 and O2/EFFECT-2;
- separate record of original and revised assessments;
- reconciliation state preserving unresolved historical claims.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.

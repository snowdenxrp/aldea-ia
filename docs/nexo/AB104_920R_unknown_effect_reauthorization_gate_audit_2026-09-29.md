# AB104.920R — Reauthorization after UNKNOWN external effect
Date: 2026-09-29

## Question
C3 reauthorizes the same logical operation O1 after C2 produced an UNKNOWN external outcome. Can O1 continue, must a new operation be created, or must reconciliation occur first?

## Fresh evidence
The current IETF HTTPAPI Idempotency-Key draft states that an idempotency key identifies retries of the same request, must not be reused with a different payload, and distinguishes a retry after completion from a concurrent request still outstanding. It also permits key expiry according to resource policy. This supports separating retry identity from authorization identity and from outcome certainty. Microsoft documentation on long-running transactions notes that partial updates are not automatically rolled back and that compensation is a separate action after commit; this supports not treating a later authorization as proof that an earlier uncertain effect was absent. citeturn0search0turn0search1turn0search9

## Attack
T1: C1 safe; V1 authorizes O1; provider accepts/starts O1.
T2: C2 unsafe; O1 remains IN_PROGRESS/UNKNOWN; local authority prevents continuation.
T3: C3 becomes safe; V3 authorizes work against the same target.
Unknown question: did O1 produce EFFECT-1 during C2?

Cases:
A) Provider has durable operation/effect lookup that positively resolves O1.
B) Provider has no authoritative lookup.
C) O1 uses stable provider idempotency identity.
D) O1 idempotency memory expired.
E) C3 creates a new operation against the same target.
F) C3 reuses O1's logical operation identity.

## Findings
1. C3 authorization does not itself resolve the C2 UNKNOWN.
2. A positive authoritative provider result bound to O1/target/incarnation can resolve the prior UNKNOWN; a current resource state alone may not.
3. If the prior outcome remains UNKNOWN and continuing O1 could create or duplicate an external effect, the system needs an explicit contract deciding whether continuation is allowed. A conservative gate is reconcile or establish safe deduplication before continuation.
4. Reusing O1 with the same provider idempotency identity can be appropriate when the provider contract guarantees that the identity represents the same logical request and its history is retained. The IETF draft explicitly treats the key as identifying retries of the same request and requires uniqueness against different payloads. citeturn0search0
5. If idempotency history expired, the old key no longer proves deduplication continuity. Reusing it can permit a second effect; therefore IDEMPOTENCY_KEY_REUSE != SAFE_RETRY.
6. Creating a new O2 can be legitimate only if the contract explicitly permits a new logical operation while O1 remains UNKNOWN and defines how duplicate/overlapping effects are handled.
7. O2 must not be treated as evidence that O1 did not execute.
8. If O1 and O2 target the same external effect domain and both can commit, target binding alone does not serialize them; provider-side deduplication or reconciliation is required.
9. If O1 is positively proven FAILED with no effect, a new authorized O2 can proceed under normal policy. This is materially different from UNKNOWN.
10. If O1 is CONFIRMED committed, C3 should not create a duplicate retry; any new action must be a distinct operation (for example correction/compensation) unless provider semantics explicitly define it as the same request.
11. Therefore no universal rule of always continue O1 or always create O2 exists. The contract must define the state transition from UNKNOWN + new authority.
12. No new top-level interaction class. This composes I24, I15/I22, I9/I19/I21 and class11/class12.

## Core distinctions
C3_AUTHORIZATION != C2_OUTCOME_RESOLUTION
UNKNOWN != FAILED
UNKNOWN != CONFIRMED
REAUTHORIZATION != RECONCILIATION
IDEMPOTENCY_KEY != AUTHORIZATION_IDENTITY
IDEMPOTENCY_KEY_REUSE != SAFE_RETRY
NEW_OPERATION != PROOF_OF_OLD_NONEXECUTION
TARGET_BINDING != SERIALIZATION
CURRENT_STATE != PRIOR_EFFECT_OUTCOME
CONFIRMED_EFFECT != RETRYABLE_ABSENCE
EXPIRED_DEDUP_HISTORY != NO_PRIOR_EFFECT
RECONCILE_FIRST != UNIVERSAL_RULE (policy-dependent)
CONTINUE_SAME_OPERATION != CREATE_NEW_OPERATION

## Required contract
For an UNKNOWN operation followed by new authorization:
- exact definition of UNKNOWN;
- authoritative evidence sources that can resolve it;
- whether O1 may resume;
- whether C3 can create O2 while O1 is UNKNOWN;
- stable operation/effect/idempotency identity binding;
- idempotency retention/expiry semantics;
- duplicate-effect handling;
- target/incarnation binding;
- reconciliation requirements;
- compensation/correction behavior if O1 later commits.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.

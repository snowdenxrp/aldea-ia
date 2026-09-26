# NEXO — AB104.207 FENCING / RECONCILIATION / EXTERNAL EFFECTS V1
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Scope
Study the boundary between current authority and real external effects: stale workers, fencing, idempotency, retries, crashes, and UNKNOWN completion.

## External evidence studied

Transactional outbox documentation confirms that a relay can publish an event and crash before recording publication, causing duplicate delivery; consumers therefore need idempotency. AWS likewise recommends idempotent consumers and warns that ordering and duplicate delivery remain concerns. citeturn0search6turn0search0

Fencing-token literature establishes the critical distinction between ownership and effect authority: a lease can expire while an old worker is paused, so the protected resource—not merely the worker—must reject stale ownership tokens. The token must be monotonic within the conflict domain and checked atomically with the protected mutation. citeturn0search3turn0search4

## AB104.207 findings

### 1. Lease/lock is not sufficient
A worker can possess an apparently valid lease, pause, lose ownership, and later resume. Therefore:
LEASE_VALID_AT_START != EFFECT_AUTHORIZED_AT_COMMIT.

The final protected resource must participate in fencing where stale execution could cause harm.

### 2. Idempotency and fencing solve different problems
IDEMPOTENCY answers:
"Is this the same logical operation being retried?"

FENCING answers:
"Is this executor still authorized to act for the current ownership epoch?"

A unique operation_id can prevent duplicate processing of one logical operation, but it does not by itself prevent an obsolete worker from submitting a different operation after authority changed.
Conversely, a fencing token can reject stale workers but does not prove that a retry represents the same logical operation.

Therefore Nexo needs both concepts where the effect boundary requires both.

### 3. The dangerous crash window remains UNKNOWN
Sequence:
1. Nexo authorizes operation O with authority epoch E.
2. Worker obtains fencing token F.
3. Worker sends effect to external system.
4. External system commits.
5. Network response is lost / worker crashes.
6. Local CommitRecord is absent or says only that dispatch was attempted.

Recovery cannot infer NOT_COMMITTED from absence of a local record. The external system may already have committed.
Correct state is UNKNOWN_EXTERNAL until authoritative reconciliation succeeds.

### 4. Reconciliation is not re-execution
When an operation is UNKNOWN, recovery must query/reconcile using the stable operation identity/fingerprint where the target supports it. It must not create a fresh operation identity merely to retry, because that can convert one uncertain effect into two effects.

This extends AB104.197:
CommitRecord != permission to repeat.

### 5. Fencing must be enforced at the resource boundary
If only the coordinator checks F, a stale worker can still send a delayed request directly to the protected resource.
The strongest model is:
request carries F -> target validates F against durable greatest accepted F -> target atomically rejects stale F and applies mutation only when the fence condition holds.

If the external target has no fencing/version/CAS/idempotency facility, the achievable guarantee is weaker and must be stated explicitly. Middleware cannot manufacture authoritative knowledge of whether an irreversible external effect already committed.

### 6. External API without idempotency creates an assurance ceiling
For an irreversible third-party action that exposes neither idempotency nor fencing and returns ambiguous failures, the protocol cannot honestly claim exactly-once effect semantics across crashes.
Possible classifications must include UNKNOWN_EXTERNAL and require reconciliation or human/domain-specific resolution rather than blind retry.

### 7. Decision identity must be stable
Candidate conceptual identity:
operation_id + operation_fingerprint + authority_epoch + fence_epoch + target_scope.

A retry/resubmission keeps operation_id and fingerprint. A genuinely new operation receives a new identity. The protocol must never interpret "safe to resubmit" as "safe to repeat".

### 8. Ordering is separate from duplication
An idempotency key can stop duplicate application of the same operation while still allowing an older operation to arrive after a newer operation. If ordering matters, the target must additionally enforce a sequence/version/fence predicate.

## Candidate external-effect contract — research only
EFFECT_REQUEST should conceptually bind:
- operation_id;
- operation_fingerprint/digest;
- authority_epoch;
- fence_token/ownership epoch;
- target/resource scope;
- expected target version when available;
- deadline/validity boundary where appropriate;
- provenance of authorization.

EFFECT_RESULT should distinguish at minimum:
- COMMITTED;
- REJECTED_STALE;
- REJECTED_DUPLICATE / ALREADY_COMMITTED;
- NOT_COMMITTED;
- UNKNOWN_EXTERNAL;
- UNVERIFIABLE.

No implementation is claimed.

## Important invariant
A recovery engine must not transition:
UNKNOWN_EXTERNAL -> execute(new operation_id)
without an explicit policy proving that the old operation could not have committed.

Otherwise recovery itself becomes a source of duplicate external effects.

## Code/repository study
Canonical repo: snowdenxrp/aldea-ia / main.
Repository search for current fencing/effect implementation did not establish a verified implementation of these invariants. No implementation claim is made. The research result must not be confused with runtime guarantees.

## Historical residuals AB50→AB58 — unchanged
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

## DO-NOT-REPEAT
- Lease != durable effect authority.
- Lock ownership != resource fencing.
- Idempotency != fencing.
- Fencing != idempotency.
- Missing local CommitRecord != proof of NOT_COMMITTED.
- UNKNOWN_EXTERNAL != permission to retry with a new operation_id.
- A valid historical authority != current authority.
- Middleware cannot guarantee exactly-once against a target that exposes no authoritative idempotency/fencing/reconciliation primitive.
- No V21.
- No unsupported verification claims.

## EXACT NEXT ACTION — AB104.208
Study the reconciliation boundary in depth:
1. authoritative target lookup;
2. operation fingerprint matching;
3. ambiguous/partial target responses;
4. timeout and partition behavior;
5. duplicate-but-different payloads under one operation_id;
6. target-side idempotency retention/expiry;
7. compensation vs reconciliation;
8. define when UNKNOWN can legally become NOT_COMMITTED or COMMITTED.

Status: research-only.

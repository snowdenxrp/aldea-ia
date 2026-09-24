# NEXO — CONCURRENT RECONCILIERS, COMPENSATION RACES, AND AUTHORITY CHANGE
Date: 2026-09-24
Status: RESEARCH ONLY — CLEAN ARCHITECTURE DESIGN — NOT IMPLEMENTED — NOT SANY/TLC VERIFIED

## 1. Attack
This round attacks two reconciliation processes operating across an authority change while each may emit compensating effects.

Target race:
R1 observes E1/E2 and prepares C1.
Authority changes.
R2 observes newer evidence and prepares C2.
C1 and C2 may themselves conflict.

## 2. External cross-check
Raft's documented retry ambiguity shows why a stable logical command identity must survive a leadership change: a committed command may be retried after the client did not receive the response, and persistent deduplication prevents re-execution. citeturn0search24

etcd documents that linearizable operations reflect current consensus while serializable local reads may be stale. This supports treating a reconciliation result as context-bound rather than automatically current after an authority transition. citeturn0search0turn0search11

## 3. Core finding
Compensation is not a special privileged operation.

If it crosses an external boundary:
COMPENSATION = EXTERNAL EFFECT

Therefore:
COMPENSATION_RECOMMENDATION != COMPENSATION_AUTHORITY
COMPENSATION_COMMIT != WORLD_RESTORATION
COMPENSATION_SUCCESS != HISTORICAL_ERASURE

## 4. Dangerous race
1. E1 occurs.
2. E2 occurs during partition.
3. R1 begins reconciliation.
4. R1 decides C1 is safe.
5. Before C1 is externally committed, authority changes.
6. R1 becomes stale.
7. R2 obtains current authority.
8. R2 observes additional evidence E3 or a changed resource incarnation.
9. R2 decides C2 is safe.
10. C1 and C2 both reach the provider.
11. C1/C2 may be duplicate, commutative, order-sensitive, or conflicting.

A local decision made before the authority change cannot be assumed valid after it.

## 5. Compensation states
Separate:
COMPENSATION_PLANNED
COMPENSATION_AUTHORIZED
COMPENSATION_ATTEMPTED
COMPENSATION_CONFIRMED

Never collapse them into a single compensated flag.

## 6. Compensation binding
Candidate CompensationEffectBinding:
- compensation_effect_id
- source_effect_set
- target resource/incarnation
- semantic purpose
- authority context
- reconciliation generation
- owner
- fence generation
- policy/invariant generation
- interaction contract
- reversibility/irreversibility class
- required evidence
- invalidation triggers
- provider contract
- attempt lineage

A compensation must be bound to the exact uncertainty it addresses.

## 7. Why undo is unsafe
Suppose E1 transferred value from A to B and C1 transfers value from B to A.

If E1 occurred twice because of retry ambiguity, one compensation may be insufficient.
If E1 never occurred, C1 may create a new incorrect state.
If E1 and E2 were partially applied, C1 may interact with E2.

Compensation selection is a decision under uncertainty, not a generic rollback primitive.

## 8. Compensation race matrix
For C1/C2:
- same source set + same semantics → possible duplicate; require provider idempotency or reconciliation.
- disjoint targets → potentially independent.
- commutative → safe only if exact state-domain contract proves commutativity.
- order-sensitive → order must be established or claim downgraded.
- conflicting → one or both may need quarantine.
- unknown → do not auto-select based on timestamps.

## 9. Authority-change barrier
Before external compensation crosses the effect boundary, require:
CURRENT_AUTHORITY
AND CURRENT_RECONCILIATION_OWNER
AND CURRENT_RECONCILIATION_GENERATION
AND CURRENT_FENCE
AND CURRENT_STOP_STATE
AND CURRENT_RESOURCE_INCARNATION
AND CURRENT_EFFECT_SCOPE
AND CURRENT_POLICY/INVARIANT
AND CURRENT_DEPENDENCY_CONTEXT
AND NO_REQUIRED_INVALIDATION

If critical context changes:
COMPENSATION_PENDING → STALE/REVALIDATION_REQUIRED

## 10. Recommendation vs authorization
R1 can calculate:
C1 is semantically appropriate under context K1

That does not mean:
C1 may execute now

Therefore:
RECONCILIATION_RESULT = INPUT TO AUTHORIZATION
not
RECONCILIATION_RESULT = AUTHORIZATION

## 11. Candidate object: CompensationDecisionContext
Fields:
- source uncertainty set
- candidate compensation
- alternative actions
- resource incarnations
- effect interaction closure
- mission invariants
- current authority context
- current fence
- current reconciliation generation
- provider contract
- evidence/provenance
- assumptions
- claim ceiling

Purpose: make compensation a claim-specific, context-bound decision.

## 12. Candidate object: CompensationConflictSet
Represents candidate compensations that may interact.

Fields:
- compensation identities
- source effects
- target resources
- interaction relations
- authority generations
- reconciliation generations
- provider observations
- unresolved unknowns
- mission-invariant impact

No candidate may be published as safe if the set contains an unresolved conflict relevant to the safety claim.

## 13. Authority change during external attempt
If C1 is already externally attempted when authority changes, the authority change cannot retroactively prove:
- C1 was prevented;
- C1 failed;
- C1 was committed;
- C1 had no effect.

Outcome becomes external-effect uncertainty unless provider evidence resolves it.

REVOCATION_DURING_ATTEMPT != EFFECT_STOPPED

## 14. Provider idempotency ceiling
Stable effect IDs can prevent duplicates only when the provider actually enforces them.

Raft can achieve command deduplication because the state machine persists the serial number and response. An arbitrary external provider may not provide equivalent semantics. citeturn0search24

Therefore:
LOCAL_IDEMPOTENCY != EXTERNAL_IDEMPOTENCY

## 15. Compensation and resource replacement
If source effect targeted R@I1 and current resource is R@I2, compensation against I2 cannot automatically be treated as compensation for historical I1.

RESOURCE_REPLACEMENT != EFFECT_REVERSAL

## 16. Mission invariant race
Compensation may restore one invariant while violating another.

E1 consumes capacity.
C1 restores capacity.
E3 independently consumes restored capacity before C1 is observed.
C1 may now interact with E3.

Compensation must participate in the same mission-level invariant closure as ordinary effects.

## 17. Candidate state machine
C0 CANDIDATE
→ C1 SEMANTICALLY_JUSTIFIED
→ C2 CONTEXT_BOUND
→ C3 AUTHORIZATION_PENDING
→ C4 AUTHORIZED
→ C5 PREPARED
→ C6 FINAL_GATE
→ C7 EXTERNAL_ATTEMPTED
→ C8 CONFIRMED
→ C9 RECONCILIATION_COMPLETE

Invalidation from C0-C7:
→ STALE
→ REJECTED
→ QUARANTINED
→ UNKNOWN_EXTERNAL_OUTCOME

C8 CONFIRMED does not imply historical erasure.
C9 does not imply mission-wide safety unless claim scope proves it.

## 18. New invariants
CR-01 Compensation is an ordinary external effect.
CR-02 A reconciliation result cannot self-authorize compensation.
CR-03 Any authority-context change invalidates pending compensation unless compatibility is proven.
CR-04 Compensation binds to exact source effects and resource incarnations.
CR-05 Compensation cannot erase historical effects.
CR-06 Unknown compensation outcome survives restart and snapshot restore.
CR-07 Compensation participates in mission invariant closure.
CR-08 Concurrent compensations require explicit interaction classification.
CR-09 Provider idempotency must be contractually established, not inferred from local effect IDs.
CR-10 Current release requires current authority and reconciled compensation effects where safety-relevant.

## 19. Adversarial fixtures
CR-A01 R1 prepares C1; authority changes before execution.
CR-A02 R1 executes C1; response is lost; R2 prepares C2.
CR-A03 C1 and C2 both execute.
CR-A04 C1 conflicts with new ordinary effect E3.
CR-A05 compensation targets replaced resource incarnation.
CR-A06 compensation provider lacks idempotency.
CR-A07 stop asserted during compensation attempt.
CR-A08 second partition during compensation.
CR-A09 recovery restores pre-compensation checkpoint.
CR-A10 two reconciliation owners issue compensations concurrently.
CR-A11 provider reports current state but incomplete causal history.
CR-A12 compensation succeeds while source effect remains UNKNOWN.
CR-A13 compensation fixes one mission invariant but violates another.
CR-A14 callback/retry creates another compensation attempt.
CR-A15 stale R1 publishes C1 after R2 becomes current.

## 20. Distillation
CARRY_FORWARD:
- compensation as ordinary external effect
- current-context final gate
- effect identity and attempt identity
- resource incarnation
- interaction classification
- mission invariant closure
- UNKNOWN preservation
- external idempotency ceiling

REWORK:
- CompensationEffectBinding
- CompensationDecisionContext
- CompensationConflictSet
- exact compensation safety theorem
- concurrent reconciler ownership protocol

REJECT:
- automatic rollback as universal remedy
- compensation recommendation == authorization
- latest reconciler wins
- latest timestamp decides compensation
- compensation success == historical erasure

OPEN:
- formal proof of compensation selection safety
- recursive compensation/reconciliation model
- provider-specific contracts
- SANY/TLC
- implementation refinement
- fault injection

## 21. Status
RESEARCH COMPLETE FOR THIS ATTACK ROUND.
DESIGN CANDIDATE ONLY.
NO V21 IMPLEMENTATION.
NO FORMAL CORRECTNESS CLAIM.
NO RUNTIME CORRECTNESS CLAIM.

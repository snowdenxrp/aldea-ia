# NEXO — COMPENSATION STORMS, CASCADING UNCERTAINTY, AND TERMINATION SAFETY
Date: 2026-09-24
Status: RESEARCH ONLY — CLEAN ARCHITECTURE DESIGN — NOT IMPLEMENTED — NOT SANY/TLC VERIFIED

## 1. Attack
This round attacks recursive compensation:
C1 compensates E1.
C1 becomes uncertain.
A second reconciler prepares C2 against C1.
C2 becomes uncertain.
Resource incarnation changes.
A third reconciler considers C3.

Question: how does Nexo prevent compensation from becoming an unbounded chain that increases rather than reduces uncertainty?

## 2. External cross-check
Raft solves duplicate command execution inside its replicated state machine by assigning unique serial numbers and retaining the associated response; this demonstrates that retry identity must be durable, but it does not make arbitrary external side effects exactly-once. citeturn0search15

The Idempotent Receiver pattern similarly requires the receiver to identify duplicate requests and retain enough state to return the previous result. citeturn0search0

Distributed-system guidance also warns that retries without delay can create request storms; backoff reduces load but does not by itself establish semantic safety. citeturn0search2

Majority/quorum patterns trade liveness against safety, reinforcing the architectural choice that Nexo may deliberately sacrifice progress when authority or external-effect truth is uncertain. citeturn0search9

## 3. Core finding
Compensation can create a new uncertainty.

Therefore:
COMPENSATION != UNCERTAINTY REDUCTION BY DEFINITION

A compensation is safe only if its worst-case outcomes are bounded under the uncertainty it is intended to address.

## 4. Compensation chain
Possible chain:
E1
→ UNKNOWN(E1)
→ C1
→ UNKNOWN(C1)
→ C2
→ UNKNOWN(C2)
→ C3 ...

A naive rule such as:
UNKNOWN → COMPENSATE
can generate an unbounded effect chain.

Therefore there must be an explicit stopping rule.

## 5. New concept: CompensationDepth
Candidate:
CompensationDepth = number of semantically dependent compensation generations from an originating uncertain effect.

Depth is not merely an execution counter. Retries of the same logical effect do not necessarily increase semantic compensation depth.

Candidate invariant:
NO_UNBOUNDED_COMPENSATION_CHAIN

A compensation chain must have a bounded policy or enter HOLD/QUARANTINE.

## 6. New concept: UncertaintyBudget
Candidate budget over:
- unresolved external effects;
- affected resources;
- affected mission invariants;
- compensation generations;
- interaction edges;
- provider uncertainty;
- unresolved causal order;
- execution attempts;
- recovery cycles.

The budget is safety-related, not just a performance quota.

Exceeding the budget does not imply failure of the world.
It means Nexo can no longer safely justify further automatic effects under the current claim.

Response:
HOLD / QUARANTINE / SAFETY_ONLY

## 7. Compensation safety criterion
Candidate:
A compensation may be automatically admitted only if it is SAFE_UNDER_JOINT_UNCERTAINTY for the complete relevant uncertainty set.

That means every allowed external outcome of the compensation must remain within the protected safety region, or there must be a verified enforcement/rollback boundary.

This extends prior:
SAFE_UNDER_JOINT_UNCERTAINTY
and
AdmissionContractFloor.

## 8. Branch-invariant compensation
A particularly strong candidate class is a compensation whose safety result is invariant across all unresolved branches.

If:
U = {u1, u2, ... un}

and compensation C yields a safety-preserving state for every admissible ui, then C may be safe under U.

If C is safe only when a particular unknown assumption is true:
C must not be automatically executed until that assumption is resolved.

## 9. Compensation storm attack
Attack:
1. E1 unknown.
2. R1 emits C1.
3. C1 unknown.
4. R2 emits C2.
5. C2 interacts with E1/C1.
6. R3 emits C3.
7. Each compensation creates more interaction edges.
8. Resource scope expands.
9. Mission invariant closure expands.
10. No finite release boundary can be established.

Required response:
STOP generating new compensations.
Freeze affected effect scope.
Fence known execution paths.
Preserve historical identities.
Reconcile externally where possible.
If closure cannot be achieved, quarantine.

## 10. Important distinction
A compensation chain can be:
- semantically resolving;
- semantically neutral;
- semantically expanding;
- semantically conflicting;
- unknown.

Candidate metric:
UncertaintyDelta(C) =
post-effect uncertainty closure − pre-effect uncertainty closure

This is a design-analysis metric, not yet a formal theorem.

If uncertainty expands and no invariant requires the action, automatic continuation should stop.

## 11. New object: CompensationChainContext
Candidate fields:
- origin_effect_id
- chain_id
- compensation_depth
- uncertainty_budget
- affected_effect_set
- affected_resource_incarnations
- affected_mission_invariants
- authority continuity
- reconciliation continuity
- policy/invariant generation
- provider contract versions
- interaction closure
- termination policy
- claim ceiling

## 12. New object: CompensationTerminationPolicy
Defines when automatic compensation must stop.

Candidate triggers:
- depth limit reached;
- uncertainty budget exhausted;
- unresolved conflicting effect;
- unresolved resource incarnation;
- authority context changed;
- required fence unavailable;
- provider history incomplete beyond claim boundary;
- compensation would expand protected scope;
- compensation would violate a mission invariant under any admissible branch;
- effect-path closure becomes UNKNOWN_WORLD.

Termination policy itself must be protected configuration.

## 13. New object: CompensationSafetyCertificate
Candidate claim:
C is safe under uncertainty set U within boundary B.

It must bind:
- U fingerprint
- C effect identity
- B closure
- resource incarnations
- authority context
- policy/invariant versions
- provider contract
- proof/assurance context
- expiration/invalidation triggers

A certificate does not authorize execution by itself.

## 14. Final gate
Automatic compensation execution requires:
CURRENT AUTHORITY
AND CURRENT RECONCILIATION OWNERSHIP
AND CURRENT CHAIN CONTEXT
AND CURRENT UNCERTAINTY SET
AND CURRENT RESOURCE INCARNATIONS
AND CURRENT EFFECT INTERACTION CLOSURE
AND CURRENT MISSION INVARIANTS
AND VALID COMPENSATION SAFETY CERTIFICATE
AND CURRENT FENCE
AND PROVIDER CONTRACT COMPATIBILITY
AND NO UNRESOLVED REQUIRED INVALIDATION

Otherwise:
STALE → REVALIDATE or HOLD

## 15. Incarnation replacement attack
R1 prepares C1 against R@I1.
R1 crashes.
Resource replaced: R@I2.
R2 restores checkpoint.
Naive system sends C1 to I2.

This must be rejected.

C1 is bound to I1.
I2 requires a new semantic decision unless the provider contract explicitly proves equivalence.

RESOURCE INCARNATION CHANGE = CONTEXT CHANGE

## 16. Compensation of compensation
C2 intended to compensate C1 must explicitly identify C1 as its source effect.

It must not be treated as compensation of the original E1 unless a separate semantic proof establishes that relation.

Thus:
COMPENSATING A COMPENSATION != AUTOMATICALLY COMPENSATING THE ORIGINAL EFFECT

This prevents semantic lineage from being silently flattened.

## 17. Irreversible effects
Some effects cannot be meaningfully compensated:
- irreversible external actions;
- side effects with independent observers;
- effects whose causal descendants cannot be recalled;
- providers without sufficient history.

For such effects, the architecture must not invent a compensating inverse.

The safe response may be:
CONTAIN FUTURE EFFECTS
+ PRESERVE HISTORY
+ DOWNGRADE CLAIM
+ QUARANTINE

## 18. Claim degradation
If full correction cannot be proven, Nexo may publish only a weaker claim.

Example hierarchy:
C0 UNKNOWN
C1 EFFECT IDENTIFIED
C2 EFFECT BOUND TO RESOURCE INCARNATION
C3 PROVIDER OUTCOME VERIFIED
C4 INTERACTION IMPACT VERIFIED
C5 MISSION INVARIANT VERIFIED
C6 RELEASE ELIGIBILITY VERIFIED

No automatic promotion across levels.

This extends the previous claim lattice and degraded-claim research.

## 19. New invariants
CS-01 Compensation cannot be assumed to reduce uncertainty.
CS-02 Automatic compensation chains are bounded.
CS-03 Exceeding uncertainty budget cannot authorize additional effects.
CS-04 Compensation must be safe across the complete relevant uncertainty set.
CS-05 Compensation certificates are not authority.
CS-06 Resource incarnation changes invalidate affected pending compensation.
CS-07 Compensation of compensation requires explicit semantic linkage.
CS-08 Irreversible effects cannot be assigned invented inverses.
CS-09 Claim degradation is safer than unsupported claim promotion.
CS-10 Compensation termination policy is safety-critical and protected.
CS-11 New compensation effects expand effect-path closure.
CS-12 If closure becomes UNKNOWN_WORLD, automatic compensation must stop unless a boundary-specific safety proof exists.

## 20. Adversarial fixtures
CS-A01 unknown original effect causes compensation.
CS-A02 compensation outcome unknown.
CS-A03 repeated compensation chain.
CS-A04 each compensation expands affected scope.
CS-A05 resource incarnation changes between compensation generations.
CS-A06 compensation of compensation interacts with original effect.
CS-A07 provider lacks history.
CS-A08 provider exposes current state but not causal history.
CS-A09 irreversible effect has no valid inverse.
CS-A10 compensation crosses a newly widened trust boundary.
CS-A11 authority rotates during compensation chain.
CS-A12 STOP arrives during compensation.
CS-A13 uncertainty budget is exhausted.
CS-A14 two compensation chains converge on one resource.
CS-A15 two chains diverge and later interact.
CS-A16 callback creates another compensation.
CS-A17 checkpoint restores old chain depth.
CS-A18 hidden continuation survives apparent chain termination.
CS-A19 compensation safety certificate is stale.
CS-A20 termination policy itself changes during reconciliation.

## 21. Distillation
CARRY_FORWARD:
- compensation is an ordinary effect
- safe-under-joint-uncertainty
- claim degradation
- resource incarnation binding
- effect-path closure
- current-context final gate
- UNKNOWN preservation

REWORK:
- CompensationDepth
- UncertaintyBudget
- CompensationChainContext
- CompensationTerminationPolicy
- CompensationSafetyCertificate
- formal uncertainty-delta semantics

REJECT:
- UNKNOWN → automatically compensate
- compensation success → original effect erased
- compensation chain can continue indefinitely
- resource ID alone identifies incarnation
- latest compensation wins
- retry count alone measures semantic compensation depth

OPEN:
- formal bounded-chain theorem
- exact uncertainty budget semantics
- liveness impact
- provider-specific refinement
- SANY/TLC
- implementation/fault injection

## 22. Status
RESEARCH COMPLETE FOR THIS ATTACK ROUND.
DESIGN CANDIDATE ONLY.
NO V21 IMPLEMENTATION.
NO FORMAL CORRECTNESS CLAIM.
NO RUNTIME CORRECTNESS CLAIM.

# NEXO — SCOPE ENVELOPE ESCAPE / CARDINALITY / FAN-OUT / AGGREGATE SAFETY — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question
Can a ScopeEnvelope that is individually bounded still be unsafe because many individually valid resources, providers, delegates, queues or effects compose into an aggregate footprint that exceeds the original safety proof?

## External cross-checks
AWS recommends throttling based on known capacity and explicitly warns that limits must consider both request rate and request size/complexity; it also calls out maximum consumer concurrency and resource exhaustion. citeturn0search6turn0search8 AWS further treats retries as resource consumers and recommends maximum retry budgets because multiple retry layers can compound load. citeturn0search0 Kubernetes ResourceQuota provides a concrete example of admission-time aggregate limits: quotas can reject new workloads when namespace-level resource limits would be exceeded. citeturn0search12

## Core result
YES.
A bounded membership rule is not sufficient by itself.
Even when every discovered object is individually valid, the aggregate may violate a safety invariant through cardinality, resource exhaustion, queue growth, coordination overhead, retry amplification, shared physical limits or mission-level coupling.

Candidate rule:
INDIVIDUAL_VALIDITY + BOUNDED_MEMBERSHIP does not imply AGGREGATE_SAFETY.

Therefore ScopeEnvelope needs an explicit aggregate budget and a proof that the budget is sufficient for the claim.

## 1. Cardinality becomes a safety property
Suppose the envelope allows resources of class R.
One R is safe.
Ten R may be safe.
A million R may exhaust memory, queues, locks, network connections, fencing state, recovery capacity or a physical resource.
Therefore the envelope must constrain not only membership but quantity and aggregate cost.

## 2. New concept: Aggregate Safety Budget
Candidate AggregateSafetyBudget fields:
budget_id
scope/envelope identity
effect classes
maximum active effects
maximum resources
maximum resource units
maximum providers
maximum delegates
maximum delegation depth
maximum queues
maximum queued work
maximum child effects
maximum concurrent retries
maximum recovery work
maximum compensation work
maximum evidence/storage footprint
maximum coordination state
maximum external-effect footprint
maximum physical/mission quantity
accounting semantics
reservation state
consumption state
release state
expiry/invalidation rules.

## 3. Reservation vs observation
Counting current objects after admission is too late if concurrent admissions can oversubscribe the budget.
Therefore capacity must be protected through reservation or an equivalent serialized admission mechanism.
Candidate distinction:
OBSERVED_CAPACITY = what telemetry says is used.
RESERVED_CAPACITY = what admitted transitions have committed to consume.
AVAILABLE_CAPACITY = budget - protected reservations - current usage according to the contract.

Telemetry does not authorize a new reservation.

## 4. New invariant
NO OVERCOMMITMENT OF PROTECTED BUDGET.
If two admissions race, both cannot independently observe enough remaining capacity and both commit if their combined reservation exceeds the protected budget.
This makes aggregate budgets part of the authoritative admission domain when the budget is safety-relevant.

## 5. Cardinality is not only count
Two objects can have very different cost.
Therefore:
COUNT != RESOURCE_COST.
A single provider may consume more memory, bandwidth, physical energy or coordination state than many small effects.
Candidate cost dimensions include:
CPU
memory
storage
network
connections
queue slots
concurrency
locks
fence entries
provider quota
physical actuator capacity
energy
rate
latency budget
recovery capacity
evidence capacity.

## 6. Aggregate footprint
Define:
AGGREGATE_FOOTPRINT(S)
as the combined safety-relevant footprint of an effect set S.
It includes direct resource cost plus interaction-generated cost, child effects, queues, retries, compensation, recovery and shared physical constraints.
Aggregate footprint may be nonlinear.

Example:
E1 cost = 1
E2 cost = 1
but E1 + E2 triggers a shared queue with cost 100.
Therefore aggregate cost cannot always be calculated as simple member-cost addition.

## 7. Fan-out amplification
One admitted effect can create N child effects.
If each child creates M downstream effects, total effect-path cardinality can grow approximately as a branching process.
Therefore a local envelope such as 'one child per parent' is insufficient unless total depth and fan-out are bounded.

Candidate bound:
TOTAL_EFFECT_PATH_CARDINALITY <= B_path
for the claim-relevant closure.

## 8. Retry amplification
An effect with retry budget r may create r+1 attempts.
Downstream services may have their own retry budgets.
Therefore aggregate attempts can multiply across layers.
AWS explicitly warns that retries at multiple layers can compound and consume resources, and recommends maximum retry values. citeturn0search0

Candidate:
COMPOSITE_RETRY_BUDGET
must be part of ContractClosure and ScopeEnvelope.

## 9. Queue amplification
A queue can hide aggregate work.
Queue length alone is not enough.
Need:
pending cardinality
message size
retention
retry count
fan-out
consumer concurrency
downstream effect potential
staleness window.
AWS recommends limiting queues because long queues can retain stale requests and consume resources. citeturn0search2

Therefore:
QUEUE_CAPACITY != EFFECT_PATH_SAFETY
and:
QUEUE_EMPTY != HISTORICAL_NO_EFFECT.

## 10. Delegation explosion
Delegation depth d with branching factor b can produce a large descendant set.
Even if each delegation is individually authorized, aggregate authority can become difficult to bound.
Therefore the envelope must constrain:
delegation depth
fan-out
capability count
capability lifetime
capability scope
transitive authority.

Candidate invariant:
TRANSITIVE_DELEGATED_AUTHORITY <= ENVELOPE_BOUND.

## 11. Hidden aggregate authority
Ten independent capabilities may each be harmless but jointly permit a protected effect that no single capability can perform.
Therefore capability safety requires composition analysis.
Candidate:
CAPABILITY_COMPOSITION_CLOSURE.

Authority must be evaluated over the set, not only each token individually.

## 12. Shared physical resource
Aggregate digital validity can violate a physical invariant.
Example:
Each actuator command is within its local allowed range, but simultaneous commands exceed a physical power, pressure, thermal or mechanical limit.
Therefore mission/physical invariants belong in composite closure.

Candidate:
PHYSICAL_INVARIANT_CLOSURE(S).

## 13. Aggregate rate is different from aggregate quantity
A scope may contain only ten effects but execute them at a rate that violates a safety property.
Therefore budgets need both:
STATE BUDGETS
and
RATE BUDGETS.

Candidate rate dimensions:
effects/second
resource transitions/second
provider calls/second
queue ingress/second
retry attempts/second
compensation/second.

## 14. Burst vs sustained load
Average rate can be safe while a short burst is unsafe.
Therefore a budget may need:
instantaneous limit
burst allowance
rolling-window limit
cumulative limit.

Token-bucket-like accounting is a possible implementation pattern, but the architecture must specify semantics independently of any particular algorithm.

## 15. Time-dependent budgets
Some resources recover over time.
Others do not.
Therefore budget state needs explicit refill/release semantics.
Clock assumptions must be explicit because trusted time is still an open architectural gap.
Where safety depends on time, monotonic/authoritative timing semantics must be specified rather than relying on wall-clock timestamps.

## 16. Budget exhaustion
When budget is exhausted, the correct action depends on claim.
Candidate states:
BUDGET_AVAILABLE
BUDGET_RESERVED
BUDGET_EXHAUSTED
BUDGET_UNKNOWN
BUDGET_RECONCILIATION_REQUIRED
BUDGET_QUARANTINED.
UNKNOWN budget state must not be treated as available capacity for safety-critical admission.

## 17. Budget reservation failure
If admission reserves budget but crashes before execution, recovery must reconcile reservation state.
Therefore:
RESERVATION != EFFECT
and:
RESERVATION != CONSUMPTION.
Stale reservations must not silently become permanent resource leaks, but releasing them requires knowing whether a protected effect may still be active.
This connects aggregate budgets to external UNKNOWN and recovery.

## 18. Budget rollback hazard
A storage rollback can resurrect old reservation state.
Therefore budget continuity must follow the existing continuity rules:
HISTORICAL_BUDGET_STATE != CURRENT_BUDGET_AUTHORITY.
Restoring a snapshot cannot automatically restore available capacity.

## 19. Budget and fencing
Suppose a stale actor still believes it has ten units available.
The current authority says zero.
Resource-side admission must reject the stale reservation.
Therefore budget enforcement itself may need fencing/epoch semantics when stale actors can consume the protected resource.

## 20. Aggregate budget as a protected state
If exceeding a budget can violate a safety invariant, budget admission belongs inside the protected authoritative domain or behind an equivalent atomic enforcement boundary.
Otherwise:
check budget → concurrent actor consumes budget → execute
can race.

Candidate protected transition:
CHECK_CURRENT_CONTEXT → CHECK_CLOSURE → CHECK_BUDGET → RESERVE_BUDGET → LINEARIZE_ADMISSION.

## 21. ScopeEnvelope escape through cardinality
A ScopeEnvelope can say:
allowed_resource_class = R
without saying:
maximum_count = N.
That is incomplete for aggregate safety.

Therefore:
MEMBERSHIP_BOUNDARY != CARDINALITY_BOUNDARY.

Both may be required.

## 22. ScopeEnvelope escape through equivalent objects
An attacker or autonomous provider may create many objects that are individually class-valid but jointly create an unbounded effect path.
Therefore envelope membership must include aggregate constraints and interaction semantics, not only type checks.

## 23. Aggregate closure
New candidate:
AggregateClosure = closure over:
members
interactions
resources
providers
queues
delegations
retries
child effects
compensations
recovery work
physical constraints
budgets
mission invariants.

ContractClosure therefore needs a quantitative layer.

## 24. New object: AggregateSafetyContract
Candidate fields:
contract_id
scope/envelope
claim
budget definitions
reservation semantics
cost model
cardinality bounds
rate bounds
fan-out bounds
delegation bounds
retry bounds
queue bounds
resource-incarnation rules
physical/mission invariants
uncertainty treatment
recovery semantics
continuity semantics
enforcement boundary
verification evidence
invalidation triggers.

## 25. New object: ResourceReservation
Candidate fields:
reservation_id
scope
effect/composite identity
resource class
resource incarnation
quantity
rate reservation
fan-out reservation
retry reservation
expiry
authority epoch
fence generation
context identity
linearization reference
consumption state
release/reconciliation state.

ResourceReservation is not proof that the external resource was consumed.

## 26. Aggregate claim
Candidate:
AGGREGATE_CLAIM(S,C)
means the combined set S remains within the safety boundary for claim C.
This is stronger than proving each member separately.

Candidate condition:
AGGREGATE_CLAIM ⇒
INDIVIDUAL_CLAIMS
+
INTERACTION_CLOSURE
+
AGGREGATE_BUDGET_VALID
+
MISSION_INVARIANT_VALID.

## 27. Safe degradation
If a new object cannot be admitted because aggregate budget is exhausted, Nexo should not necessarily fail the whole mission.
Possible responses:
reject new child
throttle
queue within bounded capacity
degrade optional effect
switch to a lower-cost contract
hold
quarantine.
AWS explicitly identifies throttling and buffering as mechanisms to control demand and resource exhaustion. citeturn0search5turn0search10

However, degradation cannot violate a higher-priority safety invariant.

## 28. Mission-level coupling
Two effects may be safe at resource level but unsafe at mission level.
Example abstractly:
E1 consumes resource A.
E2 consumes resource B.
Neither exceeds local limits.
Together A+B exceed a mission-wide conservation invariant.
Therefore mission invariants must be represented in AggregateClosure.

## 29. Resource exhaustion can itself become a safety event
Running out of memory, coordination slots, fence records, recovery capacity or evidence storage can remove safety mechanisms.
Therefore resource exhaustion is not merely a performance problem.
It can become an assurance failure if the exhausted resource is part of the safety TCB.

Candidate invariant:
SAFETY_CRITICAL_RESOURCE_EXHAUSTION ⇒ FAIL_CLOSED / CONTAIN.

## 30. Graceful degradation cannot silently disable safety
An implementation must not respond to capacity pressure by bypassing fencing, skipping reconciliation, weakening identity checks or dropping safety evidence.
Therefore:
RESOURCE_PRESSURE != AUTHORITY_TO_RELAX_SAFETY.

## 31. New invariant family INV-AGG-01..34
01 Individual validity does not imply aggregate safety.
02 ScopeEnvelope membership alone does not prove aggregate safety.
03 Cardinality is safety-relevant when aggregate limits exist.
04 Count is not equivalent to resource cost.
05 Aggregate footprint may be nonlinear.
06 Fan-out must be bounded when it can create protected effects.
07 Delegation depth must be bounded when transitive authority matters.
08 Delegated capability count may require a budget.
09 Local idempotency does not bound aggregate retry amplification.
10 Retry budgets must compose across relevant layers.
11 Queue capacity is part of aggregate closure when queues can create effects.
12 Queue emptiness does not prove historical absence.
13 Rate budgets and state budgets are distinct.
14 Burst limits and sustained limits are distinct.
15 Safety-critical capacity must have protected admission semantics.
16 Concurrent reservations cannot overcommit protected budget.
17 Reservation is distinct from external consumption.
18 Recovery must reconcile stale reservations.
19 Snapshot restore cannot restore historical budget authority.
20 Budget state may require continuity/fencing.
21 Unknown available capacity is not equivalent to available capacity for safety-critical admission.
22 Aggregate closure includes interaction-generated costs.
23 Physical/mission invariants belong in aggregate closure when affected.
24 Resource exhaustion of safety-critical components is an assurance event.
25 Degradation cannot silently relax safety invariants.
26 Optional work may be throttled or rejected without changing safety authority.
27 Aggregate claim is stronger than member claims.
28 Composite CCD may need budget coordination.
29 Containment budget must include downstream continuation.
30 Recovery budget must prevent recovery storms.
31 Evidence/storage budget must not silently erase required proof.
32 ResourceReservation is not external-world evidence.
33 Aggregate budget changes are safety-relevant invalidation events.
34 Strong aggregate claims require quantitative bounds or an explicit proof that quantity is irrelevant.

## 32. Formal direction
Candidate state:
AggregateBudget = {limit, reserved, consumed, available, unknown, quarantined}.
Candidate transition:
RESERVE(q) is allowed only if current protected state proves q fits within the claim-relevant budget.
Candidate safety property:
reserved + committed consumption <= limit.
For uncertain consumption, the safe rule depends on the contract; if the uncertainty could exceed a safety limit, admission is blocked until reconciled or bounded.

Candidate envelope predicate:
IN_ENVELOPE(x) AND AGGREGATE_COST(S + x) <= B AND FANOUT(S + x) <= F AND RATE(S + x) <= R AND DELEGATION(S + x) <= D AND MISSION_INVARIANTS(S + x).

## 33. Major architectural consequence
ScopeEnvelope cannot be merely a set-membership filter.
It must become a quantitative safety boundary.
The clean architecture now distinguishes:
MEMBERSHIP
CARDINALITY
COST
RATE
FAN-OUT
DELEGATION
RETRY
QUEUE
RECOVERY
PHYSICAL/MISSION INVARIANTS.

## 34. Remaining gaps
G-AGG-01 formal aggregate cost model.
G-AGG-02 nonlinear interaction cost.
G-AGG-03 dynamic reservation linearization.
G-AGG-04 reservation rollback/crash semantics.
G-AGG-05 unknown consumption accounting.
G-AGG-06 trusted time for refill/expiry.
G-AGG-07 multi-domain budget coordination.
G-AGG-08 mission-level invariant formalization.
G-AGG-09 safety-critical resource exhaustion model.
G-AGG-10 recovery storm bounds.
G-AGG-11 evidence-storage exhaustion.
G-AGG-12 actual TLC/SANY.
G-AGG-13 implementation refinement.
G-AGG-14 fault-injection and load-boundary testing.

## Conclusion
A bounded ScopeEnvelope is not safe merely because every discovered object belongs to an allowed class.
The envelope must bound the aggregate consequences of discovery.
The new rule is:
VALID_MEMBER != SAFE_AGGREGATE.

Therefore dynamic scope requires both qualitative closure and quantitative closure.
Qualitative: paths, dependencies, authority, interactions, assumptions.
Quantitative: cardinality, cost, rate, fan-out, retries, queues, delegation and recovery capacity.

## Next attack
MISSION-LEVEL INVARIANT COMPOSITION / RESOURCE CONSERVATION / BUDGET TRANSFER.
Question: if effects consume and release multiple shared resources over time, can independently valid reservations collectively violate a mission invariant through temporal overlap, transfer, delayed release or UNKNOWN external consumption?
This attacks the boundary between aggregate budgets, world truth, temporal invariants, compensation, recovery and the final mission-level safety contract.
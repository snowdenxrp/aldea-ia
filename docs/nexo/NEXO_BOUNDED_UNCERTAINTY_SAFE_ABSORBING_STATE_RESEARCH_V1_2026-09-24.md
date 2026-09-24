# NEXO — BOUNDED UNCERTAINTY / SAFE ABSORBING STATE RESEARCH V1

Date: 2026-09-24
Status: RESEARCH ONLY. No V21. No implementation.

## 1. Question
Can an UNKNOWN external outcome be transformed into a deliberately safe absorbing state without falsely claiming that the historical outcome is known?

Answer from this round: potentially yes, but only for an effect class with a proven safety-preserving barrier. The absorbing state is a safety state, not a truth state.

## 2. Core separation
UNKNOWN_WORLD_TRUTH != UNSAFE_CURRENT_STATE.

It is possible to know that the past is unresolved while knowing that no further protected action may proceed.

Therefore a candidate state may be:
SAFE_QUARANTINED_UNKNOWN

meaning:
- historical outcome remains UNKNOWN;
- all relevant future authority is fenced;
- known downstream execution paths are blocked or bounded;
- no release is permitted from the state merely because time passes;
- later reconciliation remains possible;
- decommission does not erase the unresolved historical record.

This must never be represented as CONFIRMED_NO_EFFECT.

## 3. External cross-check
AWS reliability guidance recommends graceful degradation, limiting retries and queues, timeouts and emergency levers as ways to keep distributed failures from propagating. This supports the general resilience pattern of reducing reachable harmful behavior while dependencies are unhealthy, but does not prove Nexo's safety state. citeturn0search1turn0search5

TLA+ treats safety as an invariant over reachable states; a state may therefore be safe even when liveness has not been established. TLA+ also distinguishes safety checking from liveness/fairness. citeturn0search4turn0search11

## 4. Candidate absorbing-state contract
A SAFE_QUARANTINED_UNKNOWN state is admissible only if all of the following are proven for the EffectClass:
A1 protected future execution is fenced;
A2 resource-side enforcement rejects stale actors where required;
A3 downstream queues/retries/children cannot create an unbounded protected effect, or are independently fenced/bounded;
A4 no automatic retry/compensation can escape the quarantine boundary;
A5 authority cannot be restored from the quarantined state itself;
A6 recovery ownership remains distinct from execution authority;
A7 the state survives crash/restart/restore without regression of fences;
A8 resource incarnation changes do not silently erase the quarantine relation;
A9 later reconciliation can still bind observations to the original effect identity/history;
A10 the state cannot be mistaken for NO_EFFECT or CONFIRMED_REJECTED;
A11 decommission preserves or explicitly closes the historical uncertainty according to the claim requirements;
A12 any exit requires a fresh protected release decision under current context.

## 5. Absorbing does not mean immutable
The safety barrier should be absorbing with respect to unsafe normal execution, but not necessarily with respect to knowledge acquisition.

Allowed:
SAFE_QUARANTINED_UNKNOWN → RECONCILIATION → VERIFIED / STILL_UNKNOWN / CONFLICT

Forbidden without a fresh release proof:
SAFE_QUARANTINED_UNKNOWN → NORMAL_EXECUTION

Thus “absorbing” means no unsafe escape, not “nothing can ever change.”

## 6. Bounded uncertainty
The architecture should track whether uncertainty remains bounded in three dimensions:
- effect dimension: which effects may still happen;
- resource dimension: which resources/incarnations may still be affected;
- temporal dimension: whether autonomous retries/queues can continue indefinitely.

Candidate predicate:
BOUNDED_UNCERTAINTY = finite/controlled reachable protected-effect set + explicit expiry/termination semantics + preserved identity/history + enforceable fence.

If any dimension is UNKNOWN and unbounded, SAFE_QUARANTINED_UNKNOWN cannot be claimed merely from local STOP.

## 7. Safe absorbing state versus quarantine forever
A permanent quarantine may preserve safety but violate liveness. TLA+ explicitly distinguishes safety from liveness; an algorithm can satisfy safety while never making progress. citeturn0search11

Therefore two separate claims are required:
SAFETY: no forbidden effect escapes the barrier.
LIVENESS: reconciliation/recovery eventually reaches an admissible terminal outcome under explicit fairness/availability assumptions.

Failure to prove liveness must not be converted into a safety failure, but neither may indefinite quarantine be advertised as successful recovery.

## 8. Candidate exit states
From SAFE_QUARANTINED_UNKNOWN:
1 VERIFIED_OUTCOME — claim-adequate evidence resolves the original effect.
2 VERIFIED_SAFE_ABSORBING — history remains unknown but the safety claim is permanently bounded by the effect-class contract.
3 CONFLICT — evidence is inconsistent.
4 DECOMMISSIONED_WITH_UNRESOLVED_HISTORY — system/resource is intentionally retired while historical uncertainty is preserved.
5 QUARANTINED_INDEFINITELY — no safe resolution or bounded terminal contract exists.

These are candidate semantics, not final canonical state names.

## 9. Critical distinction: safe current state vs historical truth
Example:
E1 = UNKNOWN.
Resource is fenced and physically/externally unable to accept further E1-class effects.

It is legitimate to claim:
“Future E1-class execution is blocked under the verified fence.”

It is NOT legitimate to claim:
“E1 never happened.”

Therefore the absorbing state can satisfy a safety claim while the historical world-truth claim remains UNKNOWN.

## 10. Resource replacement
Replacement must inherit a safety barrier without inheriting false history.

Old incarnation I7: E1 UNKNOWN.
New incarnation I8: current and fenced.

I8 being safe does not resolve whether E1 happened on I7.
The safety barrier may transfer only as a new current control condition, while historical uncertainty remains attached to I7.

## 11. Decommission
Decommission can terminate the possibility of future effects, but cannot automatically erase history.

Candidate rule:
DECOMMISSIONED_WITH_UNRESOLVED_HISTORY may satisfy a bounded safety claim only if all protected future paths are permanently closed and the required historical record/uncertainty is durably preserved.

If the claim requires proving NO_EFFECT, decommission does not supply that proof.

## 12. Recovery and release
A quarantined state cannot grant its own release.

Release requires:
CURRENT_IDENTITY
+ CURRENT_AUTHORITY
+ CURRENT_POLICY/INVARIANT
+ CURRENT_FENCE
+ CURRENT_DEPENDENCY_CLOSURE
+ CLAIM_ADEQUATE_EVIDENCE
+ EFFECT_CLASS_RECOVERY_CONTRACT
+ PROTECTED_RELEASE_LINEARIZATION

If historical outcome remains UNKNOWN, the release contract must explicitly tolerate that UNKNOWN. Otherwise release is blocked.

## 13. Candidate invariants
INV-SAU-01 UNKNOWN world truth is never rewritten as NO_EFFECT merely because the system is quarantined.
INV-SAU-02 A safe absorbing state blocks unsafe future effects, not historical uncertainty.
INV-SAU-03 Quarantine cannot self-authorize release.
INV-SAU-04 Safety of quarantine requires resource/downstream enforcement for every relevant effect path.
INV-SAU-05 Unbounded autonomous downstream work prevents claiming bounded uncertainty until fenced or otherwise bounded.
INV-SAU-06 Crash/restart/restore cannot regress the quarantine barrier.
INV-SAU-07 Resource replacement creates a new incarnation and does not erase old uncertainty.
INV-SAU-08 Decommission does not prove historical absence.
INV-SAU-09 Exit from quarantine requires a fresh protected decision.
INV-SAU-10 Safety and liveness claims remain separate.
INV-SAU-11 A safe current-state claim cannot be promoted to a historical world-truth claim.
INV-SAU-12 If the effect class lacks a proven bounded-safe terminal state, unresolved UNKNOWN remains HOLD/QUARANTINE.

## 14. Architectural consequence
The clean architecture likely needs a distinction between:
- WORLD_TRUTH_STATUS;
- SAFETY_BARRIER_STATUS;
- RECOVERY_PROGRESS;
- RELEASE_ELIGIBILITY.

One boolean such as `resolved=true` is semantically unsafe.

A candidate derived relationship is:
RELEASE_ELIGIBLE = current authority/fence/context valid AND required claim satisfied AND no forbidden unresolved uncertainty.

It must not be:
RELEASE_ELIGIBLE = quarantine == false.

## 15. Research conclusion
A SAFE_QUARANTINED_UNKNOWN state is architecturally plausible and useful, but it is not a universal solution. It is a claim-specific safety barrier whose validity depends on complete effect-path closure, enforceable fencing, bounded downstream behavior, durable continuity and a defined recovery/decommission contract.

The key distinction is:
RESOLVE_UNKNOWN = learn what happened.
CONTAIN_UNKNOWN = make unresolved history unable to create prohibited future effects.

Nexo may be able to contain an UNKNOWN without resolving it, but must never confuse containment with truth.

## 16. Next attack
ATTACK THE ABSORBING STATE ITSELF:
- fence store rollback;
- quarantine-state rollback;
- resource restart with default-open behavior;
- hidden downstream retry after quarantine;
- delayed message after quarantine;
- old actor after recovery ownership transfer;
- decommission followed by resource resurrection;
- split-brain quarantine decisions;
- loss of continuity root;
- second crash during quarantine establishment.

Goal: determine whether SAFE_QUARANTINED_UNKNOWN can itself be made monotonic across crash, rollback, restart and resurrection, or whether it requires an independent continuity/fencing root.

DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED.

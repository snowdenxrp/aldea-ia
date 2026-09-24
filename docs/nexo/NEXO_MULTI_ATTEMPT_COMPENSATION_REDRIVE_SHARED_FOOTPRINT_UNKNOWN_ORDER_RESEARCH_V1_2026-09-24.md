# NEXO MULTI-ATTEMPT + COMPENSATION + REDRIVE + SHARED FOOTPRINT + UNKNOWN ORDER — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution.

## Core result

A stable EffectIdentity is necessary for correlation, but it is not sufficient for concurrency safety.

The architecture must distinguish:
EFFECT_IDENTITY → ATTEMPT_SET → EFFECT_INTERACTION_GRAPH → UNCERTAINTY_SET → CAUSAL_ORDER → CURRENT_FENCE/BOUNDARY → WORLD_EFFECT_STATE

Key rule: SAME_EFFECT != SAME_ATTEMPT != SAME_WORLD_EVENT.
IDEMPOTENCY != COMMUTATIVITY != SERIALIZABILITY != COMPENSABILITY.

## External cross-check

AWS Step Functions explicitly treats redrive as a state transition, preserves successful history, reruns unsuccessful work, and can reset retry counts on redrive. This demonstrates that one logical execution can contain multiple attempts and mixed historical/current work. AWS also documents that after a timeout the caller may not know whether a side effect occurred and that reconciliation may be required. citeturn0search0turn0search2turn0search3

## Adversarial sequence

E1/A1 admitted → external attempt → timeout → E1 UNKNOWN → provider continues A1 → recovery starts A2 → A2 shares footprint with A1 → A2 partially succeeds → compensation C1 admitted → provider redrives A1 → resource fence advances → child queue remains active → resource R1 replaced by R2 → late observations arrive in conflicting order → recovery crashes → second recovery resumes.

## Findings MAR-01..MAR-36

1. Same logical effect can have multiple concurrent attempts.
2. Effect identity correlates attempts; it does not serialize them.
3. Idempotency can suppress duplicate side effects only under the provider's defined identity scope and semantics.
4. Idempotency does not imply commutativity.
5. Idempotency does not imply isolation.
6. Idempotency does not prove compensation is safe.
7. Compensation is a new protected effect with its own identity, authority, fence and evidence.
8. A compensation can race an original attempt.
9. A compensation can enlarge the uncertainty set.
10. Retry/redrive can race compensation.
11. UNKNOWN_ORDER is distinct from UNKNOWN outcome.
12. If causal order can affect the protected invariant, UNKNOWN_ORDER blocks strong claims requiring that order.
13. A later observation cannot be used to invent an earlier causal order.
14. Provider event timestamps are not automatically authoritative serialization order.
15. Message arrival order is not protected effect order.
16. Two successful observations may both be true while their ordering remains unknown.
17. A resource-side fence can reject stale future attempts but cannot reconstruct historical order.
18. A new fence generation does not prove that old queued work was never executed.
19. Queues, callbacks, retries, redrives and child workflows are part of the effect path when they can still produce protected effects.
20. Shared physical footprint defeats naive decomposition even when logical effect IDs differ.
21. Shared provider state can couple otherwise separate effects.
22. Shared authorization, trust roots or recovery domains can create coupling even when resources differ.
23. Resource replacement creates a new incarnation and invalidates incompatible bindings, but does not erase old history.
24. A compensation against R2 cannot automatically compensate an uncertain effect on R1.
25. Compensation under joint uncertainty is admissible only if the action is safe across every allowed world in the uncertainty set.
26. If compensation is safe in one possible world but harmful in another, UNKNOWN blocks that compensation.
27. Repeated recovery must not issue the same compensation merely because previous issuance is uncertain.
28. Compensation itself needs stable identity and reconciliation.
29. A provider may redrive an original operation after local compensation; the interaction contract must account for this.
30. STOP can block new Nexo-controlled effects but does not necessarily cancel autonomous provider continuations.
31. Resource fencing must cover all actual effect paths, not merely the main API path.
32. Safe absorption can reduce future risk only if all relevant continuation paths are covered.
33. Partial reconciliation leaves joint uncertainty unresolved.
34. Conflicting observations can produce a set of possible histories rather than a single chosen history.
35. Recovery should prefer safe non-convergence to a guessed causal order.
36. A strong claim requires enough evidence to establish both outcome and the causal/interaction properties demanded by that claim.

## New object: AttemptSet

Candidate fields: effect_id, attempts, active_attempts, completed_attempts, unknown_attempts, provider_continuations, child_effects, compensation_effects, current_context, interaction_graph, uncertainty_set, causal_order_state, reconciliation_state.

AttemptSet is not authority. It is durable representation of execution history and uncertainty.

## New object: EffectInteractionContract

For every pair/group of potentially overlapping effects: effect identities, footprint intersection, interaction class, required ordering, mutual exclusion, commutativity, compensation relationship, shared fence, shared resource incarnation, shared queue/provider, shared authority/recovery, required causal evidence and claim impact.

Interaction classes: DISJOINT, COMMUTATIVE, ORDER_SENSITIVE, MUTUALLY_EXCLUSIVE, CONDITIONALLY_COMPATIBLE, CONFLICTING, UNKNOWN.

UNKNOWN is not equivalent to DISJOINT.

## New object: CausalOrderClaim

A claim about order must specify events/effects, order relation, authority domain providing the order, evidence source, clock assumptions, partition assumptions, dependency assumptions, resource incarnation, status and invalidation conditions.

States: ORDER_KNOWN, ORDER_PARTIAL, ORDER_UNKNOWN, ORDER_CONFLICTING.

## Joint uncertainty

Instead of independent U(E1)+U(E2), use U(E1,E2,C1,...), because possible histories include interactions.

Candidate predicate: SAFE_UNDER_JOINT_UNCERTAINTY(A,U,C) requires the proposed action to preserve the required invariant for every allowed world/history and relevant causal relation in U.

## Compensation rule

No generic UNKNOWN → COMPENSATE and no generic UNKNOWN → RETRY.

Decision must evaluate original effect class, attempt set, provider continuation, idempotency semantics, interaction contract, resource incarnation, current fence, current authority, STOP state, causal order, compensation semantics, uncertainty set and claim requirements.

If no action is safe across all relevant worlds: HOLD/QUARANTINE.

## Example uncertainty set

After E1 timeout:
W1 only A1 happened.
W2 A1 did not happen.
W3 A1 happened and provider retry remains queued.
W4 A1 happened and A2 happened.
W5 A1 happened and C1 happened.
W6 A1 did not happen, A2 happened, then C1 happened.
W7 A1 happened on R1 and A2 happened on R2.
W8 A1 and A2 both happened but order is unknown.

A compensation safe in W2 may be harmful in W1. Therefore UNKNOWN alone cannot select it.

If a fence/absorption action is safe in every allowed world and prevents further protected effects, it may be admissible even though historical classification remains UNKNOWN.

## Race matrix

A1 vs A2 same effect → attempt interaction analysis.
A1 vs compensation → new protected effect + joint uncertainty.
A1 vs provider redrive → provider continuation in closure.
A2 vs resource replacement → new incarnation validation.
Compensation vs redrive → interaction contract.
STOP vs queued retry → boundary/resource enforcement.
Fence vs in-flight A1 → fence semantics + historical uncertainty.
Recovery vs second recovery → recovery ownership/fencing.
Observation vs observation → evidence conflict/causal-order analysis.
Restore vs old attempt → continuity/context validation.

## Candidate invariants INV-MAR-01..22

INV-MAR-01 Effect identity does not serialize attempts.
INV-MAR-02 Every attempt has a distinct attempt identity.
INV-MAR-03 Compensation is a new protected effect.
INV-MAR-04 Retry/redrive is a new protected transition.
INV-MAR-05 Idempotency does not imply commutativity.
INV-MAR-06 Idempotency does not imply compensability.
INV-MAR-07 UNKNOWN_ORDER is distinct from UNKNOWN_OUTCOME.
INV-MAR-08 Unknown causal order cannot be invented from arrival order.
INV-MAR-09 Resource fences block only paths that actually enforce them.
INV-MAR-10 Fence advancement does not classify historical effects.
INV-MAR-11 Provider continuations are part of effect-path closure.
INV-MAR-12 Child/queue/callback paths are included when effect-capable.
INV-MAR-13 Resource incarnation changes invalidate incompatible bindings.
INV-MAR-14 Compensation must be evaluated over joint uncertainty.
INV-MAR-15 A compensation unsafe in any allowed world is not admissible under unresolved uncertainty.
INV-MAR-16 Repeated recovery cannot duplicate an uncertain compensation.
INV-MAR-17 Compensation has its own identity and reconciliation.
INV-MAR-18 STOP does not prove historical quiescence.
INV-MAR-19 Partial reconciliation preserves unresolved uncertainty.
INV-MAR-20 Conflicting evidence cannot be silently collapsed.
INV-MAR-21 Safe absorption may reduce future risk without resolving historical outcome.
INV-MAR-22 Strong claims require claim-adequate outcome and interaction/order evidence.

## Formal model extension

Objects: AttemptSet, EffectInteractionContract, CausalOrderClaim, CompensationEffectBinding, ProviderContinuation, JointUncertainty.

Relations: Overlaps, ConflictsWith, CommutesWith, RequiresOrder, Compensates, Continues, Redrives, FencedBy, TargetsIncarnation, ExpandsUncertainty.

Candidate safety property:
ADMIT(a) => CURRENT_CONTEXT(a) AND CURRENT_AUTHORITY(a) AND INTERACTION_ALLOWED(a, AttemptSet, CausalOrder)

Candidate compensation property:
COMPENSATE(c) => SAFE_UNDER_JOINT_UNCERTAINTY(c,U)

Candidate strong claim:
VERIFIED(effect_group, claim) => outcome_known AND required_order_known AND interaction_constraints_satisfied, unless the claim contract explicitly permits unresolved order.

## Mini-audit

A: A1 and A2 both succeed on the same non-idempotent resource → classify as potentially two world events.
B: A1 succeeds, C1 compensates, then A1 redrive arrives → C1 does not erase A1; redrive is a new interaction.
C: A1 and A2 both succeed but order is unknown → outcome may be known while causal-order claim remains UNKNOWN.
D: Fence advances after A1 → blocks stale future effects only if enforced; does not prove A1 stopped.
E: Recovery sees old checkpoint saying A1 failed → historical checkpoint cannot override current external evidence.
F: R1 replaced by R2 → R2 is a new incarnation; old evidence remains R1-bound.
G: Compensation is safe only if A1 did not happen → UNKNOWN blocks compensation.
H: Absorbing fence state is safe in every possible world → may be admissible without resolving A1 history, subject to boundary completeness.

## Major architectural consequence

EffectIdentity must no longer be the central unit of concurrency.

The central unit becomes:
EFFECT + ATTEMPT SET + INTERACTION GRAPH + UNCERTAINTY SET + ENFORCEMENT BOUNDARY.

The clean architecture therefore needs three related structures:
1. EFFECT_IDENTITY_GRAPH
2. EFFECT_INTERACTION_GRAPH
3. UNCERTAINTY/CAUSALITY GRAPH

The second and third determine whether independent processing is actually safe.

## Remaining gaps

G-MAR-01 formal joint uncertainty state explosion.
G-MAR-02 scalable interaction-graph computation.
G-MAR-03 causal-order evidence model.
G-MAR-04 provider-specific redrive semantics.
G-MAR-05 compensation proof per effect class.
G-MAR-06 dynamic shared-footprint discovery.
G-MAR-07 fence coverage of child/queue paths.
G-MAR-08 formal refinement and TLC/SANY.
G-MAR-09 fault injection with concurrent attempts.
G-MAR-10 long-duration retry/redrive/compensation races.

## Next attack

JOINT UNCERTAINTY STATE-SPACE REDUCTION + INTERACTION-GRAPH CLOSURE + SAFE ABSORPTION

Question: Can Nexo reduce an enormous uncertainty space without accidentally deleting a possible world in which a safety violation occurs?

Research gate remains closed: no V21 implementation, no runtime correctness claim, no formal-verification claim.

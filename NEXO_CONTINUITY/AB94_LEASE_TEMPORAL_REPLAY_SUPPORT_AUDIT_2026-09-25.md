# AB94 — LEASE TEMPORAL / REPLAY SUPPORT AUDIT — 2026-09-25

Status: RESEARCH ONLY.

External check: Lamport's refinement material confirms history variables may be necessary to preserve past behavior in refinement; behavior is not established by current-field equality alone. citeturn0search12turn0search13

## Recovered evidence

AB18 (commit 321fc62a8e648809702f2747a89755208f6d9227) defines the candidate complete LeaseBridge with:
- freshness/temporal validity;
- replay binding;
- authority/policy/delegation/incarnation bindings;
- attempt binding;
and states that no component can be safely omitted unless an adversarial pair proves identical P_AA behavior.

AB49 separately permits lease interval, expiry, renewal, consumption and replay as HistorySupport primitives.

Searches for explicit canonical artifacts named around lease replay/consumption/expiry did not recover a dedicated P_AA transition law. This is search evidence only, not proof of nonexistence.

## Audit

1. Expiry/interval
Current bridge fields can be equal while a hidden expiry/order distinction exists.
SAFE REMOVAL: NOT ESTABLISHED.

2. Replay/consumption
AB18 explicitly treats ReplayBinding as part of complete bridge semantics.
SAFE REMOVAL: NOT ESTABLISHED.

3. Renewal
AB84–AB87 already established renewal legality/post-state/bridge replacement semantics as UNKNOWN.
SAFE REMOVAL: NOT ESTABLISHED.

4. Temporal order
AB88/AB92 establish claim-relevant order.
SAFE REMOVAL: NOT JUSTIFIED.

## Key result

The evidence supports retaining lease temporal/replay support in the bounded P_AA support language.

It does NOT prove each primitive is independently minimal.

No complete legal future separator was recovered for a pure replay/consumption dimension, so the epistemic result remains UNKNOWN rather than collision-found.

## State

LEASE_TEMPORAL_REPLAY_SUPPORT = REQUIRED_OR_UNKNOWN
CONCRETE_REPLAY_SEPARATOR = NOT_ESTABLISHED
TERNARY_PAA_COLLISION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
EXECUTION = NOT_VERIFIED

## Next exact action

Attack replay identity separately: construct the smallest bounded pair with identical current lease/bridge fields but different prior consumption, then search for a recovered legal transition that reads replay state. If none exists, test whether replay state is reconstructible from the canonical event/order support without adding an oracle.

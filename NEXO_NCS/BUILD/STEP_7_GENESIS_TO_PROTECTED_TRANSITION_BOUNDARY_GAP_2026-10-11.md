# STEP 7 — Genesis-to-Protected-Transition Boundary Gap — 2026-10-11

Status: SOURCE-INSPECTED GAP — NO GENESIS WIRING — IMPLEMENTATION STOP

## Question
Can the current protected-transition implementation serve as the actual verifier/final enforcement boundary for the first constitutional transition, making the draft human-genesis assumptions actionable?

## Source evidence inspected

- `src/nexo/core/protected-transition.mjs` — exports `executeProtectedTransition()`; it asks injected `ports.authorityGate.check(claim)`, then handles AUTHORITY/STOP/UNKNOWN, isolation, candidate execution, final semantic validation, conditional commit and outcome classification.
- `src/nexo/core/contracts.mjs` — `createAuthorityResult()` constructs a status/reasons/evidence object from supplied inputs. `createClaimEnvelope()` similarly validates structural fields; neither function establishes the legitimacy of its caller or authority source.
- `NEXO_NCS/BUILD/STEP_3B_PROTECTED_TRANSITION_2026-10-08.md` — describes the composition and its limits; external irreversible effects, distributed fencing, power-loss durability and production safety are not established.
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md` and `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md` — require a previously recognized trust foundation and explicitly stop implementation while that foundation is missing.

## Findings

1. The protected-transition function is a generic composition boundary, not an implemented genesis recognizer. Its authority gate is an injected port; this code does not define who independently legitimizes that gate or how its trust basis is established.
2. Structural creation of an `AuthorityResult` is not proof of authority. A caller can supply a status-shaped object; the semantic source and protected provenance must be established elsewhere.
3. The conditional commit in this composition is an application-state commit boundary. The inspected contract does not prove that it is the last boundary for constitutional commissioning or any external/physical effect.
4. The code's fail-closed handling of supplied STOP/UNKNOWN results is useful, but cannot prove the gate will correctly produce those results when its own root, verifier, currentness or provenance is compromised.
5. Therefore, the current implementation cannot yet be named the independent verifier or final protected-effect boundary required by IR-1. Reusing it without a justified AuthorityGate would only move the missing root into an injected dependency.

## Consequence for the two candidate paths

- **Path H:** accepting a bounded environmental assumption set would not make the current generic gate independently legitimate. At minimum, a concrete genesis-specific AuthorityGate/verifier and an identified last enforcement boundary still need to be designed, attacked and evidenced before any protected transition.
- **Path O:** an out-of-band basis would still need a verifier and final effect boundary that consume it under justified rules. The current generic composition can potentially be reused as a downstream safety composition only after that upstream authority contract exists; it is not itself the root.
- **Current protected-transition code must not be altered to hide this gap.** No new wrapper, root registry, constructor or generic trust engine is justified by this finding.

## Decision

The current concrete implementation evidence does **not** justify asking Kevin to accept Path H yet: the threat assumptions can be described, but the verifier and final enforcement boundary needed to make the choice meaningful are not established.

### Next bounded action

Use the existing AuthorityGate port and Genesis Trust Foundation contract to map the smallest required trust data/control path:
1. recognized basis → genesis-specific verification result;
2. exact Constitution/context + explicit owner approval → content-bound claim;
3. freshness/currentness/lifecycle checks;
4. protected authority decision consumed by the transition;
5. actual last enforcement boundary and bypass closure;
6. failure result → enforced no-transition.

For each edge, identify an existing implemented component or mark it UNKNOWN; do not invent an implementation or add a new abstraction just to fill the table. If the final boundary is not currently a concrete Nexo deployment target, preserve that as an explicit missing deployment decision.

## Disposition

Genesis Trust Foundation: UNKNOWN. IR-1: NOT ESTABLISHED. Generic protected-transition composition: exists, but is not a demonstrated genesis trust root or final external-effect boundary. Constitution Authority Context implementation and protected commissioning remain STOP. Non-protected design may continue.

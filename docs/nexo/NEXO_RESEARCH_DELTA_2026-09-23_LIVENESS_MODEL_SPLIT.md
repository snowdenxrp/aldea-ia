# Nexo Research Delta — liveness model split and configuration discipline

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Research findings
1. TLC model configuration explicitly separates invariants from temporal properties. Temporal properties can express liveness, and fairness is part of the behavior specification rather than an ordinary state invariant.
2. TLC's liveness checking explores behaviors, not merely reachable states, and can become substantially more expensive than safety checking. This supports using separate finite configurations for safety and liveness.
3. Symmetry is unsuitable for the liveness configurations documented by current TLA+ guidance. Therefore Nexo should not carry a safety-model optimization into a liveness model without a separate justification.
4. A liveness model should explicitly document its fairness formula and every environmental assumption that makes the progress claim meaningful.
5. A refinement chain can therefore have distinct evidence at each boundary: safety refinement and liveness refinement. A safety-passing configuration must not be presented as evidence of eventual progress.

## Nexo verification consequence
The eventual verification package should contain at least:
- `SAFETY_MODEL.cfg` — invariants, exact finite constants, deadlock policy, no unqualified symmetry for critical claims.
- `LIVENESS_MODEL.cfg` — temporal properties, explicit fairness assumptions, smaller finite constants where needed, and documented environment assumptions.
- `REFINEMENT_MODEL.cfg` — concrete-to-abstract mapping/step-simulation checks for the selected finite instance.

These are proposed evidence boundaries, not yet implemented artifacts.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

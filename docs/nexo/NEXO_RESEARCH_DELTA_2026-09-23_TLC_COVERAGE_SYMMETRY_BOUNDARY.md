# Nexo Research Delta — TLC coverage and symmetry boundary

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Findings
TLC's normal model-checking mode explores the reachable state graph of the configured model; the model itself chooses the behavior specification, properties to check, and constant substitutions. citeturn0search3turn0search9 TLC reports state-space statistics such as states found, distinct states, diameter, and queue size, and action statistics can reveal next-state sub-actions that never become enabled—an important warning sign for an incorrectly encoded model. citeturn0search0

TLC can use symmetry sets to collapse equivalent states, potentially reducing the checked state space substantially. However, the documented guarantee is scoped: invariant/implied-init/implied-action checking can remain correct when the symmetry assumptions actually hold, while some temporal checking can be problematic with symmetry. citeturn0search25

## Nexo implications
1. `STATES_CHECKED` must never be presented as `MODEL_COVERAGE` without the exact model configuration and state-space boundary.
2. A successful TLC run is evidence about the configured finite model, not automatically about every production configuration or an unbounded system.
3. Zero-enabled actions are not harmless telemetry: they can indicate an incorrectly encoded transition and therefore should become an explicit model-quality finding.
4. Symmetry is a state-space reduction assumption, not merely a performance optimization. The evidence record must identify the symmetry set and the properties for which symmetry was considered valid.
5. If temporal properties are checked under symmetry, the evidence status must explicitly capture the documented limitation rather than treating the result like an ordinary invariant result.
6. Model fingerprints must include constants, constraints, behavior spec, checked properties, symmetry configuration, and relevant TLC options so two runs cannot be incorrectly treated as equivalent.
7. Coverage metrics are evidence about exploration, not proof of semantic completeness. They should remain separate from deductive proof status.

## Proposed evidence dimensions
`MODEL_CONFIGURATION_ID`
`MODEL_FINGERPRINT`
`STATE_SPACE_BOUNDARY`
`STATES_FOUND`
`DISTINCT_STATES`
`DIAMETER`
`ACTION_ENABLEMENT_COVERAGE`
`SYMMETRY_CONFIGURATION`
`PROPERTY_SET`
`TLC_VERSION`
`RESULT_STATUS`

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

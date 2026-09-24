# Nexo Research Delta — refinement chain and stuttering discipline

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
Current TLA+ refinement guidance states that refinement is semantic: every behavior of the lower-level specification must be permitted by the higher-level specification. It also confirms that stuttering steps are explicitly allowed and that a refinement mapping can be checked with TLC when the concrete spec defines the mapped abstract state. citeturn0search0turn0search24 Lamport's current material gives the step-simulation form: under an invariant, every concrete Next step must correspond to an abstract Next step or leave the mapped abstract variables unchanged. citeturn0search22

## New conclusions for Nexo
1. The eventual refinement chain can legitimately have more than two levels. A practical structure is semantic contract → canonical abstract state machine → concrete coordination protocol → implementation-facing model.
2. Each boundary needs its own mapping and step-simulation obligations; one giant mapping at the end would make failures hard to localize.
3. Stuttering must be scoped to the mapped abstract variables. An internal concrete action may be invisible at one abstraction level while still changing state that is relevant at a lower level.
4. The mapping must preserve safety-critical identities and epochs; collapsing them too early can hide cross-operation or stale-owner bugs.
5. TLC can check a refinement property for a configured finite model, but the result remains bounded by that concrete/abstract pair and its configuration. It does not establish implementation correctness by itself. citeturn0search0turn0search5
6. The TLA+ examples repository includes concrete examples using refinement mappings and transaction-commit specifications, supporting this as an established modeling pattern rather than an ad-hoc Nexo invention. citeturn0search3

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

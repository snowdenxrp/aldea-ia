# Nexo Research Delta — proof obligation granularity

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLA+ proof literature describes inductive invariants as something that can first be tested as ordinary invariants and then proved through separate proof obligations; the same material emphasizes that small-model TLC checks can find simple invariant errors but do not by themselves provide confidence for the general proof. citeturn0search2

## New conclusions
1. Nexo's future proof artifacts should be decomposed into named obligations rather than one monolithic safety property.
2. Each obligation should identify: statement, state variables it constrains, transition family it protects, assumptions, proof method, model scope, and dependencies on other obligations.
3. A failed obligation should not invalidate unrelated historical evidence, but it must block any aggregate claim that depends on it.
4. Dependency graphs between proof obligations should be explicit. Example: `NoStaleOwnerAction` may support `NoUnauthorizedRelease`, while `NoUnauthorizedRelease` alone does not prove `NoExternalEffect`.
5. This prevents a common logical compression error: proving a local coordination property and treating it as proof of an external-world property.
6. For Nexo, proof layers should remain separated at least as:
   - coordination safety;
   - authority safety;
   - evidence/binding safety;
   - emergency-stop safety;
   - recovery/restart safety;
   - external-effect reconciliation safety;
   - implementation refinement.
7. An aggregate verification claim can only be emitted when all required prerequisite obligations are present and compatible with the same model boundary/version.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

# Nexo Research Delta — liveness scope and counterexample discipline

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLC liveness checking analyzes temporal properties over the behavior graph and can produce counterexamples involving cycles that violate eventual-progress claims. The TLA+ configuration format keeps temporal `PROPERTIES` separate from `INVARIANTS`, while `SYMMETRY` cannot be used when checking liveness. citeturn0search0turn0search2 Lamport's material recommends keeping the safety part central and treating liveness/fairness as a distinct layer of the specification. citeturn0search15turn0search14

## New conclusions
1. A liveness counterexample must be classified before changing the model: genuine protocol deadlock/starvation, missing fairness assumption, invalid environment assumption, or an intentional infinite execution.
2. We must not “repair” liveness by weakening safety or by adding fairness without identifying why the fairness assumption is legitimate.
3. For Nexo, a useful liveness counterexample should preserve the concrete history needed to explain why takeover, reconciliation, or recovery failed to progress.
4. Safety counterexamples and liveness counterexamples should be stored as different evidence classes because their semantics and remediation differ.
5. Future TLC records should capture the exact configuration and the counterexample trace/cycle when a property fails; a failed liveness run is useful engineering evidence, not merely a failed verification.
6. This further supports separate safety/liveness model configurations and an explicit environmental-assumption ledger.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

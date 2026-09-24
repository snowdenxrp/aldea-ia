# Nexo Research Delta — fairness and liveness discipline

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Findings
1. TLA+ distinguishes safety from liveness. Invariants cover state safety, while temporal properties express behavior over executions; liveness commonly needs fairness assumptions. citeturn0search2turn0search1
2. Weak fairness means an action that remains enabled cannot be postponed forever; strong fairness also covers actions that become enabled infinitely often. citeturn0search0turn0search25
3. Fairness is an assumption about behavior, not a proof that the underlying implementation scheduler, clock, network, or coordination primitive actually provides that fairness.
4. TLC handles liveness differently from ordinary invariants and liveness checking is more expensive; separate smaller liveness models can therefore be appropriate. citeturn0search2
5. TLA+ specs are stutter-invariant by default. Therefore adding fairness is a deliberate restriction of allowed behaviors; it must not be used merely to make an undesirable starvation trace disappear. citeturn0search2turn0search26

## Nexo implications
- Safety properties must remain valid without relying on fairness assumptions wherever possible.
- Liveness claims such as lease takeover, recovery progress, reconciliation progress, or eventual release must explicitly state their environmental assumptions.
- We must distinguish `SAFETY_PROVED_UNDER_MODEL` from `LIVENESS_PROVED_UNDER_FAIRNESS_ASSUMPTIONS`.
- For leases, fairness cannot manufacture a valid clock, network, storage, or atomic acquisition primitive; those remain implementation obligations.
- A liveness failure should not be “fixed” by adding arbitrary fairness. First determine whether the environment legitimately guarantees the enabling condition.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

# Nexo Research Delta — refinement requires step simulation

Date: 2026-09-23

## Scope
Research-only continuation of the established formal-verification direction. No V21 implementation or architectural redirection.

## Cross-check
Lamport's current TLA+ material describes refinement proofs in terms of a refinement mapping plus an invariant and step simulation: each concrete `Next` step must correspond to an abstract `Next` step, or leave the mapped abstract state unchanged (stuttering). citeturn0search21turn0search25 Auxiliary variables may be needed to make that mapping expressible without changing the behavior of the implementation specification. citeturn0search22turn0search24

## Nexo conclusions
1. A future canonical-to-concrete proof cannot be only a variable mapping. It needs explicit transition correspondence.
2. Every concrete critical transition must map to either an allowed abstract transition or a permitted stuttering step.
3. For Nexo, the critical transition families are admission, lease acquire/takeover/expiry, execution, evidence observation/verification, STOP, authority revocation/reauthorization, release authorization, release/commit and reconciliation.
4. A concrete implementation may split one abstract action into several concrete steps, but the mapping must show that intermediate states do not violate the abstract safety contract.
5. History/stuttering variables may be appropriate for reconstructing ordering and proving correspondence; they must remain clearly distinguished from authoritative system state.
6. This gives a sharper criterion for the eventual formal correspondence artifact: `STATE MAPPING + INVARIANT + STEP SIMULATION + STUTTERING RULES`, not merely matching names or schemas.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

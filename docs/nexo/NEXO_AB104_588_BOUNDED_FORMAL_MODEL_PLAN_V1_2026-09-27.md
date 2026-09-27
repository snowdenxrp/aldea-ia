# NEXO — AB104.588 — Primer modelo formal acotado

Date: 2026-09-27
Status: MODELING RESEARCH — NOT PRODUCTION IMPLEMENTATION

## Research basis
TLA+ is intended for precise modeling of concurrent/distributed systems. TLC is an explicit-state model checker that can check safety and liveness properties and report counterexample traces. citeturn0search0turn0search2
Lamport explicitly describes invariant checking as a way to find errors and deadlock as a reachable state in which no next action is enabled. citeturn0search12

## Modeling boundary
The first model MUST be deliberately small. It should model the semantics that have accumulated through AB104.568–587, not the future implementation architecture.

Suggested finite domains:
- Effects: {E1,E2}
- Providers: {P1,P2}
- Incarnations: {I1,I2}
- Authority: {VALID,INVALID}
- Fence: {F1,F2}
- Outcome: {NONE,COMMITTED,NOT_COMMITTED,UNKNOWN}
- Admission: {NONE,VALID,STALE}
- Dependency: {CLEAR,UNKNOWN}
- Compensation: {NONE,PENDING,COMMITTED,UNKNOWN}

## Initial model goals
Encode only these core actions:
1. CreateIntent
2. Admit
3. Queue
4. InvalidateAuthority
5. ChangeDependency
6. ChangeIncarnation
7. Execute
8. ObserveCommitted
9. ObserveNotCommitted
10. ObserveUnknown
11. ReconcileCommitted
12. ReconcileNotCommitted
13. StartCompensation
14. CommitCompensation

The model should permit adversarial interleavings between these actions.

## Safety properties
At minimum encode:
S1 UNKNOWN never directly enables duplicate execution.
S2 INVALID authority cannot create a new external mutation.
S3 STALE admission cannot execute.
S4 incarnation mismatch cannot target the new incarnation implicitly.
S5 COMMITTED cannot transition to NOT_COMMITTED by local rollback.
S6 required UNKNOWN dependency prevents dependent execution.
S7 compensation cannot erase original outcome.
S8 external commit is not inferred from local acknowledgement absence/presence alone when observation is ambiguous.

## What this model can establish
If TLC finds a counterexample, it identifies a flaw in the modeled transition system under the selected finite bounds.
If TLC finds no counterexample, that result is only for this exact model/domain/configuration. It is NOT proof of the Nexo architecture, production implementation, or arbitrary-size system. TLC is an explicit-state checker, and finite model checking has an explicit scope. citeturn0search0turn0search3

## Important correction
AB104.588 is the first point where formal modeling becomes an actual research artifact. No claim of verification is made yet because the model has not been executed.

## Next exact step
AB104.589 — write the minimal TLA+ specification/model artifact in the repository and run the available checker/tooling if accessible; record exact commands, model bounds, result, and any counterexample. If tooling is unavailable, record that limitation rather than claiming a run.
# Nexo Research Delta — fairness must not hide safety defects

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
Lamport's TLA material warns that arbitrary liveness formulas can accidentally impose safety constraints, and defines weak/strong fairness as explicit behavioral assumptions. Weak fairness requires an action that remains enabled to eventually occur; strong fairness covers actions that are enabled infinitely often. citeturn0search24turn0search25 TLA+ refinement is semantic: the implementation's behaviors must be allowed by the abstract specification, and refinement is stuttering-insensitive. citeturn0search0

## New conclusions
1. Fairness must be attached only to actions for which the environment genuinely guarantees eventual opportunity. It must never be added merely to suppress an undesirable counterexample.
2. Safety claims should remain valid independently of fairness assumptions whenever the architecture permits. This is especially important for STOP, authority fencing, stale-owner rejection, exact-effect binding and release authorization.
3. Liveness models should make their environment assumptions explicit: clock progress, storage availability, coordination availability, network recovery, and continued eligibility.
4. A lease can be safety-correct even if progress is impossible; liveness failure is a different defect. Conversely, a liveness assumption must never permit a safety-violating transition.
5. Future Nexo verification should therefore separate at least two evidence classes: `SAFETY_MODEL_RESULT` and `LIVENESS_MODEL_RESULT`, each with its own assumptions and configuration.
6. Refinement claims must preserve this separation: a concrete implementation cannot gain permission to violate an abstract safety property merely because a fairness assumption is present at a different verification layer.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

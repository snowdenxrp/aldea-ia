# Nexo Research Delta — TLC simulation vs exhaustive checking

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Findings
Official TLA+ tooling describes TLC as both an explicit-state model checker and simulator. In exhaustive model checking, TLC explores reachable states of the configured model; in simulation mode it randomly generates behaviors rather than enumerating all reachable states. citeturn0search0turn0search16 The simulation seed can make repeated runs reproducible, but simulation remains sampled behavior exploration rather than exhaustive state-space checking. citeturn0search18

State constraints also require careful interpretation: when TLC reaches a state violating a state constraint, it does not continue from that state, but it still treats the state as reachable and checks invariants there. Thus a constrained model establishes evidence only for the intentionally bounded exploration domain. citeturn0search11

## Nexo implications
1. `EXHAUSTIVE_TLC` and `TLC_SIMULATION` must be separate evidence methods; neither status should overwrite the other.
2. A simulation finding is valuable as counterexample evidence, even though simulation success cannot establish exhaustive absence of failures.
3. A fixed simulation seed belongs in reproducibility metadata, together with aril/depth and model configuration.
4. A state constraint is part of the semantic boundary, not merely a performance knob. The evidence record must preserve the constraint expression and its intended rationale.
5. A passing bounded model must be reported as bounded evidence; it must not be promoted to an unbounded safety or liveness claim.
6. Counterexamples found in either exhaustive or simulation mode should be first-class evidence and should invalidate/downgrade dependent claims according to the proof/evidence dependency graph.
7. For Nexo's lease, stop, recovery and external-effect models, small exhaustive models and separately seeded simulations can serve complementary purposes: exhaustive checking searches the configured finite graph; simulation samples longer or otherwise difficult behaviors.

## Proposed evidence distinction
`MODEL_CHECK_EXHAUSTIVE`
- reachable-state exploration within configured finite boundary
- exact configuration/fingerprint required

`MODEL_CHECK_SIMULATION`
- sampled behaviors
- seed/aril/depth required
- never equivalent to exhaustive coverage

`COUNTEREXAMPLE`
- independent result class that can invalidate a property regardless of whether it came from exhaustive or sampled exploration

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

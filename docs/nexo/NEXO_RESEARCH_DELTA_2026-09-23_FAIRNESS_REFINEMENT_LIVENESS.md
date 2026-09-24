# Nexo Research Delta — fairness, refinement and liveness

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
Lamport's TLA+ material states that a lower-level specification implementing a higher-level one is expressed as a refinement theorem, and that if the lower-level spec includes fairness, that fairness conjunct does not affect whether the implementation satisfies a safety property. citeturn0search24 TLA+ material also shows that liveness can fail under weak fairness when an action repeatedly becomes disabled; stronger fairness may be justified only when the system semantics actually warrant it. citeturn0search9 TLC configuration treats temporal properties separately from invariants and permits explicit model configuration of both. citeturn0search2

## New conclusions
1. Refinement evidence should explicitly separate safety refinement from liveness refinement. A safety refinement can be valid even when the implementation lacks a liveness guarantee.
2. A liveness refinement must map the concrete fairness assumptions to legitimate assumptions of the abstract specification; stronger concrete fairness cannot silently create an abstract guarantee that the architecture never promised.
3. For Nexo, takeover/reconciliation progress may require environmental fairness, but STOP dominance, stale-owner fencing, authority revocation and exact-effect binding remain safety obligations.
4. If a concrete protocol needs stronger fairness than the abstract contract, that difference must be recorded as an environmental dependency rather than hidden inside the refinement proof.
5. Future refinement artifacts should therefore contain: safety mapping, safety step simulation, liveness mapping, fairness assumptions, and an explicit list of environmental guarantees.
6. This research reinforces the existing direction toward a layered proof chain instead of a single monolithic model.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

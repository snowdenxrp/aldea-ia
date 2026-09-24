# NEXO G-A14-01 — Finite Minimum-Domain Adversarial Model V1 — 2026-09-24

Status: FORMAL MODEL DRAFT / NOT EXECUTED

## Purpose

This is the first bounded executable-shaped reduction of the compressed protected kernel. It is deliberately small and adversarial. It is not the Nexo implementation and does not prove the architecture.

TLA+ explicit-state model checking explores reachable finite states and checks invariants. Lamport's material describes invariance checking over reachable states of a finite model and recommends small mechanical checks to find specification errors before proof. citeturn0search1turn0search29turn0search3

## Research cross-check

Raft's treatment of a crash after commit but before the client response is directly relevant to UNKNOWN/retry identity: stable command serials are retained by the state machine so a retry does not execute the same command twice. citeturn0search27

etcd's recovery documentation shows that a valid snapshot can represent an older revision lineage; restoration therefore changes cluster identity and can use revision bumping to avoid apparent revision rollback. This supports modeling currentness as a distinct protected relation rather than equating local state integrity with currentness. citeturn0search0

## Model boundary

The finite model contains only identity/lifecycle, authority, coordination/fence, STOP, safety context, currentness, effect identity/binding, recovery ownership and admission.

It intentionally excludes provider-world truth, hardware implementation, cryptographic details, full evidence graph, deployment closure, and planner/model state.

## Adversarial transitions

The model includes fence acquisition by A/B, STOP assertion, authority revocation, context activation, currentness loss, rollback, decommission, recovery ownership, recovery release, protected admission and external UNKNOWN.

The interleaving model is asynchronous: each action is atomic at the abstract level, while races are represented by alternative orderings of actions.

## Intended falsification targets

1. STOP/admission ordering.
2. revoke/admission ordering.
3. fence takeover/stale actor.
4. currentness loss/admission.
5. rollback/admission.
6. recovery ownership races.
7. context activation/admission.
8. decommission/resurrection.
9. UNKNOWN retry identity.
10. target/context binding.

## Modeling limitation discovered during construction

The first draft exposes a key requirement: a model that merely stores one Boolean admitted state is insufficient for the lifecycle of multiple operations. For serious checking, admission must be represented per effect/operation, or the model must explicitly constrain itself to one active protected effect.

This V1 intentionally uses a single-effect abstraction to reduce state explosion. Before claiming any result, V2 should introduce a bounded set of effects and at least two actors with stale local views.

## Expected next formal work

A proper V2 should separate protected state from actor-local stale observations; model stale actor A after B advances the fence; retain UNKNOWN operation/effect identity through retry; represent admission per operation; model compaction with a protected UNKNOWN floor; represent VersionSet activation as a context transition; add Capability as a derived artifact with effect-boundary revalidation; and add a rollback snapshot relation instead of directly mutating current state.

## Current status

Finite abstract kernel: DRAFTED.
Adversarial transition set: DRAFTED.
Invariant set: DRAFTED.
SANY/TLC: NOT RUN.
Counterexample evidence: NONE YET.
Minimality: NOT PROVEN.
Architecture-build gate: CLOSED.

# Nexo Research Delta — inductive proof lineage and checker boundaries

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
Apalache documents inductive checking as three separate obligations: initial states satisfy the candidate invariant, the invariant is preserved by Next, and the invariant implies the desired safety property. citeturn0search10 The TLA+ Proof System similarly presents the initial-state and next-state preservation obligations as separate proof steps. citeturn0search1turn0search5 Apalache also distinguishes bounded safety checking from inductive-invariant checking for arbitrary execution lengths, under its documented finiteness assumptions. citeturn0search6

## New conclusions
1. An inductive proof artifact must preserve the three obligations separately; a single PASS label is insufficient.
2. The proof lineage should be:
   `CandidateInvariant → InitCheck → StepCheck → SafetyImplication → Result`.
3. If a candidate fails StepCheck, the counterexample should remain attached to that candidate rather than being overwritten by a later strengthened invariant.
4. If the invariant is strengthened, it creates a new proof attempt with a new content hash and new obligations.
5. `Inductive invariant found` and `Safety property proved from invariant` are separate claims; the latter still requires the implication check.
6. This matters directly to Nexo's critical properties: stale-owner rejection, STOP dominance, exact effect binding, authority fencing, and recovery/reconciliation separation should eventually have individually named inductive invariants and explicit implication checks.
7. A second checker can corroborate an invariant result, but only if it checks the same stated invariant and scope; simply running two tools on the same safety predicate is not equivalent to independently proving the same inductive argument.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

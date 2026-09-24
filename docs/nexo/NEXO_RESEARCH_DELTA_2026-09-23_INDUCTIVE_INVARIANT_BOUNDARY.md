# Nexo Research Delta — inductive invariant boundary

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
Apalache documents bounded model checking as incomplete: absence of a counterexample up to length k does not establish absence beyond k unless additional assumptions such as a sufficient finite diameter apply. It separately documents inductive-invariant checking through Init=>IndInv and IndInv/Next=>IndInv' obligations. citeturn0search1turn0search2 Apalache's current documentation also distinguishes randomized symbolic execution, bounded model checking, and inductiveness checking as separate approaches. citeturn0search14

## New conclusions
1. Nexo must distinguish `BOUNDED_NO_COUNTEREXAMPLE` from `INDUCTIVE_SAFETY_ARGUMENT`.
2. Increasing a bound k is useful evidence but does not silently transform bounded evidence into an unbounded proof.
3. An inductive result must record the actual inductive invariant used and the obligations checked; it cannot be inferred merely because several bounded runs passed.
4. If a candidate inductive invariant is strengthened after a counterexample, the prior result remains historical evidence and the new result must be recorded as a new proof attempt, with its own artifact hashes.
5. The canonical evidence chain should therefore preserve proof lineage: `candidate property → counterexample (if any) → strengthened invariant → Init obligation → Next preservation obligation → safety implication`.
6. This is especially relevant to Nexo's lease/authority/STOP properties, where a bounded race test can expose a bug but passing a finite set of race lengths does not establish all-length safety.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

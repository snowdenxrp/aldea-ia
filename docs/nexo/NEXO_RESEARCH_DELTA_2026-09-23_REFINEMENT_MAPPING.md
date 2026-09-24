# Nexo Research Delta — refinement mapping as the next verification boundary

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## External cross-check
TLA+ documentation describes implementation/refinement as an implication from a lower-level specification to a higher-level specification under a refinement mapping. Lamport's material gives the form `Spec => HL!Spec` and emphasizes that the refinement mapping itself is part of the correctness claim. citeturn0search24turn0search27

## Findings
1. A future Nexo implementation model should not merely share variable names with the canonical safety model; it needs an explicit mapping from concrete state to abstract state.
2. The mapping must preserve the semantics that matter: operation/effect identity, authority epoch, lease owner+generation, evidence validity, stop fencing, and commit/revocation ordering.
3. A weak or degenerate mapping can make a refinement claim meaningless. Lamport explicitly warns that the mapping is part of the property and must be examined carefully. citeturn0search28
4. Refinement can be hierarchical: a concrete implementation can refine an intermediate protocol/state-machine model, which in turn refines the high-level safety contract. This fits the existing Nexo separation between semantic contract, canonical formal model, and eventual implementation correspondence. citeturn0search3
5. Auxiliary/history variables may be legitimately needed to express a useful mapping without changing the externally observed semantics. citeturn0search27

## Nexo consequence
The eventual formal path should be:
`SEMANTIC CONTRACT → CANONICAL ABSTRACT MODEL → CONCRETE COORDINATION/EXECUTION MODEL → REFINEMENT MAPPING → IMPLEMENTATION EVIDENCE`.

This does not mean the current work should jump to implementation. It identifies the correct verification boundary for later stages and prevents the mistake of treating two independently written TLA+ sketches as equivalent merely because their state names look similar.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

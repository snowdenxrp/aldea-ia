# Nexo Research Delta — temporal tool diversity boundary

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Findings
TLC checks temporal properties over a configured behavior specification and can incorporate fairness in that specification. citeturn0search12turn0search20 Apalache currently documents support for temporal properties using a liveness-to-safety transformation, while also documenting finite-state/bounded execution assumptions. citeturn0search1turn0search15 Apalache explicitly differs from TLC in method: TLC enumerates reachable states, while Apalache translates verification problems into logical constraints solved by SMT technology. citeturn0search15

## New conclusions
1. Nexo can use TLC and Apalache as complementary evidence methods, but their results must never be merged into a single undifferentiated `FORMALLY_VERIFIED` flag.
2. `TLC_TEMPORAL_EVIDENCE` and `APALACHE_TEMPORAL_EVIDENCE` require separate method metadata, model/configuration fingerprints, scope, assumptions, and tool versions.
3. Agreement between two tools is corroboration, not automatic proof of implementation correctness; disagreement is a high-priority formalization/model/tool boundary requiring diagnosis.
4. A transformation-based result must preserve the mapping between the original temporal property and the transformed safety obligation; the transformation is part of the evidence provenance.
5. Because Apalache documents bounded finite execution assumptions, a temporal result remains scoped to those assumptions unless a separate argument establishes the intended unbounded interpretation.
6. Tool diversity is useful only when failure modes are sufficiently distinct; two tools consuming the same flawed model can share the same semantic error. Therefore tool diversity does not replace independent specification/formalization review.
7. The evidence graph should distinguish `INDEPENDENT_TOOL_CORROBORATION` from `FORMAL_PROOF` and from `IMPLEMENTATION_REFINEMENT`.

## Proposed result relation
`CANONICAL TEMPORAL CLAIM`
→ `TLA+ FORMALIZATION`
→ `{TLC METHOD, APALACHE METHOD}`
→ `METHOD-SPECIFIC RESULTS`
→ `CROSS-TOOL COMPARISON`
→ `REFINEMENT / RUNTIME EVIDENCE`

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`

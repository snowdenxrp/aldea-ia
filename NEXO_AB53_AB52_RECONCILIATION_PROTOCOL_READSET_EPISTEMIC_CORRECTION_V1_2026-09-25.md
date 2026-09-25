# NEXO AB53 — AB52 RECONCILIATION / PROTOCOL READ-SET EPISTEMIC CORRECTION — 2026-09-25

Status: RESEARCH ONLY. No proof, no semantic freeze, no TLC/TLAPS, no production implementation.

## 1. Why this artifact exists

During the AB52 continuation, two AB52 research artifacts are present on main:

1. NEXO_AB52_BOUNDED_TERNARY_PROJECTION_ENUMERATION_READ_SET_GATE_RESEARCH_V1_2026-09-25.md
2. NEXO_AB52_PAA_BOUNDED_TERNARY_READSET_CLOSURE_SEARCH_RESEARCH_V1_2026-09-25.md

The first artifact correctly states that the protocol read-set semantics are not yet executable enough to justify:
TERNARY_PROTOCOL_RESIDUAL = NOT_FOUND.

The second artifact attempted a structural closure using assumed ATOMIC/LEASE/RECHECK read closures and labeled the ternary protocol residual NOT_FOUND_BOUNDED.

This reconciliation preserves both artifacts and resolves their epistemic relationship without deleting or rewriting either.

## 2. Reconciliation rule

The second AB52 result is valid only conditionally:

IF the listed ATOMIC/LEASE/RECHECK read closures are the complete legal semantic read-sets of the intended transition system,
THEN no irreducible ternary residual is exposed by those closures.

However, AB52's first artifact correctly identified that the complete executable transition semantics have not yet been extracted and normalized from the accumulated research.

Therefore the conditional result cannot replace the conservative protocol status.

The canonical status after reconciliation is:

TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
HYPEREDGE_SEMANTIC_NECESSITY = UNKNOWN
HS_ELIMINATION = UNKNOWN
BRIDGE_MERGE = UNKNOWN

## 3. What remains established

The exhaustive mathematical enumeration is strong within its finite universe:

- 256 ternary relations over three binary attributes;
- 166 unary/binary projection classes;
- 45 nontrivial projection-equivalence classes;
- smallest ambiguities already occur between distinct relations.

This establishes the lower-arity reconstruction gap for arbitrary ternary relations.

It does not establish a protocol residual.

The conditional AB52 read-closure result establishes a useful design lemma:

If every legal protocol transition reads only retained facts and Boolean combinations/reconstructions of those facts, then an irreducible ternary relation that is not itself a retained semantic primitive cannot become P_AA-observable merely because the transition combines several inputs.

That lemma is conditional on complete transition semantics.

## 4. Correction to the bounded-search claim

The phrase "16,302 role/order/protocol skeletons were structurally covered" remains useful as a structural coverage count:

286 event-role triples × 19 strict partial orders × 3 named protocols = 16,302.

But this count must NOT be described as exhaustive concrete protocol-state enumeration.

The following remain unenumerated until the transition semantics are formalized:

- concrete binding assignments;
- protocol state-machine transitions;
- all legal invalidation consequences;
- exact admission linkage rules;
- exact UNKNOWN/PENDING conditions;
- all semantic read-sets.

Therefore no P_AA collision conclusion can be drawn from the skeleton count alone.

## 5. Required next gate

The next pass must close the semantic gap before any four-event escalation is treated as justified.

For each ATOMIC, LEASE and RECHECK transition, define:

1. precondition;
2. semantic read-set;
3. state mutation;
4. admission-link effect;
5. invalidation effect;
6. observation emitted;
7. UNKNOWN/PENDING condition;
8. boundary/threat-model applicability.

Then instantiate the 286 ternary role triples against those executable rules.

Only after that can TERNARY_PROTOCOL_RESIDUAL move from UNKNOWN.

## 6. Four-event status

No ternary residual has been established.

Therefore ternary-triggered four-event escalation is NOT TRIGGERED.

Independent four-event hypotheses H6/H7 remain open research questions, but they should not be presented as required escalations until their ternary projections survive the fully specified read-set gate.

## 7. HistorySupport status

The conditional read-closure result is informative but insufficient for global elimination.

Therefore:

HS_ELIMINATION = UNKNOWN.

The architecture must preserve HistorySupport until exact read-sites are formalized and reconstruction/future-observation preservation is demonstrated.

## 8. LeaseBridge / AdmissionBindingClass

No change:

BRIDGE_MERGE = UNKNOWN.

A bridge merge requires its own future-observation collision search after transition semantics are explicit.

## 9. Semantic freeze

Still prohibited.

TLA+, TLC, TLAPS and production implementation remain downstream of:
- transition semantic normalization;
- ternary protocol search;
- justified higher-order escalation;
- HistorySupport/bridge resolution;
- quotient congruence.

## 10. Exact next action

Build the protocol transition-semantics matrix first.

This is now the highest-value next artifact because it converts the current specification-level read-set discussion into explicit machine-testable rules without inventing missing semantics.

No missing rule may be silently filled by assumption. Any unresolved rule must be marked UNKNOWN_DUE_TO_MISSING_SEMANTICS.

The next artifact should then instantiate the ternary search against that matrix.

## 11. Epistemic conclusion

AB53 does not erase either AB52 artifact.

It preserves the stronger mathematical result and downgrades the conditional protocol result to its proper status.

This is the safe canonical interpretation:

"Pairwise projections are demonstrably insufficient in general; no P_AA ternary residual has yet been demonstrated because the exact legal protocol read semantics are not fully formalized."

That is the state that future CONTINUITY recovery must use.
